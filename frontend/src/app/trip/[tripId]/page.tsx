"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import tripService from "../../../services/trip.service";
import { ensureTripItinerary } from "../../../utils/itineraryHelper";

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;

  useEffect(() => {
    async function resolveTrip() {
      if (!tripId) {
        router.push("/trip/generated");
        return;
      }

      // Check localStorage first
      try {
        const raw =
          localStorage.getItem("saved_trips") ||
          localStorage.getItem("tripgenius_saved_trips") ||
          "[]";
        const savedList = JSON.parse(raw);
        if (Array.isArray(savedList)) {
          const match = savedList.find((t: any) => t.id === tripId);
          if (match) {
            const complete = ensureTripItinerary(match);
            localStorage.setItem("latest_trip", JSON.stringify(complete));
            localStorage.setItem(
              "tripgenius_generated_trip",
              JSON.stringify(complete)
            );
            router.push("/trip/generated");
            return;
          }
        }
      } catch {}

      // Try fetching from backend
      try {
        const backendTrip = await tripService.getTrip(tripId);
        if (backendTrip) {
          const complete = ensureTripItinerary(backendTrip);
          localStorage.setItem("latest_trip", JSON.stringify(complete));
          localStorage.setItem(
            "tripgenius_generated_trip",
            JSON.stringify(complete)
          );
          router.push("/trip/generated");
          return;
        }
      } catch {}

      // Fallback
      router.push("/trip/generated");
    }

    resolveTrip();
  }, [tripId, router]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94A3B8",
        fontSize: "0.95rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(56, 189, 248, 0.2)",
            borderTopColor: "#00E5FF",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px auto",
          }}
        />
        <p>Loading your curated travel itinerary...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
