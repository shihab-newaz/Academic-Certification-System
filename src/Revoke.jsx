import React, { useState } from 'react';
import { ethers } from 'ethers';
import './css/Issue.css';

function RevokeCertificateComponent() {
    const [studentAddress, setStudentAddress] = useState('');

    const [showRevocationMessage, setShowRevocationMessage] = useState(false);
    const [revocationMessage, setRevocationMessage] = useState('');

    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
    const API_KEY = process.env.REACT_APP_API_KEY;
    const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;

    const network = 'maticmum';
    const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contractABI = require('./abis/CertificateNFT.json');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    const revokeCertificate = async () => {
        try {
            await contract.revokeCertificate(studentAddress);
            if(!contract.isIssued){
            console.log(contract.isIssued);
            setRevocationMessage('Revocation successful');}
        } catch (error) {
            console.error(error);
            setRevocationMessage('Revocation unsuccessful');
        }

        setShowRevocationMessage(true);

        setTimeout(() => {
            setShowRevocationMessage(false);
        }, 5000);
    };

    return (
        <div className='revoke-certificate-container'>
            <h1>Revoke Certificate</h1>
            <input
                type="text"
                placeholder="Student Address"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
            />
            <button style={{ marginTop:10,marginBottom: 10 }} onClick={revokeCertificate}>Revoke Certificate</button>
            {showRevocationMessage && <p>{revocationMessage}</p>}
        </div>
    );
}

export default RevokeCertificateComponent;