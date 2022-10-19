import { SPACE_CHAR } from "../constants";
import { getClosestChildText, isDiv } from "../utils";

export const selectText = () => {
  const selection = window.getSelection();

  if (!selection) {
    return null;
  }
  const { focusNode, focusOffset } = selection;

  if (!focusNode) {
    return null;
  }

  let text = getClosestChildText(focusNode);

  if (!text) {
    return null;
  }

  const parentElement = text.parentElement;
  if (parentElement?.id) {
    text = document.createTextNode(SPACE_CHAR);
    parentElement.parentNode?.insertBefore(text, parentElement);
  }

  let node: Node | null = text.parentNode;

  if (!node) {
    return null;
  }

  // текст должен быть обернут в span, чтобы избежать неконтролируемое поведение contentEditable
  if (isDiv(node)) {
    const wrappedText = document.createElement("span");
    node.replaceChild(wrappedText, text);
    wrappedText.appendChild(text);
    selection?.setPosition(text, focusOffset);
    node = text.parentNode;
  }

  const parent = node?.parentNode;

  return { text, node, parent, focusOffset };
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
