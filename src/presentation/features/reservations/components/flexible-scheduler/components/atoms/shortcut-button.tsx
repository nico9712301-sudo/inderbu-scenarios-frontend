import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/components/atoms/tooltip";
import { SmartShortcut } from "../../types/scheduler.types";

interface ShortcutButtonProps {
  shortcut: SmartShortcut;
  isLoading: boolean;
  onApply: (shortcutId: string) => void;
}

export const ShortcutButton = ({ shortcut, isLoading, onApply }: ShortcutButtonProps) => {
  return (
    <Tooltip content={shortcut.description} side="bottom">
      <Button
        variant="outline"
        size="sm"
        className="text-xs h-8 transition-all duration-200 hover:scale-105"
        onClick={() => onApply(shortcut.id)}
        disabled={isLoading}
      >
        {shortcut.icon}
        <span className="hidden sm:inline ml-1">{shortcut.name.split(' ')[1]}</span>
      </Button>
    </Tooltip>
  );
};
