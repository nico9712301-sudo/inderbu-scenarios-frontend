import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
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

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  logo: {
    width: 128,
    height: 64,
    backgroundColor: "#e5e7eb",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    marginBottom: 4,
  },
  table: {
    width: "100%",
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    padding: 8,
  },
  tableCellRight: {
    flex: 1,
    padding: 8,
    textAlign: "right",
  },
  totalContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#d1fae5",
    borderWidth: 2,
    borderColor: "#10b981",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#065f46",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  qrImage: {
    width: 128,
    height: 128,
  },
});

interface TemplatePDFRendererProps {
  content: TemplateContent;
}

export function TemplatePDFDocument({ content }: TemplatePDFRendererProps) {
  const renderComponent = (component: TemplateComponentConfig) => {
    const { type, props } = component;

    switch (type) {
      case "logo":
        return (
          <View style={styles.logo}>
            <Text>LOGO</Text>
          </View>
        );

      case "title":
        return (
          <Text style={styles.title}>
            {props?.text || "RECIBO DE PAGO"}
          </Text>
        );

      case "client-data":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del Cliente</Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Nombre:</Text> {MOCK_DATA.clientName}
            </Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Email:</Text> {MOCK_DATA.clientEmail}
            </Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Teléfono:</Text> {MOCK_DATA.clientPhone}
            </Text>
          </View>
        );

      case "concepts-table":
        return (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Concepto</Text>
              <Text style={styles.tableCellRight}>Horas</Text>
              <Text style={styles.tableCellRight}>Precio/Hora</Text>
              <Text style={styles.tableCellRight}>Total</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{MOCK_DATA.subScenarioName}</Text>
              <Text style={styles.tableCellRight}>{MOCK_DATA.totalHours}</Text>
              <Text style={styles.tableCellRight}>€{MOCK_DATA.hourlyCost}</Text>
              <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>€{MOCK_DATA.totalAmount}</Text>
            </View>
          </View>
        );

      case "hourly-cost":
        return (
          <View style={[styles.section, { backgroundColor: "#dbeafe" }]}>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Costo por Hora:</Text> €{MOCK_DATA.hourlyCost}
            </Text>
          </View>
        );

      case "total":
        return (
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>€{MOCK_DATA.totalAmount}</Text>
          </View>
        );

      case "bank-data":
        return (
          <View style={[styles.section, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.sectionTitle}>Datos Bancarios</Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Banco:</Text> {MOCK_DATA.bankName}
            </Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Cuenta:</Text> {MOCK_DATA.bankAccount}
            </Text>
          </View>
        );

      case "payment-qr":
        return (
          <View style={styles.qrContainer}>
            <Image src={MOCK_DATA.qrCodeUrl} style={styles.qrImage} />
            <Text style={{ fontSize: 10, marginTop: 8, color: "#6b7280" }}>Escanea para pagar</Text>
          </View>
        );

      case "free-text":
        return (
          <Text style={{ marginBottom: 16 }}>
            {props?.text || "Texto libre de ejemplo"}
          </Text>
        );

      case "date":
        return (
          <Text style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold" }}>Fecha:</Text> {MOCK_DATA.currentDate} {MOCK_DATA.currentTime}
          </Text>
        );

      default:
        return (
          <Text style={{ marginBottom: 16, color: "#6b7280" }}>
            Componente: {type}
          </Text>
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
    <Document>
      <Page size="A4" style={styles.page}>
        {sortedComponents.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#6b7280" }}>
            La plantilla no tiene componentes configurados.
          </Text>
        ) : (
          sortedComponents.map((component) => (
            <View key={component.id}>
              {renderComponent(component)}
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
