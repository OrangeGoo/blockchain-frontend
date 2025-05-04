/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlockchain } from "@/context/BlockchainContext";
import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function BlockchainExplorer() {
  const { chain, verifyBlock } = useBlockchain();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSearch = () => {
    if (!searchTerm) return;

    // Try to find block by index
    const blockIndex = Number.parseInt(searchTerm);
    if (!isNaN(blockIndex) && blockIndex >= 0 && blockIndex < chain.length) {
      setSelectedBlock(chain[blockIndex]);
      return;
    }

    // Try to find block by hash
    const blockByHash = chain.find((block) => block.hash.includes(searchTerm));
    if (blockByHash) {
      setSelectedBlock(blockByHash);
      return;
    }

    // Try to find transaction
    for (const block of chain) {
      const transaction = block.transactions.find(
        (tx) =>
          tx.sender.includes(searchTerm) || tx.recipient.includes(searchTerm)
      );
      if (transaction) {
        setSelectedBlock(block);
        return;
      }
    }

    setSelectedBlock(null);
  };

  const handleVerifyBlock = async (blockIndex: number) => {
    setIsVerifying(true);
    const result = await verifyBlock(blockIndex);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const renderVerificationStatus = () => {
    if (!verificationResult) return null;

    const isValidVerification = (
      verification: { [s: string]: unknown } | ArrayLike<unknown>
    ) => {
      // Check if all fields ending with _ok or _match are true
      return Object.entries(verification).every(([key, value]) => {
        if (key.endsWith("_ok") || key.endsWith("_match")) {
          return value === true;
        }
        return true; // Skip fields that don't end with _ok or _match
      });
    };

    const localVerification = verificationResult.local_verification;
    const isLocalValid = isValidVerification(localVerification);

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLocalValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Verification Result for Block #{verificationResult.block_index}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Local Verification</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    localVerification.hash_ok ? "default" : "destructive"
                  }
                >
                  Hash
                </Badge>
                {localVerification.hash_ok ? "Valid" : "Invalid"}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    localVerification.merkle_ok ? "default" : "destructive"
                  }
                >
                  Merkle Root
                </Badge>
                {localVerification.merkle_ok ? "Valid" : "Invalid"}
              </div>
            </div>
          </div>

          {verificationResult.peer_verification &&
            Object.keys(verificationResult.peer_verification).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Peer Verification</h3>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(verificationResult.peer_verification).map(
                    ([peer, result]: [string, any], index) => {
                      const isValid = Object.values(result).every(
                        (val) => val === true
                      );

                      return (
                        <AccordionItem key={index} value={`peer-${index}`}>
                          <AccordionTrigger className="flex items-center gap-2">
                            {isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                            Peer: {peer}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-2 p-2">
                              {Object.entries(result).map(
                                ([check, value]: [string, any], idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                  >
                                    <Badge
                                      variant={
                                        value ? "default" : "destructive"
                                      }
                                    >
                                      {check.replace(/_/g, " ")}
                                    </Badge>
                                    {value ? "Valid" : "Invalid"}
                                  </div>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                  )}
                </Accordion>
              </div>
            )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Blockchain Explorer
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Blockchain</CardTitle>
          <CardDescription>
            Search by block index, block hash, or transaction details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Block #, hash, sender or recipient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="blocks">
        <TabsList>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="details">Block Details</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain</CardTitle>
              <CardDescription>All blocks in the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chain
                  .slice()
                  .reverse()
                  .map((block) => (
                    <div
                      key={block.index}
                      className="flex flex-col space-y-2 rounded-lg border p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedBlock(block)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Block #{block.index}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimestamp(block.timestamp)}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Hash:</span>
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {block.hash.substring(0, 20)}...
                          </code>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Transactions:</span>{" "}
                          {block.transactions.length}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyBlock(block.index);
                          }}
                        >
                          Verify Block
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          {selectedBlock ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Block #{selectedBlock.index} Details
                </CardTitle>
                <CardDescription>
                  Created {formatTimestamp(selectedBlock.timestamp)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Block Information</Label>
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Hash:</span>
                        <div className="mt-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs break-all">
                            {selectedBlock.hash}
                          </code>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Previous Hash:</span>
                        <div className="mt-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs break-all">
                            {selectedBlock.previous_hash}
                          </code>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      <div>
                        <span className="font-medium">Merkle Root:</span>
                        <div className="mt-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs break-all">
                            {selectedBlock.merkle_root}
                          </code>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Nonce:</span>
                          <div className="mt-1">
                            <code className="rounded bg-muted px-2 py-1 text-xs">
                              {selectedBlock.nonce}
                            </code>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Timestamp:</span>
                          <div className="mt-1">
                            <code className="rounded bg-muted px-2 py-1 text-xs">
                              {selectedBlock.timestamp}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Transactions ({selectedBlock.transactions.length})
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyBlock(selectedBlock.index)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify Block"}
                    </Button>
                  </div>

                  {selectedBlock.transactions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedBlock.transactions.map(
                        (tx: any, index: number) => (
                          <div key={index} className="rounded-md border p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">From:</span>
                                <div className="mt-1">
                                  <code className="rounded bg-muted px-2 py-1 text-xs">
                                    {tx.sender}
                                  </code>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">To:</span>
                                <div className="mt-1">
                                  <code className="rounded bg-muted px-2 py-1 text-xs">
                                    {tx.recipient}
                                  </code>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium">Amount:</span>{" "}
                              {tx.amount}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground border rounded-md">
                      No transactions in this block
                    </div>
                  )}
                </div>

                {renderVerificationStatus()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p>Select a block to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
