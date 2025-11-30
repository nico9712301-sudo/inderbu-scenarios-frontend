"use client";

import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { cn } from "@/shared/utils/utils";

type IconComponent = LucideIcon | IconType;

export interface IconContainerProps {
  Icon: IconComponent;
  variant?: "primary" | "social";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles = {
  primary: "bg-primary border border-primary-300 text-primary-foreground",
  social: "bg-primary border border-border text-primary-foreground group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-200 group-hover:shadow-sm",
};

const sizeStyles = {
  sm: "w-8 h-8 p-1.5 rounded-lg",
  md: "w-10 h-10 p-2 rounded-lg",
  lg: "w-12 h-12 p-2.5 rounded-lg",
};

const iconSizes = {
  sm: { lucide: "w-3 h-3", reactIcons: 12 },
  md: { lucide: "w-4 h-4", reactIcons: 16 },
  lg: { lucide: "w-5 h-5", reactIcons: 20 },
};

export function IconContainer({
  Icon,
  variant = "primary",
  size = "md",
  className,
}: IconContainerProps) {
  const iconSizeConfig = iconSizes[size];
  
  return (
    <div
      className={cn(
        "flex items-center justify-center flex-shrink-0 transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {/* Intentar renderizar con className primero (Lucide), luego con size (react-icons) */}
      <Icon 
        // @ts-ignore - LucideIcon acepta className
        className={cn(iconSizeConfig.lucide, variant === "primary" && "text-primary-600")}
        // @ts-ignore - IconType de react-icons acepta size
        size={iconSizeConfig.reactIcons}
      />
    </div>
  );
}

