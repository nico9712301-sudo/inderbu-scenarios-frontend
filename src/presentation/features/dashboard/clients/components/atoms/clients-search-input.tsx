"use client";

import { memo } from "react";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";

interface ClientsSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ClientsSearchInput({
  value,
  onChange,
  placeholder = "Buscar por nombre, email o DNI...",
  className = "",
}: ClientsSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-10 w-full"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        name="search-query"
        data-form-type="search"
      />
    </div>
  );
}