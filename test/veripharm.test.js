const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Veripharm Smart Contract", function () {
  let Veripharm, veripharm;
  let owner, manufacturer, distributor, pharmacist, unauthorized;
  const BATCH_ID = "BATCH001";
  const DRUG_NAME = "Amoxicillin";
  const MFG_DATE = Math.floor(Date.now() / 1000);
  const EXPIRY_DATE = MFG_DATE + 1000; // expires shortly

  beforeEach(async function () {
    [owner, manufacturer, distributor, pharmacist, unauthorized] = await ethers.getSigners();
    Veripharm = await ethers.getContractFactory("Veripharm");
    // Deploy contract and wait for deployment
    veripharm = await Veripharm.deploy();
    if (veripharm.waitForDeployment) {
      await veripharm.waitForDeployment();
    }

    // Assign roles
    await veripharm.assignRole(manufacturer.address, 1); // Manufacturer
    await veripharm.assignRole(distributor.address, 2);  // Distributor
    await veripharm.assignRole(pharmacist.address, 3);  // Pharmacist
  });

  it("should allow manufacturer to register a new drug batch", async function () {
    await expect(
      veripharm.connect(manufacturer).registerDrug(
        BATCH_ID,
        DRUG_NAME,
        "PharmaCo",
        MFG_DATE,
        EXPIRY_DATE
      )
    )
      .to.emit(veripharm, 'DrugRegistered')
      .withArgs(BATCH_ID, DRUG_NAME, manufacturer.address);

    const [isValid, status] = await veripharm.verifyAuthenticity(BATCH_ID);
    expect(isValid).to.be.true;
    expect(status).to.equal("Valid and authentic");
  });

  it("should prevent unauthorized addresses from registering", async function () {
    await expect(
      veripharm.connect(unauthorized).registerDrug(
        BATCH_ID,
        DRUG_NAME,
        "PharmaCo",
        MFG_DATE,
        EXPIRY_DATE
      )
    ).to.be.revertedWith("Access denied for this role");
  });

  it("should transfer custody correctly and emit event", async function () {
    await veripharm.connect(manufacturer).registerDrug(BATCH_ID, DRUG_NAME, "PharmaCo", MFG_DATE, EXPIRY_DATE);
    await expect(
      veripharm.connect(manufacturer).transferCustody(BATCH_ID, distributor.address)
    )
      .to.emit(veripharm, 'CustodyTransferred')
      .withArgs(BATCH_ID, manufacturer.address, distributor.address);

    const trail = await veripharm.getCustodyTrail(BATCH_ID);
    expect(trail[trail.length - 1]).to.equal(distributor.address);
  });

  it("should not transfer after expiry", async function () {
    await veripharm.connect(manufacturer).registerDrug(BATCH_ID, DRUG_NAME, "PharmaCo", MFG_DATE, MFG_DATE + 1);
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    await expect(
      veripharm.connect(manufacturer).transferCustody(BATCH_ID, distributor.address)
    ).to.be.revertedWith("Drug has expired");
  });

  it("should revoke a drug batch and block operations", async function () {
    await veripharm.connect(manufacturer).registerDrug(BATCH_ID, DRUG_NAME, "PharmaCo", MFG_DATE, EXPIRY_DATE);
    await expect(
      veripharm.connect(manufacturer).revokeDrug(BATCH_ID, "Quality issue")
    ).to.emit(veripharm, 'DrugRevoked').withArgs(BATCH_ID, "Quality issue");

    const [isValid, status] = await veripharm.verifyAuthenticity(BATCH_ID);
    expect(isValid).to.be.false;
    expect(status).to.equal("Revoked");

    await expect(
      veripharm.connect(manufacturer).transferCustody(BATCH_ID, distributor.address)
    ).to.be.revertedWith("Drug batch has been revoked");
  });

  it("should enforce role restrictions on revokeDrug", async function () {
    await veripharm.connect(manufacturer).registerDrug(BATCH_ID, DRUG_NAME, "PharmaCo", MFG_DATE, EXPIRY_DATE);
    await expect(
      veripharm.connect(distributor).revokeDrug(BATCH_ID, "Test")
    ).to.be.revertedWith("Access denied for this role");
  });
});
