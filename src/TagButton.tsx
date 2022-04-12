import { Button } from "@material-ui/core";
import { SPACE_CHAR } from "./constants";
import { initRow, isDiv, isText } from "./utils";

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

  // добираемся до текста input>div>span>text
  if (!isText(focusNode)) {
    selection.setPosition(focusNode.firstChild, focusOffset);
  }
  if (!isText(focusNode)) {
    selection.setPosition(focusNode.firstChild, focusOffset);
  }

  const text = focusNode;
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

// делим текст и тэг на отдельные узлы в начале и конце должны быть спаны и в них должен быть хотя бы пробел
// иначе браузер начнет создавать деревья разной глубины и будет глючить курсор
export const sliceText = (text: string, offset: number) => {
  const start = document.createElement("span");
  const startText = text.slice(0, offset) || SPACE_CHAR;
  start.appendChild(document.createTextNode(startText));

  const end = document.createElement("span");
  const endText = text.slice(offset) || SPACE_CHAR;
  end.appendChild(document.createTextNode(endText));

  return { start, end };
};

export const replaceChildWith = (parent: Node, child: Node, nodes: Node[]) => {
  let prevNode = child;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const currentNode = nodes[i];
    parent.insertBefore(currentNode, prevNode);
    prevNode = currentNode;
  }

  parent.removeChild(child);
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
      selection.setPosition(prev.firstChild, prev.textContent.length);
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
