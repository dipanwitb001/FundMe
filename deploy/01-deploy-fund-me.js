
//one way
// function deployFunc() {
//     console.log("hii");
         //hre.getNamedAccounts
         //hre.deployments

const { getNamedAccounts } = require("hardhat");

// }


// module.exports.default = deployFunc;

//doing this, when we call npx hardhat deploy,it automatically executes the function mentioned in deploy.js
// module.exports = async(hre) => {
//     const {getNamedAccounts, deployments} = hre
//     //hre.getNamedAccounts
//     //hre.deployments
// }

const {networkConfig, developmentChains} = require("../helper-hardhat-config");
const {network} = require("hardhat");
const {verify} = require("../utils/verify");
require("dotenv").config();

module.exports = async({getNamedAccounts, deployments}) => {
    const {deploy, log } = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    //if chainId is X use address Y
    //if chainId is Z use address A

    //const ethUsedPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    let ethUsdPriceFeedAddress;
    if(developmentChains.includes(network.name)){
        const ethUsdAggregator =await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;

    }
    else 
    {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    //f the contract doesnt exist, we ploy a minimal version for our local testing

    //well what happens when we want to change chains?
    //wwhen going for localhost or hardhat network we want to use mock
    //const args = ethUsdPriceFeedAddress;

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) 
    {
        //verify
        await verify(fundMe.address,[ethUsdPriceFeedAddress]);
    }
    log("-------------------------------------------------------");

}
module.exports.tags = ["all","fundme"];