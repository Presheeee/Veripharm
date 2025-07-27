/*

Deployer account(local): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Deployer account(sepolia): 0x98625DEc1D20E8dD6a7966dC544bf0F59fb4390c

Old infura endpoint: https://sepolia.infura.io/v3/742c30491faa4846b80928e9f2cab7e4

Metamask PRIVATE_KEY: 0xc07d4bef49fa9a277bbb9413db0fe21679fc03af23c55443a93fc819f2800c9d

Veripharm deplyed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

*/


console.log("RPC URL:", process.env.SEPOLIA_RPC_URL);



const hre = require("hardhat");

async function main() {
  // Get the deployer account from Hardhat
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Veripharm with account:", deployer.address);

  // Compile and deploy the contract
  const Veripharm = await hre.ethers.getContractFactory("Veripharm");
  const veripharm = await Veripharm.deploy();

  // Wait for deployment (Hardhat uses ethers v6 waitForDeployment)
  if (veripharm.waitForDeployment) {
    await veripharm.waitForDeployment();
  }

  // Log the deployed address
  const address = veripharm.target || veripharm.address;
  console.log("Veripharm deployed to:", address);

  // Optionally assign the deployer as Manufacturer
  await veripharm.assignRole(deployer.address, 1);
  console.log("Assigned Manufacturer role to deployer");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


