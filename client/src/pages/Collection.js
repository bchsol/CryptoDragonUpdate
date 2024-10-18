import React, { useCallback, useEffect, useState } from "react";
import CollectionInfoModal from "./CollectionInfoModal";
import CollectionSellModal from "./CollectionSellModal";
import {
  PageContainer,
  ProfileSection,
  ProfileBanner,
  ProfileInfo,
  ProfileDetails,
  WalletAddress,
  ProfileStats,
  Stat,
  ItemsSection,
  ItemsHeader,
  ViewModeSwitch,
  SearchBar,
  SortDropdown,
  ItemsGrid,
  NFTCard,
  NFTImage,
  NFTInfo,
  NFTName,
  NFTStatus,
  Button,
} from "../Style/collectionStyles";
import { fetchNfts } from "../blockchain/fetchData";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import {
  BrowserProvider,
  Contract,
  formatUnits,
  parseUnits,
  decodeBytes32String,
} from "ethers";

import dragonContractData from "../contracts/dragonContract";
import marketContractData from "../contracts/marketContract";
import drinkContractData from "../contracts/drinkContract";

const dragonContractAddress = dragonContractData.AddressSepolia;
const dragonAbi = dragonContractData.Abi;
const marketContractAddress = marketContractData.AddressSepolia;
const marketAbi = marketContractData.Abi;
const drinkContractAddress = drinkContractData.AddressSepolia;
const drinkAbi = drinkContractData.Abi;

