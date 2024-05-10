// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Breeding.sol";

contract Token is Breeding {
    uint256 public constant GENESIS_LIMIT = 10;
    uint256 public genesisCount;

    function genesisMint(address owner, string memory tokenType) external {
        require( genesisCount < GENESIS_LIMIT, "limit exceeded");

        genesisCount++;
        mintToken(tokenType, 0, 0, 1, owner);
    }

    function getToken(uint256 id) external view returns(uint256 gender,
        uint256 husbandId,
        uint256 wifeId,
        uint256 generation,
        uint256 birth){
            Token storage token = tokens[id];

            gender = token.gender;
            husbandId = token.husbandId;
            wifeId = token.wifeId;
            generation = token.generation;
            birth = token.birth;
    }

    function getUserNftIds(address user) external view returns (uint256[] memory) {
        uint256 latestId = newTokenId;
        uint256 counter;
        uint256[] memory ids = new uint256[](latestId);

        for (uint256 i = 1; i <= latestId; i++) {
            if (ownerOf(i) == user) {
                ids[counter] = i;
                counter++;
            }
        }
        return ids;
    }

}