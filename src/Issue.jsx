import React, { useState, useRef,useEffect } from 'react';
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
  const [roll, setRoll] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [subject, setSubject] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [issueResult, setIssueResult] = useState('');
 
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;  
  const API_KEY = process.env.REACT_APP_API_KEY;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const fileInput = useRef(null);
  const [fileCid, setFileCid] = useState(null);


  // useEffect(() => {
  //   if (fileCid) {
  //     console.log(fileCid);
  //   }
  // }, [fileCid]);

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
        setFileCid(cid.toString());
      
      };
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      
      console.error('Error uploading file:', error);
    }
  }



  const issueCertificate = async () => {
    try {
      const network = 'maticmum';
      const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);

      const contractABI = require('./abis/CertificateNFT.json');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      const issueTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp
      
      if(fileCid){
      const transaction = await contract.issueCertificate(
        studentName,
        roll,
        degreeName,
        subject,
        studentAddress,
        issueTimestamp,
        fileCid
        );
        await transaction.wait();
  
      }
     else{console.log('Cid is null');}

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
        placeholder="Student Address"
        onChange={(e) => setStudentAddress(e.target.value)}
      />

      <input type="file" ref={fileInput} />
      <button onClick={handleUploadToIPFS} style={{marginBottom:10,}}>Upload to IPFS</button> <br/>
{/* 
      <button onClick={() => fetchFileFromIPFS(fileCid)}>View From IPFS</button>  <br/>      */}
      
      <button onClick={issueCertificate}>Issue Certificate</button> <br/>
      <p>{issueResult}</p><br/>
      


    </div>

    
  );

}

export default IssueCertificateComponent;

