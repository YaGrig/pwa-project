import { format } from "date-fns";
import { createEvent, createStore } from "effector";
import { FilterFields } from "../lib/hooks/types/filter";

export const analyticsRequestSuccess = createEvent();
export const analyticsRequestError = createEvent();
export const startDateEventChange = createEvent<Date | null | string>();
export const endDateEventChange = createEvent<Date | null | string>();

export const $generalAnalytics = createStore({});
export const $filterFields = createStore<FilterFields>({
  startDate: "",
  endDate: "",
});

$filterFields
  .on(startDateEventChange, (state, payload) => ({
    ...state,
    startDate: payload instanceof Date ? format(payload, "yyyy-MM-dd") : "",
  }))
  .on(endDateEventChange, (state, payload) => ({
    ...state,
    endDate: payload instanceof Date ? format(payload, "yyyy-MM-dd") : "",
  }));
