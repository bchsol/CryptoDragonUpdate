import { Route, Routes } from "react-router-dom";

import Heading from "./pages/Heading";
import Mint from "./pages/Mint";
import Breed from "./pages/Breed";
import Collection from "./pages/Collection";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
const projectId = "YOUR_PROJECT_ID";

// 2. Set chains
const testnet = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io/",
  rpcUrl: "https://rpc.sepolia.org/",
};

const localnet = {
  chainId: 1337,
  name: "ganache",
  currency: "ETH",
  explorerUrl: "",
  rpcUrl: "http://127.0.0.1:8545",
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a Web3Modal instance
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
