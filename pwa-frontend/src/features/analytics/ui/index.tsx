import { useGetAnalyticsMonth } from "../model/query";
import { FilterForm } from "../../../common/components/FilterForm";
import {
  FilterField,
  FieldTypes,
  FilterFiledInterface,
} from "../../../common/components/FilterForm/FilterField";
import { useCallback, useMemo } from "react";
import { useFilterAnalytics } from "../lib/hooks";
import { LineGraph } from "../lib/components/LineChart";

export const GeneralAnalytics = () => {
  const {
    data: dataMonth,
    isError: errorMonth,
    isLoading: loadingMonth,
  } = useGetAnalyticsMonth();
  const { startDateChange, endDateChange } = useFilterAnalytics();

  const createData = useCallback(() => {
    if (dataMonth?.data) {
      const incomes = dataMonth.data.map((item) => +item.total_incomes);
      const expenses = dataMonth.data.map((item) => +item.total_expenses);
      console.log(incomes, expenses, [...incomes, ...expenses], "aefawefewf");
      return [incomes, expenses];
    }
    return [];
  }, [dataMonth]);

  const xAxis = useMemo(
    () => dataMonth?.data.map((item) => item.date) || [],
    [dataMonth?.data]
  );

  const fieldsFilter: FilterFiledInterface[] = useMemo(() => {
    return [
      {
        type: FieldTypes.DATE,
        label: "startDate",
        onChange: startDateChange,
      },
      {
        type: FieldTypes.DATE,
        label: "endDate",
        onChange: endDateChange,
      },
      {
        type: FieldTypes.TEXT,
        label: "TEXTFIELDTEST",
        onChange: () => {},
      },
    ];
  }, [endDateChange, startDateChange]);

  return (
    <>
      <FilterForm>
        {fieldsFilter.map((item) => {
          return (
            <FilterField
              type={item.type}
              key={item.label}
              onChange={item.onChange}
              label={item.label}
            />
          );
        })}
      </FilterForm>
      <LineGraph xAxisPoints={xAxis} dataSeries={createData()} />
    </>
  );
};
