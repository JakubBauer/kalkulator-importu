"use client";
import React, { useEffect, useMemo, useState } from "react";

// ================= PORTY USA =================
const PORTS = {
  NJ: { name: "Port Newark / NJ", lat: 40.6887, lon: -74.1482, ocean: 900 },
  GA: { name: "Port Savannah / GA", lat: 32.0835, lon: -81.0971, ocean: 900 },
  TX: { name: "Port Houston / TX", lat: 29.7323, lon: -95.262, ocean: 975 },
  LA: { name: "Port Los Angeles / CA", lat: 33.7326, lon: -118.2737, ocean: 1500 },
} as const;

type PortKey = keyof typeof PORTS;
type AuctionHouse = "copart" | "iaai";
type BuyerType = "private" | "company";
type VehicleSize = "sedan" | "suv" | "bigsuv" | "oversize";

// ================= MNOŻNIKI WIELKOŚCI AUTA =================
const SIZE_MULTIPLIERS: Record<VehicleSize, number> = {
  sedan: 1,
  suv: 1.2,
  bigsuv: 1.5,
  oversize: 2,
};

// Mnożnik transportu lądowego (różny od morskiego)
const INLAND_SIZE_MULTIPLIERS: Record<VehicleSize, number> = {
  sedan: 1,
  suv: 1.2,
  bigsuv: 1.5,
  oversize: 1.8,
};

// ================= PLACE (COPART / IAAI) =================
// Autocomplete działa TYLKO na bazie tej listy i jest filtrowany wg wybranego domu aukcyjnego.
// Na tę chwilę dodałem place Copart z Twojej listy (USA). IAAI dopiszemy analogicznie.

type Yard = {
  provider: AuctionHouse;
  state: string;
  city: string;
  label?: string;
  zip: string;
};

