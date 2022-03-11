import isHotkey from "is-hotkey";
import React, { useCallback, useEffect, useState } from "react";
import { ColorPicker, ColorPickerVariant } from "react-mui-color";
import { Editor, Selection, Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";

import {
  BorderColor, Code, FormatAlignCenter, FormatAlignJustify, FormatAlignLeft, FormatAlignRight,
  FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, FormatQuote, FormatUnderlined,
  Help, Image, Link, StrikethroughS, SvgIconComponent
} from "@mui/icons-material";
import {
  Box, Button, ButtonGroup, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
  Popover, TextField, Theme, Tooltip
} from "@mui/material";

import { ElementType } from "../hooks/useEditorConfig";
import {
  getActiveBlock, getActiveFontColor, getActiveFontSize, getActiveStyles, insertImage,
  isBlockActive, toggleBlock, toggleMark
} from "../utils/EditorUtils";

const activeStyle = {
  backgroundColor: (theme: Theme) => theme.palette.primary.light,
  color: "white",
  "&:hover": {
    backgroundColor: (theme: Theme) => theme.palette.primary.main,
  },
};

const buttonMarginLeft = {
  ml: "2px",
};

const groupedButtonStyle = {
  padding: "12px",
  borderRadius: "50%",
};

export type TextStyleType = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  highlight: boolean;
  code: boolean;
  quote: boolean;
  fontSize: string | number;
  color: string;
};

const TEXT_STYLE_TYPES: Array<{
  style: keyof TextStyleType;
  label: string;
  icon: JSX.Element;
}> = [
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

const GROUP_TYPES: Array<{
  parent: ElementType;
  child: ElementType | keyof TextStyleType;
  icon: JSX.Element;
}> = [
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
    child: "quote",
    icon: <FormatQuote />,
  },
  {
    parent: "Code Block",
    child: "code",
    icon: <Code />,
  },
];

const ALIGNMENT_TYPES: Array<{ style: ElementType; icon: JSX.Element }> = [
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

interface Props {
  selection: Selection;
  disabled: boolean;
  setOpenLinkEditor: (b: boolean) => void;
  setOpenImageEditor: (b: boolean) => void;
}

export default function Toolbar(props: Props) {
  const { selection, disabled, setOpenLinkEditor, setOpenImageEditor } = props;
  const editor = useSlateStatic();
  var [fontSize, setFontSize] = useState<string | number>("");
  var [fontColor, setFontColor] = useState("");
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  useEffect(() => {
    setFontSize(getActiveFontSize(editor));
  }, [editor, selection]);

  useEffect(() => {
    setFontColor(getActiveFontColor(editor));
  }, [editor, selection]);

  const [alignAnchorEl, setAlignAnchorEl] = useState<HTMLElement>();
  const activeTextAlign =
    ALIGNMENT_TYPES.find(
      (t) =>
        t.style ===
        getActiveBlock(
          editor,
          ALIGNMENT_TYPES.map((t) => t.style)
        )
    ) || ALIGNMENT_TYPES[0];

  const activeGroup: {
    parent?: ElementType;
    child?: ElementType | keyof TextStyleType;
    icon?: JSX.Element;
  } =
    GROUP_TYPES.find(
      (t) =>
        t.parent ===
        getActiveBlock(
          editor,
          GROUP_TYPES.map((t) => t.parent)
        )
    ) || {};

  const handleTextStyleChange = useCallback(
    (style: keyof TextStyleType): React.MouseEventHandler<HTMLButtonElement> =>
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
        toggleMark(editor, style);
        // ReactEditor.focus(editor);
      },
    [editor]
  );

  const handleTextAlignChange = useCallback(
    (align: ElementType): React.MouseEventHandler<HTMLLIElement> =>
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
        setAlignAnchorEl(undefined);
        toggleBlock(editor, align);
        // ReactEditor.focus(editor);
      },
    [editor]
  );

  const handleGroupTypeChange = useCallback(
    (
        style: ElementType,
        type: ElementType | keyof TextStyleType
      ): React.MouseEventHandler<HTMLButtonElement> =>
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
        toggleBlock(editor, style, type);
        // ReactEditor.focus(editor);
      },
    [editor]
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
    [editor]
  );

  const handleFontColorChange = useCallback(
    (color, keepOpen = false) => {
      if (!editor.selection) {
        Transforms.select(
          editor,
          selection || {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          }
        );
      }
      toggleMark(editor, "color", color);
      setFontColor(color);
      if (!keepOpen) {
        closeColorPicker();
      }
    },
    [editor]
  );

  const openColorPicker: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
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
        <ColorPicker
          color={fontColor}
          onChange={handleFontColorChange}
          variant={ColorPickerVariant.Predefined}
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
            <span>
              <Button
                key={type.parent}
                aria-label={type.parent}
                sx={{
                  ...buttonMarginLeft,
                  ...groupedButtonStyle,
                  ...(activeGroup.parent === type.parent ? activeStyle : {}),
                }}
                // Use onMouseDown instead of onClick due to https://github.com/ianstormtaylor/slate/issues/3412
                // onClick will cause users to lose focus on selection
                onMouseDown={handleGroupTypeChange(type.parent, type.child)}
              >
                {type.icon}
              </Button>
            </span>
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
              setOpenImageEditor(true);
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
