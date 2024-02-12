import React, { useState } from 'react';
import { ethers } from 'ethers';
import './css/View.css';
import { create } from 'ipfs-http-client';
const client = create({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http',
});
function ViewCertificateComponent({  }) {
  const [showDetails, setShowDetails] = useState(false);
  const [studentAddress, setStudentAddress] = useState('');
  const [certificateDetails, setCertificateDetails] = useState({});
  const [fileUrl, setFileUrl] = useState(null);
  const [fileCid, setFileCid] = useState(null);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;  
  const API_KEY = process.env.REACT_APP_API_KEY;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const[viewIPFSimage, setViewIPFSimage]=useState(false);

  const network = 'maticmum';
  const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const contractABI = require('./abis/CertificateNFT.json');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);


  async function fetchFileFromIPFS() {
    try {
      const certificate = await contract.viewCertificate(studentAddress);
      if (certificate.error) {
        setCertificateDetails({ error: certificate.error });
        return;
      }
      setViewIPFSimage(true);
      const stream = client.cat(certificate.fileCID);
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
      if (certificate.error) {
        setCertificateDetails({ error: certificate.error });
        return;
      }
  
      setFileCid(certificate.fileCid);
      setCertificateDetails({
        name: certificate.name,
        roll: certificate.roll,
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
            View Certificate Details
          </button>
        </div>
      )}
      {showDetails && (
        <div>
          <h4>Certificate Details</h4>
          <p>Name: {certificateDetails.name}</p>
          <p>Roll Number: {certificateDetails.roll}</p>
          <p>Degree Name: {certificateDetails.degreeName}</p>
          <p>Subject: {certificateDetails.subject}</p>
          <p>Issue Timestamp: {certificateDetails.issueTimestamp.toString()}</p>

        </div>
      )}
      {certificateDetails.error && (
        <p>
          Sorry,  The certificate is either not issued or is revoked.
        </p>
      )}

      <button onClick={() => fetchFileFromIPFS()} style={{marginBottom:10,width:150}}>View Image</button>  <br />
            {viewIPFSimage === true &&
        <div>
        <img id="image" alt="From IPFS" src={fileUrl}/>


        </div>
      }
    </div>
  );
}

export default ViewCertificateComponent;
