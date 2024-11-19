// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PersonalityCalculator.sol";

contract TokenBase is ERC721, ERC721URIStorage, Ownable, PersonalityCalculator {
    enum GrowthStage{Egg, Hatch, Hatchling, Adult}
    
    struct Token {
        string tokenType;
        uint256 gender; // 1: male 2: female
        uint256 husbandId;
        uint256 wifeId;
        uint256 generation;
        bool isPremium;
        uint256 birth;

        string element;
        string personality;
    }

    struct GrowthTime {
        uint256 hatch;
        uint256 hatchling;
        uint256 adult;
    }

    mapping(uint256 => Token) internal tokens;
    mapping(uint256=> GrowthStage) private growthStages;
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

    // 토큰 진화 단계별 소요 시간 상수 정의
    uint256 private constant HATCH_DURATION = 2 days;
    uint256 private constant HATCHLING_DURATION = 3 days;
    uint256 private constant FEEDING_REDUCTION = 3 hours;


    /// @notice 토큰을 다음 단계로 진화시키는 함수
    /// Egg -> Hatch -> Hatchling -> Adult 순서로 진화
    /// 각 단계별로 필요한 시간이 지나야 진화 가능
    function evolve(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        GrowthStage currentStage = growthStages[tokenId];
        uint256 currentTime = block.timestamp;

        if(currentStage == GrowthStage.Egg && currentTime >= growthTime[tokenId].hatch) {
            _evolveToHatch(tokenId, currentTime);
        } else if(currentStage == GrowthStage.Hatch && currentTime >= growthTime[tokenId].hatchling) {
            _evolveToHatchling(tokenId, currentTime);
        } else if(currentStage == GrowthStage.Hatchling && currentTime >= growthTime[tokenId].adult) {
            _evolveToAdult(tokenId);
        } else {
            revert("Unable to evolve");
        }
    }


     /// @notice 먹이를 주어 성장 시간을 단축시키는 함수
     /// 하루에 최대 3시간까지 단축 가능
    function feeding(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        GrowthStage currentStage = growthStages[tokenId];
        GrowthTime storage time = growthTime[tokenId];
        uint256 currentTime = block.timestamp;

        if (currentStage == GrowthStage.Adult) {
            revert("Already adult");
        }

        uint256 targetTime = currentStage == GrowthStage.Egg ? time.hatch :
                            currentStage == GrowthStage.Hatch ? time.hatchling :
                            time.adult;

        uint256 newTime = reduceTimeIfPossible(currentTime, targetTime, FEEDING_REDUCTION);

        if (currentStage == GrowthStage.Egg) {
            time.hatch = newTime;
        } else if (currentStage == GrowthStage.Hatch) {
            time.hatchling = newTime;
        } else {
            time.adult = newTime;
        }

        emit TokenFeed(tokenId, newTime);
    }

    /// 내부 헬퍼 함수들
    function _evolveToHatch(uint256 tokenId, uint256 currentTime) private {
        growthStages[tokenId] = GrowthStage.Hatch;
        tokens[tokenId].gender = getRandomGender();
        growthTime[tokenId].hatchling = currentTime + HATCHLING_DURATION;
        emit TokenEvolved(tokenId, "Hatch");
    }

    function _evolveToHatchling(uint256 tokenId, uint256 currentTime) private {
        growthStages[tokenId] = GrowthStage.Hatchling;
        growthTime[tokenId].adult = currentTime + HATCH_DURATION;
        tokens[tokenId].personality = _getPersonalityString(determinePersonality(tokenId));
        emit TokenEvolved(tokenId, "Hatchling");
    }

    function _evolveToAdult(uint256 tokenId) private {
        growthStages[tokenId] = GrowthStage.Adult;
        emit TokenEvolved(tokenId, "Adult");
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


    /// @notice 새로운 토큰을 발행하는 함수
    /// @return 새로 생성된 토큰의 ID
    function mintToken(
        string memory _tokenType, 
        uint256 _husbandId, 
        uint256 _wifeId, 
        uint256 _generation,
        address _owner, 
        bool _isPremium, 
        string memory _element
    ) internal returns(uint256) {
        uint256 tokenId = ++newTokenId;
        tokens[tokenId] = Token({
            tokenType: _tokenType,
            gender:0,
            husbandId: _husbandId,
            wifeId: _wifeId,
            generation: _generation,
            isPremium: _isPremium,
            birth: block.timestamp,

            element: _element,
            personality: ""
        });

        growthTime[tokenId].hatch = block.timestamp + 2 days;
        growthStages[tokenId] = GrowthStage.Egg;

        _safeMint(_owner, tokenId);
        userTokens[_owner].push(tokenId);

        emit TokenMinted(_owner, tokenId);

        return tokenId;
    }


    /// @notice 관리자가 토큰을 강제로 진화시키는 함수
    function forceEvolve(uint256 tokenId) external onlyOwner {
        GrowthStage currentStage = growthStages[tokenId];
        if(currentStage == GrowthStage.Egg) {
            growthStages[tokenId] = GrowthStage.Hatch;
            tokens[tokenId].gender = getRandomGender();
            growthTime[tokenId].hatchling = block.timestamp + 2 days;
        } else if(currentStage == GrowthStage.Hatch) {
            growthStages[tokenId] = GrowthStage.Hatchling;
            growthTime[tokenId].adult = block.timestamp + 3 days;
            Personality personality = determinePersonality(tokenId);
            tokens[tokenId].personality = _getPersonalityString(personality);
        } else if(currentStage == GrowthStage.Hatchling) {
            growthStages[tokenId] = GrowthStage.Adult;
        } else {
            revert("Unable to evolve");
        }
    }


    /// @notice 성격 타입을 문자열로 변환하는 내부 함수
    /// @return 성격을 나타내는 문자열
    function _getPersonalityString(Personality personality) internal pure returns (string memory) {
        if (personality == Personality.Naive) return "Naive";
        if (personality == Personality.Rash) return "Rash";
        if (personality == Personality.Hasty) return "Hasty";
        if (personality == Personality.QuickWitted) return "QuickWitted";
        if (personality == Personality.Brave) return "Brave";
        if (personality == Personality.Quirky) return "Quirky";
        if (personality == Personality.Adamant) return "Adamant";
        if (personality == Personality.Bold) return "Bold";
        if (personality == Personality.Quiet) return "Quiet";
        if (personality == Personality.Calm) return "Calm";
        if (personality == Personality.Careful) return "Careful";
        if (personality == Personality.Hardy) return "Hardy";
        if (personality == Personality.Docile) return "Docile";
        if (personality == Personality.Bashful) return "Bashful";
        if (personality == Personality.Lax) return "Lax";
        if (personality == Personality.Smart) return "Smart";
        revert("Invalid personality");
    }


    /// @notice 랜덤한 성별을 생성하는 내부 함수
    /// @return 1(수컷) 또는 2(암컷)의 값
    function getRandomGender() internal returns(uint) {
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,randNonce))) % 2 + 1;
    }

    
    /// @notice 토큰 메타데이터의 기본 URI를 설정하는 함수
    /// @param _dataURI 설정할 데이터 URI
    function setDataURI(string calldata _dataURI) public onlyOwner {
        dataURI = _dataURI;
    }

    
    /// @notice 토큰의 URI를 설정하는 함수
    /// @param _tokenURI 설정할 토큰 URI
    function setTokenURI(string calldata _tokenURI) public onlyOwner {
        baseTokenURI = _tokenURI;
    }

    /// @notice 메타데이터 설명을 설정하는 함수
    /// @param _metaDec 설정할 메타데이터 설명
    function setMetaDescription(string calldata _metaDec) public onlyOwner {
        metaDescription = _metaDec;
    }

    /// @notice 이미지 확장자를 설정하는 함수
    /// @param _imgEx 설정할 이미지 확장자
    function setImageExtension(string calldata _imgEx) public onlyOwner {
        imageExtension = _imgEx;
    }


    /// @notice 토큰의 메타데이터 URI를 조회하는 함수
    /// @return 토큰의 메타데이터 URI 문자열
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
                "\"}, {\"trait_type\":\"Element\",\"value\":\"",
                tokens[tokenId].element,
                "\"}, {\"trait_type\":\"Personality\",\"value\":\"",
                tokens[tokenId].personality,
                "\"}]}"
            ));
        }
    }
    

    /// @notice 인터페이스 지원 여부를 확인하는 함수
    /// @return 지원 여부 (bool)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}