import React, { useState, useEffect } from "react";
import {
  QuestContainer,
  QuestTitle,
  AccountText,
  QuestCard,
  CardTitle,
  CardText,
  ActionButton,
  DailyCheckContainer,
  DailyCheckButton,
  DayCircle,
  DayCirclesGroup,
} from "../Style/QuestStyles";

import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { Contract, BrowserProvider } from "ethers";
import questContractData from "../contracts/questContract";
import { getQuestData } from "../blockchain/fetchQuestData";
import dailyContractData from "../contracts/dailyCheck";

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
    <QuestContainer>
      <QuestTitle>Quest Check</QuestTitle>
      <AccountText>Account: {address}</AccountText>

      <QuestCard>
        <DailyCheckContainer>
          <div>
            <CardTitle>Daily Check</CardTitle>
            <DayCirclesGroup>
              {Array.from({ length: 7 }).map((_, index) => (
                <DayCircle key={index} checked={index < consecutive}>
                  {index + 1}
                </DayCircle>
              ))}
            </DayCirclesGroup>
          </div>
          <DailyCheckButton onClick={() => handleCheckIn()}>
            Check In
          </DailyCheckButton>
        </DailyCheckContainer>
      </QuestCard>

      <QuestCard>
        <CardTitle>Exploration</CardTitle>
        <CardText>
          {/*questData.exploration ? "Completed" : "Not Completed"*/}
          Soon
        </CardText>
        <ActionButton onClick={claimExplore} disabled>
          Claim
        </ActionButton>
      </QuestCard>

      <QuestCard>
        <CardTitle>Battle</CardTitle>
        <CardText>
          {/*questData.battle ? "Completed" : "Not Completed"*/}
          Soon
        </CardText>
        <ActionButton onClick={claimBattle} disabled>
          Claim
        </ActionButton>
      </QuestCard>
    </QuestContainer>
  );
};

export default Quest;
