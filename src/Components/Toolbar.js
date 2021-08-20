import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import {
  ButtonGroup,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@material-ui/core";
import {
  CodeNotEqualVariant,
  CodeTags,
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuoteClose,
  FormatQuoteOpen,
  FormatStrikethroughVariant,
  FormatUnderline,
  HelpCircle,
  Image,
  Link,
  Marker,
} from "mdi-material-ui";
import PropTypes from "prop-types";
import {
  isImageNodeAtSelection,
  isLinkNodeAtSelection,
  toggleImageAtSelection,
  toggleLinkAtSelection,
  toggleBlock,
  toggleMark,
  getActiveStyles,
  getActiveBlock,
  getActiveFontSize,
} from "../Utils/EditorUtils";
import { ReactEditor, useSlate } from "slate-react";
import { Transforms } from "slate";
import isHotkey from "is-hotkey";

const CHARACTER_STYLES = [
  {
    style: "bold",
    label: "Bold",
    icon: <FormatBold />,
  },
  {
    style: "italic",
    label: "Italic",
    icon: <FormatItalic />,
  },
  {
    style: "underline",
    label: "Underline",
    icon: <FormatUnderline />,
  },
  {
    style: "strike",
    label: "Strikethrough",
    icon: <FormatStrikethroughVariant />,
  },
  {
    style: "highlight",
    label: "Highlight",
    icon: <Marker />,
  },
  {
    style: "code",
    label: "Code",
    icon: <CodeTags />,
  },
  {
    style: "quote",
    label: "Quote",
    icon: <FormatQuoteClose />,
  },
];

const GROUP_TYPES = [
  {
    style: "Ordered List",
    type: "List Item",
    icon: <FormatListNumbered />,
  },
  {
    style: "Unordered List",
    type: "List Item",
    icon: <FormatListBulleted />,
  },
  {
    style: "Quote Block",
    type: "Quote",
    icon: <FormatQuoteOpen />,
  },
  {
    style: "Code Block",
    type: "Code",
    icon: <CodeNotEqualVariant />,
  },
];

const TEXT_ALIGN_TYPES = [
  {
    style: "Align Left",
    icon: <FormatAlignLeft />,
  },
  {
    style: "Align Center",
    icon: <FormatAlignCenter />,
  },
  {
    style: "Align Right",
    icon: <FormatAlignRight />,
  },
  {
    style: "Justify",
    icon: <FormatAlignJustify />,
  },
  {
    style: "Multiple",
    icon: <HelpCircle />,
  },
];

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: "flex",
    alignItems: "center",
    overflow: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    marginBottom: theme.spacing(1),
  },
  active: {
    backgroundColor: theme.palette.primary.light,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  margin: {
    marginLeft: "2px",
  },
}));

