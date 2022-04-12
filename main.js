import $ from "jquery";
import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
import { python } from "@codemirror/lang-python";
import { tags, HighlightStyle } from "@codemirror/highlight";

// Output
function writeOutput(text) {
  let current = $("#output").text();
  $("#output").text(current + text + "\n");
}

function clearOutput() {
  $("#output").text("");
}

(async function () {
  window.pyodide = await loadPyodide({ stdout: writeOutput });
  // pyodide.runPython(`
  //   import sys
  //   import js

  //   class Output:
  //       def __init__(self, id):
  //           self.target = js.document.getElementById(id)
  //       def write(self, string):
  //           self.target.innerText += string

  //   sys.stdout = Output(id="output")

  // `);
})();

let myTheme = EditorView.theme(
  {
    "&": {
      color: "black",
      backgroundColor: "white",
      outline: "none",
    },
    "&.cm-editor.cm-focused": {
      outline: "none",
    },
    ".cm-content": {
      caretColor: "blue", // never seen?
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "green",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "orange",
    },
    ".cm-gutters": {
      backgroundColor: "white",
      color: "black",
      border: "none",
    },
    ".cm-scroller": {
      fontFamily: "'Fira Code', 'monospace'",
    },
  },
  { dark: false }
);

const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#fc6" },
  { tag: tags.comment, color: "#f5d", fontStyle: "italic" },
]);

let view = new EditorView({
  state: EditorState.create({
    extensions: [basicSetup, myTheme, myHighlightStyle, python()],
  }),
  parent: document.getElementById("code"),
});

$("button#run").on("click", () => {
  let src = view.state.doc.toString();
  try {
    pyodide.runPython(src);
  } catch (error) {
    // check PythonError?
    writeOutput(error);
  }
});

$("button#clear").on("click", clearOutput);
