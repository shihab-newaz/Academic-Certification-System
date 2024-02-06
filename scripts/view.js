//Viewing data from blockchain
require('dotenv').config(); // Load environment variables from a .env file
const { ethers } = require("hardhat");

async function main() {
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

  const studentAddress = "0xdaa23B8CD5Bc84Ff55F1eAc6A9D5929D67d9D1cf"; // Replace with the student's address
  const certificate = await CertContract.viewCertificate(studentAddress);

  console.log("Student Name:", certificate.name); // Access the 'name' field
  console.log("Degree Name:", certificate.degreeName); // Access the 'degreeName' field
  console.log("Subject:", certificate.subject); // Access the 'subject' field
  console.log("Issue Timestamp:", new Date(certificate.timestamp * 1000)); // Access the 'timestamp' field
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
