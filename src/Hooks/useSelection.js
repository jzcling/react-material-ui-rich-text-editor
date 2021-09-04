import { useCallback, useRef, useState } from "react";
import isEqual from "lodash/isEqual";

export default function useSelection(editor) {
  const [selection, setSelection] = useState(editor.selection);
  const previousSelection = useRef();
  const setSelectionOptimized = useCallback(
    (newSelection) => {
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
