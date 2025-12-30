import { useUnit } from "effector-react";
import {
  $filterFields,
  endDateEventChange,
  startDateEventChange,
} from "../../model/store";

export const useFilterAnalytics = () => {
  const { startDateChange, endDateChange, filterFields } = useUnit({
    startDateChange: startDateEventChange,
    endDateChange: endDateEventChange,
    filterFields: $filterFields,
  });

  return {
    startDateChange,
    endDateChange,
    filterFields,
  };
};
