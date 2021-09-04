# React Material UI Rich Text Editor

A WYSIWYG rich text editor built with Slate using Material UI components. This project was heavily influenced by the Slate Rich Text example and [this Smashing Magazine article](https://www.smashingmagazine.com/2021/05/building-wysiwyg-editor-javascript-slatejs/).

## Installation

```
npm install --save @jeremyling/react-material-ui-rich-text-editor
```

The following packages are peer dependencies and must be installed in your project for this package to work.

```
@material-ui/core
lodash
mdi-material-ui
```

## Usage Example

```jsx
import React, { useState } from "react";
import Editor from "@jeremyling/react-material-ui-rich-text-editor";

const initialDocument = [
  {
    type: "Paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" },
    ],
  },
  {
    type: "Paragraph",
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold", bold: true },
      {
        text: ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "Quote Block",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "Paragraph",
    children: [{ text: "Try it out for yourself!" }],
  },
];

export default function RichTextEditor(props) {
  const [document, setDocument] = useState(initialDocument);

  return (
    <Editor
      document={document}
      onChange={(document) => setDocument(document)}
      onBlur={(html) => console.log(html)}
    />
  );
}
```

## Props

| Prop           | Type     | Default        | Description                                                                                                                                           |
| -------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| html           | `string` | `undefined`    | HTML to be deserialized as content. Document takes precedence.                                                                                        |
| document       | `array`  | `undefined`    | Document set as value for the Slate Context Provider. Takes precedence over HTML                                                                      |
| onChange       | `func`   | `() => {}`     | Method passed to Slate Context Provider's onChange prop                                                                                               |
| onBlur         | `func`   | `(html) => {}` | Additional method to run triggered by the onBlur event on the wrapper component. By default, the serialized html will be passed as the only argument. |
| containerProps | `object` | `undefined`    | Props to pass to the Material UI Paper wrapper                                                                                                        |
| editableProps  | `object` | `undefined`    | Props to pass to the Slate Editable component                                                                                                         |

If neither `html` or `document` is set, content will default to

```json
[
  {
    "type": "Paragraph",
    "children": [{ "text": "" }]
  }
]
```
