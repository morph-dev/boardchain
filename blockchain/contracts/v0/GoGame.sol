// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./GoEngine.sol";
import "./GoTypes.sol";

/// Action is allowed only by player.
error ErrorNotPlayer();

/// Action is allowed only by current player.
error ErrorNotCurrentPlayer();

/// The game didn't start or is finished.
error ErrorNotActive();

/// The game is in the wrong phase for this action.
error ErrorWrongPhase(GamePhase gamePhase, GamePhase expectedPhase);

contract GoGame {
    event GameStarted(uint gameId, address black, address white);
    event GameFinished(uint gameId, GameResult result);
    event GamePhaseChanged(uint gameId, GamePhase previous, GamePhase current);

    event Pass(uint gameId, address player);
    event StonePlayed(uint gameId, address player, uint8 x, uint8 y);
    event MarkedDeadGroup(uint gameId, address player, uint8 x, uint8 y);
    event MarkedAliveGroup(uint gameId, address player, uint8 x, uint8 y);
    event ScoringAccepted(uint gameId, address player);

    mapping(uint => GameFullState) games;

    mapping(address => uint[]) public playerGames;

    // VIEWS

    function getGameState(
        uint gameId
    ) public view returns (GameFullState memory) {
        return games[gameId];
    }

    function allPlayerGames(
        address player
    ) public view returns (uint[] memory) {
        return playerGames[player];
    }

    // EXTERNAL FUNCTIONS

    function startGame(
        address black,
        address white,
        uint8 boardSize,
        int16 komi,
        uint8 handicap
    ) external returns (uint gameId) {
        require(black != white, "Players can't be the same.");
        if (black != msg.sender && white != msg.sender) {
            revert ErrorNotPlayer();
        }

        gameId = (uint)(
            keccak256(
                abi.encode(
                    black,
                    playerGames[black].length,
                    white,
                    playerGames[white].length
                )
            )
        );
        assert(games[gameId].phase == GamePhase.NotCreated);

        playerGames[black].push(gameId);
        playerGames[white].push(gameId);

        GoEngine.initializeGameState(
            games[gameId],
            gameId,
            black,
            white,
            boardSize,
            komi,
            handicap
        );

        emit GamePhaseChanged(gameId, GamePhase.NotCreated, GamePhase.Playing);
        emit GameStarted(gameId, black, white);
    }

    function playStone(
        uint gameId,
        uint8 x,
        uint8 y
    ) external inPhase(gameId, GamePhase.Playing) onlyCurrentPlayer(gameId) {
        GameFullState storage fullState = games[gameId];
        GoEngine.playStone(fullState, x, y);
        emit StonePlayed(gameId, msg.sender, x, y);
    }

    function pass(
        uint gameId
    ) external inPhase(gameId, GamePhase.Playing) onlyCurrentPlayer(gameId) {
        GameFullState storage fullState = games[gameId];
        GoEngine.pass(fullState);
        emit Pass(gameId, msg.sender);
        if (fullState.phase == GamePhase.Scoring) {
            emit GamePhaseChanged(gameId, GamePhase.Playing, GamePhase.Scoring);
        }
    }

    function markGroup(
        uint gameId,
        uint8 x,
        uint8 y,
        bool dead
    ) external inPhase(gameId, GamePhase.Scoring) onlyPlayers(gameId) {
        GoEngine.markGroup(games[gameId], x, y, dead);
        if (dead) {
            emit MarkedDeadGroup(gameId, msg.sender, x, y);
        } else {
            emit MarkedAliveGroup(gameId, msg.sender, x, y);
        }
    }

    function acceptScoring(
        uint gameId
    ) external inPhase(gameId, GamePhase.Scoring) {
        GameFullState storage fullState = games[gameId];
        Player player = getPlayer(fullState, msg.sender);

        GoEngine.acceptScoring(fullState, player);
        emit ScoringAccepted(gameId, msg.sender);

        if (fullState.phase == GamePhase.Finished) {
            emit GamePhaseChanged(
                gameId,
                GamePhase.Scoring,
                GamePhase.Finished
            );
            emit GameFinished(gameId, fullState.result);
        }
    }

    function resign(uint gameId) external inProgress(gameId) {
        GameFullState storage fullState = games[gameId];

        Player player = getPlayer(fullState, msg.sender);

        GamePhase currentPhase = fullState.phase;
        fullState.phase = GamePhase.Finished;
        emit GamePhaseChanged(gameId, currentPhase, GamePhase.Finished);

        fullState.result = player == Player.Black
            ? GameResult(Result.WhiteWin, "W+R")
            : GameResult(Result.BlackWin, "B+R");
        emit GameFinished(gameId, fullState.result);
    }

    // PRIVATE FUNCTIONS - UTILITY

    function getPlayer(
        GameFullState storage fullState,
        address player
    ) private view returns (Player) {
        address[2] storage players = fullState.players;
        if (players[uint8(Player.Black)] == player) {
            return Player.Black;
        }
        if (players[uint8(Player.White)] == player) {
            return Player.White;
        }
        revert ErrorNotPlayer();
    }

    // MODIFIERS

    modifier onlyCurrentPlayer(uint gameId) {
        GameFullState storage state = games[gameId];
        if (
            state.players[uint(state.playingState.currentPlayer)] != msg.sender
        ) {
            revert ErrorNotCurrentPlayer();
        }
        _;
    }

    modifier onlyPlayers(uint gameId) {
        GameFullState storage state = games[gameId];
        if (state.players[0] != msg.sender && state.players[1] != msg.sender) {
            revert ErrorNotPlayer();
        }
        _;
    }

    modifier inPhase(uint gameId, GamePhase phase) {
        if (games[gameId].phase != phase) {
            revert ErrorWrongPhase(games[gameId].phase, phase);
        }
        _;
    }

    modifier inProgress(uint gameId) {
        GamePhase phase = games[gameId].phase;
        if (phase == GamePhase.NotCreated || phase == GamePhase.Finished) {
            revert ErrorNotActive();
        }
        _;
    }
}
