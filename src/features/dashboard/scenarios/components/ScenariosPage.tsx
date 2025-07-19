"use client";

import { Download, Filter, Plus } from "lucide-react";
import { useState } from "react";

import { ScenariosFiltersCard } from "@/features/scenarios/components/molecules/ScenariosFiltersCard";
import { IScenariosDataResponse } from "../application/GetScenariosDataUseCase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { CreateScenarioModal } from "./organisms/create-scenario-modal";
import { EditScenarioModal } from "./organisms/edit-scenario-modal";
import { useScenarioModals } from "../hooks/use-scenario-modals";
import { useScenariosData } from "../hooks/use-scenarios-data";
import { ScenariosTable } from "./organisms/scenarios-table";
import { NavValues } from "../utils/nav-values";
import { Button } from "@/shared/ui/button";
import { Scenario } from "@/services/api";

interface ScenariosPageProps {
  initialData: IScenariosDataResponse;
}

export function ScenariosPage({ initialData }: ScenariosPageProps) {
  // State management with custom hooks
  const {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  } = useScenariosData();

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

  // Local data state
  const [scenarios, setScenarios] = useState(initialData.scenarios);
  const [neighborhoods] = useState(initialData.neighborhoods);
  const pageMeta = buildPageMeta(initialData.meta.totalItems);


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

  const handleScenarioCreated = (newScenario: Scenario) => {
    setScenarios(prev => [newScenario, ...prev]);
  };

  const handleScenarioUpdated = (updatedScenario: Scenario) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === selectedScenario?.id ? updatedScenario : scenario
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Escenarios Deportivos
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleFilters}
            variant="outline"
            size="sm"
          >
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
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            {NavValues.map((k) => (
              <TabsTrigger key={k.value} value={k.value}>
                {k.label}
              </TabsTrigger>
            ))} 
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtered tabs */}
        {NavValues.map((k) => (
          <TabsContent key={k.value} value={k.value} className="mt-0">
            <ScenariosTable
              rows={k.value === "all" ? scenarios : scenarios.filter((r) => r.active === (k.value === "active"))}
              meta={pageMeta}
              loading={false}
              filters={{
                page: pageMeta?.page || 1,
                search: filters.search || "",
              }}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              onSearch={onSearch}
              onEdit={handleOpenEditModal}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      <CreateScenarioModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        neighborhoods={neighborhoods}
        onScenarioCreated={handleScenarioCreated}
      />

      <EditScenarioModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        scenario={selectedScenario}
        neighborhoods={neighborhoods}
        onScenarioUpdated={handleScenarioUpdated}
      />
    </div>
  );
}