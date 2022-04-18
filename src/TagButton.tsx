import { Button } from "@material-ui/core";
import { SPACE_CHAR } from "./constants";
import {
  getClosestChildText,
  initRow,
  isDiv,
  replaceChildWith,
  sliceText
} from "./utils";

export const getTagNode = (name: string) => {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.setAttribute("id", name);
  tag.appendChild(document.createTextNode(`{${name}}`));

  return tag;
};

export const selectText = () => {
  const selection = window.getSelection();
  const { focusNode, focusOffset } = selection;
  let text = getClosestChildText(focusNode);
  const parentElement = text.parentElement;
  if (parentElement.id) {
    text = document.createTextNode(SPACE_CHAR);
    parentElement.parentNode.insertBefore(text, parentElement);
  }

  let node: Node = text.parentNode;

  // текст должен быть обернут в span, чтобы избежать неконтролируемое поведение contentEditable
  if (isDiv(node)) {
    const wrappedText = document.createElement("span");
    node.replaceChild(wrappedText, text);
    wrappedText.appendChild(text);
    selection.setPosition(text, focusOffset);
    node = text.parentNode;
  }

  const parent = node.parentNode;

  return { text, node, parent, focusOffset };
};

interface Props {
  value: string;
  inputRef: React.MutableRefObject<HTMLDivElement>;
  onToggle: () => void;
}

export const TagButton: React.FC<Props> = ({ value, inputRef, onToggle }) => {
  const insertTag = (tagName: string) => {
    initRow(inputRef.current, true);
    inputRef.current.focus();

    const { text, node, parent, focusOffset } = selectText();
    const { start, end } = sliceText(text.textContent, focusOffset);
    replaceChildWith(parent, node, [start, getTagNode(tagName), end]);

    const selection = window.getSelection();
    selection.setPosition(end, 0);
    inputRef.current.focus();
  };

  const removeTag = (tagName: string) => {
    inputRef.current.focus();

    const tagElement = inputRef.current.parentElement.querySelector(
      `#${tagName}`
    );

    let prev = tagElement.previousSibling;
    let next = tagElement.nextSibling;
    if (prev?.textContent === SPACE_CHAR) {
      prev.remove();
    }
    if (next?.textContent === SPACE_CHAR) {
      next.remove();
    }

    prev = tagElement.previousSibling;
    next = tagElement.nextSibling;

    if (!next && prev) {
      const selection = window.getSelection();
      selection.setPosition(
        prev.firstChild,
        prev.firstChild.textContent.length
      );
    }
    tagElement.remove();

    initRow(inputRef.current, true);
    inputRef.current.focus();
  };

  const onToggleTag = (tagName: string) => {
    const tagElement = inputRef.current.parentElement.querySelector(
      `#${tagName}`
    );

    if (!tagElement) {
      insertTag(tagName);
    } else {
      removeTag(tagName);
    }

    onToggle();
  };

  return <Button onClick={() => onToggleTag(value)}>{`{${value}}`}</Button>;
};
