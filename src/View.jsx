import React, { useState } from 'react';
import { ethers } from 'ethers';
import './css/View.css';

function ViewCertificate() {
  const [showDetails, setShowDetails] = useState(false);
  const [studentAddress, setStudentAddress] = useState('');
  const [certificateDetails, setCertificateDetails] = useState({});

  // Replace with your contract address
  const CONTRACT_ADDRESS = '0x3aBDC732E9f05DF22211FAfF0Cf8DF6D76742016';
  const API_KEY = 'FL2LLcHpmU6y2PVSqEnv-3BcXP9yJoZd';
  const PRIVATE_KEY = '8332144f020a904498a781d075ad1d303efbbe828fab718fd43bcad1f5b2d8ca';

  const viewCertificate = async () => {
    try {
      const network = 'maticmum';
      const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);

      const contractABI = require('./abi/CertificateNFT.json');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      const certificate = await contract.viewCertificate(studentAddress);

      setCertificateDetails({
        name: certificate.name,
        degreeName: certificate.degreeName,
        subject: certificate.subject,
        issueTimestamp: new Date(certificate.timestamp * 1000),
      });

      setShowDetails(true);
    } catch (error) {
      setCertificateDetails({ error: 'Failed to view certificate' + '-->' + error });
    }
  };

  return (
    <div className="view-container">
      {!showDetails && (
        <div>
          <h1>View Certificate</h1>
          <input
            style={{ marginBottom: '10px' }}
            type="text"
            placeholder="Student Address"
            onChange={(e) => setStudentAddress(e.target.value)}
          />
          <button
            onClick={viewCertificate}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '5px',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            View Certificate
          </button>
        </div>
      )}
      {showDetails && (
        <div>
          <h4>Certificate Details</h4>
          <p>Name: {certificateDetails.name}</p>
          <p>Degree Name: {certificateDetails.degreeName}</p>
          <p>Subject: {certificateDetails.subject}</p>
          <p>Issue Timestamp: {certificateDetails.issueTimestamp.toString()}</p>
        </div>
      )}
      {certificateDetails.error && <p>Error: {certificateDetails.error}</p>}
    </div>
  );
}

export default ViewCertificate;
