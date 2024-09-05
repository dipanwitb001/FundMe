const { getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("ethers")


!developmentChains.includes(network.name) 
? describe.skip 
: describe("FundMe", async function() {
    let fundMe
    let deployer
    const sendValue = ethers.parseUnits("50","ethers")
    beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer)
    })

    it("allows people to fund and withdraw", async function() {
        await fundMe.fund({value: sendValue})
        await fundMe.withdraw()
        const endingBalance = await ethers.provider.getBalance(
            fundMe.target
        )

        assert.equal(endingBalance.toString(), "0");
    })
})