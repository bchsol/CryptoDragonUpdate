// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenBase is ERC721, ERC721URIStorage, Ownable {
    enum GrowthStage{Egg, Hatch, Hatchling, Adult}
    
    struct Token {
        string tokenType;
        uint256 gender; // 1: male 2: female
        uint256 husbandId;
        uint256 wifeId;
        uint256 generation;
        bool isPremium;
        uint256 birth;
    }

    struct GrowthTime {
        uint256 hatch;
        uint256 hatchling;
        uint256 adult;
    }

    mapping(uint256 => Token) internal tokens;
    mapping(uint256=>GrowthStage) private growthStages;
    mapping(uint256 => GrowthTime) internal growthTime;
    mapping(address => uint256[]) internal userTokens;

    uint256 internal newTokenId;
    uint256 private randNonce;

    string public baseTokenURI;
    string public dataURI;
    string public metaDescription;
    string private imageExtension;

    event TokenMinted(address indexed owner, uint256 indexed tokenId);
    event TokenEvolved(uint256 indexed tokenId, string newStage);
    event TokenFeed(uint256 indexed tokenId, uint256 indexed newTime);

    constructor(address initialOwner, string memory name, string memory symbol) ERC721(name,symbol) Ownable(initialOwner) {
        randNonce = 0;
        newTokenId = 0;
        
    }

    function evolve(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        GrowthStage currentStage = growthStages[tokenId];
        uint256 currentTime = block.timestamp;

        if(currentStage == GrowthStage.Egg && currentTime >= growthTime[tokenId].hatch) {
            growthStages[tokenId] = GrowthStage.Hatch;
            tokens[tokenId].gender = getRandomGender();
            growthTime[tokenId].hatchling = currentTime + 2 days;
            emit TokenEvolved(tokenId, "Hatch");
        } else if(currentStage == GrowthStage.Hatch && currentTime >= growthTime[tokenId].hatchling) {
            growthStages[tokenId] = GrowthStage.Hatchling;
            growthTime[tokenId].adult = currentTime + 3 days;
            emit TokenEvolved(tokenId, "Hatchling");
        } else if(currentStage == GrowthStage.Hatchling && currentTime >= growthTime[tokenId].adult) {
            growthStages[tokenId] = GrowthStage.Adult;
            emit TokenEvolved(tokenId, "Adult");
        } else {
            revert( "Unable to evolve");
        }
    }
    
    function feeding(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        GrowthStage currentStage = growthStages[tokenId];
        GrowthTime storage time = growthTime[tokenId];
        uint256 currentTime = block.timestamp;

        if (currentStage == GrowthStage.Egg) {
            time.hatch = reduceTimeIfPossible(currentTime, time.hatch, 3 hours);
        } else if (currentStage == GrowthStage.Hatch) {
            time.hatchling = reduceTimeIfPossible(currentTime, time.hatchling, 3 hours);
        } else if (currentStage == GrowthStage.Hatchling) {
            time.adult = reduceTimeIfPossible(currentTime, time.adult, 3 hours);
        } else {
            revert("Invalid growth stage");
        }
        emit TokenFeed(tokenId, currentTime);
    }

    function reduceTimeIfPossible( uint256 currentTime,uint256 growthEndTime, uint256 reduction) internal pure returns(uint256){
        return (growthEndTime > currentTime + reduction) ? (growthEndTime - reduction) : currentTime;
    }

    function getGrowthInfo(uint256 tokenId) external view returns(GrowthStage currentStage, uint256 timeRemaining) {
        currentStage = growthStages[tokenId];
        uint256 currentTime = block.timestamp;
        uint256 endTime;

        if(currentStage == GrowthStage.Egg) {
            endTime = growthTime[tokenId].hatch;
        } else if(currentStage == GrowthStage.Hatch) {
            endTime = growthTime[tokenId].hatchling;
        } else if(currentStage == GrowthStage.Hatchling) {
            endTime = growthTime[tokenId].adult;
        } else {
            endTime = 0;
        }
        timeRemaining = (endTime > currentTime) ? (endTime - currentTime) : 0;
    }

    function mintToken(string memory _tokenType, uint256 _husbandId, uint256 _wifeId, uint256 _generation,address _owner, bool _isPremium) internal returns(uint256) {
        uint256 tokenId = ++newTokenId;
        tokens[tokenId] = Token({
            tokenType: _tokenType,
            gender:0,
            husbandId: _husbandId,
            wifeId: _wifeId,
            generation: _generation,
            isPremium: _isPremium,
            birth: block.timestamp
        });

        growthTime[tokenId].hatch = block.timestamp + 2 days;
        growthStages[tokenId] = GrowthStage.Egg;

        _safeMint(_owner, tokenId);
        userTokens[_owner].push(tokenId);

        emit TokenMinted(_owner, tokenId);

        return tokenId;
    }


    function forceEvolve(uint256 tokenId) external onlyOwner {
        GrowthStage currentStage = growthStages[tokenId];
        if(currentStage == GrowthStage.Egg) {
            growthStages[tokenId] = GrowthStage.Hatch;
            tokens[tokenId].gender = getRandomGender();
            growthTime[tokenId].hatchling = block.timestamp + 2 days;
        } else if(currentStage == GrowthStage.Hatch) {
            growthStages[tokenId] = GrowthStage.Hatchling;
            growthTime[tokenId].adult = block.timestamp + 3 days;
        } else if(currentStage == GrowthStage.Hatchling) {
            growthStages[tokenId] = GrowthStage.Adult;
        } else {
            revert("Unable to evolve");
        }
    }

    function getRandomGender() internal returns(uint) {
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,randNonce))) % 2 + 1;
    }

    function setDataURI(string calldata _dataURI) public onlyOwner {
        dataURI = _dataURI;
    }

    function setTokenURI(string calldata _tokenURI) public onlyOwner {
        baseTokenURI = _tokenURI;
    }

    function setMetaDescription(string calldata _metaDec) public onlyOwner {
        metaDescription = _metaDec;
    }

    function setImageExtension(string calldata _imgEx) public onlyOwner {
        imageExtension = _imgEx;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721,ERC721URIStorage)
        returns (string memory)
    {
        if(bytes(baseTokenURI).length > 0) {
            return string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId)));
        } else {
            string memory image;

            if(growthStages[tokenId] == GrowthStage.Egg) {
                image = string(abi.encodePacked(tokens[tokenId].tokenType,"_egg"));  
            } else {
                string memory gen;
                if(tokens[tokenId].isPremium) {
                    gen = tokens[tokenId].generation == 1 ? "g" : "b";
                } else {
                    gen = "n";
                }
                string memory gender = tokens[tokenId].gender == 1 ? "m" : "f";
                string memory stage;

                if(growthStages[tokenId] == GrowthStage.Hatch) {
                    stage = "hatch";
                } else if(growthStages[tokenId] == GrowthStage.Hatchling) {
                    stage = "hatchling";
                } else if(growthStages[tokenId] == GrowthStage.Adult){
                    stage = "adult";
                }

                image = string(abi.encodePacked(tokens[tokenId].tokenType,"_",gen, "_", gender, "_", stage));
            }

            return string(abi.encodePacked(
                "data:application/json;utf8,{\"name\": \"Dragon #",
                Strings.toString(tokenId),
                "\",\"external_url\":\"https://github.com/bchsol/CryptoDragon\",\"image\":\"",
                dataURI,
                image,
                imageExtension,
                "\",\"attributes\":[{\"trait_type\":\"Dragon\",\"value\":\"",
                tokens[tokenId].tokenType,
                "\"}]}"
            ));
        }
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}