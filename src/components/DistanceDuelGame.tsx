import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import { motion } from "motion/react";
import { Compass, Trophy, ArrowRight, RefreshCw, ChevronLeft, MapPin } from "lucide-react";

// Types
interface CityDetails {
  name: string;
  lat: number;
  lng: number;
}

interface DistancePair {
  cityA: CityDetails;
  cityB: CityDetails;
  actualDistance: number; // km
}

interface RoundResult {
  round: number;
  pair: DistancePair;
  estimate: number;
  difference: number;
  pctError: number;
  points: number;
}

interface DistanceDuelGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// 10 pairs of cities with actual distances in km
const DISTANCE_PAIRS: DistancePair[] = [
  {
    cityA: { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
    cityB: { name: "Cairo", lat: 30.0444, lng: 31.2357 },
    actualDistance: 9560
  },
  {
    cityA: { name: "London", lat: 51.5074, lng: -0.1278 },
    cityB: { name: "New York", lat: 40.7128, lng: -74.0060 },
    actualDistance: 5570
  },
  {
    cityA: { name: "Sydney", lat: -33.8688, lng: 151.2093 },
    cityB: { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    actualDistance: 12050
  },
  {
    cityA: { name: "Paris", lat: 48.8566, lng: 2.3522 },
    cityB: { name: "Moscow", lat: 55.7558, lng: 37.6173 },
    actualDistance: 2480
  },
  {
    cityA: { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
    cityB: { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
    actualDistance: 6050
  },
  {
    cityA: { name: "Beijing", lat: 39.9042, lng: 116.4074 },
    cityB: { name: "Delhi", lat: 28.6139, lng: 77.2090 },
    actualDistance: 3790
  },
  {
    cityA: { name: "Berlin", lat: 52.5200, lng: 13.4050 },
    cityB: { name: "Rome", lat: 41.9028, lng: 12.4964 },
    actualDistance: 1180
  },
  {
    cityA: { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    cityB: { name: "Singapore", lat: 1.3521, lng: 103.8198 },
    actualDistance: 3900
  },
  {
    cityA: { name: "Nairobi", lat: -1.2921, lng: 36.8219 },
    cityB: { name: "Dubai", lat: 25.2048, lng: 55.2708 },
    actualDistance: 3560
  },
  {
    cityA: { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
    cityB: { name: "Madrid", lat: 40.4168, lng: -3.7038 },
    actualDistance: 10050
  }
];

// Constants for slider controls
const SLIDER_MAX_LIMIT_KM = 20000;
const MAX_POINTS = 1000;

export default function DistanceDuelGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: DistanceDuelGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [estimateValue, setEstimateValue] = useState<number>(1000);
  const [isDirty, setIsDirty] = useState<boolean>(false); // Prevent submitting initial unchanged estimate
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [roundPoints, setRoundPoints] = useState<number>(0);
  const [roundErrorPct, setRoundErrorPct] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [resultsList, setResultsList] = useState<RoundResult[]>([]);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerARef = useRef<L.Marker | null>(null);
  const markerBRef = useRef<L.Marker | null>(null);
  const geodesicLineRef = useRef<L.Polyline | null>(null);

  const currentPair = DISTANCE_PAIRS[currentRoundIndex];

  // Initialize decorative, non-interactive static map
  useEffect(() => {
    if (isGameOver || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize fully static/non-interactive map container
    const leafletMap = L.map(mapContainerRef.current, {
      center: [20.0, 0.0],
      zoom: 1,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false
    });

    // Darker / Muted voyager no labels for rich visual context
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(leafletMap);

    mapRef.current = leafletMap;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerARef.current = null;
        markerBRef.current = null;
        geodesicLineRef.current = null;
      }
    };
  }, [currentRoundIndex, isGameOver]);

  // Update map visual pins and fit bounds whenever active cities shift
  useEffect(() => {
    const leafMap = mapRef.current;
    if (!leafMap || isGameOver) return;

    // Clear previous elements
    if (markerARef.current) leafMap.removeLayer(markerARef.current);
    if (markerBRef.current) leafMap.removeLayer(markerBRef.current);
    if (geodesicLineRef.current) leafMap.removeLayer(geodesicLineRef.current);

    const posA: [number, number] = [currentPair.cityA.lat, currentPair.cityA.lng];
    const posB: [number, number] = [currentPair.cityB.lat, currentPair.cityB.lng];

    // City markers
    const iconA = L.divIcon({
      className: "city-marker-a",
      html: `<div class="w-7 h-7 bg-gray-900 border-2 border-white rounded-full flex flex-col items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2">
              <span class="text-[9px] text-white font-extrabold font-mono">A</span>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const iconB = L.divIcon({
      className: "city-marker-b",
      html: `<div class="w-7 h-7 bg-gray-900 border-2 border-white rounded-full flex flex-col items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2">
              <span class="text-[9px] text-white font-extrabold font-mono">B</span>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const markerA = L.marker(posA, { icon: iconA })
      .addTo(leafMap)
      .bindTooltip(`<b>${currentPair.cityA.name}</b>`, { permanent: true, direction: "top", offset: [0, -5] });

    const markerB = L.marker(posB, { icon: iconB })
      .addTo(leafMap)
      .bindTooltip(`<b>${currentPair.cityB.name}</b>`, { permanent: true, direction: "top", offset: [0, -5] });

    markerARef.current = markerA;
    markerBRef.current = markerB;

    // Decorative connection line
    const connectionLine = L.polyline([posA, posB], {
      color: "#1f2937",
      weight: 3,
      dashArray: "4, 6"
    }).addTo(leafMap);

    geodesicLineRef.current = connectionLine;

    // Auto fit visual bounds so player gets perfect visual sizing
    const group = L.featureGroup([markerA, markerB]);
    leafMap.fitBounds(group.getBounds().pad(0.35));
    
    // Invalidate size fallback
    setTimeout(() => {
      leafMap.invalidateSize();
    }, 150);

  }, [currentRoundIndex, isGameOver, currentPair]);

  // Sync controls and inputs
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstimateValue(Number(e.target.value));
    setIsDirty(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let num = Number(e.target.value);
    if (isNaN(num)) return;
    if (num > SLIDER_MAX_LIMIT_KM) num = SLIDER_MAX_LIMIT_KM;
    if (num < 0) num = 0;

    setEstimateValue(num);
    setIsDirty(true);
  };

  // Lock in Estimate and score
  const handleSubmitEstimate = () => {
    if (!isDirty || isSubmitted) return;

    setIsSubmitted(true);

    const actual = currentPair.actualDistance;
    const diff = Math.abs(estimateValue - actual);
    const pctError = diff / actual;

    // SCORING CONFIGURATION (Percentage Error Curve)
    // Within 10% of actual gets full 1000 points.
    // Degrades to zero past 50% error.
    let points = 0;
    if (pctError <= 0.10) {
      points = 1000;
    } else if (pctError >= 0.50) {
      points = 0;
    } else {
      // Proportional decline from 10% to 50% error
      const ratio = (pctError - 0.10) / (0.50 - 0.10);
      points = Math.round(1000 * (1 - ratio));
    }

    setRoundPoints(points);
    setRoundErrorPct(pctError);
    setCumulativeScore((prev) => prev + points);

    const resultEntry: RoundResult = {
      round: currentRoundIndex + 1,
      pair: currentPair,
      estimate: estimateValue,
      difference: diff,
      pctError,
      points
    };

    setResultsList((prev) => [...prev, resultEntry]);
  };

  const handleNextRound = () => {
    setIsSubmitted(false);
    setIsDirty(false);
    setEstimateValue(1000); // Reset guess
    setRoundPoints(0);
    setRoundErrorPct(0);

    if (currentRoundIndex + 1 < DISTANCE_PAIRS.length) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentRoundIndex(0);
    setCumulativeScore(0);
    setEstimateValue(1000);
    setIsDirty(false);
    setIsSubmitted(false);
    setRoundPoints(0);
    setRoundErrorPct(0);
    setIsGameOver(false);
    setResultsList([]);
  };

  // End screen metrics
  const totalScore = resultsList.reduce((acc, r) => acc + r.points, 0);
  const avgPctError = resultsList.length > 0
    ? (resultsList.reduce((acc, r) => acc + r.pctError, 0) / resultsList.length) * 100
    : 0;

  // Find best round (round with highest points or lowest percent error)
  const bestRound = resultsList.length > 0
    ? [...resultsList].sort((a, b) => b.points - a.points || a.pctError - b.pctError)[0]
    : null;

  return (
    <div className="w-full flex flex-col gap-6" id="distance_duel_wrapper">
      {/* Header navigations */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="dd_header_nav">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer"
          id="btn_dd_exit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-xs font-black text-gray-900 uppercase">Distance Duel</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="dd_running_grid">
          
          {/* Main Visual Panels holding non-interactive Map (65% width) */}
          <div className="lg:col-span-8 flex flex-col gap-4" id="dd_map_side">
            
            {/* Header prompt details */}
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="dd_header_prompt">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  ROUND {currentRoundIndex + 1} OF {DISTANCE_PAIRS.length}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-gray-950 uppercase tracking-tight mt-0.5">
                  How far is <span className="underline decoration-2 decoration-gray-950 underline-offset-2">{currentPair.cityA.name}</span> from <span className="underline decoration-2 decoration-gray-950 underline-offset-2">{currentPair.cityB.name}</span>?
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Examine the locations plotted on the static map below and submit your physical kilometer distance estimate.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-[8px] self-start sm:self-auto">
                <div className="text-center px-1">
                  <span className="text-[9px] text-gray-400 font-mono uppercase block">RUNNING SCORE</span>
                  <span className="text-sm font-mono font-black text-gray-950">{cumulativeScore}</span>
                </div>
              </div>
            </div>

            {/* Static background map for visual context */}
            <div className="relative flex flex-col bg-white rounded-[12px] border border-gray-250 p-1.5 shadow-sm overflow-hidden h-[360px]" id="dd_map_holder">
              <span className="absolute top-4 left-4 z-40 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-[6px] border border-gray-700 text-[10px] font-semibold text-white pointer-events-none tracking-wider uppercase font-mono">
                🗺️ Decorative Static Reference
              </span>
              <div ref={mapContainerRef} className="w-full h-full min-h-[340px] custom-leaflet-map" id="dd_leaflet_stage" style={{ zIndex: 10 }} />
            </div>

          </div>

          {/* Controller input and result logs (35% width) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="dd_sidebar_side">
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[320px]">
              
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 mb-4">
                  Distance Estimation Panel
                </h3>

                {!isSubmitted ? (
                  /* Estimate Input Mode */
                  <div className="space-y-6" id="dd_input_state">
                    
                    {/* Large Estimate Readout */}
                    <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 text-center">
                      <span className="text-[9px] text-gray-400 font-mono uppercase block mb-1">CURRENT ESTIMATE</span>
                      <strong className="text-2xl font-mono font-black text-gray-950">
                        {estimateValue.toLocaleString()} <span className="text-sm font-bold">km</span>
                      </strong>
                    </div>

                    {/* Horizontal slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                        <span>0 km</span>
                        <span>10,000 km</span>
                        <span>20,000 km</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={SLIDER_MAX_LIMIT_KM}
                        step="50"
                        value={estimateValue}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900 focus:outline-none"
                        id="dd_slider"
                      />
                    </div>

                    {/* Numeric Input sync */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="dd_num_input">
                        Precise Kilometer Value
                      </label>
                      <div className="relative">
                        <input
                          id="dd_num_input"
                          type="number"
                          min="0"
                          max={SLIDER_MAX_LIMIT_KM}
                          value={estimateValue}
                          onChange={handleTextChange}
                          placeholder="Type distance value..."
                          className="w-full bg-white border border-gray-200 hover:border-gray-400 focus:border-gray-950 rounded-[8px] px-3.5 py-2 text-gray-900 font-mono text-xs focus:outline-none font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-gray-400">
                          KM
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-normal font-semibold">
                      Drag the slider or type a precise metric in the input. Click submit to lock.
                    </p>

                    <button
                      onClick={handleSubmitEstimate}
                      disabled={!isDirty}
                      className="w-full bg-gray-950 hover:bg-black disabled:opacity-30 disabled:hover:bg-gray-950 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-[8px] cursor-pointer transition-all"
                      id="btn_dd_submit"
                    >
                      Submit Estimate
                    </button>

                  </div>
                ) : (
                  /* Feedback Revealed Mode */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                    id="dd_feedback_state"
                  >
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      Estimation Assessment
                    </h4>

                    {/* Score results */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-55 border border-gray-200 p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">ACTUAL DISTANCE</span>
                        <strong className="text-base font-mono font-black text-gray-950">
                          {currentPair.actualDistance.toLocaleString()} <span className="text-[10px]">km</span>
                        </strong>
                      </div>

                      <div className="bg-gray-900 text-white p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">SCORE EARNED</span>
                        <strong className="text-xl font-mono font-black text-emerald-400">+{roundPoints}</strong>
                        <span className="block text-[8px] text-gray-400 mt-0.5 uppercase tracking-wider">out of 1000</span>
                      </div>
                    </div>

                    {/* Stat detail box */}
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Your Estimate:</span>
                        <strong className="text-gray-900 font-mono">{estimateValue.toLocaleString()} km</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Difference Error:</span>
                        <strong className="text-gray-900 font-mono">
                          {Math.abs(estimateValue - currentPair.actualDistance).toLocaleString()} km
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Percentage Error:</span>
                        <strong className="text-gray-900 font-mono">
                          {(roundErrorPct * 100).toFixed(1)}%
                        </strong>
                      </div>
                    </div>

                    {/* Visual bar scale comparison indicator */}
                    <div className="space-y-2" id="dd_comparison_bar">
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                        ESTIMATE VS ACTUAL COMPARISON
                      </span>
                      <div className="space-y-1">
                        {/* Estimate Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-0.5">
                            <span>Your Estimate</span>
                            <span className="font-mono">{estimateValue.toLocaleString()} km</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gray-400 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (estimateValue / SLIDER_MAX_LIMIT_KM) * 100)}%` }}
                            />
                          </div>
                        </div>
                        {/* Actual Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-0.5">
                            <span>Actual Distance</span>
                            <span className="font-mono">{currentPair.actualDistance.toLocaleString()} km</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gray-900 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (currentPair.actualDistance / SLIDER_MAX_LIMIT_KM) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleNextRound}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="btn_dd_next_round"
                    >
                      <span>
                        {currentRoundIndex + 1 === DISTANCE_PAIRS.length ? "View Game Summary" : "Next Match"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

              </div>

              {/* Rules summary info */}
              <div className="border-t border-gray-150 pt-3 mt-4 text-[10px] text-gray-400 font-mono leading-relaxed select-none">
                <span className="block font-bold">RULES SPECIFICATION:</span>
                • Within 10% error = {MAX_POINTS}pts (proportional scaling)<br />
                • Score reduces to zero past 50% error
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Game Over report summary screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl mx-auto bg-white border border-gray-250 rounded-[16px] p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative z-20"
          id="dd_summary_block"
        >
          <div className="relative mb-5">
            <div className="relative w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-8 h-8 text-gray-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
            Distance Duel Completed!
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
            KILOMETER ESTIMATION REPORT CARD
          </p>

          <div className="grid grid-cols-3 gap-3 w-full text-center border-t border-b border-gray-200 py-6 mb-6">
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                COMBINED POINTS
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {totalScore}
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                AVG. PERCENT ERROR
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {avgPctError.toFixed(1)}%
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                BEST ROUND
              </span>
              <strong className="text-sm font-black text-gray-900 block truncate mt-1">
                {bestRound ? `#${bestRound.round} (${(bestRound.pctError * 100).toFixed(1)}% error)` : "N/A"}
              </strong>
            </div>
          </div>

          {/* Breakdown logs */}
          <div className="w-full text-left space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-6" id="dd_rounds_log">
            <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
              Estimation Round History
            </h4>
            {resultsList.map((res) => (
              <div
                key={res.round}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-[8px] flex items-center justify-between text-xs font-semibold"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400 font-mono">#{String(res.round).padStart(2, "0")}</span>
                    <span className="text-gray-950">{res.pair.cityA.name} ➔ {res.pair.cityB.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">
                    Actual: {res.pair.actualDistance.toLocaleString()} km | Est: {res.estimate.toLocaleString()} km
                  </span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-[10px] text-gray-500 font-mono">{(res.pctError * 100).toFixed(1)}% error</span>
                  <span className="text-xs font-black text-gray-900 font-mono">+{res.points}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="dd_end_actions">
            <button
              onClick={() => onFinishGame(totalScore, "Distance Duel")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_dd_save"
            >
              Submit & Save Duel Score
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold"
              id="btn_dd_retry"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Duel Challenge</span>
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}
