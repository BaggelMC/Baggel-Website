import { createColorPickerModal } from "./createColorPickerModal";
import { openModal } from "../modal";

export function openColorPicker(initial: string): Promise<string> {
  return new Promise(resolve => {
    openModal(
      createColorPickerModal(initial, resolve)
    );
  });
}
