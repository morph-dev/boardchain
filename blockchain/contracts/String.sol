// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./GoTypes.sol";

import "hardhat/console.sol";

library String {
    function uint2str(uint n) internal pure returns (string memory) {
        if (n == 0) {
            return "0";
        }
        uint len;
        for (uint tmp = n; tmp != 0; tmp /= 10) {
            len++;
        }
        bytes memory b = new bytes(len);

        uint i = len;
        for (uint tmp = n; tmp != 0; tmp /= 10) {
            i--;
            b[i] = bytes1(48 + uint8(tmp % 10));
        }
        return string(b);
    }
}
