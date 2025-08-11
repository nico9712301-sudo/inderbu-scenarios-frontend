"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { AuthFormField } from "@/shared/ui/auth-form-field";

interface SelectFieldProps<T> {
  label: string;
  placeholder: string;
  options: T[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  required?: boolean;
}

export function SelectField<T>({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  error,
  getOptionValue,
  getOptionLabel,
  required,
}: SelectFieldProps<T>) {
  return (
    <AuthFormField label={label} error={error} required={required}>
      <Select
        disabled={disabled}
        onValueChange={onChange}
        value={value}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white cursor-pointer max-h-[200px]">
          {options.map((option, index) => (
            <SelectItem
              key={index}
              value={getOptionValue(option)}
              className="cursor-pointer hover:bg-gray-100"
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AuthFormField>
  );
}
