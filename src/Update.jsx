import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import './css/Issue.css'
import { create } from 'ipfs-http-client';
import AES from 'crypto-js/aes';


const client = create({
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http',
});


function UpdateCertificateComponent() {
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
                const { cid } = await client.add(reader.result);
                console.log(cid.toString());
                setFileCid(cid.toString());

            };
            reader.readAsArrayBuffer(file);

        } catch (error) {

            console.error('Error uploading file:', error);
        }
    }

    const updateCertificate = async () => {
        const startTime = performance.now(); // Start counting execution time
        setIsLoading(true);
        try {
            const network = 'maticmum';
            const provider = new ethers.providers.AlchemyProvider(network, API_KEY);
            const signer = new ethers.Wallet(PRIVATE_KEY, provider);

            const contractABI = require('./abis/CertificateNFT.json');
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            const issueTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp
            const expiration = Number(expiry)
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

                const SECRET_KEY = process.env.REACT_APP_AES_SECRET_KEY;
                const encryptedData = AES.encrypt(certificateDataString, SECRET_KEY).toString();

                const hash = ethers.utils.hashMessage(encryptedData);
                const signature = await signer.signMessage(hash);

                const transaction = await contract.updateCertificate(
                    studentAddress,
                    encryptedData,
                    hash,
                    signature
                );
                await transaction.wait();
                setIssueResult('Certificate updated successfully!');
                const endTime = performance.now(); // Stop counting execution time
                const executionTime = endTime - startTime; // Calculate execution time
                console.log('Execution time:', executionTime, 'ms');
            }
            else { console.log('Cid is null'); }

        } catch (error) {
            console.error('Error issuing certificate:', error);
            setIssueResult('Failed to issue certificate->' + error.message);
        }
        setIsLoading(false);
    };

    return (
        <div className='issue-certificate-container'>
            <h1>Update Certificate</h1>
            <input type="text" placeholder='Student Name' onChange={(e) => setStudentName(e.target.value)} />
            <input type="text" placeholder='Roll' onChange={(e) => setRoll(e.target.value)} />
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

            <button onClick={updateCertificate}>Update Certificate</button> <br />
            {isLoading && <>
                <div className="spinner"></div>
                <p>Updating in the Polygon chain</p></>}

            <p>{issueResult}</p><br />

        </div>

    );
}
export default UpdateCertificateComponent;

