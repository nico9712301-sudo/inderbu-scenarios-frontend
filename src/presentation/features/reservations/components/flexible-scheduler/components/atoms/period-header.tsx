import { PeriodHeaderProps } from "../../types/scheduler.types";
import { Tooltip } from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export const PeriodHeader = ({
  period,
  selectedCount,
  availableCount,
  isExpanded,
  onSelectAll,
  onClearSelection,
  onToggleExpand,
}: PeriodHeaderProps) => {
  const IconComponent = period.icon;

  return (
    <div 
      className="flex items-center justify-between p-3 cursor-pointer hover:bg-black/5 rounded-t-lg transition-all duration-200"
      onClick={onToggleExpand}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          <span className="font-medium">{period.name}</span>
          <span className="text-sm text-muted-foreground">
            {period.description}
          </span>
        </div>
        <div className="flex gap-1">
          {availableCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 transition-all duration-200 hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAll();
              }}
            >
              + Seleccionar todo
            </Button>
          )}
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 transition-all duration-200 hover:scale-105 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onClearSelection();
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {availableCount}/{period.hours.length} disponibles
        </Badge>
        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
