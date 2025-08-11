"use client";

import { HomeMainProps } from "../../interfaces/home-main-props.interface";
import { MainHeader } from "@/shared/components/organisms/main-header";
import { Pagination } from "@/shared/components/organisms/pagination";
import { LoadingIndicator } from "../molecules/loading-indicator";
import { useHomeData } from "../../hooks/use-home-data";
import { ErrorMessage } from "./error-message";
import { HeroSection } from "./hero-section";
import { EmptyState } from "./empty-state";
import FacilityGrid from "./facility-grid";
import HomeFilters from "./home-filters";
import { useMemo } from "react";
import Footer from "./footer";


export default function HomeMain({
  initialActivityAreas,
  initialNeighborhoods,
  initialSubScenarios,
  initialMeta,
  // Props opcionales con defaults
  initialFilters = {},
  initialPage = 1,
}: HomeMainProps) {
  // Pasar todos los parámetros al hook
  const {
    subScenarios,
    meta,
    page,
    filters,
    activeFilters,
    loading,
    error,
    hasError,
    hasData,
    isEmpty,
    setPage,
    setFilters,
    setActiveFilters,
    clearFilters,
    retryFetch,
  } = useHomeData({
    initialSubScenarios,
    initialMeta,
    initialFilters, // Pasar filtros iniciales
    initialPage, // Pasar página inicial
  });

  // Resto del componente igual que antes...
  const contentSection = useMemo(() => {
    if (loading) return <LoadingIndicator />;
    if (hasError && error)
      return <ErrorMessage error={error} onRetry={retryFetch} />;
    if (isEmpty) return <EmptyState onClearFilters={clearFilters} />;

    return (
      <>
        <div className="mt-12">
          <FacilityGrid
            subScenarios={subScenarios}
            onClearFilters={clearFilters}
          />
        </div>

        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </>
    );
  }, [
    loading,
    hasError,
    error,
    isEmpty,
    subScenarios,
    page,
    meta.totalPages,
    retryFetch,
    clearFilters,
    setPage,
  ]);

  return (
    <main className="min-h-screen flex flex-col w-full">
      <MainHeader />
      <HeroSection />

      <div className="container mx-auto px-4 py-12 flex-grow">
        <HomeFilters
          activityAreas={initialActivityAreas}
          neighborhoods={initialNeighborhoods}
          filters={filters}
          setFilters={setFilters}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          clearFilters={clearFilters}
        />

        {contentSection}
      </div>
    </main>
  );
}
