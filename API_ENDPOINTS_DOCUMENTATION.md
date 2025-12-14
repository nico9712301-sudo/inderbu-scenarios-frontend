# Backend API Endpoints Documentation - Billing Implementation

## Overview

This document provides a complete reference of all backend API endpoints for the billing system implementation. Each endpoint includes request/response DTOs, status codes, and business logic details.

**Base URL:** `http://localhost:3001` (development)

---

## Table of Contents

1. [Sub-Scenario Cost Configuration](#1-sub-scenario-cost-configuration)
2. [Reservations Dashboard](#2-reservations-dashboard)
3. [Receipt Template Management](#3-receipt-template-management)
4. [Generate Receipt](#4-generate-receipt)
5. [Send Receipt by Email](#5-send-receipt-by-email)
6. [View Invoices/Receipts History](#6-view-invoicesreceipts-history)
7. [Customer Upload Proof of Payment](#7-customer-upload-proof-of-payment)
8. [Admin Notifications](#8-admin-notifications)
9. [Confirm Paid Reservation](#9-confirm-paid-reservation)
10. [Free Reservations](#10-free-reservations)

---

## 1. Sub-Scenario Cost Configuration

### 1.1 Admin Enables Cost for a Sub-Scenario

**Endpoint:** `POST /api/sub-scenario-pricing`

**Request DTO:** `CreateSubScenarioPriceDto`

```typescript
{
  subScenarioId: number; // Required, min: 1
  hourlyPrice: number; // Required, positive, max: 10000, max 2 decimals
}
```

**Example Request:**

```json
{
  "subScenarioId": 5,
  "hourlyPrice": 150.0
}
```

**Response DTO:** `SubScenarioPriceResponseDto`

```typescript
{
  id: number;
  subScenarioId: number;
  hourlyPrice: number;
  createdAt: Date;
  updatedAt: Date;
  formattedPrice: string; // e.g., "$150.00 MXN"
}
```

**Example Response:**

```json
{
  "id": 1,
  "subScenarioId": 5,
  "hourlyPrice": 150.0,
  "createdAt": "2025-12-12T06:45:00.000Z",
  "updatedAt": "2025-12-12T06:45:00.000Z",
  "formattedPrice": "$150.00 MXN"
}
```

**Status Codes:**

- `201 Created` - Price created successfully
- `400 Bad Request` - Invalid data
- `409 Conflict` - Sub-scenario already has price configured

---

### 1.2 Get Price for a Sub-Scenario

**Endpoint:** `GET /api/sub-scenario-pricing/sub-scenario/:subScenarioId`

**Request:** Path parameter only

```typescript
{
  subScenarioId: number; // Sub-scenario ID
}
```

**Response DTO:** `SubScenarioPriceResponseDto` (same as above)

**Status Codes:**

- `200 OK` - Price found
- `404 Not Found` - Price not found for this sub-scenario

---

### 1.3 Update Price for a Sub-Scenario

**Endpoint:** `PUT /api/sub-scenario-pricing/sub-scenario/:subScenarioId`

**Request DTO:** `UpdateSubScenarioPriceDto`

```typescript
{
  hourlyPrice: number; // Required, positive, max: 10000, max 2 decimals
}
```

**Example Request:**

```json
{
  "hourlyPrice": 175.5
}
```

**Response DTO:** `SubScenarioPriceResponseDto` (same as above)

**Status Codes:**

- `200 OK` - Price updated successfully
- `400 Bad Request` - Invalid data
- `404 Not Found` - Price not found

---

### 1.4 Delete Price for a Sub-Scenario

**Endpoint:** `DELETE /api/sub-scenario-pricing/sub-scenario/:subScenarioId`

**Request:** Path parameter only

**Response:** `204 No Content`

**Note:** This is automatically called when `hasCost` changes from `true` to `false` in the sub-scenario update endpoint.

**Status Codes:**

- `204 No Content` - Price deleted successfully
- `404 Not Found` - Price not found

---

## 2. Reservations Dashboard

### 2.1 Get Reservations List (with hasCost and hasPaymentProofs)

**Endpoint:** `GET /reservations`

**Query Parameters:**

```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 20
  // ... other filters
}
```

**Example Request:**

```
GET /reservations?page=1&limit=20
```

**Response DTO:** `PageDto<ReservationWithDetailsResponseDto>`

```typescript
{
  data: ReservationWithDetailsResponseDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }
}
```

**ReservationWithDetailsResponseDto:**

```typescript
{
  id: number;
  subScenarioId: number;
  userId: number;
  type: string;                    // 'SINGLE' | 'RANGE'
  initialDate: string;
  finalDate: string | null;
  weekDays: number[] | null;
  comments: string | null;
  reservationStateId: number;
  createdAt: string;
  updatedAt: string;
  hasCost?: boolean;               // NEW: Indicates if sub-scenario has cost
  hasPaymentProofs?: boolean;      // NEW: Indicates if reservation has payment proofs
  subScenario: {
    id: number;
    name: string;
    description: string | null;
    hasCost: boolean;
    // ... other fields
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  reservationState: {
    id: number;
    name: string;
    description: string;
  };
  timeslots: Array<{
    id: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  totalInstances: number;
}
```

**Example Response:**

```json
{
  "data": [
    {
      "id": 1,
      "subScenarioId": 5,
      "userId": 123,
      "type": "RANGE",
      "initialDate": "2025-06-09",
      "finalDate": "2025-06-17",
      "weekDays": [1, 3, 5],
      "comments": null,
      "reservationStateId": 1,
      "hasCost": true,
      "hasPaymentProofs": false,
      "subScenario": {
        /* ... */
      },
      "user": {
        /* ... */
      },
      "reservationState": {
        /* ... */
      },
      "timeslots": [
        /* ... */
      ],
      "totalInstances": 36
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

**Note:** The `hasCost` field determines which menu options are shown:

- **FREE** (`hasCost: false`): Only "Ver detalle"
- **PAID** (`hasCost: true`): "Ver detalle", "Generar recibo", "Enviar recibo por email", "Ver facturas"

---

### 2.2 Get Reservation by ID

**Endpoint:** `GET /reservations/:id`

**Request:** Path parameter only

```typescript
{
  id: number; // Reservation ID
}
```

**Response DTO:** `ReservationWithDetailsResponseDto` (same structure as above)

**Status Codes:**

- `200 OK` - Reservation found
- `404 Not Found` - Reservation not found

---

## 3. Receipt Template Management

### 3.1 Get Receipt Templates

**Endpoint:** `GET /api/templates/type/receipt`

**Request:** Path parameter

```typescript
{
  type: string; // 'receipt' | 'invoice' | 'email'
}
```

**Response DTO:** `TemplateResponseDto[]`

```typescript
[
  {
    id: number;
    name: string;
    type: TemplateTypeResponseDto;  // 'receipt' | 'invoice' | 'email'
    content: string;                // JSON string
    isActive: boolean;
    createdBy: number | null;
    createdAt: Date;
    updatedAt: Date;
  }
]
```

**Example Response:**

```json
[
  {
    "id": 1,
    "name": "Basic Receipt Template",
    "type": "receipt",
    "content": "{\"components\": [{\"type\": \"logo\"}]}",
    "isActive": true,
    "createdBy": 1,
    "createdAt": "2025-12-12T06:45:00.000Z",
    "updatedAt": "2025-12-12T06:45:00.000Z"
  }
]
```

**Alternative Endpoint:** `GET /api/templates/receipts/active` - Returns only active receipt templates

---

### 3.2 Create New Receipt Template

**Endpoint:** `POST /api/templates`

**Request DTO:** `CreateTemplateDto`

```typescript
{
  name: string;                    // Required, minLength: 3
  type: TemplateTypeDto;          // Required, enum: 'receipt' | 'invoice' | 'email'
  content: string;                 // Required, valid JSON string
  description?: string;            // Optional
  active?: boolean;                // Optional, default: true
}
```

**Example Request:**

```json
{
  "name": "Basic Receipt Template",
  "type": "receipt",
  "content": "{\"components\": [{\"type\": \"logo\", \"position\": {\"x\": 0, \"y\": 0}}]}",
  "description": "Basic receipt template for payments",
  "active": true
}
```

**Response DTO:** `TemplateResponseDto` (same structure as above)

**Status Codes:**

- `201 Created` - Template created successfully
- `400 Bad Request` - Invalid data

---

### 3.3 Update Template

**Endpoint:** `PUT /api/templates/:id`

**Request DTO:** `UpdateTemplateDto`

```typescript
{
  name?: string;                   // Optional, minLength: 3
  content?: string;                // Optional, valid JSON string
  description?: string;            // Optional
  active?: boolean;                // Optional
}
```

**Response DTO:** `TemplateResponseDto` (same structure as above)

**Status Codes:**

- `200 OK` - Template updated successfully
- `400 Bad Request` - Invalid data
- `404 Not Found` - Template not found

---

### 3.4 Additional Template Endpoints

- `GET /api/templates/:id` - Get template by ID
- `GET /api/templates` - Get all templates (with pagination)
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/duplicate` - Duplicate template
- `PUT /api/templates/:id/activate` - Activate template
- `PUT /api/templates/:id/deactivate` - Deactivate template
- `POST /api/templates/validate` - Validate template content

---

## 4. Generate Receipt

**Endpoint:** `POST /api/receipts/generate`

**Request DTO:** `GenerateReceiptDto`

```typescript
{
  reservationId: number;           // Required, min: 1
  templateId: number;              // Required, min: 1
  customerEmail?: string;          // Optional, valid email format
}
```

**Example Request:**

```json
{
  "reservationId": 123,
  "templateId": 1,
  "customerEmail": "customer@example.com"
}
```

**Response DTO:** `ReceiptResponseDto`

```typescript
{
  id: number;
  reservationId: number;
  templateId: number;
  templateName?: string;            // Template name
  pdfUrl: string;
  generatedAt: Date;
  sentAt?: Date;
  sentToEmail?: string;
  isGenerated: boolean;
  isSent: boolean;
}
```

**Example Response:**

```json
{
  "id": 1,
  "reservationId": 123,
  "templateId": 1,
  "templateName": "Basic Receipt Template",
  "pdfUrl": "https://r2.example.com/receipts/receipt_123_customer_2025-12-12.pdf",
  "generatedAt": "2025-12-12T06:45:00.000Z",
  "sentAt": null,
  "sentToEmail": null,
  "isGenerated": true,
  "isSent": false
}
```

**Status Codes:**

- `201 Created` - Receipt generated successfully
- `400 Bad Request` - Error in receipt generation

**Business Logic:**

- Validates reservation exists and is in "Pendiente" or "Confirmada" status
- Validates template exists and is active with type "receipt"
- Fetches real customer data (name, email) from database
- Fetches sub-scenario and scenario data
- Calculates total cost from `sub_scenarios_prices` table
- Generates PDF using Puppeteer
- Uploads PDF to Cloudflare R2
- Saves receipt record in database

---

## 5. Send Receipt by Email

**Endpoint:** `POST /api/receipts/send`

**Request DTO:** `SendReceiptDto`

```typescript
{
  receiptId: number; // Required, min: 1
  email: string; // Required, valid email format
}
```

**Example Request:**

```json
{
  "receiptId": 1,
  "email": "customer@example.com"
}
```

**Response DTO:** `ReceiptResponseDto` (same structure as above)

**Example Response:**

```json
{
  "id": 1,
  "reservationId": 123,
  "templateId": 1,
  "templateName": "Basic Receipt Template",
  "pdfUrl": "https://r2.example.com/receipts/receipt_123_customer_2025-12-12.pdf",
  "generatedAt": "2025-12-12T06:45:00.000Z",
  "sentAt": "2025-12-12T07:00:00.000Z",
  "sentToEmail": "customer@example.com",
  "isGenerated": true,
  "isSent": true
}
```

**Status Codes:**

- `200 OK` - Receipt sent successfully
- `400 Bad Request` - Error sending receipt

**Business Logic:**

- Downloads PDF from R2
- Sends email with PDF attachment using Nodemailer (Ethereal)
- Marks receipt as sent (`sentAt` and `sentToEmail` fields)
- Saves updated receipt record

---

## 6. View Invoices/Receipts History

### 6.1 Get All Receipts for a Reservation

**Endpoint:** `GET /api/receipts/reservation/:reservationId`

**Request:** Path parameter only

```typescript
{
  reservationId: number; // Reservation ID
}
```

**Response DTO:** `ReceiptResponseDto[]`

```typescript
[
  {
    id: number;
    reservationId: number;
    templateId: number;
    templateName?: string;         // Template name (for "Plantilla usada" column)
    pdfUrl: string;
    generatedAt: Date;              // "Fecha de generación" column
    sentAt?: Date;                  // Used to determine "Enviado por email"
    sentToEmail?: string;
    isGenerated: boolean;
    isSent: boolean;                // "Enviado por email" column (true/false)
  }
]
```

**Example Response:**

```json
[
  {
    "id": 1,
    "reservationId": 123,
    "templateId": 1,
    "templateName": "Basic Receipt Template",
    "pdfUrl": "https://r2.example.com/receipts/receipt_123_customer_2025-12-12.pdf",
    "generatedAt": "2025-12-12T06:45:00.000Z",
    "sentAt": "2025-12-12T07:00:00.000Z",
    "sentToEmail": "customer@example.com",
    "isGenerated": true,
    "isSent": true
  },
  {
    "id": 2,
    "reservationId": 123,
    "templateId": 2,
    "templateName": "Premium Receipt Template",
    "pdfUrl": "https://r2.example.com/receipts/receipt_123_customer_2025-12-13.pdf",
    "generatedAt": "2025-12-13T08:00:00.000Z",
    "sentAt": null,
    "sentToEmail": null,
    "isGenerated": true,
    "isSent": false
  }
]
```

**Note:** Each receipt has a download button that calls `GET /api/receipts/:id/download`

---

### 6.2 Download Receipt PDF

**Endpoint:** `GET /api/receipts/:id/download`

**Request:** Path parameter only

```typescript
{
  id: number; // Receipt ID
}
```

**Response:** PDF file stream

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="receipt_{id}.pdf"`
- `Content-Length: {file_size}`

**Status Codes:**

- `200 OK` - PDF downloaded successfully
- `404 Not Found` - Receipt not found or no PDF associated

**Usage Example (Frontend):**

```typescript
const downloadReceipt = async (receiptId: number) => {
  const response = await fetch(`/api/receipts/${receiptId}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt_${receiptId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
```

---

## 7. Customer Upload Proof of Payment

**Endpoint:** `POST /api/payment-proofs/upload`

**Request:** `multipart/form-data`

```typescript
{
  file: File; // Required, PDF/JPG/JPEG/PNG, max 10MB
  reservationId: string; // Required, will be parsed to number
  uploadedByUserId: string; // Required, will be parsed to number
}
```

**Example Request (FormData):**

```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("reservationId", "123");
formData.append("uploadedByUserId", "456");

fetch("/api/payment-proofs/upload", {
  method: "POST",
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**Response DTO:** Payment Proof Response

```typescript
{
  id: number;
  reservationId: number;
  fileUrl: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
  createdAt: Date;
}
```

**Example Response:**

```json
{
  "id": 1,
  "reservationId": 123,
  "fileUrl": "https://r2.example.com/payment-receipts/proof_123_2025-12-12.pdf",
  "originalFileName": "comprobante_pago.pdf",
  "mimeType": "application/pdf",
  "fileSize": 1024000,
  "uploadedBy": 456,
  "createdAt": "2025-12-12T06:45:00.000Z"
}
```

**Status Codes:**

- `201 Created` - Payment proof uploaded successfully
- `400 Bad Request` - Invalid file type, size, or validation error

**Validations:**

- File type: Only `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`
- File size: Maximum 10MB
- Time limit: Must be uploaded within 24 hours of reservation creation
- Reservation status: Cannot upload if reservation is already confirmed or cancelled
- Rate limiting: Minimum 5 minutes between uploads
- Maximum proofs: 5 proofs per reservation

**Business Logic:**

- Validates file type and size
- Validates business rules (24-hour limit, reservation status, etc.)
- Uploads file to Cloudflare R2 in `payment-receipts` folder
- Creates payment proof record in database
- Automatically creates notification for administrators (`PAYMENT_PROOF_UPLOADED`)

---

### 7.1 Get Payment Proofs for a Reservation

**Endpoint:** `GET /api/payment-proofs/reservation/:reservationId`

**Request:** Path parameter only

**Response DTO:** Payment Proof Response[]

```typescript
[
  {
    id: number;
    reservationId: number;
    fileUrl: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: number;
    createdAt: Date;
  }
]
```

---

## 8. Admin Notifications

### 8.1 Get Unread Notifications

**Endpoint:** `GET /api/notifications/unread/all`

**Request:** No parameters

**Response DTO:** `NotificationResponseDto[]`

```typescript
[
  {
    id: number;
    type: NotificationTypeResponseDto;  // 'payment_proof_uploaded' | 'receipt_generated' | 'receipt_sent'
    title: string;                      // e.g., "Nuevo comprobante de pago para reserva #123"
    message: string;
    reservationId: number | null;
    paymentProofId: number | null;
    receiptId: number | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }
]
```

**Example Response:**

```json
[
  {
    "id": 1,
    "type": "payment_proof_uploaded",
    "title": "Nuevo comprobante de pago para reserva #123",
    "message": "Un cliente ha subido un comprobante de pago para la reserva #123",
    "reservationId": 123,
    "paymentProofId": 1,
    "receiptId": null,
    "isRead": false,
    "readAt": null,
    "createdAt": "2025-12-12T06:45:00.000Z",
    "updatedAt": "2025-12-12T06:45:00.000Z"
  }
]
```

---

### 8.2 Get Unread Notifications Count

**Endpoint:** `GET /api/notifications/unread/count`

**Request:** No parameters

**Response:**

```typescript
{
  count: number;
}
```

**Example Response:**

```json
{
  "count": 5
}
```

---

### 8.3 Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`

**Request:** Path parameter only

```typescript
{
  id: number; // Notification ID
}
```

**Request Body (optional):**

```typescript
{
  // No body required, but can include additional data if needed
}
```

**Response DTO:** `NotificationResponseDto` (same structure as above, with `isRead: true` and `readAt` set)

**Status Codes:**

- `200 OK` - Notification marked as read
- `404 Not Found` - Notification not found

---

### 8.4 Mark Multiple Notifications as Read

**Endpoint:** `PUT /api/notifications/read/multiple`

**Request DTO:**

```typescript
{
  notificationIds: number[];  // Array of notification IDs
}
```

**Example Request:**

```json
{
  "notificationIds": [1, 2, 3, 4, 5]
}
```

**Response:**

```typescript
{
  updated: number; // Number of notifications marked as read
}
```

**Example Response:**

```json
{
  "updated": 5
}
```

---

### 8.5 Additional Notification Endpoints

- `GET /api/notifications` - Get all notifications (with pagination)
- `GET /api/notifications/:id` - Get notification by ID
- `GET /api/notifications/reservation/:reservationId` - Get notifications for a specific reservation
- `GET /api/notifications/type/:type` - Get notifications by type
- `GET /api/notifications/recent/:hours` - Get recent notifications (last N hours)
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/old/:days` - Delete old notifications

---

## 9. Confirm Paid Reservation

### 9.1 Get Confirmation Status

**Endpoint:** `GET /reservations/:id/confirmation-status`

**Request:** Path parameter only

```typescript
{
  id: number; // Reservation ID
}
```

**Response DTO:** `ConfirmationStatusDto`

```typescript
{
  canConfirm: boolean;
  requiresJustification: boolean;
  hasPaymentProofs: boolean;
  hasCost: boolean;
  message?: string | null;
}
```

**Example Response:**

```json
{
  "canConfirm": true,
  "requiresJustification": false,
  "hasPaymentProofs": true,
  "hasCost": true,
  "message": "La reserva puede ser confirmada."
}
```

**Status Codes:**

- `200 OK` - Status retrieved successfully
- `404 Not Found` - Reservation not found

---

### 9.2 Confirm Reservation (with optional file upload and justification)

**Endpoint:** `POST /reservations/:id/confirm`

**Request:** `multipart/form-data`

```typescript
{
  justification?: string;          // Optional, max 500 characters
  paymentProofFile?: File;        // Optional, PDF/JPG/JPEG/PNG, max 10MB
}
```

**Example Request (FormData):**

```typescript
const formData = new FormData();
formData.append(
  "justification",
  "El cliente pagó en efectivo y no tiene comprobante",
);
// Optional: formData.append('paymentProofFile', fileInput.files[0]);

fetch(`/reservations/${reservationId}/confirm`, {
  method: "POST",
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**Response DTO:** `ReservationWithDetailsResponseDto` (same structure as in section 2.1)

**Status Codes:**

- `200 OK` - Reservation confirmed successfully
- `400 Bad Request` - Requires payment proof or justification for paid reservation without proof
- `404 Not Found` - Reservation not found

**Business Logic:**

- If reservation has cost and no payment proofs:
  - Requires either `justification` OR `paymentProofFile`
  - If `paymentProofFile` is provided, it's uploaded first
  - Then reservation is confirmed
- If reservation has cost and has payment proofs:
  - Confirmed immediately without asking for justification
- If reservation has no cost:
  - Confirmed immediately (no payment flow)

---

## 10. Free Reservations

### 10.1 Confirm Free Reservation

**Endpoint:** `POST /reservations/:id/confirm`

**Request:** Same as section 9.2, but for free reservations:

- No `justification` required
- No `paymentProofFile` required
- Reservation is confirmed immediately

**Response DTO:** `ReservationWithDetailsResponseDto` (same structure as in section 2.1)

**Note:** The `hasCost: false` field in the reservation response indicates this is a free reservation, so no receipt generation options appear and no proof-of-payment upload section exists in "Mis Reservas".

---

## Additional Utility Endpoints

### Calculate Reservation Cost

**Endpoint:** `POST /api/sub-scenario-pricing/calculate-cost`

**Request DTO:**

```typescript
{
  subScenarioId: number;
  startDateTime: string; // ISO 8601 date string
  endDateTime: string; // ISO 8601 date string
}
```

**Example Request:**

```json
{
  "subScenarioId": 5,
  "startDateTime": "2025-12-12T10:00:00Z",
  "endDateTime": "2025-12-12T12:00:00Z"
}
```

**Response DTO:**

```typescript
{
  subScenarioId: number;
  hourlyPrice: number;
  totalHours: number;
  totalCost: number;
  formattedCost: string; // e.g., "$300.00 MXN"
  hasPrice: boolean;
}
```

**Example Response:**

```json
{
  "subScenarioId": 5,
  "hourlyPrice": 150.0,
  "totalHours": 2,
  "totalCost": 300.0,
  "formattedCost": "$300.00 MXN",
  "hasPrice": true
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

**Error Response DTO:**

```typescript
{
  statusCode: number;
  message: string | string[];
  error?: string;
}
```

**Example Error Response:**

```json
{
  "statusCode": 400,
  "message": "El precio debe ser mayor a 0",
  "error": "Bad Request"
}
```

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

**Note:** Currently, guards are commented out in the controllers, but they should be enabled in production.

---

## Base URL Configuration

- **Development:** `http://localhost:3001`
- **Production:** Configure according to your deployment

---

## Notes for Frontend Implementation

1. **File Uploads:** Use `FormData` for multipart/form-data requests
2. **PDF Downloads:** Use blob response handling for PDF downloads
3. **Pagination:** All list endpoints support pagination via query parameters
4. **Error Handling:** Always check response status codes and handle errors appropriately
5. **TypeScript Types:** Create TypeScript interfaces matching the DTOs for type safety
6. **Date Formats:** All dates are in ISO 8601 format (e.g., "2025-12-12T06:45:00.000Z")
7. **File Size Limits:** Payment proof uploads are limited to 10MB
8. **File Types:** Only PDF, JPG, JPEG, PNG are allowed for payment proofs

---

**Last Updated:** 2025-12-12
**Version:** 1.0.0
