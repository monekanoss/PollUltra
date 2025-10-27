export const FHEFashionPollABI = {
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "voter",
          type: "address",
        },
      ],
      name: "Voted",
      type: "event",
    },
    {
      inputs: [],
      name: "getTallies",
      outputs: [
        { internalType: "euint64", name: "yes", type: "bytes32" },
        { internalType: "euint64", name: "no", type: "bytes32" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "hasVoted",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "protocolId",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        { internalType: "externalEuint8", name: "encChoice", type: "bytes32" },
        { internalType: "bytes", name: "attestation", type: "bytes" },
      ],
      name: "vote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

