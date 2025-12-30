export interface LoginFormFields {
  email: string;
  password: string;
}

export interface RegistrationFields extends LoginFormFields {
  name: string;
}

export type FieldHandler<T> = Array<{
  field: keyof T;
  handler: (payload: string) => string;
}>;
