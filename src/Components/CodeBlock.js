import React from "react";
import PropTypes from "prop-types";

export default function CodeBlock(props) {
  const { element, children, attributes } = props;
  return (
    <pre className="editor-code-block" {...attributes}>
      {children}
    </pre>
  );
}

CodeBlock.propTypes = {
  element: PropTypes.object,
  children: PropTypes.object,
  attributes: PropTypes.object,
};
