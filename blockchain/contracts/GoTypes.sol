// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

struct Coordinates {
    uint8 x;
    uint8 y;
}

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

enum MoveType {
    PlayStone,
    Pass,
    Resign
}

struct Move {
    MoveType moveType;
    uint8 x;
    uint8 y;
}

struct GameInfo {
    uint gameId;
    uint8 boardSize;
    uint8 komi; // +0.5 implied
    uint8 handicap;
}

struct KoInfo {
    bool isKoPossible;
    Coordinates lastMove;
    Coordinates lastCapture;
}

struct PlayingState {
    uint numberOfMoves;
    Player currentPlayer;
    KoInfo koInfo;
    bool isLastMovePass;
    uint[2] captures;
}

struct GameFullState {
    GameInfo info;
    address[2] players;
    GamePhase phase;
    GameResult result;
    PlayingState playingState;
    BoardState[][] board;
}
