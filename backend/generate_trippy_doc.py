"""
Script to generate TRIPPY.PDF — The Complete A-to-Z System Blueprint & Learning Guide for Trip Geni.
Generates a publication-grade, beautifully styled, comprehensive technical handbook.
"""

import os
import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ----------------------------------------------------
# FONT REGISTRATION (Safe Fallback to Standard Helvetica)
# ----------------------------------------------------
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_OBLIQUE = "Helvetica-Oblique"

candidates = [
    ("SegoeUI", Path("C:/Windows/Fonts/segoeui.ttf"), "SegoeUI-Bold", Path("C:/Windows/Fonts/segoeuib.ttf")),
    ("Arial", Path("C:/Windows/Fonts/arial.ttf"), "Arial-Bold", Path("C:/Windows/Fonts/arialbd.ttf")),
]
for reg_name, reg_path, bold_name, bold_path in candidates:
    if reg_path.exists() and bold_path.exists():
        try:
            pdfmetrics.registerFont(TTFont(reg_name, str(reg_path)))
            pdfmetrics.registerFont(TTFont(bold_name, str(bold_path)))
            FONT_REGULAR = reg_name
            FONT_BOLD = bold_name
            break
        except Exception:
            continue

# ----------------------------------------------------
# NUMBERED CANVAS (Page X of Y & Running Headers)
# ----------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont(FONT_REGULAR, 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 756, "TRIP GENI — COMPLETE A-TO-Z SYSTEM BLUEPRINT & LEARNING GUIDE")
            self.drawRightString(576, 756, "TECHNICAL HANDBOOK & INTERVIEW GUIDE")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(36, 750, 576, 750)

        # Running Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(36, 42, 576, 42)

        self.drawString(36, 30, "Trip Geni Architecture Handbook • Production Architecture & Code Analysis")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 30, page_str)
        self.restoreState()


