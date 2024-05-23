import axios from "axios";
import dragonContractData from "../contracts/dragonContract";
import { Contract, ethers } from "ethers";

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

const fetchMetadata = async (ethersProvider, tokenId) => {
  const providerContract = new Contract(contractAddress, abi, ethersProvider);
  const [name, metadataUrl] = await Promise.all([
    providerContract.name(),
    providerContract.tokenURI(tokenId),
  ]);

  const tokenInfo = await providerContract.getToken(tokenId);
  //const _url = "https://" + metadataUrl.substring(7) + ".ipfs.nftstorage.link";
  const tokenUrl = metadataUrl.replace("data:application/json;utf8,", "");
  const jsonObject = JSON.parse(tokenUrl);
  const imageUrl = jsonObject.image;
  //const image = await axios.get(_url);
  //const image = response.data.image.substring(7); // delete ipfs://

  const tokenName = name + " #" + tokenId;

  return { tokenName, imageUrl, tokenInfo };
};

const fetchNftData = async (ethersProvider, tokenId) => {
  const { tokenName, imageUrl, tokenInfo } = await fetchMetadata(
    ethersProvider,
    tokenId
  );
  return { id: tokenId, name: tokenName, tokenInfo, imageUrl };
};

export const fetchNfts = async (ethersProvider, address) => {
  const signer = await ethersProvider.getSigner();
  const signerContract = new Contract(contractAddress, abi, signer);

  const tokenIds = await signerContract.getUserNftIds(address);
  const nfts = await Promise.allSettled(
    tokenIds.map((tokenId) => fetchNftData(ethersProvider, tokenId))
  );
  console.log(nfts);
  return nfts;
};
