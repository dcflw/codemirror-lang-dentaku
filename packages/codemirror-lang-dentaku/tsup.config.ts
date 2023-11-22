import { defineConfig } from "tsup";
import lezer from "unplugin-lezer/esbuild";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
  },
  experimentalDts: true,
  clean: true,
  format: ["esm", "cjs"],
  esbuildPlugins: [lezer()],
});
