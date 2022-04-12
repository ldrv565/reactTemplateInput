import React from "react";
import {
  InputBaseComponentProps,
  styled,
  TextField,
  TextFieldProps
} from "@material-ui/core";

const EditableBlockStyled = styled("div")({
  width: "100%",
  whiteSpace: "pre-wrap",

  "& .tag": {
    userSelect: "none",
    userModify: "read-only",
    display: "inline-block",
    color: "blue",
    margin: 0
  }
});

const CustomInputComponent: React.FC<Omit<
  InputBaseComponentProps,
  "align"
>> = ({ inputRef, ...rest }) => (
  <EditableBlockStyled
    contentEditable
    role="textbox"
    ref={inputRef}
    onPaste={(e) => e.preventDefault()}
    {...rest}
  />
);

const TextFieldStyled = styled(TextField)({
  width: 173
});

export const TextfieldWithTags: React.FC<TextFieldProps> = (props) => {
  return (
    <TextFieldStyled
      {...props}
      multiline
      InputProps={{
        inputComponent: CustomInputComponent
      }}
      InputLabelProps={{
        shrink: props.value ? true : undefined
      }}
    />
  );
};
