import { useCallback, useRef, useState } from "react";
import _ from "lodash";

export default function useSelection(editor) {
  const [selection, setSelection] = useState(editor.selection);
  const previousSelection = useRef();
  const setSelectionOptimized = useCallback(
    (newSelection) => {
      if (_.isEqual(selection, newSelection)) {
        return;
      }
      previousSelection.current = selection;
      setSelection(newSelection);
    },
    [setSelection, selection]
  );

  return [previousSelection.current, selection, setSelectionOptimized];
}
