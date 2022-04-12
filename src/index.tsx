import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { TextfieldWithTags } from "./TextfieldWithTags";
import { normalizeTreeWalker, initInputRows, initRow } from "./utils";
import { SPACE_CHAR } from "./constants";
import { TagButton } from "./TagButton";

const TAGS = ["DAY", "NUMBER", "TIME", "ID", "NAME"];

function App() {
  const inputRef = useRef<HTMLDivElement>();

  const [inputValue, onChange] = useState(
    `asasdjashdakdj\nasdkjashdkjashd\nasdkjasldkjasdld`
  );

  useEffect(() => {
    onChange((initialValue) => {
      inputRef.current.append(
        ...initialValue.split("\n").map((rowText) => {
          const span = document.createElement("span");
          span.append(rowText);
          const div = document.createElement("div");
          div.append(span);
          return div;
        })
      );
      return initialValue;
    });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "z") {
        e.preventDefault();
      }
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    initRow(e.target);
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection.focusNode.textContent === SPACE_CHAR) {
        selection.setPosition(selection.focusNode, 0);
      }
    }, 0);
  };

  const onInput = (e: React.ChangeEvent<HTMLDivElement>) => {
    normalizeTreeWalker(
      e.target,
      TAGS.map((tag) => `{${tag}}`)
    );

    onChange(e.target.innerText);
  };

  return (
    <div>
      <TextfieldWithTags
        label="TextfieldWithTags"
        inputRef={inputRef}
        value={inputValue}
        onKeyDown={onKeyDown}
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
