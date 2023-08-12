// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

uint8 constant BOARD_SIZE = 3;

enum Player {
    X,
    O
}
enum BoardState {
    Empty,
    X,
    O
}

enum GamePhase {
    NotCreated,
    InProgress,
    Finished
}
enum GameResult {
    None,
    Xwin,
    Owin,
    Draw
}
enum PlayerTurn {
    None,
    X,
    O
}

struct Coordinates {
    uint8 row;
    uint8 column;
}
struct Players {
    address X;
    address O;
}
struct Move {
    Player player;
    Coordinates coordinates;
}

struct GameStatus {
    GamePhase phase;
    GameResult result;
    PlayerTurn turn;
}

struct GameState {
    uint gameId;
    Players players;
    GameStatus status;
    BoardState[BOARD_SIZE][BOARD_SIZE] board;
}

contract TicTacToe {
    event GameStarted(uint gameId, address playerX, address playerO);
    event GameFinished(uint gameId, GameResult result);
    event MovePlayed(uint gameId, address player, Coordinates coordinates);

    uint public numOfGames;
    uint[] public allGames;
    mapping(address => uint) public playersGameCount;
    mapping(address => uint[]) public playersGame;

    mapping(uint => GameState) public games;
    mapping(uint => Move[]) public moves;

    function newGame(address playerX, address playerO) public returns (uint) {
        require(
            msg.sender == playerX || msg.sender == playerO,
            "You can only start games you are part of."
        );

        uint gameId = (uint)(keccak256(abi.encode(numOfGames, playerX, playerO)));

        GameState storage gameState = games[gameId];
        gameState.status.phase = GamePhase.InProgress;
        gameState.gameId = gameId;
        gameState.players.X = playerX;
        gameState.players.O = playerO;

        gameState.status.phase = GamePhase.InProgress;
        gameState.status.turn = PlayerTurn.X;

        allGames.push(gameId);
        playersGameCount[playerX] += 1;
        playersGame[playerX].push(gameId);
        playersGameCount[playerO] += 1;
        playersGame[playerO].push(gameId);

        emit GameStarted(gameId, playerX, playerO);

        return gameId;
    }

    function boardState(uint gameId) public view returns (BoardState[BOARD_SIZE][BOARD_SIZE] memory) {
        return games[gameId].board;
    }

    function playMove(
        uint gameId,
        Coordinates calldata coordinates
    ) public returns (GameStatus memory) {
        GameState storage game = games[gameId];
        require(game.status.phase == GamePhase.InProgress, "Game is not in progress.");

        require(
            game.board[coordinates.row][coordinates.column] == BoardState.Empty,
            "Board spot is occupied."
        );

        if (game.status.turn == PlayerTurn.X) {
            require(msg.sender == game.players.X, "Not your turn.");
            game.board[coordinates.row][coordinates.column] = BoardState.X;
        } else if (game.status.turn == PlayerTurn.O) {
            require(msg.sender == game.players.O, "Not your turn.");
            game.board[coordinates.row][coordinates.column] = BoardState.O;
        }

        moves[gameId].push(
            Move(game.status.turn == PlayerTurn.X ? Player.X : Player.O, coordinates)
        );
        emit MovePlayed(gameId, msg.sender, coordinates);

        if (isWinningMove(game.board, coordinates)) {
            game.status.result = game.status.turn == PlayerTurn.X
                ? GameResult.Xwin
                : GameResult.Owin;
            game.status.phase = GamePhase.Finished;
            game.status.turn = PlayerTurn.None;
        } else if (!hasFreeSpots(game.board)) {
            game.status.result = GameResult.Draw;
            game.status.phase = GamePhase.Finished;
            game.status.turn = PlayerTurn.None;
            emit GameFinished(gameId, game.status.result);
            return game.status;
        } else {
            game.status.turn = game.status.turn == PlayerTurn.X ? PlayerTurn.O : PlayerTurn.X;
        }

        if (game.status.phase == GamePhase.Finished) {
            emit GameFinished(gameId, game.status.result);
        }
        return game.status;
    }

    function isWinningMove(
        BoardState[BOARD_SIZE][BOARD_SIZE] storage board,
        Coordinates calldata coordinates
    ) private view returns (bool) {
        BoardState target = board[coordinates.row][coordinates.column];
        require(target != BoardState.Empty, "Invalid board state at coordinates!");

        // check row
        if (
            board[coordinates.row][0] == target &&
            board[coordinates.row][1] == target &&
            board[coordinates.row][2] == target
        ) {
            return true;
        }

        // check column
        if (
            board[0][coordinates.column] == target &&
            board[1][coordinates.column] == target &&
            board[2][coordinates.column] == target
        ) {
            return true;
        }

        // check main diagonal
        if (board[0][0] == target && board[1][1] == target && board[2][2] == target) {
            return true;
        }

        // check anti diagonal
        if (board[0][2] == target && board[1][1] == target && board[2][0] == target) {
            return true;
        }

        return false;
    }

    function hasFreeSpots(
        BoardState[BOARD_SIZE][BOARD_SIZE] storage board
    ) private view returns (bool) {
        for (uint8 row = 0; row < BOARD_SIZE; row++) {
            for (uint8 column = 0; row < BOARD_SIZE; row++) {
                if (board[row][column] == BoardState.Empty) {
                    return true;
                }
            }
        }
        return false;
    }
}
