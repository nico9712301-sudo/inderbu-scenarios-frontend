"use client";

import type { TemplateContent, TemplateComponentConfig } from "../template-builder/types/template-builder.types";
import type { ReceiptPlainObject } from "@/entities/billing/domain/ReceiptEntity";
import type { ReservationDto } from "@/entities/reservation/model/types";

interface ReceiptRendererProps {
  receipt: ReceiptPlainObject;
  reservation: ReservationDto;
  content: TemplateContent;
}

export function ReceiptRenderer({ 
  receipt, 
  reservation,
  content
}: ReceiptRendererProps) {
  // Get real data from reservation and receipt
  const clientName = reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : "N/A";
  const clientEmail = reservation.user?.email || "N/A";
  const clientPhone = reservation.user?.phone || "N/A";
  const scenarioName = reservation.subScenario?.scenario?.name || "Escenario";
  const subScenarioName = reservation.subScenario?.name || "Sub-escenario";
  
  // Calculate total hours from receipt data
  const totalHours = receipt.variablesValues.hourlyPrice > 0 
    ? Math.round(receipt.variablesValues.totalCost / receipt.variablesValues.hourlyPrice)
    : 0;
  
  // Format price values
  const formatCOP = (value: number) => {
    return Math.round(value).toLocaleString('es-CO');
  };

  const formattedHourlyPrice = formatCOP(receipt.variablesValues.hourlyPrice);
  const formattedTotalAmount = formatCOP(receipt.variablesValues.totalCost);
  
  // Format dates
  const reservationDate = reservation.date 
    ? new Date(reservation.date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("es-ES");
  
  const currentDate = new Date().toLocaleDateString("es-ES");
  const currentTime = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const renderComponent = (component: TemplateComponentConfig) => {
    const { type, props } = component;

    switch (type) {
      case "logo":
        return (
          <div className="mb-4">
            <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              LOGO
            </div>
          </div>
        );

      case "title":
        return (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-center">
              {props?.text || "RECIBO DE PAGO"}
            </h1>
          </div>
        );

      case "client-data":
        return (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Datos del Cliente</h3>
            <p><strong>Nombre:</strong> {clientName}</p>
            <p><strong>Email:</strong> {clientEmail}</p>
            <p><strong>Teléfono:</strong> {clientPhone}</p>
          </div>
        );

      case "concepts-table":
        return (
          <div className="mb-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Concepto</th>
                  <th className="border border-gray-300 p-2 text-right">Horas</th>
                  <th className="border border-gray-300 p-2 text-right">Precio/Hora</th>
                  <th className="border border-gray-300 p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">{subScenarioName}</td>
                  <td className="border border-gray-300 p-2 text-right">{totalHours}</td>
                  <td className="border border-gray-300 p-2 text-right">
                    ${formattedHourlyPrice}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-semibold">
                    ${formattedTotalAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case "hourly-cost":
        return (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p>
              <strong>Costo por Hora:</strong>{" "}
              ${formattedHourlyPrice}
            </p>
          </div>
        );

      case "total":
        return (
          <div className="mb-4 p-4 bg-green-50 rounded border-2 border-green-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">TOTAL:</span>
              <span className="text-2xl font-bold text-green-700">${formattedTotalAmount}</span>
            </div>
          </div>
        );

      case "bank-data":
        return (
          <div className="mb-4 p-4 bg-yellow-50 rounded">
            <h3 className="font-semibold mb-2">Datos Bancarios</h3>
            <p><strong>Banco:</strong> Banco Ejemplo</p>
            <p><strong>Cuenta:</strong> ES12 3456 7890 1234 5678 9012</p>
          </div>
        );

      case "payment-qr":
        return (
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-white border-2 border-gray-300 rounded">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Recibo ${receipt.id} - ${formattedTotalAmount} COP`)}`}
                alt="QR de Pago"
                className="w-32 h-32"
              />
              <p className="text-xs text-center mt-2 text-gray-600">Escanea para pagar</p>
            </div>
          </div>
        );

      case "free-text":
        return (
          <div className="mb-4">
            <p className="text-sm">{props?.text || ""}</p>
          </div>
        );

      case "date":
        return (
          <div className="mb-4">
            <p><strong>Fecha:</strong> {currentDate} {currentTime}</p>
          </div>
        );

      default:
        return (
          <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-500">
            Componente: {type}
          </div>
        );
    }
  };

  // Sort components by position (y coordinate) for proper rendering order
  const sortedComponents = [...(content.components || [])].sort((a, b) => {
    const yA = a.position?.y || 0;
    const yB = b.position?.y || 0;
    return yA - yB;
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 shadow-lg" style={{ minHeight: "800px" }}>
      {sortedComponents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>La plantilla no tiene componentes configurados.</p>
        </div>
      ) : (
        sortedComponents.map((component) => (
          <div key={component.id}>
            {renderComponent(component)}
          </div>
        ))
      )}
    </div>
  );
}
