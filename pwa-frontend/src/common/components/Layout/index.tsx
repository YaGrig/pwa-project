import * as React from "react";
import LoginForm from "../../../features/authorization/ui";
import { TransactionForm } from "../../../features/transaction/ui";
import { Header } from "../Header";
import styles from "./style.module.scss";

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <LoginForm />
      <Header />
      <TransactionForm />
      {children}
    </div>
  );
};
