import React from "react";
import PropTypes from "prop-types";

export default function CodeBlock(props) {
  const { element, children, attributes } = props;
  return (
    <pre
      style={{
        backgroundColor: `#eee`,
        border: `1px solid #999`,
        borderRadius: "4px",
        display: "block",
        padding: "8px 16px",
      }}
      {...attributes}
    >
      {children}
    </pre>
  );
}

CodeBlock.propTypes = {
  element: PropTypes.object,
  children: PropTypes.object,
  attributes: PropTypes.object,
};
