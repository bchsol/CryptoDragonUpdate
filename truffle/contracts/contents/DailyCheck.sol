// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Interfaces/IQuest.sol";
import "../Interfaces/IDragonDrink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title 일일 출석 체크 및 보상 컨트랙트
/// @notice 사용자의 일일 출석과 연속 출석에 대한 보상을 관리
contract DailyCheck is Ownable {
    // 상태 변수
    IQuest public questContract;
    IDragonDrink public drinkContract;

    uint256 public dailyCheckReward = 100;
    uint256 public consecutiveReward = 500;

    // 사용자별 연속 출석 횟수
    mapping(address => uint256) private consecutiveDailyChecks;
    // 사용자별 마지막 출석 시간
    mapping(address => uint256) private lastConsecutiveCheckTime;

    event DailyCheckCompleted(address indexed user, uint256 reward, uint256 consecutiveCount);
    event ConsecutiveRewardClaimed(address indexed user, uint256 reward);
    event RewardUpdated(string rewardType, uint256 newAmount);

    constructor(address _questContract, address _drinkContract) Ownable(msg.sender) {
        questContract = IQuest(_questContract);
        drinkContract = IDragonDrink(_drinkContract);
    }

    /// @notice 일일 출석 체크를 수행하고 보상을 지급
    /// @dev 하루에 한 번만 호출 가능
    function dailyCheck() external {
        uint256 currentDay = today();
        require(lastConsecutiveCheckTime[msg.sender] < currentDay, "already daily check");

        updateConsecutiveChecks(msg.sender);
        
        mintTokens(msg.sender, dailyCheckReward);
        emit DailyCheckCompleted(msg.sender, dailyCheckReward, consecutiveDailyChecks[msg.sender]);

        if(consecutiveDailyChecks[msg.sender] == 7) {
            mintTokens(msg.sender, consecutiveReward);
            emit ConsecutiveRewardClaimed(msg.sender, consecutiveReward);
            consecutiveDailyChecks[msg.sender] = 0;
        }
    }

    /// @notice 연속 출석 상태를 업데이트
    /// @param user 업데이트할 사용자 주소
    function updateConsecutiveChecks(address user) internal {
        uint256 currentDay = today();
        if(lastConsecutiveCheckTime[user] == currentDay - 1) {
            consecutiveDailyChecks[user]++;
        } else {
            consecutiveDailyChecks[user] = 1;
        }
        lastConsecutiveCheckTime[user] = currentDay;
    }

    /// @notice 토큰 보상 지급
    /// @param user 보상을 받을 사용자 주소
    /// @param amount 지급할 토큰 양
    function mintTokens(address user, uint256 amount) internal {
        drinkContract.mint(user, amount);
    }

    /// @notice 일일 출석 보상 금액 설정
    /// @param amount 새로운 보상 금액
    function setDailyCheckReward(uint256 amount) external onlyOwner {
        dailyCheckReward = amount;
        emit RewardUpdated("daily", amount);
    }
    
    /// @notice 연속 출석 보상 금액 설정
    /// @param amount 새로운 보상 금액
    function setConsecutiveReward(uint256 amount) external onlyOwner {
        consecutiveReward = amount;
        emit RewardUpdated("consecutive", amount);
    }

    /// @notice Quest 컨트랙트 주소 업데이트
    function setQuestContract(address _questContract) external onlyOwner {
        require(_questContract != address(0), "Invalid address");
        questContract = IQuest(_questContract);
    }

    /// @notice DragonDrink 컨트랙트 주소 업데이트
    function setDrinkContract(address _drinkContract) external onlyOwner {
        require(_drinkContract != address(0), "Invalid address");
        drinkContract = IDragonDrink(_drinkContract);
    }

    /// @notice 사용자의 현재 연속 출석 횟수 조회
    /// @param user 조회할 사용자 주소
    /// @return 연속 출석 횟수
    function getConsecutiveDailyChecks(address user) external view returns (uint256) {
        return consecutiveDailyChecks[user];
    }

    /// @notice 현재 날짜를 일 단위로 반환
    /// @return 현재 타임스탬프를 일 단위로 변환한 값
    function today() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }
}