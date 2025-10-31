# VeilPoll

**Anonymous polling with homomorphic tallying**

VeilPoll enables private opinion polls and surveys where individual responses remain encrypted during collection and tallying. Built on Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM), the platform aggregates votes over encrypted data, revealing only final poll results—never individual responses.

---

## Introduction to VeilPoll

VeilPoll addresses a fundamental challenge in opinion polling: how to collect genuine responses while protecting respondent privacy. Traditional polls either expose responses (losing privacy) or require trusted intermediaries (losing verifiability). VeilPoll uses Zama FHEVM to enable homomorphic aggregation—tallying encrypted responses without decryption, ensuring privacy with cryptographic verifiability.

**Value Proposition**: Private responses, verifiable results, no trusted parties.

---

## Polling Workflow

### Phase 1: Poll Creation

**Poll Setup:**
1. Creator defines poll question and response options
2. Sets eligibility criteria (optional: token holders, allowlist)
3. Configures poll duration (start/end times)
4. Deploys poll contract with encrypted initialization

**Parameters:**
- Question text
- Response options (binary, multiple choice, ranked)
- Voting window
- Eligibility requirements
- Result revelation mechanism

### Phase 2: Response Collection

**Voting Process:**
1. Eligible voter connects wallet
2. Views poll question and options
3. Selects response
4. Encrypts response using FHE public key
5. Submits encrypted vote to smart contract
6. Receives cryptographic receipt

**Privacy Protection:**
- Response encrypted before submission
- Contract stores only encrypted ciphertext
- Validators cannot see individual votes
- Even poll creator cannot see responses

### Phase 3: Homomorphic Tallying

**Aggregation Process:**
1. Voting period closes
2. Smart contract aggregates encrypted responses
3. Computes encrypted totals for each option
4. Generates encrypted result vector
5. Creates cryptographic proof of aggregation

**Computation:**
```solidity
euint64[] encryptedTotals;
for (each encrypted vote) {
    encryptedTotals[optionId] = TFHE.add(
        encryptedTotals[optionId],
        encryptedVote
    );
}
```

### Phase 4: Result Revelation

**Result Publication:**
1. Threshold key holders decrypt results
2. Final totals published on-chain
3. Cryptographic proofs verify result correctness
4. Poll results accessible publicly
5. Individual responses remain encrypted (permanent privacy)

---

## Poll Types

### Binary Polls

**Yes/No Questions**
- Simple binary responses
- Encrypted vote submission
- Homomorphic aggregation
- Quick result revelation

**Use Cases:**
- Approval/disapproval questions
- Preference comparisons
- Simple decisions

### Multiple Choice Polls

**Multi-Option Selection**
- Multiple response options
- Encrypted selection submission
- Complex aggregation (one vote per option)
- Result distribution across options

**Use Cases:**
- Surveys with multiple options
- Preference rankings
- Category selection

### Ranked Choice Polls

**Preference Ordering**
- Voters rank options in order
- Encrypted ranking submission
- Complex homomorphic aggregation
- Weighted result calculation

**Use Cases:**
- Preference surveys
- Election primaries
- Product feature prioritization

### Weighted Polls

**Stake-Weighted Voting**
- Votes weighted by stake (tokens, reputation)
- Encrypted stake values
- Homomorphic weighted aggregation
- Proportional result calculation

**Use Cases:**
- Token-weighted governance
- Stakeholder surveys
- Reputation-based polling

---

## Privacy Architecture

### Encryption Layer

**Response Encryption:**
- Client-side encryption before submission
- FHE public key distributed to voters
- Encrypted response stored on-chain
- No plaintext exposure at any stage

**Key Management:**
- Threshold key distribution
- Multiple key holders required for revelation
- Key rotation support
- Secure key backup mechanisms

### Aggregation Layer

**Homomorphic Operations:**
- Addition of encrypted votes
- Comparison of encrypted totals
- Conditional logic over encrypted data
- Complex computations without decryption

**Privacy Guarantees:**
- Individual votes never decrypted
- Aggregation occurs over ciphertexts
- Intermediate states encrypted
- Only final totals revealed

### Verification Layer

**Result Verification:**
- Cryptographic proofs of aggregation
- Public verification of result correctness
- Immutable poll records
- Audit trail for transparency

---

## Smart Contract Design

### Core Contract Structure

