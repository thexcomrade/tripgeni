"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  LayoutDashboard,
  Bot,
  Bell,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Traveler");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("tripgenius_token");
      setIsLoggedIn(!!token);
      const storedUser = localStorage.getItem("tripgenius_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.full_name) setUserName(u.full_name);
        } catch {
          // ignore
        }
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);



    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("scroll", handleScroll);

    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("tripgenius_token");
    localStorage.removeItem("tripgenius_user");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const mainNav = [
    { name: "Home", href: "/" },
    { name: "Planner", href: "/planner", highlight: true },
    { name: "Explore", href: "/explore" },
    { name: "AI Chat", href: "/ai-chat" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const isHome = pathname === "/";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 100,
          backdropFilter: scrolled ? "blur(24px)" : "blur(16px)",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "blur(16px)",
          background: scrolled
            ? "rgba(3, 7, 18, 0.92)"
            : isHome
              ? "rgba(3, 7, 18, 0.35)"
              : "rgba(3, 7, 18, 0.82)",
          boxShadow: scrolled
            ? "0 12px 32px -10px rgba(0, 0, 0, 0.65), 0 1px 0 0 rgba(255, 255, 255, 0.10)"
            : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255, 255, 255, 0.10)"
            : "1px solid rgba(255, 255, 255, 0.05)",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
      <div
        className="navbar-content-container"
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "14px clamp(20px, 3.5vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* BRAND LOGO (LEFT) */}
        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "flex-start", alignItems: "center", minWidth: "fit-content" }}>
          <Link
            href="/"
            className={isHome ? "animate-blur-fade-up" : ""}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              flexShrink: 0,
              animationDelay: isHome ? "0ms" : undefined,
            }}
          >
            <Image
              src="/logo/logo.svg"
              alt="Trip Geni Logo"
              width={38}
              height={38}
              priority
            />
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(1.25rem, 2vw, 1.55rem)",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                whiteSpace: "nowrap",
              }}
            >
              Trip Geni
            </span>
          </Link>
        </div>

        {/* DESKTOP NAVIGATION (CENTER) */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(2px, 0.6vw, 8px)",
            flexWrap: "nowrap",
            flex: "1 1 auto",
            maxWidth: "780px",
            overflow: "visible",
          }}
          className="desktop-nav-container"
        >
          {mainNav.map((item, idx) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isHome ? "animate-blur-fade-up" : ""}
                style={{
                  padding: "6px clamp(6px, 0.9vw, 12px)",
                  borderRadius: "10px",
                  fontSize: "clamp(0.8rem, 0.9vw, 0.9rem)",
                  fontWeight: active ? 700 : 500,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  color: active ? "#38BDF8" : "#E2E8F0",
                  background: active
                    ? "linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(20, 184, 166, 0.12))"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(56, 189, 248, 0.40)"
                    : "1px solid transparent",
                  boxShadow: active ? "0 0 16px -2px rgba(14, 165, 233, 0.35)" : "none",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                  animationDelay: isHome ? `${100 + idx * 50}ms` : undefined,
                }}
              >
                {item.name}
              </Link>
            );
          })}

          
        </nav>

        {/* RIGHT ACTION CONTROLS (RIGHT) */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "clamp(6px, 1vw, 12px)",
            minWidth: "fit-content",
          }}
        >
          {/* NOTIFICATIONS BELL */}
          <Link
            href="/notifications"
            title="Notifications"
            className={isHome ? "animate-blur-fade-up liquid-glass" : "liquid-glass"}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#CBD5E1",
              position: "relative",
              transition: "all 0.2s ease",
              animationDelay: isHome ? "350ms" : undefined,
            }}
          >
            <Bell size={18} />
            <span
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#0EA5E9",
                boxShadow: "0 0 6px #0EA5E9",
              }}
            />
          </Link>

          {/* PLAN TRIP CTA */}
          <Link
            href="/planner"
            className="btn-primary"
            style={{
              padding: "8px 18px",
              fontSize: "0.88rem",
              display: "none",
            }}
            id="nav-plan-trip-cta"
          >
            <Sparkles size={15} />
            <span>Plan Trip</span>
          </Link>

          {/* USER PROFILE OR LOGIN */}
          {isLoggedIn ? (
            <div className="desktop-auth-pill" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                href="/profile"
                className={`liquid-glass ${isHome ? "animate-blur-fade-up" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  color: "#F8FAFC",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  animationDelay: isHome ? "400ms" : undefined,
                }}
              >
                <User size={15} color="#38BDF8" />
                <span
                  className="profile-name-trunc"
                  style={{
                    maxWidth: "110px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className={`liquid-glass ${isHome ? "animate-blur-fade-up" : ""}`}
                style={{
                  borderRadius: "10px",
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#94A3B8",
                  animationDelay: isHome ? "450ms" : undefined,
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="desktop-auth-pill" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                href="/login"
                className={isHome ? "animate-blur-fade-up" : ""}
                style={{
                  color: "#CBD5E1",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  padding: "8px 14px",
                  textDecoration: "none",
                  animationDelay: isHome ? "400ms" : undefined,
                }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={`btn-primary ${isHome ? "animate-blur-fade-up" : ""}`}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.88rem",
                  animationDelay: isHome ? "450ms" : undefined,
                }}
              >
                Register
              </Link>
            </div>
          )}

          {/* MOBILE PROFILE BUTTON (Visible on <= 1020px) */}
          <Link
            href={isLoggedIn ? "/profile" : "/login"}
            className={`liquid-glass mobile-profile-btn ${isHome ? "animate-blur-fade-up" : ""}`}
            title={isLoggedIn ? `Profile (${userName.split(" ")[0]})` : "Sign In"}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isLoggedIn ? "#38BDF8" : "#CBD5E1",
              textDecoration: "none",
              animationDelay: isHome ? "300ms" : undefined,
            }}
          >
            <User size={18} />
          </Link>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className={`liquid-glass mobile-hamburger-btn ${isHome ? "animate-blur-fade-up" : ""}`}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#CBD5E1",
              animationDelay: isHome ? "350ms" : undefined,
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>



      {/* RESPONSIVE MEDIA STYLES */}
      <style jsx>{`
        @media (max-width: 1020px) {
          .desktop-auth-pill {
            display: none !important;
          }
          .desktop-nav-container {
            display: none !important;
          }
          #nav-plan-trip-cta {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
          .mobile-profile-btn {
            display: flex !important;
          }
        }
        @media (min-width: 1021px) {
          .desktop-nav-container {
            display: flex !important;
          }
          #nav-plan-trip-cta {
            display: inline-flex !important;
          }
          .mobile-hamburger-btn {
            display: none !important;
          }
          .mobile-profile-btn {
            display: none !important;
          }
          .desktop-auth-pill {
            display: flex !important;
          }
        }
      `}</style>
    </header>

      {/* MOBILE FULL-SCREEN SLIDE-OUT DRAWER (Rendered outside header to guarantee viewport attachment) */}
      {mobileMenuOpen && (
        <div
          className="mobile-slideout-drawer"
          style={{
            position: "fixed",
            top: "66px",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "calc(100dvh - 66px)",
            background: "rgba(3, 7, 18, 0.98)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.10)",
            zIndex: 99999,
            padding: "20px 20px 40px 20px",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* USER PROFILE CARD IN MOBILE DRAWER */}
          <Link
            href={isLoggedIn ? "/profile" : "/login"}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(20, 184, 166, 0.15))",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              textDecoration: "none",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38BDF8",
              }}
            >
              <User size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                {isLoggedIn ? userName : "Guest Traveler"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#38BDF8" }}>
                {isLoggedIn ? "Manage Profile & Settings ➔" : "Sign In to sync trips ➔"}
              </div>
            </div>
          </Link>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                marginBottom: "4px",
                paddingLeft: "4px",
              }}
            >
              Main Navigation
            </span>
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "13px 16px",
                    borderRadius: "14px",
                    color: active ? "#38BDF8" : "#F1F5F9",
                    background: active
                      ? "rgba(14, 165, 233, 0.14)"
                      : "rgba(255, 255, 255, 0.04)",
                    border: active
                      ? "1px solid rgba(14, 165, 233, 0.35)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    fontSize: "1rem",
                    fontWeight: active ? 700 : 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {item.name}
                  </span>
                  {active && (
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#38BDF8",
                        boxShadow: "0 0 8px #38BDF8",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Link
              href="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary"
              style={{ width: "100%", padding: "13px", fontSize: "0.98rem", justifyContent: "center" }}
            >
              <Sparkles size={17} />
              <span>Launch AI Planner</span>
            </Link>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn-secondary"
                style={{
                  width: "100%",
                  padding: "12px",
                  justifyContent: "center",
                }}
              >
                <LogOut size={16} />
                <span>Sign Out ({userName.split(" ")[0]})</span>
              </button>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary"
                  style={{ padding: "12px", textAlign: "center", justifyContent: "center" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ padding: "12px", textAlign: "center", justifyContent: "center" }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    {!isHome && <div style={{ height: "68px" }} aria-hidden="true" />}
  </>
  );
}
