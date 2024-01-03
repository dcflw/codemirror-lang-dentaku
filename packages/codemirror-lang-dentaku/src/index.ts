import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { styleTags, tags as t } from "@lezer/highlight";

import { parser as dentakuParser } from "./dentaku.grammar";
import {
  type DentakuLanguageCompletionOptions,
  dentakuCompletions,
} from "./autocompletion";
import { type DentakuLinterOptions, dentakuLinter } from "./linting";

/**
 * The full Dentaku language support, including autocompletion and linting.
 *
 * @example
 * const codeMirrorExtensions = [
 *   ...otherExtensions,
 *   dentaku(),
 * ];
 */
export function dentaku({
  linterOptions: { codeMirrorConfig, ...linterOptions } = {},
  completionOptions,
}: {
  linterOptions?: {
    codeMirrorConfig?: Parameters<typeof linter>[1];
  } & DentakuLinterOptions;
  completionOptions?: DentakuLanguageCompletionOptions;
} = {}) {
  return new LanguageSupport(dentakuLanguage, [
    dentakuLanguage.data.of({
      autocomplete: dentakuCompletions(completionOptions),
    }),
    linter(dentakuLinter(linterOptions), codeMirrorConfig),
  ]);
}

/**
 * Only the parser and syntax highlighter for Dentaku.
 *
 * Use this only if you want to omit/overwrite either linting or autocompletion.
 */
export const dentakuLanguage = LRLanguage.define({
  name: "dentaku",
  parser: dentakuParser.configure({
    props: [
      styleTags({
        VariableName: t.variableName,
        Number: t.number,
        Boolean: t.bool,
        String: t.string,
        Duration: t.unit,
        "( )": t.paren,
        ArithOp: t.arithmeticOperator,
        PercentOp: t.arithmeticOperator,
        BitwiseOp: t.bitwiseOperator,
        CompareOp: t.compareOperator,
        FunctionName: t.function(t.variableName),
      }),
    ],
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "'", '"'] },
  },
});

export { dentakuCompletions, dentakuLinter, dentakuParser };
export type { DentakuLanguageCompletionOptions, DentakuLinterOptions };
export { type ErrorMessages, invalidSyntax } from "./linting";
