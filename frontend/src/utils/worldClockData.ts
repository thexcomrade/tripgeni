/**
 * World Clock & Timezone Intelligence Engine
 * Comprehensive searchable dataset of global cities, IANA timezones, and accurate UTC offset calculators.
 */

export interface WorldCity {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  iana: string;
  region: "Asia" | "Europe" | "North America" | "South America" | "Middle East" | "Oceania" | "Africa";
}

export interface ClockTimeDetails {
  hours: string;
  minutes: string;
  seconds: string;
  ampm: string;
  timeString: string;
  dateString: string;
  dayName: string;
  utcOffset: string;
  timezoneAbbr: string;
  isDaytime: boolean;
  dayDifference: number; // -1 for yesterday, 0 for today, +1 for tomorrow
  dayDifferenceBadge: "-1 day" | "+1 day" | null;
}

// Authoritative searchable dataset of major travel hubs and global cities across all continents
export const GLOBAL_CITIES_DATASET: WorldCity[] = [
  // India & South Asia
  { id: "klm_in", city: "Kollam", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "del_in", city: "New Delhi", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "bom_in", city: "Mumbai", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "blr_in", city: "Bengaluru", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "cok_in", city: "Kochi", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "maa_in", city: "Chennai", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "ccu_in", city: "Kolkata", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "hyd_in", city: "Hyderabad", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "vns_in", city: "Varanasi", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "jpr_in", city: "Jaipur", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "cmb_lk", city: "Colombo", country: "Sri Lanka", countryCode: "LK", flag: "🇱🇰", iana: "Asia/Colombo", region: "Asia" },
  { id: "ktm_np", city: "Kathmandu", country: "Nepal", countryCode: "NP", flag: "🇳🇵", iana: "Asia/Kathmandu", region: "Asia" },
  { id: "mle_mv", city: "Malé", country: "Maldives", countryCode: "MV", flag: "🇲🇻", iana: "Indian/Maldives", region: "Asia" },

  // United Kingdom & Western Europe
  { id: "lon_gb", city: "London", country: "United Kingdom", countryCode: "GB", flag: "🇬🇧", iana: "Europe/London", region: "Europe" },
  { id: "edi_gb", city: "Edinburgh", country: "United Kingdom", countryCode: "GB", flag: "🇬🇧", iana: "Europe/London", region: "Europe" },
  { id: "man_gb", city: "Manchester", country: "United Kingdom", countryCode: "GB", flag: "🇬🇧", iana: "Europe/London", region: "Europe" },
  { id: "dub_ie", city: "Dublin", country: "Ireland", countryCode: "IE", flag: "🇮🇪", iana: "Europe/Dublin", region: "Europe" },
  { id: "par_fr", city: "Paris", country: "France", countryCode: "FR", flag: "🇫🇷", iana: "Europe/Paris", region: "Europe" },
  { id: "nic_fr", city: "Nice", country: "France", countryCode: "FR", flag: "🇫🇷", iana: "Europe/Paris", region: "Europe" },
  { id: "ber_de", city: "Berlin", country: "Germany", countryCode: "DE", flag: "🇩🇪", iana: "Europe/Berlin", region: "Europe" },
  { id: "muc_de", city: "Munich", country: "Germany", countryCode: "DE", flag: "🇩🇪", iana: "Europe/Berlin", region: "Europe" },
  { id: "fra_de", city: "Frankfurt", country: "Germany", countryCode: "DE", flag: "🇩🇪", iana: "Europe/Berlin", region: "Europe" },
  { id: "rom_it", city: "Rome", country: "Italy", countryCode: "IT", flag: "🇮🇹", iana: "Europe/Rome", region: "Europe" },
  { id: "mil_it", city: "Milan", country: "Italy", countryCode: "IT", flag: "🇮🇹", iana: "Europe/Rome", region: "Europe" },
  { id: "vce_it", city: "Venice", country: "Italy", countryCode: "IT", flag: "🇮🇹", iana: "Europe/Rome", region: "Europe" },
  { id: "mad_es", city: "Madrid", country: "Spain", countryCode: "ES", flag: "🇪🇸", iana: "Europe/Madrid", region: "Europe" },
  { id: "bcn_es", city: "Barcelona", country: "Spain", countryCode: "ES", flag: "🇪🇸", iana: "Europe/Madrid", region: "Europe" },
  { id: "ams_nl", city: "Amsterdam", country: "Netherlands", countryCode: "NL", flag: "🇳🇱", iana: "Europe/Amsterdam", region: "Europe" },
  { id: "bru_be", city: "Brussels", country: "Belgium", countryCode: "BE", flag: "🇧🇪", iana: "Europe/Brussels", region: "Europe" },
  { id: "vie_at", city: "Vienna", country: "Austria", countryCode: "AT", flag: "🇦🇹", iana: "Europe/Vienna", region: "Europe" },
  { id: "zrh_ch", city: "Zurich", country: "Switzerland", countryCode: "CH", flag: "🇨🇭", iana: "Europe/Zurich", region: "Europe" },
  { id: "gva_ch", city: "Geneva", country: "Switzerland", countryCode: "CH", flag: "🇨🇭", iana: "Europe/Zurich", region: "Europe" },
  { id: "lis_pt", city: "Lisbon", country: "Portugal", countryCode: "PT", flag: "🇵🇹", iana: "Europe/Lisbon", region: "Europe" },

  // Central & Northern / Eastern Europe
  { id: "waw_pl", city: "Warsaw", country: "Poland", countryCode: "PL", flag: "🇵🇱", iana: "Europe/Warsaw", region: "Europe" },
  { id: "prg_cz", city: "Prague", country: "Czech Republic", countryCode: "CZ", flag: "🇨🇿", iana: "Europe/Prague", region: "Europe" },
  { id: "bud_hu", city: "Budapest", country: "Hungary", countryCode: "HU", flag: "🇭🇺", iana: "Europe/Budapest", region: "Europe" },
  { id: "ath_gr", city: "Athens", country: "Greece", countryCode: "GR", flag: "🇬🇷", iana: "Europe/Athens", region: "Europe" },
  { id: "ist_tr", city: "Istanbul", country: "Turkey", countryCode: "TR", flag: "🇹🇷", iana: "Europe/Istanbul", region: "Europe" },
  { id: "cph_dk", city: "Copenhagen", country: "Denmark", countryCode: "DK", flag: "🇩🇰", iana: "Europe/Copenhagen", region: "Europe" },
  { id: "sto_se", city: "Stockholm", country: "Sweden", countryCode: "SE", flag: "🇸🇪", iana: "Europe/Stockholm", region: "Europe" },
  { id: "osl_no", city: "Oslo", country: "Norway", countryCode: "NO", flag: "🇳🇴", iana: "Europe/Oslo", region: "Europe" },
  { id: "hel_fi", city: "Helsinki", country: "Finland", countryCode: "FI", flag: "🇫🇮", iana: "Europe/Helsinki", region: "Europe" },
  { id: "rjk_is", city: "Reykjavik", country: "Iceland", countryCode: "IS", flag: "🇮🇸", iana: "Atlantic/Reykjavik", region: "Europe" },

  // East & Southeast Asia
  { id: "tyo_jp", city: "Tokyo", country: "Japan", countryCode: "JP", flag: "🇯🇵", iana: "Asia/Tokyo", region: "Asia" },
  { id: "osa_jp", city: "Osaka", country: "Japan", countryCode: "JP", flag: "🇯🇵", iana: "Asia/Tokyo", region: "Asia" },
  { id: "kyo_jp", city: "Kyoto", country: "Japan", countryCode: "JP", flag: "🇯🇵", iana: "Asia/Tokyo", region: "Asia" },
  { id: "sel_kr", city: "Seoul", country: "South Korea", countryCode: "KR", flag: "🇰🇷", iana: "Asia/Seoul", region: "Asia" },
  { id: "hkg_hk", city: "Hong Kong", country: "Hong Kong", countryCode: "HK", flag: "🇭🇰", iana: "Asia/Hong_Kong", region: "Asia" },
  { id: "sgp_sg", city: "Singapore", country: "Singapore", countryCode: "SG", flag: "🇸🇬", iana: "Asia/Singapore", region: "Asia" },
  { id: "bkk_th", city: "Bangkok", country: "Thailand", countryCode: "TH", flag: "🇹🇭", iana: "Asia/Bangkok", region: "Asia" },
  { id: "hkt_th", city: "Phuket", country: "Thailand", countryCode: "TH", flag: "🇹🇭", iana: "Asia/Bangkok", region: "Asia" },
  { id: "kul_my", city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", flag: "🇲🇾", iana: "Asia/Kuala_Lumpur", region: "Asia" },
  { id: "dps_id", city: "Bali (Denpasar)", country: "Indonesia", countryCode: "ID", flag: "🇮🇩", iana: "Asia/Makassar", region: "Asia" },
  { id: "jkt_id", city: "Jakarta", country: "Indonesia", countryCode: "ID", flag: "🇮🇩", iana: "Asia/Jakarta", region: "Asia" },
  { id: "han_vn", city: "Hanoi", country: "Vietnam", countryCode: "VN", flag: "🇻🇳", iana: "Asia/Ho_Chi_Minh", region: "Asia" },
  { id: "sgn_vn", city: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", flag: "🇻🇳", iana: "Asia/Ho_Chi_Minh", region: "Asia" },
  { id: "mnl_ph", city: "Manila", country: "Philippines", countryCode: "PH", flag: "🇵🇭", iana: "Asia/Manila", region: "Asia" },
  { id: "tpe_tw", city: "Taipei", country: "Taiwan", countryCode: "TW", flag: "🇹🇼", iana: "Asia/Taipei", region: "Asia" },
  { id: "sha_cn", city: "Shanghai", country: "China", countryCode: "CN", flag: "🇨🇳", iana: "Asia/Shanghai", region: "Asia" },
  { id: "bjs_cn", city: "Beijing", country: "China", countryCode: "CN", flag: "🇨🇳", iana: "Asia/Shanghai", region: "Asia" },

  // Middle East
  { id: "dxb_ae", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", flag: "🇦🇪", iana: "Asia/Dubai", region: "Middle East" },
  { id: "auh_ae", city: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", flag: "🇦🇪", iana: "Asia/Dubai", region: "Middle East" },
  { id: "doh_qa", city: "Doha", country: "Qatar", countryCode: "QA", flag: "🇶🇦", iana: "Asia/Qatar", region: "Middle East" },
  { id: "ruh_sa", city: "Riyadh", country: "Saudi Arabia", countryCode: "SA", flag: "🇸🇦", iana: "Asia/Riyadh", region: "Middle East" },
  { id: "jed_sa", city: "Jeddah", country: "Saudi Arabia", countryCode: "SA", flag: "🇸🇦", iana: "Asia/Riyadh", region: "Middle East" },
  { id: "mct_om", city: "Muscat", country: "Oman", countryCode: "OM", flag: "🇴🇲", iana: "Asia/Muscat", region: "Middle East" },
  { id: "bah_bh", city: "Manama", country: "Bahrain", countryCode: "BH", flag: "🇧🇭", iana: "Asia/Bahrain", region: "Middle East" },
  { id: "kwi_kw", city: "Kuwait City", country: "Kuwait", countryCode: "KW", flag: "🇰🇼", iana: "Asia/Kuwait", region: "Middle East" },
  { id: "amm_jo", city: "Amman", country: "Jordan", countryCode: "JO", flag: "🇯🇴", iana: "Asia/Amman", region: "Middle East" },

  // North America (US Timezones)
  { id: "nyc_us", city: "New York", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/New_York", region: "North America" },
  { id: "bos_us", city: "Boston", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/New_York", region: "North America" },
  { id: "mia_us", city: "Miami", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/New_York", region: "North America" },
  { id: "was_us", city: "Washington D.C.", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/New_York", region: "North America" },
  { id: "chi_us", city: "Chicago", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Chicago", region: "North America" },
  { id: "dfw_us", city: "Dallas", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Chicago", region: "North America" },
  { id: "den_us", city: "Denver", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Denver", region: "North America" },
  { id: "phx_us", city: "Phoenix", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Phoenix", region: "North America" },
  { id: "lax_us", city: "Los Angeles", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Los_Angeles", region: "North America" },
  { id: "sfo_us", city: "San Francisco", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Los_Angeles", region: "North America" },
  { id: "sea_us", city: "Seattle", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Los_Angeles", region: "North America" },
  { id: "las_us", city: "Las Vegas", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Los_Angeles", region: "North America" },
  { id: "hnl_us", city: "Honolulu", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "Pacific/Honolulu", region: "North America" },
  { id: "anc_us", city: "Anchorage", country: "United States", countryCode: "US", flag: "🇺🇸", iana: "America/Anchorage", region: "North America" },

  // Canada & Latin America
  { id: "yto_ca", city: "Toronto", country: "Canada", countryCode: "CA", flag: "🇨🇦", iana: "America/Toronto", region: "North America" },
  { id: "yvr_ca", city: "Vancouver", country: "Canada", countryCode: "CA", flag: "🇨🇦", iana: "America/Vancouver", region: "North America" },
  { id: "ymq_ca", city: "Montreal", country: "Canada", countryCode: "CA", flag: "🇨🇦", iana: "America/Toronto", region: "North America" },
  { id: "yyc_ca", city: "Calgary", country: "Canada", countryCode: "CA", flag: "🇨🇦", iana: "America/Edmonton", region: "North America" },
  { id: "mex_mx", city: "Mexico City", country: "Mexico", countryCode: "MX", flag: "🇲🇽", iana: "America/Mexico_City", region: "North America" },
  { id: "sao_br", city: "São Paulo", country: "Brazil", countryCode: "BR", flag: "🇧🇷", iana: "America/Sao_Paulo", region: "South America" },
  { id: "rio_br", city: "Rio de Janeiro", country: "Brazil", countryCode: "BR", flag: "🇧🇷", iana: "America/Sao_Paulo", region: "South America" },
  { id: "bue_ar", city: "Buenos Aires", country: "Argentina", countryCode: "AR", flag: "🇦🇷", iana: "America/Argentina/Buenos_Aires", region: "South America" },
  { id: "scl_cl", city: "Santiago", country: "Chile", countryCode: "CL", flag: "🇨🇱", iana: "America/Santiago", region: "South America" },
  { id: "bog_co", city: "Bogotá", country: "Colombia", countryCode: "CO", flag: "🇨🇴", iana: "America/Bogota", region: "South America" },
  { id: "lim_pe", city: "Lima", country: "Peru", countryCode: "PE", flag: "🇵🇪", iana: "America/Lima", region: "South America" },

  // Australia & New Zealand (Oceania)
  { id: "syd_au", city: "Sydney", country: "Australia", countryCode: "AU", flag: "🇦🇺", iana: "Australia/Sydney", region: "Oceania" },
  { id: "mel_au", city: "Melbourne", country: "Australia", countryCode: "AU", flag: "🇦🇺", iana: "Australia/Melbourne", region: "Oceania" },
  { id: "bne_au", city: "Brisbane", country: "Australia", countryCode: "AU", flag: "🇦🇺", iana: "Australia/Brisbane", region: "Oceania" },
  { id: "per_au", city: "Perth", country: "Australia", countryCode: "AU", flag: "🇦🇺", iana: "Australia/Perth", region: "Oceania" },
  { id: "adl_au", city: "Adelaide", country: "Australia", countryCode: "AU", flag: "🇦🇺", iana: "Australia/Adelaide", region: "Oceania" },
  { id: "akl_nz", city: "Auckland", country: "New Zealand", countryCode: "NZ", flag: "🇳🇿", iana: "Pacific/Auckland", region: "Oceania" },
  { id: "wlg_nz", city: "Wellington", country: "New Zealand", countryCode: "NZ", flag: "🇳🇿", iana: "Pacific/Auckland", region: "Oceania" },

  // Africa
  { id: "cai_eg", city: "Cairo", country: "Egypt", countryCode: "EG", flag: "🇪🇬", iana: "Africa/Cairo", region: "Africa" },
  { id: "jnb_za", city: "Johannesburg", country: "South Africa", countryCode: "ZA", flag: "🇿🇦", iana: "Africa/Johannesburg", region: "Africa" },
  { id: "cpt_za", city: "Cape Town", country: "South Africa", countryCode: "ZA", flag: "🇿🇦", iana: "Africa/Johannesburg", region: "Africa" },
  { id: "nbo_ke", city: "Nairobi", country: "Kenya", countryCode: "KE", flag: "🇰🇪", iana: "Africa/Nairobi", region: "Africa" },
  { id: "cas_ma", city: "Casablanca", country: "Morocco", countryCode: "MA", flag: "🇲🇦", iana: "Africa/Casablanca", region: "Africa" },
];

/**
 * Calculates accurate UTC offset string (e.g. "UTC +05:30", "UTC -05:00")
 * using standard Intl API without hardcoding or manual tables.
 */
export function calculateUtcOffset(ianaTimezone: string, date: Date = new Date()): string {
  try {
    // Format date in UTC and in Target Timezone to determine true offset in minutes
    const utcDateStr = date.toLocaleString("en-US", { timeZone: "UTC", hour12: false });
    const targetDateStr = date.toLocaleString("en-US", { timeZone: ianaTimezone, hour12: false });

    const utcTime = new Date(utcDateStr).getTime();
    const targetTime = new Date(targetDateStr).getTime();
    const diffMinutes = Math.round((targetTime - utcTime) / (1000 * 60));

    const sign = diffMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(diffMinutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    return `UTC ${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  } catch {
    return "UTC +00:00";
  }
}

/**
 * Formats timezone abbreviation (e.g. IST, GMT, JST, EST, GST)
 */
export function getTimezoneAbbreviation(ianaTimezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart ? tzPart.value : "GMT";
  } catch {
    return "GMT";
  }
}

/**
 * Extracts complete, formatted time details for any IANA timezone relative to device local time
 */
export function getClockTimeDetails(
  ianaTimezone: string,
  referenceDate: Date = new Date(),
  localReferenceDate: Date = new Date()
): ClockTimeDetails {
  try {
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const parts = timeFormatter.formatToParts(referenceDate);

    const hPart = parts.find((p) => p.type === "hour")?.value || "12";
    const mPart = parts.find((p) => p.type === "minute")?.value || "00";
    const sPart = parts.find((p) => p.type === "second")?.value || "00";
    const dayPeriodPart = parts.find((p) => p.type === "dayPeriod")?.value?.toUpperCase() || "AM";

    // 24-hour check for daytime status
    const hour24Formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      hour: "numeric",
      hour12: false,
    });
    const hour24 = parseInt(hour24Formatter.format(referenceDate), 10);
    const isDaytime = hour24 >= 6 && hour24 < 18;

    // Full Date & Day Name
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedDate = dateFormatter.format(referenceDate);

    const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      weekday: "long",
    });
    const dayName = weekdayFormatter.format(referenceDate);

    // Calculate relative day boundary (-1 day, +1 day, or same day)
    // Compare YYYY-MM-DD in target timezone vs YYYY-MM-DD in user's local timezone
    const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: ianaTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const localYmdFormatter = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const targetYmd = ymdFormatter.format(referenceDate); // e.g. "2026-11-01"
    const localYmd = localYmdFormatter.format(localReferenceDate);

    let dayDifference = 0;
    let dayDifferenceBadge: "-1 day" | "+1 day" | null = null;

    if (targetYmd < localYmd) {
      dayDifference = -1;
      dayDifferenceBadge = "-1 day";
    } else if (targetYmd > localYmd) {
      dayDifference = 1;
      dayDifferenceBadge = "+1 day";
    }

    const utcOffset = calculateUtcOffset(ianaTimezone, referenceDate);
    const timezoneAbbr = getTimezoneAbbreviation(ianaTimezone, referenceDate);

    return {
      hours: hPart,
      minutes: mPart,
      seconds: sPart,
      ampm: dayPeriodPart,
      timeString: `${hPart} : ${mPart} : ${sPart} ${dayPeriodPart}`,
      dateString: formattedDate,
      dayName,
      utcOffset,
      timezoneAbbr,
      isDaytime,
      dayDifference,
      dayDifferenceBadge,
    };
  } catch (err) {
    console.warn("Timezone calculation fallback:", err);
    return {
      hours: "12",
      minutes: "00",
      seconds: "00",
      ampm: "PM",
      timeString: "12 : 00 : 00 PM",
      dateString: referenceDate.toDateString(),
      dayName: "Sunday",
      utcOffset: "UTC +00:00",
      timezoneAbbr: "UTC",
      isDaytime: true,
      dayDifference: 0,
      dayDifferenceBadge: null,
    };
  }
}

/**
 * Detects the user's actual local device location and timezone
 */
export function getLocalDeviceCity(): WorldCity {
  const localIana =
    typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Asia/Kolkata";

  // Check if our dataset has a city matching this exact IANA timezone
  const matched = GLOBAL_CITIES_DATASET.find((c) => c.iana === localIana);
  if (matched) {
    return matched;
  }

  // Extract human-readable city from IANA (e.g. "Asia/Kolkata" -> "Kolkata")
  const parts = localIana.split("/");
  const cityName = parts[parts.length - 1].replace(/_/g, " ");

  return {
    id: "device_local",
    city: cityName,
    country: "Local Location",
    countryCode: "LOC",
    flag: "📍",
    iana: localIana,
    region: "Asia",
  };
}

/**
 * Default saved clocks matching the user's reference visual specification (media_1793514197789_a9d75044.png)
 */
export const DEFAULT_SAVED_CLOCKS: WorldCity[] = [
  { id: "klm_in", city: "Kollam", country: "India", countryCode: "IN", flag: "🇮🇳", iana: "Asia/Kolkata", region: "Asia" },
  { id: "lon_gb", city: "London", country: "UK", countryCode: "GB", flag: "🇬🇧", iana: "Europe/London", region: "Europe" },
  { id: "tyo_jp", city: "Tokyo", country: "Japan", countryCode: "JP", flag: "🇯🇵", iana: "Asia/Tokyo", region: "Asia" },
  { id: "nyc_us", city: "New York", country: "USA", countryCode: "US", flag: "🇺🇸", iana: "America/New_York", region: "North America" },
];

const STORAGE_KEY = "tripgenius_saved_world_clocks";

export function loadSavedClocks(): WorldCity[] {
  if (typeof window === "undefined") return DEFAULT_SAVED_CLOCKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.debug("Saved clocks load note:", err);
  }
  return DEFAULT_SAVED_CLOCKS;
}

export function saveClocksToStorage(clocks: WorldCity[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clocks));
  } catch (err) {
    console.debug("Saved clocks persistence note:", err);
  }
}
