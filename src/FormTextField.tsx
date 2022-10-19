import React from "react";
import { FieldProps } from "formik";
import { isEqual } from "lodash-es";
import { TextField, StandardTextFieldProps } from "@material-ui/core";

export interface FormTextFieldProps
  extends StandardTextFieldProps,
    Omit<FieldProps, "meta"> {
  serverError?: string;
  withClearButton?: boolean;
  defaultValue?: unknown;
  isEditForm?: boolean;
}

export const FormTextField: React.FC<FormTextFieldProps> = ({
  field,
  form,
  serverError,
  withClearButton,
  defaultValue = "",
  isEditForm,
  ...textFieldProps
}) => {
  const { getFieldMeta, setFieldValue } = form;
  const meta = getFieldMeta(field.name);
  const error = meta.error || serverError;
  const hasError = meta.touched && !!error;
  const isEdited = !isEqual(field.value, meta.initialValue);
  const reset = () => setFieldValue(field.name, meta.initialValue);

  return (
    <TextField
      fullWidth
      {...field}
      {...textFieldProps}
      value={field.value ?? ""}
      error={hasError}
      helperText={hasError && error}
      onReset={isEditForm && isEdited ? reset : undefined}
    />
  );
};
