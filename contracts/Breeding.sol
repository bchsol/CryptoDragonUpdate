// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenBase.sol";

contract Breeding is TokenBase{

    struct Breed {
        uint256 releaseTime;
        uint256 count;
    }

    mapping(uint256 => Breed) private breedInfo;

    constructor(address initialOwner, string memory name, string memory symbol) TokenBase(initialOwner,name,symbol) {}

    function breed(string calldata tokenType, uint256 husbandId, uint256 wifeId) external payable returns(uint256){
        require(ownerOf(husbandId) == msg.sender && ownerOf(wifeId) == msg.sender, "Not owner");
        require(!_isIncest(husbandId,wifeId), "Incest");
        require(_canBreed(husbandId) && _canBreed(wifeId), "Breeding not allowed yet");
        require(_areDifferentGenders(husbandId,wifeId), "Same gender");

        _updateBreedInfo(husbandId);
        _updateBreedInfo(wifeId);

        uint256 tokenId = _createChildToken(tokenType, husbandId, wifeId);

        return tokenId;
    }

    function _isIncest(uint256 husbandId, uint256 wifeId) internal view returns(bool){
        Token storage husband = tokens[husbandId];
        Token storage wife = tokens[wifeId];
        
        return (husband.generation == 1 || wife.generation == 1) ? false : (husband.husbandId == wife.husbandId || husband.wifeId == wife.wifeId);
    }

    function _areDifferentGenders(uint256 husbandId, uint256 wifeId) internal view returns(bool) {
        Token storage husband = tokens[husbandId];
        Token storage wife = tokens[wifeId];
        return husband.gender != wife.gender;
    }

    function _canBreed(uint256 tokenId) internal view returns(bool) {
        return breedInfo[tokenId].releaseTime < block.timestamp;
    }

    function _updateBreedInfo(uint256 tokenId) internal {
        breedInfo[tokenId].count++;
        breedInfo[tokenId].releaseTime = block.timestamp + 3 days;
    }

    function _createChildToken(string calldata tokenType, uint256 husbandId, uint256 wifeId) internal returns(uint256){
         Token storage husband = tokens[husbandId];
         Token storage wife = tokens[wifeId];

         uint256 parentGen = (husband.generation > wife.generation) ? husband.generation : wife.generation;
         uint256 tokenId = mintToken(tokenType, husbandId, wifeId, parentGen + 1, msg.sender);

         return tokenId;
    }

    function getBreedInfo(uint256 tokenId) external view returns(uint256 releaseTime, uint256 count) {
        releaseTime = breedInfo[tokenId].releaseTime;
        count = breedInfo[tokenId].count;
    }
}