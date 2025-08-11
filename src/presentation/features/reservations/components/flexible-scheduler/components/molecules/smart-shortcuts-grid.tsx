import { Label } from "@/shared/ui/label";
import { ShortcutButton } from "../atoms/shortcut-button";
import { SmartShortcutsGridProps } from "../../types/scheduler.types";

export const SmartShortcutsGrid = ({ 
  shortcuts, 
  onApplyShortcut, 
  isLoading 
}: SmartShortcutsGridProps) => {
  return (
    <div className="mb-4">
      <Label className="text-sm font-medium mb-2 block">Atajos inteligentes:</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {shortcuts.map((shortcut) => (
          <ShortcutButton
            key={shortcut.id}
            shortcut={shortcut}
            isLoading={isLoading}
            onApply={onApplyShortcut}
          />
        ))}
      </div>
    </div>
  );
};
