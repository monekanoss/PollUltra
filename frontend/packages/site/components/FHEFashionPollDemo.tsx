"use client";

import { useFhevm } from "@fhevm/react";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useFHEFashionPoll } from "../hooks/useFHEFashionPoll";

export const FHEFashionPollDemo = () => {
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const { instance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const poll = useFHEFashionPoll({
    instance,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  });

  const button =
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  if (!isConnected) {
    return (
      <div className="mx-auto">
        <button className={button} onClick={connect}>
          <span className="text-4xl p-6">Connect to MetaMask</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white">
        <p className="font-semibold  text-3xl m-5">
          FHE Fashion Poll
          <span className="font-mono font-normal text-gray-400 ml-3">
            contract: {poll.contractAddress ?? "(not set)"}
          </span>
        </p>
      </div>

      {/* Info banner when no contract configured for current network */}
      {(!poll.contractAddress) && (
        <div className="col-span-full mx-20 mb-2 rounded-md border-2 border-black bg-white p-4">
          <p className="text-black text-sm">
            Contract address is not set for the current network. Please connect MetaMask and switch to <span className="font-semibold">Sepolia</span> to interact. If you deployed to a different network, update <code>packages/site/abi/FHEFashionPollAddresses.ts</code> with your contract address.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 mx-20 gap-4">
        <button className={button} disabled={!poll.canVote} onClick={() => poll.vote(1)}>
          Yes
        </button>
        <button className={button} disabled={!poll.canVote} onClick={() => poll.vote(0)}>
          No
        </button>
      </div>

      <div className="grid grid-cols-2 mx-20 gap-4">
        <button className={button} disabled={!poll.canLoadTallies} onClick={poll.refreshTallies}>
          Refresh Tallies (encrypted)
        </button>
      </div>

      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className="font-semibold text-black text-lg mt-4">Encrypted Tallies</p>
        <p className="text-black">yes (handle): {poll.yesHandle ?? "-"}</p>
        <p className="text-black">no (handle): {poll.noHandle ?? "-"}</p>
        <p className="text-black">hasVoted: {poll.hasVoted === undefined ? "?" : poll.hasVoted ? "true" : "false"}</p>
      </div>

      <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
        <p className="text-black">{poll.message}</p>
      </div>
    </div>
  );
};

