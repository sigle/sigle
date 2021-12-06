# @sigle/slate-to-markdown

This package converts a Sigle story Slate JSON representation to a Markdown document. Before storing plain markdown, Sigle used to store stories in a JSON format.

## Usage

```ts
import { convert } from '@sigle/slate-to-markdown';

const slateJSON = [
  // ... Slate Sigle JSON
];

const markdown = convert(slateJSON);
```
