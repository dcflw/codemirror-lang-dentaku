import { defineConfig } from "vitest/config";
import lezer from "unplugin-lezer/vite";

export default defineConfig({
  plugins: [lezer()],
});
