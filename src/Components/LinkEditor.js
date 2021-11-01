import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import isUrl from "is-url";
import React, { useEffect, useMemo, useState } from "react";
import { Editor, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import PropTypes from "prop-types";

export default function LinkEditor(props) {
  const { open, handleClose, selection } = props;
  const editor = useSlateStatic();

  const [error, setError] = useState();

  const [node, path] = useMemo(
    () =>
      Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "Link",
      }) || [],
    [editor, selection]
  );

  const onLinkURLChange = (event) =>
    Transforms.setNodes(editor, { url: event.target.value }, { at: path });

  useEffect(() => {
    if (!isUrl((node || {}).url)) {
      setError("Invalid link");
    } else {
      setError(undefined);
    }
  }, [node]);

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
          margin="dense"
          label="URL"
          aria-label="url"
          variant="outlined"
          value={(node || {}).url || ""}
          onChange={onLinkURLChange}
          error={!!error}
          helperText={error}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LinkEditor.defaultProps = {
  open: false,
  handleClose: () => {},
  selection: null,
};

LinkEditor.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  selection: PropTypes.object,
};
