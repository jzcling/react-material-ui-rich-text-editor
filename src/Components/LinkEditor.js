import { Fade, Grow, makeStyles, Paper, TextField } from "@material-ui/core";
import isUrl from "is-url";
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

export default function LinkEditor(props) {
  const { open, handleClose, selection } = props;
  const editor = useSlateStatic();
  const classes = useStyles();

  const [error, setError] = useState();

  const [node, path] = useMemo(
    () =>
      Editor.above(editor, {
        at: selection,
        match: (n) => n.type === "Link",
      }) || [],
    [editor, selection]
  );

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

  const onLinkURLChange = (event) =>
    Transforms.setNodes(editor, { url: event.target.value }, { at: path });

  useEffect(() => {
    if (!isUrl((domNode || {}).url)) {
      setError("Invalid link");
    } else {
      setError(undefined);
    }
  }, [domNode]);

  return (
    <Grow
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
        />
      </Paper>
    </Grow>
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
