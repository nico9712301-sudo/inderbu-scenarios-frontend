"use client";

import { IGetScenarioByIdResponse } from "../../interfaces/get-scenario-by-id-res.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FiGrid, FiMapPin, FiTag, FiUser, FiUsers } from "react-icons/fi";
import { scenarioInfoCardItem } from "./scenario-info-card-item";


type Props = { subScenario: IGetScenarioByIdResponse };

export function ScenarioInfoCard({ subScenario }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del escenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {scenarioInfoCardItem(
            "Actividad",
            FiGrid,
            subScenario.activityArea?.name,
          )}
          {scenarioInfoCardItem(
            "Superficie",
            FiMapPin,
            subScenario.fieldSurfaceType?.name,
          )}
          {scenarioInfoCardItem(
            "Jugadores",
            FiUser,
            subScenario.numberOfPlayers,
          )}
          {scenarioInfoCardItem(
            "Espectadores",
            FiUsers,
            subScenario.numberOfSpectators,
          )}
          {scenarioInfoCardItem(
            "Dirección",
            FiMapPin,
            subScenario.scenario.address,
            "md:col-span-2",
          )}
          {scenarioInfoCardItem(
            "Barrio",
            FiMapPin,
            subScenario.scenario.neighborhood.name,
          )}
          {scenarioInfoCardItem(
            "Costo",
            FiTag,
            subScenario.hasCost ? "$pago" : "Gratuito",
          )}
        </div>
      </CardContent>
    </Card>
  );
}
