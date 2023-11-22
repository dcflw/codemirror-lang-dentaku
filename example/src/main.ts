import { EditorView, basicSetup } from "codemirror";
import { dentaku } from "codemirror-lang-dentaku";

new EditorView({
  extensions: [
    basicSetup,
    dentaku({
      completionOptions: {
        variableEntries: [
          { label: "pages", type: "variable" },
          { label: "frequency", type: "variable" },
          { label: "firstName", type: "variable" },
        ],
      },
      linterOptions: {
        knownVariables: ["pages", "frequency", "firstName"],
      },
    }),
  ],
  parent: document.querySelector<HTMLDivElement>("#app")!,
});
