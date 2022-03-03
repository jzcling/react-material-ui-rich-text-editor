import { Editable, Slate, withReact } from "slate-react";
import { createEditor } from "slate";
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useEditorConfig from "../Hooks/useEditorConfig";
import useSelection from "../Hooks/useSelection";
import Toolbar from "./Toolbar";
import {
  deserialize,
  identifyLinksInTextIfAny,
  serialize,
} from "../Utils/EditorUtils";
import LinkEditor from "./LinkEditor";
import { ClickAwayListener, debounce, Paper } from "@mui/material";
import ImageEditor from "./ImageEditor";
import { withHistory } from "slate-history";
import { withHtml } from "../Plugins/withHtml";
import { withShortcuts } from "../Plugins/withShortcuts";

const initialValue = [
  {
    type: "Paragraph",
    children: [{ text: "" }],
  },
];

function getValue(html) {
  if (!html) return initialValue;
  const parsed = new DOMParser().parseFromString(html, "text/html");
  return deserialize(parsed.body);
}

export default function Editor(props) {
  const { html, updateHtml, containerProps, editableProps } = props;

  const editorRef = useRef();
  if (!editorRef.current)
    editorRef.current = withShortcuts(
      withHtml(withReact(withHistory(createEditor())))
    );
  const editor = editorRef.current;

  const { renderElement, renderLeaf, onKeyDown } = useEditorConfig(editor);

  const [previousSelection, selection, setSelection] = useSelection(editor);
  const [openLinkEditor, setOpenLinkEditor] = useState(false);
  const [openImageEditor, setOpenImageEditor] = useState(false);

  const [focus, setFocus] = useState(false);

  const [value, setValue] = useState(() => getValue(html));

  useEffect(() => {
    const value = getValue(html);
    editor.children = value;
    setValue(value);
  }, [html]);

  const debouncedUpdateHtml = useMemo(
    () =>
      debounce((editor) => {
        const html = serialize(editor);
        updateHtml(html);
      }, 700),
    [updateHtml]
  );

  const handleChange = (value) => {
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

Editor.defaultProps = {
  updateHtml: (html) => {},
};

Editor.propTypes = {
  html: PropTypes.string,
  updateHtml: PropTypes.func,
  containerProps: PropTypes.object,
  editableProps: PropTypes.object,
};
