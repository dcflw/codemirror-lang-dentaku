import { EditorView, basicSetup } from "codemirror";
import { DentakuFunctionConfig, dentaku } from "codemirror-lang-dentaku";

const knownVariables = [
  "pages",
  "frequency",
  "user.firstName",
  "user.address.street",
  "user.address.number",
];

const customFunctions: Record<string, DentakuFunctionConfig> = {
  fnWithOneArg: { minArgs: 1, maxArgs: 1 },
  fnWithTwoOrMoreArgs: { minArgs: 2, maxArgs: Infinity },
  fnWithDefaultConfig: null,
};

new EditorView({
  extensions: [
    basicSetup,
    dentaku({
      completionOptions: {
        variableEntries: knownVariables.map((label) => ({
          label,
          type: "variable",
        })),
        customFunctionEntries: Object.keys(customFunctions).map((label) => ({
          label,
          type: "function",
        })),
      },
      linterOptions: { knownVariables, customFunctions },
    }),
  ],
  parent: document.querySelector<HTMLDivElement>("#app")!,
});
