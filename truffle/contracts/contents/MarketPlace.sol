// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../Interfaces/IToken.sol";

contract Marketplace is  Ownable, ERC721Holder, ERC1155Holder {
    uint128 public _saleIds;
    uint128 public _saleSold;
    uint128 public _auctionIds;
    uint128 public _auctionItemsSold;

    uint256 public marketFeePer;

    IERC20 public paymentToken;

    struct MarketItem {
        uint128 itemId;
        address owner;
        address tokenAddress;
        uint256 tokenId;
        uint256 price;
        uint256 startTime;
        uint256 endTime;
        uint256 quantity;
        bool sold;
        bool cancel;
        bool isERC721;
    }

    struct AuctionItem {
        uint128 itemId;
        address owner;
        address tokenAddress;
        uint256 tokenId;
        uint256 reservePrice;
        uint256 startTime;
        uint256 endTime;
        bool sold;
        bool cancel;
    }

    struct Bid {
        uint256 price;
        uint256 timestamp;
    }

    // itemId => ItemInfo
    mapping(uint256 => MarketItem) public items;
    // auctionId => auctionItemInfo
    mapping(uint256 => AuctionItem) public auctionItems;
    // auctionId => bidder Address
    mapping(uint256 => mapping(address => Bid)) public bids;
    // auctionId => highest bidder address 
    mapping(uint256 => address) public highestBidder;
    // auctionId
    mapping(uint256 => bool) public claimed;
    // userAddress => funds
    mapping(address => uint256) private claimableFunds;
    // erc721 or erc1155 contract
    mapping(address => bool) public approvalContract;
    // token contract => token id for marketplace listings
    mapping(address => mapping(uint256 => bool)) private listedInMarket;
    // token contract => token id for auction listings
    mapping(address => mapping(uint256 => bool)) private listedInAuction;
    // token contract => token id => market id
    mapping(address => mapping(uint256 => uint128)) public tokenToItemId;
    // token contract => token id => auction id
    mapping(address => mapping(uint256 => uint128)) public tokenToAuctionId;

    event MarketItemListed(uint128 itemId, address tokenAddress, uint256 tokenId, address owner, uint256 price, uint256 quantity, bool isERC721);
    event MarketItemDelisted(uint128 itemId, uint256 tokenId, address owner, uint256 price);
    event MarketItemBought(uint128 itemId, address tokenAddress, uint256 tokenId, address owner, address buyer, uint256 price, uint256 quantity);
    event AuctionListed(uint128 autionId, address tokenAddress, uint256 tokenId, address owner, uint256 reservePrice, uint256 startTime, uint256 endTime);
    event AuctionBid(uint128 auctionId, uint256 price, uint256 bidTime);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        marketFeePer = 25;
    }

    modifier onlyApprovedToken(address tokenAddress) {
    require(approvalContract[tokenAddress], "Not approved address");
    _;
    }


    modifier onlyItemOwner(uint128 itemId) {
    require(items[itemId].owner == msg.sender, "You are not the owner");
    _;
    }

    function listItem(
        address tokenAddress, 
        uint256 tokenId, 
        uint256 endTime, 
        uint256 price, 
        uint256 quantity, 
        bool isERC721
        ) external onlyApprovedToken(tokenAddress){
        require(price > 0, "Price must be at least 1 wei");
        require(quantity > 0, "Quantity must be at least 1");
        require(isERC721 ? quantity == 1 : true, "Only one ERC721 token can be listed");
        require(!listedInMarket[tokenAddress][tokenId], "Item is already listed");

        IToken tokenContract = IToken(tokenAddress);
        if(isERC721) {
            require(tokenContract.ownerOf(tokenId) == msg.sender, "You are not the owner");
        } else {
            require(tokenContract.balanceOf(msg.sender, tokenId) >= quantity, "Insufficient token balance");
        }
        require(tokenContract.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved"); 

        unchecked {
            _saleIds++;
        }
        uint128 itemId = _saleIds;

        items[itemId] = MarketItem({
            itemId: itemId,
            owner: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            price: price,
            startTime: block.timestamp,
            endTime: block.timestamp + endTime,
            quantity: quantity,
            sold: false,
            cancel: false,
            isERC721: isERC721
        });

        listedInMarket[tokenAddress][tokenId] = true;
        tokenToItemId[tokenAddress][tokenId] = itemId;

        emit MarketItemListed(itemId, tokenAddress, tokenId, msg.sender, price, quantity, isERC721);
    }

    function unlistItem(uint128 itemId) external onlyItemOwner(itemId){
        MarketItem storage item = items[itemId];
        item.cancel = true;
        listedInMarket[item.tokenAddress][item.tokenId] = false;

        emit MarketItemDelisted(itemId, item.tokenId, msg.sender, item.price);
    }

    function buyItem(uint128 itemId, uint256 quantity) external payable {
        require(getSaleStatus(itemId) == "ACTIVE", "Not Active");

        MarketItem storage item = items[itemId];

        require(!item.sold && !item.cancel, "Item is not for sale");
        require(item.quantity >= quantity, "Not enough quantity available");
        require(paymentToken.balanceOf(msg.sender) >= item.price * quantity, "Insufficient funds");
        require(paymentToken.allowance(msg.sender, address(this)) >= item.price * quantity, "Insufficient allowance");

        uint256 totalPrice = item.price * quantity;
        (uint256 fee, uint256 sellerProceeds) = _calculateFee(totalPrice);

        IToken tokenContract = IToken(item.tokenAddress);

        item.quantity -= quantity;
        if(item.quantity == 0) {
            item.sold = true;
            unchecked{
                _saleSold++;
            }
        }

        listedInMarket[item.tokenAddress][item.tokenId] = false;
        tokenToItemId[item.tokenAddress][item.tokenId] = 0;

        if(item.isERC721){
            tokenContract.safeTransferFrom(item.owner, msg.sender, item.tokenId,"");
        } else {
            tokenContract.safeTransferFrom(item.owner, msg.sender, item.tokenId, quantity, "");
        }

        require(paymentToken.transferFrom(msg.sender, address(this), totalPrice), "Transfer failed");
        claimableFunds[owner()] += fee;
        claimableFunds[item.owner] += sellerProceeds;

        emit MarketItemBought(itemId, item.tokenAddress, item.tokenId, item.owner, msg.sender, item.price, quantity);
    }


    /// Auction Fuction
    /// only ERC721
    function listAuction(
        address tokenAddress,
        uint256 tokenId, 
        uint256 endTime,
        uint256 reservePrice
    ) external onlyApprovedToken(tokenAddress){
            require(reservePrice > 0, "Price must be at least 1 wei");
            IToken tokenContract = IToken(tokenAddress);
            require(tokenContract.ownerOf(tokenId) == msg.sender, "You are not the owner");
            require(tokenContract.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");
            require(!listedInAuction[tokenAddress][tokenId], "Item is already listed");

            unchecked {
                _auctionIds++;
            }
            uint128 auctionId = _auctionIds;

            auctionItems[auctionId] = AuctionItem({
            itemId: auctionId,
            owner: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            reservePrice: reservePrice,
            startTime: block.timestamp,
            endTime: block.timestamp + endTime,
            sold: false,
            cancel: false
            });

            listedInAuction[tokenAddress][tokenId] = true;
            tokenToAuctionId[tokenAddress][tokenId] = auctionId;

            emit AuctionListed(auctionId, tokenAddress, tokenId, msg.sender, reservePrice, block.timestamp,  block.timestamp + endTime);
    }

    function bid(uint128 auctionId, uint256 price) external payable{
        require(getAuctionStatus(auctionId) == "ACTIVE", "Auction not Active");

        address lastHighestBidder = highestBidder[auctionId];
        uint256 lastHighestPrice = bids[auctionId][lastHighestBidder].price;

        require(msg.sender != lastHighestBidder, "Already highest bidder");
        require(msg.sender != auctionItems[auctionId].owner, "You're owner");
        require(price > lastHighestPrice, "Bid price too low");
        require(price >= auctionItems[auctionId].reservePrice, "Bid below reserve price");

        require(paymentToken.transferFrom(msg.sender, address(this), price), "Transfer failed");

        delete bids[auctionId][lastHighestBidder];
        claimableFunds[lastHighestBidder] += lastHighestPrice;

        bids[auctionId][msg.sender] = Bid({price :price, timestamp: block.timestamp});
        highestBidder[auctionId] = msg.sender;

        emit AuctionBid(auctionId, price, block.timestamp);
    }

    function resolveAuction(uint128 auctionId) external {
        require(!claimed[auctionId], "Already claimed");
        
        bytes32 status = getAuctionStatus(auctionId);
        require(status == "CANCELED" || status == "ENDED", "Auction is still active");

        AuctionItem storage auction = auctionItems[auctionId];

        address seller = auction.owner;
        address winner = highestBidder[auctionId];
        uint256 winningBid = bids[auctionId][winner].price;

        (uint256 fee, uint256 sellerProceeds) = _calculateFee(winningBid);

        IToken tokenContract = IToken(auction.tokenAddress);

        claimed[auctionId] = true;
        listedInAuction[auction.tokenAddress][auction.tokenId] = false;
        tokenToAuctionId[auction.tokenAddress][auction.tokenId] = 0;

        unchecked{
            _auctionItemsSold++;
        }
        
        if (status == "CANCELED" || (status == "ENDED" && winner == address(0))) {
            auctionItems[auctionId].cancel = true;
        } else if (status == "ENDED" && winner != address(0)) {
            auctionItems[auctionId].sold = true;
            tokenContract.safeTransferFrom(seller, winner, auction.tokenId,"");
            claimableFunds[owner()] += fee;
            claimableFunds[seller] += sellerProceeds;
        }
    }

    function withdrawFunds() external {
        uint256 funds = claimableFunds[msg.sender];
        require(funds > 0, "No funds to claim");

        claimableFunds[msg.sender] = 0;
        require(paymentToken.transfer(msg.sender, funds), "Withdraw failed");
    }

    function cancelAuction(uint128 auctionId) external {
        require(msg.sender == auctionItems[auctionId].owner || msg.sender == owner(), "Only owner or sale");

        bytes32 status = getAuctionStatus(auctionId);
        require(status == "ACTIVE", "Auction must be Active");
        
        address currentHighestBidder = highestBidder[auctionId];
        uint256 currentHighestBid = bids[auctionId][currentHighestBidder].price;

        auctionItems[auctionId].cancel = true;

        listedInMarket[auctionItems[auctionId].tokenAddress][auctionItems[auctionId].tokenId] = false;

        claimableFunds[currentHighestBidder] += currentHighestBid;
    }

    /// View Function

    function getAuctionStatus(uint128 auctionId) public view returns (bytes32) {
        AuctionItem memory auctionItem = auctionItems[auctionId];
        return _getStatus(auctionItem.endTime, auctionItem.sold, auctionItem.cancel);
    }

    function getSaleStatus(uint128 saleId) public view returns (bytes32) {
        MarketItem memory item = items[saleId];
        return _getStatus(item.endTime, item.sold, item.cancel);
    }

    function _getStatus(uint256 endTime, bool sold, bool cancel) internal view returns(bytes32){
        if(endTime == 0) return "NOTLISTED";
        if(cancel) return "CANCELED";
        if(block.timestamp > endTime && !sold) return "ENDED";
        if(sold) return "SOLD";
        return "ACTIVE";
    }

    function getListedInMarket(address tokenAddress, uint256 tokenId) external view returns (bool) {
        return listedInMarket[tokenAddress][tokenId];
    }

    function getListedInAuction(address tokenAddress, uint256 tokenId) external view returns (bool) {
        return listedInAuction[tokenAddress][tokenId];
    }

    function getSaleStatusByToken(address tokenAddress, uint256 tokenId) external view returns (uint128) {
        return tokenToItemId[tokenAddress][tokenId];
    }

    function getAuctionStatusByToken(address tokenAddress, uint256 tokenId) external view returns (uint128) {
        return tokenToAuctionId[tokenAddress][tokenId];
    }

    function isApprovalAddress(address tokenAddress) internal view returns(bool) {
        return approvalContract[tokenAddress];
    }

    function checkClaimableFunds() external view returns(uint256) {
        return claimableFunds[msg.sender];
    }

    function updateListingPrice(uint128 itemId, uint256 _listingPrice) public {
        require(items[itemId].owner == msg.sender, "You are not the owner");
        items[itemId].price = _listingPrice;
    }

    function setMarketPlaceFeePer(uint256 newFee) external onlyOwner {
        marketFeePer = newFee;
    }

    function setApprovalAddress(address tokenAddress) external onlyOwner{
        approvalContract[tokenAddress] = true;
    }

    function setPaymentToken(address _paymentToken)external onlyOwner {
        paymentToken = IERC20(_paymentToken);
    }

    function removeAddress(address tokenAddress) external onlyOwner{
        delete approvalContract[tokenAddress];
    }

    function _calculateFee(uint256 price) internal view returns(uint256 fee, uint256 sellerProceeds){
        fee = (price * marketFeePer) / 1000;
        sellerProceeds = price - fee;
    }

}
