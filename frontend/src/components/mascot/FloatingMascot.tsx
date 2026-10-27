"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ExternalLink, Send } from "lucide-react";
import { getApiBaseUrl } from "../../utils/apiConfig";
import Mascot3DCanvas from "./Mascot3DCanvas";
import "./FloatingMascot.css";

interface ChatMessage {
  id: string;
  sender: "user" | "padayappa";
  text: string;
}

const PADAYAPPA_PROMPTS = [
  "Padayappa AI ✨",
  "Namaskaram! 🙏",
  "Need a plan? 🌴",
  "Ask Padayappa ✈️",
];

const HIDE_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const AUTH_REQUIRED_PATHS = ["/planner", "/ai-chat"];

export default function FloatingMascot() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Smooth footer detection: fade mascot away when reaching footer, fade in when scrolling up
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      const footer = document.querySelector("footer");
      if (!footer) return;

      if (typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            setIsNearFooter(entry.isIntersecting);
          },
          {
            root: null,
            rootMargin: "0px 0px 80px 0px", // triggers smoothly right before contacting footer
            threshold: 0,
          }
        );
        observer.observe(footer);
      }
    };

    setupObserver();

    // Scroll listener fallback for rapid scrolling
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        // If top of footer enters or is near viewport bottom
        setIsNearFooter(rect.top < window.innerHeight + 60);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  // Close panel with smooth fade when user clicks or touches outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDownOutside, true);
    document.addEventListener("touchstart", handlePointerDownOutside, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside, true);
      document.removeEventListener(
        "touchstart",
        handlePointerDownOutside,
        true,
      );
    };
  }, [isOpen]);
  // Rotate speech prompt like ROG Omni every 7 seconds
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % PADAYAPPA_PROMPTS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Track login state (supports both token and user object)
  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("tripgenius_token");
      const user = localStorage.getItem("tripgenius_user");
      setIsLoggedIn(!!(token || user));
    };
    check();
    window.addEventListener("storage", check);
    window.addEventListener("auth-change", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("auth-change", check);
    };
  }, []);

  const isHomePage = pathname === "/";
  // STRICT VISIBILITY:
  // - Logged-out users: ONLY visible on the Home page ("/")
  // - Logged-in users: visible on Home page and designated pages: /dashboard, /explore, /favorites
  if (!isLoggedIn) {
    if (!isHomePage) return null;
  } else {
    if (!isHomePage) {
      const ALLOWED_MASCOT_PATHS = ["/dashboard", "/explore", "/favorites"];
      const isAllowedPath = ALLOWED_MASCOT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
      if (!isAllowedPath) {
        return null;
      }
    }
  }

  const handleOpenFullChat = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push("/ai-chat");
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || message).trim();
    if (!userText || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    if (!isLoggedIn) {
      setIsLoading(true);
      setTimeout(() => {
        const loginPromptMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "padayappa",
          text: "Namaskaram! 🙏 Please login to chat with me and create personalized itineraries with Trip Geni.",
        };
        setMessages((prev) => [...prev, loginPromptMsg]);
        setIsLoading(false);
      }, 400);
      return;
    }

    setIsLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      const aiReply =
        data.reply ||
        data.response ||
        "Namaskaram! PADAYAPPA here. Where would you like to travel, or what would you like me to plan for you?";

      const padayappaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "padayappa",
        text: aiReply,
      };

      setMessages((prev) => [...prev, padayappaMsg]);
    } catch {
      let fallbackText =
        "Namaskaram! PADAYAPPA here. What destination do you have in mind?";
      const lower = userText.toLowerCase();
      if (
        lower.includes("sugano") ||
        lower.includes("sugam") ||
        lower.includes("sukham")
      ) {
        fallbackText =
          "Sugam thanne, macha! 🙏 (Doing great!) Padayappa here, ready for our next adventure. Where are we heading next?";
      } else if (
        lower.includes("hi") ||
        lower.includes("hello") ||
        lower.includes("hey")
      ) {
        fallbackText =
          "Namaskaram! 🙏 Ready to plan an unforgettable journey. Tell me your destination or travel vibe!";
      } else {
        fallbackText =
          "Namaskaram! For complete day-by-day itineraries with timings, food spots, and costs in ₹, jump right into my full chat room!";
      }
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "padayappa",
        text: fallbackText,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {/* ============================================================
          FLOATING 3D MASCOT WIDGET (PADAYAPPA - OMNI COMPANION)
          ============================================================ */}
      <div className={`mascot-widget ${isNearFooter ? "mascot-faded-footer" : ""}`} aria-hidden={isNearFooter}>
        <div
          role="button"
          tabIndex={0}
          className="mascot-trigger"
          aria-label={isOpen ? "Close Padayappa" : "Open Padayappa Assistant"}
          aria-expanded={isOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
        >
          {/* OMNI SPEECH BADGE (Directly anchored & centered right above Padayappa) */}
          {!isOpen && (
            <div
              className="mascot-speech-badge"
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoggedIn) {
                  setShowLoginModal(true);
                } else {
                  setIsOpen(true);
                }
              }}
            >
              <span className="mascot-live-indicator" />
              <span>{PADAYAPPA_PROMPTS[speechIndex]}</span>
            </div>
          )}

          {/* 3D GLB CHARACTER WITH REAL-TIME CONTACT SHADOW & PROCEDURAL LIFE */}

          <div className="mascot-image-wrapper">
            <Mascot3DCanvas
              onModelClick={() => {
                if (!isLoggedIn) {
                  setShowLoginModal(true);
                } else {
                  setIsOpen((prev) => !prev);
                }
              }}
              fallback={null}
            />
          </div>



          {/* NATURAL PHYSICAL GROUND CONTACT SHADOW */}
          <div className="mascot-ground-shadow" />
        </div>
      </div>


      {/* ============================================================
          PADAYAPPA LOGIN PROMPT MODAL FOR LOGGED-OUT VISITORS
          ============================================================ */}
      {showLoginModal && (
        <>
          <div
            className="assistant-backdrop"
            onClick={() => setShowLoginModal(false)}
            onTouchStart={() => setShowLoginModal(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Login required to chat with Padayappa"
            style={{
              position: "fixed",
              bottom: "clamp(120px, 18vh, 180px)",
              right: "clamp(20px, 4vw, 40px)",
              zIndex: 9999,
              width: "min(350px, calc(100vw - 40px))",
              background: "linear-gradient(145deg, rgba(18, 34, 56, 0.96), rgba(10, 23, 39, 0.98))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(56, 200, 244, 0.35)",
              borderRadius: "20px",
              padding: "22px 24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 200, 244, 0.15)",
              color: "#F8FAFC",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(56, 200, 244, 0.15)",
                    border: "1px solid rgba(56, 200, 244, 0.35)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "18px",
                  }}
                >
                  🔒
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                    Padayappa is waiting for you!
                  </h3>
                  <span style={{ fontSize: "11px", color: "#38C8F4", fontWeight: 600 }}>
                    AI Travel Companion
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "2px 6px",
                }}
              >
                ×
              </button>
            </div>

            <p style={{ margin: "0 0 18px 0", fontSize: "13px", color: "#CBD5E1", lineHeight: 1.5 }}>
              Log in to unlock me and start planning your next adventure with Trip Geni.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  router.push("/login");
                }}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #38C8F4, #16C7A0)",
                  color: "#07111F",
                  border: "none",
                  fontWeight: 750,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(56, 200, 244, 0.25)",
                }}
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  router.push("/register");
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#E2E8F0",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </>
      )}

      {/* SCREEN TOUCH / CLICK BACKDROP (FADES OFF CHAT WHEN TOUCHED OUTSIDE) */}
      {isOpen && (
        <div
          className="assistant-backdrop"
          onClick={() => setIsOpen(false)}
          onTouchStart={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ============================================================
          PADAYAPPA ASSISTANT CONSOLE (ROG Omni Screen Console)
          ============================================================ */}
      {isOpen && (
        <section
          ref={panelRef}
          className={`assistant-panel ${isNearFooter ? "panel-faded-footer" : ""}`}
          aria-label="Padayappa Virtual Assistant"
        >
          {/* HEADER */}
          <header className="assistant-header">
            <div className="assistant-heading">
              <div className="assistant-avatar-badge">
                <img
                  src="/images/das.png"
                  alt="Padayappa"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/model.ico";
                  }}
                />
                <span className="mascot-live-indicator" />
              </div>
              <div className="assistant-heading-text">
                <strong>PADAYAPPA</strong>
                <small>AI Travel Companion</small>
              </div>
            </div>

            <div className="assistant-header-actions">
              <button
                type="button"
                className="assistant-fullchat-btn"
                onClick={handleOpenFullChat}
              >
                <span>Full Chat</span>
                <ExternalLink size={12} />
              </button>

              <button
                type="button"
                className="assistant-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                ×
              </button>
            </div>
          </header>

          {/* CHAT MESSAGES & SUGGESTIONS */}
          <div className="assistant-content">
            {messages.length === 0 ? (
              <div className="assistant-intro-box">
                <div className="assistant-mini-avatar">
                  <img
                    src="/images/das.png"
                    alt="Padayappa AI Companion"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/model.ico";
                    }}
                  />
                </div>

                <h3>Namaskaram! 🙏</h3>

                <p>
                  I'm <strong>PADAYAPPA</strong>, your personal AI travel
                  companion. Ask me about destinations, budgets, stays, or
                  hidden spots!
                </p>

                <div className="assistant-suggestions">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        "Plan a 4-day scenic trip to Munnar for a couple",
                      )
                    }
                  >
                    🌴 Plan a 4-day trip to Munnar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        "What budget do I need for a 3-day trip in Kerala?",
                      )
                    }
                  >
                    💰 What budget do I need for 3 days?
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        "Help me choose between Varkala and Goa",
                      )
                    }
                  >
                    ✨ Help me choose a destination
                  </button>
                </div>
              </div>
            ) : (
              <div className="assistant-messages">
                {messages.map((m) => (
                  <div key={m.id} className={`assistant-row ${m.sender}`}>
                    {m.sender === "padayappa" && (
                      <div className="assistant-msg-avatar">
                        <Image
                          src="/images/das.png"
                          alt="Padayappa"
                          width={26}
                          height={26}
                          style={{ objectFit: "cover", borderRadius: "50%" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/images/model.ico";
                          }}
                        />
                      </div>
                    )}
                    <div className={`assistant-bubble ${m.sender}`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="assistant-row padayappa">
                    <div className="assistant-msg-avatar">
                      <Image
                        src="/images/das.png"
                        alt="Padayappa"
                        width={26}
                        height={26}
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/model.ico";
                        }}
                      />
                    </div>
                    <div
                      className="assistant-bubble padayappa"
                      style={{ opacity: 0.75 }}
                    >
                      <em>Padayappa is thinking... ✈️</em>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {!isLoggedIn && (
            <div
              style={{
                margin: "8px 16px 4px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(56, 200, 244, 0.09)",
                border: "1px solid rgba(56, 200, 244, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "11px",
                color: "#cbd5e1",
              }}
            >
              <span>🔒 Login to chat with Padayappa</span>
              <button
                type="button"
                onClick={() => router.push("/login")}
                style={{
                  background: "linear-gradient(135deg, #38c8f4, #16c7a0)",
                  color: "#07111f",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontWeight: 700,
                  fontSize: "11px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Login
              </button>
            </div>
          )}

          {/* INPUT FORM */}
          <form className="assistant-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Padayappa anything..."
              aria-label="Ask Padayappa anything"
              disabled={isLoading}
            />

            <button
              type="submit"
              aria-label="Send"
              disabled={!message.trim() || isLoading}
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
