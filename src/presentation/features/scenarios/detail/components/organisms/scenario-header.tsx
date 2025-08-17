"use client";

import { ScenarioBreadcrumb } from "../molecules/scenario-breadcrumb";
import { ScenarioBadges } from "../molecules/scenario-badges";

interface ScenarioHeaderProps {
  scenarioName: string;
  numberOfPlayers: number;
  numberOfSpectators: number;
  backUrl?: string;
  backText?: string;
}

/**
 * Scenario Header Organism
 * Complete header section with breadcrumb, title, and badges
 */
export function ScenarioHeader({
  scenarioName,
  numberOfPlayers,
  numberOfSpectators,
  backUrl = "/",
  backText = "Volver a todos los escenarios"
}: ScenarioHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-2 mb-6">
      <div className="flex-1">
        {/* Breadcrumb Navigation */}
        <ScenarioBreadcrumb backUrl={backUrl} backText={backText} />

        {/* Scenario Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-teal-600">
          {scenarioName}
        </h1>

        {/* Enhanced Badge Section with Domain Metadata */}
        <ScenarioBadges 
          scenarioName={scenarioName}
          numberOfPlayers={numberOfPlayers}
          numberOfSpectators={numberOfSpectators}
        />
      </div>
    </div>
  );
}

ScenarioHeader.displayName = "ScenarioHeader";