function Collection() {
  // State Variables
  const [viewMode, setViewMode] = useState("grid");
  const [nftIds, setNftIds] = useState([]);
  const [listedStatus, setListedStatus] = useState({});
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState();
  const [selectedNft, setSelectedNft] = useState();
  const [price, setPrice] = useState();
  const [duration, setDuration] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationSec, setDurationSec] = useState(0);
  const [sellSelectNft, setSellSelectNft] = useState();
  const [tokenInfo, setTokenInfo] = useState([]);
  const [drinkBalance, setDrinkBalance] = useState();
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isEvolveBtnEnabled, setIsEvolveBtnEnabled] = useState(false);

  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  // Truncate wallet address for display
  const truncateAccount = address
    ? address.substring(0, 6) + "..." + address.substring(address.length - 4)
    : null;

  // Fetch NFTs and their listed statuses
  const fetchMyNfts = useCallback(async () => {
    if (!isConnected) throw Error("User disconnected");

    const ethersProvider = new BrowserProvider(walletProvider);
    const nfts = await fetchNfts(ethersProvider, address);
    setNftIds(nfts);

    const signer = await ethersProvider.getSigner();
    const marketContract = new Contract(
      marketContractAddress,
      marketAbi,
      signer
    );

    const statuses = await Promise.all(
      nfts.map(async (nft) => {
        const isMarketListed = await marketContract.getListedInMarket(
          dragonContractAddress,
          nft.id
        );
        const isAuctionListed = await marketContract.getListedInAuction(
          dragonContractAddress,
          nft.id
        );

        if (isAuctionListed == true) {
          let auctionId = 0;
          let auctionStatus = null;
          try {
            auctionId = await marketContract.getAuctionStatusByToken(
              dragonContractAddress,
              nft.id
            );
            auctionStatus = await marketContract.getAuctionStatus(auctionId);
          } catch (error) {
            console.error(
              `Failed to fetch auction status for NFT ID ${nft.id}`,
              error
            );
          }
          return {
            id: nft.id,
            auctionId: auctionId,
            listed: "auction",
            status: decodeBytes32String(auctionStatus),
          };
        } else if (isMarketListed == true) {
          let marketId = 0;
          let marketStatus = null;
          try {
            marketId = await marketContract.getSaleStatusByToken(
              dragonContractAddress,
              nft.id
            );
            marketStatus = await marketContract.getSaleStatus(marketId);
          } catch (error) {
            console.error(
              `Failed to fetch auction status for NFT ID ${nft.id}`,
              error
            );
          }
          return {
            id: nft.id,
            marketId: marketId,
            listed: "market",
            status: decodeBytes32String(marketStatus),
          };
        }
        return { id: nft.id, listed: "notListed" };
      })
    );

    // Update listed status of NFTs
    const listedStatusMap = statuses.reduce((acc, status) => {
      acc[status.id] = {
        listed: status.listed,
        marketId: Number(status.marketId) || null,
        auctionId: Number(status.auctionId) || null,
        status: status.status,
      };

      return acc;
    }, {});
    setListedStatus(listedStatusMap);

    // Fetch Drink token balance
    const drinkContract = new Contract(drinkContractAddress, drinkAbi, signer);
    const balance = await drinkContract.balanceOf(address);
    setDrinkBalance(formatUnits(balance, 18).split(".")[0]);
  }, [address, isConnected, walletProvider]);

  // Fetch NFT growth info
  const getGrowthInfo = async (tokenId) => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const providerContract = new Contract(
      dragonContractAddress,
      dragonAbi,
      ethersProvider
    );
    const growInfo = await providerContract.getGrowthInfo(tokenId);

    const stages = ["egg", "hatch", "hatchling", "adult"];
    const currentStage = stages[Number(growInfo.currentStage)] || "unknown";

    setStage(currentStage);
    setTimeRemaining(Number(growInfo.timeRemaining));
    setSelectedNft(tokenId);
  };

  // Handle price input with validation
  const handlePriceChange = (e) => {
    let value = e.target.value;
    if (/^\d{0,10}(\.\d{0,5})?$/.test(value)) setPrice(value);
  };

  // Handle duration selection for NFT sale
  const handleDurationSelect = (value) => {
    const durationMap = {
      "1 hour": 1,
      "6 hours": 6,
      "1 day": 24,
      "3 days": 72,
      "7 days": 168,
      "1 month": 720,
      "3 months": 2160,
      "6 months": 4320,
    };

    const hours = durationMap[value];
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);

    setEndTime(endTime.toLocaleString());
    setDuration(value);
    setDurationSec(hours * 3600);
  };

  // Handle NFT listing for auction
  const listNftForAuction = async () => {
    try {
      await listNftOnMarket("listAuction");
    } catch (error) {
      console.error(error);
    }
  };

  // Handle NFT listing for sale
  const listNftForSale = async () => {
    try {
      await listNftOnMarket("listItem");
    } catch (error) {
      console.error(error);
    }
  };

  // Reusable function to list NFT on the market
  const listNftOnMarket = async (method) => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const marketContract = new Contract(
      marketContractAddress,
      marketAbi,
      signer
    );
    const dragonContract = new Contract(
      dragonContractAddress,
      dragonAbi,
      signer
    );

    const isApproved = await dragonContract.isApprovedForAll(
      address,
      marketContractAddress
    );

    if (!isApproved)
      await dragonContract.setApprovalForAll(marketContractAddress, true);

    if (method === "listItem") {
      const tx = await marketContract[method](
        dragonContractAddress,
        sellSelectNft,
        durationSec,
        parseUnits(price, 18),
        1,
        true
      );

      await tx.wait();
      alert("Success");
      window.location.reload();
    } else if (method === "listAuction") {
      const tx = await marketContract[method](
        dragonContractAddress,
        sellSelectNft,
        durationSec,
        parseUnits(price, 18)
      );

      await tx.wait();
      alert("Success");
      window.location.reload();
    }
  };

  // Handle evolution and feeding of selected NFT
  const evolveOrFeed = async (action) => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const dragonContract = new Contract(
        dragonContractAddress,
        dragonAbi,
        signer
      );

      const tx = await dragonContract[action](selectedNft);
      await tx.wait();
      alert("Success");
      window.location.reload();
    } catch (error) {
      alert("Failed");
    }
  };

  const resolveAuction = async (auctionId) => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const marketContract = new Contract(
        marketContractAddress,
        marketAbi,
        signer
      );

      const tx = await marketContract.resolveAuction(auctionId);
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error(`Failed to resolve: ${error}`);
    }
  };

  const evolve = () => evolveOrFeed("evolve");
  const feeding = () => evolveOrFeed("feeding");

  // Fetch user's NFTs upon connection
  useEffect(() => {
    if (isConnected) fetchMyNfts().catch(console.error);
  }, [fetchMyNfts, isConnected]);

  // Enable evolve button when timeRemaining reaches zero
  useEffect(() => {
    setIsEvolveBtnEnabled(timeRemaining === 0 && stage !== "adult");
  }, [timeRemaining, stage]);

  return (
    <PageContainer>
      <ProfileSection>
        <ProfileBanner>
          <ProfileInfo>
            <ProfileDetails>
              <WalletAddress>{truncateAccount}</WalletAddress>
              <ProfileStats>
                <Stat>Total Items: {nftIds.length}</Stat>
                <Stat>Total Value: {drinkBalance} Drink</Stat>
              </ProfileStats>
            </ProfileDetails>
          </ProfileInfo>
        </ProfileBanner>
      </ProfileSection>

      <ItemsSection>
        <ItemsHeader>
          <ViewModeSwitch>
            <button onClick={() => setViewMode("grid")}>Grid View</button>
            <button onClick={() => setViewMode("list")}>List View</button>
          </ViewModeSwitch>
          <SearchBar placeholder="Search items" />
          <SortDropdown>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="value">Highest Value</option>
          </SortDropdown>
        </ItemsHeader>

        <ItemsGrid viewMode={viewMode}>
          {nftIds.map((item) => (
            <NFTCard key={item.id} viewMode={viewMode}>
              <NFTImage src={item.imageUrl} alt={item.name} />
              <NFTInfo>
                <NFTName>{item.name}</NFTName>
                <NFTStatus>{item.status}</NFTStatus>
              </NFTInfo>
              <Button
                className="info"
                onClick={() => {
                  setShow(true);
                  setTokenInfo(item.tokenInfo);
                  getGrowthInfo(item.id);
                }}
                style={{ marginRight: "15px" }}
              >
                Info
              </Button>

              {listedStatus[item.id]?.status === "ENDED" ||
              listedStatus[item.id]?.status === "CANCELED" ? (
                <Button
                  className="resolve"
                  onClick={() =>
                    resolveAuction(listedStatus[item.id].auctionId)
                  }
                >
                  Resolve
                </Button>
              ) : listedStatus[item.id]?.status === "ACTIVE" ? (
                <Button className="trading" disabled>
                  Trading...
                </Button>
              ) : (
                <Button
                  className="sell"
                  onClick={() => {
                    setIsSellModalOpen(true);
                    setSellSelectNft(item.id);
                  }}
                >
                  Sell
                </Button>
              )}
            </NFTCard>
          ))}
        </ItemsGrid>
      </ItemsSection>

      <CollectionInfoModal
        show={show}
        onHide={() => setShow(false)}
        info={tokenInfo}
        stage={stage}
        timeRemaining={timeRemaining}
        feeding={feeding}
        evolve={evolve}
      />

      <CollectionSellModal
        show={isSellModalOpen}
        onHide={() => {
          setIsSellModalOpen(false);
        }}
        price={price}
        handleDurationSelect={handleDurationSelect}
        handlePriceChange={handlePriceChange}
        endTime={endTime}
        duration={duration}
        listNftForAuction={listNftForAuction}
        listNftForSale={listNftForSale}
      />
    </PageContainer>
  );
}

export default Collection;
