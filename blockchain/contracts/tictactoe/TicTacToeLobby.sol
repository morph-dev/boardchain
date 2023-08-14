// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./TicTacToe.sol";

struct OpenGame {
    uint gameId;
    address maker;
    bool makerIsX;
}

struct ChallengeGame {
    uint gameId;
    address maker;
    address taker;
    bool makerIsX;
}

struct PlayersGame {
    uint gameId;
    bool canceled;
}

/// @title The lobby for arrange the games
contract TicTacToeLobby {
    /// @notice Thrown when game is not found
    error ErrorGameNotFound();
    /// @notice Thrown when non-maker tries to revoke the game
    error ErrorNotMaker();
    /// @notice Thrown when non-taker tries to accept the game
    error ErrorNotTaker();

    /// @notice Emitted when open game is created
    event OpenGameCreated(uint gameId, address maker);
    /// @notice Emitted when open game is revoked
    event OpenGameRevoked(uint gameId);
    /// @notice Emitted when challenge is created
    event ChallengeCreated(uint gameId, address maker, address taker);
    /// @notice Emitted when challenge is rejected
    event ChallengeRejected(uint gameId);
    /// @notice Emitted when challenge is revoked
    event ChallengeRevoked(uint gameId);

    /// @notice The Contract for managing the actual games
    TicTacToe public immutable ticTacToe;

    /// @notice Id used for creating unique gameIds
    uint private _id;

    /// @notice All currently open games
    OpenGame[] public openGames;

    /// @notice The gameIds of challenges that player is pending to approve or
    /// reject
    mapping(address => uint[]) public pendingChallenges;
    /// @notice The challenges that are pending
    mapping(uint => ChallengeGame) public challengeGames;

    constructor() {
        ticTacToe = new TicTacToe(address(this));
    }

    // VIEWS

    /// @notice Returns the number of open games
    /// @return The number of open games
    function numberOfOpenGames() public view returns (uint) {
        return openGames.length;
    }

    /// @notice Returns all open games
    /// @return All open games
    function allOpenGames() public view returns (OpenGame[] memory) {
        return openGames;
    }

    /// @notice Returns the number of challenges that are pending for a given
    /// address
    /// @param taker The taker of the challenges
    /// @return The number of chellenges
    function numberOfPendingChallenges(
        address taker
    ) public view returns (uint) {
        return pendingChallenges[taker].length;
    }

    /// @notice Returns challenges that are pending for a given address
    /// @param taker The taker of the challenges
    /// @return Pending challenges
    function allPendingChallenges(
        address taker
    ) public view returns (ChallengeGame[] memory) {
        uint[] storage gameIds = pendingChallenges[taker];
        ChallengeGame[] memory games = new ChallengeGame[](gameIds.length);
        for (uint i = 0; i < gameIds.length; i++) {
            games[i] = challengeGames[gameIds[i]];
        }
        return games;
    }

    // ACTIONS

    /// @notice Creates an open game that anybody can accept
    /// @param playAsX Whether the maker is playing as X
    /// @return The gameId of the created game
    function proposeGame(bool playAsX) external returns (uint) {
        uint gameId = nextGameId();

        OpenGame storage game = openGames.push();
        game.gameId = gameId;
        game.maker = msg.sender;
        game.makerIsX = playAsX;

        emit OpenGameCreated(gameId, msg.sender);
        return gameId;
    }

    /// @notice Accepts the open game with a given id
    /// @param gameId The game id
    function acceptGame(uint gameId) external {
        for (uint256 i = 0; i < openGames.length; i++) {
            if (openGames[i].gameId == gameId) {
                if (openGames[i].makerIsX) {
                    ticTacToe.startGame(gameId, openGames[i].maker, msg.sender);
                } else {
                    ticTacToe.startGame(gameId, msg.sender, openGames[i].maker);
                }
                openGames[i] = openGames[openGames.length - 1];
                openGames.pop();
                return;
            }
        }
        revert ErrorGameNotFound();
    }

    /// @notice Revokes the open game with a given id
    /// @param gameId The game id
    function revokeGame(uint gameId) external {
        for (uint256 i = 0; i < openGames.length; i++) {
            if (openGames[i].gameId == gameId) {
                if (openGames[i].maker != msg.sender) {
                    revert ErrorNotMaker();
                }
                openGames[i] = openGames[openGames.length - 1];
                openGames.pop();
                emit OpenGameRevoked(gameId);
                return;
            }
        }
        revert ErrorGameNotFound();
    }

    /// @notice Creates a challenge for a game
    /// @param playAsX Whether the maker is playing as X
    /// @param taker The address of the challenged player
    /// @return The gameId of the created game
    function proposeChallenge(
        bool playAsX,
        address taker
    ) external returns (uint) {
        uint gameId = nextGameId();

        pendingChallenges[taker].push(gameId);
        challengeGames[gameId] = ChallengeGame(
            gameId,
            msg.sender,
            taker,
            playAsX
        );

        emit ChallengeCreated(gameId, msg.sender, taker);
        return gameId;
    }

    /// @notice Accepts the challenge with a given id
    /// @param gameId The game id
    function acceptChallenge(uint gameId) external {
        ChallengeGame memory game = challengeGames[gameId];
        if (game.gameId != gameId) {
            revert ErrorGameNotFound();
        }
        if (game.taker != msg.sender) {
            revert ErrorNotTaker();
        }

        if (game.makerIsX) {
            ticTacToe.startGame(gameId, game.maker, game.taker);
        } else {
            ticTacToe.startGame(gameId, game.taker, game.maker);
        }

        uint[] storage allChallenges = pendingChallenges[msg.sender];
        for (uint256 i = 0; i < allChallenges.length; i++) {
            if (allChallenges[i] == gameId) {
                allChallenges[i] = allChallenges[allChallenges.length - 1];
                allChallenges.pop();
                break;
            }
        }
        delete challengeGames[gameId];
    }

    /// @notice Reject the challenge with a given id
    /// @param gameId The game id
    function rejectChallenge(uint gameId) external {
        ChallengeGame memory game = challengeGames[gameId];
        if (game.gameId != gameId) {
            revert ErrorGameNotFound();
        }
        if (game.taker != msg.sender) {
            revert ErrorNotTaker();
        }
        uint[] storage challenges = pendingChallenges[msg.sender];
        for (uint256 i = 0; i < challenges.length; i++) {
            if (challenges[i] == gameId) {
                challenges[i] = challenges[challenges.length - 1];
                challenges.pop();
                break;
            }
        }
        delete challengeGames[gameId];
        emit ChallengeRejected(gameId);
    }

    /// @notice Revokes the challenge with a given id
    /// @param gameId The game id
    function revokeChallenge(uint gameId) external {
        ChallengeGame memory game = challengeGames[gameId];
        if (game.gameId != gameId) {
            revert ErrorGameNotFound();
        }
        if (game.maker != msg.sender) {
            revert ErrorNotMaker();
        }
        uint[] storage takersChallenges = pendingChallenges[game.taker];
        for (uint256 i = 0; i < takersChallenges.length; i++) {
            if (takersChallenges[i] == gameId) {
                takersChallenges[i] = takersChallenges[
                    takersChallenges.length - 1
                ];
                takersChallenges.pop();
                break;
            }
        }
        delete challengeGames[gameId];
        emit ChallengeRevoked(gameId);
    }

    // UTILITY

    /// @notice Returns the next unique game id
    /// @return The unique game id
    function nextGameId() private returns (uint) {
        return _id++;
    }
}
