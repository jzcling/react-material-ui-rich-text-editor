import isUrl from "is-url";
import { Editor, Element, Point, Range, Text, Transforms } from "slate";
import escapeHtml from "escape-html";
import { jsx } from "slate-hyperscript";

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

export const getActiveFontColor = (editor) => {
  const marks = Editor.marks(editor);
  if (marks) {
    return marks.color || "#181d23";
  }
  return "#181d23";
};

export function isLinkActive(editor) {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "Link",
  });
  return !!link;
}

export function setLink(editor, url) {
  if (editor.selection) {
    removeLink(editor);

    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link = {
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

export function removeLink(editor) {
  if (isLinkActive(editor)) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === "Link",
    });
  }
}

export function identifyLinksInTextIfAny(editor) {
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
    const style = {
      "font-size": "16px",
      color: "#181d23",
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
      return `<span 
        content-editable="false" 
        style="display: flex;flex-direction: column;justify-content: center;align-items: center;"
      >
        <img 
          src="${escapeHtml(node.url)}" 
          alt="${escapeHtml(node.caption)}" 
          width="${node.width}" 
          height="${node.height}" 
        />
        <span>${escapeHtml(node.caption)}</span>
        ${children}
      </span>`;
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

export const deserialize = (el) => {
  if (el.nodeType === 3) {
    return jsx("text", { fontSize: 16 }, [el.textContent]);
  } else if (el.nodeType !== 1) {
    return null;
  }

  let children = Array.from(el.childNodes).map(deserialize);

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  switch (el.nodeName) {
    case "BODY":
      if (el.firstChild && el.firstChild.nodeType === 3) {
        return [jsx("element", { type: "Paragraph" }, children)];
      } else {
        return jsx("fragment", {}, children);
      }
    case "BR":
      return "\n";
    case "P":
      return jsx("element", { type: "Paragraph" }, children);
    case "BLOCKQUOTE":
      return jsx("element", { type: "Quote Block" }, children);
    case "Q":
      return jsx("element", { type: "Quote" }, children);
    case "PRE":
      if (el.hasChildNodes() && el.firstChild.nodeName === "CODE") {
        return jsx("element", { type: "Code Block" }, children);
      }
      return el.textContent;
    case "CODE":
      return jsx("element", { type: "Code" }, children);
    case "OL":
      return jsx("element", { type: "Ordered List" }, children);
    case "UL":
      return jsx("element", { type: "Unordered List" }, children);
    case "LI":
      return jsx("element", { type: "List Item" }, children);
    case "A":
      return jsx(
        "element",
        {
          type: "Link",
          url: el.getAttribute("href"),
        },
        children
      );
    case "IMG":
      return jsx(
        "element",
        {
          type: "Image",
          url: el.getAttribute("src"),
          caption: el.getAttribute("alt"),
          height: el.getAttribute("height"),
          width: el.getAttribute("width"),
        },
        children
      );
    case "DIV":
      if (el.style && el.style.textAlign) {
        switch (el.style.textAlign) {
          case "left":
            return jsx("element", { type: "Align Left" }, children);
          case "center":
            return jsx("element", { type: "Align Center" }, children);
          case "right":
            return jsx("element", { type: "Align Left" }, children);
          case "justify":
            return jsx("element", { type: "Justify" }, children);
          default:
            return el.textContent;
        }
      }
      return el.textContent;
    case "STRONG":
      return jsx("text", { bold: true }, children);
    case "EM":
      return jsx("text", { italic: true }, children);
    case "U":
      return jsx("text", { underline: true }, children);
    case "DEL":
      return jsx("text", { strike: true }, children);
    case "MARK":
      return jsx("text", { highlight: true }, children);
    case "SPAN":
      if (el.style) {
        const style = {
          fontSize: 16,
        };
        if (el.style.fontSize) {
          style.fontSize = parseInt(
            String(el.style.fontSize).replace("px", "")
          );
        }
        if (el.style.color) {
          style.color = el.style.color;
        }
        return jsx("text", style, children);
      }
      if (el.childNodes.length > 0) {
        if (
          el.childNodes[0].nodeName === "IMG" &&
          el.childNodes[1].nodeName === "SPAN"
        ) {
          const img = el.childNodes[0];
          return jsx(
            "element",
            {
              type: "Image",
              url: img.getAttribute("src"),
              caption: img.getAttribute("alt"),
              height: img.getAttribute("height"),
              width: img.getAttribute("width"),
            },
            [{ text: "" }]
          );
        }
      }
      return jsx("text", { fontSize: 16 }, children);
    default:
      return jsx("text", { fontSize: 16 }, children);
  }
};
