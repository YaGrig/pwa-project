import {
  Modal,
  Typography,
  TextField,
  Button,
  FormControl,
  List,
  ListItemText,
} from "@mui/material";
import { useLoginForm } from "../lib/hooks/useLoginForm";
import { useMeQuery } from "../model/queries";
import { BaseForm } from "../../../common/components/Form/index";
import { useRegistrationMutation } from "../model/mutations";
import { FormField } from "../../../common/components/Form/FormField";
import { Layout } from "../../../common/components/Layout";
import { useCallback, useState } from "react";

const LoginForm = () => {
  const {
    form,
    isFormValid,
    nameChangeEvent,
    emailChangeEvent,
    isModalOpen,
    logout,
    openModal,
    passwordChangeEvent,
    errors,
  } = useLoginForm();

  const { mutate: register } = useRegistrationMutation();
  const [login, setLogin] = useState();

  const hanldeSubmit = useCallback(() => {
    // e.preventDefault();
    isFormValid && register(form);
  }, [login]);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout();
  };

  const handleModalClose = () => {
    openModal(false);
  };

  const handleChangeField =
    (event: (payload: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      event(e.target.value);
    };

  return (
    <BaseForm
      header={login ? "Login" : "Registration"}
      open={isModalOpen}
      close={handleModalClose}
      onSubmit={hanldeSubmit}
    >
      <FormField
        value={form.email}
        onChange={handleChangeField(emailChangeEvent)}
      />
      <FormField
        value={form.name}
        onChange={handleChangeField(nameChangeEvent)}
      />
      <FormField
        value={form.password}
        onChange={handleChangeField(passwordChangeEvent)}
      />
    </BaseForm>
  );
};

export default LoginForm;
