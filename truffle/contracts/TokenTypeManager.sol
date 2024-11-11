// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenTypeManager is Ownable {
    enum Element {Fire, Water, Wind, Earth, Steel, Light, Dark}

    string[] private normalTokenTypes;
    string[] private premiumTokenTypes;
    
    mapping(string => Element) normalTokenElement;
    mapping(string => Element) premiumTokenElement;

    event NormalTokenTypeAdded(string tokenType);
    event PremiumTokenTypeAdded(string tokenType);
    event NormalTokenTypeRemoved(string tokenType);
    event PremiumTokenTypeRemoved(string tokenType);

    constructor() Ownable(msg.sender){
    }

    function addNormalTokenType(string calldata _tokenType, Element element) external onlyOwner {
        normalTokenTypes.push(_tokenType);
        normalTokenElement[_tokenType] = element;
        emit NormalTokenTypeAdded(_tokenType);
    }

    function addPremiumTokenType(string calldata _tokenType, Element element) external onlyOwner {
        premiumTokenTypes.push(_tokenType);
        premiumTokenElement[_tokenType] = element;
        emit PremiumTokenTypeAdded(_tokenType);
    }

     function removeNormalTokenType(string calldata _tokenType) external onlyOwner {
        _removeTokenType(_tokenType, normalTokenTypes);
        emit NormalTokenTypeRemoved(_tokenType);
    }

    function removePremiumTokenType(string calldata _tokenType) external onlyOwner {
        _removeTokenType(_tokenType, premiumTokenTypes);
        emit PremiumTokenTypeRemoved(_tokenType);
    }

    function _removeTokenType(string calldata _tokenType, string[] storage tokenArray) internal {
        for (uint i = 0; i < tokenArray.length; i++) {
            if (keccak256(abi.encodePacked(tokenArray[i])) == keccak256(abi.encodePacked(_tokenType))) {
                tokenArray[i] = tokenArray[tokenArray.length - 1];
                tokenArray.pop();
                break;
            }
        }
    }

    function isAllowedNormalTokenType(string calldata _tokenType) external view returns (bool) {
        return _isAllowedTokenType(_tokenType, normalTokenTypes);
    }

    function isAllowedPremiumTokenType(string calldata _tokenType) external view returns (bool) {
        return _isAllowedTokenType(_tokenType, premiumTokenTypes);
    }

    function _isAllowedTokenType(string calldata _tokenType, string[] storage tokenArray) internal view returns (bool) {
        for (uint i = 0; i < tokenArray.length; i++) {
            if (keccak256(abi.encodePacked(tokenArray[i])) == keccak256(abi.encodePacked(_tokenType))) {
                return true;
            }
        }
        return false;
    }

    function getTokenElement(string calldata _tokenType) external view returns(string memory) {
        if(normalTokenElement[_tokenType] == Element.Fire) return "Fire";
        if(normalTokenElement[_tokenType] == Element.Water) return "Water";
        if(normalTokenElement[_tokenType] == Element.Wind) return "Wind";
        if(normalTokenElement[_tokenType] == Element.Earth) return "Earth";
        if(normalTokenElement[_tokenType] == Element.Steel) return "Steel";
        if(normalTokenElement[_tokenType] == Element.Light) return "Light";
        if(normalTokenElement[_tokenType] == Element.Dark) return "Dark";

        revert("Invalid element");
    }

    function getNormalTokenTypes() external view returns (string[] memory) {
        return normalTokenTypes;
    }

    function getPremiumTokenTypes() external view returns (string[] memory) {
        return premiumTokenTypes;
    }

     function getRandomNormalTokenType() external view returns (string memory) {
        return _getRandomTokenType(normalTokenTypes);
    }

    function getRandomPremiumTokenType() external view returns (string memory) {
        return _getRandomTokenType(premiumTokenTypes);
    }

    function _getRandomTokenType(string[] storage tokenArray) internal view returns (string memory) {
        require(tokenArray.length > 0, "No token types available.");
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % tokenArray.length;
        return tokenArray[randomIndex];
    }
}