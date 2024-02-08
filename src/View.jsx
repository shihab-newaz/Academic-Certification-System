import React, { useState } from 'react';
import { ethers } from 'ethers';
import './css/View.css';
import { create } from 'ipfs-http-client';
const client = create({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http',
});
function ViewCertificateComponent({ fileCid }) {
  const [showDetails, setShowDetails] = useState(false);
  const [studentAddress, setStudentAddress] = useState('');
  const [certificateDetails, setCertificateDetails] = useState({});
  const [fileUrl, setFileUrl] = useState(null);
  // Replace with your contract address
  const CONTRACT_ADDRESS = '0x68EFE59C99cAf2c0B06d4C69f6156cDAABe27fcF';
  const API_KEY = 'FL2LLcHpmU6y2PVSqEnv-3BcXP9yJoZd';
  const PRIVATE_KEY = '8332144f020a904498a781d075ad1d303efbbe828fab718fd43bcad1f5b2d8ca';
  const[viewIPFSimage, setViewIPFSimage]=useState(false);

  async function fetchFileFromIPFS(cid) {
    try {
      setViewIPFSimage(true);
      const stream = client.cat(cid);
      let data = [];

      for await (const chunk of stream) {
        data.push(chunk);
      }
      // Create a Blob from the data
      const blob = new Blob(data, { type: 'image/jpeg' });
      // Create a URL from the Blob
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
    } catch (error) {
      console.error('Error fetching file from IPFS:', error);
    }
  }

  const viewCertificate = async () => {
    try {
      const network = 'maticmum';
      const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);

      const contractABI = require('./abis/CertificateNFT.json');
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

      <button onClick={() => fetchFileFromIPFS(fileCid)}>View From IPFS</button>  <br />
            {viewIPFSimage === true &&
        <div>
        <img id="image" alt="From IPFS" src={fileUrl}/>
        <p>CID: {fileCid.toString()}</p>

        </div>
      }
    </div>
  );
}

export default ViewCertificateComponent;
