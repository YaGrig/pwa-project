import EnhancedTable from "../../common/components/Table";
import { GeneralAnalytics } from "../analytics/ui";
import { IncomeForm } from "../income/ui";
import { IncomeTable } from "../income/ui/table";
import { TransactionTable } from "../transaction/ui/table";

interface Row extends Record<string, string> {
  description: string;
  amount: string;
  id: string;
  created_at: string;
}

export const Home = () => {
  // const rows: Row[] = [
  //   {
  //     id: "1",
  //     description: "Покупка продуктов",
  //     amount: "1500.00",
  //     created_at: "2024-01-15",
  //   },
  //   {
  //     id: "2",
  //     description: "Оплата интернета",
  //     amount: "600.00",
  //     created_at: "2024-01-14",
  //   },
  //   {
  //     id: "3",
  //     description: "Оплата интернета",
  //     amount: "2600.00",
  //     created_at: "2024-01-14",
  //   },
  //   {
  //     id: "4",
  //     description: "Оплата интернета",
  //     amount: "6230525000.00",
  //     created_at: "2024-01-14",
  //   },
  //   {
  //     id: "5",
  //     description: "Оплата интернета",
  //     amount: "6203400.00",
  //     created_at: "2024-01-14",
  //   },
  //   {
  //     id: "6",
  //     description: "Оплата интернета",
  //     amount: "6234000.00",
  //     created_at: "2024-01-14",
  //   },
  // ];
  return (
    <>
      <TransactionTable />
      <IncomeTable />
      <IncomeForm />
      <GeneralAnalytics />
    </>
  );
};
