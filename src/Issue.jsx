import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import './css/Issue.css'
import { create } from 'ipfs-http-client';
import AES from 'crypto-js/aes';

//let ViewIPFSimage=false;

const client = create({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http',
});


function IssueCertificateComponent() {
  const [studentName, setStudentName] = useState('');
  const [roll, setRoll] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [subject, setSubject] = useState('');
  const [expiry, setExpiry] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [issueResult, setIssueResult] = useState('');
  const [fileCid, setFileCid] = useState(null);
  const fileInput = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;


  async function handleUploadToIPFS() {
    const file = fileInput.current.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const startTime = performance.now(); // Start counting execution time
        const { cid } = await client.add(reader.result);
        const endTime = performance.now(); // Stop counting execution time
        const executionTime = endTime - startTime; // Calculate execution time
        console.log('Execution time for handleUploadToIPFS:', executionTime, 'ms');
        console.log(cid.toString());
        setFileCid(cid.toString());

      };
      reader.readAsArrayBuffer(file);

    } catch (error) {

      console.error('Error uploading file:', error);
    }
  }

  const issueCertificate = async () => {
    //const startTime = performance.now(); // Start counting execution time
    setIsLoading(true);
    try {
      const network = 'maticmum';
      const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
      const contractABI = require('./abis/CertificateNFT.json');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);


      const issueTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp
      const expiration=Number(expiry)
      if (fileCid) {
        // Get the certificate data
        const certificateData = {
          studentName,
          roll,
          degreeName,
          subject,
          studentAddress,
          issueTimestamp,
          expiration,
          fileCid
        };


        
        // Convert the certificate data to a string
        const certificateDataString = JSON.stringify(certificateData);
        //console.log(certificateDataString);

        // Encrypt the certificate data
        const SECRET_KEY = process.env.REACT_APP_AES_SECRET_KEY;
        const encryptedData = AES.encrypt(certificateDataString, SECRET_KEY).toString();
   
        const hash=ethers.utils.hashMessage(encryptedData);
        const signature = await signer.signMessage(hash);
        console.log(encryptedData);
        console.log(hash);
        const transaction = await contract.issueCertificate(
          studentAddress,
          encryptedData,
          hash,
          signature
        );
        await transaction.wait();

        // const endTime = performance.now(); // Stop counting execution time
        // const executionTime = endTime - startTime; // Calculate execution time
        // console.log('Execution time for issueCertificate:', executionTime, 'ms');

        // const signerAddress = ethers.utils.verifyMessage(hash,signature);
        // const expectedSignerAddress = process.env.REACT_APP_SIGNER_ADDRESS;

        // console.log(signerAddress + ' AND ' + expectedSignerAddress);
        // if (signerAddress === expectedSignerAddress) {
        //     console.log('The signature is valid.');
        // } else {
        //     console.log('The signature is NOT valid.');
        // }


        setIssueResult('Certificate issued successfully!');
      }
      else { console.log('Cid is null'); }
  
    } catch (error) {
      console.error('Error issuing certificate:', error);
      setIssueResult('Failed to issue certificate');
    }
    setIsLoading(false);
  };

  return (
    <div className='issue-certificate-container'>
      <h1>Issue Certificate</h1>
      <input
        type="text"
        placeholder="Student Name"
        onChange={(e) => setStudentName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Roll Number"
        onChange={(e) => setRoll(e.target.value)}
      />
      <input
        type="text"
        placeholder="Degree Name"
        onChange={(e) => setDegreeName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        onChange={(e) => setSubject(e.target.value)}
      />
        <input
        type="text"
        placeholder="Expiration"
        onChange={(e) => setExpiry(e.target.value)}
      />
      <input
        type="text"
        placeholder="Student Address"
        onChange={(e) => setStudentAddress(e.target.value)}
      />

      <input type="file" ref={fileInput} />
      <button onClick={handleUploadToIPFS} style={{ marginBottom: 10, }}>Upload to IPFS</button> <br />

      <button onClick={issueCertificate}>Issue Certificate</button> <br />
      {isLoading && <>
      <div className="spinner"></div>
      <p>Uploading to the Polygon chain</p></>}

      <p>{issueResult}</p><br />

    </div>


  );

}

export default IssueCertificateComponent;

