// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @dev The size of the board
uint8 constant BOARD_SIZE = 3;

/// @notice Represents the state of the board
enum BoardState {
    Empty,
    X,
    O
}

/// @notice Represents the current phase of the game
enum GamePhase {
    NotCreated,
    InProgress,
    Finished
}

/// @notice Represents the result of the game
/// @dev If game is not finished, the result will be Unknown
enum GameResult {
    Unknown,
    Xwin,
    Owin,
    Draw
}

/// @notice Represents the State of a game
struct GameState {
    /// @notice The unique game id
    uint gameId;
    /// @notice The addresses of player X
    address playerX;
    /// @notice The addresses of player O
    address playerO;
    /// @notice The current phase of the game
    GamePhase phase;
    /// @notice The result of the game, if finished
    GameResult result;
    /// @notice The number of moves played
    uint8 numberOfMoves;
    /// @notice The state of the board
    BoardState[BOARD_SIZE][BOARD_SIZE] board;
}
