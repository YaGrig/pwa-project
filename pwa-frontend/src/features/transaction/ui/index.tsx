import { ChangeEvent } from "react";
import { BaseForm } from "../../../common/components/Form";
import { FormField } from "../../../common/components/Form/FormField";
import { useTransaction } from "../lib/hooks/useTransaction";
import { useCreateTransactionMutation } from "../model/mutations";

export const TransactionForm = () => {
  const { form, AmountChange, DescriptionChange, isModalOpen, openModal } =
    useTransaction();

  const { mutate: create } = useCreateTransactionMutation();
  const handleSubmit = () => {
    create(form);
  };

  const handleModalClose = () => {
    openModal(false);
  };

  const handleChangeField =
    (event: (payload: string) => string) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      event(e.target.value);
    };

  return (
    <BaseForm
      header="New Transaction"
      open={isModalOpen}
      close={handleModalClose}
      onSubmit={handleSubmit}
    >
      <FormField
        value={form.amount}
        label="amount"
        onChange={handleChangeField(AmountChange)}
      />
      <FormField
        value={form.description}
        label="description"
        onChange={handleChangeField(DescriptionChange)}
      />
    </BaseForm>
  );
};
