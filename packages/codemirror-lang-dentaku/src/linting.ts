import { syntaxTree } from "@codemirror/language";
import type { Diagnostic, LintSource } from "@codemirror/lint";
import { BuiltInFunctionsType, builtInFunctions } from "./builtInFunctions";
import { DentakuFunctionConfig } from "./function-config";

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
  expectedExactArgumentCount: (count: number) => string;
  /** Expected at least that many parameters, found this many. */
  expectedMinimumArgumentCount: (count: number) => string;
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
  customFunctions?: Record<string, DentakuFunctionConfig>;
  /** Custom error messages. */
  messages?: ErrorMessages;
}

export function dentakuLinter({
  knownVariables = [],
  customFunctions = {},
  messages = defaultErrorMessages,
}: DentakuLinterOptions = {}): LintSource {
  return (view) => {
    const diagnostics: Diagnostic[] = [];

    const knownFunctions: Record<string, DentakuFunctionConfig> = {
      ...(builtInFunctions as unknown as Record<
        BuiltInFunctionsType,
        DentakuFunctionConfig
      >),
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
            if (Object.keys(knownFunctions).includes(variableName)) {
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
          ) as BuiltInFunctionsType;

          const { minArgs = 0, maxArgs = Infinity } =
            knownFunctions[functionName] ?? {};

          if (maxArgs < Infinity) {
            if (minArgs === maxArgs && minArgs !== argumentCount) {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.expectedExactArgumentCount(minArgs),
              });
            } else if (
              minArgs < maxArgs &&
              (minArgs > argumentCount || maxArgs < argumentCount)
            ) {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.expectedArgumentCountRange(
                  argumentCount,
                  minArgs,
                  maxArgs
                ),
              });
            }
          } else if (minArgs > argumentCount) {
            diagnostics.push({
              from: nodeRef.from,
              to: nodeRef.to,
              severity: "error",
              message: messages.expectedMinimumArgumentCount(minArgs),
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
  expectedExactArgumentCount: (expectedAmount) =>
    `Expected exactly ${expectedAmount} parameter${
      expectedAmount > 1 ? "s" : ""
    }.`,
  expectedMinimumArgumentCount: (expectedAmount) =>
    `Expected at least ${expectedAmount} parameter${
      expectedAmount > 1 ? "s" : ""
    }.`,
  expectedArgumentCountRange: (actualAmount, expectedMin, expectedMax) =>
    `Expected between ${expectedMin} and ${expectedMax} argument${
      expectedMax > 1 ? "s" : ""
    }, found ${actualAmount}.`,
};