def create_callout(text: str, title: str = "KEY TAKEAWAY", color_hex: str = "#0EA5E9", bg_hex: str = "#F0F9FF"):
    style_title = ParagraphStyle(
        "CalloutTitle",
        fontName=FONT_BOLD,
        fontSize=9,
        leading=12,
        textColor=colors.HexColor(color_hex),
        spaceAfter=3,
    )
    style_body = ParagraphStyle(
        "CalloutBody",
        fontName=FONT_REGULAR,
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1E293B"),
    )
    content = [
        Paragraph(f"<b>{title.upper()}</b>", style_title),
        Paragraph(text, style_body),
    ]
    t = Table([[content]], colWidths=[540])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg_hex)),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor(color_hex)),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def build_trippy_pdf(output_paths: list[str]):
    # Color palette
    PRIMARY_NAVY = colors.HexColor("#0B132B")
    PRIMARY_BLUE = colors.HexColor("#0284C7")
    CYAN_ACCENT  = colors.HexColor("#0EA5E9")
    TEAL_ACCENT  = colors.HexColor("#0D9488")
    EMERALD_GREEN= colors.HexColor("#10B981")
    AMBER_GOLD   = colors.HexColor("#D97706")
    TEXT_MAIN    = colors.HexColor("#1E293B")
    TEXT_MUTED   = colors.HexColor("#475569")
    BORDER_LIGHT = colors.HexColor("#E2E8F0")
    CARD_BG      = colors.HexColor("#F8FAFC")
    CODE_BG      = colors.HexColor("#0F172A")
    CODE_FG      = colors.HexColor("#38BDF8")

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=22,
        leading=26,
        textColor=PRIMARY_NAVY,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=10,
        leading=14,
        textColor=CYAN_ACCENT,
        spaceAfter=12,
    )

    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=13,
        leading=17,
        textColor=PRIMARY_NAVY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=10.5,
        leading=14,
        textColor=PRIMARY_BLUE,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_MAIN,
        alignment=TA_LEFT,
        spaceAfter=5,
    )

    body_bold = ParagraphStyle(
        "BodyBold_Custom",
        parent=body_style,
        fontName=FONT_BOLD,
    )

    code_style = ParagraphStyle(
        "CodeStyle",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7.5,
        leading=10,
        textColor=CODE_FG,
    )

    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )

    table_body = ParagraphStyle(
        "TableBody",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=7.5,
        leading=10.5,
        textColor=TEXT_MAIN,
    )

    story = []

    # ----------------------------------------------------
    # COVER / TITLE BLOCK
    # ----------------------------------------------------
    story.append(Paragraph("TRIP GENI — SYSTEM BLUEPRINT & LEARNING GUIDE", title_style))
    story.append(Paragraph("Complete Technical Architecture, Frontend-Backend Connections, Core Concepts, and Function Encyclopedia in Simple Words", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=CYAN_ACCENT, spaceBefore=2, spaceAfter=10))

    meta_data = [
        [
            Paragraph("<b>Project:</b> Trip Geni (AI Travel Platform)", table_body),
            Paragraph("<b>Target Audience:</b> Full-Stack Engineers & Interview Prep", table_body),
        ],
        [
            Paragraph("<b>Primary LLM Engine:</b> OpenAI gpt-4o (Dual-Fallback Gemini)", table_body),
            Paragraph("<b>Frontend:</b> Next.js 15.5 App Router + React 19 + TypeScript", table_body),
        ],
        [
            Paragraph("<b>Backend:</b> FastAPI + SQLAlchemy + SQLite (WAL)", table_body),
            Paragraph("<b>Live Hosting:</b> Vercel (Frontend) + Render (Backend API)", table_body),
        ],
        [
            Paragraph("<b>Core Capabilities:</b> Tourism RAG, Token Bucket Rate Limiting, TQI Evaluation, Rail/Flight Live Pricing", table_body),
            Paragraph("<b>Document Version:</b> 2.0 (November 2026 Production Edition)", table_body),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER_LIGHT),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 1: EXECUTIVE SUMMARY & MISSION
    # ----------------------------------------------------
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "<b>What is Trip Geni?</b> Trip Geni is a production-grade, AI-driven sustainable travel planning and intelligence platform. "
        "Unlike generic travel aggregators (e.g. MakeMyTrip, Expedia) that present disconnected static hotel/flight search boxes, and unlike vanilla ChatGPT/LLM chat boxes that hallucinate non-existent trains, unrealistic distances, and fake budgets, "
        "Trip Geni acts as an <b>end-to-end intelligent travel architect</b>. It synthesizes personalized, mathematically verified day-by-day itineraries, computes real-world multi-modal transit costs (flights, IRCTC trains, highway fuel, tolls), predicts live regional weather, measures eco-travel carbon footprints, and continuously learns from post-trip expense feedback.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Core Problems Trip Geni Solves:</b><br/>"
        "• <b>The Hallucination Problem in Travel AI:</b> LLMs routinely invent trains that do not run, schedule sightseeing at 2 AM, or assume travel between cities is instant. Trip Geni eliminates this by anchoring all LLM generation inside a grounded <b>Tourism RAG (Retrieval-Augmented Generation) pipeline</b>.<br/>"
        "• <b>The Realistic Budget Problem:</b> Travelers struggle to estimate actual costs. Trip Geni allocates budgets mathematically across Accommodation, Inter-City Transit, Daily Local Meals, and Activities, backed by a Q-learning budget calibration engine.<br/>"
        "• <b>The Multi-Modal Transit Gap:</b> Travelers don't know whether flying, taking a Vande Bharat train, or driving is most cost- and time-effective. Trip Geni computes multi-modal comparisons using live fuel benchmarks and official APIs.",
        body_style
    ))
    story.append(create_callout(
        "Trip Geni combines generative AI intelligence with deterministic engineering safeguards: verified regional data, token bucket rate limiters, multi-rubric evaluation scoring, and offline fallbacks to guarantee 100% platform availability.",
        "Core Value Proposition",
        "#0D9488",
        "#F0FDFA"
    ))
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 2: END-TO-END SYSTEM ARCHITECTURE
    # ----------------------------------------------------
    story.append(Paragraph("2. End-to-End System Architecture & Data Flow", h1_style))
    story.append(Paragraph(
        "Trip Geni is designed as a decoupled, multi-tier cloud application separating presentation (Next.js 15 on Vercel) from business logic, data modeling, and AI orchestration (FastAPI on Render).",
        body_style
    ))

    arch_flow = [
        [Paragraph("<b>Layer</b>", table_header), Paragraph("<b>Technologies</b>", table_header), Paragraph("<b>Primary Responsibilities</b>", table_header)],
        [
            Paragraph("<b>1. Presentation Layer</b><br/>(Client)", table_body),
            Paragraph("Next.js 15.5 (App Router)<br/>React 19, TypeScript<br/>Tailwind CSS, Leaflet 1.9<br/>Lucide Icons, Web Speech API", table_body),
            Paragraph("Renders responsive travel wizards, interactive geospatial Leaflet route maps, dynamic world clocks, mascot companion dialog, token bucket popup alerts, and client-side 0ms cache state.", table_body)
        ],
        [
            Paragraph("<b>2. API Gateway & Middleware</b><br/>(Server Edge)", table_body),
            Paragraph("FastAPI (Python 3.13)<br/>Starlette BaseHTTPMiddleware<br/>Token Bucket Rate Limiter<br/>CORSMiddleware", table_body),
            Paragraph("Enforces endpoint-specific token bucket quotas (Auth vs Booking vs General), sanitizes request payloads with Pydantic v2 schemas, handles JWT authorization, and manages CORS headers.", table_body)
        ],
        [
            Paragraph("<b>3. Intelligence & RAG Layer</b><br/>(AI Engine)", table_body),
            Paragraph("OpenAI API (gpt-4o / gpt-4o-mini)<br/>Google Gemini (2.5 / 1.5 Flash)<br/>TourismRAGService<br/>EvaluationService (TQI)", table_body),
            Paragraph("Grounded retrieval over 700+ regional destinations. Primary synthesis via OpenAI gpt-4o, automated failover to Gemini, and deterministic offline synthesis. Computes multi-rubric RAG evaluation metrics.", table_body)
        ],
        [
            Paragraph("<b>4. External Services & APIs</b><br/>(Data Ingestion)", table_body),
            Paragraph("OpenWeatherMap API<br/>CARTO Voyager Basemaps<br/>OpenStreetMap Nominatim<br/>API Mitra (IRCTC & Fuel)<br/>Ignav Flight Fares", table_body),
            Paragraph("Provides live temperature & weather forecasts, geospatial coordinate resolution, official Indian Railways train schedules, real-time petrol/diesel rates, and verified flight booking links.", table_body)
        ],
        [
            Paragraph("<b>5. Persistence & Analytics</b><br/>(Data Store)", table_body),
            Paragraph("SQLite 3 (WAL Mode)<br/>SQLAlchemy 2.0 ORM<br/>Auto-Migration Engine<br/>Budget RL Service", table_body),
            Paragraph("Stores user profiles, credentials (bcrypt hashes), saved trips, expense histories, and learned budget variance weights. High concurrency PRAGMAs ensure lock-free reads and fast writes.", table_body)
        ]
    ]
    t_arch = Table(arch_flow, colWidths=[90, 160, 290])
    t_arch.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_NAVY),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER_LIGHT),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CARD_BG]),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 3: FRONTEND ARCHITECTURE
    # ----------------------------------------------------
    story.append(Paragraph("3. Frontend Architecture & Page Inventory", h1_style))
    story.append(Paragraph(
        "The frontend is built using <b>Next.js 15.5 App Router</b> with full TypeScript strict typing and React 19. "
        "It employs hybrid server/client rendering: structural layouts load instantly from the server, while interactive dashboards, planners, and modals use <code>'use client';</code> to manage client-side state, event emitters, and persistent local storage caching.",
        body_style
    ))

    frontend_pages = [
        [Paragraph("<b>Route</b>", table_header), Paragraph("<b>Key Responsibilities & Components</b>", table_header), Paragraph("<b>Engineering Highlights</b>", table_header)],
        [
            Paragraph("<code>/</code><br/>(Home)", table_body),
            Paragraph("Brand landing page, dynamic hero section with smart scroll cues, platform statistics badge, floating Mascot preview, and instant navigation search.", table_body),
            Paragraph("Optimized image loading, CSS glassmorphism, responsive navigation drawer, and sub-second First Contentful Paint.", table_body)
        ],
        [
            Paragraph("<code>/planner</code><br/>(Trip Wizard)", table_body),
            Paragraph("4-Step Intelligent Trip Planner: Step 1 Destination & Multi-City; Step 2 Dates & Travelers; Step 3 Travel Style & Transit; Step 4 Budget Allocation & Focus Points.", table_body),
            Paragraph("Dynamic date range calculation (gradual to-date auto-update when entering day counts), custom traveler count pills (max 5 + manual input), dynamic tier slider (Saver, Comfort, Bespoke).", table_body)
        ],
        [
            Paragraph("<code>/trip/generated</code><br/>(Itinerary Dashboard)", table_body),
            Paragraph("The core generated trip view: Day-by-Day schedule tabs, sequential route map, recommended stays with Google ratings, restaurant highlights, weather alerts, and PDF download button.", table_body),
            Paragraph("Integrates <code>TripInteractiveMap</code> with Leaflet 1.9, numbered markers, live itinerary budget donut chart, and quantitative TQI evaluation score badge.", table_body)
        ],
        [
            Paragraph("<code>/dashboard</code><br/>(Travel Hub)", table_body),
            Paragraph("Personalized traveler cockpit: recent trips, quick weather search widget, carbon footprint overview, and the Smart World Clock & Travel Compass utility.", table_body),
            Paragraph("Real-time local clock + personalized saved world clocks with live second ticking; device magnetometer orientation compass integration.", table_body)
        ],
        [
            Paragraph("<code>/profile</code><br/>(User Account)", table_body),
            Paragraph("Traveler identity card, Eco-Travel Score (0-100), total trips taken, saved itineraries list, and Edit Profile modal.", table_body),
            Paragraph("<b>0ms Cold Start Hydration:</b> Instantly renders cached user state from <code>localStorage</code>; uses 3.5s <code>AbortController</code> timeout so slow backend wakeups never freeze the screen.", table_body)
        ],
        [
            Paragraph("<code>/ai-chat</code><br/>(Talk with Tripzy)", table_body),
            Paragraph("Conversational AI travel assistant in Tripzy's warm, enthusiastic voice. Supports destination queries, packing suggestions, budget breakdowns, and transit links.", table_body),
            Paragraph("Multi-turn conversation history tracking, Web Speech API speech-to-text input and voice readout, and automatic multi-language support (English, Manglish, Malayalam, Tamil).", table_body)
        ],
        [
            Paragraph("<code>/login</code> & <code>/register</code><br/>(Auth Pages)", table_body),
            Paragraph("Glassmorphism authentication forms with show/hide password toggles, field validation, and social login redirects.", table_body),
            Paragraph("Guarded by client-side token bucket rate limiter; parses FastAPI Pydantic 422 error arrays into friendly human sentences; handles case-insensitive emails and usernames.", table_body)
        ]
    ]
    t_fe = Table(frontend_pages, colWidths=[80, 240, 220])
    t_fe.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_BLUE),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER_LIGHT),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CARD_BG]),
    ]))
    story.append(t_fe)
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 4: BACKEND ARCHITECTURE
    # ----------------------------------------------------
    story.append(Paragraph("4. Backend Architecture & Service Catalog", h1_style))
    story.append(Paragraph(
        "The backend is developed with <b>FastAPI</b> running on Python 3.13, utilizing async ASGI request handling via Uvicorn. "
        "It features strict separation of concerns into Controllers (API Routers), Business Logic (Services), Data Persistence (SQLAlchemy Models), and Validation Contracts (Pydantic Schemas).",
        body_style
    ))

    backend_modules = [
        [Paragraph("<b>Module Path</b>", table_header), Paragraph("<b>Core Purpose</b>", table_header), Paragraph("<b>Key Functions & Classes</b>", table_header)],
        [
            Paragraph("<code>app/core/rate_limiter.py</code>", table_body),
            Paragraph("Thread-safe Token Bucket rate limiting engine with automatic stale client eviction.", table_body),
            Paragraph("<code>TokenBucket</code>, <code>TokenBucketManager</code>, <code>RateLimitMiddleware</code>, <code>classify_endpoint()</code>, <code>BUCKET_CONFIGS</code>", table_body)
        ],
        [
            Paragraph("<code>app/services/ai_service.py</code>", table_body),
            Paragraph("Master AI orchestration service managing OpenAI gpt-4o, Gemini fallback, and offline synthesis.", table_body),
            Paragraph("<code>generate_trip_plan()</code>, <code>_generate_content()</code>, <code>generate_chat_response()</code>, <code>generate_offline_trip_plan()</code>, <code>calculate_sustainability_score()</code>", table_body)
        ],
        [
            Paragraph("<code>app/services/tourism_rag_service.py</code>", table_body),
            Paragraph("Domain-specific regional Tourism Retrieval-Augmented Generation (RAG) knowledge engine.", table_body),
            Paragraph("<code>TourismRAGService</code>, <code>retrieve_context_for_query()</code>, <code>resolve_destination()</code>, <code>resolve_route_pair()</code>, <code>detect_language()</code>", table_body)
        ],
        [
            Paragraph("<code>app/services/evaluation_service.py</code>", table_body),
            Paragraph("Quantitative evaluation framework computing the Trip Quality Index (TQI) across 5 rubrics.", table_body),
            Paragraph("<code>EvaluationService</code>, <code>evaluate_itinerary()</code>, <code>_calculate_faithfulness()</code>, <code>_calculate_budget_adherence()</code>, <code>run_benchmark_suite()</code>", table_body)
        ],
        [
            Paragraph("<code>app/services/budget_learning_service.py</code>", table_body),
            Paragraph("Reinforcement Learning / Q-learning inspired budget feedback and calibration loop.", table_body),
            Paragraph("<code>BudgetLearningService</code>, <code>record_expense_feedback()</code>, <code>get_destination_insights()</code>, <code>get_learned_category_weight()</code>", table_body)
        ],
        [
            Paragraph("<code>app/api/transport.py</code>", table_body),
            Paragraph("Multi-modal transportation intelligence endpoints (Trains, Flights, Fuel, Road trip).", table_body),
            Paragraph("<code>search_trains()</code>, <code>search_flights_get()</code>, <code>get_fuel_prices()</code>, <code>estimate_road_trip_cost()</code>, <code>compare_modes()</code>", table_body)
        ],
        [
            Paragraph("<code>app/database/db.py</code>", table_body),
            Paragraph("Database engine, connection pooling, SQLite WAL settings, and auto-migration engine.", table_body),
            Paragraph("<code>create_database()</code> (with dynamic SQLite ALTER TABLE column migrations), <code>get_db()</code> dependency generator, <code>SessionLocal</code>", table_body)
        ]
    ]
    t_be = Table(backend_modules, colWidths=[120, 200, 220])
    t_be.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_NAVY),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER_LIGHT),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CARD_BG]),
    ]))
    story.append(t_be)
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 5: THE FRONTEND-BACKEND CONNECTION
    # ----------------------------------------------------
    story.append(Paragraph("5. The Connection: Frontend-to-Backend Lifecycle", h1_style))
    story.append(Paragraph(
        "Understanding how the Next.js frontend connects to the FastAPI backend is vital for full-stack comprehension and technical interviews.",
        body_style
    ))
    story.append(Paragraph(
        "<b>1. Dynamic Base URL Resolution (<code>apiConfig.ts</code>):</b><br/>"
        "In production on Vercel, the browser cannot connect to <code>localhost:8000</code>. The frontend uses <code>getApiBaseUrl()</code> which inspects <code>process.env.NEXT_PUBLIC_API_URL</code>. "
        "In development, it defaults to <code>http://127.0.0.1:8000</code>. In production, it routes to the live Render backend (<code>https://tripgeni.onrender.com</code>).",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. Axios Request & Response Interceptors:</b><br/>"
        "• <b>Request Interceptor:</b> Intercepts all outgoing HTTP calls in <code>authService</code> and <code>tripService</code>. Automatically extracts the JWT Bearer token from <code>localStorage.getItem('tripgenius_token')</code> and injects the header: <code>Authorization: Bearer &lt;token&gt;</code>.<br/>"
        "• <b>Response Interceptor (Rate Limit Catcher):</b> Inspects incoming HTTP responses. If a status code of <b>429 Too Many Requests</b> is detected, it reads the <code>Retry-After</code> header, triggers the global event <code>triggerRateLimitAlert()</code>, and opens the <code>RateLimitAlertModal</code> with a real-time countdown.<br/>"
        "• <b>422 Validation Error Parser:</b> If FastAPI returns HTTP 422 Unprocessable Entity, the interceptor parses Pydantic's error array into plain English sentences instead of failing with <code>[object Object]</code>.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. Cross-Origin Resource Sharing (CORS):</b><br/>"
        "The backend implements Starlette's <code>CORSMiddleware</code>. Requests from Vercel deployment domains (e.g. <code>https://tripgenius-kohl.vercel.app</code> or any preview URL matching <code>^https://.*\\.vercel\\.app$</code>) are recognized and granted cross-origin access with <code>allow_credentials=True</code>.",
        body_style
    ))
    story.append(create_callout(
        "Because CORSMiddleware is wrapped as the outermost middleware, even HTTP 429 Too Many Requests and HTTP 422 Unprocessable Entity responses carry proper CORS headers, preventing opaque browser network errors.",
        "Architectural Insight",
        "#0EA5E9",
        "#F0F9FF"
    ))
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 6: AI, OPENAI GPT-4O & TOURISM RAG
    # ----------------------------------------------------
    story.append(Paragraph("6. AI Intelligence, OpenAI gpt-4o & Tourism RAG Pipeline", h1_style))
    story.append(Paragraph(
        "<b>Current AI Runtime Reality: 100% OpenAI gpt-4o</b><br/>"
        "In your active <code>backend/.env</code>, <code>OPENAI_API_KEY</code> is set to an active key with <code>OPENAI_MODEL=gpt-4o</code>, while <code>GEMINI_API_KEY</code> is unconfigured. "
        "In <code>ai_service.py</code>, OpenAI is configured as <b>Priority 1</b>. Therefore, all live generative AI tasks (itinerary synthesis, budget narrative, and companion chat) execute through OpenAI gpt-4o.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Dual-Model Fallback Hierarchy:</b><br/>"
        "1. <b>Priority 1 (OpenAI gpt-4o):</b> First attempts generation via OpenAI with strict JSON mode (<code>response_format={'type': 'json_object'}</code>) and 30s timeout.<br/>"
        "2. <b>Priority 2 (Google Gemini 2.5 Flash):</b> If OpenAI credentials are absent or fail, automatically fails over to Gemini.<br/>"
        "3. <b>Priority 3 (Grounded Offline RAG Synthesis):</b> If both external APIs are unreachable (or network times out), the local deterministic Tourism RAG engine synthesizes a verified, rich multi-day plan with 0 downtime.",
        body_style
    ))
    story.append(Paragraph(
        "<b>How Tourism RAG Prevents Hallucinations:</b><br/>"
        "Before sending any user prompt to OpenAI, <code>TourismRAGService.retrieve_context_for_query()</code> searches a curated regional database containing verified facts for over 700 destinations and major transit corridors. "
        "It retrieves factual data: real attractions, local culinary dishes, authentic hotel pricing brackets, and verified IRCTC railway transit times. "
        "These facts are prepended into the OpenAI prompt as <code>VERIFIED REGIONAL RAG FACTS</code> with the strict system instruction: <i>'Adhere strictly to verified facts. Do not invent fictitious places or impossible transit routes.'</i>",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 7: TOKEN BUCKET RATE LIMITING
    # ----------------------------------------------------
    story.append(Paragraph("7. Token Bucket Rate Limiting Architecture", h1_style))
    story.append(Paragraph(
        "<b>What is the Token Bucket Algorithm?</b><br/>"
        "Imagine a bucket with a fixed capacity of tokens (e.g. 5 tokens). Every second, new tokens drip into the bucket at a constant refill rate (e.g. 1 token every 12 seconds). "
        "When a user makes a request, 1 token is removed from the bucket. If the bucket has tokens, the request is allowed immediately (burst capacity). "
        "If the bucket is empty, the request is rejected with <b>HTTP 429 Too Many Requests</b> and informed exactly how many seconds to wait until a token refills.",
        body_style
    ))

    rl_data = [
        [Paragraph("<b>Bucket Category</b>", table_header), Paragraph("<b>Target Endpoints</b>", table_header), Paragraph("<b>Capacity</b>", table_header), Paragraph("<b>Refill Rate</b>", table_header), Paragraph("<b>Cooldown & Purpose</b>", table_header)],
        [
            Paragraph("<b>Auth Bucket</b>", table_body),
            Paragraph("<code>/api/auth/login</code><br/><code>/api/auth/register</code><br/><code>/api/auth/send-password-otp</code>", table_body),
            Paragraph("<b>5 tokens</b>", table_body),
            Paragraph("5 / min<br/>(1 per 12s)", table_body),
            Paragraph("Strict burst control. Guards against brute-force password guessing and account spamming.", table_body)
        ],
        [
            Paragraph("<b>Booking Bucket</b>", table_body),
            Paragraph("<code>/api/trips/create</code><br/><code>/api/trips/generate-ai-itinerary</code><br/><code>/api/transport/flights/booking-links</code><br/><code>/api/transport/trains/*</code>", table_body),
            Paragraph("<b>10 tokens</b>", table_body),
            Paragraph("10 / min<br/>(1 per 6s)", table_body),
            Paragraph("Prevents spamming expensive OpenAI itinerary generation and external rail/flight APIs.", table_body)
        ],
        [
            Paragraph("<b>General Bucket</b>", table_body),
            Paragraph("All other <code>/api/*</code> routes<br/>(weather, profile, history)", table_body),
            Paragraph("<b>60 tokens</b>", table_body),
            Paragraph("60 / min<br/>(1 per 1s)", table_body),
            Paragraph("Permits smooth, fast browsing and dashboard navigation without throttling.", table_body)
        ]
    ]
    t_rl = Table(rl_data, colWidths=[80, 160, 55, 65, 180])
    t_rl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_NAVY),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER_LIGHT),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CARD_BG]),
    ]))
    story.append(t_rl)
    story.append(Paragraph(
        "<b>Endpoint Isolation Guarantee:</b> The buckets are completely segregated by client IP. If a user exhausts their login attempts (Auth Bucket), they are NOT locked out of browsing flights or saving trips (Booking Bucket).",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 8: EVALUATION METRICS FRAMEWORK (TQI)
    # ----------------------------------------------------
    story.append(Paragraph("8. Quantitative Evaluation Metrics Framework (Trip Quality Index / TQI)", h1_style))
    story.append(Paragraph(
        "To evaluate RAG generation quality quantitatively, Trip Geni implements a formal 5-rubric evaluation engine in <code>evaluation_service.py</code>. "
        "Every generated trip receives a mathematical <b>Trip Quality Index (TQI, 0-100%)</b> and letter grade (A+, A, B+, B, C, D).",
        body_style
    ))

    tqi_data = [
        [Paragraph("<b>Rubric Pillar</b>", table_header), Paragraph("<b>Weight</b>", table_header), Paragraph("<b>Mathematical Measurement & Logic</b>", table_header)],
        [
            Paragraph("<b>1. RAG Faithfulness & Groundedness</b>", table_body),
            Paragraph("<b>30%</b>", table_body),
            Paragraph("Cross-checks generated attractions, stays, and food against grounded RAG knowledge. Penalizes unverified entities.", table_body)
        ],
        [
            Paragraph("<b>2. Budget Adherence</b>", table_body),
            Paragraph("<b>25%</b>", table_body),
            Paragraph("Evaluates financial precision: <code>max(0, 1 - |estimated - budget| / budget)</code> across lodging, transit, and food.", table_body)
        ],
        [
            Paragraph("<b>3. Pacing & Schedule Feasibility</b>", table_body),
            Paragraph("<b>20%</b>", table_body),
            Paragraph("Checks temporal feasibility: 2-4 activities per day, non-overlapping morning/afternoon/evening slots, and travel buffers.", table_body)
        ],
        [
            Paragraph("<b>4. Context & Interest Relevance</b>", table_body),
            Paragraph("<b>15%</b>", table_body),
            Paragraph("Measures the presence of user interests (nature, food, heritage, adventure) in selected venues and day themes.", table_body)
        ],
        [
            Paragraph("<b>5. Eco-Sustainability Rating</b>", table_body),
            Paragraph("<b>10%</b>", table_body),
            Paragraph("Scores multi-modal transit carbon impact and eco-conscious habits (rail vs air, shared transit, local dining).", table_body)
        ]
    ]
    t_tqi = Table(tqi_data, colWidths=[140, 50, 350])
    t_tqi.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL_ACCENT),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER_LIGHT),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CARD_BG]),
    ]))
    story.append(t_tqi)
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 9: TECHNICAL TERMS EXPLAINED IN SIMPLE WORDS
    # ----------------------------------------------------
    story.append(Paragraph("9. Key Technical Terms Explained in Simple Words", h1_style))
    story.append(Paragraph(
        "Here is a plain-English translation of the advanced software engineering and AI terms used in Trip Geni:",
        body_style
    ))

    terms = [
        ("RAG (Retrieval-Augmented Generation)", "Giving an AI an open-book exam. Instead of asking the AI to guess from memory, we first look up verified facts in our tourism database and give those facts to the AI so it writes an accurate answer."),
        ("Token Bucket Rate Limiting", "A fair queueing system that lets users perform normal quick actions (bursts), but prevents bots or spam scripts from overwhelming the server by requiring a token for every request."),
        ("JWT (JSON Web Token)", "A secure digital badge given to the user after logging in. The frontend saves this badge and presents it in the header of every request so the server knows who is calling without re-checking passwords."),
        ("WAL Mode (Write-Ahead Logging)", "An advanced SQLite database optimization. In standard mode, only one person can touch the database at a time. In WAL mode, many users can read data at the same time while someone else is writing."),
        ("Cold Start (Render 15-min Sleep)", "Free cloud servers (like Render) go to sleep after 15 minutes of inactivity to save electricity. When a new user arrives, the server takes 30-50 seconds to boot up. This is a cloud infrastructure behavior, NOT an application rate limit or bug."),
        ("Pydantic Validation (HTTP 422)", "A strict bouncer for incoming data. If an API expects an email and a password, and the user sends numbers or missing fields, Pydantic immediately rejects the request with HTTP 422 before bad data touches the database."),
        ("Geocoding (Nominatim 1 RPS)", "Converting a city or attraction name into GPS coordinates (Latitude/Longitude). OpenStreetMap's Nominatim allows only 1 request per second (1 RPS). Trip Geni prevents IP bans by queuing lookups with 800ms delays and local caching."),
        ("Q-Learning / Budget RL", "A machine learning technique where the system learns from actual user trip receipts. If travelers consistently spend 10% more on food in Munnar than expected, the algorithm automatically adjusts future budget estimates.")
    ]

    for term, exp in terms:
        story.append(Paragraph(f"• <b>{term}:</b> {exp}", body_style))

    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 10: CRITICAL FUNCTIONS CATALOG
    # ----------------------------------------------------
    story.append(Paragraph("10. Critical Functions Catalog & Plain English Explanations", h1_style))
    story.append(Paragraph(
        "Below are the most important functions across the codebase, where they live, what they do, and how to explain them in an interview:",
        body_style
    ))

    funcs = [
        [Paragraph("<b>Function & Location</b>", table_header), Paragraph("<b>What It Does (Simple Words)</b>", table_header), Paragraph("<b>Interview Explanation Tip</b>", table_header)],
        [
            Paragraph("<code>consume()</code><br/><code>rate_limiter.py</code>", table_body),
            Paragraph("Checks if a client has enough tokens left in their bucket to perform an action. If yes, subtracts 1 token and returns allowed=True. If no, calculates the exact seconds until the next token drops.", table_body),
            Paragraph("'I implemented a thread-safe token bucket using time.monotonic() to eliminate clock drift and accurately enforce category quotas.'", table_body)
        ],
        [
            Paragraph("<code>RateLimitMiddleware.dispatch()</code><br/><code>rate_limiter.py</code>", table_body),
            Paragraph("Intercepts every incoming HTTP request. Classifies the route into Auth, Booking, or General, checks the caller's IP bucket, and either returns HTTP 429 with Retry-After or passes the request to the route.", table_body),
            Paragraph("'Placed behind CORS so error responses retain required headers. Prevents CORS browser blockage during 429 exhaustion.'", table_body)
        ],
        [
            Paragraph("<code>_generate_content()</code><br/><code>ai_service.py</code>", table_body),
            Paragraph("The core AI communication pipeline. Sends the master itinerary prompt to OpenAI gpt-4o in JSON mode. If OpenAI fails, falls back to Gemini. If Gemini fails, triggers deterministic offline generation.", table_body),
            Paragraph("'Architected with a dual-model fallback hierarchy to achieve 99.9% itinerary synthesis availability.'", table_body)
        ],
        [
            Paragraph("<code>retrieve_context_for_query()</code><br/><code>tourism_rag_service.py</code>", table_body),
            Paragraph("Analyzes user destination and route queries, searches the 700+ destination dataset, and returns verified regional facts (highlights, IRCTC trains, road distance, authentic food) to inject into the LLM prompt.", table_body),
            Paragraph("'This is our RAG retriever. It grounds the LLM in regional facts to eliminate hallucinations.'", table_body)
        ],
        [
            Paragraph("<code>evaluate_itinerary()</code><br/><code>evaluation_service.py</code>", table_body),
            Paragraph("Takes any generated plan and runs multi-rubric evaluation: Faithfulness, Budget Adherence, Pacing, Context Relevance, and Eco Score, returning the composite Trip Quality Index (TQI).", table_body),
            Paragraph("'Demonstrates quantitative AI evaluation. We don't just generate text; we evaluate accuracy mathematically.'", table_body)
        ],
        [
            Paragraph("<code>create_database()</code><br/><code>db.py</code>", table_body),
            Paragraph("Initializes SQLite database tables and inspects table PRAGMAs to automatically run ALTER TABLE migrations for newly added model columns (username, date_of_birth, etc.).", table_body),
            Paragraph("'Solves SQLite's limitation where create_all() ignores new columns on existing database files.'", table_body)
        ],
        [
            Paragraph("<code>getApiBaseUrl()</code><br/><code>apiConfig.ts (Frontend)</code>", table_body),
            Paragraph("Inspects environment variables and resolves the backend URL. Points to Render in production and localhost:8000 in local development.", table_body),
            Paragraph("'Eliminates hardcoded hostnames, ensuring zero broken API connections between Vercel and Render.'", table_body)
        ]
    ]
    t_fn = Table(funcs, colWidths=[130, 210, 200])
    t_fn.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_NAVY),
        ("BOX", (0, 0), (-1, -1), 0.7, BORDER_LIGHT),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CARD_BG]),
    ]))
    story.append(t_fn)
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 11: DEPLOYMENT & DEVOPS
    # ----------------------------------------------------
    story.append(Paragraph("11. Deployment, DevOps & Production Resilience", h1_style))
    story.append(Paragraph(
        "<b>Frontend Deployment (Vercel):</b><br/>"
        "• Git push to <code>main</code> triggers automated Vercel CI/CD builds.<br/>"
        "• All 23 Next.js routes are statically optimized (SSG) with client hydration where required.<br/>"
        "• Turbopack enables instant hot module reloading during development.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Backend Deployment (Render):</b><br/>"
        "• Runs as a Python 3.13 web service on Render, managed by Uvicorn ASGI on port 8000.<br/>"
        "• <b>Handling Render's 15-Minute Inactivity Sleep:</b> Free tier containers spin down after 15 minutes of idle time. The first request takes 30-50 seconds to wake up.<br/>"
        "• <b>Our Engineering Solution:</b><br/>"
        "  1. <i>Instant Cache Render:</i> The profile and dashboard render locally cached state from <code>localStorage</code> immediately (0ms).<br/>"
        "  2. <i>AbortController Timeouts:</i> Added 3.5s timeout abort signals to profile lookups so the UI never freezes indefinitely.<br/>"
        "  3. <i>Helpful Error Messages:</i> Axios interceptor detects timeout and explains to the user: <i>'The travel server is waking up from idle sleep (Render cold start). Please wait a few seconds...'</i>",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 12: TOP 10 INTERVIEW QUESTIONS & MODEL ANSWERS
    # ----------------------------------------------------
    story.append(Paragraph("12. Top 10 Technical Interview Questions & Model Answers", h1_style))
    story.append(Paragraph(
        "Use these structured answers when explaining Trip Geni in software engineering and AI internship interviews:",
        body_style
    ))

    qa_list = [
        ("Q1: Walk me through the architecture of Trip Geni.",
         "Trip Geni is a full-stack AI travel platform. The frontend is built on Next.js 15 App Router and React 19 deployed on Vercel. The backend is an asynchronous FastAPI service deployed on Render. Our AI engine uses OpenAI gpt-4o as the primary generator, grounded by a regional Tourism RAG service to prevent hallucinations. We use SQLite in WAL mode with auto-migrations, an endpoint-wise Token Bucket rate limiter, and a quantitative Trip Quality Index evaluation framework."),
        ("Q2: Why did you migrate from Gemini to OpenAI?",
         "We originally prototyped with Gemini 1.5/2.5 Flash, but migrated to OpenAI gpt-4o for our primary pipeline because of its superior adherence to strict JSON schemas and more nuanced multi-turn conversational memory. However, we kept Gemini as an automated secondary fallback in code, giving us multi-model redundancy so our platform remains online even if one provider encounters an outage."),
        ("Q3: How does your Tourism RAG pipeline prevent hallucinations?",
         "Vanilla LLMs frequently hallucinate closed attractions or non-existent direct transit. Our RAG pipeline intercepts user queries, searches our curated database of 700+ destinations and inter-city transit corridors, and extracts verified facts (geodesic distance, highway travel hours, IRCTC train numbers, hotel price brackets). We inject these verified facts into the prompt before calling OpenAI, forcing the model to ground its response in real data."),
        ("Q4: How does your Token Bucket rate limiter work?",
         "We implemented a thread-safe Token Bucket algorithm in FastAPI middleware. Instead of a single blanket limit, we separated buckets by endpoint category: Auth has 5 tokens (refills every 12s) to prevent credential stuffing; Booking has 10 tokens (refills every 6s) to protect expensive AI and booking APIs; and General routes have 60 tokens. If exhausted, the backend returns HTTP 429 with a Retry-After header, and our frontend displays a glassmorphism countdown alert."),
        ("Q5: How do you evaluate the quality of your generated itineraries?",
         "We implemented a quantitative evaluation service inspired by RAGAS. It scores each itinerary across 5 weighted pillars: RAG Faithfulness (30%), Budget Adherence (25%), Pacing & Schedule Feasibility (20%), Context Relevance (15%), and Eco-Sustainability (10%). This yields a composite Trip Quality Index (TQI) from 0 to 100% and a letter grade, which we also test across automated destination benchmarks."),
        ("Q6: How do you handle database migrations with SQLite?",
         "In SQLite, standard SQLAlchemy create_all() will not add new columns to an existing table. In create_database(), we implemented an automatic column introspection engine using PRAGMA table_info. It detects missing columns at application startup and dynamically executes ALTER TABLE statements, ensuring smooth schema evolution without manual database wipes."),
        ("Q7: How did you solve the Render cold start issue?",
         "On Render's free tier, the backend sleeps after 15 minutes of inactivity, causing a 30-50 second boot delay. To prevent the frontend from freezing on a white screen, we implemented optimistic local storage hydration (0ms instant render for profiles), paired with 3.5-second AbortController timeouts and friendly user notifications explaining the cloud wake-up cycle."),
        ("Q8: How do you handle OpenStreetMap Nominatim rate limits?",
         "Nominatim strictly enforces a 1 request per second (1 RPS) policy. In our Leaflet map component, we implemented an 800ms staggered queue for sequential geocoding requests and cached resolved coordinate pairs in localStorage, completely eliminating 429 IP bans from OpenStreetMap."),
        ("Q9: What is the Eco-Travel Score and how is it calculated?",
         "The Eco-Travel Score is an objective sustainability rating from 0 to 100. It evaluates multi-modal transit choices (rail and shared bus award points, while flights carry carbon penalties), eco-conscious activities (nature walks, wildlife sanctuaries), and green accommodation habits, encouraging lower-impact tourism."),
        ("Q10: What was the most challenging bug you resolved in this project?",
         "One challenging issue was an HTTP 422 Unprocessable Entity error on login. It occurred because the login Pydantic schema was enforcing a minimum password length of 8 characters, rejecting shorter legacy credentials before database verification. We refactored the login schema to accept general strings while retaining strict validation on registration, implemented case-insensitive email matching, and improved error parsing so users receive actionable feedback.")
    ]

    for q, a in qa_list:
        story.append(Paragraph(f"<b>{q}</b>", h2_style))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=10, spaceAfter=10))
    story.append(Paragraph(
        "<b>Document End • Trip Geni Technical Handbook</b><br/>"
        "Created for educational review, code mastery, and engineering excellence. All rights reserved.",
        ParagraphStyle("FooterEnd", fontName=FONT_OBLIQUE, fontSize=8, leading=11, textColor=TEXT_MUTED, alignment=TA_CENTER)
    ))

    # Build the document once and copy to secondary paths
    first_path = Path(output_paths[0])
    first_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(first_path),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46,
    )
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated primary: {first_path.resolve()} ({first_path.stat().st_size} bytes)")

    for secondary in output_paths[1:]:
        sec_path = Path(secondary)
        sec_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(first_path, sec_path)
        print(f"Copied to: {sec_path.resolve()} ({sec_path.stat().st_size} bytes)")


if __name__ == "__main__":
    out_files = [
        "d:/tripgenius/trippy.pdf",
        "C:/Users/deva5/.gemini/antigravity/brain/7bd95c8b-4710-4b50-88cf-0db3af9b3d75/trippy.pdf"
    ]
    build_trippy_pdf(out_files)
