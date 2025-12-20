import { FormControl, Modal, Typography, Button } from "@mui/material";
import { FormField } from "./FormField";
import styles from "./index.module.scss";
import { Children, FC, isValidElement, ReactElement } from "react";

interface FormProps {
  header: string;
  children: ReactElement | ReactElement[];
  onSubmit: () => void;
  submitButtonText?: string;
  open?: boolean;
  close?: (value: Event) => void;
}

export const BaseForm: FC<FormProps> = ({ children, ...props }) => {
  const {
    onSubmit,
    submitButtonText = "SUBMIT",
    open = false,
    header,
    close,
  } = props;
  const validatedChildren = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === FormField) {
      return child;
    }
    console.warn("Form component only accepts FormField as children");
    return null;
  });
  return (
    <Modal open={open} onClose={close}>
      <FormControl className={styles.form}>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          className={styles.header}
        >
          {header}
        </Typography>
        {validatedChildren}
        <Button onClick={onSubmit}>{submitButtonText}</Button>
      </FormControl>
    </Modal>
  );
};
