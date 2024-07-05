// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Interfaces/IDragonDrink.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Quest is Ownable {
    IDragonDrink public drinkContract;
    
    mapping(address => uint256) private lastBattleCompletionTime;
    mapping(address => uint256) private lastExploreCompletionTime;

    mapping(address => bool) private requestBattle;
    mapping(address => bool) private requestExplore;

    address public battleContract;
    address public exploreContract;

    uint256 public battleReward = 100;
    uint256 public exploreReward = 100;

    constructor(address initialOwner, address _drinkContract) Ownable(initialOwner){
        drinkContract = IDragonDrink(_drinkContract);
    }

    modifier onlyAuthorized(address contractAddress) {
        require(msg.sender == contractAddress, "Unauthorized access");
        _;
    }

    modifier questCooldown(uint256 lastCompletionTime) {
        require(lastCompletionTime < today(), "Quest is still on cooldown");
        _;
    }

    function battleCheck(address user) 
        external
        onlyAuthorized(battleContract)
        questCooldown(lastBattleCompletionTime[user])
    {
        lastBattleCompletionTime[user] = today();
        requestBattle[user] = true;
    }

    function exploreCheck(address user) 
        external
        onlyAuthorized(exploreContract)
        questCooldown(lastExploreCompletionTime[user])
    {
        lastExploreCompletionTime[user] = today();
        requestExplore[user] = true;
    }

    function requestBattleReward() external {
        require(requestBattle[msg.sender], "battle incompleted");
        requestBattle[msg.sender] = false;
        mintTokens(msg.sender, battleReward); 
    }

    function requestExploreReward() external {
        require(requestExplore[msg.sender], "exploraion incompleted");
        requestExplore[msg.sender] = false;
        mintTokens(msg.sender, exploreReward);
    }

    function requestAllReward() external {
        require(requestBattle[msg.sender] && requestExplore[msg.sender], "battle or exploration incompleted");
        requestBattle[msg.sender] = false;
        requestExplore[msg.sender] = false;
        mintTokens(msg.sender, battleReward + exploreReward);
    }

    function mintTokens(address user, uint256 amount) internal {
        drinkContract.mint(user, amount);
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

    function today() internal view returns(uint) {
        return block.timestamp / 1 days;
    }

}