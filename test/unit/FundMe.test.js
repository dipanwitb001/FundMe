 //const { deployments,ethers, getNamedAccounts } = require("hardhat");
// const {assert} = require("chai")

// describe("FundMe", function () {
    
//     let fundMe;
//     let deployer;
//     let mockV3Aggregator;
//     beforeEach(async function() {
//         //deployt our fundMe contract
//         //using Hardhat-deploy
//         //const accounts = await ethers.getSigners()
//         deployer = (await getNamedAccounts()).deployer

//         await deployments.fixture(["all"]) //this deploys everything in the deploy folder
//         fundMe = await ethers.getContract("FundMe",deployer) // this line give the most re-deployed fundMe contract
//         //connecting the deployer to fundme that is, when ever we call fundme, deployer gets..
//         mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer);
//     })


//     describe("constructor", function () {
//         it("Sets the aggregator addresses coorectly",async function () {
//             const response = await fundMe.priceFeed();
//             assert.equal(response, mockV3Aggregator.address);
//         })
//     })
// })

// const { assert } = require("chai");

// describe("FundMe", () => {
//     let fundMe,
//         deployer,
//         mockV3Aggregator;
//     beforeEach(async function () {
//         // deploy our fundme contract 
//         // using hardhat deploy
//         // const accounts = await ethers.getSigners()
//         deployer = await ethers.provider.getSigner();
//         await deployments.fixture(["all"]); // deploy with tags
//         fundMe = await ethers.getContractAt("FundMe", (await deployments.get("FundMe")).address, deployer); // most recently deployed fundme contract
//         mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", (await deployments.get("MockV3Aggregator")).address, deployer);
//     });

//     describe("constructor", () => {
//         it("sets the aggregator addresses correctly", async function () {
//             const response = await fundMe.priceFeed();
//             assert.equal(response, await mockV3Aggregator.getAddress());
//         });
//     });
// });



const { deployments,  getNamedAccounts,ethers } = require("hardhat");
const { assert , expect} = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

