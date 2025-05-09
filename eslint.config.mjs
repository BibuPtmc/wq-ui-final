// eslint.config.js for ESLint v9+ with React support
import js from "@eslint/js";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true, // 👈 nécessaire pour comprendre le JSX
      },
    },
    plugins: {
      react,
    },
    rules: {
      "no-unused-vars": "warn",
      "react/jsx-uses-react": "off", // React 17+
      "react/react-in-jsx-scope": "off", // React 17+
      "react/prop-types": "off", // Désactive si tu n'utilises pas PropTypes
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
