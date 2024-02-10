import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import './css/Issue.css';

function VerifyCertificateComponent() {
    const [studentAddress, setStudentAddress] = useState('');
    const [issueResult, setIssueResult] = useState(false);

    const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');

    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
    const API_KEY = process.env.REACT_APP_API_KEY;
    const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;

    const network = 'maticmum';
    const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contractABI = require('./abis/CertificateNFT.json');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    const verifyCertificate = async () => {
        try {
            const verification = await contract.verifyCertificate(studentAddress);
            setIssueResult(verification);

            if (verification) {
                console.log('Certificate verification is successful');
                setVerificationMessage('Verification successful');
            } else {
                console.log('Certificate verification is unsuccessful');
                setVerificationMessage('Verification unsuccessful');
            }

            setShowVerificationMessage(true);

            setTimeout(() => {
                setShowVerificationMessage(false);
            }, 5000);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='issue-certificate-container'>
            <h1>Issue Certificate</h1>
            <input
                type="text"
                placeholder="Student Address"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
            />
            <button onClick={verifyCertificate}>Verify Certificate</button>
            {showVerificationMessage && <p>{verificationMessage}</p>}
        </div>
    );
}

export default VerifyCertificateComponent;
