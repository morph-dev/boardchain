// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./TicTacToeTypes.sol";

/// @title The game engine for the Tic-Tac-Toe game
library TicTacToeEngine {
    /// @notice Invalid players
    error InvalidPlayers();
    /// @notice When invalid move is attempted
    error ErrorInvalidMove();

    /// @notice Emitted when game starts
    event GameStarted(uint gameId);
    /// @notice Emitted when game finishes
    event GameFinished(uint gameId, GameResult result);
    /// @notice Emitted when move is played
    event Move(uint gameId, bool playerIsX, uint8 x, uint8 y);

    /// @notice Initializes the game state
    function startGame(
        GameState storage gameState,
        uint gameId,
        address playerX,
        address playerO
    ) internal {
        gameState.gameId = gameId;
        gameState.playerX = playerX;
        gameState.playerO = playerO;
        gameState.phase = GamePhase.InProgress;
        emit GameStarted(gameId);
    }

    /// @notice Plays the next move at the given coordinates and updates the state
    function playMove(GameState storage gameState, uint8 x, uint8 y) internal {
        assert(gameState.phase == GamePhase.InProgress);

        BoardState[BOARD_SIZE][BOARD_SIZE] storage board = gameState.board;
        if (board[x][y] != BoardState.Empty) {
            revert ErrorInvalidMove();
        }

        bool playerIsX = currentPlayerIsX(gameState);

        board[x][y] = playerIsX ? BoardState.X : BoardState.O;
        gameState.numberOfMoves++;
        emit Move(gameState.gameId, playerIsX, x, y);

        if (isWinningMove(board, x, y)) {
            gameState.phase = GamePhase.Finished;
            gameState.result = playerIsX ? GameResult.Xwin : GameResult.Owin;
            emit GameFinished(gameState.gameId, gameState.result);
        } else if (gameState.numberOfMoves == BOARD_SIZE * BOARD_SIZE) {
            gameState.phase = GamePhase.Finished;
            gameState.result = GameResult.Draw;
            emit GameFinished(gameState.gameId, gameState.result);
        }
    }

    function currentPlayerIsX(
        GameState storage gameState
    ) internal view returns (bool) {
        return gameState.numberOfMoves % 2 == 0;
    }

    /// @notice Checks whether given move might have won the game
    function isWinningMove(
        BoardState[BOARD_SIZE][BOARD_SIZE] storage board,
        uint8 x,
        uint8 y
    ) private view returns (bool) {
        BoardState target = board[x][y];
        assert(target != BoardState.Empty);

        // check row
        if (
            board[x][0] == target &&
            board[x][1] == target &&
            board[x][2] == target
        ) {
            return true;
        }

        // check column
        if (
            board[0][y] == target &&
            board[1][y] == target &&
            board[2][y] == target
        ) {
            return true;
        }

        // check main diagonal
        if (
            x == y &&
            board[0][0] == target &&
            board[1][1] == target &&
            board[2][2] == target
        ) {
            return true;
        }

        // check anti diagonal
        if (
            x + y == 2 &&
            board[0][2] == target &&
            board[1][1] == target &&
            board[2][0] == target
        ) {
            return true;
        }

        return false;
    }
}