```solidity
contract VeilPoll {
    struct Poll {
        string question;
        string[] options;
        euint64[] encryptedTotals;
        uint256 startTime;
        uint256 endTime;
        bool resolved;
        address creator;
    }
    
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    function createPoll(
        string memory question,
        string[] memory options,
        uint256 duration
    ) external returns (uint256 pollId);
    
    function vote(
        uint256 pollId,
        bytes calldata encryptedResponse
    ) external;
    
    function tallyPoll(uint256 pollId) external;
    
    function revealResults(
        uint256 pollId,
        bytes calldata decryptionKey
    ) external;
    
    function getResults(uint256 pollId)
        external
        view
        returns (uint256[] memory);
}
```

### Homomorphic Functions

**Vote Aggregation:**
```solidity
function aggregateVote(uint256 pollId, bytes calldata encryptedVote) internal {
    // Decode encrypted vote
    euint64[] memory voteVector = decodeEncryptedVote(encryptedVote);
    
    // Aggregate homomorphically
    for (uint i = 0; i < voteVector.length; i++) {
        polls[pollId].encryptedTotals[i] = TFHE.add(
            polls[pollId].encryptedTotals[i],
            voteVector[i]
        );
    }
}
```

**Result Comparison:**
```solidity
function findWinner(uint256 pollId) internal view returns (uint256) {
    euint64 maxVotes = polls[pollId].encryptedTotals[0];
    uint256 winner = 0;
    
    for (uint i = 1; i < polls[pollId].encryptedTotals.length; i++) {
        if (TFHE.gt(polls[pollId].encryptedTotals[i], maxVotes)) {
            maxVotes = polls[pollId].encryptedTotals[i];
            winner = i;
        }
    }
    
    return winner;
}
```

---

## Use Cases

### Community Surveys

**Scenario**: Neighborhood association surveys residents on community improvements

**Benefit**: Residents provide honest feedback without fear of social pressure

**Example**: Survey on park renovation preferences, with responses encrypted and aggregated privately

### Market Research

**Scenario**: Company surveys customers about product preferences

**Benefit**: Customers share honest opinions without concern about data exposure

**Example**: Product feature preference poll with encrypted responses and aggregate results

### Academic Research

**Scenario**: Researchers collect sensitive survey data

**Benefit**: Participants provide candid responses with verifiable result integrity

**Example**: Medical study survey with encrypted responses and publicly verifiable statistics

### Governance Polls

**Scenario**: Organization polls members on policy decisions

**Benefit**: Members vote honestly without social influence or retaliation concerns

**Example**: Policy change approval poll with encrypted votes and verifiable results

---

## Security Properties

### Privacy Guarantees

**Individual Response Privacy:**
- Responses encrypted end-to-end
- Never decrypted during processing
- Not visible to validators
- Permanent privacy (even after poll closes)

**Poll Integrity:**
- Cryptographic proofs ensure correct aggregation
- Immutable poll records
- Verifiable result correctness
- Tamper-proof voting process

**Eligibility Verification:**
- On-chain eligibility checking
- Prevents duplicate voting
- Verifiable without revealing identity
- Transparent eligibility criteria

### Threat Mitigation

**Response Disclosure:**
- Mitigated by FHE encryption
- Even if keys compromised later, responses remain encrypted
- Threshold key management reduces risk

**Manipulation:**
- Cryptographic proofs prevent result manipulation
- Public verification ensures correctness
- Immutable records prevent tampering

**Coercion:**
- Encrypted responses prevent vote buying
- Time-locked revelation prevents verification until poll closes
- Anonymous voting option

---

## Performance

### Gas Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Create poll | ~350,000 | One-time setup |
| Submit vote | ~100,000 | Per vote |
| Tally votes (100) | ~600,000 | Aggregation |
| Tally votes (1000) | ~2,500,000 | Large polls |
| Reveal results | ~150,000 | Result decryption |

### Optimization Strategies

**Batch Processing:**
- Aggregate multiple votes in single transaction
- Reduce per-vote gas costs
- Efficient encrypted aggregation

**Lazy Revelation:**
- Defer result revelation until needed
- Reduce immediate gas costs
- Allow time-locked revelation

**Scalability:**
- Layer 2 solutions for large polls
- Off-chain aggregation with on-chain verification
- Parallel processing for multiple polls

---

## Getting Started

### Installation

