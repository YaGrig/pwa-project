import { Income } from "../lib/types/income.type";

export const IncomeApi = {
  async createIncome(data: Income) {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/income/new`, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  async getAllIncomes() {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/income/all`, {
      method: "GET",
      credentials: "include",
    });

    return res.json();
  },

  async deleteIncome(id: string) {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/income/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return res.json();
  },
};
