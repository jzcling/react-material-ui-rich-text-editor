import React from "react";
import PropTypes from "prop-types";

export default function Image(props) {
  const { element, children, attributes } = props;
  return (
    <figure
      contentEditable={false}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      {...attributes}
    >
      <img
        src={String(element.url)}
        alt={element.caption}
        width={element.width}
        height={element.height}
        style={{
          maxWidth: "100%",
          maxHeight: "20em",
          objectFit: "contain",
        }}
      />
      {element.caption && <figcaption>{element.caption}</figcaption>}
      {children}
    </figure>
  );
}

Image.propTypes = {
  element: PropTypes.object,
  children: PropTypes.object,
  attributes: PropTypes.object,
};
