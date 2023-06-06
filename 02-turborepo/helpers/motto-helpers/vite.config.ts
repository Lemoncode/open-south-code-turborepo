import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      name: "MottoHelpers",
      fileName: (format) => `motto-helpers.${format}.js`,
      formats: ["es", "cjs"],
    },
  },
});
