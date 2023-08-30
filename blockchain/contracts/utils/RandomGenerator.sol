// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract RandomGenerator {
    uint randNonce;

    function randomUint() internal returns (uint) {
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.prevrandao, randNonce)));
    }

    function randomBool() internal returns (bool) {
        return randomUint() % 2 == 0;
    }
}
