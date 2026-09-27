import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".next/**", ".open-next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
