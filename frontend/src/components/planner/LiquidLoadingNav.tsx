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

export default function LiquidLoadingNav({
  currentStage,
  destination,
  stages,
}: LiquidLoadingNavProps) {
  const [glarePos, setGlarePos] = useState<{ x: string; y: string }>({
    x: "50%",
    y: "50%",
  });
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({
    left: 4,
    width: 60,
  });
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update active sliding pill position with Apple bouncy spring
  useEffect(() => {
    const currentBtn = btnRefs.current[currentStage];
    if (currentBtn) {
      setPillStyle({
        left: currentBtn.offsetLeft,
        width: currentBtn.offsetWidth,
      });
    }
  }, [currentStage]);

  // Handle interactive 3D light specular glare that follows cursor / finger
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
      {/* 1. AMBIENT LIGHT BLOBS (Mesh background for authentic liquid light refraction) */}
      <div className="bg-mesh" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* 2. COMPACT LIQUID GLASS CARD */}
      <div className="liquid-glass-card">
        {/* Compact Header */}
        <div className="liquid-card-header">
          <div className="liquid-neural-orb">
            <Sparkles size={20} className="orb-sparkle" />
          </div>
          <div className="liquid-header-text">
            <h3 className="liquid-title">
              Synthesizing Itinerary for <span className="highlight-dest">{destination}</span>...
            </h3>
            <p className="liquid-sub">
              Our neural multi-agent system is crafting your bespoke travel roadmap
            </p>
          </div>
        </div>

        {/* 3. LIQUID GLASS NAVIGATION BAR (Apple Liquid Glass with Bouncy Spring Pill) */}
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
          {/* 3D Specular Interactive Glare */}
          <div className="liquid-glare-container">
            <div className="liquid-glare" />
          </div>

          <div className="nav-items">
            {/* Smooth Bouncy Sliding Pill */}
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

        {/* 4. ACTIVE STAGE SPOTLIGHT GLASS PANEL */}
        <div className="active-stage-spotlight">
          <div className="spotlight-header">
            <div className="spotlight-title-row">
              <span className="spotlight-pulse" />
              <strong className="spotlight-label">{activeStage.label}</strong>
            </div>
            <span className="spotlight-badge">
              Stage {currentStage + 1} of {stages.length}
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
            <span className="spotlight-percent">{progressPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
