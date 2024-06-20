// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IToken {
    enum GrowthStage {Egg, Hatch, Hatchling, Adult}
    
    function ownerOf(uint256 tokenId) external view returns (address);
    function getGrowthInfo(uint256 tokenId) external view returns(GrowthStage currentStage, uint256 timeRemaining);
    function getUserNftIds(address user) external view returns (uint256[] memory);
}