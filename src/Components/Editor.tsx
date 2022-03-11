import React, { useEffect, useMemo, useRef, useState } from "react";
import { createEditor, Descendant, Editor as SlateEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import { EditableProps } from "slate-react/dist/components/editable";

import { ClickAwayListener, debounce, Paper, PaperProps } from "@mui/material";

import useEditorConfig from "../hooks/useEditorConfig";
import useSelection from "../hooks/useSelection";
import { withHtml } from "../plugins/withHtml";
import { withShortcuts } from "../plugins/withShortcuts";
import { deserialize, identifyLinksInTextIfAny, serialize } from "../utils/EditorUtils";
import ImageEditor from "./ImageEditor";
import LinkEditor from "./LinkEditor";
import Toolbar from "./Toolbar";

const initialValue = [
  {
    type: "Paragraph",
    children: [{ text: "" }],
  },
];

function getValue(html: string) {
  if (!html) return initialValue;
  const parsed = new DOMParser().parseFromString(html, "text/html");
  return deserialize(parsed.body);
}

export interface EditorProps {
  html: string;
  updateHtml: (html: string) => void;
  containerProps: PaperProps;
  editableProps: EditableProps;
}

export default function Editor(props: EditorProps) {
  const { html, updateHtml, containerProps, editableProps } = props;

  const editorRef = useRef<SlateEditor>();
  if (!editorRef.current) {
    editorRef.current = withShortcuts(
      withHtml(withReact(withHistory(createEditor())))
    );
  }
  const editor = editorRef.current;

  const { renderElement, renderLeaf, onKeyDown } = useEditorConfig(editor);

  const [previousSelection, selection, setSelection] = useSelection(editor);
  const [openLinkEditor, setOpenLinkEditor] = useState(false);
  const [openImageEditor, setOpenImageEditor] = useState(false);

  const [focus, setFocus] = useState(false);

  const [value, setValue] = useState(() => getValue(html));

  useEffect(() => {
    if (editor) {
      const value = getValue(html);
      editor.children = value;
      setValue(value);
    }
  }, [html]);

  const debouncedUpdateHtml = useMemo(
    () =>
      debounce((editor: SlateEditor) => {
        const html = serialize(editor);
        updateHtml(html);
      }, 700),
    [updateHtml]
  );

  if (!editor) {
    return null;
  }

  const handleChange = (value: Descendant[]): void => {
    setValue(value);
    debouncedUpdateHtml(editor);
    setSelection(editor.selection);
    identifyLinksInTextIfAny(editor);
  };

  return (
    <Slate editor={editor} value={value} onChange={handleChange}>
      <ClickAwayListener onClickAway={() => setFocus(false)}>
        <Paper
          elevation={0}
          sx={{
            border: focus ? "2px solid" : "1px solid",
            borderRadius: "4px",
            borderColor: (theme) =>
              focus ? theme.palette.primary.main : "rgba(0, 0, 0, 0.23)",
            "&:hover": {
              borderColor: (theme) => theme.palette.primary.main,
            },
            padding: "14px",
          }}
          onFocus={() => {
            setFocus(true);
          }}
          {...containerProps}
        >
          <Toolbar
            selection={selection || previousSelection}
            disabled={!focus}
            setOpenLinkEditor={setOpenLinkEditor}
            setOpenImageEditor={setOpenImageEditor}
          />
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={onKeyDown}
            spellCheck
            onBlur={(e) => e.preventDefault()} // This prevents selection from losing highlight when clicking on toolbar buttons
            {...editableProps}
          />

          <LinkEditor
            open={openLinkEditor && focus}
            handleClose={() => setOpenLinkEditor(false)}
          />
          <ImageEditor
            open={openImageEditor && focus}
            handleClose={() => setOpenImageEditor(false)}
          />
        </Paper>
      </ClickAwayListener>
    </Slate>
  );
}
