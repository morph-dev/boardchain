// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./GoEngine.sol";
import "./GoTypes.sol";

/// @notice Thrown when somebody other than `Lobby` is trying to start the
/// game
error ErrorNotLobby();

/// Action is allowed only by player.
error ErrorNotPlayer();

/// Action is allowed only by current player.
error ErrorNotCurrentPlayer();

/// The game didn't start or is finished.
error ErrorNotActive();

/// The game is in the wrong phase for this action.
error ErrorWrongPhase(GamePhase gamePhase, GamePhase expectedPhase);

contract GoGame {
    /// @notice Emmited on every game update
    event GameUpdated(uint gameId);

    /// @notice Emitted when game starts
    event GameStarted(uint gameId, address black, address white);
    /// @notice Emitted when game finishes
    event GameFinished(uint gameId, GameResult result);
    /// @notice Emitted when game changes phase
    event GamePhaseChanged(uint gameId, GamePhase previous, GamePhase current);

    /// @notice Emitted when player passes
    event Pass(uint gameId, address player);
    /// @notice Emitted when player places a stone
    event StonePlayed(uint gameId, address player, uint8 x, uint8 y);
    /// @notice Emitted when player marks group as dead
    event MarkedDeadGroup(uint gameId, address player, uint8 x, uint8 y);
    /// @notice Emitted when player marks group as alive
    event MarkedAliveGroup(uint gameId, address player, uint8 x, uint8 y);
    /// @notice Emitted when player accepts current scoring
    event ScoringAccepted(uint gameId, address player);

    /// @notice The list of all game ids
    uint[] private allGameId;

    /// @notice The collection of games, accesible with gameId
    mapping(uint => GameFullState) games;

    /// @notice The collection of games, accessible by player address
    mapping(address => uint[]) public playerGames;

    /// @notice The address of a Lobby contract
    address public immutable lobby;

    constructor(address lobby_) {
        lobby = lobby_;
    }

    // VIEWS

    function getGameState(
        uint gameId
    ) public view returns (GameFullState memory) {
        return games[gameId];
    }

    function allGames() public view returns (GameSummary[] memory) {
        return createSummaries(allGameId);
    }

    function allPlayerGames(
        address player
    ) public view returns (GameSummary[] memory) {
        return createSummaries(playerGames[player]);
    }

    function previewScoringState(
        uint gameId
    )
        public
        view
        inPhase(gameId, GamePhase.Scoring)
        returns (ScoringState memory)
    {
        return GoEngine.scoreBoard(games[gameId]);
    }

    // EXTERNAL FUNCTIONS

    function startGame(
        uint gameId,
        address black,
        address white,
        uint8 boardSize,
        int16 komi,
        uint8 handicap
    ) external {
        if (lobby != msg.sender) {
            revert ErrorNotLobby();
        }
        assert(games[gameId].phase == GamePhase.NotCreated);

        allGameId.push(gameId);

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
        emit GameUpdated(gameId);
    }

    function playStone(
        uint gameId,
        uint8 x,
        uint8 y
    ) external inPhase(gameId, GamePhase.Playing) onlyCurrentPlayer(gameId) {
        GameFullState storage fullState = games[gameId];
        GoEngine.playStone(fullState, x, y);
        emit StonePlayed(gameId, msg.sender, x, y);
        emit GameUpdated(gameId);
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
        emit GameUpdated(gameId);
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
        emit GameUpdated(gameId);
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
        emit GameUpdated(gameId);
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
        emit GameUpdated(gameId);
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

    function createSummaries(
        uint[] storage gameIds
    ) private view returns (GameSummary[] memory) {
        uint count = gameIds.length;
        GameSummary[] memory summaries = new GameSummary[](count);
        for (uint i = 0; i < count; i++) {
            GameFullState storage state = games[gameIds[count - 1 - i]];
            summaries[i] = GameSummary(
                state.info,
                state.players,
                state.phase,
                state.result,
                state.playingState.numberOfMoves,
                state.playingState.currentPlayer,
                state.playingState.prisoners
            );
        }
        return summaries;
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
