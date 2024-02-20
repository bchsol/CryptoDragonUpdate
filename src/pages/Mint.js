import { BrowserProvider, Contract, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import * as s from "../Style/globalStyles";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";

import dragonContractData from "../contracts/dragonContract";
import { uri } from "../ipfs/imageURI";

const contractAddress = dragonContractData.AddressMumbai;
const abi = dragonContractData.Abi;

function Mint() {
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [currentSupply, setCurrentSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [transaction, setTransaction] = useState();

  useEffect(() => {
    const update = async () => {
      const ethersProvider = new BrowserProvider(walletProvider);
      //const signer = await ethersProvider.getSigner();
      const providerContract = new Contract(
        contractAddress,
        abi,
        ethersProvider
      );

      let _maxSupply = ethers.toNumber(await providerContract.GENESIS_LIMIT());
      setMaxSupply(_maxSupply);
      let _currentSupply = ethers.toNumber(
        await providerContract.genesisCount()
      );
      setCurrentSupply(_currentSupply);
    };
    update();
  }, [transaction]);

  const handleMint = async () => {
    if (!isConnected) throw Error("User disconnected");

    if (chainId != "0x13881n") {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13881",
            chainName: "Matic Mumbai",
            rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
          },
        ],
      });
    }

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const signerContract = new Contract(contractAddress, abi, signer);

    let tx = await signerContract.genesisMint(address);

    const receipt = await tx.wait();
    setTransaction(receipt);
    console.log(receipt);
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
            <button size="sm" onClick={handleMint}>
              Mint
            </button>
          </div>
          <div className="explan" style={{ fontSize: 17, marginTop: 60 }}>
            <p>
              Mumbai Testnet
              <br />
            </p>
          </div>
        </div>
      </s.Container>
    </s.Screen>
  );
}

export default Mint;
