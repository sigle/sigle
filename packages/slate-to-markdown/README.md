# @sigle/slate-to-markdown

This package converts a State JSON representation to a Markdown document.

## Usage

```ts
import { convert } from '@sigle/slate-to-markdown';

const slateJSON = [
  // ... Slate JSON
];

const markdown = convert(slateJSON);
```
