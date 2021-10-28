import isString from "lodash/isString";
import { Text, Transforms } from "slate";
import { jsx } from "slate-hyperscript";

const ELEMENT_TAGS = {
  A: (el) => ({ type: "Link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "Quote Block" }),
  IMG: (el) => ({ type: "Image", url: el.getAttribute("src") }),
  LI: () => ({ type: "List Item" }),
  OL: () => ({ type: "Ordered List" }),
  P: () => ({ type: "Paragraph" }),
  PRE: () => ({ type: "Code Block" }),
  UL: () => ({ type: "Unordered List" }),
};

const HEADING_TAGS = {
  H1: () => ({ fontSize: 32, bold: true }),
  H2: () => ({ fontSize: 24, bold: true }),
  H3: () => ({ fontSize: 18.72, bold: true }),
  H4: () => ({ fontSize: 16, bold: true }),
  H5: () => ({ fontSize: 13.28, bold: true }),
  H6: () => ({ fontSize: 12, bold: true }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strike: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strike: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
  MARK: () => ({ highlight: true }),
};

const deserialize = (el) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;
  let parent = el;

  if (
    nodeName === "PRE" &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === "CODE"
  ) {
    parent = el.childNodes[0];
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat();

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx("element", attrs, children);
  }

  if (HEADING_TAGS[nodeName]) {
    return children
      .filter((child) => isString(child))
      .map((child) =>
        jsx(
          "element",
          { type: "Paragraph" },
          jsx("text", HEADING_TAGS[nodeName](el), child)
        )
      );
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children
      .filter((child) => Text.isText(child))
      .map((child) => jsx("text", attrs, child));
  }

  return children;
};

export const withHtml = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
