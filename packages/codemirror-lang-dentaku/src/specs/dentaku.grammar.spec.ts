import { expect, it, describe } from "vitest";
import { parser } from "../dentaku.grammar";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { testTree } from "@lezer/generator/test";

describe("Ruby specs: expression", () => {
  it("parses 7+3", () => {
    const tree = parser.parse("7+3");
    const spec = `Program(BinaryExpression(Number,ArithOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 2 -1", () => {
    const tree = parser.parse("2 -1");
    const spec = `Program(BinaryExpression(Number,ArithOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses -1 + 2", () => {
    const tree = parser.parse("-1 + 2");
    const spec = `Program(BinaryExpression(
      UnaryExpression(ArithOp,Number),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 1 - 2", () => {
    const tree = parser.parse("1 - 2");
    const spec = `Program(BinaryExpression(Number,ArithOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 1 - - 2", () => {
    const tree = parser.parse("1 - - 2");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      UnaryExpression(ArithOp,Number)
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses -1 - - 2", () => {
    const tree = parser.parse("-1 - - 2");
    const spec = `Program(BinaryExpression(
      UnaryExpression(ArithOp,Number),
      ArithOp,
      UnaryExpression(ArithOp,Number)
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 1 - - - 2", () => {
    const tree = parser.parse("1 - - - 2");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      UnaryExpression(
        ArithOp,
        UnaryExpression(ArithOp,Number)
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses (-1 + 2)", () => {
    const tree = parser.parse("(-1 + 2)");
    const spec = `Program(ParenthesizedExpression(
      BinaryExpression(
        UnaryExpression(ArithOp,Number),
        ArithOp,
        Number
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses -(1 + 2)", () => {
    const tree = parser.parse("-(1 + 2)");
    const spec = `Program(UnaryExpression(
      ArithOp,
      ParenthesizedExpression(
        BinaryExpression(
          Number,
          ArithOp,
          Number
        )
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 2 ^ - 1", () => {
    const tree = parser.parse("2 ^ - 1");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      UnaryExpression(ArithOp,Number)
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 2 ^ -(3 - 2)", () => {
    const tree = parser.parse("2 ^ -(3 - 2)");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      UnaryExpression(
        ArithOp,
        ParenthesizedExpression(
          BinaryExpression(
            Number,
            ArithOp,
            Number
          )
        )
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses (2 + 3) - 1", () => {
    const tree = parser.parse("(2 + 3) - 1");
    const spec = `Program(BinaryExpression(
      ParenthesizedExpression(
        BinaryExpression(
          Number,
          ArithOp,
          Number
        )
      ),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses (-2 + 3) - 1", () => {
    const tree = parser.parse("(-2 + 3) - 1");
    const spec = `Program(BinaryExpression(
      ParenthesizedExpression(
        BinaryExpression(
          UnaryExpression(ArithOp,Number),
          ArithOp,
          Number
        )
      ),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses (-2 - 3) - 1", () => {
    const tree = parser.parse("(-2 - 3) - 1");
    const spec = `Program(BinaryExpression(
      ParenthesizedExpression(
        BinaryExpression(
          UnaryExpression(ArithOp,Number),
          ArithOp,
          Number
        )
      ),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 1353+91-1-3322-22", () => {
    const tree = parser.parse("1353+91-1-3322-22");
    const spec = `Program(BinaryExpression(
      BinaryExpression(
        BinaryExpression(
          BinaryExpression(
            Number,
            ArithOp,
            Number
          ),
          ArithOp,
          Number
        ),
        ArithOp,
        Number
      ),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 1 + -(2 ^ 2)", () => {
    const tree = parser.parse("1 + -(2 ^ 2)");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      UnaryExpression(
        ArithOp,
        ParenthesizedExpression(
          BinaryExpression(
            Number,
            ArithOp,
            Number
          )
        )
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 3 + -num", () => {
    const tree = parser.parse("3 + -num");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      UnaryExpression(ArithOp,VariableName)
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses -num + 3", () => {
    const tree = parser.parse("-num + 3");
    const spec = `Program(BinaryExpression(
      UnaryExpression(ArithOp,VariableName),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 10 ^ 2", () => {
    const tree = parser.parse("10 ^ 2");
    const spec = `Program(BinaryExpression(Number,ArithOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 0 * 10 ^ -5", () => {
    const tree = parser.parse("0 * 10 ^ -5");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      BinaryExpression(Number,ArithOp,UnaryExpression(ArithOp,Number))
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 3 + 0 * -3", () => {
    const tree = parser.parse("3 + 0 * -3");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      BinaryExpression(
        Number,
        ArithOp,
        UnaryExpression(ArithOp,Number)
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 3 + 0 / -3", () => {
    const tree = parser.parse("3 + 0 / -3");
    const spec = `Program(BinaryExpression(
      Number,
      ArithOp,
      BinaryExpression(
        Number,
        ArithOp,
        UnaryExpression(ArithOp,Number)
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 15 % 8", () => {
    const tree = parser.parse("15 % 8");
    const spec = `Program(BinaryExpression(Number,PercentOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses (((695759/735000)^(1/(1981-1991)))-1)*1000", () => {
    const tree = parser.parse("(((695759/735000)^(1/(1981-1991)))-1)*1000");
    const spec = `Program(
      BinaryExpression(
        ParenthesizedExpression(
          BinaryExpression(
            ParenthesizedExpression(
              BinaryExpression(
                ParenthesizedExpression(
                  BinaryExpression(
                    Number,
                    ArithOp,
                    Number
                  )
                ),
                ArithOp,
                ParenthesizedExpression(
                  BinaryExpression(
                    Number,
                    ArithOp,
                    ParenthesizedExpression(
                      BinaryExpression(
                        Number,
                        ArithOp,
                        Number
                      )
                    )
                  )
                ),
              ),
            ),
            ArithOp,
            Number
          )
        ),
        ArithOp,
        Number
      )
    )`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 0.253/0.253", () => {
    const tree = parser.parse("0.253/0.253");
    const spec = `Program(BinaryExpression(Number,ArithOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 0.253/d", () => {
    const tree = parser.parse("0.253/d");
    const spec = `Program(BinaryExpression(Number,ArithOp,VariableName))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 10 + x", () => {
    const tree = parser.parse("10 + x");
    const spec = `Program(BinaryExpression(Number,ArithOp,VariableName))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses x * y", () => {
    const tree = parser.parse("x * y");
    const spec = `Program(BinaryExpression(VariableName,ArithOp,VariableName))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses a/b", () => {
    const tree = parser.parse("a/b");
    const spec = `Program(BinaryExpression(VariableName,ArithOp,VariableName))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses t + 1*24*60*60", () => {
    const tree = parser.parse("t + 1*24*60*60");
    const spec = `Program(
      BinaryExpression(
        VariableName,
        ArithOp,
        BinaryExpression(
          BinaryExpression(
            BinaryExpression(
              Number,
              ArithOp,
              Number
            ),
            ArithOp,
            Number
          ),
          ArithOp,
          Number
        )
      )
    )`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 2 | 3 * 9", () => {
    const tree = parser.parse("2 | 3 * 9");
    const spec = `Program(BinaryExpression(
      BinaryExpression(
        Number,
        BitwiseOp,
        Number
      ),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 2 & 3 * 9", () => {
    const tree = parser.parse("2 & 3 * 9");
    const spec = `Program(BinaryExpression(
      BinaryExpression(
        Number,
        BitwiseOp,
        Number
      ),
      ArithOp,
      Number
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 5%", () => {
    const tree = parser.parse("5%");
    const spec = `Program(UnaryExpression(Number,PercentOp))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses 1 << 3", () => {
    const tree = parser.parse("1 << 3");
    const spec = `Program(BinaryExpression(Number,BitwiseOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  // TODO: Hexadecimal literals are not supported
  it.skip("parses 0xFF >> 6", () => {
    const tree = parser.parse("0xFF >> 6");
    const spec = `Program(BinaryExpression(Number,BitwiseOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });
});

describe("Ruby specs: functions with negative numbers", () => {
  /**
   *       expect(calculator.evaluate('if (-1 < 5, -1, 5)')).to eq(-1)
      expect(calculator.evaluate('if (-1 = -1, -1, 5)')).to eq(-1)
      expect(calculator.evaluate('round(-1.23, 1)')).to eq(BigDecimal('-1.2'))
      expect(calculator.evaluate('NOT(some_boolean) AND -1 > 3', some_boolean: true)).to be_falsey
   */

  it("parses if (-1 < 5, -1, 5)", () => {
    const tree = parser.parse("if (-1 < 5, -1, 5)");
    const spec = `Program(CallExpression(
      FunctionName,
      ArgList(
        "(",
        BinaryExpression(
          UnaryExpression(ArithOp,Number),
          CompareOp,
          Number
        ),
        UnaryExpression(ArithOp,Number),
        Number,
        ")"
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses if (-1 = -1, -1, 5)", () => {
    const tree = parser.parse("if (-1 = -1, -1, 5)");
    const spec = `Program(CallExpression(
      FunctionName,
      ArgList(
        "(",
        BinaryExpression(
          UnaryExpression(ArithOp,Number),
          CompareOp,
          UnaryExpression(ArithOp,Number)
        ),
        UnaryExpression(ArithOp,Number),
        Number,
        ")"
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses round(-1.23, 1)", () => {
    const tree = parser.parse("round(-1.23, 1)");
    const spec = `Program(CallExpression(
      FunctionName,
      ArgList(
        "(",
        UnaryExpression(ArithOp,Number),
        Number,
        ")"
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  // TODO: AND as an operator is not supported
  it.skip("parses NOT(some_boolean) AND -1 > 3", () => {
    const tree = parser.parse("NOT(some_boolean) AND -1 > 3");
    const spec = `Program(
      BinaryExpression(
        BinaryExpression(
          CallExpression(FunctionName,ArgList("(",VariableName,")")),
          LogicOp,
          UnaryExpression(ArithOp,Number)
        ),
        CompareOp,
        Number
      )
    )`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });
});

describe("variables", () => {
  it("parses nested hashes as variables", () => {
    const tree = parser.parse("a.basket.of");
    const spec = `Program(VariableName)`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });

  it("parses nested hashes within expressions", () => {
    const tree = parser.parse("a.basket.of * 4");
    const spec = `Program(BinaryExpression(VariableName,ArithOp,Number))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });
});

describe("functions", () => {
  it("parses left('ABCD', 2)", () => {
    const tree = parser.parse("left('ABCD', 2)");
    const spec = `Program(CallExpression(
      FunctionName,
      ArgList(
        "(",
        String,
        Number,
        ")"
      )
    ))`;
    expect(() => testTree(tree, spec)).not.toThrow();
  });
});
