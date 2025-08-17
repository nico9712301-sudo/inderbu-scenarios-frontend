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
      <Badge className="flex items-center bg-teal-50 text-teal-700 border-teal-200">
        <FiGrid className="h-4 w-4 mr-1" />
        {scenarioName}
      </Badge>

      {/* Capacity badge */}
      {numberOfPlayers > 0 && (
        <Badge className="flex items-center bg-orange-50 text-orange-700 border-orange-200">
          <FiUsers className="h-4 w-4 mr-1" />
          {numberOfPlayers} jugadores
        </Badge>
      )}

      {/* Spectators badge */}
      <Badge className="flex items-center bg-indigo-50 text-indigo-700 border-indigo-200">
        <FiUsers className="h-4 w-4 mr-1" />
        {numberOfSpectators} espectadores
      </Badge>

      <Badge className="flex items-center bg-yellow-50 text-yellow-700 border-yellow-200">
        <FiClock className="h-4 w-4 mr-1" />
        Reserva requerida
      </Badge>
    </div>
  );
}

ScenarioBadges.displayName = "ScenarioBadges";