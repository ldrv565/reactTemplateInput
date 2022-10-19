import clsx from "clsx";
import React, { useCallback } from "react";
import { SPACE_CHAR } from "../constants";
import { getTagNode, initRow } from "../utils";
import { Chip, Grid, styled } from "@material-ui/core";
import { replaceChildWith, selectText, sliceText } from "./utils";

const ChipStyled = styled(Chip)(({ theme }) => ({
  background: theme.palette.primary.light,
  color: theme.palette.primary.dark,

  "&.active": {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },

  "&:hover": {
    background: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
}));
interface Props {
  isActive: boolean;
  label: string;
  value: string;
  inputRef: React.MutableRefObject<HTMLDivElement | null>;
  onToggle: () => void;
}

export const TagButton: React.FC<Props> = ({
  isActive,
  label,
  value,
  inputRef,
  onToggle,
}) => {
  const insertTag = useCallback(
    (tagName: string) => {
      if (!inputRef.current) {
        return null;
      }
      initRow(inputRef.current, true);
      inputRef.current.focus();

      const selectedNodes = selectText();

      if (!selectedNodes) {
        return null;
      }

      const { text, node, parent, focusOffset } = selectedNodes;

      if (!(text && node && parent)) {
        return null;
      }

      const { start, end } = sliceText(text.textContent || "", focusOffset);
      replaceChildWith(parent, node, [start, getTagNode(tagName), end]);

      const selection = window.getSelection();
      selection?.setPosition(end, 0);
      inputRef.current.focus();
    },
    [inputRef]
  );

  const removeTag = useCallback(
    (tagName: string) => {
      if (!inputRef.current) {
        return null;
      }
      inputRef.current.focus();

      const tagElement = inputRef.current.parentElement?.querySelector(
        `#${tagName}`
      );

      if (!tagElement) {
        return null;
      }

      let prev = tagElement.previousSibling;
      const next = tagElement.nextSibling;

      if (prev?.textContent === SPACE_CHAR) {
        prev.remove();
      }

      prev = tagElement.previousSibling;

      if (!next && prev) {
        const selection = window.getSelection();
        selection?.setPosition(
          prev.firstChild,
          prev.firstChild?.textContent?.length
        );
      }
      tagElement.remove();

      initRow(inputRef.current, true);
      inputRef.current.focus();
    },
    [inputRef]
  );

  return (
    <Grid item spacing={1}>
      <ChipStyled
        className={clsx({ active: isActive })}
        size="medium"
        label={label}
        onClick={() => {
          if (isActive) {
            removeTag(value);
          } else {
            insertTag(value);
          }
          onToggle();
        }}
      />
    </Grid>
  );
};
