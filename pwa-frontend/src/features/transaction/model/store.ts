import { createEvent, createStore } from "effector";
import {
  sortOptions,
  Transaction,
  TransactionResponse,
  TransactionSortOptions,
} from "../lib/types/transaction.type";

// tanstack events
export const transactionCreatedSuccess = createEvent<TransactionResponse>();
export const transactionCreatedFailure = createEvent<Error>();
export const allTransactionReq = createEvent<Transaction[]>();
export const formAmountChange = createEvent<string>();
export const pageChange = createEvent<number>();
export const limitChange = createEvent<number>();
export const formDescriptionChange = createEvent<string>();
export const sortByChange = createEvent<sortOptions>();
export const formPhotoUrlChange = createEvent<string | undefined>();
export const modalOpenEvent = createEvent<boolean>();
export const countTransactionsChangeEvent = createEvent<number>();

export const $isModalOpen = createStore<boolean>(false);
export const $countTransactions = createStore<number>(0);

export const $page = createStore<number>(0);

export const $sort = createStore<TransactionSortOptions>({
  sortBy: "created_at",
  page: 0,
  limit: 5,
});

export const $transactions = createStore<Transaction[]>([]);

export const $transactionForm = createStore<Transaction>({
  amount: 0,
  description: "",
  photo_url: "",
});

$countTransactions.on(countTransactionsChangeEvent, (_, payload) => payload);

$isModalOpen.on(modalOpenEvent, (_, payload) => payload);
$transactionForm
  .on(formAmountChange, (state, amount) => {
    return {
      ...state,
      amount: parseInt(amount),
    };
  })
  .on(formDescriptionChange, (state, description) => ({
    ...state,
    description,
  }))
  .on(formPhotoUrlChange, (state, photo_url) => ({
    ...state,
    photo_url: photo_url,
  }));

$transactions
  .on(transactionCreatedSuccess, (state, payload: Transaction) => {
    return [...state, payload];
  })
  .on(allTransactionReq, (_, payload) => {
    return payload;
  });

$sort
  .on(pageChange, (state, payload) => ({
    ...state,
    page: payload,
  }))
  .on(limitChange, (state, payload) => ({
    ...state,
    limit: payload,
  }))
  .on(sortByChange, (state, payload) => ({
    ...state,
    sortBy: payload,
  }));
