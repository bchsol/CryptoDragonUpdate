// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Breeding.sol";
import "./TokenTypeManager.sol";

contract Token is Breeding {
    uint256 public mintCount;
    bool public premiumMintEnabled;
    TokenTypeManager private tokenTypeManager;

    event TokenMinted(address indexed owner, uint256 indexed tokenId, string tokenType, bool isPremium);
    event PremiumMintStatusChanged(bool isEnabled);
    
    constructor(address initialOwner, address _tokenTypeManager, string memory name, string memory symbol) Breeding(initialOwner, name,symbol) {
        require(_tokenTypeManager != address(0), "Invalid token type manager address");
        tokenTypeManager = TokenTypeManager(_tokenTypeManager);
    }


    ///@notice 일반 토큰을 민팅합니다
    function normalMint(address owner) external {
        require(owner != address(0), "Invalid owner address");
        string memory tokenType = tokenTypeManager.getRandomNormalTokenType();
        string memory element = tokenTypeManager.getTokenElement(tokenType);
        require(tokenTypeManager.isAllowedNormalTokenType(tokenType), "Invalid token type");
        
        uint256 newTokenId = ++mintCount;
        mintToken(tokenType, 0, 0, 1, owner, false, element);
        
        emit TokenMinted(owner, newTokenId, tokenType, false);
    }


    /// @notice 프리미엄 토큰을 민팅합니다
    function premiumMint(address owner) external {
        require(owner != address(0), "Invalid owner address");
        require(premiumMintEnabled, "Premium minting is not enabled");
        
        string memory tokenType = tokenTypeManager.getRandomPremiumTokenType();
        string memory element = tokenTypeManager.getTokenElement(tokenType);
        require(tokenTypeManager.isAllowedPremiumTokenType(tokenType), "Invalid token type");
        
        uint256 newTokenId = ++mintCount;
        mintToken(tokenType, 0, 0, 1, owner, true, element);
        
        emit TokenMinted(owner, newTokenId, tokenType, true);
    }


    /// @notice 특정 토큰의 상세 정보를 조회합니다
    function getToken(uint256 id) external view returns(
        uint256 gender,
        uint256 husbandId,
        uint256 wifeId,
        uint256 generation,
        uint256 birth,
        string memory tokenType,
        string memory element,
        string memory personality
    ){
        require(id > 0 && id <= mintCount, "Invalid token ID");
        Token storage token = tokens[id];
        return (
            token.gender,
            token.husbandId,
            token.wifeId,
            token.generation,
            token.birth,
            token.tokenType,
            token.element,
            token.personality
        );
    }


    /// @notice 특정 사용자가 소유한 모든 NFT ID를 반환합니다
    /// @return 사용자가 소유한 토큰 ID 배열
    function getUserNftIds(address user) external view returns (uint256[] memory) {
        require(user != address(0), "Invalid user address");
        
        uint256 balance = balanceOf(user);
        uint256[] memory ids = new uint256[](balance);
        uint256 counter;
        
        for (uint256 i = 1; i <= mintCount && counter < balance; i++) {
            if (ownerOf(i) == user) {
                ids[counter++] = i;
            }
        }
        
        return ids;
    }


    /// @notice 프리미엄 민팅 기능을 활성화/비활성화합니다
    function isPremiumOpen(bool isEnabled) external onlyOwner {
        premiumMintEnabled = isEnabled;
        emit PremiumMintStatusChanged(isEnabled);
    }
}