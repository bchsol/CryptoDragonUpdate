import React, { useState, useEffect } from "react";

import dragonContractData from "../contracts/dragonContract";

import { Modal, Button, Card, Row, Col, Form, Image } from "react-bootstrap";
import { fetchNfts } from "../blockchain/fetchData";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";

const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

function Breed() {
  const [isMaleModalOpen, setIsMaleModalOpen] = useState(false);
  const [isFemaleModalOpen, setIsFemaleModalOpen] = useState(false);

  const [selectedHusband, setSelectedHusband] = useState(0);
  const [selectedWife, setSelectedWife] = useState(0);

  const [maleNftIds, setMaleNftIds] = useState([]);
  const [femaleNftIds, setFemaleNftIds] = useState([]);

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    if (isMaleModalOpen) {
      showMaleNfts();
    }
    if (isFemaleModalOpen) {
      showFemaleNfts();
    }
  }, [isMaleModalOpen, isFemaleModalOpen]);

  const showMaleNfts = async () => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const nfts = await fetchNfts(ethersProvider, address);
    const maleIds = [];
    for (let i = 0; i < nfts.length; i++) {
      if (
        nfts[i].value.tokenInfo.growth == "adult" &&
        nfts[i].value.tokenInfo.gender == 1
      ) {
        maleIds.push(nfts[i]);
      }
    }
    setMaleNftIds(maleIds);
  };
  const showFemaleNfts = async () => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const nfts = await fetchNfts(ethersProvider, address);
    const femaleIds = [];
    for (let i = 0; i < nfts.length; i++) {
      if (
        nfts[i].value.tokenInfo.growth == "adult" &&
        nfts[i].value.tokenInfo.gender == 2
      ) {
        femaleIds.push(nfts[i]);
      }
    }
    setFemaleNftIds(femaleIds);
  };

  const breed = async () => {
    if (!isConnected) throw Error("User disconnected");

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const signerContract = new Contract(contractAddress, abi, signer);

    let tx = await signerContract.breed(selectedHusband.id, selectedWife.id);

    const receipt = await tx.wait();
    console.log(receipt);
  };

  const checkHandleMale = (id) => {
    setSelectedHusband(id);
  };
  const checkHandleFemale = (id) => {
    setSelectedWife(id);
  };

  return (
    <>
      <Modal
        show={isMaleModalOpen}
        size="lg"
        onHide={() => {
          setIsMaleModalOpen(false);
          setSelectedHusband(0);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={1} sm={2} md={3} lg={4} xl={4} xxl={5} gap={4}>
            {maleNftIds?.map((nftId) => (
              <Col
                key={nftId.value.id}
                style={{ margin: 0, paddingRight: 170 }}
              >
                <Card
                  border="dark"
                  className="text-center"
                  style={{ width: "10rem" }}
                >
                  <Card.Img src={nftId.value.url} />
                  <Card.Title>{nftId.value.name}</Card.Title>
                  <Card.Footer>
                    <Form.Check
                      type="radio"
                      name="MaleNft"
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
          setSelectedWife(0);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={1} sm={2} md={3} lg={4} xl={4} xxl={5} gap={4}>
            {femaleNftIds?.map((nftId) => (
              <Col
                key={nftId.value.id}
                style={{ margin: 0, paddingRight: 170 }}
              >
                <Card
                  border="dark"
                  className="text-center"
                  style={{ width: "10rem" }}
                >
                  <Card.Img src={nftId.value.url} />
                  <Card.Title>{nftId.value.name}</Card.Title>
                  <Card.Footer>
                    <Form.Check
                      type="radio"
                      name="FemaleNft"
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
                <Image fluid src={selectedHusband.url} />
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
                <Image fluid src={selectedWife.url} />
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
          >
            Breed Now
          </Button>
        </div>
      </div>
    </>
  );
}

export default Breed;
