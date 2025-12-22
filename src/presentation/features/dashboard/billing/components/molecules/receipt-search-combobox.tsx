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
import type { ReceiptPlainObject } from "@/entities/billing/domain/ReceiptEntity";
import { getReceiptsByReservationAction } from "@/infrastructure/web/controllers/dashboard/billing.actions";

interface ReceiptSearchComboboxProps {
  reservationId: number;
  value?: number | null;
  onValueChange: (receiptId: number | null, receipt?: ReceiptPlainObject) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ReceiptSearchCombobox({
  reservationId,
  value,
  onValueChange,
  placeholder = "Buscar recibo por fecha...",
  disabled = false,
}: ReceiptSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [receipts, setReceipts] = React.useState<ReceiptPlainObject[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Load initial receipts (last 5, sorted by date DESC)
  React.useEffect(() => {
    loadReceipts("");
  }, [reservationId]);

  // Debounced search
  React.useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      loadReceipts(searchTerm);
    }, 300); // 300ms debounce

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchTerm]);

  const loadReceipts = async (search: string) => {
    setLoading(true);
    try {
      const result = await getReceiptsByReservationAction(reservationId);
      if (result.success) {
        let filteredReceipts = result.data || [];
        
        // Sort by generatedAt DESC (most recent first)
        filteredReceipts = filteredReceipts.sort((a, b) => {
          const dateA = new Date(a.generatedAt).getTime();
          const dateB = new Date(b.generatedAt).getTime();
          return dateB - dateA;
        });

        // Filter by search term (date search)
        if (search) {
          const searchLower = search.toLowerCase();
          filteredReceipts = filteredReceipts.filter((receipt) => {
            const dateStr = new Date(receipt.generatedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return dateStr.toLowerCase().includes(searchLower);
          });
        }

        // Limit to 5 most recent
        filteredReceipts = filteredReceipts.slice(0, 5);

        setReceipts(filteredReceipts);
      } else {
        setReceipts([]);
      }
    } catch (error) {
      console.error("Error loading receipts:", error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedReceipt = receipts.find((r) => r.id === value);

  // Format date for display
  const formatReceiptDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format total cost
  const formatTotal = (total: number): string => {
    return `$${Math.round(total).toLocaleString('es-CO')}`;
  };

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
          {selectedReceipt
            ? `${formatReceiptDate(selectedReceipt.generatedAt)} - ${formatTotal(selectedReceipt.variablesValues.totalCost)}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar por fecha..."
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
            ) : receipts.length === 0 ? (
              <CommandEmpty>No se encontraron recibos.</CommandEmpty>
            ) : (
              <CommandGroup>
                {receipts.map((receipt) => (
                  <CommandItem
                    key={receipt.id}
                    value={receipt.id.toString()}
                    onSelect={() => {
                      const newValue = receipt.id === value ? null : receipt.id;
                      onValueChange(newValue, newValue ? receipt : undefined);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === receipt.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatReceiptDate(receipt.generatedAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Total: {formatTotal(receipt.variablesValues.totalCost)}
                      </span>
                    </div>
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
