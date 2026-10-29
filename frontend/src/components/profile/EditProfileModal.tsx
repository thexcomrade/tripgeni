"use client";

import { useEffect, useState } from "react";
import { X, Check, AtSign, MapPin, Sparkles, User as UserIcon, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  uid?: string;
  tripgenius_id?: string;
  full_name: string;
  username: string;
  email?: string;
  bio: string;
  country: string;
  date_of_birth?: string;
  profile_image?: string;
  total_trips?: number;
  saved_trips?: number;
  eco_score?: number;
  countries_visited?: number;
  is_verified?: boolean;
  created_at?: string;
  travel_preferences: string[];
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
}

const AVAILABLE_PREFERENCES = [
  "Adventure",
  "Beach",
  "Luxury",
  "Budget",
  "Road Trips",
  "Eco Tourism",
  "Wildlife",
  "Food",
  "Photography",
  "Mountains",
  "Camping",
  "Backpacking",
];

function calculateAge(dobString?: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user: initialUser,
  onSave,
}: EditProfileModalProps) {
  const [user, setUser] = useState<UserProfile>({
    full_name: "",
    username: "traveler",
    bio: "",
    country: "",
    date_of_birth: "",
    travel_preferences: [],
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setUser({
      full_name: initialUser.full_name || "Traveler",
      username: initialUser.username ? initialUser.username.replace(/^@+/, "") : "traveler",
      bio: initialUser.bio !== undefined ? initialUser.bio : "",
      country: initialUser.country !== undefined ? initialUser.country : "",
      date_of_birth: initialUser.date_of_birth || "",
      travel_preferences:
        initialUser.travel_preferences && initialUser.travel_preferences.length > 0
          ? initialUser.travel_preferences
          : ["Adventure", "Eco Tourism", "Beach", "Food"],
    });
  }, [isOpen, initialUser]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function updateField(field: keyof UserProfile, value: string | string[]) {
    setUser((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function togglePreference(preference: string) {
    const exists = user.travel_preferences.includes(preference);

    if (exists) {
      updateField(
        "travel_preferences",
        user.travel_preferences.filter((item) => item !== preference),
      );
    } else {
      updateField("travel_preferences", [
        ...user.travel_preferences,
        preference,
      ]);
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const calculatedAge = calculateAge(user.date_of_birth);

  async function handleSave() {
    setIsSaving(true);
    const cleanUsername = user.username.trim().replace(/^@+/, "") || "traveler";
    const cleanFullName = user.full_name.trim() || "Traveler";
    const cleanBio = user.bio ? user.bio.trim() : "";
    const cleanCountry = user.country ? user.country.trim() : "";
    const cleanDob = user.date_of_birth ? user.date_of_birth.trim() : "";

    const updatePayload: Partial<UserProfile> = {
      full_name: cleanFullName,
      username: cleanUsername,
      bio: cleanBio,
      country: cleanCountry,
      date_of_birth: cleanDob,
      travel_preferences: user.travel_preferences,
    };

    // Persist to backend if logged in
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tripgenius_token") : null;
      if (token) {
        const baseUrl = typeof window !== "undefined"
          ? `${window.location.protocol}//${window.location.hostname}:8000`
          : "http://127.0.0.1:8000";

        await fetch(`${baseUrl}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: cleanFullName,
            username: cleanUsername,
            bio: cleanBio,
            date_of_birth: cleanDob,
            base_location: cleanCountry,
            country: cleanCountry,
            travel_preferences: JSON.stringify(user.travel_preferences),
          }),
        });
      }
    } catch (err) {
      console.warn("Backend profile sync notice:", err);
    } finally {
      setIsSaving(false);
    }

    onSave(updatePayload);
    toast.success(`Profile saved! Public handle set to @${cleanUsername}`);
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(5, 10, 20, 0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "min(92vh, 740px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "24px",
          background:
            "linear-gradient(155deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 16, 31, 0.99) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow:
            "0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 40px rgba(14, 165, 233, 0.15)",
          overflow: "hidden",
        }}
      >
        {/* 1. FIXED HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 28px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(15, 23, 42, 0.7)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
              }}
            >
              <UserIcon size={20} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "-0.3px",
                }}
              >
                Edit Traveler Profile
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.8rem",
                  color: "#94A3B8",
                }}
              >
                Customize your identity, birth date, bio, and travel passions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94A3B8";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. SCROLLABLE FORM BODY */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Full Name & Username in 2 Columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#CBD5E1",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={user.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
                placeholder="e.g. John Doe"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#CBD5E1",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Username (Handle)
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    display: "flex",
                    alignItems: "center",
                    color: "#38BDF8",
                    pointerEvents: "none",
                  }}
                >
                  <AtSign size={16} />
                </div>
                <input
                  type="text"
                  value={user.username}
                  onChange={(event) =>
                    updateField(
                      "username",
                      event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    )
                  }
                  placeholder="traveler"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 38px",
                    borderRadius: "12px",
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid rgba(56, 189, 248, 0.35)",
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(56, 189, 248, 0.35)")}
                />
              </div>
            </div>
          </div>

          {/* Date of Birth & Calculated Age */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#CBD5E1",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Date of Birth
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="date"
                  max={todayStr}
                  value={user.date_of_birth || ""}
                  onChange={(event) => updateField("date_of_birth", event.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.92rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    colorScheme: "dark",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
                />
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.74rem", color: "#64748B" }}>
                Future dates blocked. Used for age verification and travel profiles.
              </p>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#CBD5E1",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Age (Calculated)
              </label>
              <input
                type="text"
                readOnly
                value={calculatedAge !== null ? `${calculatedAge} years old` : "Auto-computed"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: calculatedAge !== null ? "#38BDF8" : "#64748B",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  cursor: "not-allowed",
                  outline: "none",
                }}
              />
              <p style={{ margin: "4px 0 0", fontSize: "0.74rem", color: "#64748B" }}>
                Automatically derived from Date of Birth.
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              style={{
                display: "block",
                color: "#CBD5E1",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Bio & Travel Passions
            </label>
            <textarea
              value={user.bio}
              onChange={(event) => updateField("bio", event.target.value)}
              rows={3}
              placeholder="Tell other travelers about your authentic travel passions and favorite spots..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                outline: "none",
                resize: "vertical",
                minHeight: "75px",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
            />
          </div>

          {/* Base Location / Country */}
          <div>
            <label
              style={{
                display: "block",
                color: "#CBD5E1",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Base Location / Origin City
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <div
                style={{
                  position: "absolute",
                  left: "14px",
                  display: "flex",
                  alignItems: "center",
                  color: "#FB7185",
                  pointerEvents: "none",
                }}
              >
                <MapPin size={16} />
              </div>
              <input
                type="text"
                value={user.country}
                onChange={(event) => updateField("country", event.target.value)}
                placeholder="e.g. Kochi, Kerala, India"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 38px",
                  borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
              />
            </div>
          </div>

          {/* Travel Preferences */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  color: "#CBD5E1",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Travel Preferences & Styles
              </label>
              <span style={{ fontSize: "0.76rem", color: "#94A3B8" }}>
                {user.travel_preferences.length} selected
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AVAILABLE_PREFERENCES.map((preference) => {
                const isSelected = user.travel_preferences.includes(preference);
                return (
                  <button
                    key={preference}
                    type="button"
                    onClick={() => togglePreference(preference)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "999px",
                      border: isSelected
                        ? "1px solid #0EA5E9"
                        : "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      background: isSelected
                        ? "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)"
                        : "rgba(255,255,255,0.05)",
                      color: isSelected ? "#FFFFFF" : "#CBD5E1",
                      fontSize: "0.82rem",
                      fontWeight: isSelected ? 700 : 500,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected
                        ? "0 2px 10px rgba(14, 165, 233, 0.35)"
                        : "none",
                    }}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{preference}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. STICKY/PINNED FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 28px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(10, 16, 31, 0.96)",
            backdropFilter: "blur(12px)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.8rem",
                color: "#38BDF8",
                background: "rgba(14, 165, 233, 0.1)",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(14, 165, 233, 0.2)",
              }}
            >
              <Sparkles size={12} color="#38BDF8" />
              <span>@{user.username || "traveler"}</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                color: "#CBD5E1",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 22px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
                color: "#FFFFFF",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: isSaving ? "wait" : "pointer",
                boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <Check size={15} />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
