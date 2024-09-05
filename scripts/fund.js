const{ getNamedAccounts, ethers} = require("hardhat")

async function main() {
    const {deployer} = await getNamedAccounts()
    const fundMe = await ethers.getContractAt("FundMe", deployer)
    console.log("Fundinf Contract ........")
    //const sendValue = ethers.parseUnits("50","ethers")
    const transactionResponse = await fundMe.fund({value : ethers.parseUnits("50","ether")});
    await transactionResponse.wait(1);
    console.log("Funded !!!!!")

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })