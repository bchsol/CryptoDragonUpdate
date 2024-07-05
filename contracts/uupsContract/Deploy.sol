// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./Token.sol";

contract Deploy {
    ERC1967Proxy public proxy;
    Token public token;

    constructor(address initialOwner, address _tokenTypeManager) {
        token = new Token();

        // Deploy the proxy contract and initialize Token
        proxy = new ERC1967Proxy(address(token), abi.encodeWithSelector(Token.initialize.selector, initialOwner, _tokenTypeManager, "Dragon", "D"));
    }
}