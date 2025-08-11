import { SubScenario } from "@/presentation/features/home/types/filters.types";
import Image from "next/image";
import Link from "next/link";

interface FacilityCardProps {
  subScenario: SubScenario;
}

export function FacilityCard({ subScenario }: FacilityCardProps) {
  const {
    id,
    name,
    hasCost,
    numberOfSpectators,
    numberOfPlayers,
    recommendations,
    scenario,
    activityArea,
    fieldSurfaceType,
  } = subScenario;

  return (
    <Link href={`/scenario/${id}`} className="block h-full">
      <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm bg-white h-full hover:shadow-md transition">
        <div className="relative w-full aspect-video bg-teal-500">
          {/* 2. Image en modo fill + object‑cover */}
          <Image
            src="https://inderbu.gov.co/escenarios/content/fields/57/12770.jpg"
            alt={name}
            fill
            style={{ objectFit: "cover" }}
            // sizes="(max-width: 640px) 50vw, (max-width: 1024px) 10vw, 13vw"
          />
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col">
          <h3 className="text-l font-bold text-teal-600 mb-1">{name}</h3>
          <p className="text-gray-500 text-sm mb-4">
            {activityArea.name} &bull; {fieldSurfaceType.name}
          </p>

          <div className="text-gray-700 text-sm flex-1 space-y-4 mb-4">
            <p>
              <span className="font-medium">Dirección:</span> {scenario.address}
              , {scenario.neighborhood.name}
            </p>
          </div>

          <span className="text-teal-600 hover:underline font-medium text-sm">
            Conoce más →
          </span>
        </div>
      </div>
    </Link>
  );
}
