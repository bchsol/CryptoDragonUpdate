// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Interfaces/IDragonDrink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Quest is Ownable {
    IDragonDrink public immutable drinkContract;
    
    mapping(address => uint256) private lastBattleCompletionTime;
    mapping(address => uint256) private lastExploreCompletionTime;

    mapping(address => bool) private requestBattle;
    mapping(address => bool) private requestExplore;

    address public battleContract;
    address public exploreContract;

    uint256 public battleReward;
    uint256 public exploreReward;


    constructor(address _drinkContract) Ownable(msg.sender) {
        drinkContract = IDragonDrink(_drinkContract);
        battleReward = 100;
        exploreReward = 100;
    }

    modifier onlyAuthorized(address contractAddress) {
        require(msg.sender == contractAddress, "Unauthorized access");
        _;
    }

    modifier questCooldown(uint256 lastCompletionTime) {
        require(lastCompletionTime < today(), "Quest is still on cooldown");
        _;
    }

    /// @notice 전투 퀘스트 완료 확인 및 보상 요청 설정
    function battleCheck(address user) 
        external
        onlyAuthorized(battleContract)
        questCooldown(lastBattleCompletionTime[user])
    {
        uint256 currentDay = today();
        lastBattleCompletionTime[user] = currentDay;
        requestBattle[user] = true;
    }

    /// @notice 탐험 퀘스트 완료 확인 및 보상 요청 설정
    function exploreCheck(address user) 
        external
        onlyAuthorized(exploreContract)
        questCooldown(lastExploreCompletionTime[user])
    {
        uint256 currentDay = today();
        lastExploreCompletionTime[user] = currentDay;
        requestExplore[user] = true;
    }

    /// @notice 전투 퀘스트 보상 요청 처리
    function requestBattleReward() external {
        require(requestBattle[msg.sender], "Battle quest not completed");
        requestBattle[msg.sender] = false;
        mintTokens(msg.sender, battleReward); 
    }

    /// @notice 탐험 퀘스트 보상 요청 처리
    function requestExploreReward() external {
        require(requestExplore[msg.sender], "Exploration quest not completed");
        requestExplore[msg.sender] = false;
        mintTokens(msg.sender, exploreReward);
    }

    /// @notice 모든 퀘스트 보상 한번에 요청 처리
    function requestAllReward() external {
        require(
            requestBattle[msg.sender] && requestExplore[msg.sender], 
            "Both quests must be completed"
        );
        
        requestBattle[msg.sender] = false;
        requestExplore[msg.sender] = false;
        mintTokens(msg.sender, battleReward + exploreReward);
    }

    /// @notice 사용자에게 보상 토큰 발행
    function mintTokens(address user, uint256 amount) internal {
        drinkContract.mint(user, amount);
    }

    /// @notice 오늘 날짜 타임스탬프 계산 (일 단위)
    function today() internal view returns(uint256) {
        return block.timestamp / 1 days;
    }

    function getBattleCompleted(address user) external view returns(bool) {
        return lastBattleCompletionTime[user] == today();
    }
    
    function getExploreCompleted(address user) external view returns(bool) {
        return lastExploreCompletionTime[user] == today();
    }

    function setBattleContract(address _battleContract) external onlyOwner {
        battleContract = _battleContract;
    } 

    function setExploreContract(address _exploreContract) external onlyOwner {
        exploreContract = _exploreContract;
    }

}