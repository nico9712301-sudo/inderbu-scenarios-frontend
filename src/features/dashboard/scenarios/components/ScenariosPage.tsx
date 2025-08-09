"use client";

import { Download, Filter, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedSearch } from "@/shared/hooks/use-debounced-search";

import { ScenariosFiltersCard } from "@/features/scenarios/components/molecules/ScenariosFiltersCard";
import { IScenariosDataResponse } from "../application/GetScenariosDataUseCase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { CreateScenarioModal } from "./organisms/create-scenario-modal";
import { ScenarioCommandFactory } from "../commands/scenario-commands";
import { EditScenarioModal } from "./organisms/edit-scenario-modal";
import { useScenarioModals } from "../hooks/use-scenario-modals";
import { useScenariosData } from "../hooks/use-scenarios-data";
import { ScenariosTable } from "./organisms/scenarios-table";
import { ExportButton } from "./atoms/export-button";
import { NavValues } from "../utils/nav-values";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Scenario } from "@/services/api";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";

interface ScenariosPageProps {
  initialData: IScenariosDataResponse;
}

export function ScenariosPage({ initialData }: ScenariosPageProps) {
  const router = useRouter();

  // State management with custom hooks
  const {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
    scenarios,
    neighborhoods,
  } = useScenariosData(initialData);

  // Determine current tab based on active filter
  const getCurrentTab = useCallback(() => {
    const activeMap: Record<string, string> = {
      true: "active",
      false: "inactive",
    };

    return activeMap[String(filters.active)] || "all";
  }, [filters.active]);

  // Debounced search for responsive input
  const search = useDebouncedSearch({
    initialValue: filters.search || "",
    onSearch,
    delay: 300,
  });

  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    isEditModalOpen,
    selectedScenario,
    openEditModal,
    closeEditModal,
    showFilters,
    toggleFilters,
  } = useScenarioModals();

  // Build page meta
  const pageMeta: PageMeta = buildPageMeta(initialData.meta.totalItems);

  // Event handlers
  const handleFiltersChange = (newFilters: any) => {
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({ search: "", neighborhoodId: undefined });
  };

  const handleOpenEditModal = (scenario: Scenario) => {
    openEditModal(scenario);
  };

  const handleScenarioCreatedOrUpdated = useCallback(
    (mutatedScenario: Scenario) => {
      router.refresh();
    },
    [router]
  );

  const handleToggleStatus = useCallback(async (scenario: Scenario) => {
    const command = ScenarioCommandFactory.toggleScenarioStatus(scenario, {
      onSuccess: (updatedScenario) => {
        router.refresh();
      },
      onError: (error) => {
        console.error("Toggle status error:", error);
      },
    });

    await command.execute();
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Escenarios Deportivos
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={toggleFilters} variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={openCreateModal} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Escenario
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ScenariosFiltersCard
        open={showFilters}
        filters={filters as any}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

      {/* Tabs */}
      <Tabs
        value={getCurrentTab()}
        className="w-full"
        onValueChange={(value) => {
          // Map tab values to filter parameters
          const filterMap: Record<string, any> = {
            all: { active: undefined },
            active: { active: true },
            inactive: { active: false },
          };

          onFilterChange(filterMap[value] || {});
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            {NavValues.map((k) => (
              <TabsTrigger key={k.value} value={k.value}>
                {k.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2">
            <ExportButton 
              filters={{
                active: filters.active,
                neighborhoodId: filters.neighborhoodId,
                search: filters.search,
              }}
            />
          </div>
        </div>

        {/* Filtered tabs */}
        {NavValues.map((k) => (
          <TabsContent key={k.value} value={k.value} className="mt-0">
            <ScenariosTable
              rows={scenarios}
              meta={pageMeta}
              loading={false}
              searchValue={search.value}
              onSearchChange={search.onChange}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              onEdit={handleOpenEditModal}
              onToggleStatus={handleToggleStatus}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      <CreateScenarioModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        neighborhoods={neighborhoods}
        onScenarioCreated={handleScenarioCreatedOrUpdated}
      />

      <EditScenarioModal
        isOpen={isEditModalOpen}
        scenario={selectedScenario}
        neighborhoods={neighborhoods}
        onClose={closeEditModal}
        onScenarioUpdated={handleScenarioCreatedOrUpdated}
      />
    </div>
  );
}