describe("FundMe", function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.parseUnits("50","ether"); // 50 ETH
  //
    //const sendValue = "50000000000000000000"
  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]); // Deploy all contracts from "deploy" folder
    fundMe = await ethers.getContract("FundMe", deployer);
  });

  describe("constructor", async function () {
    it("Sets the aggregator address correctly", async function () {
      const response = await fundMe.priceFeed();//This line calls a function (likely a getter function) in the FundMe contract that returns the address of the price feed aggregator that was set in the constructor.
      // console.log(`response: ${response}`);
      
      mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer); //This line retrieves the address of a mock version of the price feed aggregator, which is deployed during testing. Mocks are often used in testing to simulate the behavior of external dependencies (in this case, the actual price feed) without relying on live data.
      // console.log(`mockV3Aggregator: ${await mockV3Aggregator.getAddress()}`);

      assert.equal(response, await mockV3Aggregator.getAddress()); //This assertion checks that the price feed address stored in the FundMe contract (response) is exactly the same as the address of the mock price feed aggregator. This confirms that the constructor of the FundMe contract correctly set the price feed address during deployment.
    });
  });



  // The specific test case you're looking at ("Fails if you don't send enough ETH") is designed to verify that the fund function correctly reverts when a user tries to send less than the required minimum amount of ETH.

  !developmentChains.includes(network.name)
  ? describe.skip
  :describe("fund", async function () {

    //this is checking ,if less than the defined fund is sent, function is reverting back or not
    it("Fails if you don't send enough ETH", async function () {
        await expect(fundMe.fund()).to.be.revertedWith(
          "You need to spend more ETH!"
        )
        //await expect(fundMe.fund()).to.be.reverted
    })

    //here, if desired amt is sent, amount should be accepted and the address with the amout should be mapped in addressToAmountFunded;
    //here checking is done to make sure the send address and the amount is correctly entered(mapped);
    it("updated the amount funded data structure", async function () {
      await fundMe.fund({value : sendValue})

      //amount corresponding to the send address(deployer) is retrieved; and it is checked against the amount send(sendValue)
      const response = await fundMe.addressToAmountFunded(deployer)
      assert.equal(response.toString(),sendValue.toString())
    })

    //checking if the send address is added to the array of funders
    it("Adds funder to array of funders", async function () {
        await fundMe.fund({value: sendValue})
        const funder = await fundMe.funders(0);
        assert.equal(funder,deployer);
      })
  })


  describe("withdraw",async function () {

    //describing beforeEach, which will be executed first before it as, we are tesing withdraw function, we need to have some ether(fund) our acc
    beforeEach(async function () {
      await fundMe.fund({value : sendValue})
    })

    //checking if the withdraw function is working properly or not
    it("withdraw ETH from a single founder", async function () {
      //Arrange
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      )//gets the balance of the FundMe contract before the withdrawal. This balance should be non-zero if the contract has been funded previously.

      //fundMe.provider didnt work due to version error
      const startingDeployerBalnce = await ethers.provider.getBalance(deployer) //Gets the balance of the deployer before the withdrawal. This value will be compared with the deployer's balance after the withdrawal to ensure the ETH was transferred correctly.

      //Act

      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const {gasUsed, gasPrice} = transactionReceipt;
      const gasCost = gasUsed * gasPrice //multiplication of twq BigNumber

      //Assert

      const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target); //Checks that the contract's balance is zero after the withdrawal, confirming that all funds have been withdrawn.

      const endingDeployerBalance = await ethers.provider.getBalance(deployer); //Ensures that the deployer's balance has increased by the amount withdrawn, minus the gas costs of the transaction. The assertion checks that the deployer’s final balance matches the expected value, calculated as the sum of the initial contract balance and deployer’s balance minus the gas cost.

      //Assert

      assert.equal(endingFundMeBalance,0)
      assert.equal((startingFundMeBalance + startingDeployerBalnce).toString(),(endingDeployerBalance +gasCost).toString())
      //assert.equal(startingFundMeBalance.add(startingDeployerBalnce).toString(),endingDeployerBalance.add(gasCost).toString()) --> didnt work due to version error
    })
    

    it("allows us to withdraw with multiple funders", async function() {

      const accounts = await ethers.getSigners();
      for(let i = 1; i<+6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({value: sendValue})
      }

      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      )
      
      const startingDeployerBalnce = await ethers.provider.getBalance(deployer)

      //Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const {gasUsed, gasPrice} = transactionReceipt;
      const gasCost = gasUsed * gasPrice;

      //Assert
      const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target); //Checks that the contract's balance is zero after the withdrawal, confirming that all funds have been withdrawn.

      const endingDeployerBalance = await ethers.provider.getBalance(deployer); //Ensures that the deployer's balance has increased by the amount withdrawn, minus the gas costs of the transaction. The assertion checks that the deployer’s final balance matches the expected value, calculated as the sum of the initial contract balance and deployer’s balance minus the gas cost.

      //Assert

      assert.equal(endingFundMeBalance,0)
      assert.equal((startingFundMeBalance + startingDeployerBalnce).toString(),(endingDeployerBalance +gasCost).toString())


      //Make sure that the funders are reset properly
      await expect(fundMe.funders(0)).to.be.reverted

      for(let i=1;i<6;i++)
      {

        //getting the amount from the mapped address and checking it should be 0
        const fundedAmount = await fundMe.addressToAmountFunded(accounts[i]);
        assert.equal(fundedAmount.toString(), '0');
        // assert.equal(
        //   await fundMe.addressToAmountFunded(accounts[i]).target,0
        // )
      }

    })

    // it("Only allows the owner to withdraw", async function() {
    //     const accounts =await ethers.getSigners();
    //     const attacker = accounts[1];
    //     const attackerConnectedContract = await fundMe.connect(attacker)
    //     await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");
    // })

    it("Only allows the owner to withdraw", async function() {
      const accounts = await ethers.getSigners();  // Await the getSigners call
      const attacker = accounts[1];  // Use the second account as the attacker
      const attackerConnectedContract = await fundMe.connect(attacker);  // Connect attacker to the contract
  
      // Expect the withdrawal attempt to be reverted with the custom error
      await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
  });
  
  })
});

//With("FundMe__NotOwner");
