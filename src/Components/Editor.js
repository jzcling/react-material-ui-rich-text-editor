import { Editable, Slate, withReact } from "slate-react";
import { createEditor } from "slate";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import useEditorConfig from "../Hooks/useEditorConfig";
import useSelection from "../Hooks/useSelection";
import Toolbar from "./Toolbar";
import {
  deserialize,
  identifyLinksInTextIfAny,
  isImageNodeAtSelection,
  isLinkNodeAtSelection,
  serialize,
} from "../Utils/EditorUtils";
import LinkEditor from "./LinkEditor";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import ImageEditor from "./ImageEditor";
import { withHistory } from "slate-history";

const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid`,
    borderRadius: "4px",
    borderColor: "rgba(0, 0, 0, 0.23)",
    "&:hover": {
      borderColor: "rgba(0, 0, 0, 0.87)",
    },
    padding: "14px",
  },
  focus: {
    borderWidth: "2px",
    borderColor: theme.palette.primary.main,
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

var cancelBlur = false;

const initialDocument = [
  {
    type: "Paragraph",
    children: [{ text: "" }],
  },
];

export default function Editor(props) {
  const { html, document, onChange, onBlur, containerProps, editableProps } =
    props;
  const classes = useStyles();

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { renderElement, renderLeaf, onKeyDown } = useEditorConfig(editor);
  const [previousSelection, selection, setSelection] = useSelection(editor);

  const [selectionForLink, setSelectionForLink] = useState();
  const [selectionForImage, setSelectionForImage] = useState();

  const [focus, setFocus] = useState(false);

  const value = useMemo(() => {
    if (document) {
      return document;
    }
    if (html) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return deserialize(doc.body) || initialDocument;
    }
    return initialDocument;
  }, [html, document]);

  useEffect(() => {
    if (focus) {
      const sel = selection || previousSelection;
      if (isLinkNodeAtSelection(editor, sel)) {
        setSelectionForLink(sel);
      } else {
        setSelectionForLink(undefined);
      }

      if (isImageNodeAtSelection(editor, sel)) {
        setSelectionForImage(sel);
      } else {
        setSelectionForImage(undefined);
      }
    } else {
      setSelectionForImage(undefined);
      setSelectionForLink(undefined);
    }
  }, [editor, selection, previousSelection, focus]);

  const handleChange = useCallback(
    (document) => {
      onChange(document);
      setSelection(editor.selection);
      identifyLinksInTextIfAny(editor);
    },
    [editor, onChange, setSelection]
  );

  return (
    <Paper
      elevation={0}
      className={clsx({ [classes.focus]: focus }, classes.root)}
      onFocus={() => {
        cancelBlur = true;
        setFocus(true);
      }}
      onBlur={() => {
        cancelBlur = false;
        setTimeout(() => {
          if (!cancelBlur) {
            setFocus(false);
            const html = serialize(editor);
            onBlur(html);
          }
        }, 100);
      }}
      {...containerProps}
    >
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Toolbar selection={selection || previousSelection} disabled={!focus} />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          spellCheck
          {...editableProps}
        />

        <LinkEditor
          open={!!selectionForLink && focus}
          handleClose={() => setSelectionForLink(undefined)}
          selection={selectionForLink}
        />
        <ImageEditor
          open={!!selectionForImage && focus}
          handleClose={() => setSelectionForImage(undefined)}
          selection={selectionForImage}
        />
      </Slate>
    </Paper>
  );
}

Editor.defaultProps = {
  onChange: () => {},
  onBlur: (html) => {},
};

Editor.propTypes = {
  html: PropTypes.string,
  document: PropTypes.array,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  containerProps: PropTypes.object,
  editableProps: PropTypes.object,
};
