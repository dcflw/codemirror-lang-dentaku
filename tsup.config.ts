import { defineConfig } from "tsup";
import lezer from "unplugin-lezer/esbuild";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
  },
  dts: true,
  clean: true,
  format: ["esm", "cjs"],
  esbuildPlugins: [lezer()],
});
