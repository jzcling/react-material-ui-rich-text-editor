import React from "react";
import PropTypes from "prop-types";

export default function Image(props) {
  const { element, children, attributes } = props;
  return (
    <figure
      contentEditable={false}
      className="editor-image-container"
      {...attributes}
    >
      <img
        src={String(element.url)}
        alt={element.caption}
        width={element.width}
        height={element.height}
        className="editor-image"
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