const YARDS_USA: Yard[] = [
  // ===== COPART (USA) — z Twojej listy =====
  { provider: "copart", state: "AL", city: "BIRMINGHAM", label: "Standard", zip: "35023" },
  { provider: "copart", state: "AL", city: "DOTHAN", label: "Standard", zip: "36352" },
  { provider: "copart", state: "AL", city: "MOBILE", label: "Standard", zip: "36613" },
  { provider: "copart", state: "AL", city: "MOBILE SOUTH", label: "Standard", zip: "36582" },
  { provider: "copart", state: "AL", city: "MONTGOMERY", label: "Standard", zip: "36116" },
  { provider: "copart", state: "AL", city: "TANNER", label: "Standard", zip: "35671" },

  { provider: "copart", state: "AK", city: "ANCHORAGE", label: "Standard", zip: "99501" },

  { provider: "copart", state: "AZ", city: "PHOENIX", label: "Standard", zip: "85043" },
  { provider: "copart", state: "AZ", city: "PHOENIX NORTH", label: "Standard", zip: "85085" },
  { provider: "copart", state: "AZ", city: "TUCSON", label: "Standard", zip: "85706" },

  { provider: "copart", state: "AR", city: "FAYETTEVILLE", label: "Standard", zip: "72753" },
  { provider: "copart", state: "AR", city: "LITTLE ROCK", label: "Standard", zip: "72032" },

  { provider: "copart", state: "CA", city: "ADELANTO", label: "Standard", zip: "92301" },
  { provider: "copart", state: "CA", city: "ANTELOPE", label: "Standard", zip: "95843" },
  { provider: "copart", state: "CA", city: "BAKERSFIELD", label: "Standard", zip: "93307" },
  { provider: "copart", state: "CA", city: "FRESNO", label: "Standard", zip: "93725" },
  { provider: "copart", state: "CA", city: "HAYWARD", label: "Standard", zip: "94545" },
  { provider: "copart", state: "CA", city: "LONG BEACH", label: "Standard", zip: "90744" },
  { provider: "copart", state: "CA", city: "LOS ANGELES", label: "Standard", zip: "90001" },
  { provider: "copart", state: "CA", city: "MARTINEZ", label: "Standard", zip: "94553" },
  { provider: "copart", state: "CA", city: "MENTONE", label: "Standard", zip: "92359" },
  { provider: "copart", state: "CA", city: "NAPA", label: "Standard", zip: "94503" },
  { provider: "copart", state: "CA", city: "RANCHO CUCAMONGA", label: "Standard", zip: "91739" },
  { provider: "copart", state: "CA", city: "REDDING", label: "Standard", zip: "96007" },
  { provider: "copart", state: "CA", city: "SACRAMENTO", label: "Standard", zip: "95828" },
  { provider: "copart", state: "CA", city: "SAN BERNARDINO", label: "Standard", zip: "92324" },
  { provider: "copart", state: "CA", city: "SAN DIEGO", label: "Standard", zip: "92154" },
  { provider: "copart", state: "CA", city: "SAN JOSE", label: "Standard", zip: "95046" },
  { provider: "copart", state: "CA", city: "SO SACRAMENTO", label: "Standard", zip: "95828" },
  { provider: "copart", state: "CA", city: "SUN VALLEY", label: "Standard", zip: "91352" },
  { provider: "copart", state: "CA", city: "VALLEJO", label: "Standard", zip: "94590" },
  { provider: "copart", state: "CA", city: "VAN NUYS", label: "Standard", zip: "91405" },

  // ===== COPART (USA) — kolejna część =====
  { provider: "copart", state: "CO", city: "COLORADO SPRINGS", label: "Standard", zip: "80907" },
  { provider: "copart", state: "CO", city: "DENVER", label: "Standard", zip: "80603" },
  { provider: "copart", state: "CO", city: "DENVER CENTRAL", label: "Standard", zip: "80229" },
  { provider: "copart", state: "CO", city: "DENVER SOUTH", label: "Standard", zip: "80125" },

  { provider: "copart", state: "CT", city: "HARTFORD", label: "Standard", zip: "06051" },
  { provider: "copart", state: "CT", city: "HARTFORD SPRINGFIELD", label: "Standard", zip: "06026" },

  { provider: "copart", state: "DE", city: "SEAFORD", label: "Standard", zip: "19973" },

  { provider: "copart", state: "FL", city: "CLEWISTON", label: "Standard", zip: "33440" },
  { provider: "copart", state: "FL", city: "FT. PIERCE", label: "Standard", zip: "34946" },
  { provider: "copart", state: "FL", city: "JACKSONVILLE NORTH", label: "Standard", zip: "32218" },
  { provider: "copart", state: "FL", city: "MIAMI CENTRAL", label: "Standard", zip: "33167" },
  { provider: "copart", state: "FL", city: "MIAMI NORTH", label: "Standard", zip: "33054" },
  { provider: "copart", state: "FL", city: "MIAMI SOUTH", label: "Standard", zip: "33032" },
  { provider: "copart", state: "FL", city: "OCALA", label: "Standard", zip: "34482" },
  { provider: "copart", state: "FL", city: "ORLANDO NORTH", label: "Standard", zip: "32712" },
  { provider: "copart", state: "FL", city: "ORLANDO SOUTH", label: "Standard", zip: "32824" },
  { provider: "copart", state: "FL", city: "PUNTA GORDA", label: "Standard", zip: "34269" },
  { provider: "copart", state: "FL", city: "TALLAHASSEE", label: "Standard", zip: "32343" },
  { provider: "copart", state: "FL", city: "TAMPA SOUTH", label: "Standard", zip: "33578" },
  { provider: "copart", state: "FL", city: "WEST PALM BEACH", label: "Standard", zip: "33411" },

  { provider: "copart", state: "GA", city: "ATLANTA EAST", label: "Standard", zip: "30052" },
  { provider: "copart", state: "GA", city: "ATLANTA NORTH", label: "Standard", zip: "30507" },
  { provider: "copart", state: "GA", city: "ATLANTA SOUTH", label: "Standard", zip: "30294" },
  { provider: "copart", state: "GA", city: "ATLANTA WEST", label: "Standard", zip: "30168" },
  { provider: "copart", state: "GA", city: "AUGUSTA", label: "Standard", zip: "30906" },
  { provider: "copart", state: "GA", city: "CARTERSVILLE", label: "Standard", zip: "30120" },
  { provider: "copart", state: "GA", city: "MACON", label: "Standard", zip: "31008" },
  { provider: "copart", state: "GA", city: "FAIRBURN", label: "Standard", zip: "30213" },
  { provider: "copart", state: "GA", city: "SAVANNAH", label: "Standard", zip: "31405" },
  { provider: "copart", state: "GA", city: "TIFTON", label: "Standard", zip: "31794" },

  { provider: "copart", state: "HI", city: "HONOLULU", label: "Standard", zip: "96707" },

  { provider: "copart", state: "ID", city: "BOISE", label: "Standard", zip: "83687" },

  { provider: "copart", state: "IL", city: "CHICAGO NORTH", label: "Standard", zip: "60120" },
  { provider: "copart", state: "IL", city: "CHICAGO SOUTH", label: "Standard", zip: "60411" },
  { provider: "copart", state: "IL", city: "PEORIA", label: "Standard", zip: "61554" },
  { provider: "copart", state: "IL", city: "SOUTHERN ILLINOIS", label: "Standard", zip: "62205" },
  { provider: "copart", state: "IL", city: "WHEELING", label: "Standard", zip: "60090" },

  { provider: "copart", state: "IN", city: "CICERO", label: "Standard", zip: "46034" },
  { provider: "copart", state: "IN", city: "DYER", label: "Standard", zip: "46311" },
  { provider: "copart", state: "IN", city: "FORT WAYNE", label: "Standard", zip: "46803" },
  { provider: "copart", state: "IN", city: "INDIANAPOLIS", label: "Standard", zip: "46254" },

  { provider: "copart", state: "IA", city: "CEDAR RAPIDS", label: "Standard", zip: "52404" },
  { provider: "copart", state: "IA", city: "DAVENPORT", label: "Standard", zip: "52748" },
  { provider: "copart", state: "IA", city: "DES MOINES", label: "Standard", zip: "50317" },

  { provider: "copart", state: "KS", city: "KANSAS CITY", label: "Standard", zip: "66111" },

  { provider: "copart", state: "KY", city: "EARLINGTON", label: "Standard", zip: "42410" },
  { provider: "copart", state: "KY", city: "LEXINGTON EAST", label: "Standard", zip: "40509" },
  { provider: "copart", state: "KY", city: "LEXINGTON WEST", label: "Standard", zip: "40342" },
  { provider: "copart", state: "KY", city: "LOUISVILLE", label: "Standard", zip: "40272" },
  { provider: "copart", state: "KY", city: "WALTON", label: "Standard", zip: "41094" },

  // ===== COPART (USA) — kolejna część (3) =====
  { provider: "copart", state: "LA", city: "BATON ROUGE", label: "Standard", zip: "70739" },
  { provider: "copart", state: "LA", city: "NEW ORLEANS", label: "Standard", zip: "70129" },
  { provider: "copart", state: "LA", city: "SHREVEPORT", label: "Standard", zip: "71109" },

  { provider: "copart", state: "ME", city: "LYMAN", label: "Standard", zip: "04002" },
  { provider: "copart", state: "ME", city: "WINDHAM", label: "Standard", zip: "04062" },

  { provider: "copart", state: "DC", city: "WASHINGTON DC", label: "Standard", zip: "20602" },

  { provider: "copart", state: "MD", city: "BALTIMORE", label: "Standard", zip: "21048" },
  { provider: "copart", state: "MD", city: "BALTIMORE EAST", label: "Standard", zip: "21225" },
  { provider: "copart", state: "MD", city: "LAUREL", label: "Standard", zip: "20707" },

  { provider: "copart", state: "MA", city: "FREETOWN", label: "Standard", zip: "02702" },
  { provider: "copart", state: "MA", city: "NORTH BOSTON", label: "Standard", zip: "01862" },
  { provider: "copart", state: "MA", city: "SOUTH BOSTON", label: "Standard", zip: "01756" },
  { provider: "copart", state: "MA", city: "WEST WARREN", label: "Standard", zip: "01092" },

  { provider: "copart", state: "MI", city: "DETROIT", label: "Standard", zip: "48183" },
  { provider: "copart", state: "MI", city: "FLINT", label: "Standard", zip: "48423" },
  { provider: "copart", state: "MI", city: "IONIA", label: "Standard", zip: "48875" },
  { provider: "copart", state: "MI", city: "KINCHELOE", label: "Standard", zip: "49788" },
  { provider: "copart", state: "MI", city: "LANSING", label: "Standard", zip: "48917" },
  { provider: "copart", state: "MI", city: "WAYLAND", label: "Standard", zip: "49348" },

  { provider: "copart", state: "MN", city: "MINNEAPOLIS", label: "Standard", zip: "55434" },
  { provider: "copart", state: "MN", city: "MINNEAPOLIS NORTH", label: "Standard", zip: "55304" },
  { provider: "copart", state: "MN", city: "ST. CLOUD", label: "Standard", zip: "56310" },

  { provider: "copart", state: "KS", city: "WICHITA", label: "Standard", zip: "67216" },

  { provider: "copart", state: "MS", city: "GRENADA", label: "Standard", zip: "38901" },
  { provider: "copart", state: "MS", city: "JACKSON", label: "Standard", zip: "39073" },

  { provider: "copart", state: "MO", city: "COLUMBIA", label: "Standard", zip: "65201" },
  { provider: "copart", state: "MO", city: "SIKESTON", label: "Standard", zip: "63801" },
  { provider: "copart", state: "MO", city: "SPRINGFIELD", label: "Standard", zip: "65742" },
  { provider: "copart", state: "MO", city: "ST. LOUIS", label: "Standard", zip: "63044" },

  { provider: "copart", state: "MT", city: "BILLINGS", label: "Standard", zip: "59101" },
  { provider: "copart", state: "MT", city: "HELENA", label: "Standard", zip: "59601" },

  { provider: "copart", state: "NE", city: "LINCOLN", label: "Standard", zip: "68366" },

  { provider: "copart", state: "NV", city: "57 STORAGE", label: "Standard", zip: "89115" },
  { provider: "copart", state: "NV", city: "LAS VEGAS", label: "Standard", zip: "89115" },
  { provider: "copart", state: "NV", city: "LAS VEGAS WEST", label: "Standard", zip: "89032" },
  { provider: "copart", state: "NV", city: "RENO", label: "Standard", zip: "89506" },

  { provider: "copart", state: "NH", city: "CANDIA", label: "Standard", zip: "03034" },

  { provider: "copart", state: "NJ", city: "GLASSBORO EAST", label: "Standard", zip: "08028" },
  { provider: "copart", state: "NJ", city: "GLASSBORO WEST", label: "Standard", zip: "08028" },
  { provider: "copart", state: "NJ", city: "SOMERVILLE", label: "Standard", zip: "08844" },
  { provider: "copart", state: "NJ", city: "TRENTON", label: "Standard", zip: "08561" },

    // ===== COPART (USA) — kolejna część (4) =====
  { provider: "copart", state: "NM", city: "ALBUQUERQUE", label: "Standard", zip: "87105" },

  { provider: "copart", state: "NY", city: "ALBANY", label: "Standard", zip: "12205" },
  { provider: "copart", state: "NY", city: "BUFFALO", label: "Standard", zip: "14006" },
  { provider: "copart", state: "NY", city: "LONG ISLAND", label: "Standard", zip: "11719" },
  { provider: "copart", state: "NY", city: "NEWBURGH", label: "Standard", zip: "12542" },
  { provider: "copart", state: "NY", city: "ROCHESTER", label: "Standard", zip: "14482" },
  { provider: "copart", state: "NY", city: "SYRACUSE", label: "Standard", zip: "13036" },

  { provider: "copart", state: "NC", city: "CHINA GROVE", label: "Standard", zip: "28023" },
  { provider: "copart", state: "NC", city: "CONCORD", label: "Standard", zip: "28025" },
  { provider: "copart", state: "NC", city: "GASTONIA", label: "Standard", zip: "28052" },
  { provider: "copart", state: "NC", city: "LA GRANGE", label: "Standard", zip: "28551" },
  { provider: "copart", state: "NC", city: "LUMBERTON", label: "Standard", zip: "28360" },
  { provider: "copart", state: "NC", city: "MEBANE", label: "Standard", zip: "27302" },
  { provider: "copart", state: "NC", city: "MOCKSVILLE", label: "Standard", zip: "27028" },
  { provider: "copart", state: "NC", city: "RALEIGH NORTH", label: "Standard", zip: "27545" },
  { provider: "copart", state: "NC", city: "RALEIGH", label: "Standard", zip: "28334" },

  { provider: "copart", state: "ND", city: "BISMARCK", label: "Standard", zip: "58504" },

  { provider: "copart", state: "OH", city: "AKRON", label: "Standard", zip: "44203" },
  { provider: "copart", state: "OH", city: "CLEVELAND EAST", label: "Standard", zip: "44067" },
  { provider: "copart", state: "OH", city: "CLEVELAND WEST", label: "Standard", zip: "44028" },
  { provider: "copart", state: "OH", city: "COLUMBUS", label: "Standard", zip: "43207" },
  { provider: "copart", state: "OH", city: "DAYTON", label: "Standard", zip: "45439" },

  { provider: "copart", state: "OK", city: "OKLAHOMA CITY", label: "Standard", zip: "73129" },
  { provider: "copart", state: "OK", city: "TULSA", label: "Standard", zip: "74107" },

  { provider: "copart", state: "OR", city: "EUGENE", label: "Standard", zip: "97402" },
  { provider: "copart", state: "OR", city: "PORTLAND NORTH", label: "Standard", zip: "97218" },
  { provider: "copart", state: "OR", city: "PORTLAND SOUTH", label: "Standard", zip: "97071" },

  { provider: "copart", state: "PA", city: "ALTOONA", label: "Standard", zip: "15931" },
  { provider: "copart", state: "PA", city: "CHAMBERSBURG", label: "Standard", zip: "17202" },
  { provider: "copart", state: "PA", city: "HARRISBURG", label: "Standard", zip: "17028" },
  { provider: "copart", state: "PA", city: "PHILADELPHIA", label: "Standard", zip: "18073" },
  { provider: "copart", state: "PA", city: "PHILADELPHIA EAST-SUBLOT", label: "Standard", zip: "18914" },
  { provider: "copart", state: "PA", city: "PITTSBURGH NORTH", label: "Standard", zip: "16117" },
  { provider: "copart", state: "PA", city: "PITTSBURGH SOUTH", label: "Standard", zip: "15122" },
  { provider: "copart", state: "PA", city: "PITTSBURGH WEST", label: "Standard", zip: "15122" },
  { provider: "copart", state: "PA", city: "SCRANTON", label: "Standard", zip: "18642" },
  { provider: "copart", state: "PA", city: "YORK HAVEN", label: "Standard", zip: "17370" },

  { provider: "copart", state: "RI", city: "EXETER", label: "Standard", zip: "02822" },

  { provider: "copart", state: "SC", city: "COLUMBIA", label: "Standard", zip: "29053" },
  { provider: "copart", state: "SC", city: "NORTH CHARLESTON", label: "Standard", zip: "29448" },
  { provider: "copart", state: "SC", city: "SPARTANBURG", label: "Standard", zip: "29301" },

  { provider: "copart", state: "SD", city: "RAPID CITY", label: "Standard", zip: "57701" },

  { provider: "copart", state: "TN", city: "KNOXVILLE", label: "Standard", zip: "37354" },
  { provider: "copart", state: "TN", city: "MEMPHIS", label: "Standard", zip: "38118" },
  { provider: "copart", state: "TN", city: "NASHVILLE", label: "Standard", zip: "37090" },

    // ===== COPART (USA) — kolejna część (5) =====

  { provider: "copart", state: "TX", city: "ABILENE", label: "Standard", zip: "79601" },
  { provider: "copart", state: "TX", city: "AMARILLO", label: "Standard", zip: "79118" },
  { provider: "copart", state: "TX", city: "ANDREWS", label: "Standard", zip: "79714" },
  { provider: "copart", state: "TX", city: "AUSTIN", label: "Standard", zip: "78130" },
  { provider: "copart", state: "TX", city: "CORPUS CHRISTI", label: "Standard", zip: "78405" },
  { provider: "copart", state: "TX", city: "DALLAS", label: "Standard", zip: "75051" },
  { provider: "copart", state: "TX", city: "DALLAS SOUTH", label: "Standard", zip: "75172" },
  { provider: "copart", state: "TX", city: "EL PASO", label: "Standard", zip: "79821" },
  { provider: "copart", state: "TX", city: "FT. WORTH", label: "Standard", zip: "76052" },
  { provider: "copart", state: "TX", city: "HOUSTON", label: "Standard", zip: "77073" },
  { provider: "copart", state: "TX", city: "HOUSTON EAST", label: "Standard", zip: "77049" },
  { provider: "copart", state: "TX", city: "LONGVIEW", label: "Standard", zip: "75603" },
  { provider: "copart", state: "TX", city: "LUFKIN", label: "Standard", zip: "75904" },
  { provider: "copart", state: "TX", city: "MCALLEN", label: "Standard", zip: "78570" },
  { provider: "copart", state: "TX", city: "NORTH AUSTIN", label: "Standard", zip: "76574" },
  { provider: "copart", state: "TX", city: "SAN ANTONIO", label: "Standard", zip: "78224" },
  { provider: "copart", state: "TX", city: "WACO", label: "Standard", zip: "76501" },

  { provider: "copart", state: "UT", city: "OGDEN", label: "Standard", zip: "84404" },
  { provider: "copart", state: "UT", city: "SALT LAKE CITY", label: "Standard", zip: "84044" },

  { provider: "copart", state: "VT", city: "RUTLAND", label: "Standard", zip: "05736" },

  { provider: "copart", state: "VA", city: "DANVILLE", label: "Standard", zip: "24531" },
  { provider: "copart", state: "VA", city: "FREDERICKSBURG", label: "Standard", zip: "22408" },
  { provider: "copart", state: "VA", city: "HAMPTON", label: "Standard", zip: "23666" },
  { provider: "copart", state: "VA", city: "RICHMOND", label: "Standard", zip: "23150" },
  { provider: "copart", state: "VA", city: "RICHMOND EAST", label: "Standard", zip: "23030" },

  { provider: "copart", state: "WA", city: "GRAHAM", label: "Standard", zip: "98338" },
  { provider: "copart", state: "WA", city: "NORTH SEATTLE", label: "Standard", zip: "98223" },
  { provider: "copart", state: "WA", city: "PASCO", label: "Standard", zip: "99301" },
  { provider: "copart", state: "WA", city: "SPOKANE", label: "Standard", zip: "99001" },

  { provider: "copart", state: "WV", city: "CHARLESTON", label: "Standard", zip: "25526" },

  { provider: "copart", state: "WI", city: "APPLETON", label: "Standard", zip: "54914" },
  { provider: "copart", state: "WI", city: "MADISON SOUTH", label: "Standard", zip: "53558" },
  { provider: "copart", state: "WI", city: "MILWAUKEE NORTH", label: "Standard", zip: "53224" },
  { provider: "copart", state: "WI", city: "MILWAUKEE SOUTH", label: "Standard", zip: "53132" },

  { provider: "copart", state: "WY", city: "CASPER", label: "Standard", zip: "82601" },

  // ===== IAAI (placeholder) =====
];

