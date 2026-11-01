"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Clock,
  Compass,
  Globe,
  MapPin,
  Trash2,
  Plus,
  X,
  Search,
  Sun,
  Moon,
  RotateCcw,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Check,
  Smartphone,
  Laptop,
  Navigation,
  SlidersHorizontal,
} from "lucide-react";
import {
  WorldCity,
  GLOBAL_CITIES_DATASET,
  getClockTimeDetails,
  getLocalDeviceCity,
  DEFAULT_SAVED_CLOCKS,
  loadSavedClocks,
  saveClocksToStorage,
  calculateUtcOffset,
} from "../../utils/worldClockData";

export default function SmartWorldClockAndCompass() {
  const [activeTab, setActiveTab] = useState<"clock" | "compass">("clock");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [savedClocks, setSavedClocks] = useState<WorldCity[]>(DEFAULT_SAVED_CLOCKS);
  const [isManageMode, setIsManageMode] = useState<boolean>(false);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [comparisonSliderHour, setComparisonSliderHour] = useState<number | null>(null);

  // Compass States
  const [compassHeading, setCompassHeading] = useState<number>(42);
  const [isHardwareActive, setIsHardwareActive] = useState<boolean>(false);
  const [needsIosPermission, setNeedsIosPermission] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [targetDestinationId, setTargetDestinationId] = useState<string>("lon_gb");
  const [gpsData, setGpsData] = useState<{
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    speed: number | null;
  }>({ lat: null, lng: null, accuracy: null, speed: null });

  // 1. Live Continuous Clock Ticker (1-second precision)
  useEffect(() => {
    // Initial sync
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load Saved Clocks from LocalStorage on mount
  useEffect(() => {
    const loaded = loadSavedClocks();
    setSavedClocks(loaded);
  }, []);

  // 3. Mobile Hardware Sensor Detection for Compass
  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const mobileDetected = isMobileUa || (hasTouch && window.innerWidth < 1024);
    setIsMobileDevice(mobileDetected);

    // Responsive: On mobile, start with Add Location panel closed to avoid screen crowding
    if (window.innerWidth < 1024) {
      setIsAddPanelOpen(false);
    }

    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      setNeedsIosPermission(true);
    }
  }, []);

  // 4. Orientation Event Listener (Android & iOS)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading provides true magnetic north
      const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === "number" && !isNaN(webkitHeading)) {
        setCompassHeading(Math.round(webkitHeading));
        setIsHardwareActive(true);
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Android absolute heading or standard alpha
        const heading = Math.round(360 - e.alpha) % 360;
        setCompassHeading(heading);
        setIsHardwareActive(true);
      }
    };

    if (window.DeviceOrientationEvent && !needsIosPermission) {
      window.addEventListener("deviceorientationabsolute" as unknown as "deviceorientation", handleOrientation);
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientationabsolute" as unknown as "deviceorientation", handleOrientation);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [needsIosPermission]);

  // 5. GPS Telemetry Watcher
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation || activeTab !== "compass") return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsData({
          lat: parseFloat(pos.coords.latitude.toFixed(4)),
          lng: parseFloat(pos.coords.longitude.toFixed(4)),
          accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null,
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null, // km/h
        });
      },
      (err) => console.debug("GPS Telemetry note:", err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [activeTab]);

  // Request iOS Compass Permission
  const requestIosCompass = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      try {
        const perm = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (perm === "granted") {
          setNeedsIosPermission(false);
          setIsHardwareActive(true);
        }
      } catch (e) {
        console.warn("Compass permission request error:", e);
      }
    }
  };

  // Local Device Clock Calculation
  const localDeviceCity = useMemo(() => getLocalDeviceCity(), []);
  const localClockDetails = useMemo(() => {
    return getClockTimeDetails(localDeviceCity.iana, currentTime, currentTime);
  }, [localDeviceCity.iana, currentTime]);

  // Add Location to My Clocks
  const handleAddLocation = (city: WorldCity) => {
    // Prevent duplicates
    if (savedClocks.some((c) => c.id === city.id || (c.city === city.city && c.country === city.country))) {
      return;
    }
    const updated = [...savedClocks, city];
    setSavedClocks(updated);
    saveClocksToStorage(updated);
  };

  // Remove Location from My Clocks
  const handleRemoveLocation = (cityId: string) => {
    const updated = savedClocks.filter((c) => c.id !== cityId);
    setSavedClocks(updated);
    saveClocksToStorage(updated);
  };

  // Reorder Locations (Up/Down)
  const handleMoveClock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= savedClocks.length) return;
    const updated = [...savedClocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSavedClocks(updated);
    saveClocksToStorage(updated);
  };

  // Reset to default clocks
  const handleResetClocks = () => {
    setSavedClocks(DEFAULT_SAVED_CLOCKS);
    saveClocksToStorage(DEFAULT_SAVED_CLOCKS);
    setIsManageMode(false);
  };

  // Filter Search Results
  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Default curated recommendations when input is empty
      const curatedIds = ["dxb_ae", "lon_gb", "tyo_jp", "nyc_us", "par_fr", "sgp_sg", "syd_au", "zrh_ch"];
      return GLOBAL_CITIES_DATASET.filter((c) => curatedIds.includes(c.id));
    }
    return GLOBAL_CITIES_DATASET.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.iana.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [searchQuery]);

  // Cardinal direction helper
  const getCardinal = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Compass vector guidance analysis
  const getHeadingAnalysis = (deg: number) => {
    const cardinal = getCardinal(deg);
    switch (cardinal) {
      case "N":
        return "Northbound Vector: Aligning with Nilgiri heights, Deccan plateau & Himalayan ranges.";
      case "NE":
        return "North-East Bearing: Wayanad corridors, Bangalore plateau, & Eastern Ghats.";
      case "E":
        return "Eastward Corridor: Across Western Ghats passes towards Tamil Nadu & Bay of Bengal.";
      case "SE":
        return "South-East Bearing: Towards Thenkasi & Courtallam foothills.";
      case "S":
        return "Southward Coastal Vector: Heading towards Varkala clifftops, Kovalam & Indian Ocean.";
      case "SW":
        return "South-West Bearing: Coastal backwaters, Arabian Sea horizons & sunset trails.";
      case "W":
        return "Direct Westward Horizon: Open Arabian Sea maritime routes.";
      case "NW":
        return "North-West Vector: Towards Konkan coast, Goa beaches, & Mumbai.";
      default:
        return "Tracking real-time travel bearing.";
    }
  };

  // Simulated Time for Comparison Strip
  const comparisonReferenceDate = useMemo(() => {
    if (comparisonSliderHour === null) return currentTime;
    const sim = new Date(currentTime);
    sim.setHours(comparisonSliderHour, 0, 0, 0);
    return sim;
  }, [comparisonSliderHour, currentTime]);

  return (
    <section
      id="world-clock-compass-section"
      style={{
        background: "linear-gradient(180deg, #070D1B 0%, #0A1326 100%)",
        border: "1px solid rgba(56, 189, 248, 0.22)",
        borderRadius: "24px",
        padding: "clamp(16px, 3vw, 28px)",
        boxShadow: "0 20px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        fontFamily: "inherit",
      }}
    >
      {/* BACKGROUND SUBTLE ACCENT GLOW */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "10%",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* TOP SEGMENTED CONTROL: WORLD CLOCK | TRAVEL COMPASS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "24px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(11, 20, 38, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(56, 189, 248, 0.28)",
            borderRadius: "999px",
            padding: "4px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("clock")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 22px",
              borderRadius: "999px",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.25s ease",
              border: activeTab === "clock" ? "1px solid rgba(0, 229, 255, 0.5)" : "1px solid transparent",
              background:
                activeTab === "clock"
                  ? "linear-gradient(135deg, rgba(14, 165, 233, 0.35) 0%, rgba(20, 184, 166, 0.35) 100%)"
                  : "transparent",
              color: activeTab === "clock" ? "#FFFFFF" : "#94A3B8",
              boxShadow: activeTab === "clock" ? "0 0 18px rgba(0, 229, 255, 0.28)" : "none",
            }}
          >
            <Clock size={16} color={activeTab === "clock" ? "#00E5FF" : "#94A3B8"} />
            <span>World Clock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compass")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 22px",
              borderRadius: "999px",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.25s ease",
              border: activeTab === "compass" ? "1px solid rgba(20, 184, 166, 0.5)" : "1px solid transparent",
              background:
                activeTab === "compass"
                  ? "linear-gradient(135deg, rgba(20, 184, 166, 0.35) 0%, rgba(14, 165, 233, 0.35) 100%)"
                  : "transparent",
              color: activeTab === "compass" ? "#FFFFFF" : "#94A3B8",
              boxShadow: activeTab === "compass" ? "0 0 18px rgba(20, 184, 166, 0.28)" : "none",
            }}
          >
            <Compass size={16} color={activeTab === "compass" ? "#14B8A6" : "#94A3B8"} />
            <span>Travel Compass</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SMART WORLD CLOCK (DESKTOP TWO-COLUMN / MOBILE RESPONSIVE) */}
      {/* ========================================================================= */}
      {activeTab === "clock" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isAddPanelOpen ? "repeat(auto-fit, minmax(min(100%, 480px), 1fr))" : "1fr",
            gap: "24px",
            position: "relative",
            zIndex: 1,
            alignItems: "start",
          }}
        >
          {/* MAIN WORLD CLOCK COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            {/* SECTION HEADER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(14, 165, 233, 0.14)",
                    border: "1px solid rgba(56, 189, 248, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 16px rgba(14, 165, 233, 0.2)",
                  }}
                >
                  <Globe size={22} color="#00E5FF" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "clamp(1.15rem, 2vw, 1.35rem)",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    Smart World Clock
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "#94A3B8", margin: "2px 0 0 0" }}>
                    Track time across your travels with precision
                  </p>
                </div>
              </div>

              {!isAddPanelOpen && (
                <button
                  type="button"
                  onClick={() => setIsAddPanelOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(14, 165, 233, 0.2)",
                    border: "1px solid rgba(0, 229, 255, 0.5)",
                    borderRadius: "999px",
                    padding: "6px 14px",
                    color: "#00E5FF",
                    fontSize: "0.80rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 0 14px rgba(0, 229, 255, 0.2)",
                  }}
                >
                  <Plus size={14} />
                  <span>Add Location</span>
                </button>
              )}
            </div>

            {/* PRIMARY LOCAL CLOCK DISPLAY (TWILIGHT HORIZON LANDSCAPE CARD) */}
            <div
              style={{
                position: "relative",
                borderRadius: "20px",
                padding: "clamp(18px, 3vw, 26px)",
                overflow: "hidden",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                background: "linear-gradient(180deg, #0B1933 0%, #0F2347 50%, #152E59 100%)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              }}
            >
              {/* TWILIGHT MOUNTAIN SILHOUETTE SVG BACKGROUND */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  left: 0,
                  height: "100%",
                  pointerEvents: "none",
                  opacity: 0.45,
                  zIndex: 0,
                }}
              >
                <svg
                  viewBox="0 0 800 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  preserveAspectRatio="none"
                >
                  {/* Sunset Glow Sun */}
                  <circle cx="680" cy="140" r="45" fill="url(#sunGlow)" />
                  {/* Back Mountain Ridge */}
                  <path
                    d="M320 240L480 130L560 160L670 95L800 170V240H320Z"
                    fill="url(#mountainGrad1)"
                    opacity="0.6"
                  />
                  {/* Front Mountain Ridge */}
                  <path
                    d="M0 240L140 180L290 140L440 210L590 150L730 200L800 165V240H0Z"
                    fill="url(#mountainGrad2)"
                  />
                  <defs>
                    <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#D97706" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0B1933" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="mountainGrad1" x1="560" y1="95" x2="560" y2="240" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1E3A8A" stopOpacity="0.5" />
                      <stop offset="1" stopColor="#0B132B" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="mountainGrad2" x1="400" y1="140" x2="400" y2="240" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0F172A" stopOpacity="0.95" />
                      <stop offset="1" stopColor="#050B14" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* LOCAL CLOCK CONTENT */}
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* SUB HEADER: LOCATION & DAY/NIGHT BADGE */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={15} color="#00E5FF" />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#93C5FD",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Local Time (Your Location)
                    </span>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      background: localClockDetails.isDaytime
                        ? "rgba(245, 158, 11, 0.18)"
                        : "rgba(129, 140, 248, 0.18)",
                      border: localClockDetails.isDaytime
                        ? "1px solid rgba(245, 158, 11, 0.45)"
                        : "1px solid rgba(129, 140, 248, 0.45)",
                      color: localClockDetails.isDaytime ? "#FBBF24" : "#A5B4FC",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {localClockDetails.isDaytime ? (
                      <Sun size={13} color="#FBBF24" />
                    ) : (
                      <Moon size={13} color="#A5B4FC" />
                    )}
                    <span>{localClockDetails.isDaytime ? "Daytime" : "Nighttime"}</span>
                  </div>
                </div>

                {/* HUGE TABULAR CLOCK NUMBERS */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: "clamp(2.2rem, 5.5vw, 3.4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#FFFFFF",
                    textShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span>
                    {localClockDetails.hours} : {localClockDetails.minutes} : {localClockDetails.seconds}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(1.2rem, 2.8vw, 1.8rem)",
                      color: "#00E5FF",
                      fontWeight: 800,
                      marginLeft: "6px",
                    }}
                  >
                    {localClockDetails.ampm}
                  </span>
                </div>

                {/* DATE & TIMEZONE METADATA */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                    marginTop: "8px",
                    fontSize: "0.82rem",
                    color: "#94A3B8",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#E2E8F0", fontWeight: 600 }}>
                      {localClockDetails.dayName}, {localClockDetails.dateString}
                    </span>
                  </div>
                  <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Globe size={13} color="#38BDF8" />
                    <span style={{ color: "#38BDF8", fontWeight: 600 }}>
                      {localDeviceCity.iana} ({localClockDetails.utcOffset})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MY CLOCKS SECTION */}
            <div>
              {/* SECTION HEADER ROW */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#00E5FF",
                      boxShadow: "0 0 10px #00E5FF",
                    }}
                  />
                  <h4
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      margin: 0,
                    }}
                  >
                    My Clocks <span style={{ color: "#94A3B8", fontWeight: 500 }}>({savedClocks.length})</span>
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", marginLeft: "4px" }}>
                    Your saved locations
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* MANAGE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setIsManageMode(!isManageMode)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "8px",
                      background: isManageMode ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.06)",
                      border: isManageMode ? "1px solid #F59E0B" : "1px solid rgba(255, 255, 255, 0.12)",
                      color: isManageMode ? "#FBBF24" : "#94A3B8",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <SlidersHorizontal size={13} />
                    <span>{isManageMode ? "Done Managing" : "Manage"}</span>
                  </button>

                  {/* RESET BUTTON IN MANAGE MODE */}
                  {isManageMode && (
                    <button
                      type="button"
                      onClick={handleResetClocks}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        color: "#F87171",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      title="Reset to default travel hubs"
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>
                  )}

                  {/* ADD LOCATION BUTTON (TOGGLE PANEL) */}
                  <button
                    type="button"
                    onClick={() => setIsAddPanelOpen(!isAddPanelOpen)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 14px",
                      borderRadius: "999px",
                      background: isAddPanelOpen
                        ? "linear-gradient(135deg, #0EA5E9, #14B8A6)"
                        : "rgba(14, 165, 233, 0.15)",
                      border: "1px solid rgba(0, 229, 255, 0.4)",
                      color: "#FFFFFF",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isAddPanelOpen ? "0 0 14px rgba(0, 229, 255, 0.3)" : "none",
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Location</span>
                  </button>
                </div>
              </div>

              {/* CLOCKS GRID (2-COLUMNS DESKTOP / 1-COLUMN MOBILE) */}
              {savedClocks.length === 0 ? (
                <div
                  style={{
                    padding: "36px 20px",
                    borderRadius: "16px",
                    background: "rgba(15, 23, 42, 0.4)",
                    border: "1px dashed rgba(255, 255, 255, 0.15)",
                    textAlign: "center",
                  }}
                >
                  <Clock size={32} color="#64748B" style={{ margin: "0 auto 10px auto" }} />
                  <p style={{ color: "#E2E8F0", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 4px 0" }}>
                    No Saved Travel Clocks
                  </p>
                  <p style={{ color: "#94A3B8", fontSize: "0.78rem", margin: "0 0 16px 0" }}>
                    Select destinations from the Add Location panel to monitor synchronized timezones.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetClocks}
                    style={{
                      background: "rgba(14, 165, 233, 0.25)",
                      border: "1px solid #00E5FF",
                      color: "#FFFFFF",
                      padding: "6px 16px",
                      borderRadius: "8px",
                      fontSize: "0.80rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Load Default Cities
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {savedClocks.map((city, idx) => {
                    const details = getClockTimeDetails(city.iana, currentTime, currentTime);
                    const isLocal =
                      city.iana === localDeviceCity.iana ||
                      (city.city === localDeviceCity.city && city.country === localDeviceCity.country);

                    return (
                      <div
                        key={city.id + "_" + idx}
                        style={{
                          background: isLocal
                            ? "linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)"
                            : "linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(11, 20, 38, 0.85) 100%)",
                          border: isLocal
                            ? "1px solid rgba(0, 229, 255, 0.45)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "16px",
                          padding: "16px 18px",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          transition: "all 0.2s ease",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
                        }}
                      >
                        {/* TOP ROW: FLAG, CITY & ACTIONS */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "1.3rem" }}>{city.flag || "📍"}</span>
                            <div>
                              <div
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 800,
                                  color: "#FFFFFF",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <span>{city.city}, {city.country}</span>
                                {isLocal && (
                                  <span
                                    style={{
                                      fontSize: "0.65rem",
                                      fontWeight: 800,
                                      padding: "1px 6px",
                                      borderRadius: "999px",
                                      background: "rgba(0, 229, 255, 0.2)",
                                      color: "#00E5FF",
                                      border: "1px solid rgba(0, 229, 255, 0.4)",
                                    }}
                                  >
                                    LOCAL
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                                {details.timezoneAbbr} ({details.utcOffset})
                              </div>
                            </div>
                          </div>

                          {/* ACTION BUTTONS (PIN, REMOVE OR REORDER) */}
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            {isManageMode ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveClock(idx, "up")}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.08)",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "3px",
                                    color: idx === 0 ? "#475569" : "#E2E8F0",
                                    cursor: idx === 0 ? "default" : "pointer",
                                  }}
                                  title="Move Up"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === savedClocks.length - 1}
                                  onClick={() => handleMoveClock(idx, "down")}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.08)",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "3px",
                                    color: idx === savedClocks.length - 1 ? "#475569" : "#E2E8F0",
                                    cursor: idx === savedClocks.length - 1 ? "default" : "pointer",
                                  }}
                                  title="Move Down"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLocation(city.id)}
                                  style={{
                                    background: "rgba(239, 68, 68, 0.2)",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: "4px",
                                    padding: "3px 6px",
                                    color: "#F87171",
                                    cursor: "pointer",
                                    marginLeft: "4px",
                                  }}
                                  title="Delete Clock"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setTargetDestinationId(city.id)}
                                  style={{
                                    background: targetDestinationId === city.id ? "rgba(0, 229, 255, 0.2)" : "transparent",
                                    border: "none",
                                    color: targetDestinationId === city.id ? "#00E5FF" : "#64748B",
                                    cursor: "pointer",
                                    padding: "3px",
                                    borderRadius: "4px",
                                  }}
                                  title="Set as target bearing in Compass"
                                >
                                  <MapPin size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLocation(city.id)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#64748B",
                                    cursor: "pointer",
                                    padding: "3px",
                                    borderRadius: "4px",
                                    transition: "color 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
                                  title="Remove from My Clocks"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* MIDDLE ROW: TIME WITH SECONDS */}
                        <div
                          style={{
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            fontSize: "1.45rem",
                            fontWeight: 800,
                            color: "#FFFFFF",
                            letterSpacing: "-0.01em",
                            fontVariantNumeric: "tabular-nums",
                            display: "flex",
                            alignItems: "baseline",
                            gap: "6px",
                          }}
                        >
                          <span>{details.hours} : {details.minutes} : {details.seconds}</span>
                          <span style={{ fontSize: "0.85rem", color: "#38BDF8", fontWeight: 700 }}>
                            {details.ampm}
                          </span>
                        </div>

                        {/* BOTTOM ROW: DATE & BADGES */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "6px",
                            paddingTop: "4px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                            {details.dayName.slice(0, 3)}, {details.dateString}
                          </span>

                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            {/* RELATIVE DAY BADGE (-1 day / +1 day) */}
                            {details.dayDifferenceBadge && (
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  padding: "2px 7px",
                                  borderRadius: "999px",
                                  background: "rgba(20, 184, 166, 0.2)",
                                  color: "#2DD4BF",
                                  border: "1px solid rgba(20, 184, 166, 0.4)",
                                }}
                              >
                                {details.dayDifferenceBadge}
                              </span>
                            )}

                            {/* DAY / NIGHT BADGE */}
                            <span
                              style={{
                                fontSize: "0.70rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "999px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                background: details.isDaytime
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : "rgba(129, 140, 248, 0.15)",
                                border: details.isDaytime
                                  ? "1px solid rgba(245, 158, 11, 0.35)"
                                  : "1px solid rgba(129, 140, 248, 0.35)",
                                color: details.isDaytime ? "#FBBF24" : "#A5B4FC",
                              }}
                            >
                              {details.isDaytime ? <Sun size={11} /> : <Moon size={11} />}
                              <span>{details.isDaytime ? "Daytime" : "Night"}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TIME ZONE COMPARISON BAR (MATCHES REFERENCE media_1793514197789_a9d75044.png) */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(56, 189, 248, 0.22)",
                borderRadius: "16px",
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ArrowUpDown size={15} color="#00E5FF" />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Time Zone Comparison
                  </span>
                  {comparisonSliderHour !== null && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#FBBF24",
                        background: "rgba(245, 158, 11, 0.15)",
                        padding: "1px 8px",
                        borderRadius: "999px",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        fontWeight: 600,
                      }}
                    >
                      Simulated: {String(comparisonSliderHour).padStart(2, "0")}:00
                    </span>
                  )}
                </div>

                {comparisonSliderHour !== null ? (
                  <button
                    type="button"
                    onClick={() => setComparisonSliderHour(null)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(0, 229, 255, 0.15)",
                      border: "1px solid rgba(0, 229, 255, 0.4)",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      color: "#00E5FF",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={11} />
                    <span>Now</span>
                  </button>
                ) : (
                  <span style={{ fontSize: "0.70rem", color: "#64748B" }}>
                    Synchronized across saved destinations
                  </span>
                )}
              </div>

              {/* HORIZONTAL SYNCHRONIZED COMPARISON TILES */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {savedClocks.map((c) => {
                  const compDetails = getClockTimeDetails(c.iana, comparisonReferenceDate, comparisonReferenceDate);
                  return (
                    <div
                      key={"comp_" + c.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        minWidth: "75px",
                        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                        paddingRight: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.74rem",
                          color: "#94A3B8",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.city}
                      </span>
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: 800,
                          color: "#00E5FF",
                          fontFamily: "ui-monospace, monospace",
                          whiteSpace: "nowrap",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {compDetails.hours}:{compDetails.minutes} {compDetails.ampm}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* INTERACTIVE 24-HOUR TIMELINE SCRUBBER */}
              <div style={{ marginTop: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#64748B", marginBottom: "4px" }}>
                  <span>00:00</span>
                  <span>06:00 (Dawn)</span>
                  <span>12:00 (Noon)</span>
                  <span>18:00 (Dusk)</span>
                  <span>23:00</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={comparisonSliderHour !== null ? comparisonSliderHour : currentTime.getHours()}
                  onChange={(e) => setComparisonSliderHour(parseInt(e.target.value, 10))}
                  style={{
                    width: "100%",
                    accentColor: "#00E5FF",
                    cursor: "pointer",
                  }}
                  title="Scrub hours to check synchronized times across all cities"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: ADD LOCATION PANEL (MATCHES REFERENCE media_1793514197789_a9d75044.png) */}
          {/* ========================================================================= */}
          {isAddPanelOpen && (
            <div
              style={{
                background: "rgba(11, 20, 38, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "20px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.45)",
                width: "100%",
                maxHeight: "720px",
              }}
            >
              {/* PANEL HEADER */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                  Add Location
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddPanelOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                  }}
                  title="Close Add Location panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* SEARCH INPUT BAR */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                <Search size={15} color="#00E5FF" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city or country (e.g., Tokyo, Japan)"
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    width: "100%",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94A3B8",
                      cursor: "pointer",
                      padding: "2px",
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* RESULTS LIST */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  overflowY: "auto",
                  paddingRight: "4px",
                  maxHeight: "560px",
                }}
              >
                {filteredSearchResults.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 10px", color: "#94A3B8" }}>
                    <Search size={24} color="#64748B" style={{ margin: "0 auto 8px auto" }} />
                    <p style={{ fontSize: "0.82rem", margin: "0 0 4px 0", color: "#E2E8F0", fontWeight: 600 }}>
                      No matching locations found
                    </p>
                    <p style={{ fontSize: "0.72rem", margin: 0, color: "#64748B" }}>
                      Try searching by city (e.g., &quot;Sydney&quot;), country (e.g., &quot;France&quot;), or IANA timezone.
                    </p>
                  </div>
                ) : (
                  filteredSearchResults.map((city) => {
                    const isAlreadyAdded = savedClocks.some((c) => c.id === city.id || (c.city === city.city && c.country === city.country));
                    const tzOffset = calculateUtcOffset(city.iana, currentTime);

                    return (
                      <div
                        key={"search_" + city.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          borderRadius: "12px",
                          background: isAlreadyAdded
                            ? "rgba(15, 23, 42, 0.45)"
                            : "rgba(255, 255, 255, 0.03)",
                          border: isAlreadyAdded
                            ? "1px solid rgba(255, 255, 255, 0.05)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.2rem" }}>{city.flag || "📍"}</span>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF" }}>
                              {city.city}, {city.country}
                            </div>
                            <div style={{ fontSize: "0.70rem", color: "#94A3B8" }}>
                              {city.iana} ({tzOffset})
                            </div>
                          </div>
                        </div>

                        {/* ADD / ADDED BUTTON */}
                        <button
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => handleAddLocation(city)}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isAlreadyAdded
                              ? "rgba(14, 165, 233, 0.15)"
                              : "linear-gradient(135deg, #0EA5E9, #14B8A6)",
                            border: isAlreadyAdded
                              ? "1px solid rgba(56, 189, 248, 0.3)"
                              : "none",
                            color: isAlreadyAdded ? "#38BDF8" : "#FFFFFF",
                            cursor: isAlreadyAdded ? "default" : "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isAlreadyAdded ? "none" : "0 0 10px rgba(14, 165, 233, 0.4)",
                          }}
                          title={isAlreadyAdded ? "Already added to My Clocks" : "Add to My Clocks"}
                        >
                          {isAlreadyAdded ? <Check size={14} /> : <Plus size={16} />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRAVEL COMPASS (HARDWARE GYRO / TELEMETRY & BEARING GUIDANCE) */}
      {/* ========================================================================= */}
      {activeTab === "compass" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            position: "relative",
            zIndex: 1,
            padding: "10px 0 20px 0",
          }}
        >
          {/* HARDWARE STATUS HUD / BANNER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: isHardwareActive ? "#34D399" : isMobileDevice ? "#38BDF8" : "#94A3B8",
                background: isHardwareActive
                  ? "rgba(52, 211, 153, 0.15)"
                  : "rgba(255, 255, 255, 0.06)",
                border: isHardwareActive
                  ? "1px solid rgba(52, 211, 153, 0.35)"
                  : "1px solid rgba(255, 255, 255, 0.10)",
                borderRadius: "999px",
                padding: "4px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: isHardwareActive ? "#34D399" : isMobileDevice ? "#38BDF8" : "#94A3B8",
                  boxShadow: isHardwareActive ? "0 0 10px #34D399" : "none",
                }}
              />
              {isHardwareActive
                ? "Phone Gyroscope Active"
                : isMobileDevice
                ? "Mobile Phone Detected (Rotate to track)"
                : "Desktop Simulator Mode (Interactive)"}
            </span>

            {/* iOS Sensor Permission Button */}
            {needsIosPermission && (
              <button
                type="button"
                onClick={requestIosCompass}
                style={{
                  background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(20, 184, 166, 0.25) 100%)",
                  border: "1px solid #00E5FF",
                  borderRadius: "999px",
                  padding: "5px 14px",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 0 14px rgba(0, 229, 255, 0.3)",
                }}
              >
                <Smartphone size={13} />
                <span>Tap to Activate iPhone Gyro</span>
              </button>
            )}
          </div>

          {/* COMPASS ROSE DIAL CONTAINER */}
          <div
            style={{
              position: "relative",
              width: "clamp(240px, 40vw, 300px)",
              height: "clamp(240px, 40vw, 300px)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(8, 15, 30, 0.95) 70%)",
              border: "3px solid rgba(56, 189, 248, 0.45)",
              boxShadow: "0 0 40px rgba(14, 165, 233, 0.25), inset 0 0 30px rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isHardwareActive ? "default" : "pointer",
              userSelect: "none",
            }}
            onClick={() => {
              if (!isHardwareActive) {
                setCompassHeading((prev) => (prev + 30) % 360);
              }
            }}
            title={
              isHardwareActive
                ? "Live mobile hardware gyroscope tracking active"
                : "Click dial to rotate bearing in simulation mode"
            }
          >
            {/* 360-DEGREE DIAL TICKS */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={"tick_" + deg}
                style={{
                  position: "absolute",
                  width: deg % 90 === 0 ? "2px" : "1px",
                  height: "100%",
                  transform: `rotate(${deg}deg)`,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: deg % 90 === 0 ? "10px" : "6px",
                    background: deg === 0 ? "#EF4444" : "rgba(255, 255, 255, 0.3)",
                  }}
                />
              </div>
            ))}

            {/* CARDINAL LABELS */}
            <span style={{ position: "absolute", top: "12px", fontSize: "1.05rem", fontWeight: 900, color: "#EF4444" }}>
              N
            </span>
            <span style={{ position: "absolute", right: "14px", fontSize: "0.95rem", fontWeight: 800, color: "#94A3B8" }}>
              E
            </span>
            <span style={{ position: "absolute", bottom: "12px", fontSize: "0.95rem", fontWeight: 800, color: "#94A3B8" }}>
              S
            </span>
            <span style={{ position: "absolute", left: "14px", fontSize: "0.95rem", fontWeight: 800, color: "#94A3B8" }}>
              W
            </span>

            {/* INTER-CARDINALS */}
            <span style={{ position: "absolute", top: "34px", right: "38px", fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>
              NE
            </span>
            <span style={{ position: "absolute", bottom: "34px", right: "38px", fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>
              SE
            </span>
            <span style={{ position: "absolute", bottom: "34px", left: "38px", fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>
              SW
            </span>
            <span style={{ position: "absolute", top: "34px", left: "38px", fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>
              NW
            </span>

            {/* MAGNETIC NEEDLE */}
            <div
              style={{
                position: "absolute",
                width: "6px",
                height: "clamp(160px, 28vw, 210px)",
                transform: `rotate(${compassHeading}deg)`,
                transition: isHardwareActive
                  ? "transform 0.15s ease-out"
                  : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                pointerEvents: "none",
              }}
            >
              {/* NORTH NEEDLE (RED) */}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderBottom: "70px solid #EF4444",
                  filter: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.75))",
                }}
              />
              {/* CENTER PIVOT BEARING */}
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "3px solid #0EA5E9",
                  zIndex: 2,
                  boxShadow: "0 0 12px rgba(14, 165, 233, 0.9)",
                }}
              />
              {/* SOUTH NEEDLE (CYAN) */}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderTop: "70px solid #00E5FF",
                  filter: "drop-shadow(0 0 6px rgba(0, 229, 255, 0.5))",
                }}
              />
            </div>
          </div>

          {/* HEADING DEGREES & CARDINAL READOUT */}
          <div style={{ textAlign: "center", maxWidth: "420px" }}>
            <div
              style={{
                fontSize: "2.1rem",
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                fontFamily: "ui-monospace, monospace",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(compassHeading).padStart(3, "0")}°{" "}
              <span style={{ color: "#00E5FF" }}>{getCardinal(compassHeading)}</span>
            </div>

            {/* DYNAMIC DIRECTIONAL VECTOR GUIDANCE */}
            <div
              style={{
                fontSize: "0.82rem",
                color: "#93C5FD",
                marginTop: "6px",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {getHeadingAnalysis(compassHeading)}
            </div>

            {/* LIVE GPS HUD (LAT/LONG, ACCURACY, SPEED) */}
            {gpsData.lat && gpsData.lng && (
              <div
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "rgba(14, 165, 233, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  fontSize: "0.75rem",
                  color: "#CBD5E1",
                }}
              >
                <span>📍 GPS: {gpsData.lat}° N, {gpsData.lng}° E</span>
                {gpsData.accuracy && <span>• Accuracy: ±{gpsData.accuracy}m</span>}
                {gpsData.speed !== null && gpsData.speed > 0 && <span>• 🚗 {gpsData.speed} km/h</span>}
              </div>
            )}

            {/* SIMULATION SLIDER FOR DESKTOP */}
            {!isHardwareActive && (
              <div style={{ marginTop: "14px", width: "100%", maxWidth: "320px", margin: "14px auto 0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.70rem", color: "#64748B", marginBottom: "4px" }}>
                  <span>Rotate Bearing Slider</span>
                  <span>{compassHeading}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={compassHeading}
                  onChange={(e) => setCompassHeading(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "#00E5FF", cursor: "pointer" }}
                />
                <div style={{ fontSize: "0.70rem", color: "#64748B", marginTop: "6px" }}>
                  🖥️ Desktop Mode — Hardware Sensor Unavailable on this Device • Tap dial or drag slider to simulate bearing
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
