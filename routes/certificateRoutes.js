//routes/certificateRoutes.js
import express from 'express';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import { uploadToIPFS, fetchFromIPFS } from '../utils/ipfsUtils.js';
import { contract, signer } from '../utils/contract.js';
import logger from '../logger.js';

const router = express.Router();

router.post('/issue-certificate', async (req, res) => {
    logger.info('Received request to issue certificate');
    try {
      const { studentName, courseName, studentId, courseId, issuedDate } = req.body;
      const wallet = ethers.Wallet.createRandom();
      const student_eth_address = wallet.address;
      const certificateData = {
        studentName,
        courseName,
        studentId,
        courseId,
        student_eth_address,
        issueTimestamp: new Date(issuedDate).getTime() / 1000,
      };
  
      const cid = await uploadToIPFS(certificateData);
      logger.info(`Certificate data uploaded and pinned to IPFS with CID: ${cid}`);
  
      const encryptedData = CryptoJS.AES.encrypt(cid, process.env.AES_SECRET_KEY).toString();
      const dataHash = ethers.hashMessage(encryptedData);
      const signature = await signer.signMessage(dataHash);
  
      const currentSignerAddress = await signer.getAddress();
      logger.info('Current signer address:', { address: currentSignerAddress });
  
      logger.info('Issuing certificate on the blockchain...');
      const tx = await contract.issueCertificate(
        student_eth_address,
        encryptedData,
        dataHash,
        signature
      );
  
      logger.info('Transaction sent', { hash: tx.hash });
      logger.info('Waiting for transaction to be mined...');
  
      const receipt = await tx.wait();
      logger.info('Transaction mined', {
        blockNumber: receipt.blockNumber,
        hash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      });
  
      if (receipt.status === 1) {
        logger.info('Certificate issued successfully', { hash: receipt.hash });
        res.json({
          success: true,
          message: 'Certificate issued successfully',
          student_eth_address: student_eth_address,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          ipfsCID: cid
        });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      logger.error('Error issuing certificate', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to issue certificate',
        error: error.message
      });
    }
  });

  router.get('/view-certificate/:studentAddress', async (req, res) => {
    logger.info('Received request to view certificate', { address: req.params.studentAddress });
    try {
      const { studentAddress } = req.params;
      const certificateData = await contract.viewCertificate(studentAddress);
      const decryptedBytes = CryptoJS.AES.decrypt(certificateData.encryptedData, process.env.AES_SECRET_KEY);
      const cid = decryptedBytes.toString(CryptoJS.enc.Utf8);
  
      logger.info('Fetching certificate data from IPFS...');
      const fetchedData = await fetchFromIPFS(cid);
  
      res.json({ 
        success: true,
        certificateData: {
          studentName: fetchedData.studentName,
          courseName: fetchedData.courseName,
          studentId: fetchedData.studentId,
          courseId: fetchedData.courseId,
          issueDate: new Date(fetchedData.issueTimestamp * 1000).toLocaleDateString(),
        }
      });
    } catch (error) {
      logger.error('Error viewing certificate', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to view certificate',
        error: error.message
      });
    }
  });

  router.get('/verify-certificate/:studentAddress', async (req, res) => {
    logger.info('Received request to verify certificate', { address: req.params.studentAddress });
    try {
      const { studentAddress } = req.params;
      logger.info('Verifying certificate on the blockchain...');
      const isIssued = await contract.verifyCertificate(studentAddress);
  
      if (!isIssued) {
        logger.info('Certificate not issued or revoked');
        return res.json({ success: false, message: 'Certificate either not issued or already revoked' });
      }
  
      logger.info('Fetching certificate details for signature verification...');
      const certificateDetails = await contract.viewCertificate(studentAddress);
      logger.info('Certificate details', { details: certificateDetails });
  
      const messageHash = ethers.hashMessage(certificateDetails.dataHash);
      logger.info('Message hash', { hash: messageHash });
  
      const signerAddress = ethers.recoverAddress(messageHash, certificateDetails.signature);
      const expectedSignerAddress = process.env.SIGNER_ADDRESS;
      const currentSignerAddress = await signer.getAddress();
  
      logger.info('Signer addresses', {
        recovered: signerAddress,
        expected: expectedSignerAddress,
        current: currentSignerAddress
      });
  
      if (signerAddress === expectedSignerAddress || signerAddress === currentSignerAddress) {
        logger.info('Certificate verification successful');
        res.json({ success: true, message: 'Certificate verification successful' });
      } else {
        logger.info('Signature verification unsuccessful');
        res.json({
          success: false,
          message: 'Signature verification unsuccessful',
        });
      }
    } catch (error) {
      logger.error('Error verifying certificate', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'An error occurred during verification',
        error: error.message
      });
    }
  });


/**
 * @swagger
 * /api/certificate/issue-certificate:
 *   post:
 *     summary: Issue a new certificate
 *     tags: [Certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Certificate'
 *     responses:
 *       200:
 *         description: Certificate issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 student_eth_address:
 *                   type: string
 *                   example: '0x123...'
 *                 transactionHash:
 *                   type: string
 *                   example: '0xabc...'
 *                 blockNumber:
 *                   type: number
 *                   example: 12345
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/certificate/view-certificate/{studentAddress}:
 *   get:
 *     summary: View a certificate by student address
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: studentAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Ethereum address of the student
 *     responses:
 *       200:
 *         description: Certificate details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 certificateData:
 *                   type: object
 *                   properties:
 *                     studentName:
 *                       type: string
 *                       example: 'John Doe'
 *                     courseName:
 *                       type: string
 *                       example: 'Advanced Blockchain Technology'
 *       404:
 *         description: Certificate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/certificate/verify-certificate/{studentAddress}:
 *   get:
 *     summary: Verify a certificate's authenticity
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: studentAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Ethereum address of the student
 *     responses:
 *       200:
 *         description: Certificate verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Certificate verification successful'
 */


export default router;