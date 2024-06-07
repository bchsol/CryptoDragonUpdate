import React, { useEffect, useState } from "react";
import * as s from "../Style/globalStyles";
import "../Style/Mint.css";
import dragonContractData from "../contracts/dragonContract";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

function Mint() {
  const [currentSupply, setCurrentSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [transaction, setTransaction] = useState();
  const [loading, setLoading] = useState(false);

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    const updateSupply = async () => {
      try {
        if (!isConnected) throw Error("User disconnected");

        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const providerContract = new Contract(contractAddress, abi, signer);

        let _maxSupply = Number(await providerContract.GENESIS_LIMIT());
        setMaxSupply(_maxSupply);
        let _currentSupply = Number(await providerContract.genesisCount());
        setCurrentSupply(_currentSupply);
      } catch (error) {
        console.error("Failed to fetch supply data:", error);
      }
    };
    updateSupply();
  }, [isConnected, walletProvider, transaction]);

  const handleMint = async () => {
    try {
      if (chainId != "11155111") throw Error("Change Network");

      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerContract = new Contract(contractAddress, abi, signer);

      let tx = await signerContract.genesisMint(address, "angelcat");
      const receipt = await tx.wait();
      setTransaction(receipt);
      console.log(receipt);
      alert("Minting Success");
      window.location.reload();
    } catch (error) {
      if (maxSupply == currentSupply) {
        alert("Mint Ended: Max Supply Reached");
      } else {
        alert("Transaction Failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <s.Screen>
      <s.Container flex={1} ai={"center"}>
        <div
          className="mint-card"
          style={{ top: "20vmin", width: "50vmin", position: "absolute" }}
        >
          <div className="card-top">
            <span className="title">Mint</span>
          </div>
          <div className="card-middle">
            {currentSupply} / {maxSupply}
          </div>

          <div className="card-bottom">
            <button
              size="sm"
              onClick={handleMint}
              disabled={loading || !isConnected}
            >
              {loading ? "Minting..." : "Mint"}
            </button>
          </div>
          <div className="explan">
            <p>
              Sepolia Testnet
              <br />
            </p>
          </div>
        </div>
      </s.Container>
    </s.Screen>
  );
}
export default Mint;
