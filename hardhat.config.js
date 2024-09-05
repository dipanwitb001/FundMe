//const { version } = require("hardhat");

require("@nomicfoundation/hardhat-toolbox");
//const {vars} = require("hardhat/config");
require('dotenv').config();
require("@nomicfoundation/hardhat-ethers");
require("@nomiclabs/hardhat-ethers") // issue with ethers.getContract is not a function solved by adding this
//require("./tasks/block-number");
require("solidity-coverage");
//require("hardhat-gas-reporter");
require('hardhat-deploy');
//require('hardhat-deploy');

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia";
const PRIVATE_KEY = process.env.PRIVATE_KEY  || "0&key";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";
module.exports = {
  //defaultNetwork: "hardhat",
  networks:{
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      // gas: 2100000, // Example gas limit
      // gasPrice: 20000000000 // Example gas price (20 Gwei)
      blockConfirmations: 6,

    },

    //provided by hardhat...works just as deploying contract on vm(cancum) in remix ide or ganache
    localhost: {
      url: "http://127.0.0.1:8545/",
      //accounts : thanks hardhat!!
      chainId: 31337,
    }
  },
  solidity: "0.8.24",
  // solidity : {
  //   compilers: [{ version : "0.8.24"}, { version : "0.6.6"}]
  // },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    //coinmarketcap: COINMARKETCAP_API_KEY,
    token:"MATIC",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    }
  }
};
