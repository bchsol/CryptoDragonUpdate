import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Modal, DropdownButton } from "react-bootstrap";
import * as s from "../Style/globalStyles";

import dragonContractData from "../contracts/dragonContract";
import { fetchNfts } from "../blockchain/fetchData";

import marketContractData from "../contracts/marketContract";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, parseUnits } from "ethers";

import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const dragonContractAddress = dragonContractData.AddressSepolia;
const dragonAbi = dragonContractData.Abi;

const marketContractAddress = marketContractData.AddressSepolia;
const marketAbi = marketContractData.Abi;

function Collection() {
  const [nftIds, setNftIds] = useState([]);
  const [listedStatus, setListedStatus] = useState({});
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

  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  const [price, setPrice] = useState();
  const [duration, setDuration] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sellSelectNft, setSellSelectNft] = useState();

  const marketFeeRate = 0.025;

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

    const signer = await ethersProvider.getSigner();
    const marketContract = new Contract(
      marketContractAddress,
      marketAbi,
      signer
    );

    const statuses = await Promise.all(
      nfts.map(async (nft) => {
        const isListed = await marketContract.isListed(
          dragonContractAddress,
          nft.id
        );
        return { id: nft.id, listed: isListed };
      })
    );

    const listedStatusMap = {};
    statuses.forEach((status) => {
      listedStatusMap[status.id] = status.listed;
    });
    setListedStatus(listedStatusMap);
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
      const signerContract = new Contract(
        dragonContractAddress,
        dragonAbi,
        signer
      );
      let tx = await signerContract.feeding(selectedNft);
      const receipt = await tx.wait();
      console.log(receipt);

      alert("Success");
      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
  };

  const evolve = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const signerContract = new Contract(
        dragonContractAddress,
        dragonAbi,
        signer
      );

      let tx = await signerContract.evolve(selectedNft);
      const receipt = await tx.wait();
      console.log(receipt);

      alert("Success");
      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Failed");
    }
  };

  const getGrowthInfo = async (tokenId) => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const providerContract = new Contract(
      dragonContractAddress,
      dragonAbi,
      ethersProvider
    );
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

  const handleDurationSelect = (value) => {
    const durationMap = {
      "1 hour": 1,
      "6 hours": 6,
      "1 day": 24,
      "3 days": 72,
      "7 days": 168,
      "1 month": 720,
      "3 months": 2160,
      "6 months": 4320,
    };

    const hours = durationMap[value];
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);

    const formattedEndTime = endTime.toLocaleString();
    setEndTime(formattedEndTime);
    setDuration(value);
  };

  const listNftForSale = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const marketContract = new Contract(
        marketContractAddress,
        marketAbi,
        signer
      );
      const dragonContract = new Contract(
        dragonContractAddress,
        dragonAbi,
        signer
      );

      if (
        (await dragonContract.isApprovedForAll(
          address,
          marketContractAddress
        )) == false
      ) {
        console.log("approve");
        await dragonContract.setApprovalForAll(marketContractAddress, true);
      }

      let tx = await marketContract.listItem(
        dragonContractAddress,
        Number(sellSelectNft),
        parseUnits(price)
      );
      const receipt = await tx.wait();
      console.log(receipt);

      alert("Success");
      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Listing Failed");
    }
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;

    if (/^\d{0,10}(\.\d{0,10})?$/.test(value)) {
      setPrice(value);
    }
  };

  const calculateEarnings = () => {
    const priceValue = parseFloat(price);

    if (!isNaN(priceValue)) {
      return (priceValue * (1 - marketFeeRate))
        .toFixed(10)
        .replace(/\.?0*$/, "");
    }
    return "0";
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

        <Modal
          show={isSellModalOpen}
          size="lg"
          centered
          onHide={() => {
            setIsSellModalOpen(false);
            setPrice();
            setDuration("");
            setSellSelectNft(null);
            setEndTime();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Sell</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={price}
                    onChange={handlePriceChange}
                    aria-label="Dollar amount"
                    type="text"
                  />
                  <InputGroup.Text>ETH</InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Duration</Form.Label>
                <InputGroup>
                  <Form.Control
                    readOnly
                    value={endTime}
                    arial-label="End Time"
                  />
                  <DropdownButton
                    variant="outline-secondary"
                    title={duration || `Select duration`}
                    id="input-group-dropdown"
                    align="end"
                    onSelect={handleDurationSelect}
                  >
                    <Dropdown.Item eventKey="1 hour">1 hour</Dropdown.Item>
                    <Dropdown.Item eventKey="6 hours">6 hours</Dropdown.Item>
                    <Dropdown.Item eventKey="1 day">1 day</Dropdown.Item>
                    <Dropdown.Item eventKey="3 days">3 days</Dropdown.Item>
                    <Dropdown.Item eventKey="7 days">7 days</Dropdown.Item>
                    <Dropdown.Item eventKey="1 month">1 month</Dropdown.Item>
                    <Dropdown.Item eventKey="3 months">3 months</Dropdown.Item>
                    <Dropdown.Item eventKey="6 months">6 months</Dropdown.Item>
                  </DropdownButton>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Summary</Form.Label>
                <div>
                  <div>Listing price : {price || "0"} ETH</div>
                  <div>Market fee: 2.5%</div>
                  <div>Total potential earnings: {calculateEarnings()} ETH</div>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-dark"
              onClick={() => {
                listNftForSale();
              }}
            >
              Listing
            </Button>
          </Modal.Footer>
        </Modal>

        <h1>Collection</h1>
        <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
          {nftIds?.map((nftId) => (
            <Col key={nftId.id} style={{ margin: 0, paddingRight: 200 }}>
              <Card border="dark" style={{ width: "12rem" }}>
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
                    style={{ marginRight: "15px" }}
                  >
                    Info
                  </Button>

                  {listedStatus[nftId.id] ? (
                    <Button variant="outline-danger" disabled>
                      Trading...
                    </Button>
                  ) : (
                    <Button
                      variant="outline-danger"
                      onClick={() => {
                        setIsSellModalOpen(true);
                        setSellSelectNft(nftId.id);
                      }}
                    >
                      Sell
                    </Button>
                  )}
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
