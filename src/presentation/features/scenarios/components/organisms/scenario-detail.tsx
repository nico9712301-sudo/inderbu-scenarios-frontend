"use client";

import { FlexibleScheduler } from "@/presentation/features/reservations/components/flexible-scheduler";
import { IGetScenarioByIdResponse } from "../../interfaces/get-scenario-by-id-res.interface";
import { ScenarioImageCarousel } from "./scenario-image-carousel";
import { ScenarioInfoCard } from "./scenario-info-card";


interface Props {
  subScenario: IGetScenarioByIdResponse;
}

export function ScenarioDetail({ subScenario }: Props) {
  return (
    <div className="space-y-8">
      {/* Main content - Imagen e información del escenario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Imagen e información */}
        <div className="lg:col-span-3 space-y-6">
          <ScenarioImageCarousel />
          <ScenarioInfoCard subScenario={subScenario} />
        </div>
      </div>

      {/* Configurador de reservas - Full width abajo */}
      <div className="w-full">
        <FlexibleScheduler
          subScenarioId={subScenario.id} 
        />
      </div>
    </div>
  );
}
