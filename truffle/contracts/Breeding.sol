// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenBase.sol";

contract Breeding is TokenBase {

    struct Breed {
        uint256 releaseTime;  // 다음 번식이 가능한 시간
        uint256 count;        // 총 번식 횟수
    }

    mapping(uint256 => Breed) private breedData;

    event TokenBreed(uint256 indexed husbandId, uint256 indexed wifeId, uint256 indexed childId);

    constructor(address initialOwner, string memory name, string memory symbol) TokenBase(initialOwner,name,symbol) {}

    /// @notice 두 토큰을 번식시켜 새로운 토큰을 생성
    /// @return 새로 생성된 자식 토큰 ID
    function breedTokens(uint256 husbandId, uint256 wifeId) external returns(uint256) {
        require(
            ownerOf(husbandId) == msg.sender && 
            ownerOf(wifeId) == msg.sender, 
            "Not owner"
        );
        
        Token storage husband = tokens[husbandId];
        Token storage wife = tokens[wifeId];
        
        require(
            !_isIncest(husband, wife) &&
            _canBreed(husbandId) && 
            _canBreed(wifeId) &&
            husband.gender != wife.gender,
            "Breeding conditions not met"
        );

        _updateBreedData(husbandId);
        _updateBreedData(wifeId);

        string memory tokenType = _determineChildTokenType(husband, wife);
        uint256 tokenId = _createChildToken(tokenType, husband, wife);

        emit TokenBreed(husbandId, wifeId, tokenId);
        return tokenId;
    }

    /// @notice 자식 토큰의 타입을 결정하는 내부 함수
    function _determineChildTokenType(Token storage husband, Token storage wife) 
        private 
        view 
        returns(string memory) 
    {
        bytes32 husbandType = keccak256(abi.encodePacked(husband.tokenType));
        bytes32 wifeType = keccak256(abi.encodePacked(wife.tokenType));
        
        if (husbandType == wifeType) {
            return husband.tokenType;
        }

        uint256 rand = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        )));
        
        return (rand % 2 == 0) ? husband.tokenType : wife.tokenType;
    }

    /// @notice 근친 여부를 확인하는 내부 함수
    function _isIncest(Token storage husband, Token storage wife) 
        private 
        view 
        returns(bool)
    {
        if (husband.generation == 1 || wife.generation == 1) return false;
        return husband.husbandId == wife.husbandId || husband.wifeId == wife.wifeId;
    }

    /// @notice 번식 가능 여부를 확인하는 내부 함수
    function _canBreed(uint256 tokenId) private view returns(bool) {
        return breedData[tokenId].releaseTime < block.timestamp;
    }

    /// @notice 번식 데이터를 업데이트하는 내부 함수
    function _updateBreedData(uint256 tokenId) private {
        Breed storage breed = breedData[tokenId];
        breed.count++;
        breed.releaseTime = block.timestamp + 3 days;
    }

    /// @notice 자식 토큰을 생성하는 내부 함수
    function _createChildToken(
        string memory tokenType, 
        Token storage husband,
        Token storage wife
    ) private returns(uint256) {
        uint256 parentGen = husband.generation > wife.generation ? 
            husband.generation : wife.generation;
            
        return mintToken(
            tokenType,
            husband.husbandId,
            wife.wifeId,
            parentGen + 1,
            msg.sender,
            false,
            ""
        );
    }

    /// @notice 토큰의 번식 데이터를 조회하는 외부 함수
    function getBreedData(uint256 tokenId) 
        external 
        view 
        returns(uint256 releaseTime, uint256 count) 
    {
        Breed memory breed = breedData[tokenId];
        return (breed.releaseTime, breed.count);
    }
}