---
"@sigle/server": patch
"@sigle/sigle": patch
"@sigle/sdk": patch
---

Lint with `@cloudflare/oxlint-config` instead of every Oxlint category and the vendored anti-slop plugin. Its nkzw base ships the same quality rules as anti-slop, so `tools/oxlint/anti-slop` is removed, along with the rules the config turned off one by one. Enable the style and import rules with their fixes, such as type-only imports, `curly` and `Array<T>`, and keep `import/no-namespace` off for zod, Drizzle and shadcn imports. Enable five small correctness rules with their fixes, such as `prefer-promise-reject-errors` and `jsx-a11y/alt-text`, and call the Plan page's visibility listener through an Effect Event so it's added once. Enable the 12 type-aware safety rules with their fixes, such as `no-unsafe-*` and `no-floating-promises`: the editor reads Tiptap's untyped attributes safely, a failed cover upload no longer leaves an unhandled rejection, and the migration page stops before creating a draft for a post whose content isn't a string. The 8 React and logging rules the code doesn't pass yet are off for now, and the disable comments for rules that no longer run are removed.
