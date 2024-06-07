import React, { useEffect, useState } from "react";
import * as s from "../Style/globalStyles";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, formatEther, Contract } from "ethers";
import { useNavigate } from "react-router-dom";

import {
  fetchMarketItems,
  fetchMarketMyItems,
  fetchMarketLog,
} from "../blockchain/fetchMarketData";

import { Button, Card, Col, Row } from "react-bootstrap";
import marketContractData from "../contracts/marketContract";

const marketContractAddress = marketContractData.AddressSepolia;
const marketAbi = marketContractData.Abi;

function MarketPlace() {
  const [marketItems, setMarketItems] = useState([]);
  const [marketItemLog, setMarketItemLog] = useState([]);
  const [myMarketItems, setMyMarketItems] = useState([]);
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [currentView, setCurrentView] = useState("market");
  const navigate = useNavigate();

  // fetch market listed item
  useEffect(() => {
    const init = async () => {
      try {
        if (!isConnected) throw Error("User disconnected");
        const ethersProvider = new BrowserProvider(walletProvider);
        const items = await fetchMarketItems(ethersProvider);
        setMarketItems(items);
      } catch (error) {
        console.error("Failed to fetch supply data:", error);
      }
    };
    init();
  }, [isConnected]);

  const handleItemClick = (itemId) => {
    navigate(`/item/${itemId}`);
  };

  const handleUnsell = async (itemId) => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const providerContract = new Contract(
        marketContractAddress,
        marketAbi,
        signer
      );

      let tx = await providerContract.unlistItem(itemId);
      const receipt = await tx.wait();
      console.log(receipt);
    } catch (error) {
      console.error("Failed to unsell item: ", error);
    }
  };

  // fetch my listing item
  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const items = await fetchMarketMyItems(ethersProvider);

        setMyMarketItems(items);
      } catch (error) {
        console.error("Failed to fetch nft data:", error);
      }
    };
    if (currentView == "trading") {
      fetchMyItems();
    }
  }, [currentView, walletProvider]);

  // fetch market history
  useEffect(() => {
    const fetchItemLog = async () => {
      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const items = await fetchMarketLog(ethersProvider);
        setMarketItemLog(items);
      } catch (error) {
        console.error("Failed to fetch nft data:", error);
      }
    };
    if (currentView == "history") {
      fetchItemLog();
    }
  }, [currentView, walletProvider]);

  return (
    <s.Screen>
      <s.Container
        className="container"
        style={{
          padding: "0 10px 50px",
          width: "100%",
        }}
      >
        <h1>NFT MarketPlace</h1>
        <div style={{ marginBottom: "20px", marginRight: "20px" }}>
          <Button
            variant="secondary"
            style={{ marginRight: "20px" }}
            onClick={() => setCurrentView("market")}
          >
            Sell
          </Button>
          <Button
            variant="secondary"
            style={{ marginRight: "20px" }}
            onClick={() => setCurrentView("trading")}
          >
            Trading
          </Button>
          <Button
            variant="secondary"
            style={{ marginRight: "20px" }}
            onClick={() => setCurrentView("history")}
          >
            History
          </Button>
        </div>
        <h2>
          {currentView == "market"
            ? "market Items"
            : currentView == "trading"
            ? "Trading"
            : "History"}
        </h2>
        {currentView == "market" && (
          <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
            {marketItems?.map((item) => (
              <Col style={{ margin: 0, paddingRight: 200 }}>
                <Card
                  border="dark"
                  className="text-center"
                  style={{
                    width: "12rem",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0, 0, 0, 0.2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <Card.Img
                    style={{ width: "100%", height: "190px" }}
                    src={item.imageUrl}
                  />
                  <Card.Title>{item.tokenName}</Card.Title>
                  <Card.Footer>
                    <Card.Text>Price: {formatEther(item.price)} ETH</Card.Text>
                    {item.owner.toLowerCase() == address.toLowerCase() && (
                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsell(item.id);
                        }}
                      >
                        Unsell
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        {currentView == "trading" && (
          <div>
            <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
              {myMarketItems?.map((item) => (
                <Col style={{ margin: 0, paddingRight: 200 }}>
                  <Card
                    border="dark"
                    className="text-center"
                    style={{
                      width: "12rem",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onClick={() => handleItemClick(item.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 8px rgba(0, 0, 0, 0.2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <Card.Img
                      style={{ width: "100%", height: "190px" }}
                      src={item.imageUrl}
                    />
                    <Card.Title>{item.tokenName}</Card.Title>
                    <Card.Footer>
                      <Card.Text>
                        Price: {formatEther(item.price)} ETH
                      </Card.Text>

                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsell(item.id);
                        }}
                      >
                        Unsell
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
            {/* <h2 style={{ float: "left" }}>Expired</h2>
            <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
              {expiredItems?.map((item) => (
                <Col
                  key={item.id}
                  style={{ margin: 0, paddingRight: 200 }}
                ></Col>
              ))}
            </Row> */}
          </div>
        )}

        {currentView == "history" && (
          <Row xs={1} sm={2} md={3} lg={4} xl={5} xxl={5} gap={4}>
            {marketItemLog?.map((item) => (
              <Col style={{ margin: 0, paddingRight: 200 }}>
                <Card
                  border="dark"
                  className="text-center"
                  style={{
                    width: "12rem",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0, 0, 0, 0.2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <Card.Img
                    style={{ width: "100%", height: "190px" }}
                    src={item.imageUrl}
                  />
                  <Card.Title>{item.tokenName}</Card.Title>
                  <Card.Footer>
                    <Card.Text>Price: {formatEther(item.price)} ETH</Card.Text>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </s.Container>
    </s.Screen>
  );
}
export default MarketPlace;
