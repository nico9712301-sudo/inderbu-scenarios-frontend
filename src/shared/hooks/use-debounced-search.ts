"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDebouncedSearchProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  delay?: number;
}

/**
 * Hook for managing debounced search input
 * Separates local input state from URL/server state to prevent sluggish behavior
 */
export function useDebouncedSearch({
  initialValue = "",
  onSearch,
  delay = 500,
}: UseDebouncedSearchProps) {
  const [localValue, setLocalValue] = useState(initialValue);

  // Update local value when initial value changes (e.g., from URL)
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // Debounce the search function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== initialValue) {
        onSearch(localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, onSearch, delay, initialValue]);

  const handleChange = useCallback((value: string) => {
    setLocalValue(value);
  }, []);

  const reset = useCallback(() => {
    setLocalValue("");
    onSearch("");
  }, [onSearch]);

  return {
    value: localValue,
    onChange: handleChange,
    reset,
  };
}