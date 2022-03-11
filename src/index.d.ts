import { BaseEditor, BaseElement } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor, RenderElementProps } from "slate-react";

import { CustomElement, CustomText, ElementType } from "./hooks/useEditorConfig";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

declare module "slate-react" {
  interface RenderElementProps {
    children: any;
    element: CustomElement;
    attributes: {
      "data-slate-node": "element";
      "data-slate-inline"?: true;
      "data-slate-void"?: true;
      dir?: "rtl";
      ref: any;
    };
  }
  interface RenderLeafProps {
    children: any;
    leaf: CustomText;
    text: CustomText;
    attributes: {
      "data-slate-leaf": true;
    };
  }
}
