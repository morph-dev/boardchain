// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./GoTypes.sol";

struct GroupSearchResult {
    bool[][] group;
    uint16 groupSize;
    bool[3] hasAdjacentBoardState;
}

library GoLibrary {
    function groupSearch(
        uint8 x,
        uint8 y,
        GameFullState storage fullState,
        function(uint8, uint8, GameFullState storage)
            view
            returns (BoardState) bs
    ) internal view returns (GroupSearchResult memory result) {
        uint8 boardSize = fullState.info.boardSize;

        result.group = new bool[][](boardSize);
        for (uint8 i = 0; i < boardSize; i++) {
            result.group[i] = new bool[](boardSize);
        }

        BoardState origin = bs(x, y, fullState);

        groupSearchInternal(x, y, origin, fullState, bs, result);
    }

    function groupSearchInternal(
        uint8 x,
        uint8 y,
        BoardState origin,
        GameFullState storage fullState,
        function(uint8, uint8, GameFullState storage)
            view
            returns (BoardState) bs,
        GroupSearchResult memory result
    ) private view {
        // Do nothing if already visited
        if (result.group[x][y]) {
            return;
        }

        BoardState state = bs(x, y, fullState);

        // Stop if not part of the group
        if (state != origin) {
            result.hasAdjacentBoardState[uint(state)] = true;
            return;
        }

        result.group[x][y] = true;
        result.groupSize++;

        // Check neighbours

        // Up
        if (x > 0) {
            groupSearchInternal(x - 1, y, origin, fullState, bs, result);
        }
        // Down
        if (x + 1 < fullState.info.boardSize) {
            groupSearchInternal(x + 1, y, origin, fullState, bs, result);
        }
        // Left
        if (y > 0) {
            groupSearchInternal(x, y - 1, origin, fullState, bs, result);
        }
        // Right
        if (y + 1 < fullState.info.boardSize) {
            groupSearchInternal(x, y + 1, origin, fullState, bs, result);
        }
    }

    function playingBoardState(
        uint8 x,
        uint8 y,
        GameFullState storage fullState
    ) internal view returns (BoardState) {
        return fullState.board[x][y];
    }

    function scoringBoardState(
        uint8 x,
        uint8 y,
        GameFullState storage fullState
    ) internal view returns (BoardState) {
        BoardState state = fullState.board[x][y];
        if (state != BoardState.Empty) {
            ScoringBoardState scoringState = fullState.scoringState.board[x][y];
            if (scoringState == ScoringBoardState.Dead) {
                return BoardState.Empty;
            }
            assert(scoringState == ScoringBoardState.Alive);
        }
        return state;
    }
}
