import * as React from "react";
import { Typography } from "@mui/material";
import { useLoginForm } from "../lib/hooks/useLoginForm";
import { BaseForm } from "../../../common/components/Form/index";
import { useLoginMutation, useRegistrationMutation } from "../model/mutations";
import { FormField } from "../../../common/components/Form/FormField";
import { useCallback, useMemo } from "react";
import { modeTypes } from "../model/stores";
import {
  FieldHandler,
  LoginFormFields,
  RegistrationFields,
} from "../lib/types";

const LoginForm = () => {
  const {
    form,
    isFormValid,
    nameChangeEvent,
    emailChangeEvent,
    isModalOpen,
    changeMode,
    userInfo,
    modeModal,
    logout,
    isUserLoggedIn,
    openModal,
    passwordChangeEvent,
    errors,
  } = useLoginForm();

  const { mutate: register } = useRegistrationMutation();
  const { mutate: login } = useLoginMutation();

  const loginFields = useMemo<FieldHandler<LoginFormFields>>(
    () => [
      { field: "email", handler: emailChangeEvent },
      { field: "password", handler: passwordChangeEvent },
    ],
    [emailChangeEvent, passwordChangeEvent]
  );

  const regFields = useMemo<FieldHandler<RegistrationFields>>(
    () => [...loginFields, { field: "name", handler: nameChangeEvent }],
    [loginFields, nameChangeEvent]
  );

  const fields = useMemo(
    () => (modeModal === modeTypes.login ? loginFields : regFields),
    [loginFields, modeModal, regFields]
  );

  const hanldeSubmit = useCallback(() => {
    isFormValid &&
      (modeModal === modeTypes.login ? login(form) : register(form));
  }, [form, isFormValid, register]);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout();
  };

  const handleModalClose = () => {
    openModal(false);
  };

  const handleChangeMode = () => {
    return modeModal === modeTypes.login
      ? changeMode(modeTypes.registration)
      : changeMode(modeTypes.login);
  };

  const extraInfo = (
    <Typography>
      For {modeModal} click <span onClick={handleChangeMode}>here</span>
    </Typography>
  );

  const handleChangeField =
    (event: (payload: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      event(e.target.value);
    };

  return (
    <BaseForm
      header={modeModal}
      open={isModalOpen}
      extraInfo={extraInfo}
      close={handleModalClose}
      onSubmit={hanldeSubmit}
    >
      {fields.map((item) => {
        return (
          <FormField
            key={item.field}
            value={form[`${item.field}`]}
            label={item.field}
            type={(item.field === "password" && "password") || ""}
            onChange={handleChangeField(item.handler)}
          />
        );
      })}
    </BaseForm>
  );
};

export default LoginForm;
