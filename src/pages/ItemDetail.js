import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Row, Col, CardFooter } from "react-bootstrap";
import { fetchMarketItems } from "../blockchain/fetchMarketData";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, formatUnits } from "ethers";

function ItemDetail() {
  const { walletProvider } = useWeb3ModalProvider();
  const { id } = useParams(); // URL에서 아이템 ID를 가져옴
  const [marketItem, setMarketItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const marketData = await fetchMarketItems(ethersProvider);
        const marketItemData = marketData.find((item) => item.id == id);
        setMarketItem(marketItemData);
      } catch (error) {
        console.error("Failed to fetch item data: ", error);
      }
    };
    fetchData();
  }, [id]);

  if (!marketItem) {
    return <div>Loading...</div>;
  }

  const { tokenInfo, imageUrl, tokenName, price, growthInfo } = marketItem;
  const remainingTime = growthInfo.timeRemaining;

  const displayTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${days} days ${hours} hours ${minutes} minutes ${remainingSeconds} seconds`;
  };

  return (
    <div>
      <h2>Item Detail</h2>
      <Row>
        <Col md={5}>
          <Card>
            <Card.Img variant="top" src={imageUrl} alt={tokenName} />
            <Card.Body>
              <Card.Title>{tokenName}</Card.Title>
              <CardFooter>
                <Card.Title>Details</Card.Title>

                <ul>
                  <li>
                    <strong>Gender: </strong>
                    {tokenInfo.gender.toString() % 2 == 0 ? "Female" : "Male"}
                  </li>
                  <li>
                    <strong>Husband Id: </strong>
                    {tokenInfo.husbandId.toString()}
                  </li>
                  <li>
                    <strong>Wife Id: </strong>
                    {tokenInfo.wifeId.toString()}
                  </li>
                  <li>
                    <strong>Generation: </strong>
                    {tokenInfo.generation.toString()}
                  </li>
                  <li>
                    <strong>Birth: </strong>
                    {new Date(
                      parseInt(tokenInfo.birth) * 1000
                    ).toLocaleDateString()}
                  </li>
                  <li>
                    <strong>Type: </strong>
                    {tokenInfo.tokenType.toString()}
                  </li>
                  <li>
                    <strong>Remaining Time: </strong>
                    {displayTime(Number(remainingTime))}
                  </li>
                </ul>
              </CardFooter>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Sale End</Card.Title>
              <p></p>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Price</Card.Title>
              <p>
                <strong>Price: </strong>
                {formatUnits(price.toString(), "ether")} ETH
              </p>

              <Button variant="primary">Buy Now</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ItemDetail;
