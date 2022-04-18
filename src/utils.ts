import { SPACE_CHAR } from "./constants";

export const isText = (node?: Node) => node?.nodeName === "#text";
export const isSpan = (node?: Node) => node?.nodeName === "SPAN";
export const isDiv = (node?: Node) => node?.nodeName === "DIV";

export const isEmptyNode = (node: Node) => {
  if (node.firstChild && !node.firstChild?.textContent) {
    node.removeChild(node.firstChild);
  }
  return !node.firstChild;
};

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

export const getClosestChildText = (node?: Node) => {
  let text = node;
  if (isDiv(text)) {
    text = text.firstChild;
  }
  if (isSpan(text)) {
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

// делим текст и тэг на отдельные узлы в начале и конце должны быть спаны и в них должен быть хотя бы пробел
// иначе браузер начнет создавать деревья разной глубины и будет глючить курсор
export const sliceText = (text: string, offset: number) => {
  const start = document.createElement("span");
  const startText = text.slice(0, offset) || SPACE_CHAR;
  start.append(startText);

  const end = document.createElement("span");
  const endText = text.slice(offset) || SPACE_CHAR;
  end.append(endText);

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

// удаляем тэги введеные руками, объединяем куски текста в единые спаны
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

export const initRow = (rowNode: Node, needFocus?: boolean) => {
  if (isEmptyNode(rowNode)) {
    const span = document.createElement("span");
    const spaceChar = document.createTextNode(SPACE_CHAR);
    span.appendChild(spaceChar);
    console.log(rowNode);
    rowNode.appendChild(span);
    if (needFocus) {
      const selection = window.getSelection();
      selection.setPosition(spaceChar, 0);
    }
  }
};

export const initInputRows = (inputNode: Node) => {
  const selection = window.getSelection();
  const { focusNode } = selection;
  const focusDiv = getClosestParentDiv(focusNode);

  if (inputNode.childNodes.length) {
    inputNode.childNodes.forEach((child) => {
      let rowNode = getClosestParentDiv(child);

      if (isDiv(rowNode)) {
        const needFocus = focusDiv?.isSameNode(rowNode);
        initRow(rowNode, needFocus);
      }
    });
  } else {
    initRow(inputNode, true);
  }
};
