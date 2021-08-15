import { Fade, Grid, makeStyles, Paper, TextField } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { Editor, Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1, 2),
    position: "absolute",
    maxWidth: "500px",
    zIndex: 1201,

    [theme.breakpoints.only("xs")]: {
      maxWidth: "300px",
    },
  },
}));

export default function ImageEditor(props) {
  const { open, handleClose, selection } = props;
  const editor = useSlateStatic();
  const classes = useStyles();

  const [error, setError] = useState();

  const [node, path] =
    Editor.above(editor, {
      at: selection,
      match: (n) => n.type === "Image",
    }) || [];

  const domNode = useMemo(() => {
    if (node) {
      try {
        return ReactEditor.toDOMNode(editor, node);
      } catch (error) {
        return undefined;
      }
    }
  }, [node]);

  const {
    x: nodeX,
    y: nodeY,
    height: nodeHeight,
  } = useMemo(() => {
    if (domNode) {
      return domNode.getBoundingClientRect();
    }
    return {};
  }, [domNode]);

  const [state, setState] = useState();
  const [top, setTop] = useState();
  const [left, setLeft] = useState();

  useEffect(() => {
    if (state === "entered") {
      return;
    }

    setTop(Number(nodeY || 0) + Number(nodeHeight || 0) + 2);
    setLeft(Number(nodeX || 0));
  }, [state, nodeY, nodeHeight, nodeX]);

  const onImageInputChange = (key) => (event) =>
    Transforms.setNodes(editor, { [key]: event.target.value }, { at: path });

  return (
    <Fade
      in={open}
      onEntered={() => setState("entered")}
      onExited={() => setState("exited")}
      mountOnEnter
      unmountOnExit
    >
      <Paper
        onBlur={handleClose}
        className={classes.root}
        style={{
          top: top,
          left: left,
        }}
      >
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
      </Paper>
    </Fade>
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
