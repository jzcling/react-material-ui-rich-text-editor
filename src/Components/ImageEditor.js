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
import { Editor, Element, Transforms } from "slate";
import PropTypes from "prop-types";
import { removeImage } from "../Utils/EditorUtils";

export default function ImageEditor(props) {
  const { open, handleClose, editor } = props;

  const [location] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "Image",
  });

  const onImageInputChange = (key) => (event) =>
    Transforms.setNodes(
      editor,
      { [key]: event.target.value },
      { at: location[1] }
    );

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
              size="small"
              fullWidth
              label="URL"
              aria-label="url"
              variant="outlined"
              value={location?.[0]?.url || ""}
              onChange={onImageInputChange("url")}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="image-editor-caption"
              size="small"
              fullWidth
              label="Caption"
              aria-label="caption"
              variant="outlined"
              value={location?.[0]?.caption || ""}
              onChange={onImageInputChange("caption")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="image-editor-width"
              size="small"
              fullWidth
              label="Width"
              aria-label="width"
              variant="outlined"
              value={location?.[0]?.width || ""}
              onChange={onImageInputChange("width")}
              props={{
                type: "number",
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="image-editor-height"
              size="small"
              fullWidth
              label="Height"
              aria-label="height"
              variant="outlined"
              value={location?.[0]?.height || ""}
              onChange={onImageInputChange("height")}
              props={{
                type: "number",
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            removeImage(editor);
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

ImageEditor.defaultProps = {
  open: false,
  handleClose: () => {},
  editor: null,
};

ImageEditor.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  editor: PropTypes.object,
};
