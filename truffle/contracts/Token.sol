// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Breeding.sol";
import "./TokenTypeManager.sol";

contract Token is Breeding {

    uint256 public mintCount;

    bool public premiumMintEnabled;

    TokenTypeManager private tokenTypeManager;

    constructor(address initialOwner, address _tokenTypeManager, string memory name, string memory symbol) Breeding(initialOwner, name,symbol) {
        tokenTypeManager = TokenTypeManager(_tokenTypeManager);
    }

    function normalMint(address owner) external {
        string memory tokenType = tokenTypeManager.getRandomNormalTokenType();
        require(tokenTypeManager.isAllowedNormalTokenType(tokenType), "Invalid token type");
        mintCount++;
        mintToken(tokenType,0, 0, 1, owner, false);
    }

    function premiumMint(address owner) external {
        require(premiumMintEnabled, "Premium minting is not enabled");
        string memory tokenType = tokenTypeManager.getRandomPremiumTokenType();
        require(tokenTypeManager.isAllowedPremiumTokenType(tokenType), "Invalid token type");
        mintCount++;
        mintToken(tokenType,0,0,1,owner, true);
    }

    function getToken(uint256 id) external view returns(
        uint256 gender,
        uint256 husbandId,
        uint256 wifeId,
        uint256 generation,
        uint256 birth,
        string memory tokenType
        ){
            Token storage token = tokens[id];
            return (token.gender, token.husbandId, token.wifeId, token.generation, token.birth, token.tokenType);
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
        assembly { mstore(ids,counter) } // Adjust the size of the dynamic array
        return ids;
    }

    function isPremiumOpen(bool isEnabled) external onlyOwner {
        premiumMintEnabled = isEnabled;
    }
}