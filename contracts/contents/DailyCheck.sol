// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Interfaces/IQuest.sol";
import "../Interfaces/IDragonDrink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DailyCheck is Ownable{
    IQuest public questContract;
    IDragonDrink public drinkContract;

    uint256 public dailyCheckReward = 100;
    uint256 public consecutiveReward = 500;

    mapping(address => uint256) private consecutiveDailyChecks;
    mapping(address => uint256) private lastConsecutiveCheckTime;

    constructor(address initialOwner, address _questContract, address _drinkContract) Ownable(initialOwner) {
        questContract = IQuest(_questContract);
        drinkContract = IDragonDrink(_drinkContract);
    }

    function dailyCheck() external {
        require(lastConsecutiveCheckTime[msg.sender] < today(), "already daily check");

        updateConsecutiveChecks(msg.sender);

        mintTokens(msg.sender, dailyCheckReward);

        if(consecutiveDailyChecks[msg.sender] == 7) {
            mintTokens(msg.sender, consecutiveReward);
            consecutiveDailyChecks[msg.sender] = 0;
        }
    }

    function updateConsecutiveChecks(address user) internal {
        if(lastConsecutiveCheckTime[user] == today() - 1) {
            consecutiveDailyChecks[user]++;
        } else {
            consecutiveDailyChecks[user] = 1;
        }
        lastConsecutiveCheckTime[user] = today();
    }

    function mintTokens(address user, uint256 amount) internal {
        drinkContract.mint(user, amount);
    }

    function setDailyCheckReward(uint256 amount) external onlyOwner {
        dailyCheckReward = amount;
    }
    
    function setConsecutiveReward(uint256 amount) external onlyOwner {
        consecutiveReward = amount;
    }

    function getConsecutiveDailyChecks(address user) external view returns (uint256) {
        return consecutiveDailyChecks[user];
    }

    function today() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }
}