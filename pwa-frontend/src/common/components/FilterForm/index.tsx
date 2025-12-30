import { Box } from "@mui/material";
import { Children, FC, isValidElement, ReactElement } from "react";
import { FilterField } from "./FilterField";
import styles from "./index.module.scss";

interface FilterProps {
  children: ReactElement | ReactElement[];
}

export const FilterForm: FC<FilterProps> = ({ children }) => {
  const validatedChildren = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === FilterField) {
      return child;
    }
    console.warn("Form component only accepts FormField as children");
    return null;
  });
  return <Box className={styles.box}>{validatedChildren}</Box>;
};
