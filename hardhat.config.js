require("dotenv").config();

//console.log("Loaded RPC URL:", process.env.SEPOLIA_RPC_URL);

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
    
    networks: {
      sepolia: {
        url: process.env.SEPOLIA_RPC_URL, // now picks up your .env value
        accounts: [process.env.PRIVATE_KEY], // likewise for your private key
    },
  }, 
       
};
