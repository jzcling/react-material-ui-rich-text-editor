import { Editable, Slate, withReact } from "slate-react";
import { createEditor } from "slate";
import React, { useMemo, useRef, useState } from "react";
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
import { withHtml } from "../Utils/PasteUtils";

const initialValue = [
  {
    type: "Paragraph",
    children: [{ text: "" }],
  },
];

export default function Editor(props) {
  const { html, updateHtml, containerProps, editableProps } = props;

  const editorRef = useRef();
  if (!editorRef.current)
    editorRef.current = withHtml(withReact(withHistory(createEditor())));
  const editor = editorRef.current;

  const { renderElement, renderLeaf, onKeyDown } = useEditorConfig(editor);

  const [previousSelection, selection, setSelection] = useSelection(editor);

  const [openLinkEditor, setOpenLinkEditor] = useState(false);
  const [openImageEditor, setOpenImageEditor] = useState(false);

  const [focus, setFocus] = useState(false);

  const [value, setValue] = useState(() => {
    if (!html) return initialValue;
    const parsed = new DOMParser().parseFromString(html, "text/html");
    return deserialize(parsed.body);
  });

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
            {...editableProps}
          />

          <LinkEditor
            open={openLinkEditor && focus}
            handleClose={() => setOpenLinkEditor(false)}
            editor={editor}
          />
          <ImageEditor
            open={openImageEditor && focus}
            handleClose={() => setOpenImageEditor(false)}
            editor={editor}
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
