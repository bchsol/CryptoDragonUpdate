import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { Contract } from "ethers";

import questContractData from "../contracts/questContract";
import { getQuestData } from "../blockchain/fetchQuestData";

import dailyContractData from "../contracts/dailyCheck";

import "../Style/Quest.css";
import { BrowserProvider } from "ethers";

const questContract = questContractData.AddressSepolia;
const questAbi = questContractData.Abi;

const dailyContract = dailyContractData.AddressSepolia;
const dailyAbi = dailyContractData.Abi;

const Quest = () => {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [checkInTrigger, setCheckInTrigger] = useState(false);

  const [questData, setQuestData] = useState({
    exploration: false,
    battle: false,
  });

  const [consecutive, setConsecutive] = useState(0);

  useEffect(() => {
    const fetchQuestData = async () => {
      if (address) {
        const ethersProvider = new BrowserProvider(walletProvider);
        const data = await getQuestData(ethersProvider, address);
        setQuestData({
          battle: data.battleCompleted,
          exploration: data.exploreCompleted,
        });
      }
    };

    fetchQuestData();
  }, [address]);

  useEffect(() => {
    const getDailyCheck = async () => {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const providerContract = new Contract(dailyContract, dailyAbi, signer);

      const data = await providerContract.getConsecutiveDailyChecks(address);
      setConsecutive(data);
    };
    getDailyCheck();
  }, [questData, address, checkInTrigger]);

  const claimBattle = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const providerContract = new Contract(questContract, questAbi, signer);

      let tx = await providerContract.requestBattleReward();
      const receipt = await tx.wait();
      console.log(receipt);
    } catch (error) {
      console.error("Transaction Failed: ", error);
    }
  };

  const claimExplore = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const providerContract = new Contract(questContract, questAbi, signer);

      let tx = await providerContract.requestExploreReward();
      const receipt = await tx.wait();
      console.log(receipt);
    } catch (error) {
      console.error("Transaction Failed: ", error);
    }
  };

  const calimAll = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const providerContract = new Contract(questContract, questAbi, signer);

      let tx = await providerContract.requestAllReward();
      const receipt = await tx.wait();
      console.log(receipt);
    } catch (error) {
      console.error("Transaction Failed: ", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const providerContract = new Contract(dailyContract, dailyAbi, signer);

      let tx = await providerContract.dailyCheck();
      const receipt = await tx.wait();
      console.log(receipt);
      setCheckInTrigger(!checkInTrigger);
    } catch (error) {
      console.error("Transaction Failed: ", error);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h1>Quest Check</h1>
          <p>Account: {address}</p>
        </Col>
      </Row>
      <Row className="mb-3 align-items-center">
        <Col>
          <Card className="daily-check-card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title>Daily Check</Card.Title>
                <Row>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Col key={index} className="mb-2">
                      <div
                        className={`day-circle ${
                          index < consecutive ? "checked" : ""
                        }`}
                      >
                        {index + 1}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
              <Button onClick={() => handleCheckIn()}>Check In</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-3 small-card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <Card.Title>Exploration</Card.Title>
              <Card.Text>
                {questData.exploration ? "Completed" : "Not Completed"}
              </Card.Text>
              <Button
                onClick={() => claimExplore()}
                disabled={!questData.exploration}
              >
                Claim
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-3 small-card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <Card.Title>Battle</Card.Title>
              <Card.Text>
                {questData.battle ? "Completed" : "Not Completed"}
              </Card.Text>
              <Button
                onClick={() => claimBattle()}
                disabled={!questData.battle}
              >
                Claim
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Quest;
