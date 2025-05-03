/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previous_hash: string;
  hash: string;
  merkle_root: string;
  nonce: number;
}

interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
}

interface VoteResult {
  candidate: string;
  votes: number;
}

interface VoteStatus {
  voter: string;
  has_voted: boolean;
  voted_candidate?: string;
  vote_time?: number;
  block_height?: number;
}

interface MiningParams {
  difficulty: number;
  target_block_time: number;
  adjustment_interval: number;
  time_tolerance: number;
}

interface BlockchainContextType {
  chain: Block[];
  pendingTransactions: Transaction[];
  voteResults: VoteResult[];
  totalVotes: number;
  miningParams: MiningParams | null;
  nodeStatus: boolean;
  peers: string[];
  refreshChain: () => Promise<void>;
  refreshVotes: () => Promise<void>;
  submitVote: (voter: string, candidate: string) => Promise<boolean>;
  checkVoteStatus: (voter: string) => Promise<VoteStatus | null>;
  mine: () => Promise<Block | null>;
  addTransaction: (
    transaction: Omit<Transaction, "timestamp">
  ) => Promise<boolean>;
  verifyBlock: (blockIndex?: number) => Promise<any>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(
  undefined
);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [chain, setChain] = useState<Block[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(
    []
  );
  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [miningParams, setMiningParams] = useState<MiningParams | null>(null);
  const [nodeStatus, setNodeStatus] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);

  // Initialize and check connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get("/chain");
        setNodeStatus(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setNodeStatus(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (nodeStatus) {
      refreshChain();
      refreshVotes();
      fetchMiningParams();
      fetchPeers();
    }
  }, [nodeStatus]);

  const refreshChain = async () => {
    try {
      const response = await api.get("/chain");
      if (response.data.status === "success") {
        setChain(response.data.data.chain);
      }
    } catch (error) {
      console.error("Error fetching blockchain:", error);
    }
  };

  const refreshVotes = async () => {
    try {
      const response = await api.get("/votes");
      if (response.data.status === "success") {
        setVoteResults(response.data.data.results);
        setTotalVotes(response.data.data.total_votes);
      }
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const fetchMiningParams = async () => {
    try {
      const response = await api.get("/mining_params");
      if (response.data.status === "success") {
        setMiningParams(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching mining parameters:", error);
    }
  };

  const fetchPeers = async () => {
    try {
      const response = await api.get("http://localhost:6000/peers");
      if (response.data.status === "success") {
        setPeers(response.data.data.peers);
      }
    } catch (error) {
      console.error("Error fetching peers:", error);
    }
  };

  const submitVote = async (voter: string, candidate: string) => {
    try {
      const response = await api.post("/vote", { voter, candidate });
      if (response.data.status === "success") {
        toast.success(
          "Vote submitted successfully! Mining required to confirm."
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote");
      return false;
    }
  };

  const checkVoteStatus = async (voter: string) => {
    try {
      const response = await api.get(`/vote_status?voter=${voter}`);
      if (response.data.status === "success") {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error checking vote status:", error);
      return null;
    }
  };

  const mine = async () => {
    try {
      const response = await api.post("/mine");
      if (response.data.status === "success") {
        toast.success("Block mined successfully!");
        refreshChain();
        refreshVotes();
        return response.data.block;
      }
      return null;
    } catch (error) {
      console.error("Error mining block:", error);
      toast.error("Failed to mine block");
      return null;
    }
  };

  const addTransaction = async (
    transaction: Omit<Transaction, "timestamp">
  ) => {
    try {
      const response = await api.post("/transaction", transaction);
      if (response.data.status === "success") {
        toast.success("Transaction added to pending pool");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
      return false;
    }
  };

  const verifyBlock = async (blockIndex?: number) => {
    try {
      const url =
        blockIndex !== undefined
          ? `/verify_block?block_index=${blockIndex}`
          : "/verify_block";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error verifying block:", error);
      return null;
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        chain,
        pendingTransactions,
        voteResults,
        totalVotes,
        miningParams,
        nodeStatus,
        peers,
        refreshChain,
        refreshVotes,
        submitVote,
        checkVoteStatus,
        mine,
        addTransaction,
        verifyBlock,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};