export default function Toolbar(props) {
  const { selection, disabled } = props;
  const classes = useStyles();
  const editor = useSlate();

  var [fontSize, setFontSize] = useState();

  useEffect(() => {
    setFontSize(getActiveFontSize(editor));
  }, [editor, selection]);

  const [alignAnchorEl, setAlignAnchorEl] = useState();
  const activeTextAlign =
    TEXT_ALIGN_TYPES.find(
      (t) =>
        t.style ===
        getActiveBlock(
          editor,
          TEXT_ALIGN_TYPES.map((t) => t.style)
        )
    ) || TEXT_ALIGN_TYPES[0];

  const activeGroup =
    GROUP_TYPES.find(
      (t) =>
        t.style ===
        getActiveBlock(
          editor,
          GROUP_TYPES.map((t) => t.style)
        )
    ) || {};

  const handleCharacterStyleChange = useCallback(
    (style) => (event) => {
      event.preventDefault();
      if (!editor.selection) {
        Transforms.select(editor, selection);
      }
      toggleMark(editor, style);
    },
    [editor, selection]
  );

  const handleTextAlignChange = useCallback(
    (align) => (event) => {
      event.preventDefault();
      if (!editor.selection) {
        Transforms.select(editor, selection);
      }
      setAlignAnchorEl(undefined);
      toggleBlock(editor, align);
    },
    [editor, selection]
  );

  const handleGroupTypeChange = useCallback(
    (style, type) => (event) => {
      event.preventDefault();
      if (!editor.selection) {
        Transforms.select(editor, selection);
      }
      toggleBlock(editor, style, type);
    },
    [editor, selection]
  );

  const handleFontSizeChange = useCallback(
    (event) => {
      event.preventDefault();
      if (!editor.selection) {
        Transforms.select(editor, selection);
      }
      toggleMark(editor, "fontSize", event.target.value);
      setFontSize(event.target.value);
    },
    [editor, selection]
  );

  return (
    <div className={classes.toolbar}>
      <TextField
        id="editor-font-size"
        variant="outlined"
        margin="dense"
        label="Font Size"
        aria-label="font size"
        value={fontSize || ""}
        onChange={handleFontSizeChange}
        onKeyDown={(event) => {
          if (isHotkey("enter", { byKey: true }, event)) {
            handleFontSizeChange(event);
            ReactEditor.focus(editor);
          }
        }}
        inputProps={{
          type: "number",
        }}
        style={{ flexShrink: 0, width: "100px" }}
        disabled={disabled}
      />

      {CHARACTER_STYLES.map((style) => (
        <Tooltip title={style.label} key={style.style}>
          <span>
            <IconButton
              aria-label={style.label}
              className={clsx(classes.margin, {
                [classes.active]: getActiveStyles(editor).has(style.style),
              })}
              disabled={disabled}
              // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
              // onClick will cause users to lose focus on selection
              onMouseDown={handleCharacterStyleChange(style.style)}
            >
              {style.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}

      <Divider orientation="vertical" flexItem style={{ margin: "0 8px" }} />

      <Tooltip title={activeTextAlign.style}>
        <span>
          <IconButton
            aria-label={activeTextAlign.style}
            className={classes.active}
            disabled={disabled}
            onMouseDown={(event) => setAlignAnchorEl(event.currentTarget)}
          >
            {activeTextAlign.icon}
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        id="block-align-menu"
        open={Boolean(alignAnchorEl)}
        onClose={() => setAlignAnchorEl(undefined)}
        anchorEl={alignAnchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {TEXT_ALIGN_TYPES.map((type) => {
          if (["Multiple"].includes(type.style)) {
            return null;
          }
          return (
            <MenuItem
              key={type.style}
              onMouseDown={handleTextAlignChange(type.style)}
            >
              <ListItemIcon>{type.icon}</ListItemIcon>
              <ListItemText primary={type.style} />
            </MenuItem>
          );
        })}
      </Menu>

      <ButtonGroup aria-label="group types" disabled={disabled}>
        {GROUP_TYPES.map((type) => (
          <Tooltip title={type.style} key={type.style}>
            <span>
              <IconButton
                aria-label={type.style}
                className={clsx(classes.margin, {
                  [classes.active]: activeGroup.style === type.style,
                })}
                // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
                // onClick will cause users to lose focus on selection
                onMouseDown={handleGroupTypeChange(type.style, type.type)}
              >
                {type.icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
      </ButtonGroup>

      <Divider orientation="vertical" flexItem style={{ margin: "0 8px" }} />

      <Tooltip title="Link">
        <span>
          <IconButton
            aria-label="link"
            className={clsx(classes.margin, {
              [classes.active]: isLinkNodeAtSelection(editor, editor.selection),
            })}
            disabled={disabled}
            onMouseDown={() => toggleLinkAtSelection(editor)}
          >
            <Link />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Image">
        <span>
          <IconButton
            aria-label="image"
            className={clsx(classes.margin, {
              [classes.active]: isImageNodeAtSelection(
                editor,
                editor.selection
              ),
            })}
            disabled={disabled}
            onMouseDown={() => toggleImageAtSelection(editor)}
          >
            <Image />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
}

Toolbar.defaultProps = {
  selection: undefined,
  disabled: true,
};

Toolbar.propTypes = {
  selection: PropTypes.object,
  disabled: PropTypes.bool,
};
