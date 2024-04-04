# Dentaku formula language support for CodeMirror

[Dentaku](https://github.com/rubysolo/dentaku) is a parser and evaluator of formulas for Ruby. This package is language support of this formula language for CodeMirror.

## Installation & usage

```bash
npm install --save codemirror codemirror-lang-dentaku
```

```ts
import { EditorView } from "codemirror";
import { dentaku } from "codemirror-lang-dentaku";

new EditorView({
  extensions: [dentaku()],
});
```

## Features

- Syntax highlighting (except `case` statements)
- Autocompletion for built-in and custom functions and known variables
- Linting for syntax errors and undefined variables

This package doesn't offer support for everything that Dentaku offers, see the list of [missing features](#missing-features) below.

## Configuration

The main export, `dentaku`, comes packaged with linting and autocompletion that you can configure:

```ts
dentaku({ completionOptions, linterOptions });
```

### Autocompletion (`completionOptions`)

```ts
export interface DentakuLanguageCompletionOptions {
  /**
   * CodeMirror `Completion` objects for known variables.
   *
   * @example
   * ["a", "b"].map(name => ({ label: name, type: "variable" }))
   */
  variableEntries?: Array<Completion>;
  /**
   * CodeMirror `Completion` objects for custom functions.
   *
   * @example
   * ["fnA", "fnB"].map(name => ({ label: name, type: "function" }))
   */
  customFunctionEntries?: Array<Completion>;
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
```

### Linting (`linterOptions`)

The `linterOptions` object is of type `DentakuLinterOptions & { codeMirrorConfig?: Parameters<typeof linter>[1] }` (see [`linter`](https://codemirror.net/docs/ref/#lint.linter)).  
This means that, apart from allowing fields from `DentakuLinterOptions` described below, the `linterOptions` also allows an optional `codeMirrorConfig` field that lets you specify options for the CodeMirror [linter](https://codemirror.net/docs/ref/#lint.linter) function (`linter(lintSource, options)`).
The `customFunctions` property is an object with the custom functions names as keys and `DentakuFunctionConfig` object as values (see [Custom Functions](#custom-functions") below).

```ts
export interface DentakuLinterOptions {
  /** List of variable names to not treat as undefined. */
  knownVariables?: Array<string>;
  /** Custom functions. */
  customFunctions?: Record<string, DentakuFunctionConfig>;
  /** Custom error messages. */
  messages?: ErrorMessages;
}

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
```

### Custom Functions

The configurations of custom functions allows defining the minimum and maximum number of arguments that can be passed to each function. When a function supports an unknown number of maximum arguments, `Infinity` should be provided. If `null` is provided as value, by default, the minimum will be `0` and the maximum `Infinity`. When a is provided, both `minArgs` and `maxArgs` are required.

```ts
/** Configurations functions  */
export type DentakuFunctionConfig = {
  minArgs: number;
  maxArgs: number;
};

// Example of custom functions configuration
const customFunctions: Record<string, DentakuFunctionConfig> = {
  fnWithOneArg: {
    minArgs: 1,
    maxArgs: 1,
  },
  fnWithTwoOrMoreArgs: {
    minArgs: 2,
    maxArgs: Infinity,
  },
  fnWithDefaultConfig: null,
};
```

## Missing features

These features aren't on our roadmap because we don't use them currently, but contributions are highly welcome!

- [ ] Hexadecimal number literals (e.g., `0xFF`)
- [ ] Logic operators as operators (e.g., `a AND b`), functions are supported though (e.g, `and(a, b)`)
- [ ] Syntax highlighting of `case` statements
- [ ] Customizing the severity of lint errors
- [ ] Auto-fixing for fixable lint errors
