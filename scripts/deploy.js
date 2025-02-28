// la-bc-certificate-api/scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  try {
    console.log("Starting deployment process...");

    // Get the ContractFactory and Signer
    const CertificateContract = await hre.ethers.getContractFactory("CertificateContract");
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the contract
    console.log("Deploying Certificate contract...");
    const certificateContract = await CertificateContract.deploy();
    

    await certificateContract.waitForDeployment();
    const certificateContractAddress = await certificateContract.getAddress();

    console.log("Contract deployed to:", certificateContractAddress);

    // Get latest block
    const block = await hre.ethers.provider.getBlock("latest");
    console.log("Deployed in block:", block.number);

    // Get network information
    const network = await hre.ethers.provider.getNetwork();

    // Save deployment info to a file
    const deploymentInfo = {
      contractName: "CertificateContract",
      contractAddress: certificateContractAddress,
      deployerAddress: deployer.address,
      network: network.name,
      chainId: network.chainId.toString(),
      deploymentBlock: block.number,
      timestamp: new Date().toISOString(),
      transactionHash: certificateContract.deploymentTransaction().hash,
    };

    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-info.json");
    console.log("Deployment completed successfully!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exitCode = 1;
});