// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./TicTacToeEngine.sol";
import "./TicTacToeTypes.sol";

/// @title Tha main contract for playing the TicTacToe
contract TicTacToe {
    using TicTacToeEngine for GameState;

    /// @notice Thrown when somebody other than `Lobby` is trying to start the
    /// game
    error ErrorNotLobby();

    /// @notice Thrown when not current player tries to make a move
    error ErrorNotCurrentPlayer();

    /// @notice The address of a Lobby contract
    address public immutable lobby;

    /// @notice The list of all game ids
    uint[] private gameId;

    /// @notice The collection of games, accesible with gameId
    mapping(uint => GameState) private games;

    /// @notice The collection of games, accessible by player address
    mapping(address => uint[]) private playerGames;

    constructor(address lobby_) {
        lobby = lobby_;
    }

    /// @notice Starts the game
    /// @dev Only `Lobby` should make a call to this, in order to ensure that
    /// both players agreed on a game.
    /// @param id The game id
    /// @param playerX The address of a player X
    /// @param playerO The address of a player O
    function startGame(uint id, address playerX, address playerO) public {
        if (lobby != msg.sender) {
            revert ErrorNotLobby();
        }
        assert(games[id].phase == GamePhase.NotCreated);

        gameId.push(id);
        playerGames[playerX].push(id);
        playerGames[playerO].push(id);

        games[id].startGame(id, playerX, playerO);
    }

    /// @notice Play the move at the given coordinates
    /// @dev Checks that `msg.sender` is current player
    /// @param id The game id
    /// @param x The x coordinate of the move
    /// @param y The y coordinate of the move
    function playMove(uint id, uint8 x, uint8 y) public {
        GameState storage state = games[id];
        if (state.currentPlayerIsX()) {
            if (state.playerX != msg.sender) {
                revert ErrorNotCurrentPlayer();
            }
        } else if (state.playerO != msg.sender) {
            revert ErrorNotCurrentPlayer();
        }

        state.playMove(x, y);
    }

    // VIEWS

    function numberOfGames() public view returns (uint) {
        return gameId.length;
    }

    function gameIdByIndex(uint index) public view returns (uint) {
        return gameId[index];
    }

    function gameByIndex(uint index) public view returns (GameState memory) {
        return games[gameId[index]];
    }

    function game(uint id) public view returns (GameState memory) {
        return games[id];
    }

    function allPlayerGames(
        address player
    ) public view returns (GameState[] memory) {
        GameState[] memory result = new GameState[](playerGames[player].length);

        for (uint i = 0; i < result.length; i++) {
            result[i] = games[playerGames[player][i]];
        }
        return result;
    }
}
