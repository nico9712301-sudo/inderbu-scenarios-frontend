"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export interface MultiSearchSelectOption {
  id: number | string;
  name: string;
}

interface MultiSearchSelectProps {
  placeholder: string;
  searchPlaceholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  value?: string; // comma-separated string like "1,2,3"
  onValueChange: (value: string | undefined) => void;
  onSearch: (query: string) => Promise<MultiSearchSelectOption[]>;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSearchSelect({
  placeholder,
  searchPlaceholder,
  icon: Icon,
  value,
  onValueChange,
  onSearch,
  emptyMessage = "No se encontraron elementos",
  className,
  disabled = false,
}: MultiSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<MultiSearchSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse selected values from comma-separated string
  const selectedIds = value ? value.split(',').map(id => id.trim()) : [];

  // Generate display text
  const displayText = selectedIds.length === 0
    ? placeholder
    : `${selectedIds.length} seleccionado${selectedIds.length > 1 ? 's' : ''}`;

  const loadOptions = async (query: string = "") => {
    setLoading(true);
    try {
      const results = await onSearch(query);
      setOptions(results);
    } catch (error) {
      console.error("Error loading options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadOptions(searchQuery);
      // Focus search input when popover opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery !== undefined) {
      const debounceTimer = setTimeout(() => {
        loadOptions(searchQuery);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery]);

  const handleSelect = (option: MultiSearchSelectOption) => {
    const optionId = option.id.toString();
    let newSelectedIds: string[];

    if (selectedIds.includes(optionId)) {
      // Remove if already selected
      newSelectedIds = selectedIds.filter(id => id !== optionId);
    } else {
      // Add if not selected
      newSelectedIds = [...selectedIds, optionId];
    }

    const newValue = newSelectedIds.length === 0 ? undefined : newSelectedIds.join(',');
    onValueChange(newValue);

    // Don't close the popover for multi-select
    // setOpen(false);
  };

  const handleRemoveItem = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering select
    const newSelectedIds = selectedIds.filter(id => id !== optionId);
    const newValue = newSelectedIds.length === 0 ? undefined : newSelectedIds.join(',');
    onValueChange(newValue);
  };

  const isSelected = (optionId: string) => selectedIds.includes(optionId);

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
          disabled={disabled}
        >
          <div className="flex items-center">
            {Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0" />}
            <span className={selectedIds.length === 0 ? "text-muted-foreground" : ""}>
              {displayText}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder={searchPlaceholder || "Buscar..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Cargando...
            </div>
          ) : options.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((option) => {
              const selected = isSelected(option.id.toString());
              return (
                <div
                  key={option.id}
                  className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 group"
                  onClick={() => handleSelect(option)}
                >
                  <span className={selected ? "font-medium" : ""}>
                    {option.name}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* X button visible on hover when selected */}
                    {selected && (
                      <button
                        onClick={(e) => handleRemoveItem(option.id.toString(), e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200"
                        title="Deseleccionar"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

                    {/* Checkmark when selected */}
                    {selected && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default memo(MultiSearchSelect);