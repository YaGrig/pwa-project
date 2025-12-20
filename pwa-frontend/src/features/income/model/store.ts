import { createEvent, createStore } from "effector";
import { Income } from "../lib/types/income.type";
import {
  sortOptions,
  TransactionSortOptions,
} from "../../transaction/lib/types/transaction.type";

// tanstack events
export const incomeCreatedSuccess = createEvent<Income>();
export const incomeCreatedFailure = createEvent<Error>();
export const allIncomeReq = createEvent<Income[]>();
export const formAmountChange = createEvent<string>();
export const pageChangeEvent = createEvent<number>();
export const formDescriptionChange = createEvent<string>();
export const sortByChangeEvent = createEvent<sortOptions>();
export const limitChangeEvent = createEvent<number>();
export const modalOpenEvent = createEvent<boolean>();

export const $sort = createStore<TransactionSortOptions>({
  sortBy: "created_at",
  page: 0,
  limit: 5,
});

export const $incomes = createStore<Income[]>([]);
export const $isModalOpen = createStore<boolean>(false);

export const $incomeForm = createStore<Income>({
  amount: "",
  description: "",
});

$isModalOpen.on(modalOpenEvent, (_, payload) => payload);

$incomeForm
  .on(formAmountChange, (state, amount) => {
    return {
      ...state,
      amount,
    };
  })
  .on(formDescriptionChange, (state, description) => ({
    ...state,
    description,
  }));

$incomes
  .on(incomeCreatedSuccess, (state, payload: Income) => {
    return [...state, payload];
  })
  .on(allIncomeReq, (_, payload) => {
    return payload;
  });

$sort
  .on(pageChangeEvent, (state, payload) => ({
    ...state,
    page: payload,
  }))
  .on(limitChangeEvent, (state, payload) => ({
    ...state,
    limit: payload,
  }))
  .on(sortByChangeEvent, (state, payload) => ({
    ...state,
    sortBy: payload,
  }));
