import { useEffect } from "react";
import EnhancedTable from "../../../common/components/Table";
import { useTransaction } from "../lib/hooks/useTransaction";
import { Transaction, sortOptions } from "../lib/types/transaction.type";
import { useGetAllTransactionsQuery } from "../model/queries";

export const TransactionTable = () => {
  const {
    sortOptions,
    transactions,
    onLimitChange,
    openModal,
    onPageChange,
    onSortByChange,
    countTransactionsChange,
    getAllTransactions,
    count,
  } = useTransaction();
  const { data } = useGetAllTransactionsQuery();

  useEffect(() => {
    getAllTransactions(data?.rows);
    countTransactionsChange(data?.count);
  }, [countTransactionsChange, data, getAllTransactions]);

  // useEffect(() => {
  //   console.log(transactions, "wow");
  // }, [transactions]);

  return (
    <EnhancedTable<Transaction, sortOptions>
      header="transactions"
      page={sortOptions.page}
      limit={sortOptions.limit}
      sortBy={sortOptions.sortBy}
      count={count}
      onLimitChange={onLimitChange}
      onPageChange={onPageChange}
      onSortByChange={onSortByChange}
      onAdd={() => {
        openModal(true);
      }}
      rows={transactions}
    />
  );
};
