
require('dotenv').config(); // Load environment variables from a .env file
const { ethers } = require("hardhat");
const Helia = require('helia');

async function viewCertificate(studentAddress) {
  const API_KEY = process.env.API_KEY;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  if (!API_KEY || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("API_KEY, PRIVATE_KEY, or CONTRACT_ADDRESS is missing in the environment variables.");
    return;
  }

  const network = "maticmum";
  const alchemyProvider = new ethers.providers.AlchemyProvider(network, API_KEY);
  const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
  const contract = require("../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json"); // Replace with the actual path to your contract's artifact
  const CertContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);

  // Retrieve certificate details from Helia
  const certificateCID = await CertContract.viewCertificateCID(studentAddress);
  const helia = new Helia();
  const certificateData = JSON.parse(await helia.get(certificateCID));

  // Check if certificate details exist
  if (!certificateData) {
    console.error("Certificate not found for the provided student address.");
    return;
  }

  // Retrieve image CID from Helia (if available)
  const imageCID = await CertContract.viewCertificateImageCID(studentAddress);
  let imageURL = null;
  if (imageCID) {
    imageURL = `https://ipfs.io/ipfs/${imageCID}`;
  }

  // Display certificate details
  console.log("Student Name:", certificateData.name);
  console.log("Degree Name:", certificateData.degreeName);
  console.log("Subject:", certificateData.subject);
  console.log("Issue Timestamp:", new Date(certificateData.timestamp * 1000));
  console.log("Image URL:", imageURL);
}

async function main() {
  // View certificate for a specific student address
  const studentAddress = "0xf7d1918a7d87C0773F95b05214A8C0fF41295F29"; // Replace with the student's address
  await viewCertificate(studentAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
