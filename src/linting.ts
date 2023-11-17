import { syntaxTree } from "@codemirror/language";
import type { Diagnostic, LintSource } from "@codemirror/lint";
import { builtInFunctions } from "./builtInFunctions";

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
  /** Expected at least one parameter in a function call. */
  expectedAtLeastOneParameter: string;
  /** Expected that many parameters, found this many. */
  parameterCountMismatch: (
    expectedAmount: number,
    actualAmount: number
  ) => string;
}

export interface DentakuLinterOptions {
  /** List of variable names to not treat as undefined. */
  knownVariables?: Array<string>;
  /** Custom error messages. */
  messages?: ErrorMessages;
}

export function dentakuLinter({
  knownVariables = [],
  messages = defaultErrorMessages,
}: DentakuLinterOptions = {}): LintSource {
  return (view) => {
    const diagnostics: Diagnostic[] = [];

    const cursor = syntaxTree(view.state).cursor();

    cursor.iterate((nodeRef) => {
      console.debug(
        nodeRef.name,
        view.state.sliceDoc(nodeRef.from, nodeRef.to)
      );

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
            if (builtInFunctions.includes(variableName)) {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.callParenthesesMissing,
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
          const expectedArgumentCount: number | undefined =
            knownArgumentCounts[
              functionName as keyof typeof knownArgumentCounts
            ];

          if (expectedArgumentCount === undefined && argumentCount === 0) {
            diagnostics.push({
              from: nodeRef.from,
              to: nodeRef.to,
              severity: "error",
              message: messages.expectedAtLeastOneParameter,
            });
          } else if (expectedArgumentCount !== undefined) {
            if (argumentCount !== expectedArgumentCount) {
              diagnostics.push({
                from: nodeRef.from,
                to: nodeRef.to,
                severity: "error",
                message: messages.parameterCountMismatch(
                  expectedArgumentCount,
                  argumentCount
                ),
              });
            }
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
  expectedAtLeastOneParameter: "Expected at least one parameter",
  parameterCountMismatch: (expectedAmount, actualAmount) =>
    `Expected ${expectedAmount} parameter${
      expectedAmount !== 1 ? "s" : ""
    }, found ${actualAmount}.`,
};

/** Argument counts for built-in functions (when they are of fixed arity). */
const knownArgumentCounts: Partial<
  Record<(typeof builtInFunctions)[number], number>
> = {
  acos: 1,
  acosh: 1,
  asin: 1,
  asinh: 1,
  atan: 1,
  atan2: 2,
  atanh: 1,
  cbrt: 1,
  cos: 1,
  cosh: 1,
  erf: 1,
  erfc: 1,
  exp: 1,
  frexp: 1,
  gamma: 1,
  hypot: 2,
  ldexp: 2,
  lgamma: 1,
  log10: 1,
  log2: 1,
  sin: 1,
  sinh: 1,
  sqrt: 1,
  tan: 1,
  tanh: 1,
  if: 3,
  not: 1,
  abs: 1,
  left: 2,
  right: 2,
  mid: 3,
  substitute: 3,
  contains: 2,
  any: 3,
  all: 3,
  map: 3,
  pluck: 2,
};
