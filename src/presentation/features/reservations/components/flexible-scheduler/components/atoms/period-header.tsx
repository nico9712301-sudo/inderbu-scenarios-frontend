import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tooltip } from "@/shared/components/atoms/tooltip";
import { PeriodHeaderProps } from "../../types/scheduler.types";

export const PeriodHeader = ({
  period,
  selectedCount,
  availableCount,
  isExpanded,
  onSelectAll,
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
        {availableCount > 0 && (
          <Tooltip content={`Seleccionar todos los horarios disponibles de ${period.name.toLowerCase()}`} side="top">
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
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-xs animate-pulse">
            {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
          </Badge>
        )}
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
