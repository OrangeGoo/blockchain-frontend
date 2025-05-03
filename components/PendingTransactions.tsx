"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBlockchain } from "@/context/BlockchainContext";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingTransactions() {
  const { pendingTransactions, refreshChain } = useBlockchain();

  useEffect(() => {
    // Fetch pending transactions on mount
    refreshChain();
  }, [refreshChain]);

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
        <Button variant="outline" size="icon" onClick={refreshChain}>
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {pendingTransactions.length > 0 ? (
          <div className="space-y-4">
            {pendingTransactions.map((tx, index) => (
              <div key={index} className="rounded-md border p-4">
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
