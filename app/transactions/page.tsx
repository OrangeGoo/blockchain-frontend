import TransactionForm from "@/components/TransactionForm";
import PendingTransactions from "@/components/PendingTransactions";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage blockchain transactions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TransactionForm />
        <PendingTransactions />
      </div>
    </div>
  );
}
