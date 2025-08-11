"use client";

import { FC } from "react";


export const Recommendations: FC = () => {
  return (
    <div>
      <h3 className="text-base font-medium text-gray-700 mb-2">
        Recomendaciones
      </h3>
      <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
        <li>Traer calzado deportivo adecuado para la superficie</li>
        <li>No se permite el ingreso con alimentos ni bebidas alcohólicas</li>
        <li>Respetar las señalizaciones y normas del escenario</li>
        <li>Se recomienda llegar 15 minutos antes del horario reservado</li>
        <li>Mantener limpio el escenario después de su uso</li>
      </ul>
    </div>
  );
};
