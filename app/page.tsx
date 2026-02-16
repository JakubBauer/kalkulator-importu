"use client";
import React, { useEffect, useMemo, useState } from "react";

// ================= PORTY USA =================
// Nowe ceny bazowe transportu morskiego
const PORTS = {
  NJ: { name: "Port Newark / NJ", lat: 40.6887, lon: -74.1482, ocean: 900 },
  GA: { name: "Port Savannah / GA", lat: 32.0835, lon: -81.0971, ocean: 900 },
  TX: { name: "Port Houston / TX", lat: 29.7323, lon: -95.262, ocean: 975 },
  LA: { name: "Port Los Angeles / CA", lat: 33.7326, lon: -118.2737, ocean: 1500 },
};

// ================= MNOŻNIKI WIELKOŚCI AUTA =================
const SIZE_MULTIPLIERS: Record<string, number> = {
  sedan: 1,
  suv: 1.2,
  bigsuv: 1.5,
  oversize: 2,
};

// ================= STAŁE KOSZTOWE =================
// Prowizja domu aukcyjnego (USD):
// - do 1000 USD: 580 USD (min. 580)
// - 1000–2000: 34,5%
// - 2000–3000: 29,5%
// - 3000–4000: 24,5%
// - 4000–5000: 19,5%
// - 5000–10000: interpolacja 19,5% → 12,7%
// - 10000–15000: interpolacja 12,7% → 10,7%
// - 15000–20000: interpolacja 10,7% → 8,8%
// - 20000–40000: interpolacja 8,8% → 8,0%
// - powyżej 40000: 8,0% (nie schodzimy poniżej)
const AUCTION_MIN_FEE = 580;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function calcAuctionRate(priceUSD: number) {
  const p = priceUSD;
  if (p <= 1000) return 0; // fee jest stałe
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
  if (priceUSD <= 1000) return AUCTION_MIN_FEE;
  const rate = calcAuctionRate(priceUSD);
  return Math.max(priceUSD * rate, AUCTION_MIN_FEE);
}
const INLAND_RATE = 2;
const INLAND_MIN = 300;

const INSURANCE_RATE = 0.02;
const INSURANCE_MIN = 200;

const CUSTOMS_AGENCY_EUR = 600;
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
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&postalcode=${zip}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) } as { lat: number; lon: number };
}

