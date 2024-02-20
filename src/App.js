import { Route, Routes } from "react-router-dom";

import Heading from "./pages/Heading";
import Mint from "./pages/Mint";
import Breed from "./pages/Breed";
import Collection from "./pages/Collection";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
const projectId = "6be1b9452445de3f1665cc8090c1b95a";

const testnet = {
  chainId: 80001,
  name: "MATIC Mumbai",
  currency: "MATIC",
  explorerUrl: "https://mumbai.polygonscan.com",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
};

const metadata = {
  name: "project",
  description: "project",
  url: "xxx",
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [testnet],
  projectId,
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
