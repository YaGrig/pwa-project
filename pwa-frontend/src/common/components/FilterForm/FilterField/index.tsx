// type FieldTypes = "text" | "date";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChangeEvent, FC } from "react";
import { FormField } from "../../Form/FormField";
import {
  PickerChangeHandlerContext,
  DateValidationError,
} from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import e from "express";

export enum FieldTypes {
  TEXT = "TEXT",
  DATE = "DATE",
}

export interface FilterFiledInterface {
  type: FieldTypes;
  label?: string;
  onChange: (payload: string | PickerValue) => void;
  key?: string;
}

export const FilterField: FC<FilterFiledInterface> = ({
  type,
  onChange,
  label,
  key,
}) => {
  const handleChangeText = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    onChange(e.target.value);
  };
  const handleChangeDate = (
    value: PickerValue,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    onChange(value);
  };

  return (
    <>
      <label key={key}>
        {label}
        {type === FieldTypes.DATE ? (
          <DatePicker onChange={handleChangeDate} />
        ) : (
          <FormField onChange={handleChangeText} />
        )}
      </label>
    </>
  );
};
