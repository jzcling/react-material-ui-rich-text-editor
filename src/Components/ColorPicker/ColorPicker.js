import {
  Box,
  Button,
  hexToRgb,
  Paper,
  rgbToHex,
  Stack,
  TextField,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { defaultColor, defaultColors } from "./ColorUtils";

function getRGB(color) {
  var rgb;
  if (color.slice(0, 1) === "#") {
    rgb = hexToRgb(color);
  } else {
    rgb = color;
  }

  const matches = /rgb\((\d+), (\d+), (\d+)\)/i.exec(rgb);
  return [rgb, matches?.[1] ?? 0, matches?.[2] ?? 0, matches?.[3] ?? 0];
}

export default function ColorPicker(props) {
  const { color, colors, onChange } = props;

  const hex = useMemo(() => {
    if (color.slice(0, 1) === "#") {
      return color;
    } else {
      return rgbToHex(color);
    }
  });

  const [_, r, g, b] = useMemo(() => {
    return getRGB(color);
  });

  const handleRGBChange = useCallback(
    (component, value) => {
      const [_, r, g, b] = getRGB(color);

      switch (component) {
        case "r":
          onChange(rgbToHex(`rgb(${value ?? 0}, ${g}, ${b})`), true);
          return;
        case "g":
          onChange(rgbToHex(`rgb(${r}, ${value ?? 0}, ${b})`), true);
          return;
        case "b":
          onChange(rgbToHex(`rgb(${r}, ${g}, ${value ?? 0})`), true);
          return;
        default:
          return;
      }
    },
    [color]
  );

  return (
    <Box
      sx={{
        m: 1,
        overflow: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Box
        sx={{
          mb: 1,
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          height: "105px",
          width: "420px",
          overflow: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {colors.map((color) => (
          <Button
            key={color}
            onClick={(event) => onChange(color)}
            sx={{ minWidth: "auto", p: "5px" }}
          >
            <Paper
              elevation={1}
              sx={{
                width: "25px",
                height: "25px",
                borderRadius: "50%",
                background: color,
                border: (theme) =>
                  color === hex
                    ? "1px solid " + theme.palette.primary.main
                    : "none",
              }}
            />
          </Button>
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Paper
            elevation={1}
            sx={{
              width: "25px",
              height: "25px",
              borderRadius: "50%",
              background: color,
            }}
          />
          <TextField
            size="small"
            label="Hex"
            value={hex}
            onChange={(event) => {
              var val = event.target.value;
              if (val?.slice(0, 1) !== "#") {
                val = "#" + val;
              }
              onChange(val, true);
            }}
            sx={{ width: "100px" }}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="R"
            value={r}
            onChange={(event) => handleRGBChange("r", event.target.value)}
            sx={{ width: "80px" }}
            type="number"
          />
          <TextField
            size="small"
            label="G"
            value={g}
            onChange={(event) => handleRGBChange("g", event.target.value)}
            sx={{ width: "80px" }}
            type="number"
          />
          <TextField
            size="small"
            label="B"
            value={b}
            onChange={(event) => handleRGBChange("b", event.target.value)}
            sx={{ width: "80px" }}
            type="number"
          />
        </Stack>
      </Stack>
    </Box>
  );
}

ColorPicker.defaultProps = {
  color: defaultColor,
  colors: defaultColors,
  onChange: (color, keepOpen) => {},
};

ColorPicker.propTypes = {
  color: PropTypes.string,
  colors: PropTypes.array,
  onChange: PropTypes.func,
};
