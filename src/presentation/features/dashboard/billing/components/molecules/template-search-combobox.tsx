"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import type { TemplatePlainObject } from "@/entities/billing/domain/TemplateEntity";
import { getReceiptTemplatesAction } from "@/infrastructure/web/controllers/dashboard/billing.actions";

interface TemplateSearchComboboxProps {
  value?: number | null;
  onValueChange: (templateId: number | null, template?: TemplatePlainObject) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TemplateSearchCombobox({
  value,
  onValueChange,
  placeholder = "Buscar plantilla...",
  disabled = false,
}: TemplateSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [templates, setTemplates] = React.useState<TemplatePlainObject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Load initial templates
  React.useEffect(() => {
    loadTemplates("");
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      loadTemplates(searchTerm);
    }, 300); // 300ms debounce

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchTerm]);

  const loadTemplates = async (search: string) => {
    setLoading(true);
    try {
      const result = await getReceiptTemplatesAction(true, search || undefined);
      if (result.success) {
        setTemplates(result.data || []);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedTemplate ? selectedTemplate.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Buscando...
                </span>
              </div>
            ) : templates.length === 0 ? (
              <CommandEmpty>No se encontraron plantillas.</CommandEmpty>
            ) : (
              <CommandGroup>
                {templates.map((template) => (
                  <CommandItem
                    key={template.id}
                    value={template.id.toString()}
                    onSelect={() => {
                      const newValue = template.id === value ? null : template.id;
                      onValueChange(newValue, newValue ? template : undefined);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === template.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {template.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
