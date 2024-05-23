import { Route, Routes } from "react-router-dom";

import Heading from "./pages/Heading";
import Mint from "./pages/Mint";
import Breed from "./pages/Breed";
import Collection from "./pages/Collection";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const projectId = "projectId";

const testnet = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io/",
  rpcUrl: "https://rpc.sepolia.org/",
};

const metadata = {
  name: "Crypto Dragon",
  description:
    "Crypto Dragon is a contract developed using the Dragon Village collection developed by Hibro on the blockchain.",
  url: "https://github.com/bchsol/CryptoDragon",
};

const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
});

createWeb3Modal({
  ethersConfig,
  chains: [testnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

function App() {
  return (
    <>
      <Heading />
      <Routes>
        <Route path="/" element={<Mint />} />
        <Route path="/breed" element={<Breed />} />
        <Route path="/collection" element={<Collection />} />
      </Routes>
    </>
  );
}

export default App;
