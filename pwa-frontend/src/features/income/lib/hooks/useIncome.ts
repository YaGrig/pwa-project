import { useUnit } from "effector-react";
import {
  formAmountChange,
  formDescriptionChange,
  incomeCreatedFailure,
  incomeCreatedSuccess,
  $incomeForm,
  $incomes,
  allIncomeReq,
  limitChangeEvent,
  sortByChangeEvent,
  pageChangeEvent,
  $isModalOpen,
  modalOpenEvent,
  $sort,
} from "../../model/store";

export const useIncome = () => {
  const {
    createdEventSuccess,
    createdEventFailure,
    pageChange,
    isModalOpen,
    modalOpen,
    limitChange,
    sortByChange,
    incomes,
    AmountChange,
    DescriptionChange,
    getAllIncomes,
    sort,
    form,
  } = useUnit({
    createdEventSuccess: incomeCreatedSuccess,
    createdEventFailure: incomeCreatedFailure,
    pageChange: pageChangeEvent,
    getAllIncomes: allIncomeReq,
    incomes: $incomes,
    limitChange: limitChangeEvent,
    sortByChange: sortByChangeEvent,
    isModalOpen: $isModalOpen,
    modalOpen: modalOpenEvent,
    AmountChange: formAmountChange,
    DescriptionChange: formDescriptionChange,
    form: $incomeForm,
    sort: $sort,
  });

  return {
    createdEventSuccess,
    createdEventFailure,
    AmountChange,
    incomes,
    getAllIncomes,
    DescriptionChange,
    pageChange,
    isModalOpen,
    modalOpen,
    limitChange,
    sortByChange,
    form,
    sort,
  };
};
