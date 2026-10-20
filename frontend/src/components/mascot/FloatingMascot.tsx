"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { ExternalLink, Send } from "lucide-react";
import { getApiBaseUrl } from "../../utils/apiConfig";
import "./FloatingMascot.css";

const Mascot3DCanvas = dynamic(() => import("./Mascot3DCanvas"), {
  ssr: false,
});

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

export default function FloatingMascot() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Do not show the floating widget on the full chat page itself
  if (pathname === "/ai-chat") {
    return null;
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
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "padayappa",
        text: "Namaskaram! For complete day-by-day itineraries with timings, food spots, and costs in ₹, jump right into my full chat room!",
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
        {/* OMNI SPEECH BADGE (No artificial glow, clean dark glass pill) */}
        {!isOpen && (
          <div
            className="mascot-speech-badge"
            onClick={() => setIsOpen(true)}
          >
            <span className="mascot-live-indicator" />
            <span>{PADAYAPPA_PROMPTS[speechIndex]}</span>
          </div>
        )}

        <button
          type="button"
          className="mascot-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close Padayappa" : "Open Padayappa Assistant"}
          aria-expanded={isOpen}
        >
          {/* 3D CHARACTER (Strict 2:3 aspect ratio, zero fuzzy glow) */}
          <Mascot3DCanvas
            fallback={
              <div className="mascot-image-wrapper">
                <Image
                  src="/images/model.png"
                  alt="Padayappa 3D Companion"
                  fill
                  sizes="140px"
                  priority
                  style={{ objectFit: "contain" }}
                />
              </div>
            }
          />

          {/* NATURAL PHYSICAL GROUND CONTACT SHADOW */}
          <div className="mascot-ground-shadow" />
        </button>
      </div>

      {/* ============================================================
          PADAYAPPA ASSISTANT CONSOLE (ROG Omni Screen Console)
          ============================================================ */}
      {isOpen && (
        <section className="assistant-panel" aria-label="Padayappa Virtual Assistant">
          {/* HEADER */}
          <header className="assistant-header">
            <div className="assistant-heading">
              <span className="mascot-live-indicator" />
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
                    src="/images/model.png"
                    alt="Padayappa Avatar"
                    width={50}
                    height={75}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <h3>Namaskaram! 🙏</h3>

                <p>
                  I'm <strong>PADAYAPPA</strong>, your personal AI travel companion.
                  Ask me about destinations, budgets, stays, or hidden spots!
                </p>

                <div className="assistant-suggestions">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage("What are the best places to visit in Kerala?")
                    }
                  >
                    🌴 Best places to visit in Kerala?
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage("Plan a 3-day budget trip for me")
                    }
                  >
                    🎒 Plan a 3-day budget trip
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage("What can you do for me, Padayappa?")
                    }
                  >
                    ✨ What can you do for me, Padayappa?
                  </button>
                </div>
              </div>
            ) : (
              <div className="assistant-messages">
                {messages.map((m) => (
                  <div key={m.id} className={`assistant-bubble ${m.sender}`}>
                    {m.text}
                  </div>
                ))}

                {isLoading && (
                  <div className="assistant-bubble padayappa" style={{ opacity: 0.75 }}>
                    <em>Padayappa is thinking... ✈️</em>
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
