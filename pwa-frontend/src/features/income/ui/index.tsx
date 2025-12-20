import { BaseForm } from "../../../common/components/Form";
import { FormField } from "../../../common/components/Form/FormField";
import { useIncome } from "../lib/hooks/useIncome";
import { useCreateIncomeMutation } from "../model/mutations";

export const IncomeForm = () => {
  const { form, AmountChange, DescriptionChange, isModalOpen, modalOpen } =
    useIncome();

  const { mutate: create } = useCreateIncomeMutation();
  const handleSubmit = () => {
    create(form);
  };

  const handleChangeField =
    (event: (payload: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      event(e.target.value);
    };

  return (
    <BaseForm
      header="New Income"
      open={isModalOpen}
      close={() => modalOpen(false)}
      onSubmit={handleSubmit}
    >
      <FormField
        value={form.amount}
        onChange={handleChangeField(AmountChange)}
      />
      <FormField
        value={form.description}
        onChange={handleChangeField(DescriptionChange)}
      />
    </BaseForm>
  );
};
