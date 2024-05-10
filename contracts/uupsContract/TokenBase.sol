// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TokenBase is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    enum GrowthStage{Egg, Hatch, Hatchling, Adult}
    mapping(uint256=>GrowthStage) private growthStages;

    struct Token {
        string tokenType;
        uint256 gender; // 1: male 2: female
        uint256 husbandId;
        uint256 wifeId;
        uint256 generation;
        uint256 birth;
    }

    struct GrowthTime {
        uint256 hatch;
        uint256 hatchling;
        uint256 adult;
    }

    mapping(uint256 => Token) internal tokens;
    mapping(uint256 => GrowthTime) internal growthTime;
    mapping(address => uint256[]) internal userTokens;
    uint256 internal newTokenId;
    uint256 private randNonce;
    
    string public baseTokenURI;
    string public dataURI;
    string public metaDescription;

    string private imageExtension;

    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner, string memory name, string memory symbol) initializer public {
        __ERC721_init(name, symbol);
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        randNonce = 0;
    }

    function evolve(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        GrowthStage currentStage = growthStages[tokenId];

        if(currentStage == GrowthStage.Egg && block.timestamp >= growthTime[tokenId].hatch) {
            growthStages[tokenId] = GrowthStage.Hatch;
            tokens[tokenId].gender = getRandomGender();
            growthTime[tokenId].hatchling = block.timestamp + 2 days;
        } else if(currentStage == GrowthStage.Hatch && block.timestamp >= growthTime[tokenId].hatchling) {
            growthStages[tokenId] = GrowthStage.Hatchling;
            growthTime[tokenId].adult = block.timestamp + 3 days;
            
        } else if(currentStage == GrowthStage.Hatchling && block.timestamp >= growthTime[tokenId].adult) {
            growthStages[tokenId] = GrowthStage.Adult;
            
        } else {
            require(false, "Unable to evolve");
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

    function mintToken(string memory _tokenType, uint256 _husbandId, uint256 _wifeId, uint256 _generation, address _owner) internal returns(uint256) {
        Token memory token = Token({
            tokenType: _tokenType,
            gender: 0,
            husbandId: _husbandId,
            wifeId: _wifeId,
            generation: _generation,
            birth: block.timestamp
        });
        newTokenId++;
        tokens[newTokenId] = token;

        growthTime[newTokenId].hatch = token.birth + 2 days;

        growthStages[newTokenId] = GrowthStage.Egg;

        _safeMint(_owner, newTokenId);

        userTokens[_owner].push(newTokenId);

        return newTokenId;
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
            require(false, "Unable to evolve");
        }
    }

    function getRandomGender() internal returns(uint) {
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,randNonce))) % 2 + 1;
    }

    function setDataURI(string memory _dataURI) public onlyOwner {
        dataURI = _dataURI;
    }

    function setTokenURI(string memory _tokenURI) public onlyOwner {
        baseTokenURI = _tokenURI;
    }

    function setMetaDescription(string memory _metaDec) public onlyOwner {
        metaDescription = _metaDec;
    }

    function setImageExtension(string memory _imgEx) public onlyOwner {
        imageExtension = _imgEx;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable,ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        string memory image;
        

        if(bytes(baseTokenURI).length > 0) {
            return string.concat(baseTokenURI, Strings.toString(tokenId));
        } else {
            if(growthStages[tokenId] == GrowthStage.Egg) {
                image = string(abi.encodePacked(tokens[tokenId].tokenType,"_egg"));  
            } else {
                string memory gen = tokens[tokenId].generation == 1 ? "g" : "b";
                string memory gender = tokens[tokenId].gender == 1 ? "m" : "f";
                string memory stage;

                GrowthStage currentStage = growthStages[tokenId];
                if(currentStage == GrowthStage.Hatch) {
                    stage = "hatch";
                } else if(currentStage == GrowthStage.Hatchling) {
                    stage = "hatchling";
                } else if(currentStage == GrowthStage.Adult){
                    stage = "adult";
                }

                image = string(abi.encodePacked(tokens[tokenId].tokenType,"_",gen, "_", gender, "_", stage));
            }
            
            string memory jsonPreImage = string(
            abi.encodePacked(
                '{"name": "Dragon #',
                Strings.toString(tokenId),
                metaDescription,
                '","external_url":"https://github.com/bchsol/CryptoDragon","image":"',
                dataURI,
                string.concat(image,imageExtension)
            )
            );
            string memory nftMetaProperty = string(abi.encodePacked('","attributes":[{"trait_type":"Dragon","value":"', tokens[tokenId].tokenType));
            string memory jsonPostTraits = '"}]}';

            return string(abi.encodePacked("data:application/json;utf8,", jsonPreImage, nftMetaProperty, jsonPostTraits));
            
            // string memory jsonPreImage = string.concat(
            //     string.concat(string.concat('{"name": "Dragon #', Strings.toString(tokenId)),
            //         metaDescription,'","external_url":"https://https://github.com/bchsol/CryptoDragon","image":"'),
            //         string.concat(dataURI, image));
                
            //     string memory nftMetaProperty = string.concat('","attributes":[{"trait_type":"Dragon","value":"',
            //     tokens[tokenId].tokenType
            // );
            // string memory jsonPostTraits = '"}]}';

            // return string.concat( "data:application/json;utf8,", string.concat(string.concat(jsonPreImage, nftMetaProperty), jsonPostTraits));
        }
        
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}