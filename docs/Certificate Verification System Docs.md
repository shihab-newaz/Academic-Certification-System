# LEAD Academy Certificate Verification System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
   - [Smart Contract](#smart-contract)
   - [Express.js API](#expressjs-api)
   - [Laravel Backend](#laravel-backend)
   - [React Frontend](#react-frontend)
4. [Installation & Setup](#installation--setup)
5. [API Documentation](#api-documentation)
6. [User Guides](#user-guides)
7. [Development Guidelines](#development-guidelines)
8. [Troubleshooting](#troubleshooting)

## System Overview

The LEAD Academy Certificate Verification System is a blockchain-based solution for issuing, verifying, and managing educational certificates. The system leverages blockchain technology to create tamper-proof digital credentials that can be easily shared and verified by third parties.

**Key Features:**
- Issue digital certificates on the Polygon blockchain
- Verify certificate authenticity
- View certificate details
- Share certificates via social media
- Add certificates to LinkedIn profiles
- Download certificates as PDF

**Technology Stack:**
- **Blockchain**: Solidity smart contracts on Polygon
- **Backend**: Express.js API for blockchain interaction, Laravel 11 for LMS integration
- **Frontend**: React with Vite, Tailwind CSS
- **Storage**: IPFS (via Pinata) for certificate data, MySQL for metadata

## Architecture

The system follows a layered architecture with the following components:

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │     │                   │
│  React Frontend   │────►│   Laravel LMS     │────►│   Express.js API  │────►│  Polygon Network  │
│                   │     │                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘     └───────────────────┘
                                  │                           │
                                  │                           │
                                  ▼                           ▼
                          ┌───────────────┐           ┌───────────────┐
                          │               │           │               │
                          │  MySQL DB     │           │  IPFS Storage │
                          │               │           │  (Pinata)     │
                          └───────────────┘           └───────────────┘
```

**Data Flow:**
1. User requests certificate issuance through the React frontend
2. Laravel backend receives the request and forwards it to the Express.js API
3. Express.js API generates certificate data and uploads it to IPFS
4. Express.js API initiates a blockchain transaction to issue the certificate on Polygon
5. Transaction details are returned to Laravel and stored in MySQL database
6. Certificate viewing and verification follow a similar flow

## Components

### Smart Contract

The `CertificateContract` is a Solidity smart contract deployed on the Polygon blockchain that manages the issuance, revocation, and verification of educational certificates.

**Key Functions:**
- `issueCertificate`: Issues a new certificate to a recipient
- `revokeCertificate`: Revokes a previously issued certificate
- `verifyCertificate`: Verifies if a certificate is valid for a given recipient
- `viewCertificate`: Retrieves the details of a certificate for a given student address

**Contract Structure:**
- Inherits from OpenZeppelin's `Ownable` and `Pausable` contracts
- Uses a `Certificate` struct to store certificate data
- Maintains mappings between recipient addresses and certificates
- Emits events for certificate issuance and revocation

### Express.js API

The Express.js API serves as a middleware between the Laravel backend and the blockchain network, handling all blockchain-related operations.

**Key Endpoints:**
- `/certificate/issue-certificate`: Issues a new certificate
- `/certificate/view-certificate/:studentAddress`: Views a certificate
- `/certificate/verify-certificate/:studentAddress`: Verifies a certificate
- `/admin/certificate-count`: Gets the total count of certificates
- `/admin/contract-paused`: Checks if the contract is paused
- `/admin/toggle-pause`: Toggles the pause state of the contract
- `/admin/network-info`: Gets information about the blockchain network

**Utilities:**
- `contract.js`: Handles interaction with the smart contract
- `ipfsUtils.js`: Manages IPFS operations via Pinata

### Laravel Backend

The Laravel application serves as the main backend system, integrating with the Express.js API and providing web routes and controllers for certificate management.

**Key Controllers:**
- `CertificateController`: Manages certificate-related operations
- `AdminController`: Handles administrative functions

**Routes:**
- Public: `/certificate/claim`, `/view-certificate/:studentAddress`
- Admin: `/admin/dashboard`, `/admin/certificate-count`, etc.

**Database Models:**
- `Certificate`: Stores certificate metadata and blockchain references

### React Frontend

The React frontend provides the user interface for the certificate system, allowing users to view, verify, and share certificates.

**Key Components:**
- `ViewCertificateComponent`: Displays certificate details and verification status
- `ShareCredential`: Allows sharing certificates on social media
- `CredentialVerification`: Handles certificate verification
- `CredentialInfo`: Displays detailed certificate information
- `Navbar`: Provides navigation and branding
- `IssuerInfo`: Shows information about the certificate issuer

**UI Features:**
- Responsive design using Tailwind CSS
- Social sharing integrations
- QR code generation
- PDF download functionality

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PHP 8.2+ and Composer
- MySQL 8.0+
- Metamask or similar Web3 provider
- Polygon network access (Amoy testnet or Mainnet)

### Smart Contract Deployment
1. Install dependencies:
   ```bash
   npm install @openzeppelin/contracts
   ```

2. Deploy the contract to Polygon using a suitable deployment tool (Truffle, Hardhat, Remix)

3. Note the contract address and ABI for configuration

### Express.js API Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd la-bc-certificate-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```
   # Create a .env file with the following variables
   CONTRACT_ADDRESS=<your-contract-address>
   PRIVATE_KEY=<your-private-key>
   PROVIDER_RPC_URL=<polygon-rpc-url>
   AES_SECRET_KEY=<encryption-key>
   PINATA_JWT=<pinata-jwt-token>
   PINATA_GATEWAY=<pinata-gateway-url>
   PORT=3999
   ```

4. Start the API:
   ```bash
   npm start
   ```

### Laravel Application Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd laravel-app
   ```

2. Install dependencies:
   ```bash
   composer install
   npm install
   ```

3. Configure environment variables:
   ```
   # Add to your .env file
   BLOCKCHAIN_SERVICE_URL=http://localhost:3999
   ```

4. Set up the database:
   ```bash
   php artisan migrate
   ```

5. Start the application:
   ```bash
   php artisan serve
   npm run dev
   ```

## API Documentation

### Express.js API Endpoints

#### Certificate Endpoints

**Issue Certificate**
- **URL**: `/certificate/issue-certificate`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "studentName": "Student Name",
    "courseName": "Course Name",
    "studentId": "1",
    "courseId": "COURSE-123",
    "issuedDate": "2024-02-27"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Certificate issued successfully",
    "student_eth_address": "0x...",
    "transactionHash": "0x...",
    "blockNumber": 123456,
    "ipfsCID": "Qm..."
  }
  ```

**View Certificate**
- **URL**: `/certificate/view-certificate/:studentAddress`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "certificateData": {
      "studentName": "Student Name",
      "courseName": "Course Name",
      "studentId": "1",
      "courseId": "COURSE-123",
      "issueDate": "2024-02-27"
    }
  }
  ```

**Verify Certificate**
- **URL**: `/certificate/verify-certificate/:studentAddress`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Certificate verification successful"
  }
  ```

#### Admin Endpoints

**Get Certificate Count**
- **URL**: `/admin/certificate-count`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "count": 10
  }
  ```

**Check Contract Paused**
- **URL**: `/admin/contract-paused`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "isPaused": false
  }
  ```

**Toggle Contract Pause**
- **URL**: `/admin/toggle-pause`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Contract paused successfully"
  }
  ```

**Get Network Info**
- **URL**: `/admin/network-info`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "chainId": 80002,
    "networkName": "Polygon Amoy"
  }
  ```

### Laravel API Endpoints

**View Certificate**
- **URL**: `/api/view-certificate/:studentAddress`
- **Method**: `GET`
- **Response**: Same as Express.js view certificate endpoint

**Verify Certificate**
- **URL**: `/api/verify-certificate/:studentAddress`
- **Method**: `GET`
- **Response**: Same as Express.js verify certificate endpoint

**Get All Certificates**
- **URL**: `/api/certificate/student/:studentId`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "certificates": [
      {
        "id": 1,
        "course_name": "Course Name",
        "student_name": "Student Name",
        "issued_date": "2024-02-27",
        "student_eth_address": "0x...",
        "transaction_hash": "0x..."
      }
    ]
  }
  ```

## User Guides

### Claiming a Certificate

1. Navigate to the certificate claim page
2. Click the "Claim Your Certificate" button
3. Wait for the transaction to be processed
4. Once successful, click "View Certificate" to see your certificate

### Viewing a Certificate

1. Navigate to `/view-certificate/:studentAddress` where `:studentAddress` is your Ethereum address
2. The certificate will be displayed with details including:
   - Student name
   - Course name
   - Issue date
   - QR code for verification
   - Blockchain transaction details

### Verifying a Certificate

1. On the certificate view page, click the "Verify Credential" button
2. The system will check the blockchain for certificate validity
3. A verification result modal will appear showing the verification status

### Sharing a Certificate

1. On the certificate view page, find the "Share Credential" section
2. Choose from sharing options:
   - LinkedIn
   - Facebook
   - Twitter
   - WhatsApp
3. To add to LinkedIn profile, click "Add to My LinkedIn Profile"

### Downloading a Certificate

1. On the certificate view page, find the "PDF" button in the actions bar
2. Click to download the certificate as a PDF file

## Development Guidelines

### Smart Contract Development

1. Always use OpenZeppelin's contracts for standard functionality
2. Add comprehensive events for all state changes
3. Include thorough documentation for all functions
4. Use access control for administrative functions
5. Implement emergency stop mechanisms

### Express.js API Development

1. Follow RESTful API conventions
2. Implement proper error handling and logging
3. Use environment variables for all sensitive configuration
4. Add comprehensive request validation
5. Implement rate limiting for public endpoints

### Laravel Development

1. Follow Laravel best practices and conventions
2. Use dependency injection where appropriate
3. Implement proper validation for all requests
4. Add comprehensive logging
5. Use database transactions for operations that affect multiple tables

### React Frontend Development

1. Use functional components with hooks
2. Implement proper error handling and loading states
3. Follow accessibility guidelines
4. Ensure responsive design for all components
5. Use TypeScript for type safety (recommended)

## Troubleshooting

### Common Issues

**Certificate Transaction Fails**
- Check if the contract is paused
- Ensure the signer has enough MATIC for gas
- Verify the contract address is correct
- Check for errors in the Express.js logs

**Certificate Not Found**
- Verify the student address is correct
- Check if the certificate was revoked
- Ensure the certificate was successfully issued

**Verification Fails**
- Check if the certificate data was tampered with
- Verify the blockchain connection is working
- Ensure the IPFS gateway is accessible

**Frontend Display Issues**
- Clear browser cache and reload
- Check console for JavaScript errors
- Verify all required API endpoints are accessible

### Support

For additional support, please contact:
- Technical Support: `support@lead.academy`
- Blockchain Issues: `blockchain@lead.academy`
