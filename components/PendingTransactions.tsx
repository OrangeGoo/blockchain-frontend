"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBlockchain } from "@/context/BlockchainContext";
import { Clock, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PendingTransactions() {
  const { pendingTransactions } = useBlockchain();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Transactions
          </CardTitle>
          <CardDescription>
            Transactions waiting to be mined into a block
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {pendingTransactions.length > 0 ? (
          <div className="space-y-4">
            {pendingTransactions.map((tx, index) => (
              <div key={index} className="rounded-md border p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Transaction #{index + 1}</div>
                  {tx.isVote && (
                    <Badge className="bg-blue-500">
                      <Vote className="h-3 w-3 mr-1" />
                      Vote
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">From:</span>
                    <div className="mt-1">
                      <code className="rounded bg-muted px-2 py-1 text-xs break-all">
                        {tx.sender}
                      </code>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">To:</span>
                    <div className="mt-1">
                      <code className="rounded bg-muted px-2 py-1 text-xs break-all">
                        {tx.recipient}
                      </code>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Amount:</span> {tx.amount}
                  {tx.isVote && " (vote)"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No pending transactions</p>
            <p className="text-sm mt-2">
              Transactions will appear here before they are mined into a block
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
