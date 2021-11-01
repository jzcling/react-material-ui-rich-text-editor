import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import React from "react";
import { Editor, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import PropTypes from "prop-types";

export default function ImageEditor(props) {
  const { open, handleClose, selection } = props;
  const editor = useSlateStatic();

  const [node, path] =
    Editor.above(editor, {
      at: selection,
      match: (n) => n.type === "Image",
    }) || [];

  const onImageInputChange = (key) => (event) =>
    Transforms.setNodes(editor, { [key]: event.target.value }, { at: path });

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
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={12}>
            <TextField
              id="image-editor-url"
              margin="dense"
              fullWidth
              label="URL"
              aria-label="url"
              variant="outlined"
              value={(node || {}).url || ""}
              onChange={onImageInputChange("url")}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="image-editor-caption"
              margin="dense"
              fullWidth
              label="Caption"
              aria-label="caption"
              variant="outlined"
              value={(node || {}).caption || ""}
              onChange={onImageInputChange("caption")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="image-editor-width"
              margin="dense"
              fullWidth
              label="Width"
              aria-label="width"
              variant="outlined"
              value={(node || {}).width || ""}
              onChange={onImageInputChange("width")}
              props={{
                type: "number",
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="image-editor-height"
              margin="dense"
              fullWidth
              label="Height"
              aria-label="height"
              variant="outlined"
              value={(node || {}).height || ""}
              onChange={onImageInputChange("height")}
              props={{
                type: "number",
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ImageEditor.defaultProps = {
  open: false,
  handleClose: () => {},
  selection: null,
};

ImageEditor.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  selection: PropTypes.object,
};
