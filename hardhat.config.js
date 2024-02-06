/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-abigen");

//require("@nomicfoundation/hardhat-toolbox");
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "mumbai",
  
  abigen: {
   outDir: "src/abis",            // The output directory for generated ABI files (default: "abi")
   inDir: "contracts",       // The input directory containing your contract files (default: "contracts")
   includeContracts: ["*"],  // An array of contract patterns to include in the generate ABIs (default: ["*"])
   excludeContracts: [],     // An array of contract patterns to exclude from the generate ABIs (default: [])
   space: 2,                 // The number of spaces to use for indentation in the generated ABIs (default: 2)
   autoCompile: true         // Whether to automatically compile contracts before generating ABIs (default: true)
 },
  networks: {
    hardhat: {},
    mumbai: {
       url: API_URL,
       accounts: [`0x${PRIVATE_KEY}`]
    }
 },
 resolve: {
  fallback: {
    path: false,
    os:false,
    crypto:false,
  },
},

}
//ea9958663da67667a35dfbdfdfa621b8be64960e54a60d7440f68ab9d40c143c