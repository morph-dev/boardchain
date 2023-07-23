// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./GoTypes.sol";

library GoLibrary {

    enum GroupVisitStatus {
        Unknown,
        Group,
        Opponent,
        Free
    }

    function visitGroup(
        uint8 x,
        uint8 y,
        BoardState[][] storage board
    ) public returns (Coordinates[] memory group, uint16 numLiberties) {
        uint8 boardSize = uint8(board.length);

        GroupVisitStatus[][] memory status = new GroupVisitStatus[][](boardSize);
        for (uint8 i = 0; i < boardSize; i++) {
            status[i] = new GroupVisitStatus[](boardSize);
        }

        uint16 groupSize;
        (numLiberties, groupSize) = visitGroupInternal(x, y, board[x][y], board, status);

        group = new Coordinates[](groupSize);
        uint16 g = 0;
        for (uint8 gx = 0; gx < boardSize; gx++) {
            for (uint8 gy = 0; gy < boardSize; gy++) {
                if (status[gx][gy] == GroupVisitStatus.Group) {
                    group[g] = Coordinates(gx, gy);
                    g++;
                }
            }
        }
    }

    function visitGroupInternal(
        uint8 x,
        uint8 y,
        BoardState target,
        BoardState[][] storage board,
        GroupVisitStatus[][] memory status
    ) internal returns (uint16 numLiberties, uint16 groupSize) {
        uint8 boardSize = uint8(board.length);

        uint16 adjacentLiberties = 0;
        uint16 adjacentGroupSize = 0;

        // up
        if (x > 0 && status[x - 1][y] == GroupVisitStatus.Unknown) {
            (adjacentLiberties, adjacentGroupSize) = visitAdjacent(x - 1, y, target, board, status);
            numLiberties += adjacentLiberties;
            groupSize += adjacentGroupSize;
        }
        // left
        if (y > 0 && status[x][y - 1] == GroupVisitStatus.Unknown) {
            (adjacentLiberties, adjacentGroupSize) = visitAdjacent(x, y - 1, target, board, status);
            numLiberties += adjacentLiberties;
            groupSize += adjacentGroupSize;
        }
        // down
        if (x + 1 < boardSize && status[x + 1][y] == GroupVisitStatus.Unknown) {
            (adjacentLiberties, adjacentGroupSize) = visitAdjacent(x + 1, y, target, board, status);
            numLiberties += adjacentLiberties;
            groupSize += adjacentGroupSize;
        }
        // right
        if (y + 1 < boardSize && status[x][y + 1] == GroupVisitStatus.Unknown) {
            (adjacentLiberties, adjacentGroupSize) = visitAdjacent(x, y + 1, target, board, status);
            numLiberties += adjacentLiberties;
            groupSize += adjacentGroupSize;
        }
    }

    function visitAdjacent(
        uint8 x,
        uint8 y,
        BoardState target,
        BoardState[][] storage board,
        GroupVisitStatus[][] memory status
    ) private returns (uint16 numLiberties, uint16 groupSize) {
        BoardState state = board[x][y];
        if (state == BoardState.Empty) {
            status[x][y] = GroupVisitStatus.Free;
            numLiberties = 1;
        }
        if (state != target) {
            status[x][y] = GroupVisitStatus.Opponent;
            return (0, 0);
        }
        status[x][y] = GroupVisitStatus.Group;
        (numLiberties, groupSize) = visitGroupInternal(x, y, target, board, status);
        groupSize += 1;
    }
}
