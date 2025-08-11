"use client";

import { SubScenariosFiltersCard } from "../molecules/SubScenariosFiltersCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { useSubScenarioData } from "../../hooks/use-sub-scenario-data";
import { CreateSubScenarioDialog } from "./create-sub-scenario-dialog";
import { EditSubScenarioDialog } from "./edit-sub-scenario-dialog";
import { SubScenarioTable } from "./sub-scenario-table";
import { Download, Filter, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useState } from "react";


export function SubScenarioManagement() {
  const data = useSubScenarioData();
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  return (
    <>
      <div className="space-y-6">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Sub-Escenarios Deportivos
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" /> Filtros
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nuevo
            </Button>
          </div>
        </div>

        {/* filters */}
        <SubScenariosFiltersCard
          visible={showFilters}
          filters={data.filters}
          onChange={(f) => data.onFilterChange(f)}
          onToggle={() => setShowFilters(false)}
        />

        {/* tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="inactive">Inactivos</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </div>

          <TabsContent value="all" className="mt-0">
            <SubScenarioTable
              rows={data.subScenarios}
              meta={data.pageMeta}
              loading={data.loading}
              filters={{
                page: data.filters.page ?? 1,
                search: data.filters.search ?? "",
              }}
              onPage={data.onPageChange}
              onSearch={data.onSearch}
              onEdit={(row) => {
                setSelected(row);
                setEditOpen(true);
              }}
            />
          </TabsContent>

          {/* filtered tabs reuse same table but pre-filtered in memory */}
          {["active", "inactive"].map((k) => (
            <TabsContent key={k} value={k} className="mt-0">
              <SubScenarioTable
                rows={data.subScenarios.filter(
                  (r) => r.state === (k === "active"),
                )}
                meta={data.pageMeta}
                loading={data.loading}
                filters={{
                  page: data.filters.page ?? 1,
                  search: data.filters.search ?? "",
                }}
                onPage={data.onPageChange}
                onSearch={data.onSearch}
                onEdit={(row) => {
                  setSelected(row);
                  setEditOpen(true);
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* dialogs */}
      <CreateSubScenarioDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditSubScenarioDialog
        open={editOpen}
        subScenario={selected}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
