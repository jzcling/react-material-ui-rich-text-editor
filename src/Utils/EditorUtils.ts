import escapeHtml from "escape-html";
import isUrl from "is-url";
import {
  BasePoint, Descendant, Editor, Element, Node, Point, Range, Text, Transforms
} from "slate";
import { jsx } from "slate-hyperscript";

import { TextStyleType } from "../components/Toolbar";
import { CustomElement, CustomText, ElementType } from "../hooks/useEditorConfig";

export const GROUP_TYPES: Array<ElementType> = [
  "Ordered List",
  "Unordered List",
  "Code Block",
  "Quote Block",
];
export const ALIGNMENT_TYPES: Array<ElementType> = [
  "Align Left",
  "Align Center",
  "Align Right",
  "Justify",
];

export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_FONT_COLOR = "#181d23";

export const toggleBlock = (
  editor: Editor,
  format: ElementType,
  itemType?: ElementType | keyof TextStyleType
) => {
  const isActive = isBlockActive(editor, format);
  const isGroup = GROUP_TYPES.includes(format);
  const isAlignment = ALIGNMENT_TYPES.includes(format);

  if (isActive && !isGroup) {
    return;
  }

  if (isAlignment) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        ALIGNMENT_TYPES.includes(n.type),
      split: true,
    });
  }
  if (isGroup) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        GROUP_TYPES.includes(n.type),
      split: true,
    });
  }
  if (!isAlignment) {
    const newProperties: { type: ElementType } = {
      type: isActive ? "Paragraph" : isGroup ? itemType : format,
    };
    Transforms.setNodes(editor, newProperties);
  }

  if ((!isActive && isGroup) || isAlignment) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (
  editor: Editor,
  format: keyof TextStyleType,
  value: boolean = true
) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, value);
  }
};

export const isBlockActive = (editor: Editor, format: ElementType) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
  });

  return !!match;
};

export const isMarkActive = (editor: Editor, format: keyof TextStyleType) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const getActiveBlock = (editor: Editor, blocks: Array<ElementType>) => {
  var activeBlock;
  for (const block of blocks) {
    if (isBlockActive(editor, block)) {
      if (activeBlock) {
        return "Multiple";
      }
      activeBlock = block;
    }
  }
  return activeBlock;
};

export const getActiveStyles = (editor: Editor) => {
  return new Set(Object.keys(Editor.marks(editor) || {}));
};

export const getActiveFontSize = (editor: Editor) => {
  const marks = Editor.marks(editor);
  if (marks) {
    return marks.fontSize || DEFAULT_FONT_SIZE;
  }
  return DEFAULT_FONT_SIZE;
};

export const getActiveFontColor = (editor: Editor) => {
  const marks = Editor.marks(editor);
  if (marks) {
    return marks.color || DEFAULT_FONT_COLOR;
  }
  return DEFAULT_FONT_COLOR;
};

export function setLink(editor: Editor, url: string) {
  if (editor.selection) {
    removeLink(editor);

    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link: CustomElement = {
      type: "Link",
      url,
      children: isCollapsed ? [{ text: url }] : [],
    };

    if (isCollapsed) {
      Transforms.insertNodes(editor, link);
    } else {
      Transforms.wrapNodes(editor, link, { split: true });
      Transforms.collapse(editor, { edge: "end" });
    }
  }
}

export function removeLink(editor: Editor) {
  if (isBlockActive(editor, "Link")) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === "Link",
    });
  }
}

