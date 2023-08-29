// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./GoGame.sol";

/// @notice The structure describing the details of the challenge
struct ChallengeGame {
    /// @notice The game id
    uint gameId;
    /// @notice The address of the maker of the challenge
    address maker;
    /// @notice The address of the taker. Could be zero-address, implying open challenge.
    address taker;
    /// @notice Whether maker is playing as black
    bool makerIsBlack;
    /// @notice The board size
    uint8 boardSize;
}

/// @title The lobby for arrange the games
/// @notice There are two types of challenges. The "open challenge", where
/// anyone can accept the challenge and the "direct challenge", that only
/// selected address can accept
contract GoLobby {
    /// @notice Thrown when game is not found
    error ErrorGameNotFound();
    /// @notice Thrown when non-maker/taker tries to cancel the challenge
    error ErrorNotAllowed();
    /// @notice Thrown when players challenges himself
    error ErrorSelfChallenge();

    /// @notice Emitted when challenge is created
    event ChallengeCreated(uint gameId, address maker, address taker);
    /// @notice Emitted when challenge is canceled
    event ChallengeCanceled(uint gameId);
    /// @notice Emitted when challenge is accepted
    event ChallengeAccepted(uint gameId);

    /// @notice The Contract for managing the actual games
    GoGame public immutable goGame;

    /// @notice Id used for creating unique gameIds
    uint private _id;

    /// @notice All currently open challenges
    ChallengeGame[] public openChallenges;
    /// @notice The challenges that player created or was challenged
    mapping(address => ChallengeGame[]) public directChallenges;

    constructor() {
        goGame = new GoGame(address(this));
    }

    // VIEWS

    /// @notice Returns the number of open challenges
    /// @return The number of open challenges
    function numberOfOpenChallenges() public view returns (uint) {
        return openChallenges.length;
    }

    /// @notice Returns all open challenges
    /// @return All open challenges
    function allOpenChallenges() public view returns (ChallengeGame[] memory) {
        return openChallenges;
    }

    /// @notice Returns the number direct challenges for a given player
    /// @param player The player that is either a maker or a taker of a direct challenges
    /// @return The number of direct challenges
    function numberOfDirectChallenges(
        address player
    ) public view returns (uint) {
        return directChallenges[player].length;
    }

    /// @notice Returns all direct challenges for a given player
    /// @param player The player that is either a maker or a taker of a direct challenges
    /// @return All direct challenges
    function allDirectChallenges(
        address player
    ) public view returns (ChallengeGame[] memory) {
        return directChallenges[player];
    }

    // ACTIONS

    /// @notice Creates a challenge
    /// @param taker If non-zero then only taker can accept this challenge
    /// @param boardSize The board size
    /// @param playAsBlack Whether the maker is playing as Black
    /// @return The gameId of the created game
    function createChallenge(
        address taker,
        uint8 boardSize,
        bool playAsBlack
    ) external returns (uint) {
        uint gameId = nextGameId();
        if (msg.sender == taker) {
            revert ErrorSelfChallenge();
        }

        ChallengeGame memory game = ChallengeGame(
            gameId,
            msg.sender,
            taker,
            playAsBlack,
            boardSize
        );

        if (taker == address(0)) {
            openChallenges.push(game);
        } else {
            directChallenges[msg.sender].push(game);
            directChallenges[taker].push(game);
        }

        emit ChallengeCreated(gameId, msg.sender, taker);
        return gameId;
    }

    /// @notice Accept the open challenge
    /// @param gameId The id of the game
    function acceptOpenChallenge(uint gameId) external {
        for (uint i = 0; i < openChallenges.length; i++) {
            if (gameId == openChallenges[i].gameId) {
                acceptChallenge(openChallenges[i]);
                removeFromList(openChallenges, i);
                return;
            }
        }
        revert ErrorGameNotFound();
    }

    /// @notice Cancel the open challenge
    /// @param gameId The id of the game
    function cancelOpenChallenge(uint gameId) external {
        for (uint i = 0; i < openChallenges.length; i++) {
            if (gameId == openChallenges[i].gameId) {
                if (openChallenges[i].maker != msg.sender) {
                    revert ErrorNotAllowed();
                }
                removeFromList(openChallenges, i);
                emit ChallengeCanceled(gameId);
                return;
            }
        }
        revert ErrorGameNotFound();
    }

    /// @notice Accept the direct challenge
    /// @param gameId The id of the game
    function acceptDirectChallenge(uint gameId) external {
        ChallengeGame[] storage challenges = directChallenges[msg.sender];
        for (uint i = 0; i < challenges.length; i++) {
            if (gameId == challenges[i].gameId) {
                ChallengeGame memory game = challenges[i];

                // This will also check that msg.sender is the taker
                acceptChallenge(game);

                removeFromList(challenges, i);
                (bool found, ) = removeDirectChallenge(game.maker, gameId);
                assert(found);

                return;
            }
        }
        revert ErrorGameNotFound();
    }

    /// @notice Cancel the direct challenge
    /// @param gameId The id of the game
    function cancelDirectChallenge(uint gameId) external {
        (bool found, address opponent) = removeDirectChallenge(
            msg.sender,
            gameId
        );
        if (!found) {
            revert ErrorGameNotFound();
        }
        (found, opponent) = removeDirectChallenge(opponent, gameId);
        assert(found);

        emit ChallengeCanceled(gameId);
    }

    // UTILITY

    /// @notice Returns the next unique game id
    /// @return The unique game id
    function nextGameId() private returns (uint) {
        return _id++;
    }

    /// @notice Accept the challenge and start the game
    /// @dev It ensures that `msg.sender` is the taker, or taker is not set
    /// @param game The challenge game
    function acceptChallenge(ChallengeGame memory game) private {
        if (game.taker != address(0) && game.taker != msg.sender) {
            revert ErrorNotAllowed();
        }
        if (game.makerIsBlack) {
            goGame.startGame(
                game.gameId,
                game.maker,
                msg.sender,
                game.boardSize,
                6 /* =komi */,
                0 /* =handicap */
            );
        } else {
            goGame.startGame(
                game.gameId,
                msg.sender,
                game.maker,
                game.boardSize,
                6 /* =komi */,
                0 /* =handicap */
            );
        }
        emit ChallengeAccepted(game.gameId);
    }

    /// @notice Removes challenge at the given index from a list
    /// @dev It removes it by replacing it with the last element
    /// @param challenges The list of challenges
    /// @param index The index to remove from
    function removeFromList(
        ChallengeGame[] storage challenges,
        uint index
    ) private {
        assert(index < challenges.length);
        challenges[index] = challenges[challenges.length - 1];
        challenges.pop();
    }

    /// @notice Removes the direct challenge
    /// @param player One of the players in the direct challenge
    /// @param gameId The id of the game
    /// @return found Whether the game was found
    /// @return opponent The opponent of the game
    function removeDirectChallenge(
        address player,
        uint gameId
    ) private returns (bool found, address opponent) {
        ChallengeGame[] storage challenges = directChallenges[player];
        for (uint i = 0; i < challenges.length; i++) {
            if (challenges[i].gameId == gameId) {
                found = true;
                opponent = challenges[i].maker == player
                    ? challenges[i].taker
                    : challenges[i].maker;
                removeFromList(challenges, i);
                return (found, opponent);
            }
        }
    }
}
