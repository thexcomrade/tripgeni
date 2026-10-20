# TripGenius AI — Publication-Grade Intelligent Travel Orchestration Platform

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/UI-React%2019-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/Language-TypeScript%205.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20%2F%20R3F-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.116-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python 3.13](https://img.shields.io/badge/Runtime-Python%203.13-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![SQLAlchemy 2.0](https://img.shields.io/badge/ORM-SQLAlchemy%202.0-red?style=flat-square)](https://www.sqlalchemy.org/)
[![Google Gemini 2.5](https://img.shields.io/badge/LLM-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![ReportLab 5.0](https://img.shields.io/badge/PDF-ReportLab%205.0-orange?style=flat-square)](https://www.reportlab.com/)

TripGenius is an enterprise-grade travel planning and intelligence platform designed from the ground up as a decoupled, asynchronous system. It pairs a high-performance **Next.js 15 (Turbopack)** client with a resilient **FastAPI (Python 3.13)** backend, **SQLAlchemy 2.0 ORM**, **Google Gemini 2.5 Flash**, **Tourism RAG (Retrieval-Augmented Generation)**, live meteorological caching, adaptive **Reinforcement Learning** budget calibration, and vector **PDF generation**.

---

## 📑 Table of Contents

1. [Architectural Overview & System Topology](#1-architectural-overview--system-topology)
2. [End-to-End Request-Response Cycle](#2-end-to-end-request-response-cycle)
3. [Database Architecture & Operations Deep-Dive](#3-database-architecture--operations-deep-dive)
4. [Frontend Architecture & Component Flow](#4-frontend-architecture--component-flow)
5. [Backend Architecture & Service Layer (Detailed Function Breakdown)](#5-backend-architecture--service-layer-detailed-function-breakdown)
6. [Frontend-to-Backend Network Protocol & Interceptors](#6-frontend-to-backend-network-protocol--interceptors)
7. [Authentication & Authorization Security Pipeline](#7-authentication--authorization-security-pipeline)
8. [Specialized Cognitive & Real-Time Subsystems](#8-specialized-cognitive--real-time-subsystems)
9. [Complete REST API Registry](#9-complete-rest-api-registry)
10. [Environment Configuration & Production Deployment](#10-environment-configuration--production-deployment)
11. [Local Development & Setup Guide](#11-local-development--setup-guide)

---

## 1. Architectural Overview & System Topology

TripGenius separates concerns into dedicated tiers to ensure high throughput, zero-bloat state management, and strict fault isolation:

```
+---------------------------------------------------------------------------------------------------------+
| CLIENT TIER: Next.js 15.5 App Router (Port 3000)                                                        |
|   Pages: /planner, /ai-chat, /trips/[id], /community, /profile | 3D Canvas (Padayappa Mascot)           |
|   State: Local React State + URL Param Synchronization + LocalStorage Tokens                            |
+---------------------------------------------------+-----------------------------------------------------+
                                                    | HTTP/JSON (REST API over port 8000)
                                                    | Interceptor: Bearer <JWT> | CORS Allowed
                                                    v
+---------------------------------------------------------------------------------------------------------+
| API GATEWAY & ROUTING TIER: FastAPI 0.116 (Port 8000)                                                    |
|   - CORS Middleware: Dynamic regex matching local & production Vercel origins                           |
|   - Dependency Injection: get_db() -> SessionLocal, get_current_user() / get_current_user_or_guest()    |
|   - Routers: /api/auth/*, /api/trips/*, /api/weather, /api/chat                                         |
+--------------------+------------------------------+-------------------------------+---------------------+
                     |                              |                               |
                     v                              v                               v
+--------------------+--------+     +---------------+---------------+     +---------+---------------------+
| PERSISTENCE LAYER           |     | AI & RAG COGNITIVE SERVICES   |     | REAL-TIME TELEMETRY & REPORTING |
|   SQLAlchemy 2.0 ORM Engine |     |   Google Gemini 2.5 Flash     |     |   OpenWeatherMap Live API (TTL) |
|   SQLite / PostgreSQL       |     |   Curated Tourism RAG DB      |     |   ReportLab Vector PDF Engine   |
|   Tables: users, trips,     |     |   Adaptive RL Bandit Engine   |     |   SMTP Email & OTP Dispatch     |
|   trip_expense_learnings    |     |   (Feedback variance update)  |     |   Public Trip Sharing Cache     |
+-----------------------------+     +-------------------------------+     +-------------------------------+
```

---

## 2. End-to-End Request-Response Cycle

Every travel plan generation, chatbot interaction, and expense calibration executes through a 10-stage pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor User as Traveler (Browser)
    participant FE as Next.js 15 Client
    participant Interceptor as Axios Interceptor
    participant Gateway as FastAPI Router (:8000)
    participant Auth as Auth / Dependency Guard
    participant DB as SQLAlchemy (SessionLocal)
    participant RAG as Tourism RAG Service
    participant Gemini as Google Gemini 2.5 Flash
    participant Fallback as Local Verified Dataset

    User->>FE: Submits Travel Constraints (Destination, Days, Budget, Transit)
    FE->>Interceptor: Invokes tripService.generateAIItinerary(payload)
    Interceptor->>Gateway: POST /api/trips/generate-ai-itinerary (Headers: Bearer JWT)
    Gateway->>Auth: Validates get_current_user_or_guest()
    Auth-->>Gateway: Injected User or "guest_traveler"
    Gateway->>DB: Acquires isolated Session from get_db()
    Gateway->>RAG: Queries local destination ground truth
    RAG-->>Gateway: Verified sights, seasonal vibes, local cuisine
    Gateway->>Gemini: Prompts Gemini Flash with structured JSON schema
    alt Gemini Responds Successfully
        Gemini-->>Gateway: Structured DayPlan[] + Financials + Eco-Score
    else Gemini Hits Rate Limit / Timeout
        Gateway->>Fallback: Generates offline curated itinerary from verified_travel_data
        Fallback-->>Gateway: Fallback structured plan
    end
    Gateway->>DB: Closes session (finally block)
    Gateway-->>Interceptor: 200 OK (AITripGenerationResponse)
    Interceptor-->>FE: Resolves Promise
    FE->>User: Renders Day Timeline, Transit & Budget Breakdown
```

### Detailed Execution Breakdown:
1. **Stage 1 (Client Parameter Capture)**: In `frontend/src/app/planner/page.tsx`, the traveler selects their destination (`origin` & `destination`), duration, travelers count, budget, and transportation mode. Transit mode cards (`Train`, `Flight`, `Bus`) are interactive buttons that immediately sync state.
2. **Stage 2 (Axios Ingestion & Interceptor Execution)**: `trip.service.ts` calls `POST /api/trips/generate-ai-itinerary`. The Axios request interceptor injects the base URL (`NEXT_PUBLIC_API_URL` or `http://localhost:8000`) and attaches `Authorization: Bearer <token>` from `localStorage`.
3. **Stage 3 (CORS & Preflight Handling)**: FastAPI receives the incoming HTTP request. `CORSMiddleware` evaluates the `Origin` header against allowed origins (`http://localhost:3000` and production domains). Preflight `OPTIONS` requests resolve with `200 OK`.
4. **Stage 4 (Dependency Injection & Security Evaluation)**: FastAPI evaluates `Depends(get_current_user_or_guest)`. If a valid JWT is present, the user UUID is extracted; if absent, guest traveler mode is granted without returning `401 Unauthorized`.
5. **Stage 5 (Session Allocation)**: `Depends(get_db)` acquires a database session from `SessionLocal` with `autocommit=False`.
6. **Stage 6 (RAG Grounding)**: `AIService` invokes `TourismRAGService` to search `verified_travel_data.py` (100+ destinations). Authentic landmarks, local foods, and seasonal data are injected into the prompt context to prevent LLM hallucinations.
7. **Stage 7 (Gemini Flash Execution)**: `AIService` builds a strict JSON prompt and queries Google Gemini 2.5 Flash (`google-genai` SDK).
8. **Stage 8 (Auto-Healing Fallback)**: If Gemini experiences network throttling or API quota exhaustion, `ai_service.py` intercepts the exception and executes `generate_offline_trip_plan()`, returning a verified offline itinerary.
9. **Stage 9 (Pydantic Schema Validation)**: The resulting dictionary is validated against `AITripGenerationResponse` and serialized to `application/json`. The database session is released in the `finally` block of `get_db()`.
10. **Stage 10 (Client Hydration & View Transition)**: The Axios promise resolves in `planner/page.tsx`. State is cached in `localStorage` under `latest_trip` and the user transitions smoothly to `/trip/generated`.

---

## 3. Database Architecture & Operations Deep-Dive

Persistence is managed by **SQLAlchemy 2.0 ORM** with typed declarative mappings in [`backend/app/database/db.py`](file:///d:/tripgenius/backend/app/database/db.py).

### Relational Schema

```
                    +---------------------------+
                    |       users Table         |
                    |---------------------------|
                    | id (UUID PK)              |
                    | full_name, email, password|
                    | eco_travel_score          |
                    +-------------+-------------+
                                  | 1 : N
                                  v
                    +---------------------------+
                    |       trips Table         |
                    |---------------------------|
                    | id (UUID PK)              |
                    | destination, duration     |
                    | travelers_count, budget   |
                    | transportation_mode, cost |
                    | ai_itinerary (JSON)       |
                    | attractions / hotels (JSON|
                    +-------------+-------------+
                                  | 1 : N
                                  v
                    +---------------------------+
                    | trip_expense_learnings    |
                    |---------------------------|
                    | predicted vs actual cost  |
                    | variance, reward_score    |
                    | RL adaptive weights (JSON)|
                    +---------------------------+
```

#### 1. `users` Table ([`models/user.py`](file:///d:/tripgenius/backend/app/models/user.py))
* `id`: `String(36)`, Primary Key, default UUIDv4.
* `full_name`: `String(150)`, non-nullable.
* `email`: `String(255)`, non-nullable, unique index.
* `hashed_password`: `String(255)`, non-nullable (12-round bcrypt salted hash).
* `profile_image`: `String(500)`, nullable.
* `bio`: `Text`, nullable.
* `country`: `String(100)`, nullable.
* `preferred_budget`: `String(50)`, nullable.
* `preferred_travel_style`: `String(100)`, nullable.
* `favourite_destination`: `String(150)`, nullable.
* `eco_travel_score`: `Integer`, default `0` (Gamified sustainability tracker).
* `total_trips`: `Integer`, default `0` (Trip counter).
* `created_at` / `updated_at`: `DateTime(timezone=True)`.

#### 2. `trips` Table ([`models/trip.py`](file:///d:/tripgenius/backend/app/models/trip.py))
* `id`: `String(36)`, Primary Key, default UUIDv4.
* `user_id`: `String(36)`, Foreign Key referencing `users.id` with `ondelete="CASCADE"`, Indexed.
* `trip_title`: `String(200)`, non-nullable.
* `destination`: `String(200)`, non-nullable, Indexed.
* `state` / `district`: `String(100)`, nullable.
* `duration_days`: `Integer`, non-nullable.
* `travelers_count`: `Integer`, default `1`.
* `budget`: `Float`, non-nullable.
* `travel_style`: `String(100)`, nullable.
* `interests`: `JSON` list, non-nullable.
* `transportation_mode`: `String(100)`, nullable (`"Train"`, `"Flight"`, `"Bus"`, `"Car"`, `"Bike"`).
* `transportation_cost`: `Float`, default `0.0`.
* `preferred_accommodation`: `String(100)`, nullable.
* `ai_itinerary`: `JSON` structure containing day-by-day morning, afternoon, and evening schedules.
* `itinerary_summary`: `Text`, nullable.
* `attractions`, `recommended_hotels`, `recommended_restaurants`, `local_cuisines`, `beverages_to_try`: `JSON` arrays.
* `weather_summary`, `weather_alerts`, `packing_checklist`, `travel_tips`: `JSON` arrays.
* `estimated_trip_cost`, `accommodation_cost`, `food_cost`, `miscellaneous_cost`: `Float`.
* `sustainability_score`: `Integer` (0–100).
* `carbon_footprint_estimate`: `Float` (kg CO2).
* `eco_friendly_recommendations`: `JSON` array.
* `is_favorite`: `Boolean`, default `False`.
* `is_public`: `Boolean`, default `False`.
* `status`: `String(50)`, default `"draft"`.
* `actual_expense_total`, `actual_expense_breakdown`, `expense_variance`: Expense calibration fields.

#### 3. `trip_expense_learnings` Table ([`models/expense_learning.py`](file:///d:/tripgenius/backend/app/models/expense_learning.py))
* `id`: `String(36)`, Primary Key.
* `trip_id`: `String(36)`, Foreign Key to `trips.id`.
* `user_id`: `String(36)`, Foreign Key to `users.id`.
* `destination`, `travel_style`, `transportation_mode`, `duration_days`, `travelers_count`.
* `estimated_cost` vs `actual_spent`, `expense_variance`.
* `reward_score`: Reinforcement learning objective value.
* `calibrated_weight_update`: `JSON` containing adapted pricing weights.

### Concurrency & Transaction Management
* **Session Lifespan**: `get_db()` yield pattern ensures every request receives its own session that is committed on success and rolled back on error.
* **Concurrency**: In SQLite mode, `connect_args={"check_same_thread": False}` allows multi-threaded async workers in FastAPI to reuse the connection pool without locking collisions.
* **Migration Simplicity**: Database definitions strictly follow standard SQL via SQLAlchemy declarative models, making transitions from SQLite to PostgreSQL as simple as changing `DATABASE_URL` in `.env`.

---

## 4. Frontend Architecture & Component Flow

The frontend is built on **Next.js 15.5 App Router** using **React 19**, **TypeScript 5.8**, and **Tailwind CSS 4**:

### Directory Structure & Route Handlers
```
frontend/src/
├── app/
│   ├── layout.tsx              # Root HTML, fonts, global providers, FloatingMascot mounting
│   ├── page.tsx                # Hero section with contained background video, quick launcher
│   ├── planner/page.tsx        # 3-Step Multi-Variable Planner with interactive transit grid
│   ├── ai-chat/page.tsx        # Padayappa conversational UI, Malayalam greetings, voice synthesis
│   ├── trips/[tripId]/page.tsx # Interactive plan inspector, timeline filter, Leaflet map
│   ├── community/page.tsx      # Public community blueprints repository
│   ├── profile/page.tsx        # Authenticated dashboard, eco-score badge, trip history
│   ├── login/page.tsx          # JWT authentication entry point
│   ├── register/page.tsx       # Account creation & initial preferences
│   └── globals.css             # Tailwind v4 directives, responsive variables, scrollbars
├── components/
│   ├── layout/
│   │   ├── AppNavbar.tsx       # Responsive header, mobile drawer breakout, touch dismiss
│   │   └── Footer.tsx          # Platform directory, legal, social links
│   └── mascot/
│       ├── FloatingMascot.tsx  # Grounded mascot widget (bottom: 0px), backdrop outside-dismiss
│       ├── Mascot3DCanvas.tsx  # React Three Fiber Canvas, directional lighting, procedural fallback
│       └── FloatingMascot.css  # Mobile and desktop positioning rules
├── services/
│   ├── api.ts                  # Axios core instance, interceptors, error normalizers
│   ├── trip.service.ts         # Itinerary generation, saving, and PDF download calls
│   └── auth.service.ts         # Login, registration, token persistence, and profile sync
└── utils/
    ├── apiConfig.ts            # Dynamic NEXT_PUBLIC_API_URL resolution
    └── transitPricing.ts       # Distance math & IRCTC / Flight / Bus minimum fare engine
```

### Key Interactive Components

#### 1. Multi-Step Planner (`app/planner/page.tsx`)
* **Step 1 (Route Intelligence & Interactive Transit Cards)**:
  * Contains interactive cards for `🚆 Train (IRCTC)`, `✈️ Flight + Transit`, and `🚌 Bus / Road`.
  * Clicking `Train` highlights the card with a glowing green border (`#34D399`) and a `"✓ Selected for your journey"` badge.
  * Clicking automatically synchronizes the state (`transportationMode = "Train"`) across all steps.
* **Step 2 (Duration, Group Size & Budget Integration)**:
  * Computes `calculatedTransitCost` based on selected transit mode (e.g. 3AC Train Fare × travelers count).
  * Displays a dedicated vehicle pricing breakdown card showing transit cost as a percentage of the total budget.
* **Step 3 (Style & Primary Transit)**:
  * Synchronized with Step 1 selection; passes parameters to the AI generation payload.

#### 2. 3D Mascot Subsystem — "Padayappa" (`components/mascot/`)
* **Framework**: Powered by `@react-three/fiber` and `@react-three/drei`.
* **Visual Styling**: Studio directional lighting with subtle rim lights to eliminate harsh shadows and unnatural glows.
* **Responsive Anchoring**: Grounded with `bottom: 0px` on both desktop and mobile screens.
* **Backdrop Dismiss**: Includes a full-screen backdrop (`.assistant-backdrop`) with capture-phase touch dismissal to allow closing the chat by tapping outside the box.

#### 3. Responsive Navigation & Mobile Drawer (`components/layout/AppNavbar.tsx`)
* **Drawer Breakout**: The mobile navigation drawer is rendered outside the `<header>` container to eliminate the Chromium `backdrop-filter` containing-block trap that previously cut off menu items.
* **Breakpoints**: Desktop navigation displays at `≥900px`; switches cleanly to mobile drawer below `900px`.

---

## 5. Backend Architecture & Service Layer (Detailed Function Breakdown)

The backend is organized into distinct services located in [`backend/app/services/`](file:///d:/tripgenius/backend/app/services/):

### 1. `AIService` ([`services/ai_service.py`](file:///d:/tripgenius/backend/app/services/ai_service.py))
* `generate_trip_plan(destination, origin, duration_days, budget, travelers_count, travel_style, transportation_mode, preferred_accommodation, interests)`:
  * **Role**: Primary orchestrator for AI travel generation.
  * **Behavior**: Queries `TourismRAGService` for grounded facts, builds structured JSON prompt instructions, invokes Google Gemini 2.5 Flash, validates the output, and executes `generate_offline_trip_plan` if rate limits occur.
* `estimate_trip_cost(budget, duration_days, travelers_count, travel_style, transportation_mode, destination, db)`:
  * **Role**: Calibrates realistic financial category breakdowns (Accommodation, Food, Transit, Misc).
  * **Behavior**: Uses empirical weights from `BudgetLearningService` and transit intelligence from `transitPricing`.
* `generate_offline_trip_plan(destination, duration_days, budget, ...)`:
  * **Role**: Circuit breaker fallback mechanism.
  * **Behavior**: Builds structured day-by-day itineraries using verified travel datasets without requiring an internet or LLM connection.
* `generate_chat_response(message, history, user_name)`:
  * **Role**: Drives the multi-turn conversational AI for Padayappa.
  * **Behavior**: Identifies travel intent, resolves destinations chronologically, and provides concise recommendations with quick-action links.

### 2. `TourismRAGService` ([`services/tourism_rag_service.py`](file:///d:/tripgenius/backend/app/services/tourism_rag_service.py))
* `get_destination_profile(destination)`:
  * **Role**: Queries 100+ destinations in `verified_travel_data.py`.
  * **Returns**: Best travel seasons, key sights, famous foods, and transit advice.
* `detect_destination_from_text(message, history)`:
  * **Role**: Resolves destinations across chat history in reverse-chronological order.
* `handle_regional_greeting(message)`:
  * **Role**: Recognizes regional greetings (Malayalam *"Sugamano"*, Tamil *"Vanakkam"*, Hindi *"Namaste"*) and responds in authentic regional style.

### 3. `AuthService` ([`services/auth_service.py`](file:///d:/tripgenius/backend/app/services/auth_service.py))
* `register_user(payload: RegisterRequest) -> User`:
  * **Role**: Validates uniqueness of email, salts password with 12 bcrypt rounds, and saves new `User`.
* `login_user(payload: LoginRequest) -> dict`:
  * **Role**: Compares password hash via `bcrypt.checkpw` and returns an HS256-signed JWT token.
* `get_authenticated_profile(user_id: str) -> User`:
  * **Role**: Retrieves full user profile and travel stats by UUID.
* `send_password_change_otp(user_id: str) -> dict`:
  * **Role**: Issues a 6-digit OTP and dispatches it via SMTP email.
* `change_password(user_id, current_password, new_password, verification_code)`:
  * **Role**: Validates OTP and updates the user's password hash.

### 4. `BudgetLearningService` ([`services/budget_learning_service.py`](file:///d:/tripgenius/backend/app/services/budget_learning_service.py))
* `get_calibrated_factors(db, destination, travel_style, transportation_mode, duration_days, travelers_count)`:
  * **Role**: Queries `trip_expense_learnings` for previous traveler expenses and adapts budget percentages.
* `record_empirical_spend(db, trip_id, user_id, actual_spent, category_breakdown)`:
  * **Role**: Compares actual spend to AI predictions, computes variance, and updates contextual bandit weights.

### 5. `WeatherService` ([`services/weather_service.py`](file:///d:/tripgenius/backend/app/services/weather_service.py))
* `get_current_weather(city: str) -> dict`:
  * **Role**: Fetches live temperature, condition codes, humidity, and wind speed from OpenWeatherMap API.
  * **Optimization**: Includes an in-memory TTL cache to minimize external API requests.
* `generate_packing_checklist(weather: dict, duration: int) -> list[str]`:
  * **Role**: Automatically generates luggage recommendations (e.g., umbrellas for rain, cotton shirts for humidity).

### 6. `PDFExportService` ([`services/pdf_service.py`](file:///d:/tripgenius/backend/app/services/pdf_service.py))
* `generate_itinerary_pdf(trip_data: dict) -> bytes`:
  * **Role**: Compiles a publication-grade, multi-page vector PDF travel blueprint using ReportLab.
* `_init_pdf_fonts()`:
  * **Role**: Registers Segoe UI TrueType fonts to enable native Indian Rupee (`₹`) symbol rendering.
* `sanitize_pdf_text(text: Any) -> str`:
  * **Role**: Strips multi-byte emojis that produce tofu boxes (`■`) in vector PDF fonts while converting star ratings (`★`) to numeric values.

---

## 6. Frontend-to-Backend Network Protocol & Interceptors

All browser requests flow through an Axios service layer configured in [`frontend/src/services/`](file:///d:/tripgenius/frontend/src/services/):

### Base URL Resolution
The base URL is resolved dynamically via `getApiBaseUrl()`:
```typescript
// frontend/src/utils/apiConfig.ts
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};
```

### Request & Response Interceptors
```typescript
// Request Interceptor: Automatically attaches Bearer token
this.api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem("tripgenius_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### CORS Security Policy
Configured in [`backend/app/main.py`](file:///d:/tripgenius/backend/app/main.py):
* Allows origin domains (`http://localhost:3000`, `http://127.0.0.1:3000`, and custom production Vercel domains).
* Allows credentials, all standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), and headers.

---

## 7. Authentication & Authorization Security Pipeline

TripGenius implements a stateless JWT authentication architecture conforming to OAuth2 Bearer token standards:

```
[User Submits Credentials]
           │
           ▼
[POST /api/auth/login]
           │
           ├──> 1. User Lookup: SELECT * FROM users WHERE email = :email
           ├──> 2. Password Verification: bcrypt.checkpw(entered_pwd, user.hashed_password)
           └──> 3. Token Issuance: jwt.encode({'sub': user.id, 'exp': now + 24h}, SECRET_KEY, 'HS256')
           │
           ▼
[Frontend: Response {access_token, token_type: "bearer"}]
           │
           ├──> Stored in localStorage: localStorage.setItem('tripgenius_token', token)
           └──> Injected on all subsequent requests: Authorization: Bearer <token>
```

### Route Guard Dependencies
1. **Strict Guard (`get_current_user`)**:
   Used on endpoints modifying user data (e.g., `POST /api/trips/create`, `GET /api/trips/history`, `POST /api/trips/{id}/favorite`). Rejects unauthenticated requests with `401 Unauthorized`.
2. **Permissive Guard (`get_current_user_or_guest`)**:
   Used on public exploration endpoints (e.g., `POST /api/trips/generate-ai-itinerary`, `POST /api/chat`). Allows guest travelers to generate plans without forcing an immediate sign-in.

---

## 8. Specialized Cognitive & Real-Time Subsystems

| Subsystem | Primary Implementation | Architectural Highlights |
| :--- | :--- | :--- |
| **Generative LLM Engine** | `backend/app/services/ai_service.py` | Google Gemini 2.5 Flash with strict JSON schema compliance. Generates morning, afternoon, and evening time slots. |
| **Tourism RAG Engine** | `backend/app/services/tourism_rag_service.py` | Grounded dataset of 100+ cities to eliminate geographic and historical hallucinations. |
| **RL Expense Calibration** | `backend/app/services/budget_learning_service.py` | Contextual bandit feedback loop that adjusts cost estimates using post-trip actual expenditures. |
| **Live Weather Cache** | `backend/app/services/weather_service.py` | OpenWeatherMap integration with in-memory TTL caching and automated packing recommendations. |
| **Publication Vector PDF** | `backend/app/services/pdf_service.py` | ReportLab-based vector PDF generator with native Rupee symbol support (`₹`), budget tables, and numbered canvas. |

---

## 9. Complete REST API Registry

| Method | Endpoint | Request Body | Description | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `RegisterRequest` | Registers user with bcrypt password hashing | Public |
| `POST` | `/api/auth/login` | `LoginRequest` | Verifies credentials, returns 24-hr JWT | Public |
| `GET` | `/api/auth/profile` | None | Retrieves authenticated user profile | Authenticated |
| `POST` | `/api/auth/send-password-otp` | None | Dispatches password reset OTP via SMTP | Authenticated |
| `POST` | `/api/auth/change-password` | `ChangePasswordRequest`| Updates password with OTP verification | Authenticated |
| `POST` | `/api/trips/generate-ai-itinerary` | `AITripGenerationRequest` | Generates full multi-day travel blueprint | Guest / Authenticated |
| `POST` | `/api/trips/create` | `TripCreateRequest` | Persists itinerary to database | Authenticated |
| `GET` | `/api/trips/history` | None | Retrieves user's saved trips | Authenticated |
| `GET` | `/api/trips/public` | None | Retrieves community shared itineraries | Public |
| `GET` | `/api/trips/{trip_id}` | None | Retrieves complete trip details by UUID | Public / Owner |
| `POST` | `/api/trips/{trip_id}/favorite` | None | Toggles bookmark status for a trip | Authenticated |
| `POST` | `/api/trips/{trip_id}/share` | None | Toggles public community visibility | Authenticated |
| `POST` | `/api/trips/export-pdf` | `TripCreateRequest` | Generates downloadable ReportLab vector PDF | Guest / Authenticated |
| `POST` | `/api/trips/{id}/record-expense` | `RecordExpenseRequest` | Submits actual spend to update RL model | Authenticated |
| `POST` | `/api/chat` | `ChatRequest` | Padayappa AI multi-turn conversational agent | Public |
| `GET` | `/api/weather` | `?city=Munnar` | Fetches live weather conditions & forecast | Public |
| `GET` | `/api/destinations/focus-points` | `?destination=Goa` | Retrieves landmark priority focus points | Public |
| `GET` | `/status` | None | System health check (DB, AI, Weather) | Public |

---

## 10. Environment Configuration & Production Deployment

### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
> [!IMPORTANT]
> When deploying the frontend to **Vercel**, set `NEXT_PUBLIC_API_URL` to your live backend domain (e.g., `https://tripgenius-api.onrender.com`).

### Backend (`backend/.env`):
```env
APP_NAME="Trip Geni"
APP_ENV=production
APP_DEBUG=false
HOST=0.0.0.0
PORT=8000

# Security & Tokens
SECRET_KEY="your-production-secret-key"
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=sqlite:///./tripgeni.db
# For PostgreSQL: DATABASE_URL=postgresql://user:password@host:5432/tripgenius

# Cognitive Services & APIs
GEMINI_API_KEY="your-google-ai-studio-key"
OPENWEATHER_API_KEY="your-openweathermap-key"

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,https://tripgenius.vercel.app"

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_EMAIL="noreply@tripgeni.com"
SMTP_FROM_NAME="Trip Geni Security"
SMTP_TLS=true
```

---

## 11. Local Development & Setup Guide

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **Python**: v3.11, v3.12, or v3.13
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/thexcomrade/tripgenius.git
cd tripgenius
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend API server
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Client Application will be live at: `http://localhost:3000`

### 4. Build Architecture PDF Specification
To generate the printable 6-page vector architecture PDF:
```bash
python backend/generate_architecture_pdf.py
```
Output PDF is saved directly to `frontend/public/TripGenius_System_Architecture.pdf`.

---

## 👥 Contributors & Architecture Review
* **Engineering Lead & Architect**: [thexcomrade](https://github.com/thexcomrade)
* **Document Class**: Technical Architecture Specification & Reference Manual
* **License**: MIT
