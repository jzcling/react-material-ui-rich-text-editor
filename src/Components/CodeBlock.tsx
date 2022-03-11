import React from "react";

interface Props {
  children: React.ReactNode;
  attributes: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLPreElement>,
    HTMLPreElement
  >;
}

export default function CodeBlock(props: Props) {
  const { children, attributes } = props;
  return (
    <pre className="editor-code-block" {...attributes}>
      {children}
    </pre>
  );
}
