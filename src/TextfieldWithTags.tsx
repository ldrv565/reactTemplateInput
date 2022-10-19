import React from "react";
import { InputBaseComponentProps, styled } from "@material-ui/core";
import { FormTextField, FormTextFieldProps } from "./FormTextField";

const EditableBlockStyled = styled("div")(({ theme }) => ({
  width: "100%",
  whiteSpace: "pre-wrap",

  "& .tag": {
    userSelect: "none",
    userModify: "read-only",
    display: "inline-block",
    color: theme.palette.primary.main,
    margin: 0,
  },
}));

const CustomInputComponent: React.FC<
  Omit<InputBaseComponentProps, "align">
> = ({ inputRef, ...rest }) => (
  <EditableBlockStyled
    contentEditable
    role="textbox"
    ref={inputRef}
    onPaste={(e) => e.preventDefault()}
    {...rest}
  />
);

export const TextfieldWithTags: React.FC<FormTextFieldProps> = (props) => (
  <FormTextField
    {...props}
    multiline
    onKeyDown={(e) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "z") {
          e.preventDefault();
        }
      }
    }}
    InputProps={{
      inputComponent: CustomInputComponent,
    }}
    InputLabelProps={{
      shrink: props.field.value ? true : undefined,
    }}
  />
);
