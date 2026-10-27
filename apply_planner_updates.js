const fs = require('fs');

const path = 'frontend/src/app/planner/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update TRAVEL_STYLES definition with imageUrls
const oldTravelStyles = `const TRAVEL_STYLES = [
  {
    id: "Leisure",
    label: "Leisure & Scenic",
    tag: "MOST POPULAR",
    tagColor: "#38BDF8",
    desc: "Slow-paced exploration, panoramic viewpoints & relaxed cafe stops",
    icon: "🌴",
  },
  {
    id: "Adventure",
    label: "Adventure & Trails",
    tag: "ACTIVE & THRILL",
    tagColor: "#F59E0B",
    desc: "Highlands, trekking trails, safaris & thrilling outdoor activities",
    icon: "🧗",
  },
  {
    id: "Eco-Friendly",
    label: "Eco & Wildlife",
    tag: "SUSTAINABLE",
    tagColor: "#34D399",
    desc: "Green canopy walks, spice trails, tea gardens & low carbon footprints",
    icon: "🌱",
  },
  {
    id: "Cultural",
    label: "Heritage & Living Culture",
    tag: "AUTHENTIC",
    tagColor: "#A78BFA",
    desc: "Historic temples, royal architecture, artisan markets & local traditions",
    icon: "🏛️",
  },
  {
    id: "Romantic",
    label: "Romantic Retreat",
    tag: "COUPLES",
    tagColor: "#FB7185",
    desc: "Scenic sunset views, cozy stays, misty valleys & candlelight dining",
    icon: "✨",
  },
  {
    id: "Family",
    label: "Family & Group Holiday",
    tag: "ALL AGES",
    tagColor: "#60A5FA",
    desc: "Relaxed pacing, comfortable stays, scenic gardens & group-friendly activities",
    icon: "👨‍👩‍👧‍👦",
  },
];`;

const newTravelStyles = `const TRAVEL_STYLES = [
  {
    id: "Leisure",
    label: "Leisure & Scenic",
    tag: "MOST POPULAR",
    tagColor: "#38BDF8",
    desc: "Slow-paced exploration, panoramic viewpoints & relaxed cafe stops",
    imageUrl: "/personas/leisure.png",
  },
  {
    id: "Adventure",
    label: "Adventure & Trails",
    tag: "ACTIVE & THRILL",
    tagColor: "#F59E0B",
    desc: "Highlands, trekking trails, safaris & thrilling outdoor activities",
    imageUrl: "/personas/adventure.png",
  },
  {
    id: "Eco-Friendly",
    label: "Eco & Wildlife",
    tag: "SUSTAINABLE",
    tagColor: "#34D399",
    desc: "Green canopy walks, spice trails, tea gardens & low carbon footprints",
    imageUrl: "/personas/eco.png",
  },
  {
    id: "Cultural",
    label: "Heritage & Living Culture",
    tag: "AUTHENTIC",
    tagColor: "#A78BFA",
    desc: "Historic temples, royal architecture, artisan markets & local traditions",
    imageUrl: "/personas/cultural.png",
  },
  {
    id: "Romantic",
    label: "Romantic Retreat",
    tag: "COUPLES",
    tagColor: "#FB7185",
    desc: "Scenic sunset views, cozy stays, misty valleys & candlelight dining",
    imageUrl: "/personas/romantic.png",
  },
  {
    id: "Family",
    label: "Family & Group Holiday",
    tag: "ALL AGES",
    tagColor: "#60A5FA",
    desc: "Relaxed pacing, comfortable stays, scenic gardens & group-friendly activities",
    imageUrl: "/personas/family.png",
  },
];`;

// Normalize line breaks for matching
const normCode = code.replace(/\\r\\n/g, '\\n');
const normOldTravel = oldTravelStyles.replace(/\\r\\n/g, '\\n');

if (!normCode.includes(normOldTravel)) {
  console.error('Could not find TRAVEL_STYLES block!');
  process.exit(1);
}

let updated = normCode.replace(normOldTravel, newTravelStyles);

