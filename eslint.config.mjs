import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";

export default [
    js.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            "@typescript-eslint": tseslint,
            "@next/next": nextPlugin,
        },
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                React: "readonly",
                console: "readonly",
                window: "readonly",
                document: "readonly",
                localStorage: "readonly",
                fetch: "readonly",
                URL: "readonly",
                Response: "readonly",
                Request: "readonly",
                Headers: "readonly",
                process: "readonly",
                confirm: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
