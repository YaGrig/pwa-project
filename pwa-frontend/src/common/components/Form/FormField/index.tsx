import { TextFieldProps, TextField } from "@mui/material";
import styles from "./index.module.scss";

export const FormField: React.FC<TextFieldProps> = ({
  fullWidth = true,
  margin = "normal",
  label,
  variant = "standard",
  ...rest
}) => {
  return (
    <TextField
      InputProps={{
        disableUnderline: true,
      }}
      label={label}
      className={styles.field}
      fullWidth={fullWidth}
      margin={margin}
      variant={variant}
      {...rest}
    />
  );
};
