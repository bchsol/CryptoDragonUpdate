import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";

import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers/react";

function Heading() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const truncateAccount = address
    ? address.substring(0, 6) + "..." + address.substring(address.length - 4)
    : null;

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          {/* <Navbar.Brand href="/home"></Navbar.Brands> */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link
                to="/"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Mint
              </Link>

              <Link
                to="/breed"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Breed
              </Link>

              <Link
                to="/collection"
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginRight: "25px",
                  fontSize: "20px",
                }}
              >
                Collection
              </Link>
            </Nav>
            <Button variant="outline-dark" onClick={() => open()}>
              {!isConnected ? "Connect Wallet" : truncateAccount}
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Heading;
