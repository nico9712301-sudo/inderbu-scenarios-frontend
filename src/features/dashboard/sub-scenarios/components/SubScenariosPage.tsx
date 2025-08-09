"use client";

import { CreateSubScenarioDialog } from "@/features/sub-scenario/components/organisms/create-sub-scenario-dialog";
import { SubScenariosFiltersCard } from "@/features/sub-scenario/components/molecules/SubScenariosFiltersCard";
import { EditSubScenarioDialog } from "@/features/sub-scenario/components/organisms/edit-sub-scenario-dialog";
import { SubScenarioTable } from "@/features/sub-scenario/components/organisms/sub-scenario-table";
import { useSubScenarioData } from "@/features/sub-scenario/hooks/use-sub-scenario-data";
import { ISubScenariosDataResponse } from "../application/GetSubScenariosDataUseCase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useDebouncedSearch } from "@/shared/hooks/use-debounced-search";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Filter, Plus } from "lucide-react";
import { NavValues } from "../utils/nav-values";
import { SubScenario } from "@/services/api";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";



interface SubScenariosPageProps {
  initialData: ISubScenariosDataResponse;
}

export function SubScenariosPage({ initialData }: SubScenariosPageProps) {
  const router = useRouter();

  // State management with custom hooks
  const {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
    subScenarios,
    scenarios,
    activityAreas,
    neighborhoods,
    fieldSurfaceTypes,
    loading,
    toggleSubScenarioStatus,
  } = useSubScenarioData();

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

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<SubScenario | null>(null);

  // Build page meta
  const pageMeta = buildPageMeta(initialData.meta.totalItems);

  // Event handlers
  const handleFiltersChange = (newFilters: any) => {
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({ search: "", scenarioId: undefined, activityAreaId: undefined, neighborhoodId: undefined });
  };

  const handleOpenEditModal = (subScenario: SubScenario) => {
    setSelected(subScenario);
    setEditOpen(true);
  };

  const handleSubScenarioCreatedOrUpdated = useCallback(
    (mutatedSubScenario: SubScenario) => {
      router.refresh();
      setCreateOpen(false);
      setEditOpen(false);
      setSelected(null);
    },
    [router]
  );

  const handleToggleStatus = useCallback(async (subScenario: SubScenario) => {
    await toggleSubScenarioStatus(subScenario, 
      () => router.refresh(), // onSuccess
      (error) => console.error("Toggle error:", error) // onError
    );
  }, [toggleSubScenarioStatus, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Sub-Escenarios Deportivos
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Sub-Escenario
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <SubScenariosFiltersCard
        visible={showFilters}
        filters={filters as any}
        onChange={handleFiltersChange}
        onToggle={clearFilters}
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>

        {/* Filtered tabs */}
        {NavValues.map((k) => (
          <TabsContent key={k.value} value={k.value} className="mt-0">
            <SubScenarioTable
              rows={subScenarios}
              meta={pageMeta}
              loading={loading}
              searchValue={search.value}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              onSearch={search.onChange}
              onEdit={handleOpenEditModal}
              onToggleStatus={handleToggleStatus}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialogs */}
      <CreateSubScenarioDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <EditSubScenarioDialog
        open={editOpen}
        subScenario={selected}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
