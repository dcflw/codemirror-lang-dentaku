import type { CompletionContext, Completion } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";

import { builtInFunctions } from "./builtInFunctions";
import { builtInOperators } from "./builtInOperators";

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
  makeEntryForBuiltInFunctions?: (
    name: (typeof builtInFunctions)[number]
  ) => Completion | null | false;
  /**
   * Converter of built-in Dentaku operators into `Completion` objects.
   * Allows you to add additional information to completions like descriptions.
   */
  makeEntryForBuiltInOperators?: (
    name: (typeof builtInOperators)[number]
  ) => Completion | null | false;
}

const Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;

const durationArguments = [
  { label: "day", type: "variable" },
  { label: "days", type: "variable" },
  { label: "month", type: "variable" },
  { label: "months", type: "variable" },
  { label: "year", type: "variable" },
  { label: "years", type: "variable" },
];

type NodeApproximation = { lastChild: NodeApproximation | null };
function rightmostLeaf<NodeType extends NodeApproximation>(node: NodeType) {
  if (node.lastChild !== null) {
    return rightmostLeaf(node.lastChild);
  } else {
    return node;
  }
}

export function dentakuCompletions({
  variableEntries = [],
  makeEntryForBuiltInFunctions = (name) => ({ label: name, type: "function" }),
  makeEntryForBuiltInOperators = (name) => ({ label: name, type: "operator" }),
}: DentakuLanguageCompletionOptions = {}) {
  return (context: CompletionContext) => {
    const tree = syntaxTree(context.state);
    const inner = tree.resolveInner(context.pos, -1);

    const isWord =
      inner.name === "VariableName" ||
      (inner.to - inner.from < 20 &&
        Identifier.test(context.state.sliceDoc(inner.from, inner.to)));

    const treeCursor = tree.cursorAt(context.pos, -1);
    const nodeName = treeCursor.node.type.name;
    const nodeParentName = treeCursor.node.parent?.type.name;
    const isDurationArg =
      nodeName === "Duration" ||
      (nodeParentName === "Duration" && !["(", ")"].includes(nodeName));
    const isOperator =
      context.state.sliceDoc(context.pos - 1, context.pos) === " " &&
      treeCursor.prev() &&
      !isDurationArg &&
      (rightmostLeaf(treeCursor.node).type.is("Literal") ||
        rightmostLeaf(treeCursor.node).name === "VariableName");

    if (isOperator) {
      return {
        options: builtInOperators
          .map(makeEntryForBuiltInOperators)
          .filter(Boolean),
        from: context.pos,
      };
    } else if (isDurationArg) {
      return {
        options: durationArguments.filter(Boolean),
        from: isWord ? inner.from : context.pos,
        validFor: Identifier,
      };
    } else if (isWord || context.explicit) {
      const functionEntries = builtInFunctions
        .map(makeEntryForBuiltInFunctions)
        .filter(Boolean);

      return {
        options: [...functionEntries, ...variableEntries],
        from: isWord ? inner.from : context.pos,
        validFor: Identifier,
      };
    }
  };
}
