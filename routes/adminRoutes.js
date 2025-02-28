//la-bc-certificate-api/routes/adminRoutes.js
import express from 'express';
import { contract,provider } from '../utils/contract.js';
import logger from '../logger.js';

const router = express.Router();

router.get('/certificate-count', async (req, res) => {
  try {
    const count = await contract.getCertificateCount();
    const countValue = typeof count.toNumber === 'function' ? count.toNumber() : Number(count);
    res.json({ count: countValue });
  } catch (error) {
    logger.error('Error getting certificate count', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.get('/contract-paused', async (req, res) => {
  try {
    const isPaused = await contract.paused();
    res.json({ isPaused });
  } catch (error) {
    logger.error('Error checking contract pause state', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.post('/revoke-certificate', async (req, res) => {
  try {
    const { recipientAddress } = req.body;
    const tx = await contract.revokeCertificate(recipientAddress);
    await tx.wait();
    logger.info('Certificate revoked successfully', { recipientAddress });
    res.json({ success: true, message: 'Certificate revoked successfully' });
  } catch (error) {
    logger.error('Error revoking certificate', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.post('/toggle-pause', async (req, res) => {
  try {
    const isPaused = await contract.paused();
    const tx = isPaused ? await contract.unpause() : await contract.pause();
    await tx.wait();
    logger.info(`Contract ${isPaused ? 'unpaused' : 'paused'} successfully`);
    res.json({ success: true, message: `Contract ${isPaused ? 'unpaused' : 'paused'} successfully` });
  } catch (error) {
    logger.error('Error toggling contract pause state', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

router.get('/network-info', async (req, res) => {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId); // Convert BigInt to Number
    const networkName = getNetworkName(chainId);
    res.json({ chainId, networkName });
  } catch (error) {
    logger.error('Error getting network info', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

function getNetworkName(chainId) {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 3:
      return 'Ropsten Testnet';
    case 4:
      return 'Rinkeby Testnet';
    case 5:
      return 'Goerli Testnet';
    case 42:
      return 'Kovan Testnet';
    case 137:
      return 'Polygon Mainnet';
    case 80001:
      return 'Polygon Mumbai';
    case 80002:
        return 'Polygon Amoy';
    default:
      return 'Unknown Network';
  }
}

// routes/adminRoutes.js
/**
 * @swagger
 * /api/admin/certificate-count:
 *   get:
 *     summary: Get total number of certificates
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Certificate count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                   example: 100
 */

/**
 * @swagger
 * /api/admin/contract-paused:
 *   get:
 *     summary: Check if contract is paused
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Contract pause status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isPaused:
 *                   type: boolean
 *                   example: false
 */
export default router;