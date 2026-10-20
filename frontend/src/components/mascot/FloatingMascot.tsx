"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, ExternalLink, Send } from "lucide-react";
import { getApiBaseUrl } from "../../utils/apiConfig";
import "./FloatingMascot.css";

const Mascot3DCanvas = dynamic(() => import("./Mascot3DCanvas"), {
  ssr: false,
});

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function FloatingMascot() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Don't show the floating widget on the full chat page itself
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
        "Namaskaram! I am your Trip Geni Travel Companion. How can I assist your journey?";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Namaskaram! For full travel planning, detailed itineraries, and live intelligence, open my full chat room!",
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
      {/* FLOATING 3D MASCOT WIDGET */}
      <div className="mascot-widget">
        {!isOpen && (
          <span className="mascot-tooltip">
            <span className="mascot-tooltip-dot" />
            <span>Need help? Ask AI</span>
          </span>
        )}

        <button
          type="button"
          className="mascot-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
          aria-expanded={isOpen}
          title="Click to talk with Trip Geni AI Companion"
        >
          {/* 3D CHARACTER AVATAR (Interactive WebGL Canvas or 3D High-Res Fallback) */}
          <Mascot3DCanvas
            fallback={
              <div className="mascot-image-wrapper">
                <Image
                  src="/images/model.png"
                  alt="Trip Geni 3D Mascot"
                  fill
                  sizes="140px"
                  priority
                  style={{ objectFit: "contain" }}
                />
              </div>
            }
          />

          {/* PULSING GROUND CONTACT SHADOW */}
          <div className="mascot-shadow" />

          {/* ONLINE STATUS BADGE */}
          <div className="mascot-online-badge" />
        </button>
      </div>

      {/* CHATBOT ASSISTANT POPUP PANEL */}
      {isOpen && (
        <section className="assistant-panel" aria-label="Trip Geni Virtual Assistant">
          {/* HEADER */}
          <header className="assistant-header">
            <div className="assistant-heading">
              <span className="assistant-status" />
              <div>
                <strong>Trip Geni Assistant</strong>
                <small>AI Travel Companion</small>
              </div>
            </div>

            <div className="assistant-header-actions">
              <button
                type="button"
                className="assistant-expand-btn"
                onClick={handleOpenFullChat}
                title="Open in dedicated full chat page"
              >
                <span>Full Chat</span>
                <ExternalLink size={12} />
              </button>

              <button
                type="button"
                className="assistant-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                ×
              </button>
            </div>
          </header>

          {/* CONVERSATION & SUGGESTIONS */}
          <div className="assistant-content">
            {messages.length === 0 ? (
              <div className="assistant-intro">
                <div className="assistant-avatar">
                  <Image
                    src="/images/model.png"
                    alt="Mascot Avatar"
                    width={48}
                    height={48}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <h3>Namaskaram! 🙏</h3>

                <p>
                  I'm your <strong>Trip Geni AI</strong> guide. Ask me about
                  destinations, itineraries, packing, or travel costs!
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
                      handleSendMessage("Plan a 3-day budget itinerary")
                    }
                  >
                    🎒 Plan a 3-day budget itinerary
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendMessage("What can you help me with?")
                    }
                  >
                    ✨ What can you help me with?
                  </button>
                </div>
              </div>
            ) : (
              <div className="assistant-messages">
                {messages.map((m) => (
                  <div key={m.id} className={`assistant-msg ${m.sender}`}>
                    {m.text}
                  </div>
                ))}

                {isLoading && (
                  <div className="assistant-msg ai" style={{ opacity: 0.7 }}>
                    <em>Thinking... ✈️</em>
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
              placeholder="Ask anything about your trip..."
              aria-label="Type your message"
              disabled={isLoading}
            />

            <button
              type="submit"
              aria-label="Send message"
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
