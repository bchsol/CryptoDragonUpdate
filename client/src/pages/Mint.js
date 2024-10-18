import React from "react";
import "../Style/mintStyles";
import dragonContractData from "../contracts/dragonContract";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";

import {
  EggContainer,
  MintButton,
  MintPageContainer,
} from "../Style/mintStyles";

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

function Mint() {
  const { address } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const handleMint = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerContract = new Contract(contractAddress, abi, signer);
      let tx = await signerContract.normalMint(address);
      const receipt = await tx.wait();
      console.log(receipt);
      alert("Minting Success");
      window.location.reload();
    } catch (error) {
      console.error("Failed to Mint", error);
    }
  };

  return (
    <MintPageContainer>
      <EggContainer />
      <MintButton onClick={() => handleMint()}>Mint</MintButton>
    </MintPageContainer>
  );
}
export default Mint;
