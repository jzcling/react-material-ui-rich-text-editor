import isHotkey from "is-hotkey";
import React, { useCallback } from "react";
import { BaseText, Editor } from "slate";
import { DefaultElement, RenderElementProps, RenderLeafProps } from "slate-react";

import CodeBlock from "../components/CodeBlock";
import Image from "../components/Image";
import { TextStyleType } from "../components/Toolbar";
import {
  DEFAULT_FONT_COLOR, DEFAULT_FONT_SIZE, getActiveBlock, GROUP_TYPES, toggleBlock, toggleMark
} from "../utils/EditorUtils";

export default function useEditorConfig(editor: Editor) {
  const { isVoid, isInline } = editor;
  editor.isVoid = (element) =>
    ["Image"].includes(element.type) || isVoid(element);
  editor.isInline = (element) =>
    ["Link"].includes(element.type) || isInline(element);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => handleKeyDown(editor, event),
    [editor]
  );

  return { renderElement, renderLeaf, onKeyDown };
}

const ElementType = {
  Paragraph: "Paragraph",
  QuoteBlock: "Quote Block",
  CodeBlock: "Code Block",
  OrderedList: "Ordered List",
  UnorderedList: "Unordered List",
  ListItem: "List Item",
  Link: "Link",
  Image: "Image",
  AlignLeft: "Align Left",
  AlignRight: "Align Right",
  AlignCenter: "Align Center",
  Justify: "Justify",
  Multiple: "Multiple",
} as const;
export type ElementType = typeof ElementType[keyof typeof ElementType];

export type CustomElement = {
  type: ElementType;
  children?: CustomText[];
  url?: string;
  caption?: string;
  width?: string | number;
  height?: string | number;
  style?: Record<string, any>;
};
export type CustomText = Partial<BaseText> & Partial<TextStyleType>;

function renderElement({ element, children, attributes }: RenderElementProps) {
  switch (element.type) {
    case ElementType.Paragraph:
      return <p {...attributes}>{children}</p>;
    case ElementType.QuoteBlock:
      return (
        <blockquote className="editor-quote-block" {...attributes}>
          {children}
        </blockquote>
      );
    case ElementType.CodeBlock:
      return <CodeBlock {...{ element, children, attributes }} />;
    case ElementType.OrderedList:
      return <ol {...attributes}>{children}</ol>;
    case ElementType.UnorderedList:
      return <ul {...attributes}>{children}</ul>;
    case ElementType.ListItem:
      return <li {...attributes}>{children}</li>;
    case ElementType.Link:
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    case ElementType.Image:
      return <Image {...{ element, children, attributes }} />;
    case ElementType.AlignLeft:
      return (
        <div style={{ textAlign: "left" }} {...attributes}>
          {children}
        </div>
      );
    case ElementType.AlignCenter:
      return (
        <div style={{ textAlign: "center" }} {...attributes}>
          {children}
        </div>
      );
    case ElementType.AlignRight:
      return (
        <div style={{ textAlign: "right" }} {...attributes}>
          {children}
        </div>
      );
    case ElementType.Justify:
      return (
        <div style={{ textAlign: "justify" }} {...attributes}>
          {children}
        </div>
      );
    default:
      // For the default case, we delegate to Slate's default rendering.
      return <DefaultElement {...{ element, children, attributes }} />;
  }
}

function renderLeaf({ leaf, children, attributes }: RenderLeafProps) {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strike) {
    children = <del>{children}</del>;
  }

  if (leaf.highlight) {
    children = <mark>{children}</mark>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.quote) {
    children = <q>{children}</q>;
  }

  const style: { fontSize: string | number; color: string } = {
    fontSize: DEFAULT_FONT_SIZE,
    color: DEFAULT_FONT_COLOR,
  };

  if (leaf.fontSize) {
    style.fontSize = String(leaf.fontSize).endsWith("px")
      ? leaf.fontSize
      : String(leaf.fontSize) + "px";
  }

  if (leaf.color) {
    style.color = leaf.color;
  }

  return (
    <span style={style} {...attributes}>
      {children}
    </span>
  );
}

function handleKeyDown(
  editor: Editor,
  event: React.KeyboardEvent<HTMLDivElement>
) {
  if (isHotkey("mod+b", { byKey: true }, event)) {
    toggleMark(editor, "bold");
    return;
  }
  if (isHotkey("mod+i", { byKey: true }, event)) {
    toggleMark(editor, "italic");
    return;
  }
  if (isHotkey("mod+u", { byKey: true }, event)) {
    toggleMark(editor, "underline");
    return;
  }
  if (isHotkey("mod+alt+h", { byKey: true }, event)) {
    toggleMark(editor, "highlight");
    return;
  }
  if (isHotkey("mod+alt+c", { byKey: true }, event)) {
    toggleMark(editor, "code");
    return;
  }
  if (isHotkey("mod+q", { byKey: true }, event)) {
    toggleMark(editor, "quote");
    return;
  }
  if (isHotkey("backspace", { byKey: true }, event)) {
    if (editor.selection && Editor.before(editor, editor.selection)) {
      return;
    }
    const type = getActiveBlock(editor, GROUP_TYPES);
    if (type) {
      toggleBlock(editor, type);
    }
  }
  if (isHotkey("mod+l", { byKey: true }, event)) {
    event.preventDefault();
    toggleBlock(editor, "Align Left");
  }
  if (isHotkey("mod+e", { byKey: true }, event)) {
    event.preventDefault();
    toggleBlock(editor, "Align Center");
  }
  if (isHotkey("mod+r", { byKey: true }, event)) {
    event.preventDefault();
    toggleBlock(editor, "Align Right");
  }
  if (isHotkey("mod+j", { byKey: true }, event)) {
    event.preventDefault();
    toggleBlock(editor, "Justify");
  }
  if (isHotkey("mod+z", { byKey: true }, event)) {
    event.preventDefault();
    event.stopPropagation();
    editor.undo();
  }
  if (isHotkey("mod+shift+z", { byKey: true }, event)) {
    event.preventDefault();
    event.stopPropagation();
    editor.redo();
  }
}
