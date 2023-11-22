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
- Autocompletion for known variables and built-in functions
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
   * Converter of built-in Dentaku functions into `Completion` objects.
   * Allows you to add additional information to completions like descriptions.
   */
  makeEntryForBuiltIns?: (
    name: (typeof builtInFunctions)[number]
  ) => Completion | null | false;
}
```

### Linting (`linterOptions`)

The `linterOptions` object is of type `DentakuLinterOptions & { codeMirrorConfig?: Parameters<typeof linter>[1] }` (see [`linter`](https://codemirror.net/docs/ref/#lint.linter)).  
This means that, apart from allowing fields from `DentakuLinterOptions` described below, the `linterOptions` also allows an optional `codeMirrorConfig` field that lets you specify options for the CodeMirror [linter](https://codemirror.net/docs/ref/#lint.linter) function (`linter(lintSource, options)`).

```ts
export interface DentakuLinterOptions {
  /** List of variable names to not treat as undefined. */
  knownVariables?: Array<string>;
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
  /** Expected at least one parameter in a function call. */
  expectedAtLeastOneParameter: string;
  /** Expected that many parameters, found this many. */
  parameterCountMismatch: (thatMany: number, thisMany: number) => string;
}
```

## Missing features

These features aren't on our roadmap because we don't use them currently, but contributions are highly welcome!

- [ ] Hexadecimal number literals (e.g., `0xFF`)
- [ ] Date literals (e.g. `2022-02-02`)
- [ ] Duration literals (e.g. `duration(1, day)`)
- [ ] Logic operators as operators (e.g., `a AND b`), functions are supported though (e.g, `and(a, b)`)
- [ ] Syntax highlighting of `case` statements
- [ ] Autocompletion for custom functions
- [ ] Linting argument counts of custom functions (including functions that take no arguments)
- [ ] Linting argument counts of functions with optional arguments
- [ ] Customizing the severity of lint errors
- [ ] Auto-fixing for fixable lint errors
