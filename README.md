# NEXIS Control — Telemetry Validation & Integrity Console

<p align="center">
  <strong>Enterprise Control Plane for Crowdsourced Cellular Telemetry, PostGIS Geospatial Aggregation & Anti-Spoofing Verification</strong>
</p>

<p align="center">
  <img src="public/nexis-mark.svg" alt="NEXIS Control Logo" width="80" height="80" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/PostgreSQL-15_PostGIS-336791?logo=postgresql&logoColor=white" alt="PostGIS" />
  <img src="https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Spatial-Google_S2_Grid-FF9500" alt="Google S2" />
</p>

---

## 📸 Interface Showcase

### 1. Operations Dashboard
Real-time ingestion health, carrier market performance breakdown, probe fleet status, and telemetry verification rates.
![NEXIS Control Dashboard](docs/screenshots/admin-dashboard.png)

### 2. Live Validation Feed & Triage
Continuous real-time ingestion pipeline streaming incoming mobile probes with immediate heuristic validation scoring.
![Live Validation Feed](docs/screenshots/admin-live-feed.png)

### 3. Anti-Spoofing & Quarantine Engine
Automated anomaly detection isolating GPS teleports, Mock Location injections, impossible RF values, and synthetic throughput spikes.
![Quarantine & Heuristic Rules](docs/screenshots/admin-quarantine.png)

### 4. S2 Spatial Grid & Coverage Materialization
Google S2 cell (Level 13) spatial aggregation with enforced $k$-anonymity ($\ge 2$ distinct probes) preventing individual user tracking.
![S2 Spatial Coverage Map](docs/screenshots/admin-spatial-map.png)

### 5. Platform Observability & Telemetry Health
Database connection pool telemetry, queue depths, RPC bounding box latency, and live error budget tracking.
![Platform Observability](docs/screenshots/admin-observability.png)

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph MobileProbes["Mobile Probes & Web Clients"]
        ProbeA["Probe Device A (Android / iOS)"]
        ProbeB["Probe Device B (Field Surveyor)"]
        WebClient["NEXIS Web Client"]
    end

    subgraph IngestionBoundary["Ingestion & Heuristic Pipeline"]
        IngestAPI["Supabase Ingestion Edge"]
        SanityCheck{"RFC 6349 Sanity & Anti-Spoof"}
        Quarantine["Quarantine Queue (FLAGGED / SPOOFED)"]
    end

    subgraph StorageLayer["PostgreSQL 15 + PostGIS Database"]
        RawTelemetry[("telemetry_records")]
        ProbeRegistry[("probe_devices (Reputation Score)")]
        MaterializedGrid[("mv_coverage_grid (k-Anonymity Guard)")]
    end

    subgraph AdminConsole["NEXIS Control Console (React 19)"]
        Dash["Executive Operations Dashboard"]
        Triage["Live Ingestion Triage & Feed"]
        RuleEditor["Dynamic Validation Rule Engine"]
        Spatial["S2 GIS Map Explorer"]
    end

    ProbeA --> IngestAPI
    ProbeB --> IngestAPI
    WebClient --> IngestAPI

    IngestAPI --> SanityCheck
    SanityCheck -- Anomalous / Mock GPS --> Quarantine
    SanityCheck -- Validated Sample --> RawTelemetry
    SanityCheck --> ProbeRegistry

    RawTelemetry --> MaterializedGrid
    MaterializedGrid --> Spatial
    RawTelemetry --> Triage
    Quarantine --> Triage
    ProbeRegistry --> Dash
    RuleEditor -.-> SanityCheck
```

---

## ✨ Key Features

| Capability | Description | Technical Implementation |
| :--- | :--- | :--- |
| **Real-time Ingestion Stream** | Sub-second streaming of incoming field probes | Supabase Realtime Channels / WebSockets |
| **Heuristic Anomaly Detection** | Flags GPS jumps ($> 900\text{ km/h}$), impossible speeds ($> 10\text{ Gbps}$), and low-confidence cells | Multi-variate sanity constraints & SQL triggers |
| **Spatial $k$-Anonymity** | Materializes coverage heatmaps only when $\ge 2$ verified distinct probes validate a cell | PostGIS S2 Level 13 Materialized Views (`mv_coverage_grid`) |
| **Probe Reputation Scoring** | Tracks contribution credibility (0–100) per probe identifier | Automated reputation decay & probation workflows |
| **Carrier Analytics** | Benchmarks Dialog Axiata, SLT-Mobitel, Airtel, Hutch, and fixed broadband providers | Statistical median percentile calculations ($P_{50}, P_{90}$) |
| **Granular Privacy Controls** | Enforces /24 (IPv4) and /64 (IPv6) subnet truncation and geofenced exclusion zones | GDPR, CCPA/CPRA, and Sri Lanka PDPA compliance |

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v20.x or higher
* **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`
* **PostgreSQL / Supabase**: PostgreSQL 15+ with PostGIS extension enabled

### 1. Installation

```bash
git clone https://github.com/SahanPramuditha-Dev/Nexis-Web-Admin.git
cd Nexis-Web-Admin
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials:

```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Database Schema Setup

Deploy the enterprise schema to your PostgreSQL / Supabase instance:

```bash
# Using Supabase CLI or psql:
psql -h your-db-host -U postgres -d postgres -f database/schema.sql
```

The schema automatically initializes:
* PostGIS spatial extensions
* Partitioned `telemetry_records` tables
* Spatial indexes (`GIST` on geometry and B-tree on S2 cells)
* `mv_coverage_grid` with $k$-anonymity filtering
* Viewport RPC query function: `get_coverage_in_bbox()`

### 4. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

---

## 🔒 Security & Privacy Posture

* **Zero Personal Identification:** Mobile probes submit ephemeral hash tokens (`probe-anon-xxxx`) that rotate periodically.
* **Geofence Suppression:** Automated triggers discard telemetry points originating within registered user residential coordinates.
* **Role-Based Access Control (RBAC):** Admin consoles are protected by Supabase Row-Level Security (RLS) policies.

---

## 📄 License

Distributed under the Apache 2.0 License. See `LICENSE` for details.
