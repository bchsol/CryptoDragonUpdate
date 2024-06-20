// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DragonDrink is ERC20,Ownable {
    address public questContract;
    address public dailyCheckContract;

    constructor(address initialOwner) ERC20("DragonDrink", "DDK") Ownable(initialOwner){

    }

    function setQuestContract(address _questContract) external onlyOwner {
        questContract = _questContract;
    }

    function setDailyCheckContract(address _dailyCheckContract) external onlyOwner {
        dailyCheckContract = _dailyCheckContract;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == questContract || msg.sender == dailyCheckContract, "Only the quest contract can mint tokens");
        _mint(to, amount * (10**decimals()));
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // Override the transfer functions to disable transfers
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        revert("Transfers are disabled");
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        revert("Transfers are disabled");
    }
}