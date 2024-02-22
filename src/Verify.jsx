import React, { useState } from 'react';
import { ethers } from 'ethers';
import './css/Issue.css';

function VerifyCertificateComponent() {
    const [studentAddress, setStudentAddress] = useState('');
    const [signatureVerification, setSignatureVerification] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');
    const [employerAddress, setEmployerAddress] = useState('');
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
            const startTime = performance.now(); // Start counting execution time

            const isIssued = await contract.verifyCertificate(studentAddress);

            const permission = await contract.isCertificateSharedWith(studentAddress, employerAddress);

            if (!permission) {
                setVerificationMessage({ error: 'The verifier does not have permission for this certificate' });
                return;
            }
            if (!isIssued) {
                console.log('Certificate verification is unsuccessful');
                setVerificationMessage('Verification unsuccessful: Certificate either not issued or already revoked');
                return;
            }

            const certificate = await contract.viewCertificate(studentAddress);
            console.log(certificate);
            // Recover the address of the signer
            const signerAddress = ethers.utils.verifyMessage(certificate.dataHash, certificate.signature);
            const expectedSignerAddress = process.env.REACT_APP_SIGNER_ADDRESS;

            console.log(signerAddress + ' AND ' + expectedSignerAddress);
            if (signerAddress === expectedSignerAddress) {
                console.log('The signature is valid.');
                setSignatureVerification('Signature Verification successful');
            } else {
                console.log('The signature is NOT valid.');
                setSignatureVerification('Signature Verification unsuccessful');
            }

            const endTime = performance.now(); // Stop counting execution time
            const executionTime = endTime - startTime; // Calculate execution time
            console.log('Execution time for verifyCertificate:', executionTime, 'ms');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='issue-certificate-container'>
            <h1>Certificate Verification</h1>
            <input
                type="text"
                placeholder="Student Address"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
            />
            <input
                style={{ marginBottom: '10px' }}
                type="text"
                placeholder="Verifier Address"
                onChange={(e) => setEmployerAddress(e.target.value)}
            />
            <button onClick={verifyCertificate}>Verify Certificate</button>
            <p>{signatureVerification}</p>
            <p>{verificationMessage}</p>



        </div>
    );
}

export default VerifyCertificateComponent;
