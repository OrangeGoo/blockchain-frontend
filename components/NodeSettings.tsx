"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBlockchain } from "@/context/BlockchainContext";
import { Server, Sliders } from "lucide-react";
import { toast } from "react-hot-toast";

export default function NodeSettings() {
  const { miningParams, peers, nodeUrl, setNodeUrl, updateMiningParams } =
    useBlockchain();

  const [newNodeUrl, setNewNodeUrl] = useState("");
  const [updatedMiningParams, setUpdatedMiningParams] = useState({
    difficulty: 0,
    target_block_time: 0,
    adjustment_interval: 0,
    time_tolerance: 0,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (miningParams) {
      setUpdatedMiningParams({
        difficulty: miningParams.difficulty,
        target_block_time: miningParams.target_block_time,
        adjustment_interval: miningParams.adjustment_interval,
        time_tolerance: miningParams.time_tolerance,
      });
    }
  }, [miningParams]);

  useEffect(() => {
    const savedUrl = localStorage.getItem("currentNodeUrl");
    if (savedUrl) {
      setNodeUrl(savedUrl);
    }
  }, [setNodeUrl]);

  const handleSwitchNode = (url: string) => {
    localStorage.setItem("currentNodeUrl", url);
    setNodeUrl(url);
    toast.success(`Switched to node: ${url}`);
    window.location.reload();
  };

  const handleUrlSubmit = () => {
    if (!newNodeUrl) {
      toast.error("Please enter a valid node URL");
      return;
    }

    try {
      const url = new URL(newNodeUrl);
      handleSwitchNode(url.origin); // use only scheme + host + port
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Invalid URL format");
    }
  };

  const handleUpdateMiningParams = async () => {
    setIsUpdating(true);

    try {
      const response = await updateMiningParams(updatedMiningParams);

      if (response) {
        toast.success("Mining parameters updated successfully");
      } else {
        toast.error("Failed to update mining parameters");
      }
    } catch (error) {
      console.error("Error updating mining parameters:", error);
      toast.error("Error updating mining parameters");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Node Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Node Configuration
            </CardTitle>
            <CardDescription>
              Configure which blockchain node to connect to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Node</Label>
              <div className="flex items-center rounded-md border px-3 py-2 text-sm">
                {nodeUrl}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-node">Switch Node (Enter URL)</Label>
              <div className="flex space-x-2">
                <Input
                  id="new-node"
                  placeholder="http://localhost:5001"
                  value={newNodeUrl}
                  onChange={(e) => setNewNodeUrl(e.target.value)}
                />
                <Button onClick={handleUrlSubmit}>Switch</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Nodes</Label>
              <div className="rounded-md border divide-y">
                {peers.map((peer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3"
                  >
                    <span className="text-sm">{peer}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSwitchNode(peer)}
                    >
                      Select
                    </Button>
                  </div>
                ))}
                {peers.length === 0 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No peers available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Mining Parameters
            </CardTitle>
            <CardDescription>
              Configure blockchain mining settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {miningParams ? (
              <>
                <>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Input
                      id="difficulty"
                      type="number"
                      min="1"
                      value={updatedMiningParams.difficulty}
                      onChange={(e) =>
                        setUpdatedMiningParams({
                          ...updatedMiningParams,
                          difficulty: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher difficulty means more computational work required
                      to mine a block
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-time">
                      Target Block Time (seconds)
                    </Label>
                    <Input
                      id="target-time"
                      type="number"
                      min="1"
                      value={updatedMiningParams.target_block_time}
                      onChange={(e) =>
                        setUpdatedMiningParams({
                          ...updatedMiningParams,
                          target_block_time: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Target time between blocks in seconds
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustment">Adjustment Interval</Label>
                    <Input
                      id="adjustment"
                      type="number"
                      min="1"
                      value={updatedMiningParams.adjustment_interval}
                      onChange={(e) =>
                        setUpdatedMiningParams({
                          ...updatedMiningParams,
                          adjustment_interval: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of blocks between difficulty adjustments
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tolerance">Time Tolerance</Label>
                    <Input
                      id="tolerance"
                      type="number"
                      min="0.01"
                      max="1"
                      step="0.01"
                      value={updatedMiningParams.time_tolerance}
                      onChange={(e) =>
                        setUpdatedMiningParams({
                          ...updatedMiningParams,
                          time_tolerance: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Tolerance factor for difficulty adjustment (0.1 = 10%)
                    </p>
                  </div>
                </>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Loading mining parameters...
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpdateMiningParams}
              disabled={isUpdating || !miningParams}
              className="w-full"
            >
              {isUpdating ? "Updating..." : "Update Mining Parameters"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
