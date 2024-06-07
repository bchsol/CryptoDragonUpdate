import marketContractData from "../contracts/marketContract";
import dragonContractData from "../contracts/dragonContract";
import { Contract } from "ethers";

const marketContractAddress = marketContractData.AddressSepolia;
const marketAbi = marketContractData.Abi;

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

export const fetchMarketMyItems = async (ethersProvider) => {
  return fetchMarketItemsData(ethersProvider, (contract) =>
    contract.fetchMyItemListed()
  );
};

export const fetchMarketItems = async (ethersProvider) => {
  return fetchMarketItemsData(ethersProvider, (contract) =>
    contract.fetchMarketItemListed()
  );
};

export const fetchMarketLog = async (ethersProvider) => {
  return fetchMarketItemsData(ethersProvider, (contract) =>
    contract.fetchMarketItemLog()
  );
};

const fetchMarketItemsData = async (ethersProvider, fetchFunction) => {
  try {
    const signer = await ethersProvider.getSigner();
    const providerContract = new Contract(
      marketContractAddress,
      marketAbi,
      signer
    );

    const items = await fetchFunction(providerContract);

    const nfts = await Promise.allSettled(
      items.map(async (item) => {
        const metadata = await fetchMetadata(ethersProvider, item.tokenId);
        return {
          id: item.itemId,
          nftContract: item.nftContract,
          tokenId: item.tokenId,
          owner: item.owner,
          price: item.price,
          sold: item.sold,
          cancel: item.cancel,
          ...metadata,
        };
      })
    );

    const fulfilledNfts = nfts
      .filter((result) => result.status == "fulfilled")
      .map((result) => result.value);

    return fulfilledNfts;
  } catch (error) {
    console.error("Failed to fetch market items: ", error);
    throw error;
  }
};

const fetchMetadata = async (ethersProvider, tokenId) => {
  try {
    const providerContract = new Contract(contractAddress, abi, ethersProvider);
    const [name, metadataUrl, tokenInfo, growthInfo] = await Promise.all([
      providerContract.name(),
      providerContract.tokenURI(tokenId),
      providerContract.getToken(tokenId),
      providerContract.getGrowthInfo(tokenId),
    ]);

    const tokenUrl = metadataUrl.replace("data:application/json;utf8,", "");
    const jsonObject = JSON.parse(tokenUrl);
    const imageUrl = jsonObject.image;

    const tokenName = `${name} #${tokenId}`;

    return { tokenName, imageUrl, tokenInfo, growthInfo };
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
    throw error;
  }
};
