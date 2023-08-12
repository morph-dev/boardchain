// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./GoTypes.sol";
import "./GoLibrary.sol";
import "./String.sol";

/// @title The library responsible for updating the game state
/// @dev None of the functions check that authorised entity is performing the
/// operation nor that game is in the correct phase. This should be done by the
/// calling contract
library GoEngine {
    /// @notice Error in case the board size is not allowed.
    error ErrorInvalidBoardSize(uint boardSize);

    /// @notice Error when handicap is not allowed for the given board size
    error ErrorInvalidHandicap(uint8 boardSize, uint8 handicap);

    /// @notice Error when we want to play a stone on already occupied spot
    error ErrorSpotOccupied(uint8 x, uint8 y);

    /// @notice Error when move is not allowed because of the self capture
    error ErrorNoSelfCapture(uint8 x, uint8 y);

    /// @notice Error in the case of a Ko
    error ErrorKo(uint8 x, uint8 y);

    /// @notice Error when group doesn't exist on the given coordinates
    error ErrorGroupNotFound(uint8 x, uint8 y);

    // INITIALIZATION

    /// @notice Initialize the game's state.
    function initializeGameState(
        GameFullState storage fullState,
        uint gameId,
        address black,
        address white,
        uint8 boardSize,
        int16 komi,
        uint8 handicap
    ) internal {
        if (boardSize < 3 || boardSize > 51) {
            revert ErrorInvalidBoardSize(boardSize);
        }

        fullState.info = GameInfo(gameId, boardSize, komi, handicap);

        fullState.players[uint(Player.Black)] = black;
        fullState.players[uint(Player.White)] = white;

        fullState.phase = GamePhase.Playing;

        fullState.board = new BoardState[][](boardSize);
        fullState.scoringState.board = new ScoringBoardState[][](boardSize);
        for (uint i = 0; i < boardSize; i++) {
            fullState.board[i] = new BoardState[](boardSize);
            fullState.scoringState.board[i] = new ScoringBoardState[](
                boardSize
            );
        }

        setupHandicap(fullState);
    }

    function setupHandicap(GameFullState storage fullState) private {
        uint8 boardSize = fullState.info.boardSize;
        uint8 handicap = fullState.info.handicap;

        if (handicap == 0) {
            return;
        }
        // Handicap of 1 stone doesn't make sense. Let Black play where they want.
        if (handicap == 1) {
            revert ErrorInvalidHandicap(boardSize, handicap);
        }
        // White is the first player with handicap.
        fullState.playingState.currentPlayer = Player.White;

        // Don't allow handicap for boards 5x5 and smaller
        if (boardSize <= 5) {
            revert ErrorInvalidHandicap(boardSize, handicap);
        }

        // Allow even board size if handicap <= 4
        if (boardSize % 2 == 0) {
            if (handicap > 4) {
                revert ErrorInvalidHandicap(boardSize, handicap);
            }
        }

        // Allow max 9 stones handicap
        if (handicap > 9) {
            revert ErrorInvalidHandicap(boardSize, handicap);
        }

        // Use edge distance 4 for boards 11x11 and bigger, and 3 otherwise
        uint8 distance = boardSize < 11 ? 3 : 4;

        BoardState[][] storage board = fullState.board;

        // Follow the sequence: https://senseis.xmp.net/?HandicapSequence
        // Top right
        board[distance - 1][boardSize - distance] = BoardState.Black;
        // Bottom left
        if (handicap >= 2) {
            board[boardSize - distance][distance - 1] = BoardState.Black;
        }
        // Bottom right
        if (handicap >= 3) {
            board[boardSize - distance][boardSize - distance] = BoardState
                .Black;
        }
        // Bottom right
        if (handicap >= 4) {
            board[distance - 1][distance - 1] = BoardState.Black;
        }
        // Left-Center and Right-Center
        if (handicap >= 6) {
            board[boardSize / 2][distance - 1] = BoardState.Black;
            board[boardSize / 2][boardSize - distance] = BoardState.Black;
        }
        // Top-Center and Bottom-Center
        if (handicap >= 8) {
            board[distance - 1][boardSize / 2] = BoardState.Black;
            board[boardSize - distance][boardSize / 2] = BoardState.Black;
        }
        // Center
        if (handicap == 5 || handicap == 7 || handicap == 9) {
            board[boardSize / 2][boardSize / 2] = BoardState.Black;
        }
    }

    // PLAYING PHASE

    /// @notice Update the game state when a stone is played
    /// @param fullState The game's state
    /// @param x The x coordinate of the played stone
    /// @param y The y coordinate of the played stone
    function playStone(
        GameFullState storage fullState,
        uint8 x,
        uint8 y
    ) internal {
        assert(fullState.phase == GamePhase.Playing);

        BoardState[][] storage board = fullState.board;
        if (board[x][y] != BoardState.Empty) {
            revert ErrorSpotOccupied(x, y);
        }

        PlayingState storage state = fullState.playingState;

        Player player = state.currentPlayer;
        BoardState opponent = player == Player.Black
            ? BoardState.White
            : BoardState.Black;

        // 1. Place stone
        board[x][y] = player == Player.Black
            ? BoardState.Black
            : BoardState.White;

        // 2. Capture opponents adjacent groups
        uint16 totalCaptures = 0;
        // up
        if (x > 0 && board[x - 1][y] == opponent) {
            totalCaptures += maybeCaptureGroup(fullState, x - 1, y);
        }
        // left
        if (y > 0 && board[x][y - 1] == opponent) {
            totalCaptures += maybeCaptureGroup(fullState, x, y - 1);
        }
        // down
        if (x + 1 < fullState.info.boardSize && board[x + 1][y] == opponent) {
            totalCaptures += maybeCaptureGroup(fullState, x + 1, y);
        }
        // right
        if (y + 1 < fullState.info.boardSize && board[x][y + 1] == opponent) {
            totalCaptures += maybeCaptureGroup(fullState, x, y + 1);
        }

        // 3. Check Self-Capture
        if (maybeCaptureGroup(fullState, x, y) != 0) {
            revert ErrorNoSelfCapture(x, y);
        }

        // 4. Check KO
        if (
            state.isKoPossible &&
            totalCaptures == 1 &&
            board[state.lastMove.x][state.lastMove.y] == BoardState.Empty
        ) {
            revert ErrorKo(x, y);
        }

        // 5. Update Playing State
        state.numberOfMoves++;
        state.lastMove = Move(x, y, false);
        state.currentPlayer = player == Player.Black
            ? Player.White
            : Player.Black;
        state.isKoPossible = totalCaptures == 1;
        state.prisoners[uint(player)] += totalCaptures;
    }

    /// @notice Capture the group iff has zero liberties
    /// @dev The functions requires that the board is not empty at the
    /// coordinates and it will capture it's entire group
    /// @param fullState The game's state
    /// @param x The x coordinate of a stone that belongs to the group
    /// @param x The y coordinate of a stone that belongs to the group
    /// @return captures Number of captured stones, or 0 if group has liberties
    function maybeCaptureGroup(
        GameFullState storage fullState,
        uint8 x,
        uint8 y
    ) private returns (uint16 captures) {
        BoardState[][] storage board = fullState.board;
        assert(board[x][y] != BoardState.Empty);

        GroupSearchResult memory groupSearch = GoLibrary.groupSearch(
            x,
            y,
            fullState,
            GoLibrary.playingBoardState
        );

        // Check liberties
        if (groupSearch.hasAdjacentBoardState[uint(BoardState.Empty)]) {
            return 0;
        }

        uint8 boardSize = fullState.info.boardSize;
        for (uint8 i = 0; i < boardSize; i++) {
            for (uint8 j = 0; j < boardSize; j++) {
                if (groupSearch.group[i][j]) {
                    board[i][j] = BoardState.Empty;
                }
            }
        }

        return groupSearch.groupSize;
    }

    /// @notice Update the game state in the case of a pass
    /// @dev This function doesn't check that the current player is the one
    /// initiating the tx or that game is in the correct phase. In case of a
    /// second consecutive pass, it will also move to the scoring phase and
    /// initialize `ScoringState`
    /// @param fullState The game's state
    function pass(GameFullState storage fullState) internal {
        assert(fullState.phase == GamePhase.Playing);

        PlayingState storage state = fullState.playingState;
        if (state.lastMove.isPass) {
            fullState.phase = GamePhase.Scoring;
            markAllGroupsAlive(fullState);
            scoreBoard(fullState);
        }

        state.numberOfMoves++;
        state.lastMove = Move(0, 0, true);
        state.currentPlayer = state.currentPlayer == Player.Black
            ? Player.White
            : Player.Black;
        state.isKoPossible = false;
    }

    // SCORING PHASE

    /// @notice Marks all stones as alive
    /// @param fullState The game's state
    function markAllGroupsAlive(GameFullState storage fullState) private {
        assert(fullState.phase == GamePhase.Scoring);

        BoardState[][] storage board = fullState.board;
        ScoringBoardState[][] storage scoringBoard = fullState
            .scoringState
            .board;

        uint8 boardSize = fullState.info.boardSize;
        for (uint8 x = 0; x < boardSize; x++) {
            for (uint8 y = 0; y < boardSize; y++) {
                if (board[x][y] != BoardState.Empty) {
                    scoringBoard[x][y] = ScoringBoardState.Alive;
                }
            }
        }
    }

    /// @notice Marks group as either dead or alive for scoring purposes
    /// @dev If does nothing if group is already marked as such
    /// @param fullState The game's state
    /// @param x The x coordinate of a stone that belongs to the group
    /// @param y The y coordinate of a stone that belongs to the group
    function markGroup(
        GameFullState storage fullState,
        uint8 x,
        uint8 y,
        bool dead
    ) internal {
        assert(fullState.phase == GamePhase.Scoring);

        BoardState[][] storage board = fullState.board;
        ScoringBoardState[][] storage scoringBoard = fullState
            .scoringState
            .board;

        if (board[x][y] == BoardState.Empty) {
            revert ErrorGroupNotFound(x, y);
        }

        ScoringBoardState state = dead
            ? ScoringBoardState.Dead
            : ScoringBoardState.Alive;

        // Check if group is already correctly marked.
        if (scoringBoard[x][y] == state) {
            return;
        }

        GroupSearchResult memory groupSearch = GoLibrary.groupSearch(
            x,
            y,
            fullState,
            GoLibrary.playingBoardState
        );

        // Update Board prisoners
        Player opponent = board[x][y] == BoardState.Black
            ? Player.White
            : Player.Black;
        if (dead) {
            fullState.scoringState.boardPrisoners[uint(opponent)] += groupSearch
                .groupSize;
        } else {
            fullState.scoringState.boardPrisoners[uint(opponent)] -= groupSearch
                .groupSize;
        }

        // Mark group and invalidate scoring states of empty spots
        uint8 boardSize = fullState.info.boardSize;
        for (uint256 gx = 0; gx < boardSize; gx++) {
            for (uint256 gy = 0; gy < boardSize; gy++) {
                if (groupSearch.group[gx][gy]) {
                    scoringBoard[gx][gy] = state;
                }

                if (board[gx][gy] == BoardState.Empty) {
                    scoringBoard[gx][gy] = ScoringBoardState.Unknown;
                }
            }
        }

        // Score board
        scoreBoard(fullState);
    }

    /// @notice Marks neutral and territory spaces
    /// @dev This function expects all empty spots to be in Unknown scoring
    /// state, and all stones to be marked as either dead or alive
    /// @param fullState The game's state
    function scoreBoard(GameFullState storage fullState) private {
        assert(fullState.phase == GamePhase.Scoring);

        ScoringState storage scoringState = fullState.scoringState;
        BoardState[][] storage board = fullState.board;
        ScoringBoardState[][] storage scoringBoard = scoringState.board;

        // Reset territory scoring
        scoringState.territory = [0, 0];
        // Reset accepted values
        scoringState.accepted = [false, false];

        uint8 boardSize = fullState.info.boardSize;
        for (uint8 x = 0; x < boardSize; x++) {
            for (uint8 y = 0; y < boardSize; y++) {
                if (
                    board[x][y] == BoardState.Empty &&
                    scoringBoard[x][y] == ScoringBoardState.Unknown
                ) {
                    GroupSearchResult memory groupSearch = GoLibrary
                        .groupSearch(
                            x,
                            y,
                            fullState,
                            GoLibrary.scoringBoardState
                        );
                    bool touchingBlack = groupSearch.hasAdjacentBoardState[
                        uint(BoardState.Black)
                    ];
                    bool touchingWhite = groupSearch.hasAdjacentBoardState[
                        uint(BoardState.White)
                    ];

                    ScoringBoardState state = ScoringBoardState.Neutral;
                    if (touchingBlack && !touchingWhite) {
                        state = ScoringBoardState.TerritoryBlack;
                        scoringState.territory[
                            uint(Player.Black)
                        ] += groupSearch.groupSize;
                    }
                    if (touchingWhite && !touchingBlack) {
                        state = ScoringBoardState.TerritoryWhite;
                        scoringState.territory[
                            uint(Player.White)
                        ] += groupSearch.groupSize;
                    }

                    for (uint256 mx = 0; mx < boardSize; mx++) {
                        for (uint256 my = 0; my < boardSize; my++) {
                            if (
                                groupSearch.group[mx][my] &&
                                board[mx][my] == BoardState.Empty
                            ) {
                                scoringBoard[mx][my] = state;
                            }
                        }
                    }
                }
            }
        }
    }

    function acceptScoring(
        GameFullState storage fullState,
        Player player
    ) internal {
        ScoringState storage scoringState = fullState.scoringState;
        scoringState.accepted[uint8(player)] = true;

        if (scoringState.accepted[0] && scoringState.accepted[1]) {
            fullState.phase = GamePhase.Finished;
            fullState.result = GoEngine.getGameResult(fullState);
        }
    }

    /// @notice It calculates and returns the `GameResult` struct
    /// @dev It assumes that `playingState.prisoners`, `scoringState.boardPrisoners` and
    /// `scoringState.territory` are already calculated correctly
    /// @param fullState The game's full state
    /// @return r The `GameResult` struct
    function getGameResult(
        GameFullState storage fullState
    ) internal view returns (GameResult memory r) {
        PlayingState storage playingState = fullState.playingState;
        ScoringState storage scoringState = fullState.scoringState;

        int16 blackPoints = int16(
            playingState.prisoners[0] +
                scoringState.boardPrisoners[0] +
                scoringState.territory[0]
        );

        int16 whitePoints = fullState.info.komi +
            int16(
                playingState.prisoners[1] +
                    scoringState.boardPrisoners[1] +
                    scoringState.territory[1]
            );

        if (blackPoints > whitePoints) {
            return
                GameResult(
                    Result.BlackWin,
                    string.concat(
                        "B+",
                        String.uint2str(uint16(blackPoints - whitePoints - 1)),
                        ".5"
                    )
                );
        } else {
            return
                GameResult(
                    Result.WhiteWin,
                    string.concat(
                        "W+",
                        String.uint2str(uint16(whitePoints - blackPoints)),
                        ".5"
                    )
                );
        }
    }
}
