"use client";

import { ethers } from "ethers";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import type { FhevmInstance } from "@fhevm/react";
import { FHEFashionPollABI } from "@/abi/FHEFashionPollABI";
import { FHEFashionPollAddresses } from "@/abi/FHEFashionPollAddresses";

type PollInfo = {
  abi: typeof FHEFashionPollABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getPollByChainId(chainId: number | undefined): PollInfo {
  if (!chainId) return { abi: FHEFashionPollABI.abi };
  const key = String(chainId) as keyof typeof FHEFashionPollAddresses;
  const entry = FHEFashionPollAddresses[key];
  if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: FHEFashionPollABI.abi, chainId };
  }
  return {
    abi: FHEFashionPollABI.abi,
    address: entry.address as `0x${string}`,
    chainId: entry.chainId ?? chainId,
    chainName: entry.chainName,
  };
}

export const useFHEFashionPoll = (params: {
  instance: FhevmInstance | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
}) => {
  const { instance, chainId, ethersSigner, ethersReadonlyProvider } = params;
  const [message, setMessage] = useState<string>("");
  const [yesHandle, setYesHandle] = useState<string | undefined>(undefined);
  const [noHandle, setNoHandle] = useState<string | undefined>(undefined);
  const [hasVoted, setHasVoted] = useState<boolean | undefined>(undefined);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pollRef = useRef<PollInfo | undefined>(undefined);

  const poll = useMemo(() => {
    const c = getPollByChainId(chainId);
    pollRef.current = c;
    setMessage("");
    return c;
  }, [chainId]);

  const canVote = useMemo(() => {
    return Boolean(poll.address && instance && ethersSigner && !isVoting);
  }, [poll.address, instance, ethersSigner, isVoting]);

  const canLoadTallies = useMemo(() => {
    return Boolean(poll.address && ethersReadonlyProvider && !isLoading);
  }, [poll.address, ethersReadonlyProvider, isLoading]);

  // Load hasVoted for the current signer
  useEffect(() => {
    const run = async () => {
      try {
        if (!poll.address || !ethersSigner) {
          setHasVoted(undefined);
          return;
        }
        const ctr = new ethers.Contract(poll.address, poll.abi, ethersSigner);
        const addr = await ethersSigner.getAddress();
        const v = await ctr.hasVoted(addr);
        setHasVoted(Boolean(v));
      } catch {
        setHasVoted(undefined);
      }
    };
    run();
  }, [poll.address, poll.abi, ethersSigner]);

  const refreshTallies = useCallback(() => {
    if (!poll.address || !ethersReadonlyProvider) return;
    setIsLoading(true);
    const c = new ethers.Contract(poll.address, poll.abi, ethersReadonlyProvider);
    c
      .getTallies()
      .then((res: [string, string]) => {
        setYesHandle(res[0]);
        setNoHandle(res[1]);
      })
      .catch(() => setMessage("getTallies failed"))
      .finally(() => setIsLoading(false));
  }, [poll.address, poll.abi, ethersReadonlyProvider]);

  const vote = useCallback(
    (choice: 0 | 1) => {
      if (!poll.address || !instance || !ethersSigner) return;
      setIsVoting(true);
      setMessage("Encrypting vote...");
      const run = async () => {
        try {
          // Optional pre-check: prevent revert spam
          try {
            const ro = new ethers.Contract(poll.address!, poll.abi, ethersSigner);
            const already: boolean = await ro.hasVoted(ethersSigner.address);
            if (already) {
              setMessage("You have already voted");
              return;
            }
          } catch {}

          // Ensure signer address is resolved before building the input
          const userAddr = await ethersSigner.getAddress();
          // small yield to let wasm modules settle (prevents rare attestation races)
          await new Promise((r) => setTimeout(r, 100));
          const contractAddress = poll.address!;
          const input = instance.createEncryptedInput(contractAddress, userAddr);
          input.add8(choice);
          const enc = await input.encrypt();
          const contract = new ethers.Contract(contractAddress, poll.abi, ethersSigner);
          const tx = await contract.vote(enc.handles[0], enc.inputProof);
          await tx.wait();
          setMessage("Vote submitted");
          refreshTallies();
        } catch (e: any) {
          const msg = e?.reason || e?.shortMessage || e?.message || String(e);
          setMessage(`Vote failed: ${msg}`);
        } finally {
          setIsVoting(false);
        }
      };
      run();
    },
    [poll.address, poll.abi, instance, ethersSigner, refreshTallies]
  );

  return {
    contractAddress: poll.address,
    message,
    yesHandle,
    noHandle,
    hasVoted,
    canVote,
    canLoadTallies,
    vote,
    refreshTallies,
    isVoting,
    isLoading,
  };
};