// 2. Update the Journey Persona JSX to use circular images
const oldPersonaIcon = `                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              background: isSelected
                                ? "rgba(56, 189, 248, 0.20)"
                                : "rgba(255, 255, 255, 0.06)",
                              border: isSelected
                                ? "1px solid rgba(56, 189, 248, 0.40)"
                                : "1px solid rgba(255, 255, 255, 0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              flexShrink: 0,
                            }}
                          >
                            {style.icon}
                          </div>`;

const newPersonaIcon = `                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "50%",
                              padding: "2px",
                              background: isSelected
                                ? "linear-gradient(135deg, rgba(56, 189, 248, 0.70) 0%, rgba(16, 185, 129, 0.50) 100%)"
                                : "rgba(255, 255, 255, 0.10)",
                              boxShadow: isSelected
                                ? "0 0 18px rgba(56, 189, 248, 0.40)"
                                : "0 2px 8px rgba(0,0,0,0.30)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              overflow: "hidden",
                              transition: "all 0.25s ease",
                            }}
                          >
                            <img
                              src={style.imageUrl}
                              alt={style.label}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "50%",
                                display: "block",
                              }}
                            />
                          </div>`;

const normOldIcon = oldPersonaIcon.replace(/\\r\\n/g, '\\n');
if (!updated.includes(normOldIcon)) {
  console.error('Could not find old persona icon block!');
  process.exit(1);
}

updated = updated.replace(normOldIcon, newPersonaIcon);

