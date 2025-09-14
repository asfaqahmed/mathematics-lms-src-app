import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js rules
      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "error",

      // General rules
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",

      // Import rules
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index"
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ]
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "*.config.js",
      "*.config.mjs"
    ]
  }
];

export default eslintConfig;
