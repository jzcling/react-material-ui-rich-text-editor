# React Material UI Rich Text Editor

A WYSIWYG rich text editor built with Slate using Material UI components. This project is heavily influenced by the examples provided in the [Slate documentation](https://www.slatejs.org/examples) and this article on [Smashing Magazine](https://www.smashingmagazine.com/2021/05/building-wysiwyg-editor-javascript-slatejs).

## Installation

```
npm install --save @jeremyling/react-material-ui-rich-text-editor
```

The following packages are peer dependencies and must be installed in your project for this package to work.

```
@emotion/react
@emotion/styled
@mui/icons-material
@mui/material
lodash
```

## Usage Example

```jsx
import React, { useState } from "react";
import Editor from "@jeremyling/react-material-ui-rich-text-editor";

const initialHtml = "<p>Paragraph</p>";

export default function RichTextEditor(props) {
  const [html, setHtml] = useState(initialHtml);

  return <Editor html={html} updateHtml={(html) => setHtml(html)} />;
}
```

## Props

| Prop           | Type     | Default        | Description                                               |
| -------------- | -------- | -------------- | --------------------------------------------------------- |
| html           | `string` | `undefined`    | HTML to be deserialized as value.                         |
| updateHtml     | `func`   | `(html) => {}` | Method to update html, taking serialized html as argument |
| containerProps | `object` | `undefined`    | Props to pass to the Material UI Paper wrapper            |
| editableProps  | `object` | `undefined`    | Props to pass to the Slate Editable component             |

If `html` is not set, value will default to

```json
[
  {
    "type": "Paragraph",
    "children": [{ "text": "" }]
  }
]
```
