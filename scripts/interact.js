//Interaction with the blockchain test network(Polygon Mumbai)
require('dotenv').config(); // Load environment variables from a .env file

const { ethers } = require("hardhat");

async function issueCertificates(studentName, degreeName, subject, studentAddress, issueTimestamp) {
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

  const contract = require("../../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json"); 
  const CertContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);
  const transactionObj = await CertContract.issueCertificate(studentName, degreeName, subject, studentAddress, issueTimestamp);

  await transactionObj.wait(); // Wait for the transaction to be mined

  console.log("Certificate issued successfully!");
};

// async function main() {
//     //Issue a certificate
//     const studentAddress = "0xdaa23B8CD5Bc84Ff55F1eAc6A9D5929D67d9D1cf"; // Replace with the student's address
//     const studentName = "Shihab";
//     const degreeName = "BSC";
//     const subject = "CSE";
//     const issueTimestamp = Math.floor(Date.now() / 1000);
//     await issueCertificates(studentName, degreeName, subject, studentAddress, issueTimestamp);
// }
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  module.exports = {
    issueCertificates,
    // Other functions if needed
  };