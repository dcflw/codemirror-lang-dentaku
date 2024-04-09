/**
 * The supported built-in functions names and their config.
 *
 * When `null` config is provided, the `minArgs` is assumed to be 0 and `maxArg`
 * to be Infinity
 */
export const builtInFunctions = {
  // Math
  acos: { minArgs: 1, maxArgs: 1 },
  acosh: { minArgs: 1, maxArgs: 1 },
  asin: { minArgs: 1, maxArgs: 1 },
  asinh: { minArgs: 1, maxArgs: 1 },
  atan: { minArgs: 1, maxArgs: 1 },
  atan2: { minArgs: 2, maxArgs: 2 },
  atanh: { minArgs: 1, maxArgs: 2 },
  cbrt: { minArgs: 1, maxArgs: 1 },
  cos: { minArgs: 1, maxArgs: 1 },
  cosh: { minArgs: 1, maxArgs: 1 },
  erf: { minArgs: 1, maxArgs: 1 },
  erfc: { minArgs: 1, maxArgs: 1 },
  exp: { minArgs: 1, maxArgs: 1 },
  frexp: { minArgs: 1, maxArgs: 1 },
  gamma: { minArgs: 1, maxArgs: 1 },
  hypot: { minArgs: 2, maxArgs: 2 },
  ldexp: { minArgs: 2, maxArgs: 2 },
  lgamma: { minArgs: 1, maxArgs: 1 },
  log: { minArgs: 1, maxArgs: 2 },
  log10: { minArgs: 1, maxArgs: 1 },
  log2: { minArgs: 1, maxArgs: 1 },
  sin: { minArgs: 1, maxArgs: 1 },
  sinh: { minArgs: 1, maxArgs: 1 },
  sqrt: { minArgs: 1, maxArgs: 1 },
  tan: { minArgs: 1, maxArgs: 1 },
  tanh: { minArgs: 1, maxArgs: 1 },

  // Logic
  if: { minArgs: 3, maxArgs: 3 },
  and: { minArgs: 1, maxArgs: Infinity },
  or: { minArgs: 1, maxArgs: Infinity },
  xor: { minArgs: 1, maxArgs: Infinity },
  not: { minArgs: 1, maxArgs: 1 },
  switch: { minArgs: 3, maxArgs: Infinity },

  // Numeric
  min: { minArgs: 1, maxArgs: Infinity },
  max: { minArgs: 1, maxArgs: Infinity },
  sum: { minArgs: 1, maxArgs: Infinity },
  avg: { minArgs: 1, maxArgs: Infinity },
  count: {},
  round: { minArgs: 1, maxArgs: 2 },
  roundup: { minArgs: 1, maxArgs: 2 },
  rounddown: { minArgs: 1, maxArgs: 2 },
  abs: { minArgs: 1, maxArgs: 1 },

  // Selections
  case: { minArgs: 2, maxArgs: Infinity },

  // String
  left: { minArgs: 2, maxArgs: 2 },
  right: { minArgs: 2, maxArgs: 2 },
  mid: { minArgs: 3, maxArgs: 3 },
  len: { minArgs: 1, maxArgs: 1 },
  substitute: { minArgs: 3, maxArgs: 3 },
  concat: { minArgs: 1, maxArgs: Infinity },
  contains: { minArgs: 2, maxArgs: 2 },

  // Collection
  map: { minArgs: 3, maxArgs: 3 },
  filter: { minArgs: 3, maxArgs: 3 },
  all: { minArgs: 3, maxArgs: 3 },
  any: { minArgs: 3, maxArgs: 3 },
  pluck: { minArgs: 2, maxArgs: 2 },

  duration: { minArgs: 2, maxArgs: 2 },
};

export type BuiltInFunctionsType = keyof typeof builtInFunctions;
