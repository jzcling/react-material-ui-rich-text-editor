import { Editable, Slate, withReact } from "slate-react";
import { createEditor } from "slate";
import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import useEditorConfig from "../Hooks/useEditorConfig";
import useSelection from "../Hooks/useSelection";
import Toolbar from "./Toolbar";
import {
  identifyLinksInTextIfAny,
  isImageNodeAtSelection,
  isLinkNodeAtSelection,
  serialize,
} from "../Utils/EditorUtils";
import LinkEditor from "./LinkEditor";
import { makeStyles, Paper } from "@material-ui/core";
import clsx from "clsx";
import ImageEditor from "./ImageEditor";
import _ from "lodash";

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

export default function Editor(props) {
  const { document, onChange, onBlur } = props;
  const classes = useStyles();

  const [editor] = useState(withReact(createEditor()));
  const { renderElement, renderLeaf, onKeyDown } = useEditorConfig(editor);
  const [previousSelection, selection, setSelection] = useSelection(editor);

  const [selectionForLink, setSelectionForLink] = useState();
  const [selectionForImage, setSelectionForImage] = useState();

  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (focus) {
      if (isLinkNodeAtSelection(editor, selection)) {
        setSelectionForLink(selection);
      } else if (
        !selection &&
        isLinkNodeAtSelection(editor, previousSelection)
      ) {
        setSelectionForLink(previousSelection);
      } else {
        setSelectionForLink(undefined);
      }

      if (isImageNodeAtSelection(editor, selection)) {
        setSelectionForImage(selection);
      } else if (
        !selection &&
        isImageNodeAtSelection(editor, previousSelection)
      ) {
        setSelectionForImage(previousSelection);
      } else {
        setSelectionForImage(undefined);
      }
    } else {
      setSelectionForImage(undefined);
      setSelectionForLink(undefined);
    }
  }, [editor, selection, previousSelection]);

  const handleChange = useCallback(
    (document) => {
      console.log(document);
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
            onBlur();
          }
        }, 100);
      }}
    >
      <Slate editor={editor} value={document} onChange={handleChange}>
        <Toolbar selection={selection || previousSelection} disabled={!focus} />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          spellCheck
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
  document: [
    {
      type: "Paragraph",
      children: [{ text: "Rich Text" }],
    },
  ],
  onChange: () => {},
  onBlur: () => {},
};

Editor.propTypes = {
  document: PropTypes.array,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};
