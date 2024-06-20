// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Interfaces/IToken.sol";
import "../Interfaces/IQuest.sol";

contract Exploration {
    IToken public tokenContract;
    IQuest public questContract;
    constructor(address _tokenContract, address _questContract) {
        tokenContract = IToken(_tokenContract);
        questContract = IQuest(_questContract);
    }

    function explore(address user) external {
        require(hasAdultToken(msg.sender), "You must own at least five adult NFT to explore.");

        //uint256 reward = getRandomReward();

        questContract.exploreCheck(user);
    }

    function hasAdultToken(address user) internal view returns(bool){
        uint256[] memory tokenIds = tokenContract.getUserNftIds(user);
        uint256 adultCount = 0;

       for (uint256 i = 0; i < tokenIds.length; i++) {
            (IToken.GrowthStage currentStage, ) = tokenContract.getGrowthInfo(tokenIds[i]);
            if (currentStage == IToken.GrowthStage.Adult) {
                adultCount += 1;
                if(adultCount >= 5) {
                    return true;
                }
            }
        }
        return false;
    }

    function getRandomReward() internal view returns(uint256) {
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;

        if(randomValue < 50) {
            return 1;
        } else if(randomValue < 80) {
            return 2;
        } else {
            return 3;
        }
    }
}