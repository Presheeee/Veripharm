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
