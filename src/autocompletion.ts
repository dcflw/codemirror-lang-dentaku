import type { CompletionContext, Completion } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";

import { builtInFunctions } from "./builtInFunctions";

export interface DentakuLanguageCompletionOptions {
  /**
   * CodeMirror `Completion` objects for known variables.
   *
   * @example
   * ["a", "b"].map(name => ({ label: name, type: "variable" }))
   */
  variableEntries?: Array<Completion>;
  /**
   * Converter of built-in Dentaku functions into `Completion` objects.
   * Allows you to add additional information to completions like descriptions.
   */
  makeEntryForBuiltIns?: (
    name: (typeof builtInFunctions)[number]
  ) => Completion | null | false;
}

const Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;

export function dentakuCompletions({
  variableEntries = [],
  makeEntryForBuiltIns = (name) => ({ label: name, type: "function" }),
}: DentakuLanguageCompletionOptions = {}) {
  return (context: CompletionContext) => {
    const inner = syntaxTree(context.state).resolveInner(context.pos, -1);
    const isWord =
      inner.name == "VariableName" ||
      (inner.to - inner.from < 20 &&
        Identifier.test(context.state.sliceDoc(inner.from, inner.to)));

    if (!isWord && !context.explicit) return null;

    const functionEntries = builtInFunctions
      .map(makeEntryForBuiltIns)
      .filter(Boolean);

    return {
      options: [...functionEntries, ...variableEntries],
      from: isWord ? inner.from : context.pos,
      validFor: Identifier,
    };
  };
}
