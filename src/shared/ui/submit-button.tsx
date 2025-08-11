"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/shared/utils/utils";

interface SubmitButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SubmitButton({ isLoading, children, className }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={cn("w-full bg-blue-600 text-white rounded hover:bg-blue-700", className)}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : (
        children
      )}
    </Button>
  );
}
