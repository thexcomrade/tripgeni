"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Sparkles,
  CloudSun,
  MapPin,
  Calendar,
  Leaf,
  Utensils,
  Rocket,
  Check,
  Loader2,
  Compass,
  Cpu,
  Layers,
  ShieldCheck,
} from "lucide-react";
import "./LiquidLoadingNav.css";

export interface SynthesisStage {
  id: number;
  label: string;
  shortTag: string;
  iconName: string;
  metric: string;
}

interface LiquidLoadingNavProps {
  currentStage: number;
  destination: string;
  stages: SynthesisStage[];
}

const DESTINATION_INSIGHTS = [
  "Mapping optimal chronological sequence to capture iconic sights during ideal golden-hour lighting.",
  "Calibrating transit legs along progressive linear corridors to eliminate backtracking and travel fatigue.",
  "Filtering top-rated local dining spots featuring authentic regional thalis and chef-curated culinary traditions.",
  "Cross-referencing opening hours, entry slots, and crowd density indexes for seamless sightseeing.",
  "Balancing walking distances with comfortable rest buffers and low-emission regional transit.",
];

export default function LiquidLoadingNav({
  currentStage,
  destination,
  stages,
}: LiquidLoadingNavProps) {
  const [insightIdx, setInsightIdx] = useState(0);
  const [glarePos, setGlarePos] = useState<{ x: string; y: string }>({
    x: "50%",
    y: "50%",
  });
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({
    left: 4,
    width: 60,
  });
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Rotate travel insights every 3.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIdx((prev) => (prev + 1) % DESTINATION_INSIGHTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Update active sliding pill position
  useEffect(() => {
    const currentBtn = btnRefs.current[currentStage];
    if (currentBtn) {
      setPillStyle({
        left: currentBtn.offsetLeft,
        width: currentBtn.offsetWidth,
      });
    }
  }, [currentStage]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = `${e.clientX - rect.left}px`;
    const y = `${e.clientY - rect.top}px`;
    setGlarePos({ x, y });
  };

  const getStageIcon = (iconName: string, isDone: boolean, isCurrent: boolean) => {
    if (isDone) return <Check size={13} className="icon-done" />;
    if (isCurrent) return <Loader2 size={12} className="icon-spinning" />;
    switch (iconName) {
      case "brain":
        return <Sparkles size={12} />;
      case "weather":
        return <CloudSun size={12} />;
      case "poi":
        return <MapPin size={12} />;
      case "schedule":
        return <Calendar size={12} />;
      case "eco":
        return <Leaf size={12} />;
      case "dining":
        return <Utensils size={12} />;
      case "rocket":
      default:
        return <Rocket size={12} />;
    }
  };

  const activeStage = stages[currentStage] || stages[0];
  const progressPercent = Math.min(100, Math.round(((currentStage + 1) / stages.length) * 100));

  return (
    <div className="liquid-loading-wrapper">
      {/* 1. AMBIENT MESH LIGHT REFRACTION */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* 2. CINEMATIC SYNTHESIS CONSOLE CARD */}
      <div className="liquid-glass-card">
        {/* COMPASS RADAR + LIVE TELEMETRY HEADER */}
        <div className="synthesis-hero-banner">
          <div className="radar-compass-wrapper">
            <div className="radar-ring radar-ring-outer" />
            <div className="radar-ring radar-ring-middle" />
            <div className="radar-ring radar-ring-inner" />
            <div className="radar-crosshair-h" />
            <div className="radar-crosshair-v" />
            <div className="radar-sweep" />
            <div className="radar-center-core">
              <Compass size={22} className="radar-compass-icon" />
            </div>
          </div>

          <div className="synthesis-headline-block">
            <div className="synthesis-badge-row">
              <span className="live-status-dot" />
              <span className="telemetry-pill">AUTONOMOUS MULTI-AGENT SYNTHESIS</span>
              <span className="telemetry-coord">CORRIDOR: {destination.toUpperCase()}</span>
            </div>
            <h2 className="synthesis-main-heading">
              Synthesizing Bespoke Itinerary for{" "}
              <span className="highlight-dest">{destination}</span>
            </h2>
            <p className="synthesis-subheading">
              Harmonizing geographic waypoint order, verified landmarks, dining culture, and optimal pacing.
            </p>
          </div>
        </div>

        {/* 3. MULTI-AGENT ORCHESTRATION CAROUSEL */}
        <div className="agent-telemetry-row">
          <div className={`agent-chip ${currentStage >= 0 ? "active" : ""}`}>
            <Cpu size={12} />
            <span>Neural Corridor</span>
          </div>
          <div className={`agent-chip ${currentStage >= 2 ? "active" : ""}`}>
            <Layers size={12} />
            <span>Landmark Geometry</span>
          </div>
          <div className={`agent-chip ${currentStage >= 4 ? "active" : ""}`}>
            <Leaf size={12} />
            <span>Carbon Pacing</span>
          </div>
          <div className={`agent-chip ${currentStage >= 5 ? "active" : ""}`}>
            <ShieldCheck size={12} />
            <span>Schedule Pacing</span>
          </div>
        </div>

        {/* 4. LIQUID NAVIGATION BAR WITH SLIDING SPRING PILL */}
        <div
          className="liquid-nav"
          onMouseMove={handleMouseMove}
          style={
            {
              "--x": glarePos.x,
              "--y": glarePos.y,
            } as React.CSSProperties
          }
        >
          <div className="liquid-glare-container">
            <div className="liquid-glare" />
          </div>

          <div className="nav-items">
            <div
              className="active-pill"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
              }}
            />

            {stages.map((st, idx) => {
              const isDone = currentStage > idx;
              const isCurrent = currentStage === idx;
              return (
                <button
                  key={st.id}
                  ref={(el) => {
                    btnRefs.current[idx] = el;
                  }}
                  type="button"
                  className={`nav-btn ${isCurrent ? "active" : ""} ${isDone ? "done" : ""}`}
                >
                  <div className="btn-content">
                    <span className="btn-icon">
                      {getStageIcon(st.iconName, isDone, isCurrent)}
                    </span>
                    <span className="btn-text">{st.shortTag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. ACTIVE STAGE SPOTLIGHT & PROGRESS */}
        <div className="active-stage-spotlight">
          <div className="spotlight-header">
            <div className="spotlight-title-row">
              <span className="spotlight-pulse" />
              <strong className="spotlight-label">{activeStage.label}</strong>
            </div>
            <span className="spotlight-badge">
              Step {currentStage + 1} of {stages.length} ({progressPercent}%)
            </span>
          </div>

          {/* Liquid Progress Bar */}
          <div className="liquid-progress-track">
            <div
              className="liquid-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="spotlight-footer">
            <span className="spotlight-metric">
              ⚡ {activeStage.metric}
            </span>
            <span className="live-intelligence-indicator">
              AI Orchestrator Active
            </span>
          </div>
        </div>

        {/* 6. ROTATING TRAVEL INTELLIGENCE TICKER */}
        <div className="synthesis-insight-ticker">
          <div className="ticker-icon-wrap">
            <Sparkles size={14} className="ticker-sparkle" />
          </div>
          <div className="ticker-text-block">
            <span className="ticker-tag">INTELLIGENT TRAVEL REFINEMENT</span>
            <p className="ticker-content" key={insightIdx}>
              {DESTINATION_INSIGHTS[insightIdx]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
