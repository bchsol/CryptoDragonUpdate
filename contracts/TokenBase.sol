// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TokenBase is ERC721, ERC721URIStorage, Ownable {
    enum GrowthStage{Egg, Hatch, Hatchling, Adult}
    mapping(uint256=>GrowthStage) private growthStages;

    struct Token {
        uint256 gender; // 1: male 2: female
        uint256 husbandId;
        uint256 wifeId;
        uint256 generation;
        uint256 birth;
        string growth;
    }

    struct GrowthTime {
        uint256 hatch;
        uint256 hatchling;
        uint256 adult;
    }

    // genesis or breed => gender => growthStage
    mapping(string=>mapping(uint256 => mapping(string=>string))) internal metadataURI;
    mapping(uint256 => Token) internal tokens;
    mapping(uint256 => GrowthTime) internal growthTime;
    mapping(address => uint256[]) internal userTokens;
    uint256 internal newTokenId;
    uint256 private randNonce;

    constructor(address initialOwner,string memory name, string memory symbol) ERC721(name,symbol) Ownable(initialOwner) {
        randNonce = 0;
    }

    function evolve(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        GrowthStage currentStage = growthStages[tokenId];

        if(currentStage == GrowthStage.Egg && block.timestamp >= growthTime[tokenId].hatch) {
            growthStages[tokenId] = GrowthStage.Hatch;
            growthTime[tokenId].hatchling = block.timestamp + 2 days;
        } else if(currentStage == GrowthStage.Hatch && block.timestamp >= growthTime[tokenId].hatchling) {
            growthStages[tokenId] = GrowthStage.Hatchling;
            growthTime[tokenId].adult = block.timestamp + 3 days;
            
        } else if(currentStage == GrowthStage.Hatchling && block.timestamp >= growthTime[tokenId].adult) {
            growthStages[tokenId] = GrowthStage.Adult;
            
        } else {
            require(false, "Unable to evolve");
        }
        updateGrowth(tokenId);
    }

    function updateGrowth(uint256 tokenId) internal {
        GrowthStage currentStage = growthStages[tokenId];

        if (currentStage == GrowthStage.Hatch) {
            tokens[tokenId].growth = "hatch";
            tokens[tokenId].gender = getRandomGender();
            _setTokenURI(tokenId, getMetadataURI("hatch", tokens[tokenId].gender));
           
        } else if (currentStage == GrowthStage.Hatchling) {
            tokens[tokenId].growth = "hatchling";
            _setTokenURI(tokenId, getMetadataURI("hatchling", tokens[tokenId].gender));
        } else if (currentStage == GrowthStage.Adult) {
            tokens[tokenId].growth = "adult";
            _setTokenURI(tokenId, getMetadataURI("adult", tokens[tokenId].gender));
        }
    }

    function feeding(uint256 tokenId) external {
        require(growthStages[tokenId] != GrowthStage.Adult, "Token is already adult");
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        GrowthStage currentStage = growthStages[tokenId];
        GrowthTime storage time = growthTime[tokenId];
        uint256 currentTime = block.timestamp;

        if (currentStage == GrowthStage.Egg) {
            time.hatch = reduceTimeIfPossible(currentTime, growthTime[tokenId].hatch, 3 hours);
        } else if (currentStage == GrowthStage.Hatch) {
            time.hatchling = reduceTimeIfPossible(currentTime, growthTime[tokenId].hatchling, 3 hours);
        } else if (currentStage == GrowthStage.Hatchling) {
            time.adult = reduceTimeIfPossible(currentTime, growthTime[tokenId].adult, 3 hours);
        }
    }

    function reduceTimeIfPossible( uint256 currentTime,uint256 growthEndTime, uint256 reduction) internal pure returns(uint256){
        if(growthEndTime - currentTime >= reduction) {
            return (growthEndTime - reduction);
        }else {
            return 0;
        }
    }

    function getGrowthInfo(uint256 tokenId) external view returns(GrowthStage currentStage, uint256 timeRemaining) {
        currentStage = growthStages[tokenId];
        uint256 currentTime = block.timestamp;

        if(currentStage == GrowthStage.Egg && growthTime[tokenId].hatch > currentTime) {
            timeRemaining = growthTime[tokenId].hatch - currentTime;
        } else if(currentStage == GrowthStage.Hatch && growthTime[tokenId].hatchling > currentTime) {
            timeRemaining = growthTime[tokenId].hatchling - currentTime;
        } else if(currentStage == GrowthStage.Hatchling && growthTime[tokenId].adult > currentTime) {
            timeRemaining = growthTime[tokenId].adult - currentTime;
        } else {
            timeRemaining = 0;
        }

    }

    function getRandomGender() internal returns(uint) {
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,randNonce))) % 2 + 1;
    }

    function setMetadataURI(string calldata isGen, uint256 gender, string calldata growthStage, string calldata uri) external onlyOwner {
        metadataURI[isGen][gender][growthStage] = uri;
    }

    function mintToken(uint256 _husbandId, uint256 _wifeId, uint256 _generation, address _owner) internal returns(uint256) {
        Token memory token = Token({
            gender: 0,
            husbandId: _husbandId,
            wifeId: _wifeId,
            generation: _generation,
            birth: block.timestamp,
            growth: "egg"
        });
        newTokenId++;
        tokens[newTokenId] = token;

        growthTime[newTokenId].hatch = token.birth + 2 days;

        growthStages[newTokenId] = GrowthStage.Egg;

        _safeMint(_owner, newTokenId);
        string memory uri = "";
        if(tokens[newTokenId].generation == 1) {
            uri = metadataURI["genesis"][0]["egg"];
        } else {
            uri = metadataURI["breeding"][0]["egg"];
        }
        _setTokenURI(newTokenId, uri);

        userTokens[_owner].push(newTokenId);

        return newTokenId;
    }

    function forceEvolve(uint256 tokenId) external onlyOwner {
        GrowthStage currentStage = growthStages[tokenId];
        if(currentStage == GrowthStage.Egg) {
            growthStages[tokenId] = GrowthStage.Hatch;
            growthTime[tokenId].hatchling = block.timestamp + 2 days;
        } else if(currentStage == GrowthStage.Hatch) {
            growthStages[tokenId] = GrowthStage.Hatchling;
            growthTime[tokenId].adult = block.timestamp + 3 days;
        } else if(currentStage == GrowthStage.Hatchling) {
            growthStages[tokenId] = GrowthStage.Adult;
        } else {
            require(false, "Unable to evolve");
        }
        updateGrowth(tokenId);
    }

    function setTokenURI(uint256 tokenId, string calldata url) external onlyOwner {
        _setTokenURI(tokenId, url);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721,ERC721URIStorage)
        returns (string memory)
    {

        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getMetadataURI(string memory growthStage, uint256 gender) internal view returns(string memory) {
        string memory genType = tokens[newTokenId].generation == 1 ? "genesis" : "breeding";
        return metadataURI[genType][gender][growthStage];
    }
}