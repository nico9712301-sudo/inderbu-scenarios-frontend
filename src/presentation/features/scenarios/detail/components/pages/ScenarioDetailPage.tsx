"use client";

import { ScenarioDetail } from "@/presentation/features/scenarios/components/organisms/scenario-detail";
import { MainHeader } from "@/shared/components/organisms/main-header";
import { ScenarioHeader } from "../organisms/scenario-header";

import { SerializedScenarioDetailResponse, SerializedAvailabilityResponse } from "@/presentation/utils/serialization.utils";

export interface ScenarioDetailPageProps {
  initialData: SerializedScenarioDetailResponse;
  availabilityData: SerializedAvailabilityResponse;
  searchParams?: { 
    date?: string; 
    finalDate?: string; 
    weekdays?: string 
  };
}

// Atomic Design: Scenario Detail Page Template
export function ScenarioDetailPage({ initialData, availabilityData, searchParams }: ScenarioDetailPageProps) {
  const { scenario } = initialData;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Organism */}
      <MainHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Scenario Header Organism */}
        <ScenarioHeader
          scenarioName={scenario.name}
          numberOfPlayers={scenario.numberOfPlayers}
          numberOfSpectators={scenario.numberOfSpectators}
        />

        {/* TODO: Add AvailabilitySection here */}
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Disponibilidad</h3>
          <p className="text-sm text-gray-600 mb-2">
            Consultando para: {availabilityData.requestedConfiguration.initialDate}
            {availabilityData.requestedConfiguration.finalDate && 
              ` al ${availabilityData.requestedConfiguration.finalDate}`}
          </p>
          <p className="text-sm">
            Slots disponibles: {availabilityData.stats.availableSlots} de {availabilityData.stats.totalSlots} 
            ({availabilityData.stats.globalAvailabilityPercentage}% disponible)
          </p>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Slots encontrados: {availabilityData.timeSlots.length} | 
              Disponibles en todas las fechas: {availabilityData.timeSlots.filter(slot => slot.isAvailableInAllDates).length}
            </p>
          </div>
        </div>

        {/* Main Content - Existing ScenarioDetail Component */}
        <ScenarioDetail subScenario={scenario} />
      </div>
    </main>
  );
}

// Display name for debugging
ScenarioDetailPage.displayName = "ScenarioDetailPage";
