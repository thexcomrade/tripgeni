"use client";

import React from "react";
import { Compass, Bookmark, Sliders } from "lucide-react";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tripsCount?: number;
  savedCount?: number;
  achievementsCount?: number;
}

const TABS = [
  {
    id: "trips",
    label: "My Journeys",
    icon: Compass,
    countKey: "trips",
  },
  {
    id: "saved",
    label: "Saved Plans",
    icon: Bookmark,
    countKey: "saved",
  },
  {
    id: "preferences",
    label: "Travel Styles",
    icon: Sliders,
  },
];

export default function ProfileTabs({
  activeTab,
  onTabChange,
  tripsCount,
  savedCount,
}: ProfileTabsProps) {
  const getCount = (key?: string) => {
    if (key === "trips" && typeof tripsCount === "number") return tripsCount;
    if (key === "saved" && typeof savedCount === "number") return savedCount;
    return undefined;
  };

  return (
    <section style={{ maxWidth: "1200px", margin: "0 auto 28px", padding: "0 8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "6px",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          background: "rgba(15, 23, 42, 0.70)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const count = getCount(tab.countKey);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "12px",
                fontSize: "0.88rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#FFFFFF" : "#94A3B8",
                background: isActive
                  ? "linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(20, 184, 166, 0.3) 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(14, 165, 233, 0.45)"
                  : "1px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={16} color={isActive ? "#38BDF8" : "#94A3B8"} />
              <span>{tab.label}</span>
              {typeof count === "number" && (
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    background: isActive
                      ? "rgba(14, 165, 233, 0.4)"
                      : "rgba(255, 255, 255, 0.08)",
                    color: isActive ? "#FFFFFF" : "#CBD5E1",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
