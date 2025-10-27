import { expect } from "chai";
import { ethers } from "hardhat";

describe("FHEFashionPoll", () => {
    it("prevents double vote and tallies encrypted", async () => {
        const [alice, bob] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("FHEFashionPoll");
        const poll = await Factory.deploy();
        await poll.waitForDeployment();

        // Check initial state
        expect(await poll.hasVoted(alice.address)).to.be.false;
        
        // Mock encrypted input for testing
        // In real implementation, this would use FHEVM's createEncryptedInput
        const mockEncryptedChoice = "0x" + "1".padStart(64, "0"); // Mock bytes32
        const mockAttestation = "0x" + "a".repeat(64); // Mock attestation

        // Alice votes
        await expect(poll.connect(alice).vote(mockEncryptedChoice, mockAttestation))
            .to.emit(poll, "Voted")
            .withArgs(alice.address);

        // Check Alice has voted
        expect(await poll.hasVoted(alice.address)).to.be.true;

        // Alice tries to vote again - should fail
        await expect(poll.connect(alice).vote(mockEncryptedChoice, mockAttestation))
            .to.be.revertedWith("Already voted");

        // Bob can still vote
        expect(await poll.hasVoted(bob.address)).to.be.false;
        await expect(poll.connect(bob).vote(mockEncryptedChoice, mockAttestation))
            .to.emit(poll, "Voted")
            .withArgs(bob.address);

        // Get tallies (encrypted)
        const tallies = await poll.getTallies();
        expect(tallies.yes).to.not.equal("0x" + "0".repeat(64));
        expect(tallies.no).to.not.equal("0x" + "0".repeat(64));
    });
});

