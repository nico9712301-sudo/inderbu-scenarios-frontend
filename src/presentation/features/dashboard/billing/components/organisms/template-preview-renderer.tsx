"use client";

import type { TemplateContent, TemplateComponentConfig } from "../template-builder/types/template-builder.types";

// Mock data for preview
const MOCK_DATA = {
  clientName: "Juan Pérez",
  clientEmail: "juan.perez@example.com",
  clientPhone: "+34 600 123 456",
  scenarioName: "Cancha de Fútbol 7",
  subScenarioName: "Fútbol 7 - Campo Principal",
  reservationDate: new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  hourlyCost: "25.00",
  totalHours: 2,
  totalAmount: "50.00",
  bankAccount: "ES12 3456 7890 1234 5678 9012",
  bankName: "Banco Ejemplo",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ejemplo",
  currentDate: new Date().toLocaleDateString("es-ES"),
  currentTime: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
};

interface TemplatePreviewRendererProps {
  content: TemplateContent;
  hourlyPrice?: number;
  totalAmount?: number;
  totalHours?: number;
  onHourlyPriceChange?: (value: number) => void;
  onTotalAmountChange?: (value: number) => void;
  onTotalManuallyEdited?: (edited: boolean) => void;
}

export function TemplatePreviewRenderer({ 
  content, 
  hourlyPrice, 
  totalAmount,
  totalHours,
  onHourlyPriceChange,
  onTotalAmountChange,
  onTotalManuallyEdited
}: TemplatePreviewRendererProps) {
  // Format price values - hourlyPrice and totalAmount are in COP (pesos colombianos)
  // Display as whole numbers with thousand separators for easy editing
  const formatCOP = (value: number | undefined, defaultValue: string) => {
    if (value === undefined) return defaultValue;
    // Remove decimals and format with thousand separators
    return Math.round(value).toLocaleString('es-CO');
  };

  const formattedHourlyPrice = formatCOP(hourlyPrice, MOCK_DATA.hourlyCost);
  const formattedTotalAmount = formatCOP(totalAmount, MOCK_DATA.totalAmount);
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
            <p><strong>Nombre:</strong> {MOCK_DATA.clientName}</p>
            <p><strong>Email:</strong> {MOCK_DATA.clientEmail}</p>
            <p><strong>Teléfono:</strong> {MOCK_DATA.clientPhone}</p>
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
                  <td className="border border-gray-300 p-2">{MOCK_DATA.subScenarioName}</td>
                  <td className="border border-gray-300 p-2 text-right">{totalHours !== undefined ? totalHours : MOCK_DATA.totalHours}</td>
                  <td className="border border-gray-300 p-2 text-right">
                    {onHourlyPriceChange ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-600">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formattedHourlyPrice}
                          onChange={(e) => {
                            // Remove all non-numeric characters except for potential formatting
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                            onHourlyPriceChange(numericValue);
                          }}
                          onBlur={(e) => {
                            // Re-format on blur
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                            onHourlyPriceChange(numericValue);
                          }}
                          className="w-24 text-right border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-1 min-w-[70px]"
                          placeholder="0"
                        />
                      </div>
                    ) : (
                      `$${formattedHourlyPrice}`
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-semibold">
                    {onTotalAmountChange ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-600 font-semibold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formattedTotalAmount}
                          onChange={(e) => {
                            // Remove all non-numeric characters
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                            onTotalAmountChange(numericValue);
                            onTotalManuallyEdited?.(true);
                          }}
                          onBlur={(e) => {
                            // Re-format on blur
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                            onTotalAmountChange(numericValue);
                          }}
                          className="w-24 text-right border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-1 font-semibold min-w-[70px]"
                          placeholder="0"
                        />
                      </div>
                    ) : (
                      `$${formattedTotalAmount}`
                    )}
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
              {onHourlyPriceChange ? (
                <span className="inline-flex items-center gap-1 ml-2">
                  <span className="text-gray-600">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formattedHourlyPrice}
                    onChange={(e) => {
                      // Remove all non-numeric characters
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                      onHourlyPriceChange(numericValue);
                    }}
                    onBlur={(e) => {
                      // Re-format on blur
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                      onHourlyPriceChange(numericValue);
                    }}
                    className="w-32 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-1 min-w-[100px]"
                    placeholder="0"
                  />
                </span>
              ) : (
                `$${formattedHourlyPrice}`
              )}
            </p>
          </div>
        );

      case "total":
        return (
          <div className="mb-4 p-4 bg-green-50 rounded border-2 border-green-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">TOTAL:</span>
              {onTotalAmountChange ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-green-700">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formattedTotalAmount}
                    onChange={(e) => {
                      // Remove all non-numeric characters
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                      onTotalAmountChange(numericValue);
                      onTotalManuallyEdited?.(true);
                    }}
                    onBlur={(e) => {
                      // Re-format on blur
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                      onTotalAmountChange(numericValue);
                    }}
                    className="text-2xl font-bold text-green-700 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-1 py-1 w-36 text-right min-w-[110px]"
                    placeholder="0"
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-green-700">${formattedTotalAmount}</span>
              )}
            </div>
          </div>
        );

      case "bank-data":
        return (
          <div className="mb-4 p-4 bg-yellow-50 rounded">
            <h3 className="font-semibold mb-2">Datos Bancarios</h3>
            <p><strong>Banco:</strong> {MOCK_DATA.bankName}</p>
            <p><strong>Cuenta:</strong> {MOCK_DATA.bankAccount}</p>
          </div>
        );

      case "payment-qr":
        return (
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-white border-2 border-gray-300 rounded">
              <img
                src={MOCK_DATA.qrCodeUrl}
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
            <p className="text-sm">{props?.text || "Texto libre de ejemplo"}</p>
          </div>
        );

      case "date":
        return (
          <div className="mb-4">
            <p><strong>Fecha:</strong> {MOCK_DATA.currentDate} {MOCK_DATA.currentTime}</p>
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
