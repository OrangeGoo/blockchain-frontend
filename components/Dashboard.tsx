"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlockchain } from "@/context/BlockchainContext";
import { Database, Server, Network, Clock, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const {
    chain,
    miningParams,
    nodeStatus,
    peers,
    refreshChain,
    fetchMiningParams,
    mine,
    nodeUrl,
  } = useBlockchain();

  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMining, setIsMining] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [nodeUrl]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await refreshChain();
    await fetchMiningParams();
    setLastRefreshed(new Date());
    setIsRefreshing(false);
  };

  const handleMine = async () => {
    setIsMining(true);
    await mine();
    setIsMining(false);
  };

  const latestBlock = chain.length > 0 ? chain[chain.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button onClick={handleMine} disabled={isMining}>
            {isMining ? "Mining..." : "Mine New Block"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Blockchain Height
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chain.length}</div>
            <p className="text-xs text-muted-foreground">
              {latestBlock &&
                `Last block: ${formatDistanceToNow(
                  latestBlock.timestamp * 1000,
                  { addSuffix: true }
                )}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mining Difficulty
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {miningParams?.difficulty || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Target block time: {miningParams?.target_block_time || "N/A"}{" "}
              seconds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Peers
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peers.length}</div>
            <p className="text-xs text-muted-foreground">
              {nodeStatus ? "Node is online" : "Node is offline"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
            </div>
            <p
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {lastRefreshed.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="blockchain">
        <TabsList>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="peers">Peers</TabsTrigger>
        </TabsList>

        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Blocks</CardTitle>
              <CardDescription>
                The most recent blocks added to the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chain
                  .slice(-5)
                  .reverse()
                  .map((block) => (
                    <div
                      key={block.index}
                      className="flex flex-col space-y-2 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Block #{block.index}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(block.timestamp * 1000).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Hash:</span>
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {block.hash.substring(0, 16)}...
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Prev Hash:</span>
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {block.previous_hash.substring(0, 16)}...
                          </code>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Transactions:</span>{" "}
                          {block.transactions.length}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peers">
          <Card>
            <CardHeader>
              <CardTitle>Connected Peers</CardTitle>
              <CardDescription>
                Other nodes in the blockchain network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {peers.length > 0 ? (
                  peers.map((peer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        <span>{peer}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-sm text-muted-foreground">
                          Online
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No peers connected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
