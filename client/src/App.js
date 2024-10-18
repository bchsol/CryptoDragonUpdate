import { Route, Routes } from "react-router-dom";

import Navbar from "./pages/Navbar";
import Mint from "./pages/Mint";
import Breed from "./pages/Breed";
import Collection from "./pages/Collection";
import MarketPlace from "./pages/MarketPlace";
import ItemDetail from "./pages/ItemDetail";
import Quest from "./pages/Quest";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const projectId = "projectId";

const testnet = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io/",
  rpcUrl: "https://rpc.sepolia.org/",
};

const ganache = {
  chainId: 1337,
  name: "Ganache",
  currency: "ETH",
  rpcUrl: "http://127.0.0.1:8545",
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
  chains: [ganache],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Mint />} />
        <Route path="/breed" element={<Breed />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/market" element={<MarketPlace />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/quest" element={<Quest />} />
      </Routes>
    </>
  );
}

export default App;
