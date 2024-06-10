import React, { useEffect, useState } from "react";
import * as s from "../Style/globalStyles";
import "../Style/Mint.css";
import dragonContractData from "../contracts/dragonContract";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";
import { Button, Card } from "react-bootstrap";

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

const options = [
  { text: "이 알은 벛나무 주변에서 발견된다.", name: "popomo" },
  { text: "이 알의 털은 매우 부드럽다.", name: "firetail" },
  { text: "이 알은 불타오르고 있다.", name: "phoenix" },
  { text: "이 알은 매우 붉고 뜨겁다.", name: "fire" },
  { text: "이 알은 용암으로 이루어져 있다.", name: "volcano" },
];

function Mint() {
  const [currentSupply, setCurrentSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [transaction, setTransaction] = useState();
  const [loading, setLoading] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState([]);

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    const updateSupply = async () => {
      try {
        if (!isConnected) throw Error("User disconnected");

        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const providerContract = new Contract(contractAddress, abi, signer);

        // let _maxSupply = Number(await providerContract.GENESIS_LIMIT());
        // setMaxSupply(_maxSupply);
        // let _currentSupply = Number(await providerContract.genesisCount());
        // setCurrentSupply(_currentSupply);
      } catch (error) {
        console.error("Failed to fetch supply data:", error);
      }
    };
    updateSupply();
  }, [isConnected, walletProvider, transaction]);

  useEffect(() => {
    const randomOptions = [];
    while (randomOptions.length < 3) {
      const randomIndex = Math.floor(Math.random() * options.length);
      const randomOption = options[randomIndex];
      if (!randomOptions.includes(randomOption)) {
        randomOptions.push(randomOption);
      }
    }
    setSelectedOptions(randomOptions);
  }, []);

  const handleMint = async (optionName) => {
    try {
      if (chainId != "11155111") throw Error("Change Network");

      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerContract = new Contract(contractAddress, abi, signer);

      let tx = await signerContract.genesisMint(address, optionName);
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

  const handleOptionSelect = (option) => {
    console.log(option);
    //option.forEach((opt) => handleMint(opt.name));
  };

  const handleRefrash = () => {
    const randomOptions = [];
    while (randomOptions.length < 3) {
      const randomIndex = Math.floor(Math.random() * options.length);
      const randomOption = options[randomIndex];
      if (!randomOptions.includes(randomOption)) {
        randomOptions.push(randomOption);
      }
    }
    setSelectedOptions(randomOptions);
  };

  return (
    <s.Screen>
      <s.Container ai={"center"}>
        <div className="mint-card">
          <div className="card-top">
            <span className="title">Mint</span>
          </div>
          <div className="card-middle">
            <Button className="confirm-button" onClick={handleRefrash}></Button>
          </div>

          <div className="card-bottom">
            <div className="options">
              {selectedOptions.map((option, index) => (
                <Card key={index} className="option">
                  <p>
                    <strong>{option.text}</strong>
                  </p>
                  <button
                    className="card-button"
                    onClick={() => handleOptionSelect(option.name)}
                  >
                    확인
                  </button>
                </Card>
              ))}
            </div>
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
