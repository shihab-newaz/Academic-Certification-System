import React, { useState } from 'react';
import { ethers } from 'ethers';
import './css/View.css';
import { create } from 'ipfs-http-client';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
const client = create({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http',
});
function ViewCertificateComponent({ }) {
  const [studentAddress, setStudentAddress] = useState('');
  const [employerAddress, setEmployerAddress] = useState('');
  const [viewMessage, setViewMessage] = useState({});
  const [fileUrl, setFileUrl] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState(null); // State for certificate details
  const [viewIPFSimage, setViewIPFSimage] = useState(false);
  const [inputSecretKey, setInputSecretKey] = useState(''); // State for input secret key
  const [isCorrectKey, setIsCorrectKey] = useState(false); // State for whether the correct key has been entered

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;


  const network = 'maticmum';
  const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const contractABI = require('./abis/CertificateNFT.json');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);


  async function fetchFileFromIPFS(fileCID) {
    try {
      setViewIPFSimage(true);
      const stream = client.cat(fileCID);
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
      setViewMessage({ error: error.message });
    }
  }
  const checkSecretKey = () => {// Function to check if the input secret key is correct
    if (inputSecretKey === process.env.REACT_APP_AES_SECRET_KEY) {
      setIsCorrectKey(true);
    } else {
      alert('The input secret key is incorrect.');
    }
  };
  const viewCertificate = async () => {
    const startTime = performance.now(); // Start counting execution time

    try {

      const permission = await contract.isCertificateSharedWith(studentAddress, employerAddress);
      if (!permission) {
        setViewMessage({ error: 'This viewer does not have permission for this certificate' });
        return;
      }
      const certificate = await contract.viewCertificate(studentAddress);

      if (certificate.error) {
        setViewMessage({ error: certificate.error });
        return;
      }
      //Decrypting the encrypted data
      const bytes = AES.decrypt(certificate.encryptedData, process.env.REACT_APP_AES_SECRET_KEY);
      const decryptedData = bytes.toString(Utf8);
      console.log('Decrypted data:', decryptedData);
      const certificateStr = JSON.parse(decryptedData);
      console.log('Decrypted data:', certificateStr);

      const currentTimestamp = Math.floor(Date.now() / 1000); // check the expiry
      if (!(certificateStr.timestamp + certificateStr.expiration >= currentTimestamp)) {
        setViewMessage({ error: 'Certificate has expired' });
        return;
      }
      setCertificateDetails({
        name: certificateStr.name,
        roll: certificateStr.roll,
        degreeName: certificateStr.degreeName,
        subject: certificateStr.subject,
        issueTimestamp: new Date(certificateStr.timestamp * 1000),
        expiry: certificateStr.expiration.toString(),
        signature: certificateStr.signature,
      });
      console.log('File CID:', certificateStr);
      fetchFileFromIPFS(certificateStr.fileCid);
      setShowDetails(true);
      const endTime = performance.now(); // Stop counting execution time
      const executionTime = endTime - startTime; // Calculate execution time
      console.log('Execution time:', executionTime, 'ms');

    } catch (error) {
      setViewMessage({ error: 'Failed to view certificate' + '-->' + error });
    }
  };

  return (
    <div className="view-container">

      {!isCorrectKey && (
        <div>
          <input
            style={{ marginBottom: '10px' }}
            type="password" // Use password type to hide the input
            placeholder="Enter Secret Key"
            onChange={(e) => setInputSecretKey(e.target.value)}
          />
          <button
            onClick={checkSecretKey}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '5px',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >Enter Secret Key</button>
        </div>
      )}
      {isCorrectKey &&!showDetails && (
        <div>
          <h1>View Certificate</h1>
          <input
            style={{ marginBottom: '10px' }}
            type="text"
            placeholder="Student Address"
            onChange={(e) => setStudentAddress(e.target.value)}
          />
          <input
            style={{ marginBottom: '10px' }}
            type="text"
            placeholder="Employer Address" // Form for employer address
            onChange={(e) => setEmployerAddress(e.target.value)}
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
      {isCorrectKey &&showDetails && (
        <div className="details-container">
          <div className='certificate-details'>
            <h4>Certificate Details</h4>
            <p>----------------------------</p>
            <p>Name: {certificateDetails.name}</p>
            <p>Roll Number: {certificateDetails.roll}</p>
            <p>Degree Name: {certificateDetails.degreeName}</p>
            <p>Subject: {certificateDetails.subject}</p>
            <p>Issue Timestamp: {certificateDetails.issueTimestamp.toString()}</p>
            <p>Expiry: {certificateDetails.expiry} days</p>
            {/* <p>Signature: {certificateDetails.signature}</p> */}
          </div>
          {viewIPFSimage === true &&
            <div>
              <img id="image" alt="From IPFS" src={fileUrl} height={480} width={360} />
            </div>
          }
        </div>
      )}
      {viewMessage && <p>{viewMessage.error}</p>}



    </div>
  );
}

export default ViewCertificateComponent;
