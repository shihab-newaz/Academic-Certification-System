//la-bc-certificate-api/contract.js
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_URL = process.env.PROVIDER_RPC_URL;

const provider = new ethers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import contract ABI
const contractJsonPath = resolve(__dirname, '../artifacts/contracts/CertificateContract.sol/CertificateContract.json');
const contractJsonUrl = pathToFileURL(contractJsonPath);
const contractJson = JSON.parse(await readFile(contractJsonUrl));
const CONTRACT_ABI = contractJson.abi;

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

export { contract, provider, signer };