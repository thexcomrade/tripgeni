"use client";

import { FormEvent, useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  MapPin,
  Navigation,
  ArrowUpDown,
  Calendar,
  Users,
  IndianRupee,
  Compass,
  Car,
  Plane,
  Train as TrainIcon,
  Bus as BusIcon,
  Hotel,
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Leaf,
  Shield,
  Loader2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { GlassCard, SectionHeader } from "../../components/ui/Card";
import tripService from "../../services/trip.service";
import { parseDestinationQuery } from "../../utils/queryParser";
import { calculateTransitPricing } from "../../utils/transitPricing";
import LiquidLoadingNav, { SynthesisStage } from "../../components/planner/LiquidLoadingNav";

const POPULAR_ORIGINS = [
  "Ernakulam (Kochi)",
  "Trivandrum",
  "Bangalore",
  "Chennai",
  "Delhi",
  "Mumbai",
  "Calicut",
];

const POPULAR_DESTINATIONS = [
  "Varanasi",
  "Munnar",
  "Coorg",
  "Ooty",
  "Varkala",
  "Wayanad",
  "Kodaikanal",
  "Mysore",
  "Alleppey",
  "Goa",
];

const TRAVEL_STYLES = [
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
];

const TRANSPORT_MODES = [
  {
    id: "Train",
    label: "Scenic Rail (IRCTC)",
    tag: "ECO & COMFORT",
    tagColor: "#34D399",
    desc: "Scenic tracks, overnight sleeper / 3AC berths & zero highway fatigue",
    icon: "🚆",
  },
  {
    id: "Flight",
    label: "Flight + Airport Transit",
    tag: "FASTEST ROUTE",
    tagColor: "#38BDF8",
    desc: "Rapid domestic air travel with coordinated airport cab connections",
    icon: "✈️",
  },
  {
    id: "Car",
    label: "Private Car / Taxi",
    tag: "TOTAL FLEXIBILITY",
    tagColor: "#F59E0B",
    desc: "On-demand sightseeing stops, hill road mastery & luggage-friendly door-to-door transit",
    icon: "🚗",
  },
  {
    id: "Bus",
    label: "Express Intercity Bus",
    tag: "BUDGET CHOICE",
    tagColor: "#A78BFA",
    desc: "Economical AC sleeper & express coaches connecting regional depots",
    icon: "🚌",
  },
  {
    id: "Bike",
    label: "Motorcycle / Scooter",
    tag: "LOCAL FREEDOM",
    tagColor: "#FB7185",
    desc: "Two-wheeler rental for winding mountain roads & offbeat countryside",
    icon: "🏍️",
  },
  {
    id: "Cycling",
    label: "Bicycle & Walking",
    tag: "ZERO EMISSION",
    tagColor: "#2DD4BF",
    desc: "Slow travel through heritage quarters, pedestrian lanes & green ways",
    icon: "🚲",
  },
];

const ACCOMMODATIONS = [
  {
    id: "NoStay",
    label: "No Stay / Day Trip",
    desc: "Single-day outing — no overnight accommodation needed",
    icon: "🌅",
  },
  {
    id: "Hotel",
    label: "Comfort Hotel",
    desc: "Modern amenities & central access",
    icon: "🏨",
  },
  {
    id: "Resort",
    label: "Boutique Resort",
    desc: "Scenic vistas & premium relaxation",
    icon: "🏖️",
  },
  {
    id: "Homestay",
    label: "Authentic Homestay",
    desc: "Warm hospitality & regional cooking",
    icon: "🏡",
  },
  {
    id: "Eco-Lodge",
    label: "Eco Lodge / Farmstay",
    desc: "Solar powered & tranquil nature immersion",
    icon: "🌿",
  },
  {
    id: "Hostel",
    label: "Backpacker Hostel",
    desc: "Budget friendly & social backpacker hubs",
    icon: "🎒",
  },
];

const DEFAULT_FOCUS_POINTS = [
  "Scenic Landscapes & Horizons",
  "Heritage, Temples & Forts",
  "Local Food Tasting & Street Cuisines",
  "Nature & Green Trails",
  "Photography Spots & Sunsets",
  "Handicrafts & Artisan Markets",
  "Panoramic Viewpoints",
  "Cultural Immersion & Traditions",
  "Waterfalls & Scenic Lakes",
  "Wildlife Safaris & Sanctuaries",
];

const DESTINATION_FOCUS_POINTS_MAP: Record<string, string[]> = {
  varanasi: [
    "Ganga Aarti & Ghats",
    "Ancient Temples & Jyotirlingas",
    "Morning Ganges Boat Ride",
    "Spiritual Walking Trails",
    "Banarasi Street Food & Chaat",
    "Banarasi Silk & Handlooms",
    "Sarnath Buddhist Stupas & Museum",
    "Subah-e-Banaras Classical Music",
    "Ghat Photography & Sunrises",
    "Heritage Havelis & Cultural Walks",
  ],
  munnar: [
    "Tea Plantation Walks & Museum",
    "Eravikulam National Park & Nilgiri Tahr",
    "Attukad & Lakkam Waterfalls",
    "Anamudi Peak & Mountain Treks",
    "Mattupetty Dam & Speedboating",
    "Kundala Lake Shikara Rides",
    "Organic Spice Garden Tours",
    "Top Station Panoramic Cloud Views",
    "Authentic Kerala Sadhya Tasting",
    "Valley Photography Spots",
  ],
  goa: [
    "Golden Sand Beaches & Sunsets",
    "Scuba Diving & Water Sports",
    "Aguada & Chapora Forts",
    "Old Goa UNESCO Heritage Churches",
    "Beach Shacks & Nightlife",
    "Fontainhas Latin Quarter Walk",
    "Mandovi River Cruise & Music",
    "Dudhsagar Waterfalls Trek",
    "Goan Seafood & Feni Tasting",
    "Spice Plantation Tour",
  ],
  thenkasi: [
    "Herbal Waterfalls Hydrotherapy",
    "Courtallam Main & Five Falls",
    "Kasi Viswanathar Temple (180ft Gopuram)",
    "Shenkottai Border Pepper Chicken",
    "Gundar Dam & Western Ghats",
    "Wild Forest Honey & Fruit Groves",
    "Herbal Sukku Kaapi Trails",
    "Spiritual & Nature Walks",
  ],
  courtallam: [
    "Herbal Waterfalls Hydrotherapy",
    "Courtallam Main & Five Falls",
    "Old Courtallam & Tiger Falls",
    "Kasi Viswanathar Temple (180ft Gopuram)",
    "Shenkottai Border Pepper Chicken",
    "Gundar Dam & Western Ghats",
    "Wild Forest Honey & Fruit Groves",
    "Herbal Sukku Kaapi Trails",
  ],
  varkala: [
    "Varkala Red Cliff Walks",
    "Papanasam Beach Holy Dip",
    "Kappil Lake & Mangrove Kayaking",
    "Janardhana Swamy 2000-Year Temple",
    "Black Sand Beach Sunsets",
    "Ayurvedic Massages & Spas",
    "Cliffside Seafood Cafes",
    "Surfing & Dolphin Spotting",
  ],
  ooty: [
    "Government Botanical Garden",
    "Nilgiri Mountain Toy Train",
    "Doddabetta Peak Panoramas",
    "Pykara Lake & Waterfalls",
    "Ooty Lake Boating",
    "Homemade Chocolate Tasting",
    "Tea Factory & CTC Museum",
    "Pine Forest Nature Walks",
  ],
  paris: [
    "Eiffel Tower & Seine Cruise",
    "Louvre & Musée d'Orsay Art",
    "Montmartre & Sacré-Cœur",
    "French Patisseries & Wine Bistros",
    "Palace of Versailles Day Trip",
    "Champs-Élysées & Arc de Triomphe",
    "Latin Quarter & Historic Bookstores",
    "Gourmet Cheese & Baguette Trails",
  ],
  tokyo: [
    "Shinjuku & Shibuya Neon Crossings",
    "Sensō-ji Historic Asakusa Temple",
    "Tsukiji Outer Market Fresh Sushi",
    "Akihabara Tech & Anime Culture",
    "Tokyo Skytree Panoramic Observatories",
    "Meiji Shrine & Forest Walk",
    "Authentic Ramen & Izakaya Crawls",
    "Cherry Blossom Parks & Gardens",
  ],
  dubai: [
    "Burj Khalifa Observation Deck",
    "Desert Safari & Dune Bashing",
    "Dubai Mall & Fountain Show",
    "Dubai Marina Yacht Cruise",
    "Gold & Spice Souks Exploration",
    "Palm Jumeirah & Beach Clubs",
    "Traditional Abra Boat Crossing",
    "Miracle Garden & Frame Views",
  ],
  coorg: [
    "Coffee Plantation & Bean Roasting",
    "Abbey & Iruppu Waterfalls",
    "Namdroling Golden Temple (Bylakuppe)",
    "Raja's Seat Sunset Viewpoint",
    "Dubare Elephant Camp",
    "Coorg Pandi Curry Tasting",
    "Tadiandamol Peak Trek",
    "Mandalpatti 4x4 Jeep Safari",
  ],
  wayanad: [
    "Banasura Sagar Dam Speedboating",
    "Edakkal Prehistoric Caves",
    "Chembra Peak & Heart Lake Trek",
    "Soochipara Waterfalls",
    "Wayanad Wildlife Sanctuary Safari",
    "Bamboo Forest Trails",
    "Kuruva Island River Rafting",
    "Pookode Lake Pedal Boating",
  ],
  kodaikanal: [
    "Kodaikanal Star Lake Boating",
    "Coaker's Walk Valley Vistas",
    "Pillar Rocks & Guna Caves",
    "Silver Cascade & Bear Shola Falls",
    "Pine Forest Cinematic Trails",
    "Bryant Park Floral Displays",
    "Dolphin's Nose Cliff Trek",
    "Homemade Chocolates & Spices",
  ],
  hampi: [
    "Virupaksha Temple Heritage",
    "Vijaya Vittala Stone Chariot",
    "Matanga Hill Sunrise Panorama",
    "Coracle Boat Ride on Tungabhadra",
    "Royal Enclosure & Lotus Mahal",
    "Sanapur Lake Bouldering & Cliff Jumps",
    "Hippie Island Cafes & Biking",
    "Sunset at Hemakuta Hill",
  ],
  jaipur: [
    "Amber Fort & Palace Architecture",
    "Hawa Mahal (Palace of Winds)",
    "City Palace Royal Courtyards",
    "Jantar Mantar Astronomical Marvel",
    "Nahargarh Fort Sunset Views",
    "Johari Bazaar Gem & Textile Shopping",
    "Authentic Dal Baati Churma Feast",
    "Chokhi Dhani Cultural Village",
  ],
  agra: [
    "Taj Mahal Sunrise Experience",
    "Agra Fort Mughal Palaces",
    "Mehtab Bagh Reflection View",
    "Fatehpur Sikri Imperial City",
    "Petha Tasting in Sadar Bazaar",
    "Mughlai Cuisine & Biryani Trail",
    "Marble Inlay Handicraft Workshops",
  ],
  manali: [
    "Solang Valley Paragliding & Zorbing",
    "Rohtang Pass Snow Experience",
    "Old Manali Cafes & Live Music",
    "Hadimba Temple Cedar Forest",
    "Jogini Waterfalls Nature Trek",
    "Vashisht Natural Hot Springs",
    "River Rafting in Beas River",
    "Mall Road Shopping & Trout Fish",
  ],
  bali: [
    "Ubud Monkey Forest & Rice Terraces",
    "Tanah Lot & Uluwatu Sunset Temples",
    "Mount Batur Sunrise Volcano Trek",
    "Kecak Fire Dance Performance",
    "Nusa Penida Kelingking Beach Tour",
    "Tegallalang Giant Jungle Swing",
    "Seminyak & Canggu Beach Clubs",
    "Balinese Coffee & Luwak Tasting",
  ],
  singapore: [
    "Gardens by the Bay & Supertree Grove",
    "Marina Bay Sands SkyPark Observation",
    "Sentosa Island & Universal Studios",
    "Chinatown & Little India Food Trails",
    "Jewel Changi Rain Vortex",
    "Night Safari Wildlife Tram",
    "Singapore Flyer Giant Wheel",
    "Clarke Quay Riverside Dining",
  ],
  london: [
    "Big Ben & Palace of Westminster",
    "Tower of London & Tower Bridge",
    "British Museum World Artifacts",
    "London Eye Thames Panorama",
    "Buckingham Palace Changing of Guard",
    "West End Theatre Musicals",
    "Borough Market Street Food",
    "Hyde Park & Kensington Gardens",
  ],
  alleppey: [
    "Traditional Houseboat Cruise",
    "Backwater Kayaking & Canals",
    "Marari Beach Serenity",
    "Village Coir & Canoe Making",
    "Toddy Shop Fresh Karimeen Fish",
    "Kuttanad Below-Sea Farming",
    "Alappuzha Lighthouse & Pier",
  ],
};

const AI_GENERATION_STEPS: SynthesisStage[] = [
  {
    id: 1,
    label: "Connecting to TripGenius Neural Synthesizer...",
    shortTag: "Neural Core",
    iconName: "brain",
    metric: "Multi-agent cluster synchronized",
  },
  {
    id: 2,
    label: "Querying live OpenWeather microclimate data...",
    shortTag: "Microclimate",
    iconName: "weather",
    metric: "Precipitation & temp calibrated",
  },
  {
    id: 3,
    label: "Scanning 700+ regional tourism points of interest...",
    shortTag: "700+ POIs",
    iconName: "poi",
    metric: "Historical footfalls indexed",
  },
  {
    id: 4,
    label: "Calibrating morning, afternoon & evening schedule...",
    shortTag: "Schedule",
    iconName: "schedule",
    metric: "Optimal visiting windows resolved",
  },
  {
    id: 5,
    label: "Computing eco-score & carbon footprint matrix...",
    shortTag: "Eco Score",
    iconName: "eco",
    metric: "Transit emission mapped",
  },
  {
    id: 6,
    label: "Curating authentic regional cuisines & stays...",
    shortTag: "Dining & Stays",
    iconName: "dining",
    metric: "Gastronomy & hotels matched",
  },
  {
    id: 7,
    label: "Finalizing personalized journey roadmap...",
    shortTag: "Roadmap",
    iconName: "rocket",
    metric: "Bespoke itinerary synthesis ready",
  },
];

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [origin, setOrigin] = useState("Ernakulam (Kochi)");
  const [destination, setDestination] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [budget, setBudget] = useState(15000);
  const [hasUserCustomizedBudget, setHasUserCustomizedBudget] = useState(false);
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelStyle, setTravelStyle] = useState("Leisure");
  const [transportationMode, setTransportationMode] = useState("Car");
  const [preferredAccommodation, setPreferredAccommodation] = useState("Hotel");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [customInterestsList, setCustomInterestsList] = useState<string[]>([]);
  const [focusPoints, setFocusPoints] = useState<string[]>(DEFAULT_FOCUS_POINTS);
  const [focusSource, setFocusSource] = useState<string>("default");

  const [loading, setLoading] = useState(false);
  const [aiProcessingStage, setAiProcessingStage] = useState(0);
  const [error, setError] = useState("");

  // Live Transit Distance and Ticket Pricing Intelligence
  const transitPricing = useMemo(() => {
    return calculateTransitPricing(origin, destination);
  }, [origin, destination]);

  // Clean figure rounding: takes average price range and rounds to clean zeros (e.g. 14324 -> 14400 or 14500)
  const roundToCleanZeros = (val: number): number => {
    if (val <= 0) return 0;
    if (val < 1000) return Math.ceil(val / 50) * 50;
    if (val < 5000) return Math.ceil(val / 100) * 100;
    const rem = val % 500;
    if (rem >= 250) {
      return Math.ceil(val / 500) * 500; // e.g. 14324 -> 14500
    }
    return Math.ceil(val / 100) * 100; // e.g. 14120 -> 14200
  };

  // Dynamic Vehicle / Travel Ticket Cost Calculation: takes the average of the estimated price range
  // and rounds to clean zeros, factoring in total traveler ticket count
  const calculatedTransitCost = useMemo(() => {
    let rawTotal = 0;
    if (transportationMode === "Train") {
      const minFare = transitPricing.train.threeTierAcMin || transitPricing.train.sleeperMinFare || 800;
      const maxFare = transitPricing.train.threeTierAcMax || Math.round(minFare * 1.25) || 1200;
      const avgFare = (minFare + maxFare) / 2;
      rawTotal = avgFare * Math.max(1, travelersCount);
    } else if (transportationMode === "Flight") {
      const minFare = transitPricing.flight.economyMinFare || 3500;
      const maxFare = transitPricing.flight.economyMaxFare || 6500;
      const avgFare = (minFare + maxFare) / 2;
      rawTotal = avgFare * Math.max(1, travelersCount);
    } else if (transportationMode === "Bus") {
      const minFare = transitPricing.bus.nonAcMinFare || 600;
      const maxFare = transitPricing.bus.acSleeperMinFare || 1400;
      const avgFare = (minFare + maxFare) / 2;
      rawTotal = avgFare * Math.max(1, travelersCount);
    } else if (transportationMode === "Car") {
      const baseFuelAndTolls = transitPricing.car.fuelAndTollsApprox || 1500;
      const vehiclesNeeded = Math.ceil(Math.max(1, travelersCount) / 4);
      const minCar = baseFuelAndTolls * vehiclesNeeded;
      const maxCar = Math.round(minCar * 1.35);
      rawTotal = (minCar + maxCar) / 2;
    } else if (transportationMode === "Bike") {
      const bikesNeeded = Math.ceil(Math.max(1, travelersCount) / 2);
      const days = Math.max(1, durationDays);
      const avgDailyRental = (650 + 950) / 2;
      rawTotal = days * avgDailyRental * bikesNeeded;
    }
    return roundToCleanZeros(rawTotal);
  }, [transportationMode, transitPricing, travelersCount, durationDays]);

  // Phase 1 Budget Calculation: Auto-incorporate transit fare and duration/travelers
  useEffect(() => {
    if (!hasUserCustomizedBudget) {
      // Baseline: standard comfort stay & meals (₹2,500/person/day) + transit cost
      const baselineStayAndMeals = durationDays * 2500 * travelersCount;
      const initialTotal = roundToCleanZeros(baselineStayAndMeals + calculatedTransitCost);
      if (initialTotal > 0) {
        setBudget(initialTotal);
      }
    }
  }, [origin, destination, transportationMode, travelersCount, durationDays, calculatedTransitCost, hasUserCustomizedBudget]);

  // Dynamically calibrate Activity & Interest Focus Points based on Google Travel Ideas & Dataset
  useEffect(() => {
    const dest = destination.trim().toLowerCase();
    if (!dest) {
      setFocusPoints(DEFAULT_FOCUS_POINTS);
      setFocusSource("default");
      return;
    }

    // 1. Instant client-side lookup from Google Travel Ideas map (0ms latency)
    let matchedPreset: string[] | null = null;
    for (const [key, points] of Object.entries(DESTINATION_FOCUS_POINTS_MAP)) {
      if (dest.includes(key) || key.includes(dest)) {
        matchedPreset = points;
        break;
      }
    }

    if (matchedPreset) {
      setFocusPoints(matchedPreset);
      setFocusSource("google_ideas");
    } else {
      const destTitle = destination.trim();
      setFocusPoints([
        `${destTitle} Heritage & Historic Old Town`,
        `${destTitle} Panoramic Sunset Viewpoints`,
        `Regional Street Food & Local Cuisines`,
        `Local Artisan Handicrafts & Bazaars`,
        `${destTitle} Nature Trails & Green Enclaves`,
        `Iconic Landmarks & Photo Spots`,
        `Cultural Traditions & Folk Highlights`,
        `Waterfront & Scenic Promenade`,
      ]);
      setFocusSource("synthesized");
    }

    // 2. Enrich from backend dataset API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/destinations/focus-points?destination=${encodeURIComponent(destination.trim())}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.focus_points) && data.focus_points.length > 0) {
          setFocusPoints(data.focus_points);
          setFocusSource(data.source || "dataset");
        }
      })
      .catch(() => {
        // preserve current instant lookup
      });
  }, [destination]);

  // Auth guard & destination/origin param pre-fill
  useEffect(() => {
    const token = localStorage.getItem("tripgenius_token");
    if (!token) {
      router.push("/login");
    }

    const paramOrigin = searchParams?.get("origin");
    if (paramOrigin) {
      setOrigin(paramOrigin);
    }

    const paramDest = searchParams?.get("destination");
    const paramDuration = searchParams?.get("duration");

    if (paramDest) {
      const parsed = parseDestinationQuery(paramDest);
      setDestination(parsed.destination || paramDest);
      if (paramDuration) {
        const d = parseInt(paramDuration);
        if (!isNaN(d) && d > 0) setDurationDays(d);
      } else if (parsed.isCustomDuration) {
        setDurationDays(parsed.duration);
      }
    } else if (paramDuration) {
      const d = parseInt(paramDuration);
      if (!isNaN(d) && d > 0) setDurationDays(d);
    }
  }, [router, searchParams]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerateTrip = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!destination.trim()) {
      setCurrentStep(1);
      setError("Please enter a destination to begin.");
      return;
    }

    setLoading(true);
    setAiProcessingStage(0);

    // Advance AI processing stages sequentially for delightful UX
    const interval = setInterval(() => {
      setAiProcessingStage((prev) => {
        if (prev < AI_GENERATION_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    try {
      const response = await tripService.generateAIItinerary({
        destination: destination.trim(),
        origin: origin.trim(),
        duration_days: durationDays,
        budget: budget,
        travelers_count: travelersCount,
        travel_style: travelStyle,
        transportation_mode: transportationMode,
        preferred_accommodation: preferredAccommodation,
        interests: selectedInterests,
      });

      clearInterval(interval);
      setAiProcessingStage(AI_GENERATION_STEPS.length - 1);

      // Store authoritative response merged with trip planning parameters
      const fullTripData = {
        destination: destination.trim(),
        origin: origin.trim(),
        duration_days: durationDays,
        budget: budget,
        travelers_count: travelersCount,
        travel_style: travelStyle,
        transportation_mode: transportationMode,
        preferred_accommodation: preferredAccommodation,
        interests: selectedInterests,
        generated_at: new Date().toISOString(),
        ...response,
      };
      localStorage.setItem("latest_trip", JSON.stringify(fullTripData));
      localStorage.setItem("tripgenius_generated_trip", JSON.stringify(fullTripData));

      setTimeout(() => {
        router.push("/trip/generated");
      }, 600);
    } catch (err) {
      clearInterval(interval);
      const message =
        err instanceof Error
          ? err.message
          : "Unable to generate trip. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div
      className="page-container"
      style={{
        maxWidth: "1140px",
        width: "94%",
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div style={{ display: "inline-flex", marginBottom: "12px" }}>
          <Badge variant="ai" size="md" icon={<Sparkles size={14} />}>
            AI Travel Studio
          </Badge>
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.5px",
          }}
        >
          Craft Your Bespoke Itinerary
        </h1>
        <p
          style={{
            color: "#94A3B8",
            fontSize: "1.05rem",
            maxWidth: "600px",
            margin: "8px auto 0 auto",
          }}
        >
          Follow 4 quick steps or jump straight to AI synthesis.
        </p>
      </div>

      {/* STEP PROGRESS INDICATOR (Hidden while synthesizing to keep screen 100% compact and zero-scroll) */}
      {!loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            marginBottom: "32px",
            padding: "0 10px",
          }}
        >
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            right: "40px",
            height: "2px",
            background: "rgba(255, 255, 255, 0.10)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            width: `${((currentStep - 1) / 3) * 100}%`,
            maxWidth: "calc(100% - 80px)",
            height: "2px",
            background: "linear-gradient(90deg, #0EA5E9, #14B8A6)",
            zIndex: 0,
            transition: "width 0.3s ease",
          }}
        />

        {[
          { step: 1, title: "Destination", icon: MapPin },
          { step: 2, stepName: "Duration & Budget", icon: IndianRupee },
          { step: 3, stepName: "Style & Transit", icon: Compass },
          { step: 4, stepName: "Stay & Interests", icon: Heart },
        ].map((s, idx) => {
          const Icon = s.icon;
          const stepNum = idx + 1;
          const isPassed = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <div
              key={stepNum}
              onClick={() => !loading && setCurrentStep(stepNum)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                position: "relative",
                zIndex: 1,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background:
                    isPassed || isCurrent
                      ? "linear-gradient(135deg, #0EA5E9, #14B8A6)"
                      : "rgba(15, 23, 42, 0.95)",
                  border: isCurrent
                    ? "2px solid #38BDF8"
                    : "2px solid rgba(255, 255, 255, 0.12)",
                  color: isPassed || isCurrent ? "#FFFFFF" : "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isCurrent
                    ? "0 0 16px rgba(14, 165, 233, 0.50)"
                    : "none",
                  transition: "all 0.25s ease",
                }}
              >
                {isPassed ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? "#38BDF8"
                    : isPassed
                      ? "#CBD5E1"
                      : "#64748B",
                }}
              >
                Step {stepNum}
              </span>
            </div>
          );
        })}
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#FCA5A5",
            padding: "14px 20px",
            borderRadius: "14px",
            marginBottom: "24px",
            fontSize: "0.95rem",
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* AI PROCESSING MODAL / OVERLAY */}
      {loading ? (
        <LiquidLoadingNav
          currentStage={aiProcessingStage}
          destination={destination.trim() || "Destination"}
          stages={AI_GENERATION_STEPS}
        />) : (
        /* STEP CARD FORM */
        <GlassCard style={{ padding: "30px 24px" }}>
          {/* STEP 1: ROUTE & DESTINATION */}
          {currentStep === 1 && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: "6px",
                  }}
                >
                  Plan Your Route &amp; Destination
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "0.92rem" }}>
                  Specify where you are starting from and where you want to go. TripGenius automatically calculates transit distance, minimum ticket charges, and route logistics.
                </p>
              </div>

              {/* DUAL ORIGIN & DESTINATION INPUTS WITH SWAP */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "12px",
                  alignItems: "flex-end",
                }}
              >
                {/* 1. STARTING POINT */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "#34D399",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Navigation size={14} color="#10B981" />
                      Starting Point (Departure City)
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "#6EE7B7", background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: "999px" }}>
                      Journey Origin
                    </span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Navigation
                      size={18}
                      color="#10B981"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g. Ernakulam, Trivandrum, Bangalore, Delhi..."
                      className="input-base"
                      style={{
                        paddingLeft: "42px",
                        fontSize: "1.02rem",
                        borderColor: "rgba(16, 185, 129, 0.35)",
                        background: "rgba(6, 78, 59, 0.15)",
                      }}
                    />
                  </div>
                </div>

                {/* 2. SWAP BUTTON */}
                <div style={{ paddingBottom: "2px", display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const temp = origin;
                      setOrigin(destination);
                      setDestination(temp);
                    }}
                    title="Swap Starting Point & Destination"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#94A3B8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#38BDF8";
                      e.currentTarget.style.borderColor = "#38BDF8";
                      e.currentTarget.style.background = "rgba(14, 165, 233, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94A3B8";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    }}
                  >
                    <ArrowUpDown size={18} />
                  </button>
                </div>

                {/* 3. DESTINATION */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "#38BDF8",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MapPin size={14} color="#38BDF8" />
                      Destination City / Region
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "#7DD3FC", background: "rgba(14, 165, 233, 0.12)", padding: "2px 8px", borderRadius: "999px" }}>
                      Target Destination
                    </span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <MapPin
                      size={18}
                      color="#38BDF8"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Varanasi, Munnar, Goa, Coorg, Ooty..."
                      className="input-base"
                      style={{
                        paddingLeft: "42px",
                        fontSize: "1.02rem",
                        borderColor: "rgba(14, 165, 233, 0.35)",
                      }}
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* QUICK PICKS GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Starting City Quick Picks */}
                <div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#10B981",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Starting City Picks
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {POPULAR_ORIGINS.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setOrigin(city)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "999px",
                          background:
                            origin.toLowerCase() === city.toLowerCase()
                              ? "rgba(16, 185, 129, 0.25)"
                              : "rgba(255, 255, 255, 0.04)",
                          border:
                            origin.toLowerCase() === city.toLowerCase()
                              ? "1px solid #10B981"
                              : "1px solid rgba(255, 255, 255, 0.08)",
                          color:
                            origin.toLowerCase() === city.toLowerCase()
                              ? "#34D399"
                              : "#94A3B8",
                          fontSize: "0.80rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination Quick Picks */}
                <div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#38BDF8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Popular Destinations
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => setDestination(dest)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "999px",
                          background:
                            destination.toLowerCase() === dest.toLowerCase()
                              ? "rgba(14, 165, 233, 0.25)"
                              : "rgba(255, 255, 255, 0.04)",
                          border:
                            destination.toLowerCase() === dest.toLowerCase()
                              ? "1px solid #38BDF8"
                              : "1px solid rgba(255, 255, 255, 0.08)",
                          color:
                            destination.toLowerCase() === dest.toLowerCase()
                              ? "#38BDF8"
                              : "#CBD5E1",
                          fontSize: "0.80rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DATA-DRIVEN TRAVEL COMPARISON INTELLIGENCE CARD */}
              {destination.trim() && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.90), rgba(30, 41, 59, 0.90))",
                    border: "1px solid rgba(56, 189, 248, 0.28)",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {/* MULTI-DISTANCE DISAMBIGUATION & ROUTE GEOMETRY */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "16px",
                      paddingBottom: "14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.15rem" }}>🧭</span>
                        <span style={{ fontWeight: 800, color: "#F8FAFC", fontSize: "1.02rem" }}>
                          Data-Driven Travel Comparison: <span style={{ color: "#34D399" }}>{origin || "Starting City"}</span> ➔ <span style={{ color: "#38BDF8" }}>{destination}</span>
                        </span>
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#94A3B8", marginTop: "4px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span>🛣️ {transitPricing.car.routeName}</span>
                        <span>•</span>
                        <span>🕒 Live Fares Verified: <b style={{ color: "#38BDF8" }}>{transitPricing.lastUpdated}</b></span>
                      </div>
                    </div>

                    {/* Disambiguated Distance Badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      {transitPricing.isInternational && (
                        <span style={{ background: "rgba(245, 158, 11, 0.18)", color: "#FBBF24", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "3px 10px", borderRadius: "999px", fontSize: "0.74rem", fontWeight: 700 }}>
                          🌐 International
                        </span>
                      )}
                      <span title="Actual driving distance via road and highway network" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399", border: "1px solid rgba(16, 185, 129, 0.35)", padding: "3px 10px", borderRadius: "999px", fontSize: "0.74rem", fontWeight: 700 }}>
                        🛣️ Road: {transitPricing.distances.roadKm.toLocaleString("en-IN")} km
                      </span>
                      {transitPricing.train.available && (
                        <span title="Operational railway track distance" style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38BDF8", border: "1px solid rgba(14, 165, 233, 0.35)", padding: "3px 10px", borderRadius: "999px", fontSize: "0.74rem", fontWeight: 700 }}>
                          🚆 Rail Track: {transitPricing.distances.railKm.toLocaleString("en-IN")} km
                        </span>
                      )}
                      <span title="Straight-line geodesic displacement (as the crow flies)" style={{ background: "rgba(255, 255, 255, 0.05)", color: "#CBD5E1", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "3px 10px", borderRadius: "999px", fontSize: "0.74rem", fontWeight: 600 }}>
                        📏 Geodesic: {transitPricing.distances.straightLineKm.toLocaleString("en-IN")} km
                      </span>
                    </div>
                  </div>

                  {/* 4 DATA-DRIVEN TRANSIT MODE CARDS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {/* 1. TRAIN (IRCTC) */}
                    {(() => {
                      const isTrainSelected = transportationMode === "Train";
                      return (
                        <div
                          onClick={() => {
                            if (transitPricing.train.available) {
                              setTransportationMode("Train");
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          style={{
                            background: isTrainSelected
                              ? "rgba(52, 211, 153, 0.14)"
                              : transitPricing.train.available
                              ? "rgba(255, 255, 255, 0.03)"
                              : "rgba(239, 68, 68, 0.04)",
                            border: isTrainSelected
                              ? "2px solid #34D399"
                              : transitPricing.train.available
                              ? "1px solid rgba(255, 255, 255, 0.14)"
                              : "1px solid rgba(239, 68, 68, 0.20)",
                            boxShadow: isTrainSelected ? "0 0 18px rgba(52, 211, 153, 0.25)" : "none",
                            borderRadius: "14px",
                            padding: "14px 16px",
                            cursor: transitPricing.train.available ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                              <span style={{ fontWeight: 800, fontSize: "0.90rem", color: isTrainSelected ? "#34D399" : transitPricing.train.available ? "#F1F5F9" : "#94A3B8", display: "flex", alignItems: "center", gap: "6px" }}>
                                🚆 Train (IRCTC)
                              </span>
                              <span style={{ fontSize: "0.72rem", color: isTrainSelected ? "#34D399" : transitPricing.train.available ? "#38BDF8" : "#EF4444", fontWeight: 700, background: isTrainSelected ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "999px" }}>
                                {transitPricing.train.available ? `~${transitPricing.train.durationText}` : "No Direct Track"}
                              </span>
                            </div>

                            {transitPricing.train.available ? (
                              <div style={{ fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.45 }}>
                                {/* Station Codes */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", color: "#E2E8F0", fontWeight: 600, fontSize: "0.75rem" }}>
                                  <span style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38BDF8", padding: "1px 6px", borderRadius: "4px" }}>{transitPricing.train.originStation.code}</span>
                                  <span>➔</span>
                                  <span style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34D399", padding: "1px 6px", borderRadius: "4px" }}>{transitPricing.train.destinationStation.code}</span>
                                  <span style={{ color: "#64748B", fontSize: "0.70rem" }}>({transitPricing.train.railDistanceKm} km)</span>
                                </div>

                                {/* Fare Slabs */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", background: "rgba(0,0,0,0.22)", padding: "6px 8px", borderRadius: "8px", marginBottom: "8px" }}>
                                  <div>2S / General: <b style={{ color: "#E2E8F0" }}>₹{transitPricing.train.fares.general2S}</b></div>
                                  <div>Sleeper: <b style={{ color: "#34D399" }}>₹{transitPricing.train.fares.sleeperMin} - ₹{transitPricing.train.fares.sleeperMax}</b></div>
                                  <div>3-Tier AC: <b style={{ color: "#38BDF8" }}>₹{transitPricing.train.fares.threeTierAcMin}</b></div>
                                  <div>2-Tier AC: <b style={{ color: "#A78BFA" }}>₹{transitPricing.train.fares.twoTierAcMin}</b></div>
                                </div>

                                {/* Sample Trains */}
                                {transitPricing.train.sampleTrains.length > 0 && (
                                  <div style={{ fontSize: "0.70rem", color: "#64748B", marginBottom: "6px" }}>
                                    <div style={{ color: "#94A3B8", fontWeight: 600, marginBottom: "2px" }}>Daily Services:</div>
                                    {transitPricing.train.sampleTrains.slice(0, 2).map((tr) => (
                                      <div key={tr.number} style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#CBD5E1" }}>{tr.number} {tr.name.split(" ")[0]}</span>
                                        <span>{tr.departure} ➔ {tr.arrival}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div style={{ fontSize: "0.68rem", color: "#34D399", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span>✓</span>
                                  <span>Live availability via provider (IRCTC)</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ color: "#EF4444", fontSize: "0.75rem", lineHeight: 1.4 }}>
                                {transitPricing.train.note}
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: "10px", fontSize: "0.72rem", color: isTrainSelected ? "#34D399" : "#94A3B8", fontWeight: 700, textAlign: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "8px" }}>
                            {isTrainSelected ? "✓ Selected for Journey" : transitPricing.train.available ? "Click to Select Train" : "Unavailable"}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2. FLIGHT (AIRLINE DISTRIBUTION) */}
                    {(() => {
                      const isFlightSelected = transportationMode === "Flight";
                      const isNoDirectAirport = !transitPricing.flight.hasDirectFlight && transitPricing.flight.nearestAirportToDest;
                      return (
                        <div
                          onClick={() => setTransportationMode("Flight")}
                          role="button"
                          tabIndex={0}
                          style={{
                            background: isFlightSelected
                              ? "rgba(56, 189, 248, 0.15)"
                              : isNoDirectAirport
                              ? "rgba(245, 158, 11, 0.04)"
                              : "rgba(255, 255, 255, 0.03)",
                            border: isFlightSelected
                              ? "2px solid #38BDF8"
                              : isNoDirectAirport
                              ? "1px solid rgba(245, 158, 11, 0.28)"
                              : "1px solid rgba(255, 255, 255, 0.14)",
                            boxShadow: isFlightSelected ? "0 0 18px rgba(56, 189, 248, 0.25)" : "none",
                            borderRadius: "14px",
                            padding: "14px 16px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                              <span style={{ fontWeight: 800, fontSize: "0.90rem", color: isFlightSelected ? "#38BDF8" : "#F1F5F9", display: "flex", alignItems: "center", gap: "6px" }}>
                                ✈️ {transitPricing.isInternational ? "International Air" : "Airlines"}
                              </span>
                              <span style={{ fontSize: "0.72rem", color: "#38BDF8", fontWeight: 700, background: "rgba(56, 189, 248, 0.15)", padding: "2px 8px", borderRadius: "999px" }}>
                                ~{transitPricing.flight.durationText}
                              </span>
                            </div>

                            <div style={{ fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.45 }}>
                              {isNoDirectAirport ? (
                                <>
                                  <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#FBBF24", padding: "6px 8px", borderRadius: "8px", fontSize: "0.70rem", marginBottom: "8px" }}>
                                    🚫 <b>No commercial airport in {destination}</b>
                                    <div style={{ color: "#E2E8F0", marginTop: "2px" }}>
                                      Nearest Hub: <b>{transitPricing.flight.nearestAirportToDest?.name} ({transitPricing.flight.nearestAirportToDest?.code})</b> · {transitPricing.flight.nearestAirportToDest?.distanceToDestKm} km
                                    </div>
                                    <div style={{ color: "#94A3B8", marginTop: "2px" }}>
                                      Includes flight + connecting road transfer to {destination}
                                    </div>
                                  </div>
                                  <div>Economy Airfare: <b style={{ color: "#F59E0B" }}>₹{transitPricing.flight.economyMinFare.toLocaleString("en-IN")} - ₹{transitPricing.flight.economyMaxFare.toLocaleString("en-IN")}</b></div>
                                </>
                              ) : (
                                <>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", color: "#E2E8F0", fontWeight: 600, fontSize: "0.75rem" }}>
                                    <span style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38BDF8", padding: "1px 6px", borderRadius: "4px" }}>{transitPricing.flight.originAirport.code}</span>
                                    <span>➔</span>
                                    <span style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", padding: "1px 6px", borderRadius: "4px" }}>{transitPricing.flight.destinationAirport?.code || "DEST"}</span>
                                  </div>
                                  <div>Economy: <b style={{ color: "#F59E0B" }}>₹{transitPricing.flight.economyMinFare.toLocaleString("en-IN")} - ₹{transitPricing.flight.economyMaxFare.toLocaleString("en-IN")}</b></div>
                                  {transitPricing.flight.airlines.length > 0 && (
                                    <div style={{ fontSize: "0.70rem", color: "#64748B", marginTop: "3px" }}>
                                      Carriers: {transitPricing.flight.airlines.join(", ")}
                                    </div>
                                  )}
                                </>
                              )}

                              <div style={{ fontSize: "0.68rem", color: "#38BDF8", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                                <span>✓</span>
                                <span>Airline Distribution GDS • Updated today</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: "10px", fontSize: "0.72rem", color: isFlightSelected ? "#38BDF8" : "#94A3B8", fontWeight: 700, textAlign: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "8px" }}>
                            {isFlightSelected ? "✓ Selected for Journey" : "Click to Select Flight"}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 3. CAR / ROAD & TAXI (FUEL FORMULA) */}
                    {(() => {
                      const isCarSelected = transportationMode === "Car";
                      const fuel = transitPricing.car.fuelCalculation;
                      return (
                        <div
                          onClick={() => setTransportationMode("Car")}
                          role="button"
                          tabIndex={0}
                          style={{
                            background: isCarSelected
                              ? "rgba(168, 85, 247, 0.15)"
                              : "rgba(255, 255, 255, 0.03)",
                            border: isCarSelected
                              ? "2px solid #A855F7"
                              : "1px solid rgba(255, 255, 255, 0.14)",
                            boxShadow: isCarSelected ? "0 0 18px rgba(168, 85, 247, 0.25)" : "none",
                            borderRadius: "14px",
                            padding: "14px 16px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                              <span style={{ fontWeight: 800, fontSize: "0.90rem", color: isCarSelected ? "#C084FC" : "#F1F5F9", display: "flex", alignItems: "center", gap: "6px" }}>
                                🚗 Car / Taxi & Fuel
                              </span>
                              <span style={{ fontSize: "0.72rem", color: "#C084FC", fontWeight: 700, background: "rgba(168, 85, 247, 0.15)", padding: "2px 8px", borderRadius: "999px" }}>
                                ~{transitPricing.car.durationText}
                              </span>
                            </div>

                            <div style={{ fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.45 }}>
                              {/* Route Name */}
                              <div style={{ color: "#E2E8F0", fontSize: "0.74rem", fontWeight: 600, marginBottom: "6px" }}>
                                📍 {transitPricing.car.routeName} ({transitPricing.distances.roadKm} km)
                              </div>

                              {/* Fuel Formula Breakdown Box */}
                              <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", padding: "6px 8px", borderRadius: "8px", marginBottom: "6px", fontSize: "0.68rem" }}>
                                <div style={{ color: "#CBD5E1", fontWeight: 600, marginBottom: "2px" }}>⛽ Fuel Formula:</div>
                                <div style={{ color: "#A78BFA", fontFamily: "monospace" }}>
                                  ({transitPricing.distances.roadKm}km ÷ {fuel.vehicleMileageKmpl}km/L) × ₹{fuel.fuelPricePerLitre} = ₹{fuel.fuelCostMin}
                                </div>
                                <div style={{ color: "#94A3B8", marginTop: "2px" }}>
                                  + Tolls: ₹{fuel.tollsApprox} ➔ Self-Drive: <b style={{ color: "#34D399" }}>₹{fuel.totalSelfDriveMin.toLocaleString("en-IN")}</b>
                                </div>
                              </div>

                              <div>On-Demand Cab / Taxi: <b style={{ color: "#C084FC" }}>₹{fuel.commercialCabMin.toLocaleString("en-IN")} - ₹{fuel.commercialCabMax.toLocaleString("en-IN")}</b></div>

                              <div style={{ fontSize: "0.68rem", color: "#A78BFA", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                                <span>✓</span>
                                <span>Real-time road routing & petroleum fuel index</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ marginTop: "10px", fontSize: "0.72rem", color: isCarSelected ? "#C084FC" : "#94A3B8", fontWeight: 700, textAlign: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "8px" }}>
                            {isCarSelected ? "✓ Selected for Journey" : "Click to Select Car"}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 4. BUS / COACH */}
                    {(() => {
                      const isBusSelected = transportationMode === "Bus";
                      return (
                        <div
                          onClick={() => {
                            if (transitPricing.bus.available) {
                              setTransportationMode("Bus");
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          style={{
                            background: isBusSelected
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(255, 255, 255, 0.03)",
                            border: isBusSelected
                              ? "2px solid #F59E0B"
                              : "1px solid rgba(255, 255, 255, 0.14)",
                            boxShadow: isBusSelected ? "0 0 18px rgba(245, 158, 11, 0.25)" : "none",
                            borderRadius: "14px",
                            padding: "14px 16px",
                            cursor: transitPricing.bus.available ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                              <span style={{ fontWeight: 800, fontSize: "0.90rem", color: isBusSelected ? "#F59E0B" : "#F1F5F9", display: "flex", alignItems: "center", gap: "6px" }}>
                                🚌 Bus / Coach
                              </span>
                              <span style={{ fontSize: "0.72rem", color: isBusSelected ? "#F59E0B" : "#94A3B8", fontWeight: 700, background: "rgba(245, 158, 11, 0.15)", padding: "2px 8px", borderRadius: "999px" }}>
                                {transitPricing.bus.available ? `~${transitPricing.bus.durationText}` : "N/A"}
                              </span>
                            </div>

                            <div style={{ fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.45 }}>
                              {transitPricing.bus.available ? (
                                <>
                                  <div style={{ marginBottom: "6px" }}>Express / RTC: <b style={{ color: "#A78BFA" }}>₹{transitPricing.bus.nonAcMinFare.toLocaleString("en-IN")}</b></div>
                                  <div style={{ marginBottom: "6px" }}>AC Sleeper / Multi-Axle: <b style={{ color: "#F59E0B" }}>₹{transitPricing.bus.acSleeperMinFare.toLocaleString("en-IN")}</b></div>
                                  <div style={{ fontSize: "0.70rem", color: "#64748B", marginBottom: "6px" }}>
                                    Operators: {transitPricing.bus.operators.join(", ")}
                                  </div>
                                  <div style={{ fontSize: "0.68rem", color: "#F59E0B", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span>✓</span>
                                    <span>State RTC & Intercity Fleet Schedules</span>
                                  </div>
                                </>
                              ) : (
                                <div style={{ color: "#64748B", fontSize: "0.74rem" }}>
                                  {transitPricing.isInternational ? "No cross-continental bus routes" : "Long distance route; Train or Flight advised"}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ marginTop: "10px", fontSize: "0.72rem", color: isBusSelected ? "#F59E0B" : "#94A3B8", fontWeight: 700, textAlign: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "8px" }}>
                            {isBusSelected ? "✓ Selected for Journey" : transitPricing.bus.available ? "Click to Select Bus" : "Unavailable"}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* BOTTOM NOTE */}
                  <div style={{ marginTop: "12px", fontSize: "0.74rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px" }}>
                    <span>💡</span>
                    <span>
                      <b>Data-Driven Travel Calculation:</b> Selected <b>{transportationMode}</b> fare (~₹{calculatedTransitCost.toLocaleString("en-IN")}) is dynamically added to your <b>Step 2 Budget</b> for all {travelersCount} traveler{travelersCount > 1 ? "s" : ""}.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DURATION & BUDGET */}
          {currentStep === 2 && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "28px" }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: "6px",
                  }}
                >
                  Trip Duration & Budget Allocation
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "0.92rem" }}>
                  Define the duration, group size, and total estimated spending
                  limit.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "24px",
                }}
              >
                {/* DURATION (DAYS) */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.90rem",
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      Duration (Days)
                    </label>
                    <span style={{ fontSize: "0.82rem", color: "#38BDF8", fontWeight: 700 }}>
                      {durationDays} Day{durationDays > 1 ? "s" : ""} Selected
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {[
                      { label: "3 Days (Weekend)", days: 3 },
                      { label: "5 Days (Standard)", days: 5 },
                      { label: "7 Days (Week)", days: 7 },
                    ].map((item) => {
                      const isSelected = durationDays === item.days;
                      return (
                        <button
                          key={item.days}
                          type="button"
                          onClick={() => setDurationDays(item.days)}
                          style={{
                            padding: "9px 16px",
                            borderRadius: "10px",
                            background: isSelected
                              ? "rgba(14, 165, 233, 0.22)"
                              : "rgba(255, 255, 255, 0.05)",
                            border: isSelected
                              ? "1px solid #38BDF8"
                              : "1px solid rgba(255, 255, 255, 0.12)",
                            color: isSelected ? "#38BDF8" : "#94A3B8",
                            fontSize: "0.85rem",
                            fontWeight: isSelected ? 700 : 500,
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}

                    {/* Custom Days Input without +/- icons */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        padding: "4px 10px",
                      }}
                    >
                      <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Custom:</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={durationDays === 0 ? "" : durationDays}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const str = e.target.value;
                          if (!str) {
                            setDurationDays(0);
                            return;
                          }
                          const val = parseInt(str);
                          if (!isNaN(val)) {
                            setDurationDays(Math.max(1, Math.min(30, val)));
                          }
                        }}
                        onBlur={() => {
                          if (!durationDays || durationDays < 1) {
                            setDurationDays(1);
                          }
                        }}
                        style={{
                          width: "55px",
                          textAlign: "center",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          background: "transparent",
                          border: "none",
                          color: "#FFFFFF",
                          outline: "none",
                        }}
                      />
                      <span style={{ fontSize: "0.78rem", color: "#64748B" }}>days</span>
                    </div>
                  </div>
                </div>

                {/* TRAVELERS COUNT */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.90rem",
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      Travelers Count
                    </label>
                    <span style={{ fontSize: "0.82rem", color: "#38BDF8", fontWeight: 700 }}>
                      {travelersCount} Traveler{travelersCount > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {[
                      { label: "Solo (1)", count: 1 },
                      { label: "Couple (2)", count: 2 },
                      { label: "Friends (6)", count: 6 },
                      { label: "Group (15)", count: 15 },
                      { label: "🎓 College (50)", count: 50 },
                      { label: "🚌 Mega Tour (100+)", count: 100 },
                    ].map((preset) => {
                      const isSelected = travelersCount === preset.count;
                      return (
                        <button
                          key={preset.count}
                          type="button"
                          onClick={() => setTravelersCount(preset.count)}
                          style={{
                            fontSize: "0.82rem",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            border: isSelected
                              ? "1px solid #38BDF8"
                              : "1px solid rgba(255, 255, 255, 0.12)",
                            background: isSelected
                              ? "rgba(14, 165, 233, 0.22)"
                              : "rgba(255, 255, 255, 0.05)",
                            color: isSelected ? "#38BDF8" : "#CBD5E1",
                            cursor: "pointer",
                            fontWeight: isSelected ? 700 : 500,
                            transition: "all 0.18s ease",
                          }}
                        >
                          {preset.label}
                        </button>
                      );
                    })}

                    {/* Custom Travelers Input without +/- icons */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        padding: "4px 10px",
                      }}
                    >
                      <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Custom:</span>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={travelersCount === 0 ? "" : travelersCount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const str = e.target.value;
                          if (!str) {
                            setTravelersCount(0);
                            return;
                          }
                          const val = parseInt(str);
                          if (!isNaN(val)) {
                            setTravelersCount(Math.max(1, Math.min(500, val)));
                          }
                        }}
                        onBlur={() => {
                          if (!travelersCount || travelersCount < 1) {
                            setTravelersCount(1);
                          }
                        }}
                        style={{
                          width: "55px",
                          textAlign: "center",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          background: "transparent",
                          border: "none",
                          color: "#FFFFFF",
                          outline: "none",
                        }}
                      />
                      <span style={{ fontSize: "0.78rem", color: "#64748B" }}>people</span>
                    </div>
                  </div>

                  {travelersCount >= 30 && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(14, 165, 233, 0.1)",
                        border: "1px solid rgba(14, 165, 233, 0.25)",
                        fontSize: "0.78rem",
                        color: "#38BDF8",
                      }}
                    >
                      🎓 <b>Large Group / College Trip Mode:</b> Accommodations & transport will auto-scale for bulk coach fleets and group stays.
                    </div>
                  )}
                </div>
              </div>

              {/* TOTAL ESTIMATED BUDGET (₹) WITH 3 OPTIONS (NO DRAG SLIDER) */}
              <div className="space-y-4">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "0.90rem",
                        fontWeight: 600,
                        color: "#E2E8F0",
                        display: "block",
                      }}
                    >
                      Total Estimated Budget (₹)
                    </label>
                    <span style={{ fontSize: "0.80rem", color: "#94A3B8" }}>
                      ~₹{Math.round(budget / Math.max(1, durationDays)).toLocaleString("en-IN")}/day · ~₹{Math.round(budget / Math.max(1, durationDays * travelersCount)).toLocaleString("en-IN")}/person/day
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#38BDF8", fontWeight: 700, fontSize: "1.1rem" }}>₹</span>
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
                      className="input-base"
                      style={{
                        width: "140px",
                        textAlign: "right",
                        fontSize: "1.15rem",
                        fontWeight: 800,
                        color: "#38BDF8",
                        padding: "8px 14px",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                </div>

                {/* THREE BUDGET OPTIONS */}
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                    {[
                      { label: "🎒 Budget", perDayPerson: 1500, style: "Hostels, trains, local dining", desc: "Best for smart travelers" },
                      { label: "🌟 Comfort", perDayPerson: 3500, style: "3-star hotels, cabs, restaurants", desc: "Most popular choice" },
                      { label: "💎 Luxury", perDayPerson: 8000, style: "5-star resorts, private cars, fine dining", desc: "Premium experience" },
                    ].map((tier) => {
                      // Total price includes stay, dining & activities + travel ticket charge for all travelers
                      const dailyStayAndActivities = tier.perDayPerson * durationDays * travelersCount;
                      const calculatedTotal = roundToCleanZeros(dailyStayAndActivities + calculatedTransitCost);
                      const isSelected = Math.abs(budget - calculatedTotal) < 2500;

                      return (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => {
                            setHasUserCustomizedBudget(true);
                            setBudget(calculatedTotal);
                          }}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "12px",
                            background: isSelected
                              ? "rgba(14, 165, 233, 0.22)"
                              : "rgba(255, 255, 255, 0.05)",
                            border: isSelected
                              ? "1px solid #38BDF8"
                              : "1px solid rgba(255, 255, 255, 0.10)",
                            color: isSelected ? "#38BDF8" : "#CBD5E1",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.90rem" }}>{tier.label}</span>
                            <span style={{ color: "#10B981", fontSize: "0.90rem", fontWeight: 800 }}>
                              ₹{calculatedTotal.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: "3px" }}>
                            {tier.style}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#38BDF8", fontWeight: 600 }}>
                            Includes ~₹{calculatedTransitCost.toLocaleString("en-IN")} travel tickets + stay & meals
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC VEHICLE / TRANSIT COST INTEGRATION */}
                <div
                  style={{
                    marginTop: "14px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.4rem" }}>
                      {transportationMode === "Train" ? "🚆" : transportationMode === "Flight" ? "✈️" : transportationMode === "Bus" ? "🚌" : transportationMode === "Bike" ? "🏍️" : "🚗"}
                    </span>
                    <div>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#FFFFFF" }}>
                        Estimated {transportationMode} Travel Tickets Included (Avg Fare Range)
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                        Calculated for {travelersCount} traveler{travelersCount > 1 ? "s" : ""} ({origin || "Starting City"} → {destination || "Destination"}) • Clean zero approx
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.08rem", fontWeight: 800, color: "#34D399" }}>
                      ~₹{calculatedTransitCost.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "0.70rem", color: "#94A3B8" }}>
                      {Math.round((calculatedTransitCost / Math.max(1, budget)) * 100)}% of total budget
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STYLE & TRANSIT */}
          {currentStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {/* HEADER BANNER */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(30, 41, 59, 0.40) 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.20)",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontSize: "0.70rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#38BDF8",
                        background: "rgba(56, 189, 248, 0.12)",
                        border: "1px solid rgba(56, 189, 248, 0.30)",
                        borderRadius: "6px",
                        padding: "3px 8px",
                      }}
                    >
                      STEP 3 OF 3 • JOURNEY PERSONA & LOGISTICS
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Define Your Travel Persona & Primary Transit
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                    TripGenius customizes activity pacing, transport class, and departure logistics based on your choice.
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.60)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    padding: "8px 14px",
                    textAlign: "right",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Route Distance</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#34D399" }}>
                    ~{transitPricing.distanceKm.toLocaleString("en-IN")} km
                  </div>
                </div>
              </div>

              {/* 1. TRAVEL STYLE PERSONA (BALANCED 3x2 GRID) */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div>
                    <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>
                      1. Choose Your Journey Persona
                    </h4>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "2px 0 0 0" }}>
                      Select the rhythm that matches how you want to experience {destination || "your destination"}.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "#38BDF8", fontWeight: 600 }}>
                    1 Persona Selected
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = travelStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => setTravelStyle(style.id)}
                        role="button"
                        tabIndex={0}
                        style={{
                          padding: "18px 20px",
                          borderRadius: "16px",
                          background: isSelected
                            ? "linear-gradient(135deg, rgba(14, 165, 233, 0.16) 0%, rgba(15, 23, 42, 0.85) 100%)"
                            : "linear-gradient(180deg, rgba(30, 41, 59, 0.40) 0%, rgba(15, 23, 42, 0.65) 100%)",
                          border: isSelected
                            ? "2px solid #38BDF8"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          boxShadow: isSelected
                            ? "0 0 24px rgba(56, 189, 248, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                            : "none",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* TOP ROW: ICON + TAG + BADGE */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <div
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
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                letterSpacing: "0.06em",
                                color: style.tagColor,
                                background: `rgba(255, 255, 255, 0.04)`,
                                border: `1px solid ${style.tagColor}40`,
                                borderRadius: "6px",
                                padding: "2px 7px",
                              }}
                            >
                              {style.tag}
                            </span>
                            {isSelected && (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  color: "#38BDF8",
                                  background: "rgba(56, 189, 248, 0.20)",
                                  borderRadius: "6px",
                                  padding: "2px 6px",
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                        </div>

                        {/* MIDDLE: TITLE & DESC */}
                        <div>
                          <h4
                            style={{
                              fontSize: "1.02rem",
                              fontWeight: 800,
                              color: isSelected ? "#38BDF8" : "#F8FAFC",
                              margin: "0 0 4px 0",
                            }}
                          >
                            {style.label}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.78rem",
                              color: isSelected ? "#CBD5E1" : "#94A3B8",
                              lineHeight: 1.4,
                              margin: 0,
                            }}
                          >
                            {style.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. PRIMARY TRANSPORTATION MODE (BALANCED 3x2 GRID WITH LIVE FARES) */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div>
                    <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>
                      2. Primary Transportation Mode
                    </h4>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "2px 0 0 0" }}>
                      How will you and your travel group reach and navigate {destination || "the destination"}?
                    </p>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "#34D399", fontWeight: 600 }}>
                    Synchronized with Step 1
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {TRANSPORT_MODES.map((t) => {
                    const isSelected = transportationMode === t.id;

                    // Resolve live fare insight for this transport mode
                    let fareTag = "";
                    if (t.id === "Train") {
                      fareTag = transitPricing.train.available
                        ? `Sleeper ₹${transitPricing.train.sleeperMinFare.toLocaleString("en-IN")} • 3AC ₹${transitPricing.train.threeTierAcMin.toLocaleString("en-IN")}`
                        : "No direct rail line";
                    } else if (t.id === "Flight") {
                      fareTag = `From ~₹${transitPricing.flight.economyMinFare.toLocaleString("en-IN")}/person`;
                    } else if (t.id === "Car") {
                      fareTag = `Est. Fuel & Tolls: ~₹${transitPricing.car.fuelAndTollsApprox.toLocaleString("en-IN")}`;
                    } else if (t.id === "Bus") {
                      fareTag = transitPricing.bus.available
                        ? `From ₹${transitPricing.bus.nonAcMinFare.toLocaleString("en-IN")}`
                        : "Long distance route";
                    } else if (t.id === "Bike") {
                      fareTag = `~₹700/day local rental`;
                    } else if (t.id === "Cycling") {
                      fareTag = `Eco Score: 100/100`;
                    }

                    return (
                      <div
                        key={t.id}
                        onClick={() => setTransportationMode(t.id)}
                        role="button"
                        tabIndex={0}
                        style={{
                          padding: "18px 20px",
                          borderRadius: "16px",
                          background: isSelected
                            ? "linear-gradient(135deg, rgba(52, 211, 153, 0.16) 0%, rgba(15, 23, 42, 0.85) 100%)"
                            : "linear-gradient(180deg, rgba(30, 41, 59, 0.40) 0%, rgba(15, 23, 42, 0.65) 100%)",
                          border: isSelected
                            ? "2px solid #34D399"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          boxShadow: isSelected
                            ? "0 0 24px rgba(52, 211, 153, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                            : "none",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          position: "relative",
                        }}
                      >
                        {/* TOP ROW: ICON + TAG + BADGE */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              background: isSelected
                                ? "rgba(52, 211, 153, 0.20)"
                                : "rgba(255, 255, 255, 0.06)",
                              border: isSelected
                                ? "1px solid rgba(52, 211, 153, 0.40)"
                                : "1px solid rgba(255, 255, 255, 0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              flexShrink: 0,
                            }}
                          >
                            {t.icon}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                letterSpacing: "0.06em",
                                color: t.tagColor,
                                background: `rgba(255, 255, 255, 0.04)`,
                                border: `1px solid ${t.tagColor}40`,
                                borderRadius: "6px",
                                padding: "2px 7px",
                              }}
                            >
                              {t.tag}
                            </span>
                            {isSelected && (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  color: "#34D399",
                                  background: "rgba(52, 211, 153, 0.20)",
                                  borderRadius: "6px",
                                  padding: "2px 6px",
                                }}
                              >
                                ✓ Selected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* MIDDLE: TITLE & DESC */}
                        <div>
                          <h4
                            style={{
                              fontSize: "1.02rem",
                              fontWeight: 800,
                              color: isSelected ? "#34D399" : "#F8FAFC",
                              margin: "0 0 4px 0",
                            }}
                          >
                            {t.label}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.78rem",
                              color: isSelected ? "#CBD5E1" : "#94A3B8",
                              lineHeight: 1.4,
                              margin: "0 0 10px 0",
                            }}
                          >
                            {t.desc}
                          </p>
                        </div>

                        {/* BOTTOM: LIVE TICKET PRICING CHIP */}
                        <div
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            background: isSelected
                              ? "rgba(52, 211, 153, 0.12)"
                              : "rgba(255, 255, 255, 0.03)",
                            border: isSelected
                              ? "1px solid rgba(52, 211, 153, 0.25)"
                              : "1px solid rgba(255, 255, 255, 0.06)",
                            fontSize: "0.74rem",
                            fontWeight: 600,
                            color: isSelected ? "#34D399" : "#94A3B8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{fareTag}</span>
                          <span style={{ fontSize: "0.70rem", opacity: 0.8 }}>⚡ Real-time</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. BESPOKE LOGISTICS BOARDING PASS / TICKET BANNER */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.80) 100%)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: "18px",
                  padding: "20px 24px",
                  boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* TICKET TOP HEADER */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px dashed rgba(255, 255, 255, 0.12)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>
                      {transportationMode === "Train" ? "🚆" : transportationMode === "Flight" ? "✈️" : transportationMode === "Bus" ? "🚌" : transportationMode === "Bike" ? "🏍️" : "🚗"}
                    </span>
                    <span style={{ fontSize: "0.80rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#38BDF8" }}>
                      TRANSIT LOGISTICS BOARDING PASS
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399", display: "inline-block" }}></span>
                    <span style={{ fontSize: "0.72rem", color: "#34D399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      BUDGET & ROUTE INTEGRATED
                    </span>
                  </div>
                </div>

                {/* VISUAL JOURNEY ROUTE */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  {/* ORIGIN */}
                  <div style={{ minWidth: "140px" }}>
                    <div style={{ fontSize: "0.70rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                      DEPARTURE POINT
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF" }}>
                      {origin || "Starting City"}
                    </div>
                  </div>

                  {/* ROUTE LINE WITH ANIMATED ICON */}
                  <div style={{ flex: 1, minWidth: "180px", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 10px" }}>
                    <div style={{ fontSize: "0.74rem", color: "#38BDF8", fontWeight: 700, marginBottom: "4px" }}>
                      ~{transitPricing.distanceKm.toLocaleString("en-IN")} km ({transportationMode})
                    </div>
                    <div style={{ width: "100%", height: "2px", background: "linear-gradient(90deg, #38BDF8 0%, #34D399 50%, #38BDF8 100%)", position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          top: "-8px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "#0F172A",
                          borderRadius: "50%",
                          padding: "0 6px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {transportationMode === "Train" ? "🚆" : transportationMode === "Flight" ? "✈️" : transportationMode === "Bus" ? "🚌" : transportationMode === "Bike" ? "🏍️" : "🚗"}
                      </div>
                    </div>
                  </div>

                  {/* DESTINATION */}
                  <div style={{ minWidth: "140px", textAlign: "right" }}>
                    <div style={{ fontSize: "0.70rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                      ARRIVAL DESTINATION
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#34D399" }}>
                      {destination || "Destination"}
                    </div>
                  </div>
                </div>

                {/* BOTTOM FARE CHIPS */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", background: "rgba(0, 0, 0, 0.25)", borderRadius: "10px", padding: "10px 14px" }}>
                  <div style={{ fontSize: "0.80rem", color: "#CBD5E1" }}>
                    {transportationMode === "Train" && (
                      <span>IRCTC Sleeper: <b style={{ color: "#34D399" }}>₹{transitPricing.train.sleeperMinFare.toLocaleString("en-IN")}</b> · 3AC: <b style={{ color: "#38BDF8" }}>₹{transitPricing.train.threeTierAcMin.toLocaleString("en-IN")}</b> · Est. ~{transitPricing.train.approxDurationHours} hrs</span>
                    )}
                    {transportationMode === "Flight" && (
                      <span>Economy Air: <b style={{ color: "#38BDF8" }}>₹{transitPricing.flight.economyMinFare.toLocaleString("en-IN")}</b> / passenger · Est. ~{transitPricing.flight.approxDurationHours} hrs</span>
                    )}
                    {transportationMode === "Bus" && (
                      <span>Express Coach: <b style={{ color: "#A78BFA" }}>₹{transitPricing.bus.nonAcMinFare.toLocaleString("en-IN")}</b> · AC Sleeper: <b style={{ color: "#A78BFA" }}>₹{transitPricing.bus.acSleeperMinFare.toLocaleString("en-IN")}</b></span>
                    )}
                    {(transportationMode === "Car" || transportationMode === "Bike" || transportationMode === "Cycling") && (
                      <span>Highway Transit: <b style={{ color: "#F59E0B" }}>~₹{transitPricing.car.fuelAndTollsApprox.toLocaleString("en-IN")}</b> fuel/tolls · {transitPricing.car.drivingHours} hrs driving</span>
                    )}
                  </div>

                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#34D399" }}>
                    ✓ Auto-factored into Day 1 arrival schedule
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: STAY & INTERESTS */}
          {currentStep === 4 && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "28px" }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: "6px",
                  }}
                >
                  Accommodations & Specific Interests
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "0.92rem" }}>
                  Select what excites you most to fine-tune daily activities and
                  dining suggestions.
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "#CBD5E1",
                    marginBottom: "12px",
                  }}
                >
                  Preferred Accommodation
                </label>
                <div
                  className="grid-3-col"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  {ACCOMMODATIONS.map((acc) => {
                    const isSelected = preferredAccommodation === acc.id;
                    const isNoStay = acc.id === "NoStay";
                    return (
                      <div
                        key={acc.id}
                        onClick={() => setPreferredAccommodation(acc.id)}
                        style={{
                          padding: "14px",
                          borderRadius: "12px",
                          background: isSelected
                            ? isNoStay
                              ? "rgba(251, 146, 60, 0.15)"
                              : "rgba(14, 165, 233, 0.15)"
                            : "rgba(255, 255, 255, 0.04)",
                          border: isSelected
                            ? isNoStay
                              ? "1px solid #FB923C"
                              : "1px solid #38BDF8"
                            : isNoStay
                            ? "1px dashed rgba(251, 146, 60, 0.35)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "1.1rem" }}>{acc.icon}</span>
                          <h5
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color: isSelected
                                ? isNoStay ? "#FB923C" : "#38BDF8"
                                : "#FFFFFF",
                            }}
                          >
                            {acc.label}
                          </h5>
                        </div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: isNoStay ? "#94A3B8" : "#94A3B8",
                            marginTop: "2px",
                          }}
                        >
                          {acc.desc}
                        </p>
                        {isNoStay && (
                          <p style={{ fontSize: "0.68rem", color: "#FB923C", marginTop: "4px", fontStyle: "italic" }}>
                            💡 Budget will exclude hotel costs
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      margin: 0,
                    }}
                  >
                    Activity & Interest Focus{" "}
                    {destination ? (
                      <span style={{ color: "#38BDF8" }}>for {destination}</span>
                    ) : null}{" "}
                    {selectedInterests.length > 0 ? (
                      <span style={{ color: "#34D399", fontSize: "0.82rem" }}>
                        ({selectedInterests.length} selected)
                      </span>
                    ) : (
                      <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: "0.82rem" }}>
                        (Pick focus points or add your own)
                      </span>
                    )}
                  </label>

                  <Badge variant="overlay" size="sm">
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#38BDF8",
                        display: "inline-block",
                        marginRight: "6px",
                        boxShadow: "0 0 6px #38BDF8",
                      }}
                    />
                    {focusSource === "google_ideas"
                      ? "Google Ideas & Verified Intelligence"
                      : focusSource === "dataset"
                      ? "Tourism Dataset Focus Points"
                      : "Dynamic Focus Intelligence"}
                  </Badge>
                </div>

                <div
                  className="grid-3-col-focus"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "10px",
                  }}
                >
                  {[...focusPoints, ...customInterestsList].map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    const isCustom = customInterestsList.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        style={{
                          width: "100%",
                          minHeight: "44px",
                          padding: "10px 14px",
                          borderRadius: "999px",
                          background: isSelected
                            ? "linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(20, 184, 166, 0.35))"
                            : "rgba(255, 255, 255, 0.05)",
                          border: isSelected
                            ? "1px solid #38BDF8"
                            : "1px solid rgba(255, 255, 255, 0.12)",
                          color: isSelected ? "#FFFFFF" : "#CBD5E1",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: "6px",
                          transition: "all 0.2s ease",
                          boxShadow: isSelected
                            ? "0 0 14px rgba(14, 165, 233, 0.25)"
                            : "none",
                        }}
                      >
                        {isSelected ? (
                          <Check size={14} color="#38BDF8" style={{ flexShrink: 0 }} />
                        ) : (
                          <Sparkles size={12} color="rgba(255, 255, 255, 0.35)" style={{ flexShrink: 0 }} />
                        )}
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={tag}
                        >
                          {tag}
                        </span>
                        {isCustom && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomInterestsList((prev) =>
                                prev.filter((t) => t !== tag),
                              );
                              setSelectedInterests((prev) =>
                                prev.filter((t) => t !== tag),
                              );
                            }}
                            style={{
                              marginLeft: "4px",
                              color: "#94A3B8",
                              fontSize: "1rem",
                              lineHeight: 1,
                              padding: "0 2px",
                              flexShrink: 0,
                            }}
                            title="Remove custom idea"
                          >
                            ×
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ADD USER'S OWN IDEAS INPUT */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = customInterestInput.trim();
                    if (trimmed) {
                      if (
                        !customInterestsList.includes(trimmed) &&
                        !focusPoints.includes(trimmed)
                      ) {
                        setCustomInterestsList((prev) => [...prev, trimmed]);
                      }
                      if (!selectedInterests.includes(trimmed)) {
                        setSelectedInterests((prev) => [...prev, trimmed]);
                      }
                      setCustomInterestInput("");
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "14px",
                    maxWidth: "460px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "999px",
                      padding: "6px 14px",
                    }}
                  >
                    <Sparkles size={14} color="#38BDF8" />
                    <input
                      type="text"
                      value={customInterestInput}
                      onChange={(e) => setCustomInterestInput(e.target.value)}
                      placeholder="Add your own ideas (e.g. Campfire, Scuba, Stargazing)..."
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#FFFFFF",
                        fontSize: "0.82rem",
                        width: "100%",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!customInterestInput.trim()}
                    style={{
                      background: customInterestInput.trim()
                        ? "linear-gradient(135deg, #0EA5E9, #14B8A6)"
                        : "rgba(255, 255, 255, 0.06)",
                      color: customInterestInput.trim() ? "#FFFFFF" : "#64748B",
                      border: "none",
                      borderRadius: "999px",
                      padding: "8px 16px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: customInterestInput.trim()
                        ? "pointer"
                        : "default",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                  >
                    + Add Idea
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* NAVIGATION & ACTION FOOTER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "24px",
              marginTop: "32px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight size={16} />}
                  onClick={() => {
                    if (currentStep === 1 && !destination.trim()) {
                      setError("Please enter a destination to proceed.");
                      return;
                    }
                    setError("");
                    setCurrentStep(currentStep + 1);
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  leftIcon={<Sparkles size={18} />}
                  onClick={() => handleGenerateTrip()}
                >
                  Generate AI Itinerary
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div
          className="page-container"
          style={{ textAlign: "center", padding: "100px 20px" }}
        >
          <div
            style={{
              color: "var(--tg-primary)",
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Loading Planner...
          </div>
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
