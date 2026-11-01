"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ShieldAlert, AlertTriangle, Clock, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { onRateLimitAlert, RateLimitAlertDetail, RateLimitCategory } from "../../utils/rateLimiter";

export default function RateLimitAlertModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<RateLimitCategory>("general");
  const [message, setMessage] = useState("Please try again after sometime.");
  const [initialSeconds, setInitialSeconds] = useState(15);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback((duration: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const safeDuration = Math.max(1, duration);
    setInitialSeconds(safeDuration);
    setSecondsRemaining(safeDuration);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    const unsubscribe = onRateLimitAlert((detail: RateLimitAlertDetail) => {
      setCategory(detail.category);
      setMessage(detail.message || "Please try again after sometime.");
      setIsOpen(true);
      startCountdown(detail.retryAfter);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCountdown]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && secondsRemaining === 0) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, secondsRemaining]);

  if (!isOpen) return null;

  const categoryMeta: Record<
    RateLimitCategory,
    { label: string; icon: typeof ShieldAlert; color: string; bg: string; border: string }
  > = {
    auth: {
      label: "Login Security Shield",
      icon: ShieldAlert,
      color: "#F87171",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.35)",
    },
    booking: {
      label: "Booking & Itinerary Protection",
      icon: AlertTriangle,
      color: "#38BDF8",
      bg: "rgba(56, 189, 248, 0.12)",
      border: "rgba(56, 189, 248, 0.35)",
    },
    general: {
      label: "System Rate Limiter",
      icon: Clock,
      color: "#FBBF24",
      bg: "rgba(251, 191, 36, 0.12)",
      border: "rgba(251, 191, 36, 0.35)",
    },
  };

  const currentMeta = categoryMeta[category] || categoryMeta.general;
  const IconComponent = currentMeta.icon;
  const progressPercent =
    initialSeconds > 0
      ? Math.min(100, Math.max(0, ((initialSeconds - secondsRemaining) / initialSeconds) * 100))
      : 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ratelimit-alert-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(3, 7, 18, 0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "ratelimitFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          background: "linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(11, 19, 43, 0.98) 100%)",
          border: `1px solid ${currentMeta.border}`,
          borderRadius: "24px",
          boxShadow: `0 24px 64px -12px rgba(0, 0, 0, 0.7), 0 0 32px -4px ${currentMeta.bg}`,
          padding: "32px 28px",
          color: "#F8FAFC",
          textAlign: "center",
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close rate limit alert"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#94A3B8";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
          }}
        >
          <X size={16} />
        </button>

        {/* ICON BADGE */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: currentMeta.bg,
            border: `1px solid ${currentMeta.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
            boxShadow: `0 0 24px -4px ${currentMeta.color}33`,
          }}
        >
          <IconComponent size={32} color={currentMeta.color} />
        </div>

        {/* CATEGORY TAG */}
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: currentMeta.color,
              background: currentMeta.bg,
              border: `1px solid ${currentMeta.border}`,
            }}
          >
            {currentMeta.label}
          </span>
        </div>

        {/* TITLE */}
        <h3
          id="ratelimit-alert-title"
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#F8FAFC",
            margin: "0 0 10px 0",
          }}
        >
          Rate Limit Exceeded
        </h3>

        {/* PRIMARY MESSAGE */}
        <p
          style={{
            fontSize: "0.95rem",
            color: "#CBD5E1",
            lineHeight: 1.55,
            margin: "0 0 24px 0",
            padding: "0 8px",
          }}
        >
          {message}
        </p>

        {/* COOLDOWN PROGRESS BOX */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "16px 20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "#94A3B8",
              marginBottom: "10px",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Clock size={14} color={currentMeta.color} />
              Refill Cooldown
            </span>
            <span
              style={{
                fontVariantNumeric: "tabular-nums",
                fontWeight: 700,
                color: secondsRemaining === 0 ? "#10B981" : "#F8FAFC",
                fontSize: "1rem",
              }}
            >
              {secondsRemaining === 0 ? "Ready" : `${secondsRemaining}s`}
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div
            style={{
              height: "6px",
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background:
                  secondsRemaining === 0
                    ? "#10B981"
                    : `linear-gradient(90deg, ${currentMeta.color}88, ${currentMeta.color})`,
                transition: "width 0.9s linear, background 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* ACTION BUTTON */}
        {secondsRemaining > 0 ? (
          <button
            disabled
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: "14px",
              fontSize: "0.92rem",
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.06)",
              color: "#64748B",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              cursor: "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <RefreshCw size={16} className="animate-spin" />
            Try again after sometime ({secondsRemaining}s)
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: "14px",
              fontSize: "0.92rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 8px 20px -4px rgba(14, 165, 233, 0.45)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 12px 24px -4px rgba(14, 165, 233, 0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px -4px rgba(14, 165, 233, 0.45)";
            }}
          >
            <CheckCircle2 size={16} />
            Tokens Refilled — Try Again
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes ratelimitFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
