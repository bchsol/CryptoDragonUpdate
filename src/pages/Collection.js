import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Modal } from "react-bootstrap";
import * as s from "../Style/globalStyles";

import dragonContractData from "../contracts/dragonContract";
import { fetchNfts } from "../blockchain/fetchData";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";
const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

function Collection() {
  const [nftIds, setNftIds] = useState([]);
  const [show, setShow] = useState(false);

  const [tokenType, setTokenType] = useState("");
  const [gender, setGender] = useState();
  const [father, setFather] = useState();
  const [mother, setMother] = useState();
  const [generation, setGeneration] = useState();
  const [stage, setStage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState();
  const [selectedNft, setSelectedNft] = useState();

  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [isEvolveBtnEnabled, setIsEvolveBtnEnabled] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchMyNfts().catch((error) => console.error(error));
    }
  }, [isConnected]);

  useEffect(() => {
    if (timeRemaining == 0 && stage !== "adult") {
      setIsEvolveBtnEnabled(true);
    } else {
      setIsEvolveBtnEnabled(false);
    }
  }, [timeRemaining, stage]);

  const fetchMyNfts = async () => {
    if (!isConnected) throw Error("User disconnected");
    const ethersProvider = new BrowserProvider(walletProvider);
    const nfts = await fetchNfts(ethersProvider, address);
    setNftIds(nfts);
  };

  const getTokenInfo = async (info) => {
    setTokenType(info.tokenType);
    setGender(Number(info.gender));
    setFather(Number(info.husbandId));
    setMother(Number(info.wifeId));
    setGeneration(Number(info.generation));
    setShow(true);
  };

  const feeding = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerContract = new Contract(contractAddress, abi, signer);
      let tx = await signerContract.feeding(selectedNft);
      const receipt = await tx.wait();
      console.log(receipt);

      alert("Success");
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
  };

  const evolve = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerContract = new Contract(contractAddress, abi, signer);

      let tx = await signerContract.evolve(selectedNft);
      const receipt = await tx.wait();
      console.log(receipt);

      alert("Success");
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
  };

  const getGrowthInfo = async (tokenId) => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const providerContract = new Contract(contractAddress, abi, ethersProvider);
    const growInfo = await providerContract.getGrowthInfo(tokenId);

    let currentStage;

    switch (Number(growInfo.currentStage)) {
      case 0:
        currentStage = "egg";
        break;
      case 1:
        currentStage = "hatch";
        break;
      case 2:
        currentStage = "hatchling";
        break;
      case 3:
        currentStage = "adult";
      default:
        break;
    }
    setStage(currentStage);
    setTimeRemaining(Number(growInfo.timeRemaining));
    setSelectedNft(tokenId);
  };

  const displayTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${days} days ${hours} hours ${minutes} minutes ${remainingSeconds} seconds`;
  };

  return (
    <s.Screen>
      <s.Container
        className="container"
        style={{
          padding: "0 10px 50px",
          width: "100%",
        }}
      >
        <Modal
          show={show}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          onHide={() => {
            setShow(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Token Info
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              <li>Type : {tokenType}</li>
              <li>Gender : {gender % 2 == 0 ? "Female" : "Male"}</li>
              <li>Father TokenId : {father}</li>
              <li>Mother TokenId : {mother}</li>
              <li>Generation : {generation} Gen</li>
            </ul>
            <ul>
              <li>CurrentStage : {stage}</li>
              <li>timeRemaining : {displayTime(timeRemaining)}</li>
            </ul>
            <Button
              style={{ marginLeft: 20, marginRight: 20 }}
              onClick={() => {
                feeding();
              }}
            >
              Feed
            </Button>

            <Button
              disabled={!isEvolveBtnEnabled}
              onClick={() => {
                evolve();
              }}
            >
              Evolve
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-dark"
              onClick={() => {
                setShow(false);
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <h1>Collection</h1>
        <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
          {nftIds?.map((nftId) => (
            <Col key={nftId.id} style={{ margin: 0, paddingRight: 200 }}>
              <Card
                border="dark"
                className="text-center"
                style={{ width: "12rem" }}
              >
                <Card.Img
                  src={nftId.imageUrl}
                  style={{ width: "100%", height: "190px" }}
                />

                <Card.Title>{nftId.name}</Card.Title>
                <Card.Footer>
                  <Button
                    variant="outline-info"
                    onClick={() => {
                      getTokenInfo(nftId.tokenInfo);
                      getGrowthInfo(nftId.id);
                    }}
                  >
                    Info
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </s.Container>
    </s.Screen>
  );
}

export default Collection;
