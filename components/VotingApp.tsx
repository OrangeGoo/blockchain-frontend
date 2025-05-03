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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBlockchain } from "@/context/BlockchainContext";
import { Check, AlertCircle, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Sample candidates - in a real app, these would come from an API
const CANDIDATES = [
  { id: "candidate1", name: "Candidate 1" },
  { id: "candidate2", name: "Candidate 2" },
  { id: "candidate3", name: "Candidate 3" },
];

export default function VotingApp() {
  const {
    voteResults,
    totalVotes,
    submitVote,
    checkVoteStatus,
    mine,
    refreshVotes,
  } = useBlockchain();

  const [voterId, setVoterId] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [voteStatus, setVoteStatus] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Refresh votes every 5 seconds
    const interval = setInterval(() => {
      refreshVotes();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshVotes]);

  const handleCheckVoter = async () => {
    if (!voterId.trim()) {
      setError("Please enter your voter ID");
      return;
    }

    setError("");
    const status = await checkVoteStatus(voterId);
    setVoteStatus(status);
  };

  const handleSubmitVote = async () => {
    if (!voterId.trim()) {
      setError("Please enter your voter ID");
      return;
    }

    if (!selectedCandidate) {
      setError("Please select a candidate");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const success = await submitVote(voterId, selectedCandidate);

    if (success) {
      // Check vote status after submission
      const status = await checkVoteStatus(voterId);
      setVoteStatus(status);
    }

    setIsSubmitting(false);
  };

  const handleMine = async () => {
    setIsMining(true);
    await mine();
    // Refresh vote status after mining
    if (voterId) {
      const status = await checkVoteStatus(voterId);
      setVoteStatus(status);
    }
    setIsMining(false);
  };

  // Calculate percentages for the chart
  const getVotePercentage = (candidateId: string) => {
    const candidate = voteResults.find((r) => r.candidate === candidateId);
    if (!candidate || totalVotes === 0) return 0;
    return (candidate.votes / totalVotes) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Voting Application
        </h1>
        <Button onClick={refreshVotes}>Refresh Results</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
              <CardDescription>
                Enter your voter ID and select a candidate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voter-id">Voter ID</Label>
                <div className="flex space-x-2">
                  <Input
                    id="voter-id"
                    placeholder="Enter your voter ID"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                  />
                  <Button onClick={handleCheckVoter} variant="outline">
                    Check Status
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {voteStatus && (
                <Alert
                  variant={voteStatus.has_voted ? "default" : "destructive"}
                >
                  <div className="flex items-center gap-2">
                    {voteStatus.has_voted ? (
                      <>
                        <Check className="h-4 w-4" />
                        <AlertTitle>You have already voted</AlertTitle>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>You have not voted yet</AlertTitle>
                      </>
                    )}
                  </div>
                  <AlertDescription>
                    {voteStatus.has_voted
                      ? `You voted for ${voteStatus.voted_candidate} in block #${voteStatus.block_height}`
                      : "Please select a candidate and submit your vote"}
                  </AlertDescription>
                </Alert>
              )}

              {(!voteStatus || !voteStatus.has_voted) && (
                <div className="space-y-2">
                  <Label>Select a Candidate</Label>
                  <RadioGroup
                    value={selectedCandidate}
                    onValueChange={setSelectedCandidate}
                  >
                    {CANDIDATES.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center space-x-2 rounded-md border p-3"
                      >
                        <RadioGroupItem
                          value={candidate.id}
                          id={candidate.id}
                        />
                        <Label
                          htmlFor={candidate.id}
                          className="flex-1 cursor-pointer"
                        >
                          {candidate.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={handleSubmitVote}
                disabled={isSubmitting || (voteStatus && voteStatus.has_voted)}
              >
                {isSubmitting ? "Submitting..." : "Submit Vote"}
              </Button>
              <Button
                variant="outline"
                onClick={handleMine}
                disabled={isMining}
              >
                {isMining ? "Mining..." : "Mine Block to Confirm"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Current Results
              </CardTitle>
              <CardDescription>Total votes: {totalVotes}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {CANDIDATES.map((candidate) => {
                const candidateResult = voteResults.find(
                  (r) => r.candidate === candidate.id
                );
                const votes = candidateResult?.votes || 0;
                const percentage = getVotePercentage(candidate.id);

                return (
                  <div key={candidate.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>{candidate.name}</Label>
                      <span className="text-sm font-medium">
                        {votes} votes ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                Results are updated every 5 seconds. Mine a block to confirm
                pending votes.
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voting Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">How Voting Works</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>
                    Enter your voter ID to check if you&apos;ve already voted
                  </li>
                  <li>Select a candidate and submit your vote</li>
                  <li>Your vote is added to the pending transaction pool</li>
                  <li>
                    Click &quot;Mine Block&quot; to confirm your vote on the
                    blockchain
                  </li>
                  <li>Once confirmed, your vote cannot be changed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
