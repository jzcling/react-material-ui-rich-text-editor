import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
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
  toggleBlock,
  toggleMark,
  getActiveStyles,
  getActiveBlock,
  getActiveFontSize,
  getActiveFontColor,
  insertImage,
  isBlockActive,
} from "../Utils/EditorUtils";
import { ReactEditor, useSlateStatic } from "slate-react";
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

const activeStyle = {
  backgroundColor: (theme) => theme.palette.primary.light,
  color: "white",
  "&:hover": {
    backgroundColor: (theme) => theme.palette.primary.main,
  },
};

const buttonMarginLeft = {
  ml: "2px",
};

const groupedButtonStyle = {
  padding: "12px",
  borderRadius: "50%",
};

const TEXT_STYLE_TYPES = [
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
    parent: "Ordered List",
    child: "List Item",
    icon: <FormatListNumbered />,
  },
  {
    parent: "Unordered List",
    child: "List Item",
    icon: <FormatListBulleted />,
  },
  {
    parent: "Quote Block",
    child: "Quote",
    icon: <FormatQuote />,
  },
  {
    parent: "Code Block",
    child: "Code",
    icon: <Code />,
  },
];

const ALIGNMENT_TYPES = [
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
  const { selection, disabled, setOpenLinkEditor, setOpenImageEditor } = props;
  const editor = useSlateStatic();
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
    ALIGNMENT_TYPES.find(
      (t) =>
        t.style ===
        getActiveBlock(
          editor,
          ALIGNMENT_TYPES.map((t) => t.style)
        )
    ) || ALIGNMENT_TYPES[0];

  const activeGroup =
    GROUP_TYPES.find(
      (t) =>
        t.parent ===
        getActiveBlock(
          editor,
          GROUP_TYPES.map((t) => t.parent)
        )
    ) || {};

  const handleTextStyleChange = useCallback(
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
      ReactEditor.focus(editor);
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
      ReactEditor.focus(editor);
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
      ReactEditor.focus(editor);
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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        overflow: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        mb: 1,
      }}
    >
      <TextField
        id="editor-font-size"
        variant="outlined"
        size="small"
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
        <span>
          <IconButton
            aria-label="font colour"
            // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
            // onClick will cause users to lose focus on selection
            onMouseDown={openColorPicker}
            style={{ backgroundColor: fontColor, marginLeft: "8px" }}
            size="large"
            disabled={disabled}
          />
        </span>
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
        <CompactPicker
          color={fontColor}
          onChangeComplete={handleFontColorChange}
        />
      </Popover>

      {TEXT_STYLE_TYPES.map((type) => (
        <Tooltip title={type.label} key={type.style}>
          <span>
            <IconButton
              aria-label={type.label}
              sx={{
                ...buttonMarginLeft,
                ...(getActiveStyles(editor).has(type.style) ? activeStyle : {}),
              }}
              disabled={disabled}
              // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
              // onClick will cause users to lose focus on selection
              onMouseDown={handleTextStyleChange(type.style)}
              size="large"
            >
              {type.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}

      <Divider orientation="vertical" flexItem style={{ margin: "0 8px" }} />

      <Tooltip title={activeTextAlign.style}>
        <span>
          <IconButton
            aria-label={activeTextAlign.style}
            sx={activeStyle}
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
        {ALIGNMENT_TYPES.map((type) => {
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
          <Tooltip title={type.parent} key={type.parent}>
            <Button
              key={type.parent}
              aria-label={type.parent}
              sx={{
                ...buttonMarginLeft,
                ...groupedButtonStyle,
                ...(activeGroup.style === type.parent ? activeStyle : {}),
              }}
              component={disabled ? "div" : undefined} // required to avoid error message about passing a disabled button to tooltip
              // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
              // onClick will cause users to lose focus on selection
              onMouseDown={handleGroupTypeChange(type.parent, type.child)}
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
            sx={{
              ...buttonMarginLeft,
              ...(isBlockActive(editor, "Link") ? activeStyle : {}),
            }}
            disabled={disabled}
            onMouseDown={() => setOpenLinkEditor(true)}
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
            sx={{
              ...buttonMarginLeft,
              ...(isBlockActive(editor, "Image") ? activeStyle : {}),
            }}
            disabled={disabled}
            onMouseDown={() => {
              if (!isBlockActive(editor, "Image")) {
                insertImage(editor, "https://via.placeholder.com/150");
              }
              setOpenImageEditor(editor);
            }}
            size="large"
          >
            <Image />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

Toolbar.defaultProps = {
  selection: undefined,
  disabled: true,
  setOpenLinkEditor: () => {},
  setOpenImageEditor: () => {},
};

Toolbar.propTypes = {
  selection: PropTypes.object,
  disabled: PropTypes.bool,
  setOpenLinkEditor: PropTypes.func,
  setOpenImageEditor: PropTypes.func,
};
