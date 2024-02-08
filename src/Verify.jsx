import React, { useState } from 'react';
import { ethers } from 'ethers';



const Verify = () => {
    const [certificateId, setCertificateId] = useState('');
    const [verificationResult, setVerificationResult] = useState('');

    const verifyCertificate = async () => {
        try {
            // Connect to the deployed contract
            const contractAddress = '0x68EFE59C99cAf2c0B06d4C69f6156cDAABe27fcF'; // Replace with the actual contract address
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = new Contract(contractAddress, CertificateNFT.abi, provider);

            // Call the verifyCertificate function in the contract
            const result = await contract.verifyCertificate(certificateId);

            // Update the verification result state
            setVerificationResult(result);
        } catch (error) {
            console.error('Error verifying certificate:', error);
        }
    };

    return (
        <div>
            <h1>Verify Certificate</h1>
            <input
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
            />
            <button onClick={verifyCertificate}>Verify</button>
            <p>{verificationResult}</p>
        </div>
    );
};

export default Verify;
