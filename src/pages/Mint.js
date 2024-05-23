import React, { useEffect, useState } from "react";
import * as s from "../Style/globalStyles";

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
      <s.Container
        flex={1}
        ai={"center"}
        style={{
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <div
          className="mint-card"
          style={{ top: "20vmin", width: "50vmin", position: "absolute" }}
        >
          <div
            className="card-top"
            style={{
              paddingBottom: 24,
              borderBottom: "2px solid rgb(0,0,0)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              className="Title"
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginTop: 24,
              }}
            >
              Mint
            </span>
          </div>
          <div
            className="card-middle"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
              marginBottom: 24,
            }}
          >
            {currentSupply} / {maxSupply}
          </div>

          <div
            className="card-bottom"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
            }}
          >
            <button
              size="sm"
              onClick={handleMint}
              disabled={loading || !isConnected}
            >
              {loading ? "Minting..." : "Mint"}
            </button>
          </div>
          <div className="explan" style={{ fontSize: 17, marginTop: 60 }}>
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
