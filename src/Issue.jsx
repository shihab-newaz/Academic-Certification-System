import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import './css/Issue.css'
import { create } from 'ipfs-http-client';
//import {  Link } from 'react-router-dom';

//let ViewIPFSimage=false;

const client = create({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http',
});


function IssueCertificateComponent() {
  const [studentName, setStudentName] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [subject, setSubject] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [issueResult, setIssueResult] = useState('');
 
  const CONTRACT_ADDRESS = '0x68EFE59C99cAf2c0B06d4C69f6156cDAABe27fcF';
  const API_KEY = 'FL2LLcHpmU6y2PVSqEnv-3BcXP9yJoZd';
  const PRIVATE_KEY = '48570c2da3ea0df17bd1ad80c00a9886314a05c406add11c0ea6f31e42632fdf';
  const fileInput = useRef(null);
  const [fileCid, setFileCid] = useState(null);
  //const [fileUrl, setFileUrl] = useState(null);


  async function handleUploadToIPFS() {
    const file = fileInput.current.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const {cid}  = await client.add(reader.result);
        console.log(cid);
        setFileCid(cid);

      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      
      console.error('Error uploading file:', error);
    }
  }

  // async function fetchFileFromIPFS(cid) {
  //   try {
  //    // ViewIPFSimage=true;
  //     const stream = client.cat(cid);
  //     let data = [];
  
  //     for await (const chunk of stream) {
  //       data.push(chunk);
  //     }
  //     // Create a Blob from the data
  //     const blob = new Blob(data, { type: 'image/jpeg' }); 
  //     // Create a URL from the Blob
  //     const url = URL.createObjectURL(blob);
  //     setFileUrl(url);
  //   } catch (error) {
  //     console.error('Error fetching file from IPFS:', error);
  //   }
  // }



  const issueCertificate = async () => {
    try {
      const network = 'maticmum';
      const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);

      const contractABI = require('./abis/CertificateNFT.json');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      const issueTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp

      const transaction = await contract.issueCertificate(
        studentName,
        degreeName,
        subject,
        studentAddress,
        issueTimestamp,fileCid.toString()
      );

      await transaction.wait();

      setIssueResult('Certificate issued successfully!');
    } catch (error) {
      console.error('Error issuing certificate:', error);
      setIssueResult('Failed to issue certificate' + '-->' + error);
    }
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
        placeholder="Student Address"
        onChange={(e) => setStudentAddress(e.target.value)}
      />

      <input type="file" ref={fileInput} />
      <button onClick={handleUploadToIPFS
  }>Upload to IPFS</button> <br/>
{/* 
      <button onClick={() => fetchFileFromIPFS(fileCid)}>View From IPFS</button>  <br/>      */}
      
      <button onClick={issueCertificate}>Issue Certificate</button> <br/>
      <p>{issueResult}</p><br/>
      
      {/* {ViewIPFSimage === true &&
        <div>
        <img id="image" alt="From IPFS" src={fileUrl}/>
        <p>CID: {fileCid.toString()}</p>

        </div>
      } */}

    </div>

    
  );

}

export default IssueCertificateComponent;

