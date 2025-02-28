# Certificate Routes Explanation

This document provides a detailed explanation of the functions and routes defined in `routes/certificateRoutes.js`.

## Overview

The `certificateRoutes.js` file defines the API endpoints for certificate-related operations. It uses Express.js for routing and interacts with the blockchain through a smart contract. The file also utilizes IPFS (via Pinata) for storing certificate data off-chain.

## Dependencies

- `express`: Web application framework for Node.js
- `crypto-js`: JavaScript library of crypto standards
- `ethers`: Complete Ethereum wallet implementation and utilities in JavaScript
- `../utils/ipfsUtils.js`: Custom module for IPFS interactions
- `../utils/contract.js`: Custom module for blockchain contract interactions
- `../logger.js`: Custom logging module

## Routes and Functions

### 1. Issue Certificate

**Endpoint**: `POST /issue-certificate`

**Function**: This route handles the issuance of a new certificate.

**Process**:
1. Receives certificate data (student name, course name, etc.) from the request body.
2. Creates a new Ethereum wallet for the student.
3. Prepares certificate data including the student's Ethereum address.
4. Uploads the certificate data to IPFS and receives a CID (Content Identifier).
5. Encrypts the CID using AES encryption.
6. Creates a hash of the encrypted data and signs it.
7. Calls the smart contract to issue the certificate on the blockchain.
8. Waits for the transaction to be mined.
9. Returns the transaction details and student's Ethereum address.

**Error Handling**: Logs errors and returns a 500 status code with an error message.

### 2. View Certificate

**Endpoint**: `GET /view-certificate/:studentAddress`

**Function**: This route retrieves and decrypts a certificate for a given student address.

**Process**:
1. Retrieves the student's address from the request parameters.
2. Calls the smart contract to get the encrypted certificate data.
3. Decrypts the data to get the IPFS CID.
4. Fetches the full certificate data from IPFS.
5. Returns the decrypted certificate data.

**Error Handling**: Logs errors and returns a 500 status code with an error message.

### 3. Verify Certificate

**Endpoint**: `GET /verify-certificate/:studentAddress`

**Function**: This route verifies the authenticity of a certificate for a given student address.

**Process**:
1. Retrieves the student's address from the request parameters.
2. Calls the smart contract to check if the certificate is issued and not revoked.
3. If valid, fetches the certificate details from the contract.
4. Verifies the signature of the certificate data.
5. Compares the signer's address with the expected signer address.
6. Returns the verification result.

**Error Handling**: Logs errors and returns a 500 status code with an error message.

## Security Considerations

- The AES secret key used for encryption should be kept secure and not exposed.
- The signer's private key should be protected and not shared or exposed in the code.
- Input validation should be implemented to prevent potential injection attacks.

## Logging

The routes use a custom logger to log important events and errors. This is crucial for debugging and monitoring the application's behavior.

## IPFS Integration

Certificate data is stored on IPFS using Pinata, which provides a more decentralized and permanent storage solution compared to traditional databases.

## Blockchain Interaction

The routes interact with a smart contract deployed on the Polygon network. Ensure that the contract address and ABI in `../utils/contract.js` are up to date and correct.