import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("FHEFashionPoll");
  const poll = await Factory.deploy();
  await poll.waitForDeployment();

  const address = await poll.getAddress();
  console.log("FHEFashionPoll deployed:", address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});