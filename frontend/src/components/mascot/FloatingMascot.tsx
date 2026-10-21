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
  "Need a plan, macha? 🌴",
  "Ask Padayappa ✈️",
];

const HIDE_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const AUTH_REQUIRED_PATHS = ["/planner", "/ai-chat"];

export default function FloatingMascot() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // STRICT VISIBILITY:
  // 1. Home page ("/") ONLY if the user is in logged-in stage
  // 2. Otherwise only available on designated exploratory pages: /dashboard, /explore, /favorites
  // 3. Completely removed from /planner, /ai-chat, /trip, auth pages, and all other views
  const isHomePage = pathname === "/";
  if (isHomePage) {
    if (!isLoggedIn) return null;
  } else {
    const ALLOWED_MASCOT_PATHS = ["/dashboard", "/explore", "/favorites"];
    const isAllowedPath = ALLOWED_MASCOT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (!isAllowedPath) {
      return null;
    }
  }

  const handleOpenFullChat = () => {
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
      <div className="mascot-widget">
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
                setIsOpen(true);
              }}
            >
              <span className="mascot-live-indicator" />
              <span>{PADAYAPPA_PROMPTS[speechIndex]}</span>
            </div>
          )}

          {/* 3D GLB CHARACTER WITH REAL-TIME CONTACT SHADOW & PROCEDURAL LIFE */}

          <div className="mascot-image-wrapper">
            <Mascot3DCanvas
              onModelClick={() => setIsOpen((prev) => !prev)}
              fallback={
                <Image
                  src="/images/model.png"
                  alt=""
                  fill
                  sizes="140px"
                  priority
                  style={{ objectFit: "contain", cursor: "pointer" }}
                  onClick={() => setIsOpen((prev) => !prev)}
                />
              }
            />
          </div>



          {/* NATURAL PHYSICAL GROUND CONTACT SHADOW */}
          <div className="mascot-ground-shadow" />
        </div>
      </div>


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
          className="assistant-panel"
          aria-label="Padayappa Virtual Assistant"
        >
          {/* HEADER */}
          <header className="assistant-header">
            <div className="assistant-heading">
              <div className="assistant-avatar-badge">
                <Image
                  src="/images/das.png"
                  alt="Padayappa"
                  width={34}
                  height={34}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/model.ico";
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
                  <Image
                    src="/images/das.png"
                    alt="Padayappa AI Companion"
                    width={58}
                    height={58}
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/model.ico";
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
