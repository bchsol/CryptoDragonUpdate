import axios from "axios";
import dragonContractData from "../contracts/dragonContract";
import { Contract, ethers } from "ethers";

const contractAddress = dragonContractData.AddressMumbai;
const abi = dragonContractData.Abi;

const fetchMetadata = async (ethersProvider, tokenId) => {
  const providerContract = new Contract(contractAddress, abi, ethersProvider);
  const [name, metadataUrl] = await Promise.all([
    providerContract.name(),
    providerContract.tokenURI(tokenId),
  ]);

  const tokenInfo = await providerContract.getToken(tokenId);
  const _url = "https://" + metadataUrl.substring(7) + ".ipfs.nftstorage.link";
  const response = await axios.get(_url);
  const image = response.data.image.substring(7); // delete ipfs://

  const tokenName = name + " #" + tokenId;

  return { tokenName, image, tokenInfo };
};

const fetchNftData = async (ethersProvider, tokenId) => {
  const { tokenName, image, tokenInfo } = await fetchMetadata(
    ethersProvider,
    tokenId
  );
  const url = `https://${image}.ipfs.nftstorage.link`;
  return { id: tokenId, name: tokenName, tokenInfo, url };
};

export const fetchNfts = async (ethersProvider, address) => {
  const signer = await ethersProvider.getSigner();
  const signerContract = new Contract(contractAddress, abi, signer);

  const tokenIds = await signerContract.getUserNftIds(address);
  const nfts = await Promise.allSettled(
    tokenIds.map((tokenId) => fetchNftData(ethersProvider, tokenId))
  );
  return nfts;
};
