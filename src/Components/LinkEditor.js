import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import isUrl from "is-url";
import React, { useState } from "react";
import { Editor, Element } from "slate";
import PropTypes from "prop-types";
import { removeLink, setLink } from "../Utils/EditorUtils";
import { useSlateStatic } from "slate-react";

export default function LinkEditor(props) {
  const { open, handleClose } = props;
  const editor = useSlateStatic();

  const [error, setError] = useState();

  const [location] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "Link",
  });

  const onLinkURLChange = (event) => {
    const link = event.target.value;
    if (!isUrl(link)) {
      setError("Invalid link");
    } else {
      setError();
    }
    setLink(editor, link);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="link-dialog-title"
    >
      <DialogTitle id="link-dialog-title">Link</DialogTitle>
      <DialogContent>
        <TextField
          id="link-editor"
          size="small"
          label="URL"
          aria-label="url"
          variant="outlined"
          value={location?.[0]?.url || ""}
          onChange={onLinkURLChange}
          error={!!error}
          helperText={error}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            removeLink(editor);
            handleClose();
          }}
          color="secondary"
        >
          Remove
        </Button>
        <Button onClick={handleClose} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LinkEditor.defaultProps = {
  open: false,
  handleClose: () => {},
  editor: null,
  selection: null,
};

LinkEditor.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  editor: PropTypes.object,
  selection: PropTypes.object,
};
