import { SPACE_CHAR, TAGS_VALUES } from "./constants";

export const isText = (node?: Node | null) => node?.nodeName === "#text";
export const isSpan = (node?: Node | null) => node?.nodeName === "SPAN";
export const isDiv = (node?: Node | null) => node?.nodeName === "DIV";

export const isEmptyNode = (node: Node) => {
  if (node.firstChild && !node.firstChild?.textContent) {
    node.removeChild(node.firstChild);
  }
  return !node.firstChild;
};

export const getClosestParentDiv = (node?: Node | null) => {
  let div = node;
  if (isText(div) && div?.parentNode) {
    div = div.parentNode;
  }
  if (isSpan(div) && div?.parentNode) {
    div = div.parentNode;
  }
  if (isDiv(div)) {
    return div;
  }
  return null;
};

export const getClosestChildText = (node: Node | null) => {
  let text = node;
  if (isDiv(text) && text?.firstChild) {
    text = text.firstChild;
  }
  if (isSpan(text) && text?.firstChild) {
    text = text.firstChild;
  }
  if (isText(text)) {
    return text;
  }
  return null;
};

export const clearFromTagNames = (text: string, tagNames: string[]) => {
  const regExp = new RegExp(tagNames.join("|"), "gi");
  return text.replace(regExp, "");
};

// удаляем тэги введеные руками, объединяем куски текста в единые спаны
export const normalizeTreeWalker = (parentNode: Node, tagNames: string[]) => {
  const selection = window.getSelection();

  const { focusNode, focusOffset } = selection || {};
  let newFocusNode = focusNode;
  let newFocusOffset = focusOffset;

  let currentTextNode: Node | null = null;

  const treeWalker = document.createTreeWalker(
    parentNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        if (node.parentElement?.id) {
          return NodeFilter.FILTER_REJECT;
        }

        const currentSpan = isSpan(node.parentNode) ? node.parentNode : node;

        if (!currentSpan) {
          return NodeFilter.FILTER_SKIP;
        }

        if (currentTextNode) {
          if (
            focusNode?.isSameNode(currentSpan) ||
            focusNode?.isSameNode(node)
          ) {
            newFocusNode = currentTextNode;
            newFocusOffset =
              (currentTextNode.textContent?.length ?? 0) + (focusOffset ?? 0);
          }

          currentTextNode.textContent =
            (currentTextNode.textContent ?? "") + currentSpan.textContent;

          const rowNode = getClosestParentDiv(node);
          rowNode?.removeChild(currentSpan);
        } else {
          currentTextNode = node;
        }

        const next = currentSpan.nextSibling;

        const isNextTag = !!next?.firstChild?.parentElement?.id;
        const isLast = !next || isNextTag || isDiv(next);

        if (isLast && currentTextNode.textContent) {
          const newTextContent = clearFromTagNames(
            currentTextNode.textContent,
            tagNames
          );

          if (newFocusNode?.isSameNode(currentTextNode)) {
            const currentLength = currentTextNode.textContent.length;
            const newLength = newTextContent.length;
            newFocusOffset =
              (newFocusOffset ?? 0) - (currentLength - newLength);
          }

          currentTextNode.textContent = newTextContent;

          currentTextNode = null;
        }

        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  let currentNode = treeWalker.nextNode();
  while (currentNode) {
    currentNode = treeWalker.nextNode();
  }

  if (newFocusNode) {
    selection?.setPosition(newFocusNode, newFocusOffset);
  }
};

export const initRow = (rowNode: Node, needFocus?: boolean) => {
  if (isEmptyNode(rowNode)) {
    const span = document.createElement("span");
    const spaceChar = document.createTextNode(SPACE_CHAR);
    span.appendChild(spaceChar);
    rowNode.appendChild(span);
    if (needFocus) {
      const selection = window.getSelection();
      selection?.setPosition(spaceChar, 0);
    }
  }
};

export const initInputRows = (inputNode: Node) => {
  const selection = window.getSelection();
  const { focusNode } = selection ?? {};
  const focusDiv = getClosestParentDiv(focusNode);

  if (inputNode.childNodes.length) {
    inputNode.childNodes.forEach((child) => {
      const rowNode = getClosestParentDiv(child);

      if (rowNode && isDiv(rowNode)) {
        const needFocus = focusDiv?.isSameNode(rowNode);
        initRow(rowNode, needFocus);
      }
    });
  } else {
    initRow(inputNode, true);
  }
};

export const getTagNode = (name: string) => {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.setAttribute("id", name);
  tag.appendChild(document.createTextNode(`{${name}}`));

  return tag;
};

export const parseInitialValue = (initialValue: string) =>
  initialValue.split("\n").map((rowText) => {
    const div = document.createElement("div");

    let endText = rowText;
    const regExp = new RegExp(TAGS_VALUES.join("|"), "i");
    let match = rowText.match(regExp);

    if (match) {
      while (match) {
        const startText = endText.slice(0, match.index);

        if (startText.length) {
          const start = document.createElement("span");
          start.append(startText);
          div.appendChild(start);
        }
        const tagNode = getTagNode(match[0].replace(/\{|\}/g, ""));

        div.appendChild(tagNode);

        if (!tagNode.nextSibling) {
          const end = document.createElement("span");
          end.append(SPACE_CHAR);
          div.appendChild(end);
        }

        const index = match.index ?? 0;

        endText = endText.slice(index + match[0].length);
        match = endText.match(regExp);
      }
      return div;
    }

    const span = document.createElement("span");
    span.append(rowText);
    div.appendChild(span);
    return div;
  });
