// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

enum Player {
    Black,
    White
}

enum Result {
    Unknown,
    BlackWin,
    WhiteWin,
    NoResult,
    Jigo
}

struct GameResult {
    Result result;
    string reason;
}

enum BoardState {
    Empty,
    Black,
    White
}

enum GamePhase {
    NotCreated,
    Playing,
    Scoring,
    Finished
}

struct Move {
    uint8 x;
    uint8 y;
    bool isPass;
}

struct GameInfo {
    uint gameId;
    uint8 boardSize;
    /// @notice Komi if favor of white. The +0.5 is implied
    /// @dev The int16 is used to allow reverse komi
    int16 komi;
    uint8 handicap;
}

struct PlayingState {
    uint numberOfMoves;
    Move lastMove;
    Player currentPlayer;
    bool isKoPossible;
    uint16[2] prisoners;
}

enum ScoringBoardState {
    Unknown,
    Neutral,
    TerritoryBlack,
    TerritoryWhite,
    Dead,
    Alive
}

struct ScoringState {
    bool[2] accepted;
    uint16[2] boardPrisoners;
    uint16[2] territory;
    ScoringBoardState[][] board;
}

struct GameFullState {
    GameInfo info;
    address[2] players;
    GamePhase phase;
    GameResult result;
    PlayingState playingState;
    ScoringState scoringState;
    BoardState[][] board;
}

struct GameSummary {
    GameInfo info;
    address[2] players;
    GamePhase phase;
    GameResult result;
    // from PlayingState
    uint numberOfMoves;
    Player currentPlayer;
    uint16[2] prisoners;
}
