"use client";

import { useEffect, useState } from "react";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ProfileGrid from "../../components/profile/ProfileGrid";
import ProfileSettingsModal from "../../components/profile/ProfileSettingsModal";
import EditProfileModal from "../../components/profile/EditProfileModal";
import { tripService } from "../../services/trip.service";

interface UserProfile {
  uid: string;
  tripgenius_id: string;
  full_name: string;
  username: string;
  email: string;
  bio: string;
  country: string;
  date_of_birth?: string;
  profile_image: string;
  total_trips: number;
  saved_trips: number;
  eco_score: number;
  countries_visited: number;
  is_verified: boolean;
  created_at: string;
  travel_preferences: string[];
}

interface Achievement {
  id: number;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress?: string;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [];

function generateTripGeniusId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TG-";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function generateUID() {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trips");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedTripsList, setSavedTripsList] = useState<any[]>([]);

  const [achievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);

  const [user, setUser] = useState<UserProfile>({
    uid: generateUID(),
    tripgenius_id: "TG-TR8842",
    full_name: "Traveler",
    username: "traveler",
    email: "traveler@tripgenius.com",
    bio: "",
    country: "",
    date_of_birth: "",
    profile_image: "",
    total_trips: 0,
    saved_trips: 0,
    eco_score: 92,
    countries_visited: 1,
    is_verified: true,
    created_at: new Date().toISOString(),
    travel_preferences: [
      "Scenic Highlands & Tea Hills",
      "Coastal & Beach Escapes",
      "Eco Tourism & Sustainable",
      "Local Food & Street Dining",
      "Peaceful Wellness Retreats",
    ],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("tripgenius_token");
      const storedUser = localStorage.getItem("tripgenius_user");
      const image = localStorage.getItem("tripgenius_profile_image");
      let storedSaved = localStorage.getItem("tripgenius_saved_trips");
      if (!storedSaved || storedSaved === "[]") {
        const fallbackSaved = localStorage.getItem("saved_trips");
        if (fallbackSaved && fallbackSaved !== "[]") {
          storedSaved = fallbackSaved;
          localStorage.setItem("tripgenius_saved_trips", fallbackSaved);
        }
      }

      let parsedSaved: any[] = [];
      if (storedSaved) {
        try {
          parsedSaved = JSON.parse(storedSaved);
          if (Array.isArray(parsedSaved)) {
            setSavedTripsList(parsedSaved);
          }
        } catch {
          parsedSaved = [];
        }
      }

      if (token) {
        setIsLoggedIn(true);

        // Fetch persisted profile from backend API
        let remoteUser: any = null;
        try {
          const baseUrl =
            typeof window !== "undefined"
              ? `${window.location.protocol}//${window.location.hostname}:8000`
              : "http://127.0.0.1:8000";
          const res = await fetch(`${baseUrl}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            remoteUser = await res.json();
          }
        } catch (fetchErr) {
          console.warn("Backend profile load fallback to cache:", fetchErr);
        }

        const parsed = remoteUser || (storedUser ? JSON.parse(storedUser) : {});
        const liveTotalTrips = parsedSaved.length > 0 ? parsedSaved.length : (parsed.total_trips || 0);

        const name = parsed.full_name || "Traveler";
        const userEmail = parsed.email || "";
        const defaultHandle = userEmail ? userEmail.split("@")[0] : "traveler";
        const resolvedUsername = parsed.username || defaultHandle;
        const resolvedEmail = parsed.email || "traveler@tripgenius.com";
        const resolvedId = parsed.tripgenius_id || "TG-TR8842";

        let parsedPrefs = [
          "Scenic Highlands & Tea Hills",
          "Coastal & Beach Escapes",
          "Eco Tourism & Sustainable",
          "Local Food & Street Dining",
          "Peaceful Wellness Retreats",
        ];
        if (parsed.travel_preferences) {
          try {
            if (typeof parsed.travel_preferences === "string") {
              const p = JSON.parse(parsed.travel_preferences);
              if (Array.isArray(p)) parsedPrefs = p;
            } else if (Array.isArray(parsed.travel_preferences)) {
              parsedPrefs = parsed.travel_preferences;
            }
          } catch {}
        }

        const profileData: UserProfile = {
          uid: parsed.id ?? parsed.uid ?? generateUID(),
          tripgenius_id: resolvedId,
          full_name: name,
          username: resolvedUsername,
          email: resolvedEmail,
          bio: parsed.bio || "",
          country: parsed.country || parsed.base_location || "",
          date_of_birth: parsed.date_of_birth || "",
          profile_image: image || parsed.profile_image || "",
          total_trips: liveTotalTrips,
          saved_trips: parsedSaved.length,
          eco_score: parsed.eco_travel_score ?? parsed.eco_score ?? 92,
          countries_visited: parsed.countries_visited ?? 1,
          is_verified: parsed.is_verified ?? true,
          created_at: parsed.created_at ?? new Date().toISOString(),
          travel_preferences: parsedPrefs,
        };

        setUser(profileData);
        localStorage.setItem("tripgenius_user", JSON.stringify(profileData));
      } else {
        // Fallback for guest visitor
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const name = parsed.full_name || "Guest Traveler";
          const guestEmail = parsed.email || "";
          const guestHandle = guestEmail ? guestEmail.split("@")[0] : "traveler";
          const resolvedUsername = parsed.username || guestHandle;
          const resolvedId = parsed.tripgenius_id || "TG-TR8842";

          const guestData: UserProfile = {
            uid: parsed.uid ?? generateUID(),
            tripgenius_id: resolvedId,
            full_name: name,
            username: resolvedUsername,
            email: parsed.email || "traveler@tripgenius.com",
            bio: parsed.bio || "",
            country: parsed.country || parsed.base_location || "",
            date_of_birth: parsed.date_of_birth || "",
            profile_image: image || parsed.profile_image || "",
            total_trips: parsedSaved.length,
            saved_trips: parsedSaved.length,
            eco_score: parsed.eco_score ?? 92,
            countries_visited: parsed.countries_visited ?? 1,
            is_verified: false,
            created_at: parsed.created_at ?? new Date().toISOString(),
            travel_preferences:
              parsed.travel_preferences && parsed.travel_preferences.length > 0
                ? parsed.travel_preferences
                : [
                    "Scenic Highlands & Tea Hills",
                    "Coastal & Beach Escapes",
                    "Eco Tourism & Sustainable",
                    "Local Food & Street Dining",
                    "Peaceful Wellness Retreats",
                  ],
          };

          setUser(guestData);
        } else {
          setUser((prev) => ({
            ...prev,
            full_name: "Guest Traveler",
            username: "traveler",
            bio: "",
            country: "",
            date_of_birth: "",
            saved_trips: parsedSaved.length,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSave(updatedProfile: Partial<UserProfile>) {
    const updatedUser = {
      ...user,
      ...updatedProfile,
      location: updatedProfile.country !== undefined ? updatedProfile.country : user.country,
      city: (updatedProfile.country !== undefined ? updatedProfile.country : user.country || "").split(",")[0].trim(),
    };
    setUser(updatedUser);

    try {
      localStorage.setItem("tripgenius_user", JSON.stringify(updatedUser));
      if (updatedProfile.country && updatedProfile.country.trim()) {
        const city = updatedProfile.country.split(",")[0].trim();
        if (city && !localStorage.getItem("tripgenius_weather_city_custom")) {
          localStorage.setItem("tripgenius_weather_city", city);
        }
      }

      // Persist to backend if token exists
      const token = localStorage.getItem("tripgenius_token");
      if (token) {
        const baseUrl =
          typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.hostname}:8000`
            : "http://127.0.0.1:8000";
        await fetch(`${baseUrl}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: updatedUser.full_name,
            username: updatedUser.username,
            bio: updatedUser.bio,
            date_of_birth: updatedUser.date_of_birth,
            base_location: updatedUser.country,
            country: updatedUser.country,
            travel_preferences: JSON.stringify(updatedUser.travel_preferences),
          }),
        });
      }
    } catch (err) {
      console.warn("Backend save warning:", err);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  }

  function handleDeleteSavedTrip(id: string) {
    const updated = savedTripsList.filter((trip) => trip.id !== id);
    setSavedTripsList(updated);
    localStorage.setItem("tripgenius_saved_trips", JSON.stringify(updated));
    localStorage.setItem("saved_trips", JSON.stringify(updated));
    setUser((prev) => ({
      ...prev,
      saved_trips: updated.length,
      total_trips: updated.length,
    }));
  }

  function handleSavePreferences(newPreferences: string[]) {
    const updatedUser = {
      ...user,
      travel_preferences: newPreferences,
    };
    setUser(updatedUser);
    handleProfileSave(updatedUser);
  }

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Traveler Profile...</p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ProfileHeader
          user={user}
          onSettingsClick={() => setSettingsOpen(true)}
          onEditProfileClick={() => setEditProfileOpen(true)}
        />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tripsCount={user.total_trips}
          savedCount={savedTripsList.length}
        />

        <ProfileGrid
          activeTab={activeTab}
          achievements={achievements}
          totalTrips={user.total_trips}
          savedTrips={savedTripsList.length}
          savedTripsList={savedTripsList}
          onDeleteSavedTrip={handleDeleteSavedTrip}
          userPreferences={user.travel_preferences}
          onSavePreferences={handleSavePreferences}
        />
      </main>

      <ProfileSettingsModal
        isOpen={settingsOpen}
        isLoggedIn={isLoggedIn}
        onClose={() => setSettingsOpen(false)}
        onPhotoUpdated={(img) =>
          setUser((prev) => ({ ...prev, profile_image: img }))
        }
      />

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        onSave={handleProfileSave}
      />
    </>
  );
}
