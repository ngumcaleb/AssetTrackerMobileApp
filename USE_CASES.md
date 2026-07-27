# AssetTracker – Use Cases & Functional Specification

## Table of Contents
1. [Overview](#overview)
2. [User Personas](#user-personas)
3. [Core Use Cases (User Stories)](#core-use-cases)
4. [Screen‑to‑Use‑Case Mapping](#screen-to-use-case-mapping)
5. [Data Model & API Contracts](#data-model--api-contracts)
6. [Interaction Flow Diagrams](#interaction-flow-diagrams)
7. [Error Handling & Edge Cases](#error-handling--edge-cases)
8. [Non‑Functional Requirements](#non-functional-requirements)
9. [Future Enhancements](#future-enhancements)
10. [Appendix – Key Files & Paths](#appendix)

---

## Overview
AssetTracker is a **mobile‑first** application for managing the lifecycle of physical assets (forklifts, scanners, equipment, etc.).  It consists of a **React‑Native** shell that loads static HTML screens (see `projectscreens.txt`) inside WebViews.  A **Laravel** backend provides a RESTful API for persistence, authentication, and activity logging.

---

## User Personas
| Persona | Role | Primary Goals |
|---------|------|---------------|
| **Logistics Manager** | Oversees warehouse inventory | - Quickly see damaged/expired assets<br>- Restore assets after repairs<br>- Export reports |
| **Field Technician** | Performs maintenance & check‑outs | - Scan assets to check out<br>- Record repair notes<br>- View asset history |
| **Procurement Officer** | Acquires new equipment | - Register new assets with photos and specs<br>- Associate purchase data (price, supplier) |
| **Auditor** | Reviews compliance | - Access activity log<br>- Export data for audit |

---

## Core Use Cases (User Stories)
### 1. View Dashboard Overview
**As** a Logistics Manager **I want** to see a high‑level summary of total, damaged, and expired assets **so that** I can assess inventory health at a glance.
- **Pre‑conditions:** User is authenticated.
- **Steps:**
  1. App loads Dashboard screen.
  2. UI fetches `/api/summary`.
  3. Stats chips display.
- **Post‑conditions:** Data refreshed every 5 min (optional).

### 2. Browse Archived Assets
**As** a Logistics Manager **I want** to browse archived assets with search & filter **so that** I can locate specific decommissioned items.
- **Pre‑conditions:** User on Assets tab.
- **Steps:**
  1. Load Archived Assets screen.
  2. Fetch `/api/assets?archived=true`.
  3. Render `archive‑card` grid.
  4. Live‑filter via search input.
- **Post‑conditions:** User can view details, restore, or initiate check‑out.

### 3. Restore an Archived Asset
**As** a Logistics Manager **I want** to restore an asset from the archive **so that** it becomes active again.
- **Steps:**
  1. Click Restore button on a card.
  2. UI runs micro‑animation, then PATCH `/api/assets/{id}` with `{status: "active"}`.
  3. Card is removed; Dashboard totals update.
- **Edge Cases:** API error → show toast, keep card.

### 4. Register a New Asset
**As** a Procurement Officer **I want** to create a new asset record with photo and specs **so that** the asset is tracked from day 1.
- **Steps:**
  1. Navigate to Register Asset screen.
  2. Fill form sections (Identity, Manufacturer, Acquisition, Documentation).
  3. Upload a photo (optional).
  4. Submit → POST `/api/assets` (multipart/form‑data).
  5. UI shows spinner, then success animation and redirects to Dashboard.
- **Validation:** Required fields (name, category, serial).

### 5. Check‑Out an Asset
**As** a Field Technician **I want** to check an asset out to a worker **so that** responsibility is recorded.
- **Steps:**
  1. Open Asset details → tap **Check‑Out**.
  2. Fill assignee, purpose, expected return date.
  3. POST `/api/checkouts`.
  4. UI confirms and marks asset as “checked‑out”.
- **Business Rule:** Asset cannot be checked out if already `checked‑out`.

### 6. View Activity Log
**As** an Auditor **I want** to see a chronological list of all asset‑related actions **so that** I can verify compliance.
- **Steps:**
  1. Tap **Activity** in bottom navigation.
  2. GET `/api/activity`.
  3. Render list with timestamps, user, action.
- **Filtering:** By date range, asset ID.

### 7. Manage Settings
**As** any user **I want** to toggle dark mode, change language, and log out **so that** I can personalize the app.
- **Implementation Note:** Settings screen is a placeholder; future work will add toggles.

---

## Screen‑to‑Use‑Case Mapping
| Screen (HTML block) | Use Cases Covered |
|----------------------|-------------------|
| **Dashboard** (lines 1‑317) | 1, 6 (quick navigation) |
| **Archived Assets** (lines 1‑317) | 2, 3 |
| **Register Asset** (lines 319‑574) | 4 |
| **Asset Check‑Out** (lines 658‑800) | 5 |
| **Activity Log** (bottom nav) | 6 |
| **More / Settings** (bottom nav) | 7 |

---

## Data Model & API Contracts
### Asset Resource
```json
{
  "id": "string",          // UUID
  "name": "string",
  "category": "string",
  "serial": "string",
  "status": "active|archived|checked_out",
  "photo_url": "string|null",
  "manufacturer": {
    "brand": "string",
    "model": "string"
  },
  "acquisition": {
    "purchase_date": "YYYY-MM-DD",
    "price": "number",
    "supplier": "string",
    "location": "string"
  },
  "notes": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
### CheckOut Resource
```json
{
  "id": "string",
  "asset_id": "string",
  "assignee": "string",
  "purpose": "string",
  "expected_return": "YYYY-MM-DD",
  "checked_out_at": "timestamp",
  "returned_at": "timestamp|null"
}
```
### Summary Endpoint (`GET /api/summary`)
```json
{ "total": 128, "damaged": 42, "expired": 86 }
```
### Activity Log (`GET /api/activity`)
Array of entries:
```json
{
  "id": "string",
  "type": "asset_created|asset_restored|checkout|return",
  "asset_id": "string",
  "user": "string",
  "timestamp": "timestamp",
  "details": "string"
}
```
All endpoints require `Authorization: Bearer <jwt>` header.

---

## Interaction Flow Diagrams
### Dashboard → Assets → Register
````mermaid
flowchart LR
    D[Dashboard] --> A[Assets (Archived)]
    A --> R[Register Asset]
    R -->|Success| D
````
### Check‑Out Flow
````mermaid
flowchart LR
    A[Asset Details] --> C[Check‑Out Form]
    C -->|Submit| API[POST /api/checkouts]
    API -->|200 OK| A[Asset Details (status=checked_out)]
````
---

## Error Handling & Edge Cases
| Situation | UI Response | Backend Action |
|-----------|------------|----------------|
| Network failure | Toast “Unable to reach server, retry?” with Retry button | N/A |
| Validation error (missing fields) | Inline field error messages, disabled Submit | 400 Bad Request with field map |
| Restore fails (asset already active) | Show modal “Asset already active” | 409 Conflict |
| Check‑Out when asset already checked‑out | Prevent button, show badge “Checked‑out” | 400 with message |
| Unauthorized (expired token) | Redirect to Login screen | 401 Unauthorized |

---

## Non‑Functional Requirements
- **Performance:** Initial screen load < 2 s on a typical 4G connection.
- **Responsiveness:** All UI must adapt to phones & tablets (Tailwind breakpoints already used).
- **Accessibility:** Use semantic HTML (`<header>`, `<main>`, `<section>`), appropriate ARIA labels on icons, focus outlines via Tailwind.
- **Security:** JWT stored in React‑Native SecureStore; all API calls over HTTPS.
- **Offline Support (future):** Cache asset list via `AsyncStorage` for read‑only view.

---

## Future Enhancements
1. **Real‑time updates** – WebSocket channel to push asset status changes to all clients.
2. **Barcode/QR scanning** – Integrate native camera module to scan asset tags directly.
3. **Bulk import/export** – CSV upload for mass asset registration.
4. **Role‑based permissions** – Different UI capabilities for manager vs. technician.
5. **Multilingual support** – Externalize strings, add locale selector.

---

## Appendix – Key Files & Paths
- **React‑Native base folder:** `c:/Users/NKTECH/Documents/MOBILE APPS/AssetTracker/AssetTracker`
  - Use case document: `USE_CASES.md` (this file)
  - Main entry point (WebView wrapper): `App.js`
- **HTML screens:** `AssetTracker/projectscreens.txt`
- **Backend API:** `c:/Users/NKTECH/Documents/MOBILE APPS/AssetTracker/AssetTrackerAPI`
  - Routes file: `routes/api.php`
  - Controllers: `app/Http/Controllers/AssetController.php`, `CheckOutController.php`
  - Models: `app/Models/Asset.php`, `CheckOut.php`
- **Design tokens:** Inline Tailwind config within `projectscreens.txt` (lines 12‑102).

---

*This document is intended for developers, product owners, and QA engineers to understand the functional scope of AssetTracker, map UI screens to business use cases, and guide future implementation.*
