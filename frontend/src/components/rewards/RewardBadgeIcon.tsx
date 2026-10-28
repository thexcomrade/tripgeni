"use client";

import React from "react";
import Image from "next/image";

export type RewardSlug =
  | "pioneer-traveler"
  | "green-pathfinder"
  | "western-ghats"
  | "bucket-list"
  | "frugal-nomad"
  | "carbon-reducer"
  | "heritage-seeker"
  | "ganga-pilgrim"
  | "waterfalls-chaser"
  | "culinary-trailblazer"
  | "peak-conqueror"
  | "zero-carbon"
  | "grand-heritage"
  | "solo-wanderer"
  | "master-explorer"
  | "coastal-nomad"
  | "global-voyager";

interface RewardBadgeIconProps {
  icon?: string;
  id?: number;
  title?: string;
  size?: number;
  unlocked?: boolean;
  inProgress?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const REWARD_MAP_BY_ID: Record<number, RewardSlug> = {
  1: "pioneer-traveler",
  2: "green-pathfinder",
  3: "western-ghats",
  4: "bucket-list",
  5: "frugal-nomad",
  6: "carbon-reducer",
  7: "heritage-seeker",
  8: "ganga-pilgrim",
  9: "waterfalls-chaser",
  10: "culinary-trailblazer",
  11: "peak-conqueror",
  12: "zero-carbon",
  13: "grand-heritage",
  14: "solo-wanderer",
  15: "master-explorer",
};

const REWARD_MAP_BY_EMOJI: Record<string, RewardSlug> = {
  "✈️": "pioneer-traveler",
  "🌱": "green-pathfinder",
  "⛰️": "western-ghats",
  "❤️": "bucket-list",
  "💰": "frugal-nomad",
  "🍃": "carbon-reducer",
  "🛕": "heritage-seeker",
  "🛶": "ganga-pilgrim",
  "🌊": "waterfalls-chaser",
  "🍲": "culinary-trailblazer",
  "🧗‍♂️": "peak-conqueror",
  "⚡": "zero-carbon",
  "🏛️": "grand-heritage",
  "🎒": "solo-wanderer",
  "👑": "master-explorer",
  "🏔️": "western-ghats",
  "🌍": "global-voyager",
};

const REWARD_MAP_BY_TITLE: Record<string, RewardSlug> = {
  "pioneer traveler": "pioneer-traveler",
  "first journey": "pioneer-traveler",
  "green pathfinder": "green-pathfinder",
  "eco explorer": "green-pathfinder",
  "western ghats connoisseur": "western-ghats",
  "highland trailblazer": "western-ghats",
  "bucket list collector": "bucket-list",
  "frugal nomad": "frugal-nomad",
  "budget architect": "frugal-nomad",
  "carbon reducer": "carbon-reducer",
  "spiritual & heritage seeker": "heritage-seeker",
  "sacred ganga dawn pilgrim": "ganga-pilgrim",
  "courtallam waterfalls chaser": "waterfalls-chaser",
  "culinary trailblazer": "culinary-trailblazer",
  "highland peak conqueror": "peak-conqueror",
  "zero carbon champion": "zero-carbon",
  "grand heritage maven": "grand-heritage",
  "solo wanderer": "solo-wanderer",
  "master explorer crest": "master-explorer",
  "coastal nomad": "coastal-nomad",
  "global voyager": "global-voyager",
};

export function resolveRewardSlug(
  icon?: string,
  id?: number,
  title?: string,
): RewardSlug {
  if (id && REWARD_MAP_BY_ID[id]) {
    return REWARD_MAP_BY_ID[id];
  }

  if (icon) {
    const cleanIcon = icon.trim();
    if (cleanIcon.startsWith("/rewards/") || cleanIcon.endsWith(".svg") || cleanIcon.endsWith(".png")) {
      const match = cleanIcon.match(/\/rewards\/([^.]+)\.(svg|png)/);
      if (match && match[1]) return match[1] as RewardSlug;
    }
    if (REWARD_MAP_BY_EMOJI[cleanIcon]) {
      return REWARD_MAP_BY_EMOJI[cleanIcon];
    }
    const slugKey = cleanIcon.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (Object.values(REWARD_MAP_BY_ID).includes(slugKey as RewardSlug)) {
      return slugKey as RewardSlug;
    }
  }

  if (title) {
    const cleanTitle = title.trim().toLowerCase();
    if (REWARD_MAP_BY_TITLE[cleanTitle]) {
      return REWARD_MAP_BY_TITLE[cleanTitle];
    }
    for (const [key, slug] of Object.entries(REWARD_MAP_BY_TITLE)) {
      if (cleanTitle.includes(key) || key.includes(cleanTitle)) {
        return slug;
      }
    }
  }

  return "pioneer-traveler";
}

export default function RewardBadgeIcon({
  icon,
  id,
  title,
  size = 46,
  unlocked = true,
  inProgress = false,
  className = "",
  style = {},
}: RewardBadgeIconProps) {
  const slug = resolveRewardSlug(icon, id, title);
  const src = `/rewards/${slug}.png`;

  return (
    <div
      className={`reward-badge-icon-wrapper ${className}`}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        filter: unlocked
          ? "drop-shadow(0 4px 12px rgba(14, 165, 233, 0.35))"
          : inProgress
          ? "saturate(0.75) opacity(0.85)"
          : "grayscale(1) opacity(0.42)",
        transition: "transform 0.25s ease, filter 0.25s ease",
        ...style,
      }}
    >
      <Image
        src={src}
        alt={title || slug}
        width={size}
        height={size}
        unoptimized={true}
        priority={id === 1 || id === 15}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
}
