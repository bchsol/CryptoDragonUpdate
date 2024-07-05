// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Breeding.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Token is Breeding, UUPSUpgradeable {

    uint256 public mintCount;
    bool public premiumMintEnabled;

    function initialize(address initialOwner, address _tokenTypeManager, string memory name, string memory symbol) public override initializer {
        Breeding.initialize(initialOwner, _tokenTypeManager, name, symbol);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function nomalMint(address owner, string calldata tokenType) external {
        mintCount++;
        mintToken(tokenType, 0, 0, 1, owner, false);
    }

    function premiumMint(address owner, string calldata tokenType) external {
        require(premiumMintEnabled, "Premium minting is not enabled");
        mintCount++;
        mintToken(tokenType, 0,0,1,owner, true);
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