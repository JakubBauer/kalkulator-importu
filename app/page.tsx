"use client";

import React, { useMemo, useState } from "react";

// ================= PORTY USA =================
const PORTS = {
  NJ: { name: "Port Newark / NJ", ocean: 900 },
  GA: { name: "Port Savannah / GA", ocean: 900 },
  TX: { name: "Port Houston / TX", ocean: 975 },
  LA: { name: "Port Los Angeles / CA", ocean: 1500 },
} as const;

type PortKey = keyof typeof PORTS;

type AuctionHouse = "copart" | "iaai" | "manheim";
type VehicleSize = "sedan" | "suv" | "bigsuv" | "oversize";

// ================= MNOŻNIKI WIELKOŚCI AUTA =================
const SIZE_MULTIPLIERS: Record<VehicleSize, number> = {
  sedan: 1,
  suv: 1.2,
  bigsuv: 1.5,
  oversize: 2,
};

const INLAND_SIZE_MULTIPLIERS: Record<VehicleSize, number> = {
  sedan: 1,
  suv: 1.2,
  bigsuv: 1.5,
  oversize: 1.8,
};

// ================= PLACEHOLDER LISTY PLACÓW =================
// Wklej swoją listę w YARDS_USA (zostawiłem typ, żeby Ci się ładnie trzymało)
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

  // ===== MANHEIM (USA) — z Twojej listy =====
  { provider: "manheim", state: "AL", city: "BIRMINGHAM", label: "Manheim", zip: "35217" },
  { provider: "manheim", state: "AL", city: "VALLEY", label: "4 Star Auto Auction Powered by Manheim", zip: "36854" },

  { provider: "manheim", state: "AZ", city: "PHOENIX", label: "Manheim", zip: "85353" },
  { provider: "manheim", state: "AZ", city: "TUCSON", label: "Manheim", zip: "85756" },

  { provider: "manheim", state: "AR", city: "CONWAY", label: "Manheim Little Rock", zip: "72032" },

  { provider: "manheim", state: "CA", city: "ANAHEIM", label: "Manheim California", zip: "92807" },
  { provider: "manheim", state: "CA", city: "FRESNO", label: "Manheim Fresno", zip: "93706" },
  { provider: "manheim", state: "CA", city: "OCEANSIDE", label: "Manheim Oceanside", zip: "92057" },
  { provider: "manheim", state: "CA", city: "RIVERSIDE", label: "Manheim Riverside", zip: "92504" },
  { provider: "manheim", state: "CA", city: "HAYWARD", label: "Manheim San Francisco Bay", zip: "94544" },
  { provider: "manheim", state: "CA", city: "FONTANA", label: "Manheim Southern California", zip: "92337" },

  { provider: "manheim", state: "CO", city: "AURORA", label: "Manheim Denver", zip: "80011" },

  { provider: "manheim", state: "FL", city: "ORLANDO", label: "Manheim Central Florida", zip: "32824" },
  { provider: "manheim", state: "FL", city: "DAYTONA BEACH", label: "Manheim Daytona Beach", zip: "32124" },
  { provider: "manheim", state: "FL", city: "DAVIE", label: "Manheim Fort Lauderdale", zip: "33314" },
  { provider: "manheim", state: "FL", city: "FORT MYERS", label: "Manheim Fort Myers", zip: "33916" },
  { provider: "manheim", state: "FL", city: "JACKSONVILLE", label: "Manheim Jacksonville", zip: "32219" },
  { provider: "manheim", state: "FL", city: "LAKELAND", label: "Manheim Lakeland", zip: "33809" },
  { provider: "manheim", state: "FL", city: "OCOEE", label: "Manheim Orlando", zip: "34761" },
  { provider: "manheim", state: "FL", city: "WEST PALM BEACH", label: "Manheim Palm Beach", zip: "33411" },
  { provider: "manheim", state: "FL", city: "PENSACOLA", label: "Manheim Pensacola", zip: "32505" },
  { provider: "manheim", state: "FL", city: "CLEARWATER", label: "Manheim St. Pete", zip: "33762" },
  { provider: "manheim", state: "FL", city: "TALLAHASSEE", label: "Manheim Tallahassee", zip: "32305" },
  { provider: "manheim", state: "FL", city: "TAMPA", label: "Manheim Tampa", zip: "33619" },

  { provider: "manheim", state: "GA", city: "COLLEGE PARK", label: "Manheim Atlanta", zip: "30349" },
  { provider: "manheim", state: "GA", city: "ATLANTA", label: "MyCentralAuction", zip: "30328" },
  { provider: "manheim", state: "GA", city: "ATLANTA", label: "Manheim Georgia", zip: "30331" },
  { provider: "manheim", state: "GA", city: "KINGSTON", label: "Rome Auto Auction Powered by Manheim", zip: "30145" },

  { provider: "manheim", state: "IL", city: "MATTESON", label: "Manheim Chicago", zip: "60443" },

  { provider: "manheim", state: "IN", city: "INDIANAPOLIS", label: "Manheim Indianapolis", zip: "46239" },
  { provider: "manheim", state: "IN", city: "CLARKSVILLE", label: "Manheim Louisville", zip: "47129" },

  { provider: "manheim", state: "IA", city: "STUART", label: "Manheim Iowa", zip: "50250" },

  { provider: "manheim", state: "KS", city: "OLATHE", label: "Olathe Mobile Auction", zip: "66061" },
  { provider: "manheim", state: "KS", city: "WICHITA", label: "Wichita Mobile Auction", zip: "67207" },

  { provider: "manheim", state: "LA", city: "SCOTT", label: "Manheim Lafayette", zip: "70583" },
  { provider: "manheim", state: "LA", city: "SLIDELL", label: "Manheim New Orleans", zip: "70460" },

  { provider: "manheim", state: "MD", city: "ELKRIDGE", label: "Manheim Baltimore-Washington", zip: "21075" },
  { provider: "manheim", state: "MD", city: "BELCAMP", label: "Manheim Maryland", zip: "21017" },

  { provider: "manheim", state: "MA", city: "NORTH DIGHTON", label: "Manheim New England", zip: "02764" },

  { provider: "manheim", state: "MI", city: "CARLETON", label: "Manheim Detroit", zip: "48117" },
  { provider: "manheim", state: "MI", city: "MT. MORRIS", label: "Manheim Flint", zip: "48458" },

  { provider: "manheim", state: "MN", city: "MAPLE GROVE", label: "Manheim Minneapolis", zip: "55369" },
  { provider: "manheim", state: "MN", city: "SHAKOPEE", label: "Manheim Northstar Minnesota", zip: "55379" },

  { provider: "manheim", state: "MS", city: "HATTIESBURG", label: "Manheim Mississippi", zip: "39402" },

  { provider: "manheim", state: "MO", city: "KANSAS CITY", label: "Manheim Kansas City", zip: "64161" },
  { provider: "manheim", state: "MO", city: "BRIDGETON", label: "Manheim St. Louis", zip: "63044" },

  { provider: "manheim", state: "NE", city: "OMAHA", label: "Manheim Omaha", zip: "68138" },

  { provider: "manheim", state: "NV", city: "LAS VEGAS", label: "Manheim Nevada", zip: "89165" },

  { provider: "manheim", state: "NH", city: "SOMERSWORTH", label: "Manheim New Hampshire", zip: "03878" },

  { provider: "manheim", state: "NJ", city: "BORDENTOWN", label: "Manheim New Jersey", zip: "08505" },
  { provider: "manheim", state: "NJ", city: "FAIRFIELD", label: "Manheim NY Metro Skyline", zip: "07004" },

  { provider: "manheim", state: "NM", city: "ALBUQUERQUE", label: "Manheim New Mexico", zip: "87105" },

  { provider: "manheim", state: "NY", city: "CLIFTON PARK", label: "Manheim Albany", zip: "12065" },
  { provider: "manheim", state: "NY", city: "NEWBURGH", label: "Manheim New York", zip: "12550" },
  { provider: "manheim", state: "NY", city: "ROCHESTER", label: "Manheim Rochester", zip: "14615" },

  { provider: "manheim", state: "NC", city: "CONCORD", label: "Manheim Charlotte", zip: "28027" },
  { provider: "manheim", state: "NC", city: "KENLY", label: "Manheim North Carolina", zip: "27542" },
  { provider: "manheim", state: "NC", city: "STATESVILLE", label: "Manheim Statesville", zip: "28625" },
  { provider: "manheim", state: "NC", city: "ROCKY POINT", label: "Manheim Wilmington", zip: "28457" },

  { provider: "manheim", state: "OH", city: "HAMILTON", label: "Manheim Cincinnati", zip: "45011" },
  { provider: "manheim", state: "OH", city: "BROOK PARK", label: "Manheim Cleveland", zip: "44142" },
  { provider: "manheim", state: "OH", city: "GROVE CITY", label: "Manheim Ohio", zip: "43123" },

  { provider: "manheim", state: "OK", city: "SAPULPA", label: "Manheim Tulsa", zip: "74066" },

  { provider: "manheim", state: "OR", city: "PORTLAND", label: "Manheim Portland", zip: "97217" },

  { provider: "manheim", state: "PA", city: "GRANTVILLE", label: "Manheim Keystone Pennsylvania", zip: "17028" },
  { provider: "manheim", state: "PA", city: "MANHEIM", label: "Manheim Pennsylvania", zip: "17545" },
  { provider: "manheim", state: "PA", city: "HATFIELD", label: "Manheim Philadelphia", zip: "19440" },
  { provider: "manheim", state: "PA", city: "CRANBERRY TOWNSHIP", label: "Manheim Pittsburgh", zip: "16066" },

  { provider: "manheim", state: "SC", city: "DARLINGTON", label: "Manheim Darlington", zip: "29532" },
  { provider: "manheim", state: "SC", city: "GREER", label: "Manheim Greer Service Center", zip: "29651" },

  { provider: "manheim", state: "TN", city: "MOUNT JULIET", label: "Manheim Nashville", zip: "37122" },

  { provider: "manheim", state: "TX", city: "DALLAS", label: "Manheim Dallas", zip: "75236" },
  { provider: "manheim", state: "TX", city: "EULESS", label: "Manheim Dallas-Fort Worth", zip: "76040" },
  { provider: "manheim", state: "TX", city: "EL PASO", label: "Manheim El Paso", zip: "79932" },
  { provider: "manheim", state: "TX", city: "HOUSTON", label: "Manheim Texas Hobby", zip: "77061" },
  { provider: "manheim", state: "TX", city: "HOUSTON", label: "Manheim Houston", zip: "77041" },
  { provider: "manheim", state: "TX", city: "PLANO", label: "Park Place Auto Auction Powered by Manheim", zip: "75093" },
  { provider: "manheim", state: "TX", city: "SAN ANTONIO", label: "Manheim San Antonio", zip: "78219" },

  { provider: "manheim", state: "UT", city: "WOODS CROSS", label: "Manheim Utah", zip: "84087" },

  { provider: "manheim", state: "VA", city: "FREDERICKSBURG", label: "Manheim Fredericksburg", zip: "22406" },
  { provider: "manheim", state: "VA", city: "HARRISONBURG", label: "Manheim Harrisonburg", zip: "22801" },

  { provider: "manheim", state: "WA", city: "KENT", label: "Manheim Seattle", zip: "98032" },

  { provider: "manheim", state: "WI", city: "CALEDONIA", label: "Manheim Milwaukee", zip: "53108" },

  // ===== IAAI (USA) — z Twojej listy =====
  { provider: "iaai", state: "TX", city: "ABILENE", zip: "79601" },
  { provider: "iaai", state: "CA", city: "ACE - CARSON", zip: "90248" },
  { provider: "iaai", state: "CA", city: "ACE - PERRIS", zip: "92571" },
  { provider: "iaai", state: "CA", city: "ACE - PERRIS 2", zip: "92571" },
  { provider: "iaai", state: "OH", city: "AKRON-CANTON", zip: "44663" },
  { provider: "iaai", state: "NY", city: "ALBANY", zip: "12303" },
  { provider: "iaai", state: "NM", city: "ALBUQUERQUE", zip: "87105" },
  { provider: "iaai", state: "PA", city: "ALTOONA", zip: "16637" },
  { provider: "iaai", state: "TX", city: "AMARILLO", zip: "79118" },
  { provider: "iaai", state: "CA", city: "ANAHEIM", zip: "92806" },
  { provider: "iaai", state: "CA", city: "ANAHEIM CONSOLIDATED", zip: "92806" },
  { provider: "iaai", state: "AK", city: "ANCHORAGE", zip: "99654" },
  { provider: "iaai", state: "WI", city: "APPLETON", zip: "54914" },
  { provider: "iaai", state: "NC", city: "ASHEVILLE", zip: "28732" },
  { provider: "iaai", state: "KY", city: "ASHLAND", zip: "41102" },
  { provider: "iaai", state: "GA", city: "ATLANTA", zip: "30052" },
  { provider: "iaai", state: "GA", city: "ATLANTA EAST", zip: "30680" },
  { provider: "iaai", state: "GA", city: "ATLANTA NORTH", zip: "30101" },
  { provider: "iaai", state: "GA", city: "ATLANTA SOUTH", zip: "30260" },
  { provider: "iaai", state: "GA", city: "ATLANTA WEST", zip: "30153" },
  { provider: "iaai", state: "TX", city: "AUSTIN", zip: "78616" },
  { provider: "iaai", state: "TX", city: "AUSTIN NORTH", zip: "76527" },
  { provider: "iaai", state: "NJ", city: "AVENEL NEW JERSEY", zip: "07001" },
  { provider: "iaai", state: "MD", city: "BALTIMORE", zip: "21226" },
  { provider: "iaai", state: "LA", city: "BATON ROUGE", zip: "70721" },
  { provider: "iaai", state: "MT", city: "BILLINGS", zip: "59101" },
  { provider: "iaai", state: "AL", city: "BIRMINGHAM", zip: "35022" },
  { provider: "iaai", state: "ID", city: "BOISE", zip: "83642" },
  { provider: "iaai", state: "MA", city: "BOSTON - SHIRLEY", zip: "01464" },
  { provider: "iaai", state: "KY", city: "BOWLING GREEN", zip: "42101" },
  { provider: "iaai", state: "PA", city: "BRIDGEPORT", zip: "19405" },
  { provider: "iaai", state: "WV", city: "BUCKHANNON", zip: "26201" },
  { provider: "iaai", state: "NY", city: "BUFFALO", zip: "14207" },
  { provider: "iaai", state: "VT", city: "BURLINGTON", zip: "05452" },
  { provider: "iaai", state: "WY", city: "CASPER", zip: "82601" },
  { provider: "iaai", state: "NJ", city: "CENTRAL NEW JERSEY", zip: "07751" },
  { provider: "iaai", state: "SC", city: "CHARLESTON", zip: "29470" },
  { provider: "iaai", state: "NC", city: "CHARLOTTE", zip: "28206" },
  { provider: "iaai", state: "TN", city: "CHATTANOOGA", zip: "37404" },
  { provider: "iaai", state: "IL", city: "CHICAGO-NORTH", zip: "60118" },
  { provider: "iaai", state: "IL", city: "CHICAGO-SOUTH", zip: "60428" },
  { provider: "iaai", state: "IL", city: "CHICAGO-WEST", zip: "60505" },
  { provider: "iaai", state: "OH", city: "CINCINNATI", zip: "45069" },
  { provider: "iaai", state: "OH", city: "CINCINNATI-SOUTH", zip: "45102" },
  { provider: "iaai", state: "FL", city: "CLEARWATER", zip: "33760" },
  { provider: "iaai", state: "OH", city: "CLEVELAND", zip: "44053" },
  { provider: "iaai", state: "CO", city: "COLORADO SPRINGS", zip: "80925" },
  { provider: "iaai", state: "OH", city: "COLUMBUS", zip: "43123" },
  { provider: "iaai", state: "NC", city: "CONCORD", zip: "28025" },
  { provider: "iaai", state: "TX", city: "CORPUS CHRISTI", zip: "78405" },
  { provider: "iaai", state: "VA", city: "CULPEPER", zip: "22701" },
  { provider: "iaai", state: "TX", city: "DALLAS", zip: "75172" },
  { provider: "iaai", state: "TX", city: "DALLAS/FT WORTH", zip: "75050" },
  { provider: "iaai", state: "IA", city: "DAVENPORT", zip: "52802" },
  { provider: "iaai", state: "OH", city: "DAYTON", zip: "45417" },
  { provider: "iaai", state: "CO", city: "DENVER EAST", zip: "80022" },
  { provider: "iaai", state: "IA", city: "DES MOINES", zip: "50069" },
  { provider: "iaai", state: "MI", city: "DETROIT", zip: "48111" },
  { provider: "iaai", state: "AL", city: "DOTHAN", zip: "36345" },
  { provider: "iaai", state: "IL", city: "DREAM RIDES", zip: "60154" },
  { provider: "iaai", state: "MD", city: "DUNDALK", zip: "21222" },
  { provider: "iaai", state: "CA", city: "EAST BAY", zip: "94565" },
  { provider: "iaai", state: "TX", city: "EL PASO", zip: "79938" },
  { provider: "iaai", state: "IL", city: "ELECTRIC VEHICLE AUCTIONS", zip: "60154" },
  { provider: "iaai", state: "MD", city: "ELKTON", zip: "21921" },
  { provider: "iaai", state: "NJ", city: "ENGLISHTOWN", zip: "07726" },
  { provider: "iaai", state: "PA", city: "ERIE", zip: "16416" },
  { provider: "iaai", state: "OR", city: "EUGENE", zip: "97402" },
  { provider: "iaai", state: "ND", city: "FARGO", zip: "58102" },
  { provider: "iaai", state: "AR", city: "FAYETTEVILLE", zip: "72744" },
  { provider: "iaai", state: "MI", city: "FLINT", zip: "48507" },
  { provider: "iaai", state: "CA", city: "FONTANA", zip: "92335" },
  { provider: "iaai", state: "FL", city: "FORT MYERS", zip: "33913" },
  { provider: "iaai", state: "FL", city: "FORT PIERCE", zip: "34981" },
  { provider: "iaai", state: "IN", city: "FORT WAYNE", zip: "46806" },
  { provider: "iaai", state: "TX", city: "FORT WORTH NORTH", zip: "76247" },
  { provider: "iaai", state: "CA", city: "FREMONT", zip: "94538" },
  { provider: "iaai", state: "CA", city: "FRESNO", zip: "93705" },
  { provider: "iaai", state: "IL", city: "GOV AUCTIONS MIDWEST", zip: "60154" },
  { provider: "iaai", state: "IL", city: "GOV AUCTIONS NORTHEAST", zip: "60154" },
  { provider: "iaai", state: "IL", city: "GOV AUCTIONS SOUTH", zip: "60154" },
  { provider: "iaai", state: "IL", city: "GOV AUCTIONS WEST", zip: "60154" },
  { provider: "iaai", state: "MI", city: "GRAND RAPIDS", zip: "49315" },
  { provider: "iaai", state: "NC", city: "GREENSBORO", zip: "27253" },
  { provider: "iaai", state: "SC", city: "GREENVILLE", zip: "29681" },
  { provider: "iaai", state: "MS", city: "GRENADA", zip: "38901" },
  { provider: "iaai", state: "MS", city: "GULF COAST", zip: "39562" },
  { provider: "iaai", state: "CT", city: "HARTFORD", zip: "06088" },
  { provider: "iaai", state: "CA", city: "HIGH DESERT", zip: "92345" },
  { provider: "iaai", state: "NC", city: "HIGH POINT", zip: "27263" },
  { provider: "iaai", state: "HI", city: "HONOLULU", zip: "96707" },
  { provider: "iaai", state: "TX", city: "HOUSTON", zip: "77038" },
  { provider: "iaai", state: "TX", city: "HOUSTON SOUTH", zip: "77583" },
  { provider: "iaai", state: "TX", city: "HOUSTON-NORTH", zip: "77032" },
  { provider: "iaai", state: "AL", city: "HUNTSVILLE", zip: "35613" },
  { provider: "iaai", state: "IN", city: "INDIANAPOLIS", zip: "46217" },
  { provider: "iaai", state: "IN", city: "INDIANAPOLIS SOUTH", zip: "47229" },
  { provider: "iaai", state: "MS", city: "JACKSON", zip: "39272" },
  { provider: "iaai", state: "FL", city: "JACKSONVILLE", zip: "32218" },
  { provider: "iaai", state: "KS", city: "KANSAS CITY", zip: "66111" },
  { provider: "iaai", state: "MO", city: "KANSAS CITY EAST", zip: "64076" },
  { provider: "iaai", state: "TN", city: "KNOXVILLE", zip: "37914" },
  { provider: "iaai", state: "LA", city: "LAFAYETTE", zip: "70583" },
  { provider: "iaai", state: "GA", city: "LAKE CITY", zip: "30260" },
  { provider: "iaai", state: "NV", city: "LAS VEGAS", zip: "89122" },
  { provider: "iaai", state: "SC", city: "LEXINGTON", zip: "29073" },
  { provider: "iaai", state: "IL", city: "LINCOLN", zip: "62656" },
  { provider: "iaai", state: "AR", city: "LITTLE ROCK", zip: "72142" },
  { provider: "iaai", state: "NY", city: "LONG ISLAND", zip: "11763" },
  { provider: "iaai", state: "TX", city: "LONGVIEW", zip: "75605" },
  { provider: "iaai", state: "CA", city: "LOS ANGELES", zip: "90248" },
  { provider: "iaai", state: "CA", city: "LOS ANGELES SOUTH", zip: "90744" },
  { provider: "iaai", state: "KY", city: "LOUISVILLE NORTH", zip: "40019" },
  { provider: "iaai", state: "TX", city: "LUBBOCK", zip: "79415" },
  { provider: "iaai", state: "GA", city: "MACON", zip: "31217" },
  { provider: "iaai", state: "NH", city: "MANCHESTER", zip: "03079" },
  { provider: "iaai", state: "TX", city: "MCALLEN", zip: "78537" },
  { provider: "iaai", state: "TN", city: "MEMPHIS", zip: "38053" },
  { provider: "iaai", state: "MD", city: "METRO DC", zip: "20613" },
  { provider: "iaai", state: "FL", city: "MIAMI-NORTH", zip: "33332" },
  { provider: "iaai", state: "WI", city: "MILWAUKEE", zip: "53089" },
  { provider: "iaai", state: "MN", city: "MINNEAPOLIS SOUTH", zip: "55065" },
  { provider: "iaai", state: "MN", city: "MINNEAPOLIS/ST. PAUL", zip: "55117" },
  { provider: "iaai", state: "MT", city: "MISSOULA", zip: "59808" },
  { provider: "iaai", state: "NY", city: "MONTICELLO", zip: "12701" },
  { provider: "iaai", state: "TN", city: "NASHVILLE", zip: "37218" },
  { provider: "iaai", state: "DE", city: "NEW CASTLE", zip: "19720" },
  { provider: "iaai", state: "LA", city: "NEW ORLEANS EAST", zip: "70126" },
  { provider: "iaai", state: "NY", city: "NEWBURGH", zip: "12575" },
  { provider: "iaai", state: "CA", city: "NORTH HOLLYWOOD", zip: "91605" },
  { provider: "iaai", state: "VA", city: "NORTHERN VIRGINIA", zip: "22406" },
  { provider: "iaai", state: "OK", city: "OKLAHOMA CITY", zip: "73121" },
  { provider: "iaai", state: "NE", city: "OMAHA", zip: "68059" },
  { provider: "iaai", state: "NE", city: "OMAHA SOUTH", zip: "68366" },
  { provider: "iaai", state: "ME", city: "ONLINE EXCLUSIVE", zip: "04927" },
  { provider: "iaai", state: "FL", city: "ORLANDO", zip: "32824" },
  { provider: "iaai", state: "FL", city: "ORLANDO-NORTH", zip: "32773" },
  { provider: "iaai", state: "KY", city: "PADUCAH", zip: "42003" },
  { provider: "iaai", state: "FL", city: "PENSACOLA", zip: "32583" },
  { provider: "iaai", state: "TX", city: "PERMIAN BASIN", zip: "79764" },
  { provider: "iaai", state: "PA", city: "PHILADELPHIA", zip: "19428" },
  { provider: "iaai", state: "AZ", city: "PHOENIX", zip: "85041" },
  { provider: "iaai", state: "PA", city: "PITTSBURGH", zip: "15001" },
  { provider: "iaai", state: "PA", city: "PITTSBURGH-NORTH", zip: "15044" },
  { provider: "iaai", state: "NJ", city: "PORT MURRAY", zip: "07865" },
  { provider: "iaai", state: "WI", city: "PORTAGE", zip: "53901" },
  { provider: "iaai", state: "OR", city: "PORTLAND", zip: "97230" },
  { provider: "iaai", state: "ME", city: "PORTLAND - GORHAM", zip: "04038" },
  { provider: "iaai", state: "OR", city: "PORTLAND SOUTH", zip: "97071" },
  { provider: "iaai", state: "OR", city: "PORTLAND WEST", zip: "97217" },
  { provider: "iaai", state: "RI", city: "PROVIDENCE", zip: "02915" },
  { provider: "iaai", state: "UT", city: "PROVO", zip: "84648" },
  { provider: "iaai", state: "VA", city: "PULASKI", zip: "24301" },
  { provider: "iaai", state: "NC", city: "RALEIGH", zip: "27520" },
  { provider: "iaai", state: "IL", city: "REC RIDES - ONLINE-EXCLUSIVE", zip: "60154" },
  { provider: "iaai", state: "NV", city: "RENO", zip: "89437" },
  { provider: "iaai", state: "VA", city: "RICHMOND", zip: "23005" },
  { provider: "iaai", state: "CA", city: "RIVERSIDE", zip: "92509" },
  { provider: "iaai", state: "VA", city: "ROANOKE", zip: "24122" },
  { provider: "iaai", state: "NY", city: "ROCHESTER", zip: "14416" },
  { provider: "iaai", state: "CA", city: "SACRAMENTO", zip: "95742" },
  { provider: "iaai", state: "CA", city: "SACRAMENTO WEST", zip: "95620" },
  { provider: "iaai", state: "UT", city: "SALT LAKE CITY", zip: "84401" },
  { provider: "iaai", state: "TX", city: "SAN ANTONIO-SOUTH", zip: "78224" },
  { provider: "iaai", state: "CA", city: "SAN DIEGO", zip: "92154" },
  { provider: "iaai", state: "CA", city: "SANTA CLARITA", zip: "91387" },
  { provider: "iaai", state: "GA", city: "SAVANNAH", zip: "31326" },
  { provider: "iaai", state: "NJ", city: "SAYREVILLE", zip: "08872" },
  { provider: "iaai", state: "PA", city: "SCRANTON", zip: "18640" },
  { provider: "iaai", state: "WA", city: "SEATTLE", zip: "98374" },
  { provider: "iaai", state: "WV", city: "SHADY SPRING", zip: "25918" },
  { provider: "iaai", state: "LA", city: "SHREVEPORT", zip: "71033" },
  { provider: "iaai", state: "SD", city: "SIOUX FALLS", zip: "57039" },
  { provider: "iaai", state: "IN", city: "SOUTH BEND", zip: "46619" },
  { provider: "iaai", state: "NJ", city: "SOUTHERN NEW JERSEY", zip: "08012" },
  { provider: "iaai", state: "IL", city: "SPECIALTY DIVISION", zip: "60173" },
  { provider: "iaai", state: "WA", city: "SPOKANE", zip: "99216" },
  { provider: "iaai", state: "MO", city: "SPRINGFIELD", zip: "65803" },
  { provider: "iaai", state: "MN", city: "ST. CLOUD", zip: "56367" },
  { provider: "iaai", state: "IL", city: "ST. LOUIS", zip: "62232" },
  { provider: "iaai", state: "NY", city: "STATEN ISLAND", zip: "10314" },
  { provider: "iaai", state: "CA", city: "STOCKTON", zip: "95205" },
  { provider: "iaai", state: "VA", city: "SUFFOLK", zip: "23434" },
  { provider: "iaai", state: "NY", city: "SYRACUSE", zip: "13039" },
  { provider: "iaai", state: "FL", city: "TAMPA", zip: "34221" },
  { provider: "iaai", state: "FL", city: "TAMPA NORTH", zip: "34667" },
  { provider: "iaai", state: "MA", city: "TAUNTON", zip: "02718" },
  { provider: "iaai", state: "MA", city: "TEMPLETON", zip: "01468" },
  { provider: "iaai", state: "VA", city: "TIDEWATER", zip: "23693" },
  { provider: "iaai", state: "GA", city: "TIFTON", zip: "31794" },
  { provider: "iaai", state: "AZ", city: "TUCSON", zip: "85714" },
  { provider: "iaai", state: "OK", city: "TULSA", zip: "74107" },
  { provider: "iaai", state: "ME", city: "VIRTUAL LANE A", zip: "04927" },
  { provider: "iaai", state: "ME", city: "VIRTUAL LANE B", zip: "04927" },
  { provider: "iaai", state: "ME", city: "VIRTUAL LANE C", zip: "04927" },
  { provider: "iaai", state: "FL", city: "WEST PALM BEACH", zip: "33478" },
  { provider: "iaai", state: "KS", city: "WICHITA", zip: "67219" },
  { provider: "iaai", state: "NC", city: "WILMINGTON", zip: "28429" },
  { provider: "iaai", state: "PA", city: "YORK SPRINGS", zip: "17372" },

  // ===== END IAAI =====
];
// ================= HELPERS =================
function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function clamp0(n: number) {
  return Math.max(0, Number.isFinite(n) ? n : 0);
}

