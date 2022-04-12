import { SPACE_CHAR } from "./constants";

export const isText = (node?: Node) => node?.nodeName === "#text";
export const isSpan = (node?: Node) => node?.nodeName === "SPAN";
export const isDiv = (node?: Node) => node?.nodeName === "DIV";

export const getClosestParentDiv = (node?: Node) => {
  let div = node;
  if (isText(div)) {
    div = div.parentNode;
  }
  if (isSpan(div)) {
    div = div.parentNode;
  }
  if (isDiv(div)) {
    return div;
  }
  return null;
};

const clearFromTagNames = (text: string, tagNames: string[]) => {
  const regExp = new RegExp(tagNames.join("|"), "gi");

  return text.replace(regExp, "");
};

export const normalizeTreeWalker = (parentNode: Node, tagNames: string[]) => {
  const selection = window.getSelection();
  const { focusNode, focusOffset } = selection;
  let newFocusNode = focusNode;
  let newFocusOffset = focusOffset;

  let currentTextNode: Node | null = null;

  const treeWalker = document.createTreeWalker(
    parentNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        if (node.parentElement.id) {
          return NodeFilter.FILTER_REJECT;
        }

        const currentSpan = isSpan(node.parentNode) ? node.parentNode : node;

        if (currentTextNode) {
          if (focusNode.isSameNode(currentSpan) || focusNode.isSameNode(node)) {
            newFocusNode = currentTextNode;
            newFocusOffset = currentTextNode.textContent.length + focusOffset;
          }

          currentTextNode.textContent += currentSpan.textContent;

          const rowNode = getClosestParentDiv(node);
          rowNode.removeChild(currentSpan);
        } else {
          currentTextNode = node;
        }

        const next = currentSpan.nextSibling;
        const isNextTag = !!next?.firstChild?.parentElement.id;
        const isLast = !next || isNextTag || isDiv(next);

        if (isLast) {
          const newTextContent = clearFromTagNames(
            currentTextNode.textContent,
            tagNames
          );

          if (newFocusNode?.isSameNode(currentTextNode)) {
            const currentLength = currentTextNode.textContent.length;
            const newLength = newTextContent.length;
            newFocusOffset = newFocusOffset - (currentLength - newLength);
          }

          currentTextNode.textContent = newTextContent;

          currentTextNode = null;
        }

        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  let currentNode = treeWalker.nextNode();
  while (currentNode) {
    currentNode = treeWalker.nextNode();
  }

  if (newFocusNode) {
    selection.setPosition(newFocusNode, newFocusOffset);
  }
};

export const isEmptyNode = (node: Node) => {
  if (node.firstChild && !node.firstChild?.textContent) {
    node.removeChild(node.firstChild);
  }
  return !node.firstChild;
};

export const initRow = (rowNode: Node, needFocus?: boolean) => {
  if (isEmptyNode(rowNode)) {
    const selection = window.getSelection();
    const span = document.createElement("span");
    const spaceChar = document.createTextNode(SPACE_CHAR);
    span.appendChild(spaceChar);
    rowNode.appendChild(span);
    if (needFocus) {
      selection.setPosition(spaceChar, 0);
    }
  }
};

export const initInputRows = (inputNode: Node) => {
  const selection = window.getSelection();
  const { focusNode } = selection;

  const focusDiv = getClosestParentDiv(focusNode);
  initRow(focusDiv);

  inputNode.childNodes.forEach((child) => {
    let rowNode = getClosestParentDiv(child);

    if (isDiv(rowNode)) {
      if (!inputNode.isSameNode(rowNode) && rowNode.previousSibling) {
        initRow(rowNode.previousSibling);
      }

      const needFocus = focusDiv?.isSameNode(rowNode);
      initRow(rowNode, needFocus);
    }
  });
};
