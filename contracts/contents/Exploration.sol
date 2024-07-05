// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Interfaces/IToken.sol";
import "../Interfaces/IQuest.sol";
import "../Interfaces/IDragonDrink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Exploration is Ownable{
    IToken public tokenContract;
    IQuest public questContract;
    IDragonDrink public drinkContract;

    mapping(address => uint256) private dailyExploreCount;
    mapping(address => uint256) private lastExploreTime;

    uint256 public dailyExploreLimit = 1;
    uint256 public minAdultToken = 5;

    constructor(address _tokenContract, address _questContract, address _drinkContract) Ownable(msg.sender){
        tokenContract = IToken(_tokenContract);
        questContract = IQuest(_questContract);
        drinkContract = IDragonDrink(_drinkContract);
    }

    modifier exploreLimitCheck(address player) {
        require(dailyExploreCount[player] < dailyExploreLimit, "Daily battle limit reached");
        _;
    }

    modifier resetDailyExploreCount(address player) {
        if (lastExploreTime[player] < today()) {
            dailyExploreCount[player] = 0;
        }
        _;
    }

    function explore() external resetDailyExploreCount(msg.sender) exploreLimitCheck(msg.sender) {
        require(hasAdultToken(msg.sender), "You must own at least five adult NFT to explore.");

        lastExploreTime[msg.sender] = today();
        dailyExploreCount[msg.sender]++;

        bool questData = questContract.getBattleCompleted(msg.sender);
        if(!questData) {
            questContract.exploreCheck(msg.sender);
        }
        
        uint256 reward = getRandomReward();

        drinkContract.mint(msg.sender, reward);
    }
    
    function hasAdultToken(address user) internal view returns(bool){
        uint256[] memory tokenIds = tokenContract.getUserNftIds(user);
        uint256 adultCount = 0;

       for (uint256 i = 0; i < tokenIds.length; i++) {
            (IToken.GrowthStage currentStage, ) = tokenContract.getGrowthInfo(tokenIds[i]);
            if (currentStage == IToken.GrowthStage.Adult) {
                adultCount++;
                if(adultCount >= minAdultToken) {
                    return true;
                }
            }
        }
        return false;
    }

    function getRandomReward() internal view returns(uint256) {
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;

        if(randomValue < 70) {
            return 100;
        } else if(randomValue < 95) {
            return 200;
        } else {
            return 300;
        }
    }

    function setMinAdultToken(uint256 _minAdultToken) external onlyOwner {
        minAdultToken = _minAdultToken;
    }

    function setDailyExploreLimit(uint256 limit) external onlyOwner {
        dailyExploreLimit = limit;
    }

    function today() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }
}