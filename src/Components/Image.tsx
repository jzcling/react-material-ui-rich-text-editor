import React from "react";

import { CustomElement } from "../hooks/useEditorConfig";

interface Props {
  element: CustomElement;
  children: React.ReactNode;
  attributes: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >;
}

export default function Image(props: Props) {
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