export function identifyLinksInTextIfAny(editor: Editor) {
  // if selection is not collapsed, we do not proceed with the link detection
  if (!editor.selection || !Range.isCollapsed(editor.selection)) {
    return;
  }

  const [node] = Editor.parent(editor, editor.selection);

  // if we are already inside a link, exit early.
  if (node.type === "Link") {
    return;
  }

  const [currentNode, currentNodePath] = Editor.node(editor, editor.selection);

  // if we are not inside a text node, exit early.
  if (!Text.isText(currentNode)) {
    return;
  }

  let start: BasePoint | undefined;
  [start] = Range.edges(editor.selection);
  const cursorPoint = start;

  const startPointOfLastCharacter = Editor.before(editor, editor.selection, {
    unit: "character",
  });

  // at beginning of document
  if (!startPointOfLastCharacter) {
    return;
  }

  const lastCharacter = Editor.string(
    editor,
    Editor.range(editor, startPointOfLastCharacter, cursorPoint)
  );

  if (lastCharacter !== " ") {
    return;
  }

  let end = startPointOfLastCharacter;
  start = Editor.before(editor, end, {
    unit: "character",
  });

  const startOfTextNode = Editor.point(editor, currentNodePath, {
    edge: "start",
  });

  while (
    start &&
    Editor.string(editor, Editor.range(editor, start, end)) !== " " &&
    !Point.isBefore(start, startOfTextNode)
  ) {
    end = start;
    start = Editor.before(editor, end, { unit: "character" });
  }

  const lastWordRange = Editor.range(editor, end, startPointOfLastCharacter);
  const lastWord = Editor.string(editor, lastWordRange);

  if (isUrl(lastWord)) {
    Promise.resolve().then(() => {
      Transforms.wrapNodes(
        editor,
        { type: "Link", url: lastWord, children: [{ text: lastWord }] },
        { split: true, at: lastWordRange }
      );
    });
  }
}

export function insertImage(editor: Editor, url: string) {
  const text = { text: "" };
  const image: CustomElement = {
    type: "Image",
    url: url,
    caption: "Image",
    height: 150,
    width: 150,
    style: {
      maxWidth: "100%",
      maxHeight: "20em",
      objectFit: "contain",
    },
    children: [text],
  };
  Transforms.insertNodes(editor, image);

  // if at end of editor, add a paragraph
  if (
    editor.selection &&
    !Editor.after(editor, editor.selection, { unit: "character" })
  ) {
    Transforms.insertNodes(editor, {
      type: "Paragraph",
      children: [{ text: "" }],
    });
  }
}

export function removeImage(editor: Editor) {
  if (isBlockActive(editor, "Image")) {
    const [location] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === "Image",
    });
    Transforms.removeNodes(editor, {
      at: location[1],
    });
  }
}

