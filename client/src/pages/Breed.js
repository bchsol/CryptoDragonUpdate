import React, { useState, useEffect } from "react";
import NftSelectionModal from "./NftSelectionModal";
import dragonContractData from "../contracts/dragonContract";
import {
  BreedPageContainer,
  BoxContainer,
  Box,
  BreedButton,
  HeartIcon,
  EggProbabilityContainer,
  EggBox,
  DragonName,
} from "../Style/BreedStyles";
import { fetchNfts } from "../blockchain/fetchData";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";

import heartImage from "../image/heart.png";
import eggImage from "../image/secret_egg.png";

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

function Breed() {
  const [isMaleModalOpen, setIsMaleModalOpen] = useState(false);
  const [isFemaleModalOpen, setIsFemaleModalOpen] = useState(false);
  const [selectedHusband, setSelectedHusband] = useState(null);
  const [selectedWife, setSelectedWife] = useState(null);

  const [maleNftIds, setMaleNftIds] = useState([]);
  const [femaleNftIds, setFemaleNftIds] = useState([]);

  const { address, chainId, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider();

  useEffect(() => {
    if (isMaleModalOpen) {
      showMaleNfts();
    }
  }, [isMaleModalOpen]);

  useEffect(() => {
    if (isFemaleModalOpen) {
      showFemaleNfts();
    }
  }, [isFemaleModalOpen]);

  const showMaleNfts = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const nfts = await fetchNfts(ethersProvider, address);
      const maleIds = nfts.filter(
        (nft) =>
          Number(nft.growthInfo.currentStage) == 3 && nft.tokenInfo.gender == 1
      );

      setMaleNftIds(maleIds);
    } catch (error) {
      console.error("Error fetching male NFTs:", error);
    }
  };

  const showFemaleNfts = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const nfts = await fetchNfts(ethersProvider, address);
      const femaleIds = nfts.filter(
        (nft) =>
          Number(nft.growthInfo.currentStage) == 3 && nft.tokenInfo.gender == 2
      );

      setFemaleNftIds(femaleIds);
    } catch (error) {
      console.error("Error fetching female NFTs:", error);
    }
  };

  const breed = async () => {
    console.log("breed");
    // try {
    //   if (!isConnected) throw Error("User disconnected");
    //   const ethersProvider = new BrowserProvider(walletProvider);
    //   const signer = await ethersProvider.getSigner();
    //   const signerContract = new Contract(contractAddress, abi, signer);
    //   const tokenType =
    //     Math.random() < 0.5
    //       ? selectedHusband.tokenInfo.tokenType
    //       : selectedWife.tokenInfo.tokenType;
    //   let tx = await signerContract.breed(
    //     tokenType,
    //     Number(selectedHusband.id),
    //     Number(selectedWife.id)
    //   );
    //   const receipt = await tx.wait();
    //   alert("Breed Success");
    //   window.location.reload();
    // } catch (error) {
    //   console.log(error);
    //   alert("Failed");
    // }
  };

  const checkHandleMale = (nft) => {
    if (selectedHusband && selectedHusband.id == nft.id) {
      setSelectedHusband(null);
    } else {
      setSelectedHusband(nft);
    }
  };
  const checkHandleFemale = (nft) => {
    if (selectedWife && selectedWife.id == nft.id) {
      setSelectedWife(null);
    } else {
      setSelectedWife(nft);
    }
  };
  return (
    <BreedPageContainer>
      <NftSelectionModal
        show={isMaleModalOpen}
        onHide={() => setIsMaleModalOpen(false)}
        nftIds={maleNftIds}
        selectedNft={selectedHusband}
        onSelectNft={checkHandleMale}
        title="Select Husband NFT"
        onConfirm={() => setIsMaleModalOpen(false)}
      />

      <NftSelectionModal
        show={isFemaleModalOpen}
        onHide={() => setIsFemaleModalOpen(false)}
        nftIds={femaleNftIds}
        selectedNft={selectedWife}
        onSelectNft={checkHandleFemale}
        title="Select Wife NFT"
        onConfirm={() => setIsFemaleModalOpen(false)}
      />

      <BoxContainer>
        <Box
          onClick={() => {
            setIsMaleModalOpen(true);
          }}
        >
          {selectedHusband ? (
            <>
              <img src={selectedHusband.imageUrl} alt="Husband Dragon" />
              <DragonName>{selectedHusband.name}</DragonName>
            </>
          ) : (
            "Select Husband"
          )}
        </Box>

        {selectedHusband && selectedWife && (
          <HeartIcon src={heartImage} alt="Heart Icon" />
        )}

        <Box
          onClick={() => {
            setIsFemaleModalOpen(true);
          }}
        >
          {selectedWife ? (
            <>
              <img src={selectedWife.imageUrl} alt="Wife Dragon" />
              <DragonName>{selectedWife.name}</DragonName>
            </>
          ) : (
            "Select Wife"
          )}
        </Box>
      </BoxContainer>

      {selectedHusband && selectedWife && (
        <EggProbabilityContainer>
          {selectedHusband.tokenInfo.tokenType ===
          selectedWife.tokenInfo.tokenType ? (
            <EggBox>
              <img
                src={`https://raw.githubusercontent.com/bchsol/CryptoDragon/refs/heads/main/Image/${selectedHusband.tokenInfo.tokenType}_egg.webp
                `}
                alt="Egg Type"
              />
              <span>100%</span>
            </EggBox>
          ) : (
            <>
              <EggBox>
                <img
                  src={`https://raw.githubusercontent.com/bchsol/CryptoDragon/refs/heads/main/Image/${selectedHusband.tokenInfo.tokenType}_egg.webp
                  `}
                  alt="Egg Type 1"
                />
                <span>50%</span>
              </EggBox>

              <EggBox>
                <img
                  src={`https://raw.githubusercontent.com/bchsol/CryptoDragon/refs/heads/main/Image/${selectedWife.tokenInfo.tokenType}_egg.webp
                  `}
                  alt="Egg Type 2"
                />
                <span>50%</span>
              </EggBox>
            </>
          )}
        </EggProbabilityContainer>
      )}

      <BreedButton onClick={breed}>Breed Now</BreedButton>
    </BreedPageContainer>
  );
}

export default Breed;