function fmtMoney(n: number, currency: "USD" | "EUR" | "PLN") {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtNumber(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ================= ROZBICIE "DODATKOWE KOSZTY" + ABSORPCJA =================
type AdditionalBreakdown = {
  brokerage: number; // Opłata brokerska
  safeLoading: number; // Bezpieczny załadunek
  unloading: number; // Rozładunek
  securingMaterials: number; // Materiały zabezpieczające
  usaService: number; // Obsługa USA
  absorbedInland: number; // wchłonięte w transport lądowy
  absorbedOcean: number; // wchłonięte w transport morski
};

const ABSORB_INLAND_PCT = 0.2; // 20% additional -> inland (widok klienta)
const ABSORB_OCEAN_PCT = 0.2; // 20% additional -> ocean (widok klienta)

// pozostałe 60% rozbijamy na 5 pozycji (suma wag = 1.0)
const BREAKDOWN_WEIGHTS = {
  brokerage: 0.25,
  safeLoading: 0.2,
  unloading: 0.15,
  securingMaterials: 0.2,
  usaService: 0.2,
};

function allocateAdditionalCosts(additionalCosts: number): AdditionalBreakdown {
  const A = clamp0(additionalCosts);

  const absorbedInland = round2(A * ABSORB_INLAND_PCT);
  const absorbedOcean = round2(A * ABSORB_OCEAN_PCT);

  const remaining = round2(Math.max(0, A - absorbedInland - absorbedOcean));

  const brokerage = round2(remaining * BREAKDOWN_WEIGHTS.brokerage);
  const safeLoading = round2(remaining * BREAKDOWN_WEIGHTS.safeLoading);
  const unloading = round2(remaining * BREAKDOWN_WEIGHTS.unloading);
  const securingMaterials = round2(remaining * BREAKDOWN_WEIGHTS.securingMaterials);

  // domykamy do grosza na ostatniej pozycji
  const sumFirst4 = brokerage + safeLoading + unloading + securingMaterials;
  const usaService = round2(remaining - sumFirst4);

  return {
    brokerage,
    safeLoading,
    unloading,
    securingMaterials,
    usaService,
    absorbedInland,
    absorbedOcean,
  };
}

// ================= UI COMPONENTS =================
function InputRow(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  const { label, value, onChange, suffix, step } = props;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-sm text-white/80">{label}</div>
      <div className="flex items-center gap-2">
        <input
          className="w-36 rounded-lg bg-white/10 px-3 py-2 text-right text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
          type="number"
          step={step ?? 0.01}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        {suffix ? <div className="text-xs text-white/60 w-10">{suffix}</div> : null}
      </div>
    </div>
  );
}

function SelectRow<T extends string>(props: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const { label, value, onChange, options } = props;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-sm text-white/80">{label}</div>
      <select
        className="w-56 rounded-lg bg-white/10 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-neutral-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function LineItem(props: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <div className={"text-white/70 " + (props.bold ? "font-semibold" : "text-sm")}>
        {props.label}
      </div>
      <div className={"text-white " + (props.bold ? "text-base font-semibold" : "text-sm")}>
        {props.value}
      </div>
    </div>
  );
}

