/**
 * Types for Receipt Template Builder
 */

export type TemplateComponentType =
  | "logo"
  | "title"
  | "client-data"
  | "concepts-table"
  | "hourly-cost"
  | "total"
  | "bank-data"
  | "payment-qr"
  | "free-text"
  | "date";

export interface TemplateComponentConfig {
  id: string; // Unique ID for the component instance
  type: TemplateComponentType;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width?: number;
    height?: number;
  };
  props?: Record<string, any>; // Component-specific properties
}

export interface TemplateContent {
  components: TemplateComponentConfig[];
  metadata?: {
    version?: string;
    createdAt?: string;
  };
}

export interface ComponentDefinition {
  type: TemplateComponentType;
  label: string;
  icon: string; // Lucide icon name
  description: string;
  defaultProps?: Record<string, any>;
}

export const AVAILABLE_COMPONENTS: ComponentDefinition[] = [
  {
    type: "logo",
    label: "Logo",
    icon: "Image",
    description: "Logo de la organización",
    defaultProps: {},
  },
  {
    type: "title",
    label: "Título",
    icon: "Type",
    description: "Título del recibo",
    defaultProps: { text: "RECIBO DE PAGO" },
  },
  {
    type: "client-data",
    label: "Datos del Cliente",
    icon: "User",
    description: "Información del cliente (nombre, email, teléfono)",
    defaultProps: {},
  },
  {
    type: "concepts-table",
    label: "Tabla de Conceptos",
    icon: "Table",
    description: "Tabla con los conceptos de pago",
    defaultProps: {},
  },
  {
    type: "hourly-cost",
    label: "Costo por Hora",
    icon: "Clock",
    description: "Precio por hora del sub-escenario",
    defaultProps: {},
  },
  {
    type: "total",
    label: "Total",
    icon: "DollarSign",
    description: "Monto total a pagar",
    defaultProps: {},
  },
  {
    type: "bank-data",
    label: "Datos Bancarios",
    icon: "Building2",
    description: "Información bancaria para pago",
    defaultProps: {},
  },
  {
    type: "payment-qr",
    label: "QR de Pago",
    icon: "QrCode",
    description: "Código QR para pago",
    defaultProps: {},
  },
  {
    type: "free-text",
    label: "Texto Libre",
    icon: "FileText",
    description: "Campo de texto libre",
    defaultProps: { text: "" },
  },
  {
    type: "date",
    label: "Fecha",
    icon: "Calendar",
    description: "Fecha de generación del recibo",
    defaultProps: {},
  },
];
