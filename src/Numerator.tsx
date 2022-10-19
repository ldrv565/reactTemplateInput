import React, { useEffect, useRef, useCallback, useState } from "react";
import { FieldProps } from "formik";
import { TagButton } from "./TagButton";
import { Grid, styled } from "@material-ui/core";
import { TextfieldWithTags } from "./TextfieldWithTags";
import { SPACE_CHAR, TAGS, TAGS_VALUES } from "./constants";
import {
  normalizeTreeWalker,
  initRow,
  initInputRows,
  parseInitialValue,
} from "./utils";

const GridStyled = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

export const Numerator: React.FC<FieldProps<string>> = ({
  field,
  form,
  ...props
}) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const { value = SPACE_CHAR, name } = field;
  const { setFieldValue } = form;

  const [initialValue] = useState(() => {
    if (value[value.length - 1] === SPACE_CHAR) {
      return value;
    }
    return value.concat(SPACE_CHAR);
  });

  const onChange = useCallback(
    (inputValue: string) => setFieldValue(name, inputValue.trim()),
    [name, setFieldValue]
  );

  useEffect(() => {
    inputRef.current?.append(...parseInitialValue(initialValue));
  }, [onChange, initialValue]);

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    initRow(e.target);
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection?.focusNode?.textContent === SPACE_CHAR) {
        selection.setPosition(selection.focusNode, 0);
        return;
      }
    }, 0);
  }, []);

  const onInput = useCallback(
    (e: React.ChangeEvent<HTMLDivElement>) => {
      normalizeTreeWalker(e.target, TAGS_VALUES);
      initInputRows(e.target);
      onChange(e.target.innerText);
    },
    [onChange]
  );

  return (
    <>
      <TextfieldWithTags
        field={field}
        form={form}
        inputRef={inputRef}
        onFocus={onFocus}
        onInput={onInput}
        {...props}
      />
      <GridStyled container spacing={1}>
        {TAGS.map((tag) => {
          const isActive = !!inputRef.current?.parentElement?.querySelector(
            `#${tag.value}`
          );
          return (
            <TagButton
              key={tag.value}
              isActive={isActive}
              label={tag.label}
              value={tag.value}
              inputRef={inputRef}
              onToggle={() => onChange(inputRef.current?.innerText || "")}
            />
          );
        })}
      </GridStyled>
    </>
  );
};
