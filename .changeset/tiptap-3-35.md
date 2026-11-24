---
"@sigle/sigle": patch
---

Upgrade Tiptap to 3.35.0, which fixes a paste XSS in prosemirror-view, prototype pollution in `mergeAttributes` and a Markdown denial of service. Remove underline from the editor: Markdown has no underline, and published posts showed it as literal `++text++`. Drafts with `#` or `####` headings, which the editor can't create, turn those into paragraphs when next edited.
