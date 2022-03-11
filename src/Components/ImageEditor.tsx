import PropTypes from "prop-types";
import React from "react";
import { Editor, Element, Transforms } from "slate";
import { useSlateStatic } from "slate-react";

import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField
} from "@mui/material";

import { CustomElement } from "../hooks/useEditorConfig";
import { removeImage } from "../utils/EditorUtils";

interface Props {
  open: boolean;
  handleClose: () => void;
}

export default function ImageEditor(props: Props) {
  const { open, handleClose } = props;
  const editor = useSlateStatic();

  const [location] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "Image",
  });

  const onImageInputChange =
    (
      key: string
    ):
      | React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
      | undefined =>
    (event) =>
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
              value={(location?.[0] as CustomElement)?.url || ""}
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
              value={(location?.[0] as CustomElement)?.caption || ""}
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
              value={(location?.[0] as CustomElement)?.width || ""}
              onChange={onImageInputChange("width")}
              type="number"
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
              value={(location?.[0] as CustomElement)?.height || ""}
              onChange={onImageInputChange("height")}
              type="number"
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
