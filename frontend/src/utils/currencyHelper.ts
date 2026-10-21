/**
 * Multi-Currency Engine for Trip Geni
 * Supports automatic country currency detection, dynamic exchange rates,
 * dual currency display (Local Currency + INR), and user currency selection.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateToInr: number; // 1 Foreign Unit = X INR
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", rateToInr: 1, name: "Indian Rupee", flag: "🇮🇳" },
  USD: { code: "USD", symbol: "$", rateToInr: 84.5, name: "US Dollar", flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", rateToInr: 91.8, name: "Euro", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", rateToInr: 108.5, name: "British Pound", flag: "🇬🇧" },
  AED: { code: "AED", symbol: "AED", rateToInr: 23.0, name: "UAE Dirham", flag: "🇦🇪" },
  JPY: { code: "JPY", symbol: "¥", rateToInr: 0.56, name: "Japanese Yen", flag: "🇯🇵" },
  SGD: { code: "SGD", symbol: "S$", rateToInr: 63.8, name: "Singapore Dollar", flag: "🇸🇬" },
  THB: { code: "THB", symbol: "฿", rateToInr: 2.38, name: "Thai Baht", flag: "🇹🇭" },
  CHF: { code: "CHF", symbol: "CHF", rateToInr: 95.2, name: "Swiss Franc", flag: "🇨🇭" },
  AUD: { code: "AUD", symbol: "A$", rateToInr: 55.4, name: "Australian Dollar", flag: "🇦🇺" },
  CAD: { code: "CAD", symbol: "C$", rateToInr: 61.8, name: "Canadian Dollar", flag: "🇨🇦" },
  IDR: { code: "IDR", symbol: "Rp", rateToInr: 0.0053, name: "Indonesian Rupiah", flag: "🇮🇩" },
  MYR: { code: "MYR", symbol: "RM", rateToInr: 19.2, name: "Malaysian Ringgit", flag: "🇲🇾" },
};

/**
 * Detects destination local currency based on destination string
 */
export function detectDestinationCurrency(destination?: string): CurrencyConfig {
  if (!destination) return SUPPORTED_CURRENCIES.INR;
  const d = destination.toLowerCase().trim();

  // USA
  if (/usa|united states|america|new york|nyc|california|los angeles|san francisco|las vegas|miami|florida|orlando|chicago|hawaii|seattle|boston|washington/i.test(d)) {
    return SUPPORTED_CURRENCIES.USD;
  }
  // UK
  if (/uk|united kingdom|london|england|scotland|edinburgh|manchester|birmingham|oxford/i.test(d)) {
    return SUPPORTED_CURRENCIES.GBP;
  }
  // Europe (EUR)
  if (/france|paris|nice|italy|rome|milan|venice|florence|naples|spain|barcelona|madrid|ibiza|germany|berlin|munich|frankfurt|netherlands|amsterdam|greece|athens|santorini|mykonos|austria|vienna|portugal|lisbon|porto|belgium|brussels|ireland|dublin/i.test(d)) {
    return SUPPORTED_CURRENCIES.EUR;
  }
  // UAE
  if (/dubai|uae|abu dhabi|sharjah|emirates/i.test(d)) {
    return SUPPORTED_CURRENCIES.AED;
  }
  // Japan
  if (/japan|tokyo|kyoto|osaka|hokkaido|fukuoka/i.test(d)) {
    return SUPPORTED_CURRENCIES.JPY;
  }
  // Singapore
  if (/singapore/i.test(d)) {
    return SUPPORTED_CURRENCIES.SGD;
  }
  // Thailand
  if (/thailand|bangkok|phuket|krabi|pattaya|chiang mai/i.test(d)) {
    return SUPPORTED_CURRENCIES.THB;
  }
  // Switzerland
  if (/switzerland|swiss|zurich|geneva|interlaken|lucerne/i.test(d)) {
    return SUPPORTED_CURRENCIES.CHF;
  }
  // Australia
  if (/australia|sydney|melbourne|brisbane|perth|gold coast/i.test(d)) {
    return SUPPORTED_CURRENCIES.AUD;
  }
  // Canada
  if (/canada|toronto|vancouver|montreal|calgary|quebec/i.test(d)) {
    return SUPPORTED_CURRENCIES.CAD;
  }
  // Indonesia / Bali
  if (/bali|indonesia|jakarta|lombok|ubud/i.test(d)) {
    return SUPPORTED_CURRENCIES.IDR;
  }
  // Malaysia
  if (/malaysia|kuala lumpur|penang|langkawi/i.test(d)) {
    return SUPPORTED_CURRENCIES.MYR;
  }

  // Default to INR
  return SUPPORTED_CURRENCIES.INR;
}

/**
 * Formats an amount in INR to target currency
 */
export function formatCurrencyAmount(
  amountInInr: number,
  targetCurrencyCode: string
): { formatted: string; raw: number; symbol: string; inrFormatted: string } {
  const inrVal = Math.max(0, Math.round(amountInInr));
  const inrFormatted = `₹${inrVal.toLocaleString("en-IN")}`;

  const cfg = SUPPORTED_CURRENCIES[targetCurrencyCode] || SUPPORTED_CURRENCIES.INR;
  if (cfg.code === "INR") {
    return {
      formatted: inrFormatted,
      raw: inrVal,
      symbol: "₹",
      inrFormatted,
    };
  }

  // Convert INR to foreign currency
  const converted = Math.round(inrVal / cfg.rateToInr);
  const formatted = `${cfg.symbol}${converted.toLocaleString("en-US")}`;

  return {
    formatted,
    raw: converted,
    symbol: cfg.symbol,
    inrFormatted,
  };
}
