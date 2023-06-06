import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      name: "HouseHelpers",
      fileName: (format) => `house-helpers.${format}.js`,
      formats: ["es", "cjs"],
    },
  },
});
