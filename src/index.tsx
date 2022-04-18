import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { TextfieldWithTags } from "./TextfieldWithTags";
import { normalizeTreeWalker, initRow, initInputRows } from "./utils";
import { SPACE_CHAR } from "./constants";
import { getTagNode, TagButton } from "./TagButton";

const TAGS = ["NUMBER", "DAY", "MONTH", "YEAR"];
const tagNames = TAGS.map((tag) => `{${tag}}`);

function App() {
  const inputRef = useRef<HTMLDivElement>();

  const [inputValue, onChange] = useState(
    `  asd asd{NUMBER} asd {DAY}  asd  asdasdasd\n{MONTH}{YEAR}asdasdas `
  );

  useEffect(() => {
    onChange((initialValue) => {
      inputRef.current.append(
        ...initialValue.split("\n").map((rowText) => {
          const div = document.createElement("div");

          let endText = rowText;
          const regExp = new RegExp(tagNames.join("|"), "i");
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

              endText = endText.slice(match.index + match[0].length);
              match = endText.match(regExp);
            }
            return div;
          }

          const span = document.createElement("span");
          span.append(rowText);
          div.appendChild(span);
          return div;
        })
      );
      return initialValue;
    });
  }, []);

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    initRow(e.target);
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection.focusNode.textContent === SPACE_CHAR) {
        selection.setPosition(selection.focusNode, 0);
        return;
      }
    }, 0);
  }, []);

  const onInput = useCallback((e: React.ChangeEvent<HTMLDivElement>) => {
    normalizeTreeWalker(e.target, tagNames);

    initInputRows(e.target);

    onChange(e.target.innerText);
  }, []);

  return (
    <div>
      <TextfieldWithTags
        label="TextfieldWithTags"
        inputRef={inputRef}
        value={inputValue}
        onFocus={onFocus}
        onInput={onInput}
      />
      {TAGS.map((tag) => (
        <TagButton
          key={tag}
          value={tag}
          inputRef={inputRef}
          onToggle={() => onChange(inputRef.current.innerText)}
        />
      ))}

      <div style={{ whiteSpace: "pre" }}>{inputValue}</div>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
