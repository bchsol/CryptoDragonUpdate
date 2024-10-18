// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Timestamp {

    constructor(){}

    function timestamp() public view returns(uint256) {
        return block.timestamp;
    }

    function timestamp(uint256 time) public view returns(uint256) {
        return block.timestamp + time;
    }

}