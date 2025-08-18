"use client";

import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";

interface ClientsExportButtonProps {
  onExport: () => Promise<void>;
  loading?: boolean;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function ClientsExportButton({
  onExport,
  loading = false,
  variant = "outline",
  size = "sm",
  className = "",
  showText = true,
}: ClientsExportButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onExport}
      disabled={loading}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {showText && "Exportar"}
    </Button>
  );
}