import React, { useCallback } from "react";
import { DefaultElement } from "slate-react";
import isHotkey from "is-hotkey";
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  getActiveBlock,
  GROUP_TYPES,
  toggleBlock,
  toggleMark,
} from "../Utils/EditorUtils";
import { Editor } from "slate";
import Image from "../Components/Image";
import CodeBlock from "../Components/CodeBlock";

export default function useEditorConfig(editor) {
  const { isVoid, isInline } = editor;
  editor.isVoid = (element) =>
    ["Image"].includes(element.type) || isVoid(element);
  editor.isInline = (element) =>
    ["Link"].includes(element.type) || isInline(element);

  const onKeyDown = useCallback(
    (event) => handleKeyDown(editor, event),
    [editor]
  );

  return { renderElement, renderLeaf, onKeyDown };
}

function renderElement({ element, children, attributes }) {
  switch (element.type) {
    case "Paragraph":
      return <p {...attributes}>{children}</p>;
    case "Quote Block":
      return (
        <blockquote className="editor-quote-block" {...attributes}>
          {children}
        </blockquote>
      );
    case "Code Block":
      return <CodeBlock {...{ element, children, attributes }} />;
    case "Ordered List":
      return <ol {...attributes}>{children}</ol>;
    case "Unordered List":
      return <ul {...attributes}>{children}</ul>;
    case "List Item":
      return <li {...attributes}>{children}</li>;
    case "Link":
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    case "Image":
      return <Image {...{ element, children, attributes }} />;
    case "Align Left":
      return (
        <div style={{ textAlign: "left" }} {...attributes}>
          {children}
        </div>
      );
    case "Align Center":
      return (
        <div style={{ textAlign: "center" }} {...attributes}>
          {children}
        </div>
      );
    case "Align Right":
      return (
        <div style={{ textAlign: "right" }} {...attributes}>
          {children}
        </div>
      );
    case "Justify":
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

function renderLeaf({ leaf, children, attributes }) {
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

  const style = {
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

function handleKeyDown(editor, event) {
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
    if (Editor.before(editor, editor.selection)) {
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