// 3. Update the Budget section with the professional financial dashboard
const budgetRegex = /\{\/\* TOTAL ESTIMATED BUDGET \(₹\) WITH 3 OPTIONS \(NO DRAG SLIDER\) \*\/\}[\s\S]*?\{\/\* DYNAMIC VEHICLE \/ TRANSIT COST INTEGRATION \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newBudgetSection = `{/* TOTAL ESTIMATED BUDGET (₹) - PROFESSIONAL FINANCIAL DASHBOARD */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.50) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.10)",
                  borderRadius: "20px",
                  padding: "22px 24px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.30)",
                }}
              >
                {/* 1. TOP HEADER ROW: TITLE, METRICS & INTERACTIVE INPUT */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    paddingBottom: "18px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#38BDF8",
                          background: "rgba(56, 189, 248, 0.12)",
                          border: "1px solid rgba(56, 189, 248, 0.25)",
                          borderRadius: "6px",
                          padding: "2px 8px",
                        }}
                      >
                        DYNAMIC ALLOCATION
                      </span>
                      <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
                        {durationDays} Days · {travelersCount} Traveler{travelersCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        margin: "0 0 6px 0",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Total Estimated Budget (₹)
                    </h4>

                    {/* METRIC PILLS */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#94A3B8",
                          background: "rgba(255, 255, 255, 0.04)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        ~₹{Math.round(budget / Math.max(1, durationDays)).toLocaleString("en-IN")} / day total
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#34D399",
                          background: "rgba(52, 211, 153, 0.08)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          border: "1px solid rgba(52, 211, 153, 0.20)",
                        }}
                      >
                        ~₹{Math.round(budget / Math.max(1, durationDays * travelersCount)).toLocaleString("en-IN")} / guest / day
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: QUICK STEPPERS & NUMERIC INPUT */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setHasUserCustomizedBudget(true);
                        setBudget((prev) => Math.max(1000, prev - 2500));
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#CBD5E1",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title="Decrease by ₹2,500"
                    >
                      − ₹2.5k
                    </button>

                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        background: "rgba(15, 23, 42, 0.90)",
                        border: "1.5px solid rgba(56, 189, 248, 0.40)",
                        boxShadow: "0 0 16px rgba(56, 189, 248, 0.18)",
                        borderRadius: "12px",
                        padding: "0 14px",
                      }}
                    >
                      <span style={{ color: "#38BDF8", fontWeight: 800, fontSize: "1.15rem", marginRight: "6px" }}>₹</span>
                      <input
                        type="number"
                        min="1000"
                        max="5000000"
                        step="500"
                        value={budget === 0 ? "" : budget}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const str = e.target.value;
                          if (!str) {
                            setBudget(0);
                            return;
                          }
                          setHasUserCustomizedBudget(true);
                          const val = parseInt(str);
                          if (!isNaN(val)) {
                            setBudget(Math.max(0, val));
                          }
                        }}
                        onBlur={() => {
                          if (!budget || budget < 1000) {
                            setBudget(1000);
                          }
                        }}
                        style={{
                          width: "120px",
                          textAlign: "right",
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          color: "#38BDF8",
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          padding: "8px 0",
                          letterSpacing: "-0.01em",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setHasUserCustomizedBudget(true);
                        setBudget((prev) => prev + 2500);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#CBD5E1",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title="Increase by ₹2,500"
                    >
                      + ₹2.5k
                    </button>
                  </div>
                </div>

                {/* 2. THREE PROFESSIONAL TIER ARCHITECTURE CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "14px", marginBottom: "18px" }}>
                  {[
                    {
                      id: "budget",
                      tierName: "Smart Saver",
                      subtitle: "Budget Backpacker",
                      badge: "SMART VALUE",
                      badgeColor: "#10B981",
                      perDayPerson: 1500,
                      features: ["Boutique Hostels & Homestays", "Sleeper / 2S & Local Transport", "Authentic Local Dining & Cafes"],
                      gradient: "linear-gradient(180deg, rgba(16, 185, 129, 0.10) 0%, rgba(15, 23, 42, 0.85) 100%)",
                      accent: "#10B981",
                      svgIcon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3" />
                          <rect x="3" y="7" width="18" height="14" rx="2" />
                          <path d="M9 11v6" /><path d="M15 11v6" />
                        </svg>
                      ),
                    },
                    {
                      id: "comfort",
                      tierName: "Curated Comfort",
                      subtitle: "Balanced Explorer",
                      badge: "MOST POPULAR",
                      badgeColor: "#38BDF8",
                      perDayPerson: 3500,
                      features: ["3-4★ Premium Stays & Resorts", "AC Cabs / 3-Tier AC Trains", "Curated Multi-Cuisine Dining"],
                      gradient: "linear-gradient(180deg, rgba(56, 189, 248, 0.14) 0%, rgba(15, 23, 42, 0.85) 100%)",
                      accent: "#38BDF8",
                      svgIcon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ),
                    },
                    {
                      id: "luxury",
                      tierName: "Elite Bespoke",
                      subtitle: "Signature Luxury",
                      badge: "VIP EXPERIENCE",
                      badgeColor: "#F59E0B",
                      perDayPerson: 8000,
                      features: ["5★ Heritage Villas & Resorts", "Private Chauffeur SUV / Flight", "Fine Dining & Curated Tastings"],
                      gradient: "linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)",
                      accent: "#F59E0B",
                      svgIcon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
                        </svg>
                      ),
                    },
                  ].map((tier) => {
                    const dailyStayAndActivities = tier.perDayPerson * durationDays * travelersCount;
                    const calculatedTotal = roundToCleanZeros(dailyStayAndActivities + calculatedTransitCost);
                    const isSelected = Math.abs(budget - calculatedTotal) < 2500;

                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          setHasUserCustomizedBudget(true);
                          setBudget(calculatedTotal);
                        }}
                        role="button"
                        tabIndex={0}
                        style={{
                          borderRadius: "16px",
                          padding: "18px 20px",
                          background: isSelected ? tier.gradient : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? \`2px solid \${tier.accent}\` : "1px solid rgba(255, 255, 255, 0.08)",
                          boxShadow: isSelected ? \`0 0 24px \${tier.accent}30, inset 0 1px 0 rgba(255,255,255,0.15)\` : "none",
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          position: "relative",
                        }}
                      >
                        {/* CARD TOP ROW */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: \`\${tier.accent}18\`,
                                border: \`1px solid \${tier.accent}40\`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {tier.svgIcon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#F8FAFC" }}>
                                {tier.tierName}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                                {tier.subtitle}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontSize: "0.64rem",
                                fontWeight: 800,
                                letterSpacing: "0.06em",
                                color: tier.badgeColor,
                                background: \`\${tier.badgeColor}15\`,
                                border: \`1px solid \${tier.badgeColor}35\`,
                                borderRadius: "6px",
                                padding: "2px 6px",
                              }}
                            >
                              {tier.badge}
                            </span>
                            {isSelected && (
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  background: tier.accent,
                                  color: "#030712",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.72rem",
                                  fontWeight: 900,
                                }}
                              >
                                ✓
                              </div>
                            )}
                          </div>
                        </div>

                        {/* PRICE HERO */}
                        <div style={{ marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                          <div style={{ fontSize: "1.45rem", fontWeight: 900, color: isSelected ? tier.accent : "#FFFFFF", letterSpacing: "-0.02em" }}>
                            ₹{calculatedTotal.toLocaleString("en-IN")}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                            ~₹{tier.perDayPerson.toLocaleString("en-IN")} / guest / day base
                          </div>
                        </div>

                        {/* FEATURES LIST */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                          {tier.features.map((feat, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.74rem", color: "#CBD5E1" }}>
                              <span style={{ color: tier.accent, fontSize: "0.78rem" }}>•</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* FOOTER INCLUSIONS CHIP */}
                        <div
                          style={{
                            background: "rgba(0, 0, 0, 0.25)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "8px",
                            padding: "6px 10px",
                            fontSize: "0.68rem",
                            color: "#38BDF8",
                            fontWeight: 600,
                          }}
                        >
                          Includes ~₹{calculatedTransitCost.toLocaleString("en-IN")} travel tickets + stay & meals
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. DYNAMIC VEHICLE & TRANSIT BUDGET BREAKDOWN BAR */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "14px 18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={
                          transportationMode === "Train"
                            ? "/logo/train.png"
                            : transportationMode === "Flight" || transportationMode === "Airline"
                            ? "/logo/plane.png"
                            : transportationMode === "Bike"
                            ? "/logo/bike.png"
                            : transportationMode === "Bicycle" || transportationMode === "Cycling"
                            ? "/logo/bicycle.png"
                            : "/logo/car.png"
                        }
                        alt={transportationMode}
                        style={{ width: "22px", height: "22px", objectFit: "contain" }}
                      />
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF" }}>
                          Vehicle & Transit Integration: {transportationMode}
                        </span>
                        <span style={{ fontSize: "0.74rem", color: "#64748B", marginLeft: "8px" }}>
                          ({origin || "Starting City"} ➔ {destination || "Destination"})
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.90rem", fontWeight: 800, color: "#34D399" }}>
                      ~₹{calculatedTransitCost.toLocaleString("en-IN")}{" "}
                      <span style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>
                        ({Math.round((calculatedTransitCost / Math.max(1, budget)) * 100)}% of total budget)
                      </span>
                    </div>
                  </div>

                  {/* SEGMENTED PROGRESS VISUAL */}
                  <div style={{ height: "8px", width: "100%", background: "rgba(255, 255, 255, 0.08)", borderRadius: "999px", overflow: "hidden", display: "flex" }}>
                    <div
                      style={{
                        width: \`\${Math.min(100, Math.max(8, Math.round((calculatedTransitCost / Math.max(1, budget)) * 100)))}\%\`,
                        background: "linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)",
                        borderRadius: "999px",
                      }}
                      title={\`Transit Tickets: ~₹\${calculatedTransitCost.toLocaleString("en-IN")}\`}
                    />
                    <div
                      style={{
                        flex: 1,
                        background: "linear-gradient(90deg, #10B981 0%, #059669 100%)",
                        borderRadius: "999px",
                      }}
                      title={\`Stay & Daily Logistics: ~₹\${Math.max(0, budget - calculatedTransitCost).toLocaleString("en-IN")}\`}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.68rem", color: "#94A3B8" }}>
                    <span>🔵 Travel Tickets: ~₹{calculatedTransitCost.toLocaleString("en-IN")}</span>
                    <span>🟢 Stay, Meals & Daily Itinerary: ~₹{Math.max(0, budget - calculatedTransitCost).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>`;

if (!budgetRegex.test(updated)) {
  console.error('Could not match budgetRegex in code!');
  process.exit(1);
}

updated = updated.replace(budgetRegex, newBudgetSection);

fs.writeFileSync(path, updated, 'utf8');
console.log('Successfully updated planner/page.tsx with professional budget layout and persona circular images!');