async function fetchNBPRate(code: string) {
  try {
    const res = await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/A/${code}/?format=json`
    );
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

export default function ImportCalculatorPL() {
  const [vehiclePrice, setVehiclePrice] = useState("25000");
  const [auctionHouse, setAuctionHouse] = useState<"copart" | "iaai">("copart");
  const [vehicleSize, setVehicleSize] = useState<"sedan" | "suv" | "bigsuv" | "oversize">("sedan");
  const [buyerType, setBuyerType] = useState<"private" | "company">("private");
  const [zip, setZip] = useState("07001");
  const [insuranceEnabled, setInsuranceEnabled] = useState(true);
  const [extraCosts, setExtraCosts] = useState("0");

  const [usdPln, setUsdPln] = useState(0);
  const [eurPln, setEurPln] = useState(0);

  const [yardCoords, setYardCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [nearestPortKey, setNearestPortKey] = useState<keyof typeof PORTS>("NJ");

  useEffect(() => {
    async function loadRates() {
      const usd = await fetchNBPRate("USD");
      const eur = await fetchNBPRate("EUR");
      if (usd) setUsdPln(usd);
      if (eur) setEurPln(eur);
    }
    loadRates();
  }, []);

  useEffect(() => {
    async function run() {
      const geo = await geocodeZipUS(zip);
      if (!geo) return;
      setYardCoords(geo);

      let best: number | null = null;
      let bestKey: keyof typeof PORTS = "NJ";

      (Object.entries(PORTS) as Array<[keyof typeof PORTS, (typeof PORTS)[keyof typeof PORTS]]>).forEach(
        ([key, port]) => {
          const miles = haversineMiles(geo.lat, geo.lon, port.lat, port.lon);
          if (best === null || miles < best) {
            best = miles;
            bestKey = key;
          }
        }
      );

      setNearestPortKey(bestKey);
    }
    run();
  }, [zip]);

  const calc = useMemo(() => {
    const v = parseNum(vehiclePrice);
    const extra = parseNum(extraCosts);

    const port = PORTS[nearestPortKey];
    const sizeMultiplier = SIZE_MULTIPLIERS[vehicleSize];

    let miles = 0;
    if (yardCoords) {
      miles = haversineMiles(yardCoords.lat, yardCoords.lon, port.lat, port.lon);
    }

    // ===== USA =====
    // Prowizja wg progów (nie zależy od Copart/IAAI w tej wersji)
    const auctionFee = calcAuctionFee(v);

    const inland = Math.max(miles * INLAND_RATE, INLAND_MIN);
    const ocean = port.ocean * sizeMultiplier;

    const insurance = insuranceEnabled ? Math.max(v * INSURANCE_RATE, INSURANCE_MIN) : 0;

    const usaTotalUSD = v + auctionFee + inland + ocean + insurance + extra;

    // ===== ROTTERDAM (EUR) =====
    let dutyEUR = 0;
    let vatEUR = 0;

    // Dla aut < 3000 USD: nawet przy "Osoba prywatna" liczymy jak dla firmy
    const effectiveBuyerType: "private" | "company" =
      buyerType === "private" && v < 3000 ? "company" : buyerType;

    if (effectiveBuyerType === "private") {
      // OSOBA PRYWATNA
      // CŁO: (zakup * 60%) USD -> EUR -> *10%
      const baseEUR = usdToEur(v * 0.6, usdPln, eurPln);
      const dutyRaw = baseEUR * 0.10;

      // VAT: (zakup * 60%) USD -> EUR + cło -> *21%
      const vatRaw = (baseEUR + dutyRaw) * 0.21;

      dutyEUR = dutyRaw;
      vatEUR = vatRaw;
    } else {
      // FIRMA
      // CŁO: od (auto + inland + ocean + ubezpieczenie) -> EUR -> *10%
      const customsValueEUR = usdToEur(v + inland + ocean + insurance, usdPln, eurPln);
      const dutyRaw = customsValueEUR * 0.10;

      // VAT: od (auto + inland + ocean) -> EUR + cło -> *21%
      const vatBaseEUR = usdToEur(v + inland + ocean, usdPln, eurPln);
      const vatRaw = (vatBaseEUR + dutyRaw) * 0.21;

      dutyEUR = dutyRaw;
      vatEUR = vatRaw;
    }

    // Minimalne opłaty w Rotterdamie
    // Cło nie mniej niż 300 EUR
    dutyEUR = Math.max(dutyEUR, 300);
    // VAT liczony wyłącznie wg wzoru (bez minimalnej wartości)

    const rotterdamTotalEUR = dutyEUR + vatEUR + CUSTOMS_AGENCY_EUR;

    // ===== PLN =====
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
    auctionHouse,
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
            onChange={(e) => setBuyerType(e.target.value as "private" | "company")}
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
            onChange={(e) => setAuctionHouse(e.target.value as "copart" | "iaai")}
          >
            <option value="copart">Copart</option>
            <option value="iaai">IAAI</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Wielkość auta</label>
          <select
            className="border p-2 w-full"
            value={vehicleSize}
            onChange={(e) => setVehicleSize(e.target.value as any)}
          >
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="bigsuv">Big SUV</option>
            <option value="oversize">Oversize</option>
          </select>
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
          <input
            className="border p-2 w-full"
            value={extraCosts}
            onChange={(e) => setExtraCosts(e.target.value)}
          />
        </div>
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
        {parseNum(extraCosts) > 0 && (
          <div>Dodatkowe wydatki: {n2(parseNum(extraCosts))} USD</div>
        )}
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