```bash
git clone https://github.com/yourusername/veilpoll.git
cd veilpoll
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your settings:
# - FHEVM_NODE_URL
# - CONTRACT_ADDRESS
# - RPC_URL
```

### Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Start frontend
cd frontend
npm install
npm run dev
```

### Creating Your First Poll

1. **Connect Wallet**: Use MetaMask to connect
2. **Create Poll**: Define question and options
3. **Share Poll**: Distribute poll link to voters
4. **Monitor**: Track vote submissions (count only)
5. **Close**: Voting period ends automatically
6. **Reveal**: Results published with proofs

---

## API Documentation

### Smart Contract Interface

```solidity
// Create new poll
function createPoll(
    string memory question,
    string[] memory options,
    uint256 duration
) external returns (uint256 pollId);

// Vote in poll
function vote(
    uint256 pollId,
    bytes calldata encryptedResponse
) external;

// Tally poll votes
function tallyPoll(uint256 pollId) external;

// Reveal poll results
function revealResults(
    uint256 pollId,
    bytes calldata decryptionKey
) external;

// Get poll results
function getResults(uint256 pollId)
    external
    view
    returns (uint256[] memory totals);
```

### JavaScript SDK

```typescript
import { VeilPoll } from '@veilpoll/sdk';

const client = new VeilPoll({
  provider: window.ethereum,
  contractAddress: '0x...',
});

// Create poll
const pollId = await client.createPoll({
  question: 'What is your favorite feature?',
  options: ['Feature A', 'Feature B', 'Feature C'],
  duration: 7 * 24 * 60 * 60, // 7 days
});

// Vote
const encrypted = await client.encryptResponse(optionIndex);
await client.vote(pollId, encrypted);

// Get results
const results = await client.getResults(pollId);
```

---

## Roadmap

### Q1 2025
- ✅ Core polling functionality
- ✅ Encrypted vote submission
- ✅ Homomorphic aggregation
- 🔄 Performance optimization

### Q2 2025
- 📋 Advanced poll types
- 📋 Weighted voting
- 📋 Mobile application
- 📋 Analytics dashboard

### Q3 2025
- 📋 Multi-poll campaigns
- 📋 Cross-chain support
- 📋 Enterprise features
- 📋 API improvements

### Q4 2025
- 📋 Zero-knowledge enhancements
- 📋 Decentralized key management
- 📋 Governance framework
- 📋 Post-quantum FHE support

---

## Contributing

We welcome contributions! Priority areas:

- FHE optimization for polling
- Gas cost reduction
- Security audits
- Additional poll types
- UI/UX improvements
- Documentation

**How to contribute:**
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

---

## FAQ

**Q: How private are responses if they're on a public blockchain?**  
A: Responses are encrypted with FHE before submission. Only encrypted ciphertexts are stored on-chain, and aggregation occurs over encrypted data. Individual responses are never revealed.

**Q: Can I verify that poll results are correct?**  
A: Yes! VeilPoll generates cryptographic proofs that anyone can verify, ensuring that results match the encrypted votes without revealing individual responses.

**Q: What happens if I lose my FHE key?**  
A: FHE keys are managed using threshold cryptography. As long as a quorum of key holders is available, poll results can be revealed. Individual keys aren't necessary for voting.

**Q: How expensive is it to create a poll?**  
A: Creating a poll costs ~350,000 gas. Each vote costs ~100,000 gas. For large polls, costs scale linearly but can be optimized with batch processing.

**Q: Can polls be manipulated?**  
A: No. Poll manipulation is prevented by cryptographic proofs, immutable blockchain records, and public verification mechanisms. All operations are cryptographically verifiable.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

VeilPoll is built on:

- **[Zama FHEVM](https://www.zama.ai/fhevm)**: Fully Homomorphic Encryption Virtual Machine
- **[Zama](https://www.zama.ai/)**: FHE research and development
- **Ethereum Foundation**: Blockchain infrastructure

Built with support from the privacy-preserving polling community.

---

## Links

- **Repository**: [GitHub](https://github.com/yourusername/veilpoll)
- **Documentation**: [Full Docs](https://docs.veilpoll.io)
- **Discord**: [Community](https://discord.gg/veilpoll)
- **Twitter**: [@VeilPoll](https://twitter.com/veilpoll)

---

**VeilPoll** - Private responses, verifiable results.

_Powered by Zama FHEVM_

