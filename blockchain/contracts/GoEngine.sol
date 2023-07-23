// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./GoTypes.sol";
import "./GoLibrary.sol";

library GoEngine {
    function playStone(GameFullState storage fullState, Move calldata move) internal {
        require(move.moveType == MoveType.PlayStone, "Expected PlayStone move type.");
    }
}
