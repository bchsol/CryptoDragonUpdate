// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Interfaces/IDragonDrink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Quest is Ownable {

    struct QuestData{
        bool dailyCheck;
        bool exploration;
        bool battle;
    }

    IDragonDrink public drinkContract;
    mapping(address => uint256) public lastCheckCompletionTime;
    mapping(address => QuestData) private completedQuests;

    mapping(address => uint256) public lastBattleCompletionTime;
    mapping(address => uint256) public lastExploreCompletionTime;

    address public battleContract;
    address public exploreContract;
    address public dailyCheckContract;

    uint256 public battleReward = 100;
    uint256 public exploreReward = 100;

    event TokensMinted(address indexed user, uint256 amount);

    constructor(address initialOwner, address _drinkContract) Ownable(initialOwner){
        drinkContract = IDragonDrink(_drinkContract);
    }

    modifier onlyAuthorized(address contractAddress) {
        require(msg.sender == contractAddress, "Unauthorized access");
        _;
    }

    modifier questCooldown(address user, uint256 lastCompletionTime) {
        require(lastCompletionTime < today(), "Quest is still on cooldown");
        _;
    }

    function dailyCheck(address user) 
        external 
        onlyAuthorized(dailyCheckContract)
        questCooldown(user, lastCheckCompletionTime[user])
        returns (bool)
    {
        lastCheckCompletionTime[user] = today();
        completedQuests[user].dailyCheck = true;
        return true;
    }

    function battleCheck(address user) 
        external
        onlyAuthorized(battleContract)
        questCooldown(user, lastBattleCompletionTime[user])
    {
        lastBattleCompletionTime[user] = today();
        completedQuests[user].battle = true;
        mintTokens(user,battleReward);
    }

    function exploreCheck(address user) 
        external
        onlyAuthorized(exploreContract)
        questCooldown(user,lastExploreCompletionTime[user])
    {
        lastExploreCompletionTime[user] = today();
        completedQuests[user].exploration = true;

        mintTokens(user, exploreReward);
    }

    function mintTokens(address user, uint256 amount) internal {
        drinkContract.mint(msg.sender, amount);
        emit TokensMinted(msg.sender , amount);
    }

    function getQuestData(address user) external view returns(QuestData memory) {
        return completedQuests[user];
    }

    function setBattleContract(address _battleContract) external onlyOwner {
        battleContract = _battleContract;
    } 

    function setExploreContract(address _exploreContract) external onlyOwner {
        exploreContract = _exploreContract;
    }

    function setDailyCheckContract(address _dailyCheckContract) external onlyOwner {
        dailyCheckContract = _dailyCheckContract;
    }

    function today() public view returns(uint) {
        return block.timestamp / 1 days;
    }

}