export default function Page() {
  // ================= STATE (INPUTS) =================
  const [tab, setTab] = useState<"calc" | "client">("calc");

  const [vehicleSize, setVehicleSize] = useState<VehicleSize>("sedan");
  const [port, setPort] = useState<PortKey>("NJ");
  const [auctionHouse, setAuctionHouse] = useState<AuctionHouse>("copart");

  // Podstawy USA (USD)
  const [priceWithAuctionFees, setPriceWithAuctionFees] = useState<number>(11390); // Cena z prowizją domu aukcyjnego
  const [inlandBase, setInlandBase] = useState<number>(400); // Transport lądowy (bazowy)
  const [oceanBase, setOceanBase] = useState<number>(PORTS[port].ocean); // Transport morski (bazowy)
  const [insurance, setInsurance] = useState<number>(200);
  const [additionalCosts, setAdditionalCosts] = useState<number>(1500);

  // Kursy / podatki / PL
  const [usdPln, setUsdPln] = useState<number>(4.25);
  const [usdEur, setUsdEur] = useState<number>(0.92);

  const [dutyRate, setDutyRate] = useState<number>(0.1); // cło 10% (przykładowo)
  const [vatRate, setVatRate] = useState<number>(0.23); // VAT 23%
  const [customsAgencyEur, setCustomsAgencyEur] = useState<number>(500); // agencja celna (EUR)

  const [plTransportPln, setPlTransportPln] = useState<number>(2800);
  const [plCommissionPln, setPlCommissionPln] = useState<number>(3300);

  // Depozyt
  const [depositPln, setDepositPln] = useState<number>(3300);

  // ================= DERIVED / CALC =================
  const breakdown = useMemo(() => allocateAdditionalCosts(additionalCosts), [additionalCosts]);

  // Auto size multipliers
  const inland = round2(clamp0(inlandBase) * INLAND_SIZE_MULTIPLIERS[vehicleSize]);
  const ocean = round2(clamp0(oceanBase) * SIZE_MULTIPLIERS[vehicleSize]);

  const totalUSA_USD = useMemo(() => {
    return round2(
      clamp0(priceWithAuctionFees) +
        inland +
        ocean +
        clamp0(insurance) +
        clamp0(additionalCosts)
    );
  }, [priceWithAuctionFees, inland, ocean, insurance, additionalCosts]);

  // Rotterdam section in EUR (bazujemy na totalUSA przeliczone na EUR)
  const baseEURO = round2(totalUSA_USD * clamp0(usdEur));
  const dutyEUR = round2(baseEURO * clamp0(dutyRate));
  const vatEUR = round2((baseEURO + dutyEUR) * clamp0(vatRate));
  const rotterdamTotalEUR = round2(dutyEUR + vatEUR + clamp0(customsAgencyEur));

  // Final PLN
  const totalPLN = round2(
    totalUSA_USD * clamp0(usdPln) + rotterdamTotalEUR * (clamp0(usdPln) / clamp0(usdEur || 1)) + // EUR->PLN z usdPln/usdEur
      clamp0(plTransportPln) +
      clamp0(plCommissionPln)
  );

  // Depozyt / maks licytacja
  const depositUSD = round2(clamp0(depositPln) / clamp0(usdPln || 1));
  const penaltyUSD = round2(depositUSD); // 10% = depozyt (jak u Ciebie na screenie)
  const maxBidUSD = round2(depositUSD * 10);

  // ================= CLIENT VIEW VALUES (ABSORPCJA) =================
  // W widoku klienta nie pokazujemy "Dodatkowe koszty".
  // Zamiast tego:
  // - inlandClient = inland + absorbedInland
  // - oceanClient  = ocean + absorbedOcean
  // - dodatkowe = 5 pozycji (sumują się do reszty)
  const inlandClient = round2(inland + breakdown.absorbedInland);
  const oceanClient = round2(ocean + breakdown.absorbedOcean);

  const additionalClientSum = round2(
    breakdown.brokerage +
      breakdown.safeLoading +
      breakdown.unloading +
      breakdown.securingMaterials +
      breakdown.usaService
  );

  const totalUSAClient_USD = round2(
    clamp0(priceWithAuctionFees) + inlandClient + oceanClient + clamp0(insurance) + additionalClientSum
  );

  // Bez ruszania ceł/VAT/PL — liczymy identycznie, tylko bazą jest totalUSAClient
  // (ALE ma wyjść ta sama suma, więc totalUSAClient == totalUSA_USD)
  const baseEUROClient = round2(totalUSAClient_USD * clamp0(usdEur));
  const dutyEURClient = round2(baseEUROClient * clamp0(dutyRate));
  const vatEURClient = round2((baseEUROClient + dutyEURClient) * clamp0(vatRate));
  const rotterdamTotalEURClient = round2(dutyEURClient + vatEURClient + clamp0(customsAgencyEur));

  const totalPLNClient = round2(
    totalUSAClient_USD * clamp0(usdPln) +
      rotterdamTotalEURClient * (clamp0(usdPln) / clamp0(usdEur || 1)) +
      clamp0(plTransportPln) +
      clamp0(plCommissionPln)
  );

  // ================= UI =================
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setTab("calc")}
            className={
              "rounded-xl px-4 py-2 text-sm ring-1 transition " +
              (tab === "calc"
                ? "bg-white/15 ring-white/30"
                : "bg-white/5 ring-white/10 hover:bg-white/10")
            }
          >
            Kalkulator
          </button>
          <button
            onClick={() => setTab("client")}
            className={
              "rounded-xl px-4 py-2 text-sm ring-1 transition " +
              (tab === "client"
                ? "bg-white/15 ring-white/30"
                : "bg-white/5 ring-white/10 hover:bg-white/10")
            }
          >
            Rozliczenie dla klienta
          </button>

          <div className="ml-auto text-xs text-white/50">
            (Wspólne wyliczenia • suma końcowa taka sama)
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* LEFT: Inputs */}
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="mb-3 text-lg font-semibold">Ustawienia</div>

            <SelectRow
              label="Dom aukcyjny"
              value={auctionHouse}
              onChange={setAuctionHouse}
              options={[
                { value: "copart", label: "Copart" },
                { value: "iaai", label: "IAAI" },
                { value: "manheim", label: "Manheim" },
              ]}
            />

            <SelectRow
              label="Rozmiar auta"
              value={vehicleSize}
              onChange={setVehicleSize}
              options={[
                { value: "sedan", label: "Sedan" },
                { value: "suv", label: "SUV" },
                { value: "bigsuv", label: "Duży SUV" },
                { value: "oversize", label: "Oversize" },
              ]}
            />

            <SelectRow
              label="Najbliższy port"
              value={port}
              onChange={(p) => {
                setPort(p);
                setOceanBase(PORTS[p].ocean);
              }}
              options={[
                { value: "NJ", label: "Port Newark / NJ" },
                { value: "GA", label: "Port Savannah / GA" },
                { value: "TX", label: "Port Houston / TX" },
                { value: "LA", label: "Port Los Angeles / CA" },
              ]}
            />

            <div className="my-4 h-px bg-white/10" />

            <div className="mb-2 text-sm font-semibold text-white/80">USA (USD)</div>
            <InputRow
              label="Cena z prowizją domu aukcyjnego"
              value={priceWithAuctionFees}
              onChange={(v) => setPriceWithAuctionFees(clamp0(v))}
              suffix="USD"
            />
            <InputRow
              label="Transport lądowy (bazowy)"
              value={inlandBase}
              onChange={(v) => setInlandBase(clamp0(v))}
              suffix="USD"
            />
            <InputRow
              label="Transport morski (bazowy)"
              value={oceanBase}
              onChange={(v) => setOceanBase(clamp0(v))}
              suffix="USD"
            />
            <InputRow
              label="Ubezpieczenie"
              value={insurance}
              onChange={(v) => setInsurance(clamp0(v))}
              suffix="USD"
            />

            {tab === "calc" ? (
              <InputRow
                label="Dodatkowe koszty"
                value={additionalCosts}
                onChange={(v) => setAdditionalCosts(clamp0(v))}
                suffix="USD"
              />
            ) : (
              <div className="mt-2 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <div className="text-xs text-white/60 mb-2">
                  W rozliczeniu klienta nie pokazujemy „Dodatkowych kosztów”.
                </div>
                <div className="text-xs text-white/70">
                  Rozbijane + częściowo wchłaniane do transportów (suma bez zmian).
                </div>
              </div>
            )}

            <div className="my-4 h-px bg-white/10" />

            <div className="mb-2 text-sm font-semibold text-white/80">Kursy / Rotterdam / PL</div>
            <InputRow label="USD→PLN" value={usdPln} onChange={(v) => setUsdPln(clamp0(v))} step={0.0001} />
            <InputRow label="USD→EUR" value={usdEur} onChange={(v) => setUsdEur(clamp0(v))} step={0.0001} />
            <InputRow
              label="Cło (stawka)"
              value={dutyRate}
              onChange={(v) => setDutyRate(clamp0(v))}
              step={0.001}
              suffix=""
            />
            <InputRow
              label="VAT (stawka)"
              value={vatRate}
              onChange={(v) => setVatRate(clamp0(v))}
              step={0.001}
              suffix=""
            />
            <InputRow
              label="Agencja celna"
              value={customsAgencyEur}
              onChange={(v) => setCustomsAgencyEur(clamp0(v))}
              suffix="EUR"
            />
            <InputRow
              label="PL: Transport"
              value={plTransportPln}
              onChange={(v) => setPlTransportPln(clamp0(v))}
              suffix="PLN"
            />
            <InputRow
              label="PL: Prowizja"
              value={plCommissionPln}
              onChange={(v) => setPlCommissionPln(clamp0(v))}
              suffix="PLN"
            />

            <div className="my-4 h-px bg-white/10" />

            <div className="mb-2 text-sm font-semibold text-white/80">Depozyt</div>
            <InputRow
              label="Depozyt (PLN)"
              value={depositPln}
              onChange={(v) => setDepositPln(clamp0(v))}
              suffix="PLN"
            />

            {/* Placeholder dla placów – żeby Ci nie rozjechało logiki po wklejeniu listy */}
            <div className="mt-4 text-xs text-white/40">
              Place/yards: masz placeholder <span className="text-white/60">YARDS_USA</span>. Wklej listę u góry pliku.
            </div>
          </div>

          {/* RIGHT: Result card like your screen */}
          <div className="rounded-[28px] bg-gradient-to-b from-black to-neutral-900 p-6 ring-1 ring-white/10">
            <div className="text-xs tracking-widest text-white/50">NAJBLIŻSZY PORT</div>
            <div className="text-3xl font-semibold">{PORTS[port].name}</div>

            <div className="my-6 h-px bg-white/10" />

            {/* USA (USD) */}
            <div className="text-xs tracking-widest text-white/40">USA (USD)</div>

            {tab === "calc" ? (
              <>
                <LineItem
                  label="Cena z prowizją domu aukcyjnego:"
                  value={fmtMoney(priceWithAuctionFees, "USD")}
                  bold
                />
                <LineItem label="Transport lądowy:" value={fmtMoney(inland, "USD")} bold />
                <LineItem label="Transport morski:" value={fmtMoney(ocean, "USD")} bold />
                <LineItem label="Ubezpieczenie:" value={fmtMoney(insurance, "USD")} bold />
                <LineItem label="Dodatkowe koszty:" value={fmtMoney(additionalCosts, "USD")} bold />
                <div className="mt-2" />
                <LineItem label="Razem:" value={fmtMoney(totalUSA_USD, "USD")} bold />
              </>
            ) : (
              <>
                <LineItem
                  label="Cena z prowizją domu aukcyjnego:"
                  value={fmtMoney(priceWithAuctionFees, "USD")}
                  bold
                />
                <LineItem label="Transport lądowy:" value={fmtMoney(inlandClient, "USD")} bold />
                <LineItem label="Transport morski:" value={fmtMoney(oceanClient, "USD")} bold />
                <LineItem label="Ubezpieczenie:" value={fmtMoney(insurance, "USD")} bold />

                <div className="mt-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-xs tracking-widest text-white/50 mb-2">ROZBICIE (ZAMIAST “DODATKOWE KOSZTY”)</div>
                  <LineItem label="Opłata brokerska:" value={fmtMoney(breakdown.brokerage, "USD")} />
                  <LineItem label="Bezpieczny załadunek:" value={fmtMoney(breakdown.safeLoading, "USD")} />
                  <LineItem label="Rozładunek:" value={fmtMoney(breakdown.unloading, "USD")} />
                  <LineItem label="Materiały zabezpieczające:" value={fmtMoney(breakdown.securingMaterials, "USD")} />
                  <LineItem label="Obsługa USA:" value={fmtMoney(breakdown.usaService, "USD")} />
                </div>

                <div className="mt-2" />
                <LineItem label="Razem:" value={fmtMoney(totalUSAClient_USD, "USD")} bold />
              </>
            )}

            <div className="my-6 h-px bg-white/10" />

            {/* Rotterdam (EUR) */}
            <div className="text-xs tracking-widest text-white/40">ROTTERDAM (EUR)</div>

            {tab === "calc" ? (
              <>
                <LineItem label="Cło:" value={fmtMoney(dutyEUR, "EUR")} bold />
                <LineItem label="VAT:" value={fmtMoney(vatEUR, "EUR")} bold />
                <LineItem label="Agencja celna:" value={fmtMoney(customsAgencyEur, "EUR")} bold />
                <div className="mt-2" />
                <LineItem label="Razem:" value={fmtMoney(rotterdamTotalEUR, "EUR")} bold />
              </>
            ) : (
              <>
                <LineItem label="Cło:" value={fmtMoney(dutyEURClient, "EUR")} bold />
                <LineItem label="VAT:" value={fmtMoney(vatEURClient, "EUR")} bold />
                <LineItem label="Agencja celna:" value={fmtMoney(customsAgencyEur, "EUR")} bold />
                <div className="mt-2" />
                <LineItem label="Razem:" value={fmtMoney(rotterdamTotalEURClient, "EUR")} bold />
              </>
            )}

            <div className="my-6 h-px bg-white/10" />

            {/* Polska (PLN) */}
            <div className="text-xs tracking-widest text-white/40">POLSKA (PLN)</div>
            <LineItem label="Transport:" value={fmtMoney(plTransportPln, "PLN")} bold />
            <LineItem label="Prowizja:" value={fmtMoney(plCommissionPln, "PLN")} bold />

            <div className="my-10" />

            {/* Total */}
            <div className="text-white/50 text-sm">Łączny koszt</div>
            <div className="mt-1 text-6xl font-bold tracking-tight">
              {tab === "calc" ? fmtNumber(totalPLN) : fmtNumber(totalPLNClient)}{" "}
              <span className="text-2xl font-semibold text-white/80">PLN</span>
            </div>

            <div className="my-8 h-px bg-white/10" />

            {/* Deposit / max bid */}
            <div className="text-white/50 text-sm">DEPOZYT {fmtNumber(depositPln)} PLN</div>
            <div className="mt-3 space-y-1">
              <LineItem label="Depozyt w USD:" value={fmtMoney(depositUSD, "USD")} bold />
              <LineItem label="Kara umowna (10%):" value={fmtMoney(penaltyUSD, "USD")} bold />
            </div>
            <div className="mt-4 text-3xl font-semibold">
              Maks. licytacja: {fmtNumber(maxBidUSD)} <span className="text-white/80">USD</span>
            </div>

            {/* sanity check small */}
            <div className="mt-6 text-xs text-white/35">
              Kontrola: USA(calc)={fmtNumber(totalUSA_USD)} / USA(client)={fmtNumber(totalUSAClient_USD)} (powinny być równe)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
