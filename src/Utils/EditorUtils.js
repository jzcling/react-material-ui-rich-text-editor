import isUrl from "is-url";
import { Editor, Element, Point, Range, Text, Transforms } from "slate";
import escapeHtml from "escape-html";

export const GROUP_TYPES = [
  "Ordered List",
  "Unordered List",
  "Code Block",
  "Quote Block",
];
export const ALIGNMENT_TYPES = [
  "Align Left",
  "Align Center",
  "Align Right",
  "Justify",
];

export const toggleBlock = (editor, format, itemType) => {
  const isActive = isBlockActive(editor, format);
  const isGroup = GROUP_TYPES.includes(format);
  const isAlignment = ALIGNMENT_TYPES.includes(format);

  if (isActive && !isGroup) {
    return;
  }

  if (isAlignment) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        ALIGNMENT_TYPES.includes(
          !Editor.isEditor(n) && Element.isElement(n) && n.type
        ),
      split: true,
    });
  }
  if (isGroup) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        GROUP_TYPES.includes(
          !Editor.isEditor(n) && Element.isElement(n) && n.type
        ),
      split: true,
    });
  }
  if (!isAlignment) {
    const newProperties = {
      type: isActive ? "Paragraph" : isGroup ? itemType : format,
    };
    Transforms.setNodes(editor, newProperties);
  }

  if ((!isActive && isGroup) || isAlignment) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor, format, value = true) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, value);
  }
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
  });

  return !!match;
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const getActiveBlock = (editor, blocks) => {
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

export const getActiveStyles = (editor) => {
  return new Set(Object.keys(Editor.marks(editor) || {}));
};

export const getActiveFontSize = (editor) => {
  const marks = Editor.marks(editor);
  if (marks) {
    return marks.fontSize || 16;
  }
  return 16;
};

export function isLinkNodeAtSelection(editor, selection) {
  if (!selection) {
    return false;
  }

  return !!Editor.above(editor, {
    at: selection,
    match: (n) => n.type === "Link",
  });
}

export function toggleLinkAtSelection(editor) {
  if (!isLinkNodeAtSelection(editor, editor.selection)) {
    // const isSelectionCollapsed = Range.isCollapsed(editor.selection);
    // if (isSelectionCollapsed) {
    //   Transforms.insertNodes(
    //     editor,
    //     {
    //       type: "Link",
    //       url: "",
    //       children: [{ text: "Link" }],
    //     },
    //     { at: editor.selection }
    //   );
    // } else {
    Transforms.wrapNodes(
      editor,
      { type: "Link", url: "", children: [] },
      { split: true, at: editor.selection }
    );
    // }
  } else {
    Transforms.unwrapNodes(editor, {
      match: (n) => Element.isElement(n) && n.type === "Link",
    });
  }
}

export function identifyLinksInTextIfAny(editor) {
  // if selection is not collapsed, we do not proceed with the link detection
  if (!editor.selection || !Range.isCollapsed(editor.selection)) {
    return;
  }

  const [node, _] = Editor.parent(editor, editor.selection);

  // if we are already inside a link, exit early.
  if (node.type === "Link") {
    return;
  }

  const [currentNode, currentNodePath] = Editor.node(editor, editor.selection);

  // if we are not inside a text node, exit early.
  if (!Text.isText(currentNode)) {
    return;
  }

  let [start] = Range.edges(editor.selection);
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

export function isImageNodeAtSelection(editor, selection) {
  if (!selection) {
    return false;
  }

  return !!Editor.above(editor, {
    at: selection,
    match: (n) => n.type === "Image",
  });
}

export function toggleImageAtSelection(editor) {
  if (!isImageNodeAtSelection(editor, editor.selection)) {
    const isSelectionCollapsed = Range.isCollapsed(editor.selection);
    if (isSelectionCollapsed) {
      Transforms.insertNodes(
        editor,
        {
          type: "Image",
          url: "https://via.placeholder.com/150",
          caption: "Image",
          height: 150,
          width: 150,
          style: {
            objectFit: "contain",
          },
          children: [],
        },
        { at: editor.selection }
      );
    } else {
      Transforms.wrapNodes(
        editor,
        {
          type: "Image",
          url: "https://via.placeholder.com/150",
          caption: "Image",
          height: 150,
          width: 150,
          style: {
            objectFit: "contain",
          },
          children: [],
        },
        { split: true, at: editor.selection }
      );
    }
  } else {
    Transforms.unwrapNodes(editor, {
      match: (n) => Element.isElement(n) && n.type === "Link",
    });
  }
}

export const serialize = (node) => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
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
    if (node.code) {
      string = `<code>${string}</code>`;
    }
    if (node.quote) {
      string = `<q>${string}</q>`;
    }
    if (node.fontSize) {
      string = `<span style="font-size: ${node.fontSize}px;">${string}</span>`;
    }
    return string;
  }

  const children = node.children.map((n) => serialize(n)).join("");

  switch (node.type) {
    case "Paragraph":
      return `<p>${children}</p>`;
    case "Quote Block":
      return `<blockquote>${children}</blockquote>`;
    case "Quote":
      return `<q>${children}</q>`;
    case "Code Block":
      return `<pre style="background-color: #eee;border: 1px solid #999;border-radius: 4px;display: block;padding: 8px 16px;">${children}</pre>`;
    case "Code":
      return `<code>${children}</code>`;
    case "Ordered List":
      return `<ol>${children}</ol>`;
    case "Unordered List":
      return `<ul>${children}</ul>`;
    case "List Item":
      return `<li>${children}</li>`;
    case "Link":
      return `<a href="${escapeHtml(node.url)}">${children}</a>`;
    case "Image":
      return `<span content-editable="false" style="display: flex;flex-direction: column;justify-content: center;align-items: center;"><img src="${escapeHtml(
        node.url
      )}" alt="${escapeHtml(node.caption)}" width="${node.width}" height="${
        node.height
      }" /><span>${escapeHtml(node.caption)}</span>${children}</span>`;
    case "Align Left":
      return `<div style="text-align: left;">${children}</div>`;
    case "Align Center":
      return `<div style="text-align: center;">${children}</div>`;
    case "Align Right":
      return `<div style="text-align: right;">${children}</div>`;
    case "Justify":
      return `<div style="text-align: justify;">${children}</div>`;
    default:
      return children;
  }
};
