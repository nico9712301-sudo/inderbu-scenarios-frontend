"use client";

import { FiGrid, FiClock, FiUsers } from "react-icons/fi";
import { Badge } from "@/shared/ui/badge";

interface ScenarioBadgesProps {
  scenarioName: string;
  numberOfPlayers: number;
  numberOfSpectators: number;
}

/**
 * Scenario Badges Molecule
 * Displays scenario metadata as visual badges
 */
export function ScenarioBadges({ 
  scenarioName,
  numberOfPlayers,
  numberOfSpectators 
}: ScenarioBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {/* Base scenario badge */}
      <Badge className="flex items-center bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100">
        <FiGrid className="h-4 w-4 mr-1" />
        {scenarioName}
      </Badge>

      {/* Capacity badge */}
      {numberOfPlayers > 0 && (
        <Badge className="flex items-center bg-primary-100 text-primary-800 border-primary-300 hover:bg-primary-200">
          <FiUsers className="h-4 w-4 mr-1" />
          {numberOfPlayers} jugadores
        </Badge>
      )}

      {/* Spectators badge */}
      <Badge className="flex items-center bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100">
        <FiUsers className="h-4 w-4 mr-1" />
        {numberOfSpectators} espectadores
      </Badge>
    </div>
  );
}

ScenarioBadges.displayName = "ScenarioBadges";