export const serialize = (node: Node): string => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.code) {
      string = `<code>${string}</code>`;
    }
    if (node.quote) {
      string = `<q>${string}</q>`;
    }
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<em>${string}</em>`;
    }
    if (node.underline) {
      string = `<u>${string}</u>`;
    }
    if (node.strike) {
      string = `<del>${string}</del>`;
    }
    if (node.highlight) {
      string = `<mark>${string}</mark>`;
    }
    const style: { "font-size": string | number; color: string } = {
      "font-size": DEFAULT_FONT_SIZE,
      color: DEFAULT_FONT_COLOR,
    };
    if (node.fontSize) {
      style["font-size"] = String(node.fontSize).endsWith("px")
        ? node.fontSize
        : String(node.fontSize) + "px";
    }
    if (node.color) {
      style["color"] = node.color;
    }
    const styleString = Object.entries(style).reduce(
      (style, [key, value]) => style + `${key}: ${value};`,
      ""
    );
    return `<span style="${styleString}">${string}</span>`;
  }

  const children = node.children
    ?.map((n: Descendant | CustomText) => serialize(n))
    .join("");

  switch (node.type) {
    case "Paragraph":
      return `<p>${children}</p>`;
    case "Quote Block":
      return `<blockquote class="editor-quote-block">${children}</blockquote>`;
    case "Code Block":
      return `<pre class="editor-code-block">${children}</pre>`;
    case "Ordered List":
      return `<ol>${children}</ol>`;
    case "Unordered List":
      return `<ul>${children}</ul>`;
    case "List Item":
      return `<li>${children}</li>`;
    case "Link":
      return `<a href="${escapeHtml(node.url)}">${children}</a>`;
    case "Image":
      return `<figure
        content-editable="false"
        class="editor-image-container"
      >
        <img
          src="${escapeHtml(node.url)}"
          alt="${escapeHtml(node.caption)}"
          width="${node.width}"
          height="${node.height}"
          class="editor-image"
        />
        <figcaption>${escapeHtml(node.caption)}</figcaption>
        ${children}
      </figure>`;
    case "Align Left":
      return `<div style="text-align: left;">${children}</div>`;
    case "Align Center":
      return `<div style="text-align: center;">${children}</div>`;
    case "Align Right":
      return `<div style="text-align: right;">${children}</div>`;
    case "Justify":
      return `<div style="text-align: justify;">${children}</div>`;
    default:
      return children || "";
  }
};

const ELEMENT_TAGS: Record<
  string,
  (el: HTMLElement) => CustomElement | undefined
> = {
  P: () => ({ type: "Paragraph" }),
  BLOCKQUOTE: () => ({ type: "Quote Block" }),
  PRE: () => ({ type: "Code Block" }),
  OL: () => ({ type: "Ordered List" }),
  UL: () => ({ type: "Unordered List" }),
  LI: () => ({ type: "List Item" }),
  A: (el: HTMLElement) => ({
    type: "Link",
    url: el.getAttribute("href") || undefined,
  }),
  IMG: (el: HTMLElement) => ({
    type: "Image",
    url: el.getAttribute("src") || undefined,
    caption: el.getAttribute("alt") || undefined,
    height: el.getAttribute("height") || undefined,
    width: el.getAttribute("width") || undefined,
    style: {
      maxWidth: "100%",
      maxHeight: "20em",
      objectFit: "contain",
    },
  }),
  FIGURE: (el: HTMLElement) => {
    const img = [...el.childNodes].find(
      (child) => child.nodeName === "IMG"
    ) as HTMLImageElement;
    return {
      type: "Image",
      url: img.getAttribute("src") || undefined,
      caption: img.getAttribute("alt") || undefined,
      height: img.getAttribute("height") || undefined,
      width: img.getAttribute("width") || undefined,
      style: {
        maxWidth: "100%",
        maxHeight: "20em",
        objectFit: "contain",
      },
    };
  },
  DIV: (el: HTMLElement) => {
    if (el.style?.textAlign) {
      switch (el.style.textAlign) {
        case "left":
          return { type: "Align Left" };
        case "center":
          return { type: "Align Center" };
        case "right":
          return { type: "Align Right" };
        case "justify":
          return { type: "Justify" };
        default:
          return;
      }
    }
  },
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS: Record<string, (el: HTMLElement) => CustomText> = {
  CODE: () => ({ code: true }),
  Q: () => ({ quote: true }),
  STRONG: () => ({ bold: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  U: () => ({ underline: true }),
  DEL: () => ({ strike: true }),
  S: () => ({ strike: true }),
  MARK: () => ({ highlight: true }),
  H1: () => ({ fontSize: 32, bold: true }),
  H2: () => ({ fontSize: 24, bold: true }),
  H3: () => ({ fontSize: 19, bold: true }),
  H4: () => ({ fontSize: 16, bold: true }),
  H5: () => ({ fontSize: 13, bold: true }),
  H6: () => ({ fontSize: 11, bold: true }),
  DIV: (el: HTMLElement) => ({
    fontSize: el.style?.fontSize
      ? el.style?.fontSize.replace("px", "")
      : DEFAULT_FONT_SIZE,
    color: el.style?.color || DEFAULT_FONT_COLOR,
  }),
  SPAN: (el: HTMLElement) => ({
    fontSize: el.style?.fontSize
      ? el.style?.fontSize.replace("px", "")
      : DEFAULT_FONT_SIZE,
    color: el.style?.color || DEFAULT_FONT_COLOR,
  }),
};

export const deserialize = (
  el: ChildNode
):
  | CustomElement
  | (string | Descendant | null)[]
  | CustomText
  | string
  | null => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;
  let parent = el;

  if (nodeName === "FIGURE") {
    const img = [...el.childNodes].find((child) => child.nodeName === "IMG");
    if (img) {
      parent = img as HTMLImageElement;
    }
  }

  let children = Array.from(parent.childNodes).map(deserialize).flat();

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el as HTMLElement);
    if (attrs) {
      return jsx("element", attrs, children);
    }
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el as HTMLElement);
    return (
      children
        // .filter((child) => Text.isText(child))
        .map((child) => jsx("text", attrs, child))
    );
  }

  return children;
};
