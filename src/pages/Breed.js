import React, { useState, useEffect } from "react";

import dragonContractData from "../contracts/dragonContract";

import { Modal, Button, Card, Row, Col, Form, Image } from "react-bootstrap";
import { fetchNfts } from "../blockchain/fetchData";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

function Breed() {
  const [isMaleModalOpen, setIsMaleModalOpen] = useState(false);
  const [isFemaleModalOpen, setIsFemaleModalOpen] = useState(false);

  const [selectedHusband, setSelectedHusband] = useState();
  const [selectedWife, setSelectedWife] = useState();

  const [maleNftIds, setMaleNftIds] = useState([]);
  const [femaleNftIds, setFemaleNftIds] = useState([]);

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

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

  const getRandomType = () => {
    return Math.floor(Math.random() * 2);
  };

  const breed = async () => {
    try {
      if (!isConnected) throw Error("User disconnected");

      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerContract = new Contract(contractAddress, abi, signer);
      let tokenType = "";

      if (getRandomType() == 0) {
        tokenType = selectedHusband.tokenInfo.tokenType;
      } else {
        tokenType = selectedWife.tokenInfo.tokenType;
      }

      let tx = await signerContract.breed(
        tokenType,
        Number(selectedHusband.id),
        Number(selectedWife.id)
      );

      const receipt = await tx.wait();
      console.log(receipt);

      alert("Success");
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
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
    <>
      <Modal
        show={isMaleModalOpen}
        size="lg"
        onHide={() => {
          setIsMaleModalOpen(false);
          setSelectedHusband(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={1} sm={2} md={3} lg={4} xl={4} xxl={5} gap={4}>
            {maleNftIds?.map((nftId) => (
              <Col key={nftId.id} style={{ margin: 0, paddingRight: 170 }}>
                <Card
                  border="dark"
                  className="text-center"
                  style={{ width: "10rem" }}
                >
                  <Card.Img src={nftId.imageUrl} />
                  <Card.Title>{nftId.name}</Card.Title>
                  <Card.Footer>
                    <Form.Check
                      type="checkbox"
                      name="MaleNft"
                      checked={
                        selectedHusband && selectedHusband.id == nftId.id
                      }
                      onChange={() => checkHandleMale(nftId)}
                    />
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-confirm"
            variant="outline-dark"
            onClick={() => setIsMaleModalOpen(false)}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isFemaleModalOpen}
        size="lg"
        onHide={() => {
          setIsFemaleModalOpen(false);
          setSelectedWife(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={1} sm={2} md={3} lg={4} xl={4} xxl={5} gap={4}>
            {femaleNftIds?.map((nftId) => (
              <Col key={nftId.id} style={{ margin: 0, paddingRight: 170 }}>
                <Card
                  border="dark"
                  className="text-center"
                  style={{ width: "10rem" }}
                >
                  <Card.Img src={nftId.imageUrl} />
                  <Card.Title>{nftId.name}</Card.Title>
                  <Card.Footer>
                    <Form.Check
                      type="checkbox"
                      name="FemaleNft"
                      checked={selectedWife && selectedWife.id == nftId.id}
                      onChange={() => checkHandleFemale(nftId)}
                    />
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-confirm"
            variant="outline-dark"
            onClick={() => setIsFemaleModalOpen(false)}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <div
          className="selected-btn"
          style={{
            padding: "10px 20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: "15rem",
          }}
        >
          <div
            className="husband"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20rem",
              width: "20rem",
              background: "transparent",
              border: "2px solid blue",
              cursor: "pointer",
              marginRight: "13rem",
            }}
            onClick={() => {
              setIsMaleModalOpen(true);
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {selectedHusband ? (
                <Image fluid src={selectedHusband.imageUrl} />
              ) : (
                <span>Husband</span>
              )}
              {selectedHusband ? <span>{selectedHusband.name}</span> : null}
            </div>
          </div>

          <div
            className="wife"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20rem",
              width: "20rem",
              background: "transparent",
              border: "2px solid blue",
              cursor: "pointer",
            }}
            onClick={() => {
              setIsFemaleModalOpen(true);
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {selectedWife ? (
                <Image fluid src={selectedWife.imageUrl} />
              ) : (
                <span>Wife</span>
              )}
              {selectedWife ? <span>{selectedWife.name}</span> : null}
            </div>
          </div>
        </div>
        <div
          className="btn-breed"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Button
            className="breed"
            style={{ magin: "auto", display: "block" }}
            onClick={breed}
            disabled={!selectedHusband || !selectedWife}
          >
            Breed Now
          </Button>
        </div>
      </div>
    </>
  );
}

export default Breed;
