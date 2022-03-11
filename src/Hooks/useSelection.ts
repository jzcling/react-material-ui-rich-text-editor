import isEqual from "lodash/isEqual";
import { useCallback, useRef, useState } from "react";
import { Editor, Selection } from "slate";

export default function useSelection(
  editor: Editor
): [Selection, Selection, (newSelection: Selection) => void] {
  const [selection, setSelection] = useState(editor.selection);
  const previousSelection = useRef<Selection>(null);
  const setSelectionOptimized = useCallback(
    (newSelection: Selection): void => {
      if (isEqual(selection, newSelection)) {
        return;
      }
      previousSelection.current = selection;
      setSelection(newSelection);
    },
    [setSelection, selection]
  );

  return [previousSelection.current, selection, setSelectionOptimized];
}
