import React, { useCallback, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import {
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  TextField,
  Tooltip,
} from "@mui/material";
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
  getActiveFontColor,
} from "../Utils/EditorUtils";
import { ReactEditor, useSlate } from "slate-react";
import { Editor, Transforms } from "slate";
import isHotkey from "is-hotkey";
import { CompactPicker } from "react-color";
import {
  BorderColor,
  Code,
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatUnderlined,
  Help,
  Image,
  Link,
  StrikethroughS,
} from "@mui/icons-material";

const PREFIX = "Toolbar";

const classes = {
  toolbar: `${PREFIX}-toolbar`,
  active: `${PREFIX}-active`,
  margin: `${PREFIX}-margin`,
  groupedButton: `${PREFIX}-groupedButton`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.toolbar}`]: {
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

  [`& .${classes.active}`]: {
    backgroundColor: theme.palette.primary.light,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },

  [`& .${classes.margin}`]: {
    marginLeft: "2px",
  },

  [`& .${classes.groupedButton}`]: {
    padding: "12px",
    borderRadius: "50%",
  },
}));

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
    icon: <FormatUnderlined />,
  },
  {
    style: "strike",
    label: "Strikethrough",
    icon: <StrikethroughS />,
  },
  {
    style: "highlight",
    label: "Highlight",
    icon: <BorderColor />,
  },
  {
    style: "code",
    label: "Code",
    icon: <Code />,
  },
  {
    style: "quote",
    label: "Quote",
    icon: <FormatQuote />,
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
    icon: <FormatQuote />,
  },
  {
    style: "Code Block",
    type: "Code",
    icon: <Code />,
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
    icon: <Help />,
  },
];

export default function Toolbar(props) {
  const { selection, disabled } = props;

  const editor = useSlate();

  var [fontSize, setFontSize] = useState();
  var [fontColor, setFontColor] = useState();
  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    setFontSize(getActiveFontSize(editor));
  }, [editor, selection]);

  useEffect(() => {
    setFontColor(getActiveFontColor(editor));
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
        Transforms.select(
          editor,
          selection || {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          }
        );
      }
      toggleMark(editor, style);
    },
    [editor, selection]
  );

  const handleTextAlignChange = useCallback(
    (align) => (event) => {
      event.preventDefault();
      if (!editor.selection) {
        Transforms.select(
          editor,
          selection || {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          }
        );
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
        Transforms.select(
          editor,
          selection || {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          }
        );
      }
      toggleBlock(editor, style, type);
    },
    [editor, selection]
  );

  const handleFontSizeChange = useCallback(
    (event) => {
      event.preventDefault();
      if (!editor.selection) {
        Transforms.select(
          editor,
          selection || {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          }
        );
      }
      toggleMark(editor, "fontSize", event.target.value);
      setFontSize(event.target.value);
    },
    [editor, selection]
  );

  const handleFontColorChange = useCallback(
    (color) => {
      if (!editor.selection) {
        Transforms.select(
          editor,
          selection || {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          }
        );
      }
      toggleMark(editor, "color", color.hex);
      setFontColor(color.hex);
      closeColorPicker();
    },
    [editor, selection]
  );

  const openColorPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeColorPicker = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Root className={classes.toolbar}>
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

      <Tooltip title="Font Colour">
        <IconButton
          aria-label="font colour"
          // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
          // onClick will cause users to lose focus on selection
          onMouseDown={openColorPicker}
          style={{ backgroundColor: fontColor, marginLeft: "8px" }}
          size="large"
        />
      </Tooltip>

      <Popover
        id="font-color-picker"
        open={open}
        anchorEl={anchorEl}
        onClose={closeColorPicker}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <CompactPicker onChangeComplete={handleFontColorChange} />
      </Popover>

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
              size="large"
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
            size="large"
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
            <Button
              key={type.style}
              aria-label={type.style}
              className={clsx(classes.margin, classes.groupedButton, {
                [classes.active]: activeGroup.style === type.style,
              })}
              component={disabled ? "div" : undefined} // required to avoid error message about passing a disabled button to tooltip
              // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
              // onClick will cause users to lose focus on selection
              onMouseDown={handleGroupTypeChange(type.style, type.type)}
            >
              {type.icon}
            </Button>
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
            size="large"
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
            size="large"
          >
            <Image />
          </IconButton>
        </span>
      </Tooltip>
    </Root>
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
