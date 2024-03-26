import { EditorView, basicSetup } from "codemirror";
import { dentaku } from "codemirror-lang-dentaku";

const knownVariables = [
  "pages",
  "frequency",
  "user.firstName",
  "user.address.street",
  "user.address.number",
];

new EditorView({
  extensions: [
    basicSetup,
    dentaku({
      completionOptions: {
        variableEntries: knownVariables.map((label) => ({
          label,
          type: "variable",
        })),
      },
      linterOptions: { knownVariables },
    }),
  ],
  parent: document.querySelector<HTMLDivElement>("#app")!,
});
