import EnhancedTable from "../../../common/components/Table";
import { sortOptions } from "../../transaction/lib/types/transaction.type";
import { useIncome } from "../lib/hooks/useIncome";
import { Income } from "../lib/types/income.type";
import { useGetAllTransactionsQuery } from "../model/queries";

export const IncomeTable = () => {
  const { sort, limitChange, pageChange, sortByChange, modalOpen, incomes } =
    useIncome();

  return (
    <></>
    // <EnhancedTable<Income, sortOptions>
    //   header="Income"
    //   page={sort.page}
    //   limit={sort.limit}
    //   sortBy={sort.sortBy}
    //   onLimitChange={limitChange}
    //   onPageChange={pageChange}
    //   onSortByChange={sortByChange}
    //   onAdd={() => {
    //     modalOpen(true);
    //   }}
    //   rows={incomes}
    // />
  );
};
