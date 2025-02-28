/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    polygon_amoy: {
      url: process.env.PROVIDER_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
  },
}
