"use client";

import { FlexibleScheduler } from "@/presentation/features/reservations/components/flexible-scheduler";
import { ScenarioImageCarousel } from "./scenario-image-carousel";
import { ScenarioInfoCard } from "./scenario-info-card";
import { SubScenarioBackend } from "@/infrastructure/transformers/SubScenarioTransformer";
import { SerializedAvailabilityResponse } from "@/presentation/utils/serialization.utils";
import { slidesPlaceerholderScenario } from "@/shared/mock-data/slides-scenario";


interface Props {
  subScenario: SubScenarioBackend;
  availabilityData?: SerializedAvailabilityResponse;
}

export function ScenarioDetail({ subScenario, availabilityData }: Props) {
  return (
    <div className="space-y-8">
      {/* Main content - Imagen e información del escenario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Imagen e información */}
        <div className="lg:col-span-3 space-y-6">
          <ScenarioImageCarousel imagesGallery={subScenario?.imageGallery || slidesPlaceerholderScenario}/>
          <ScenarioInfoCard subScenario={subScenario} />
        </div>
      </div>

      {/* Configurador de reservas - Full width abajo */}
      <div className="w-full">
        <FlexibleScheduler
          subScenarioId={subScenario.id!}
          initialAvailabilityData={availabilityData}
        />
      </div>
    </div>
  );
}
