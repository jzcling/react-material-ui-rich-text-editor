import { Editor, Range, Transforms } from "slate";

const ELEMENT_SHORTCUTS = {
  "*": { parent: "Unordered List", child: "List Item" },
  "-": { parent: "Unordered List", child: "List Item" },
  "+": { parent: "Unordered List", child: "List Item" },
  "1.": { parent: "Ordered List", child: "List Item" },
  ">": { parent: "Quote Block", child: "Quote" },
  "```": { parent: "Code Block", child: "Code" },
};

const TEXT_SHORTCUTS = {
  "#": { fontSize: 32, bold: true },
  "##": { fontSize: 24, bold: true },
  "###": { fontSize: 19, bold: true },
  "####": { fontSize: 16, bold: true },
  "#####": { fontSize: 13, bold: true },
  "######": { fontSize: 11, bold: true },
};

export const withShortcuts = (editor) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);

      const elementProps = ELEMENT_SHORTCUTS[beforeText];
      const textProps = TEXT_SHORTCUTS[beforeText];

      if (elementProps || textProps) {
        Transforms.select(editor, range);
        Transforms.delete(editor);

        if (elementProps) {
          const newProperties = {
            type: elementProps.child,
          };
          Transforms.setNodes(editor, newProperties);

          const block = { type: elementProps.parent, children: [] };
          Transforms.wrapNodes(editor, block);
        }

        if (textProps) {
          for (const [format, value] of Object.entries(textProps)) {
            Editor.addMark(editor, format, value);
          }
        }

        return;
      }
    }

    insertText(text);
  };

  return editor;
};
