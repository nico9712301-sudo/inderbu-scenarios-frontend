"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";


export interface SearchSelectOption {
  id: number | string;
  name: string;
}

interface SearchSelectProps {
  placeholder: string;
  searchPlaceholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  value?: string | number;
  onValueChange: (value: string | number | null) => void;
  onSearch: (query: string) => Promise<SearchSelectOption[]>;
  onSearchById?: (id: string | number) => Promise<SearchSelectOption | null>;
  initialOption?: SearchSelectOption;
  emptyMessage?: string;
  className?: string;
}

export function SearchSelect({
  placeholder,
  searchPlaceholder,
  icon: Icon,
  value,
  onValueChange,
  onSearch,
  onSearchById,
  initialOption,
  emptyMessage = "No se encontraron resultados",
  className = "",
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<SearchSelectOption | null>(null);
  const [selectedCache, setSelectedCache] = useState<
    Map<string | number, SearchSelectOption>
  >(new Map());
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Load initial options and handle initialOption
  useEffect(() => {
    loadOptions("");
    
    // If there's an initialOption, set it
    if (initialOption) {
      setSelectedOption(initialOption);
      setSelectedCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(initialOption.id, initialOption);
        return newCache;
      });
    }
  }, [initialOption]); // Removed onSearch dependency

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadOptions(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]); // Removed onSearch dependency

  // Update selected option when value changes (OPTIMIZED DEPENDENCIES)
  useEffect(() => {
   
    // Early return if no value
    if (!value || value === "all") {
      setSelectedOption(null);
      return;
    }

    // Buscar en opciones actuales
    let option = options.find(
      (opt) => opt.id.toString() === value.toString(),
    );

    // Si no está en opciones actuales, buscar en cache
    if (!option) {
      option = selectedCache.get(value) ?? undefined;
    }

    // Si encontramos la opción, establecerla
    if (option) {
      setSelectedOption(option);
      return;
    }

    // Solo buscar por ID si no está en cache Y no hemos buscado antes
    if (onSearchById && !selectedCache.has(value)) {
      onSearchById(value).then((foundOption) => {
        if (foundOption) {
          setSelectedOption(foundOption);
          setSelectedCache((prev) => {
            const newCache = new Map(prev);
            newCache.set(foundOption.id, foundOption);
            return newCache;
          });
        }
      }).catch((error) => {
        console.error("Error searching by ID:", error);
      });
    }
  }, [value, onSearchById]); // REMOVED: options, selectedCache para evitar re-renders innecesarios

  // Separate effect to update cache when new options are loaded
  useEffect(() => {
    if (options.length > 0 && value && value !== "all") {
      const matchingOption = options.find(
        (opt) => opt.id.toString() === value.toString(),
      );
      if (matchingOption && !selectedCache.has(value)) {
        setSelectedCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(matchingOption.id, matchingOption);
          return newCache;
        });
        setSelectedOption(matchingOption);
      }
    }
  }, [options]); // Only depend on options, not value

  const loadOptions = async (query: string) => {
    setLoading(true);
    try {
      const results = await onSearch(query);
      setOptions(results);

      // Si hay opciones nuevas y un valor seleccionado, actualizar cache
      if (results.length > 0 && value && value !== "all") {
        const matchingOption = results.find(
          (opt) => opt.id.toString() === value.toString(),
        );
        if (matchingOption) {
          setSelectedCache((prev) => {
            const newCache = new Map(prev);
            newCache.set(matchingOption.id, matchingOption);
            return newCache;
          });
        }
      }
    } catch (error) {
      console.error("Error loading options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: SearchSelectOption) => {
    setSelectedOption(option);
    // Guardar en cache para uso futuro
    setSelectedCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(option.id, option);
      return newCache;
    });
    onValueChange(option.id);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    onValueChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between border-border focus:border-primary focus:ring-primary/20 
                     bg-muted/50 hover:bg-background transition-all duration-200 ${className}`}
        >
          <div className="flex items-center">
            {Icon && <Icon className="w-4 h-4 mr-2 text-muted-foreground" />}
            <span
              className={selectedOption ? "text-foreground" : "text-muted-foreground"}
            >
              {selectedOption ? selectedOption.name : placeholder}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedOption && (
              <div
                onClick={handleClear}
                className="hover:bg-muted rounded p-1 transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </div>
            )}
            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={searchPlaceholder || placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 border-border focus:border-primary focus:ring-primary/20"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              name={`search-select-${Math.random()}`}
              data-form-type="search"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
            </div>
          ) : options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="py-1">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer 
                             hover:bg-secondary-50 hover:text-secondary-700 transition-colors
                             ${selectedOption?.id === option.id ? "bg-secondary-50 text-secondary-700" : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.name}</span>
                  {selectedOption?.id === option.id && (
                    <Check className="w-4 h-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}