// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DragonDrink is ERC20, Ownable {
    mapping(address => bool) private allowedAddresses;

    event MintTokens(address indexed to, uint256 amount);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender){
        
    }

    function setAllowedAddress(address addr, bool allowed) external onlyOwner {
        allowedAddresses[addr] = allowed;
    }

    function isAllowedAddress(address addr) public view returns(bool) {
        return allowedAddresses[addr];
    }

    function mint(address to, uint256 amount) external {
        require(isAllowedAddress(msg.sender), "Only the auth contract can mint tokens");
        _mint(to, amount * (10**decimals()));

        emit MintTokens(to, amount);
    }

    function AdminMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * (10**decimals()));
    }

    function burn(address to, uint256 amount) external {
        require(isAllowedAddress(msg.sender) , "Only the auth contract can mint tokens");
        _burn(to,amount * (10**decimals()));
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(isAllowedAddress(recipient), "This address is not allowed.");
        bool result = super.transfer(recipient, amount);
        return result;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(isAllowedAddress(recipient), "This address is not allowed.");
        bool result = super.transferFrom(sender, recipient, amount);
        return result;
    }
}