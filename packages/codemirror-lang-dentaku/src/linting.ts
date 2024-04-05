import { syntaxTree } from "@codemirror/language";
import type { Diagnostic, LintSource } from "@codemirror/lint";
import { builtInFunctions } from "./builtInFunctions";
import { Arity } from "./arity";

/** Message codes that can be overridden with custom messages. */
export interface ErrorMessages {
  /** Generic "invalid syntax" message when no better message can be inferred. */
  invalidSyntax: string;
  /** Missing a closing bracket in a list of function arguments. */
  closingBracketMissing: string;
  /** Expected a comma before this function argument. */
  expectedCommaBefore: string;
  /** Expected an operator before this expression. */
  expectedOperatorBefore: string;
  /** The function name needs parentheses to be called. */
  callParenthesesMissing: string;
  /** This variable is not defined. */
  undefinedVariable: string;
  /** Missing child property. */
  missingChildProperty: string;
  /** Expected exactly that many parameters, found this many. */
  expectedExactArgumentCount: (
    actualCount: number,
    expectedCount: number
  ) => string;
  /** Expected at most that many parameters, found this many. */
  expectedMaximumArgumentCount: (
    actualCount: number,
    maxCount: number
  ) => string;
  /** Expected at least that many parameters, found this many. */
  expectedMinimumArgumentCount: (
    actualCount: number,
    minCount: number
  ) => string;
  /** Expected between that and that many parameters, found this many. */
  expectedArgumentCountRange: (
    actualCount: number,
    minCount: number,
    maxCount: number
  ) => string;
}

export interface DentakuLinterOptions {
  /** List of variable names to not treat as undefined. */
  knownVariables?: Array<string>;
  /** Custom functions. */
  customFunctions?: Record<string, Arity>;
  /** Custom error messages. */
  messages?: ErrorMessages;
}

export function dentakuLinter({
  knownVariables = [],
  customFunctions = {},
  messages = defaultErrorMessages,
}: DentakuLinterOptions = {}): LintSource {
  if (
    Object.values(customFunctions).some(
      ({ minArgs = 0, maxArgs = Infinity }) => minArgs > maxArgs
    )
  ) {
    throw new Error("minArgs greater than maxArgs found in customFunctions.");
  }

  return (view) => {
    const diagnostics: Diagnostic[] = [];

    const knownFunctions: Record<string, Arity> = {
      ...builtInFunctions,
      // Custom functions should override built-in functions, as this is the
      // way Dentaku works.
      ...customFunctions,
    };

    const cursor = syntaxTree(view.state).cursor();

    cursor.iterate((nodeRef) => {
      switch (nodeRef.name) {
        case invalidSyntax: {
          const parent = nodeRef.node.parent;
          if (parent?.name === "ArgList") {
            if (nodeRef.node.firstChild === null) {
              diagnostics.push({
                from: parent.from,
                to: parent.to,
                severity: "error",
                message: messages.closingBracketMissing,
              });
            } else {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.expectedCommaBefore,
              });
            }
          } else if (parent?.name === "VariableName") {
            diagnostics.push({
              from: nodeRef.from,
              to: nodeRef.to,
              severity: "error",
              message: messages.expectedOperatorBefore,
            });
          } else {
            diagnostics.push({
              from: nodeRef.from,
              to: nodeRef.to,
              severity: "error",
              message: messages.invalidSyntax,
            });
          }
          break;
        }

        case "VariableName": {
          const variableName = view.state.sliceDoc(nodeRef.from, nodeRef.to);

          if (nodeRef.node.firstChild?.name === invalidSyntax) {
            return;
          }

          if (!knownVariables.includes(variableName)) {
            if (variableName in knownFunctions) {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.callParenthesesMissing,
              });
            } else if (
              knownVariables.some((value) => value.includes(`${variableName}.`))
            ) {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.missingChildProperty,
              });
            } else {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.undefinedVariable,
              });
            }
          }
          break;
        }

        case "ArgList": {
          const argumentCount = nodeRef.node.getChildren("Expression").length;
          const functionNameNode = nodeRef.node.parent?.firstChild;
          if (!functionNameNode) {
            return;
          }
          const functionName = view.state.sliceDoc(
            functionNameNode.from,
            functionNameNode.to
          );

          const { minArgs = 0, maxArgs = Infinity } =
            functionName in knownFunctions
              ? knownFunctions[functionName as keyof typeof knownFunctions]
              : {};

          let message = "";

          if (
            minArgs > 0 &&
            maxArgs < Infinity &&
            (argumentCount < minArgs || argumentCount > maxArgs)
          ) {
            message = messages.expectedArgumentCountRange(
              argumentCount,
              minArgs,
              maxArgs
            );
          } else if (minArgs === maxArgs && minArgs !== argumentCount) {
            message = messages.expectedExactArgumentCount(
              argumentCount,
              minArgs
            );
          } else if (maxArgs === Infinity && argumentCount < minArgs) {
            message = messages.expectedMinimumArgumentCount(
              argumentCount,
              minArgs
            );
          } else if (minArgs === 0 && argumentCount > maxArgs) {
            message = messages.expectedMaximumArgumentCount(
              argumentCount,
              maxArgs
            );
          }

          if (message.length) {
            diagnostics.push({
              from: nodeRef.from,
              to: nodeRef.to,
              severity: "error",
              message,
            });
          }

          break;
        }
      }
    });

    return diagnostics;
  };
}

/** Special character reserved for invalid syntax trees. */
export const invalidSyntax = "⚠";

const defaultErrorMessages: ErrorMessages = {
  invalidSyntax: "Invalid syntax",
  closingBracketMissing: "Closing bracket is missing",
  expectedCommaBefore: "Expected comma before this parameter",
  expectedOperatorBefore:
    "Expected operator (e.g. +, -, *, /) before this expression",
  callParenthesesMissing: "Call this function with parentheses: ( )",
  undefinedVariable: "This variable is not defined",
  missingChildProperty: "Missing child property",
  expectedExactArgumentCount: (actualAmount, expectedAmount) =>
    `Expected exactly ${expectedAmount} argument${
      expectedAmount > 1 ? "s" : ""
    }, found ${actualAmount}.`,
  expectedMinimumArgumentCount: (actualAmount, expectedAmount) =>
    `Expected at least ${expectedAmount} argument${
      expectedAmount > 1 ? "s" : ""
    }, found ${actualAmount}.`,
  expectedMaximumArgumentCount: (actualAmount, expectedAmount) =>
    `Expected no more than ${expectedAmount} argument${
      expectedAmount > 1 ? "s" : ""
    }, found ${actualAmount}.`,
  expectedArgumentCountRange: (actualAmount, expectedMin, expectedMax) =>
    `Expected between ${expectedMin} and ${expectedMax} argument${
      expectedMax > 1 ? "s" : ""
    }, found ${actualAmount}.`,
};
