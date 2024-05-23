import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Modal } from "react-bootstrap";
import * as s from "../Style/globalStyles";

import dragonContractData from "../contracts/dragonContract";
import { fetchNfts } from "../blockchain/fetchData";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
const contractAddress = dragonContractData.AddressSepolia;
const abi = dragonContractData.Abi;

function Collection() {
  const [nftIds, setNftIds] = useState([]);
  const [show, setShow] = useState(false);

  const [gender, setGender] = useState();
  const [father, setFather] = useState();
  const [mother, setMother] = useState();
  const [generation, setGeneration] = useState();
  const [stage, setStage] = useState();

  const [timeRemaining, setTimeRemaining] = useState();
  const [selectedNft, setSelectedNft] = useState();

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  useEffect(() => {
    fetchMyNfts();
  }, []);

  const fetchMyNfts = async () => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const nfts = await fetchNfts(ethersProvider, address);
    setNftIds(nfts);
  };

  const getTokenInfo = async (info) => {
    let gender = Number(info.gender);
    let father = Number(info.husband);
    let mother = Number(info.wifeId);
    let generation = Number(info.generation);
    let growth = info.growth;
    setGender(gender);
    setFather(father);
    setMother(mother);
    setGeneration(generation);
    setStage(growth);
    setShow(true);
  };

  const feeding = async () => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const signerContract = new Contract(contractAddress, abi, signer);
    let tx = await signerContract.feeding(selectedNft);
    const receipt = await tx.wait();
    console.log(receipt);
  };

  const evolve = async () => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const signerContract = new Contract(contractAddress, abi, signer);

    let tx = await signerContract.evolve(selectedNft);
    const receipt = await tx.wait();
    console.log(receipt);
  };

  const getGrowthInfo = async (tokenId) => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const providerContract = new Contract(contractAddress, abi, ethersProvider);
    const growInfo = await providerContract.getGrowthInfo(tokenId);
    setTimeRemaining(Number(growInfo.timeRemaining));
    setSelectedNft(tokenId);
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
              <li>Gender : {gender % 2 == 0 ? "Female" : "Male"}</li>
              <li>Father TokenId : {father}</li>
              <li>Mother TokenId : {mother}</li>
              <li>Generation : {generation} Gen</li>
            </ul>
            <ul>
              <li>CurrentStage : {stage}</li>
              <li>timeRemaining : {timeRemaining}</li>
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
            <Col key={nftId.value.id} style={{ margin: 0, paddingRight: 200 }}>
              <Card
                border="dark"
                className="text-center"
                style={{ width: "12rem" }}
              >
                <Card.Img
                  src={nftId.value.url}
                  style={{ width: "100%", height: "190px" }}
                />

                <Card.Title>{nftId.value.name}</Card.Title>
                <Card.Footer>
                  <Button
                    variant="outline-info"
                    onClick={() => {
                      getTokenInfo(nftId.value.tokenInfo);
                      getGrowthInfo(nftId.value.id);
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