// NOTE: Nie używamy \p{...} (Unicode Property Escapes), bo w części środowisk (np. pewne bundlery/wykonania)
// może to rzucać błędem typu "Invalid regular expression".
// Zamiast tego usuwamy znaki diakrytyczne po NFD, kasując zakres łączników U+0300–U+036F.
function normalize(s: string) {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function yardDisplay(y: Yard) {
  const lbl = y.label ? ` (${y.label})` : "";
  return `${y.state} - ${y.city}${lbl}`;
}

function searchYards(query: string, provider: AuctionHouse, limit = 12) {
  const q = normalize(query);
  if (!q) return [] as Yard[];

  const byProvider = YARDS_USA.filter((y) => y.provider === provider);
  const starts: Yard[] = [];
  const contains: Yard[] = [];

  for (const y of byProvider) {
    const hay = normalize(`${y.state} ${y.city} ${y.zip} ${yardDisplay(y)}`);
    const city = normalize(y.city);
    const st = normalize(y.state);
    const zip = normalize(y.zip);

    if (city.startsWith(q) || st.startsWith(q) || zip.startsWith(q) || hay.startsWith(q)) {
      starts.push(y);
    } else if (hay.includes(q)) {
      contains.push(y);
    }
    if (starts.length + contains.length >= limit) break;
  }

  return [...starts, ...contains].slice(0, limit);
}

// ================= STAŁE KOSZTOWE =================
const AUCTION_MIN_FEE = 580;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function calcAuctionRate(priceUSD: number) {
  const p = priceUSD;
  if (p <= 1000) return 0;
  if (p <= 2000) return 0.345;
  if (p <= 3000) return 0.295;
  if (p <= 4000) return 0.245;
  if (p <= 5000) return 0.195;

  if (p <= 10000) {
    const t = clamp01((p - 5000) / (10000 - 5000));
    return lerp(0.195, 0.127, t);
  }
  if (p <= 15000) {
    const t = clamp01((p - 10000) / (15000 - 10000));
    return lerp(0.127, 0.107, t);
  }
  if (p <= 20000) {
    const t = clamp01((p - 15000) / (20000 - 15000));
    return lerp(0.107, 0.088, t);
  }
  if (p <= 40000) {
    const t = clamp01((p - 20000) / (40000 - 20000));
    return lerp(0.088, 0.08, t);
  }
  return 0.08;
}

function calcAuctionFee(priceUSD: number) {
  if (priceUSD <= 1000) return AUCTION_MIN_FEE + 120;
  const rate = calcAuctionRate(priceUSD);
  return Math.max(priceUSD * rate, AUCTION_MIN_FEE) + 120;
}

const INLAND_RATE = 2;
const INLAND_MIN = 300;

const INSURANCE_RATE = 0.02;
const INSURANCE_MIN = 200;

const CUSTOMS_AGENCY_EUR = 500;
const POLAND_FIXED_PLN = 2800;
const COMPANY_COMMISSION_PLN = 3300;

function n2(x: number) {
  const v = Number.isFinite(x) ? x : 0;
  return v.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseNum(v: unknown) {
  if (!v) return 0;
  const cleaned = String(v).replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.7613;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeZipUS(zip: string) {
  if (!zip) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&postalcode=${encodeURIComponent(
    zip
  )}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) } as { lat: number; lon: number };
}

async function fetchNBPRate(code: string) {
  try {
    const res = await fetch(`https://api.nbp.pl/api/exchangerates/rates/A/${code}/?format=json`);
    const data = await res.json();
    return data.rates[0].mid as number;
  } catch {
    return null;
  }
}

function usdToEur(usd: number, usdPln: number, eurPln: number) {
  if (!(usdPln > 0) || !(eurPln > 0)) return 0;
  return (usd * usdPln) / eurPln;
}

// ================= DEV TESTS =================
// W appkach bez test-runnera: robimy mini-testy tylko w DEV, żeby łapać regresje.
function runDevTests() {
  // normalize
  const a = normalize("Łódź");
  if (a !== "LODZ") console.warn("[TEST] normalize(Łódź) expected LODZ, got:", a);

  // searchYards
  const s1 = searchYards("birmingham", "copart", 10);
  if (!s1.some((y) => y.zip === "35023")) console.warn("[TEST] searchYards(birmingham) should include 35023");

  const s2 = searchYards("35023", "copart", 10);
  if (!s2.some((y) => y.city === "BIRMINGHAM")) console.warn("[TEST] searchYards(35023) should include BIRMINGHAM");
}

export default function ImportCalculatorPL() {
  const [vehiclePrice, setVehiclePrice] = useState("25000");
  const [auctionHouse, setAuctionHouse] = useState<AuctionHouse>("copart");
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>("sedan");
  const [buyerType, setBuyerType] = useState<BuyerType>("private");

  const [yardQuery, setYardQuery] = useState("");
  const [selectedYard, setSelectedYard] = useState<Yard | null>(null);
  const [isYardOpen, setIsYardOpen] = useState(false);

  const [zip, setZip] = useState("07001");
  const [insuranceEnabled, setInsuranceEnabled] = useState(true);
  const [extraCosts, setExtraCosts] = useState("0");

  const [usdPln, setUsdPln] = useState(0);
  const [eurPln, setEurPln] = useState(0);

  const [yardCoords, setYardCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [nearestPortKey, setNearestPortKey] = useState<PortKey>("NJ");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") runDevTests();

    async function loadRates() {
      const usd = await fetchNBPRate("USD");
      const eur = await fetchNBPRate("EUR");
      if (usd) setUsdPln(usd);
      if (eur) setEurPln(eur);
    }
    loadRates();
  }, []);

  useEffect(() => {
    setSelectedYard(null);
    setYardQuery("");
    setIsYardOpen(false);
  }, [auctionHouse]);

  useEffect(() => {
    async function run() {
      const geo = await geocodeZipUS(zip);
      if (!geo) return;
      setYardCoords(geo);

      let best: number | null = null;
      let bestKey: PortKey = "NJ";

      (Object.entries(PORTS) as Array<[PortKey, (typeof PORTS)[PortKey]]>).forEach(([key, port]) => {
        const miles = haversineMiles(geo.lat, geo.lon, port.lat, port.lon);
        if (best === null || miles < best) {
          best = miles;
          bestKey = key;
        }
      });

      setNearestPortKey(bestKey);
    }
    run();
  }, [zip]);

  const yardSuggestions = useMemo(() => {
    if (!yardQuery.trim()) return [] as Yard[];
    return searchYards(yardQuery, auctionHouse, 14);
  }, [yardQuery, auctionHouse]);

  const calc = useMemo(() => {
    const v = parseNum(vehiclePrice);
    const extra = parseNum(extraCosts);

    const port = PORTS[nearestPortKey];
    const sizeMultiplier = SIZE_MULTIPLIERS[vehicleSize];

    let miles = 0;
    if (yardCoords) {
      miles = haversineMiles(yardCoords.lat, yardCoords.lon, port.lat, port.lon);
    }

    const auctionFee = calcAuctionFee(v);

    const inlandBase = Math.max(miles * INLAND_RATE, INLAND_MIN);
    const inland = inlandBase * INLAND_SIZE_MULTIPLIERS[vehicleSize];
    const ocean = port.ocean * sizeMultiplier;

    const insurance = insuranceEnabled ? Math.max(v * INSURANCE_RATE, INSURANCE_MIN) : 0;
    const usaTotalUSD = v + auctionFee + inland + ocean + insurance + extra;

    let dutyEUR = 0;
    let vatEUR = 0;

    const effectiveBuyerType: BuyerType = buyerType === "private" && v < 3000 ? "company" : buyerType;

    if (effectiveBuyerType === "private") {
      const baseEUR = usdToEur(v * 0.6, usdPln, eurPln);
      const dutyRaw = baseEUR * 0.1;
      const vatRaw = (baseEUR + dutyRaw) * 0.21;
      dutyEUR = dutyRaw;
      vatEUR = vatRaw;
    } else {
      const customsValueEUR = usdToEur(v + inland + ocean + insurance, usdPln, eurPln);
      const dutyRaw = customsValueEUR * 0.1;
      const vatBaseEUR = usdToEur(v + inland + ocean, usdPln, eurPln);
      const vatRaw = (vatBaseEUR + dutyRaw) * 0.21;
      dutyEUR = dutyRaw;
      vatEUR = vatRaw;
    }

    dutyEUR = Math.max(dutyEUR, 300);

    const rotterdamTotalEUR = dutyEUR + vatEUR + CUSTOMS_AGENCY_EUR;
    const usaPLN = usaTotalUSD * usdPln;
    const rotterdamPLN = rotterdamTotalEUR * eurPln;
    const totalPLN = usaPLN + rotterdamPLN + POLAND_FIXED_PLN + COMPANY_COMMISSION_PLN;

    return {
      auctionFee,
      inland,
      ocean,
      insurance,
      dutyEUR,
      vatEUR,
      usaTotalUSD,
      rotterdamTotalEUR,
      totalPLN,
      portName: port.name,
    };
  }, [
    vehiclePrice,
    vehicleSize,
    buyerType,
    yardCoords,
    nearestPortKey,
    usdPln,
    eurPln,
    insuranceEnabled,
    extraCosts,
  ]);

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Kalkulator Importu USA → Rotterdam → Polska</h1>

      <div className="space-y-4">
        <div>
          <label className="font-semibold">Rodzaj klienta</label>
          <select
            className="border p-2 w-full"
            value={buyerType}
            onChange={(e) => setBuyerType(e.target.value as BuyerType)}
          >
            <option value="private">Osoba prywatna</option>
            <option value="company">Firma</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Dom aukcyjny</label>
          <select
            className="border p-2 w-full"
            value={auctionHouse}
            onChange={(e) => setAuctionHouse(e.target.value as AuctionHouse)}
          >
            <option value="copart">Copart</option>
            <option value="iaai">IAAI</option>
          </select>
          <div className="text-xs text-gray-500 mt-1">Wyszukiwarka placów poniżej pokazuje tylko place z wybranego domu.</div>
        </div>

        <div>
          <label className="font-semibold">Wielkość auta</label>
          <select
            className="border p-2 w-full"
            value={vehicleSize}
            onChange={(e) => setVehicleSize(e.target.value as VehicleSize)}
          >
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="bigsuv">Big SUV</option>
            <option value="oversize">Oversize</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Plac (USA) – wyszukaj po mieście/stanie/ZIP</label>
          <div className="relative">
            <input
              className="border p-2 w-full"
              value={yardQuery}
              onChange={(e) => {
                setYardQuery(e.target.value);
                setSelectedYard(null);
              }}
              placeholder={auctionHouse === "copart" ? "np. AL Birmingham, 35023, Los Angeles..." : "np. NJ ..."}
              onFocus={() => setIsYardOpen(true)}
              onBlur={() => setTimeout(() => setIsYardOpen(false), 150)}
            />

            {isYardOpen && yardSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded border bg-white shadow max-h-72 overflow-auto">
                {yardSuggestions.map((y, idx) => (
                  <button
                    key={`${y.provider}-${y.zip}-${idx}`}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedYard(y);
                      setYardQuery(yardDisplay(y));
                      setZip(y.zip);
                      setIsYardOpen(false);
                    }}
                  >
                    <div className="text-sm">{yardDisplay(y)}</div>
                    <div className="text-xs text-gray-500">ZIP: {y.zip}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Jeśli wybierzesz plac z listy, ZIP ustawi się automatycznie. Możesz też wpisać ZIP ręcznie niżej.
          </div>
        </div>

        <div>
          <label className="font-semibold">ZIP placu (USA)</label>
          <input className="border p-2 w-full" value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>

        <div>
          <label className="font-semibold">Cena zakupu auta (USD)</label>
          <input
            className="border p-2 w-full"
            value={vehiclePrice}
            onChange={(e) => setVehiclePrice(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={insuranceEnabled}
            onChange={(e) => setInsuranceEnabled(e.target.checked)}
          />
          <label>Ubezpieczenie transportu (opcjonalne)</label>
        </div>

        <div>
          <label className="font-semibold">Dodatkowe wydatki (USD)</label>
          <input className="border p-2 w-full" value={extraCosts} onChange={(e) => setExtraCosts(e.target.value)} />
        </div>

        {selectedYard && (
          <div className="text-sm rounded border p-3 bg-gray-50">
            Wybrany plac: <b>{yardDisplay(selectedYard)}</b> (ZIP {selectedYard.zip})
          </div>
        )}
      </div>

      <div className="mt-10 space-y-2 border-t pt-6">
        <div>
          Najbliższy port: <b>{calc.portName}</b>
        </div>

        <h2 className="font-bold mt-6">USA (USD)</h2>
        <div>Kupno auta: {n2(parseNum(vehiclePrice))} USD</div>
        <div>Prowizja aukcji: {n2(calc.auctionFee)} USD</div>
        <div>Transport lądowy: {n2(calc.inland)} USD</div>
        <div>Transport morski: {n2(calc.ocean)} USD</div>
        {insuranceEnabled && <div>Ubezpieczenie: {n2(calc.insurance)} USD</div>}
        {parseNum(extraCosts) > 0 && <div>Dodatkowe wydatki: {n2(parseNum(extraCosts))} USD</div>}
        <div className="font-semibold">Razem USA: {n2(calc.usaTotalUSD)} USD</div>

        <h2 className="font-bold mt-6">Rotterdam (EUR)</h2>
        <div>Cło: {n2(calc.dutyEUR)} EUR</div>
        <div>VAT: {n2(calc.vatEUR)} EUR</div>
        <div>Agencja celna: {n2(CUSTOMS_AGENCY_EUR)} EUR</div>
        <div className="font-semibold">Razem Rotterdam: {n2(calc.rotterdamTotalEUR)} EUR</div>

        <h2 className="font-bold mt-6">Polska (PLN)</h2>
        <div>Koszty z Rotterdamu: {n2(POLAND_FIXED_PLN)} PLN</div>
        <div>Prowizja firmy: {n2(COMPANY_COMMISSION_PLN)} PLN</div>

        <div className="text-2xl font-bold mt-6">Całość: {n2(calc.totalPLN)} PLN</div>
      </div>
    </div>
  );
}
