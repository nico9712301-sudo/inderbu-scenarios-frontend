"use client";

import { ModernFacilityCard } from "@/shared/components/organisms/modern-facility-card";
import { ISubScenario } from "@/presentation/features/home/types/filters.types";
import { FC, useEffect, useState } from "react";


interface FacilityGridProps {
  subScenarios: ISubScenario[];
  isLoading?: boolean;
  emptyMessage?: string;
  onClearFilters?: () => void;
}

export const FacilityGrid: FC<FacilityGridProps> = ({
  subScenarios,
  isLoading = false,
  emptyMessage = "No hay escenarios disponibles bajo esos criterios de búsqueda, intenta con otros.",
  onClearFilters,
}) => {
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    if (!isLoading && subScenarios.length > 0) {
      setAnimateItems(false);
      const t = setTimeout(() => setAnimateItems(true), 150);
      return () => clearTimeout(t);
    }
  }, [subScenarios, isLoading]);

  /* ─────────── Shimmer mientras carga ─────────── */
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[...Array(6)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-gradient-to-br from-muted to-muted/50 rounded-xl h-80 animate-pulse shadow-sm border border-border"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  /* ─────────── Sin resultados ─────────── */
  if (subScenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gradient-to-br from-muted to-muted/50 rounded-full p-6 mb-6">
          <svg
            className="w-12 h-12 text-muted-foreground"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">
          No encontramos escenarios
        </h3>
        <p className="text-center text-muted-foreground mb-6 max-w-md leading-relaxed">
          {emptyMessage}
        </p>
        {onClearFilters && (
          <button
            className="px-6 py-3 bg-primary-600 text-primary-foreground rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            onClick={onClearFilters}
          >
            Reiniciar filtros
          </button>
        )}
      </div>
    );
  }

  /* ─────────── Resultados ─────────── */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {subScenarios.map((sub, i) => (
        <div
          key={sub.id}
          className={`transform transition-all duration-300 ${
            animateItems
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: `${i * 75}ms` }}
        >
          <ModernFacilityCard subScenario={sub} priority={i < 3} />
        </div>
      ))}
    </div>
  );
};

export default FacilityGrid;
