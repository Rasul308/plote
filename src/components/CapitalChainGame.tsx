import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import { motion } from "motion/react";
import { Compass, Trophy, ArrowRight, RefreshCw, ChevronLeft, MapPin } from "lucide-react";

// Types
interface CapitalCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface RoundResult {
  round: number;
  capital: CapitalCity;
  guess: [number, number] | null;
  distance: number; // km
  points: number;
}

interface CapitalChainGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// 1. Placeholder 10 Capital Cities list
const CAPITAL_CITIES: CapitalCity[] = [
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402 },
  { name: "Prague", country: "Czechia", lat: 50.0755, lon: 14.4378 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122 },
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275 },
];

// SCORING CONFIGURATION CONSTANTS (Grayscale Neutral & customizable)
const PERFECT_THRESHOLD_KM = 50; // Distance inside which user gets maximum points (1000)
const MAX_THRESHOLD_KM = 1500;   // Distance past which user gets 0 points
const MAX_POINTS = 1000;          // Maximum possible points per round

// Local helper to calculate distances in kilometers (Haversine formula)
function calculateDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function CapitalChainGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en",
}: CapitalChainGameProps) {
  // Game states
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(false);
  const [roundPoints, setRoundPoints] = useState<number>(0);
  const [roundDistance, setRoundDistance] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [resultsList, setResultsList] = useState<RoundResult[]>([]);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const guessMarkerRef = useRef<L.Marker | null>(null);
  const actualMarkerRef = useRef<L.Marker | null>(null);
  const connectorLineRef = useRef<L.Polyline | null>(null);

  const currentCapital = CAPITAL_CITIES[currentRoundIndex];

  // 2. Initialize Leaflet Map once on render
  useEffect(() => {
    if (isGameOver || !mapContainerRef.current) return;

    // Reset previous map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize map centered at Europe core
    const leafletMap = L.map(mapContainerRef.current, {
      center: [48.0, 14.0],
      zoom: 4,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 12,
    });

    L.control.zoom({ position: "topright" }).addTo(leafletMap);

    // Warm carto light maps voyages tile layer (grayscale clean neutral look)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(leafletMap);

    mapRef.current = leafletMap;

    // Listen to Map click events
    leafletMap.on("click", (e: L.LeafletMouseEvent) => {
      // If of locked state, ignore further clicks
      setIsLockedIn((locked) => {
        if (locked) return true;

        const clickedCoords: [number, number] = [e.latlng.lat, e.latlng.lng];
        setGuessCoords(clickedCoords);

        // Update or draw guess marker
        if (guessMarkerRef.current) {
          guessMarkerRef.current.setLatLng(e.latlng);
        } else {
          const guessIcon = L.divIcon({
            className: "custom-guess-icon",
            html: `<div class="w-6 h-6 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-default animate-bounce">
                    <span class="w-2 h-2 bg-white rounded-full"></span>
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          guessMarkerRef.current = L.marker(e.latlng, { icon: guessIcon }).addTo(leafletMap);
        }

        return false;
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        guessMarkerRef.current = null;
        actualMarkerRef.current = null;
        connectorLineRef.current = null;
      }
    };
  }, [currentRoundIndex, isGameOver]);

  // Handle map size adjusting on frame changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [guessCoords]);

  // 3. Lock In Guess and Calculate Score
  const handleLockIn = () => {
    if (!guessCoords || !mapRef.current) return;

    setIsLockedIn(true);

    const [guessLat, guessLon] = guessCoords;
    const distance = calculateDistanceKM(guessLat, guessLon, currentCapital.lat, currentCapital.lon);

    // Scoring logic:
    // Within PERFECT_THRESHOLD_KM gets full 1000 pts
    // Decreases proportionally up to MAX_THRESHOLD_KM
    let points = 0;
    if (distance <= PERFECT_THRESHOLD_KM) {
      points = MAX_POINTS;
    } else if (distance < MAX_THRESHOLD_KM) {
      points = Math.round(MAX_POINTS * (1 - (distance - PERFECT_THRESHOLD_KM) / (MAX_THRESHOLD_KM - PERFECT_THRESHOLD_KM)));
    }

    setRoundPoints(points);
    setRoundDistance(distance);
    setCumulativeScore((prev) => prev + points);

    // Add round results
    const curResult: RoundResult = {
      round: currentRoundIndex + 1,
      capital: currentCapital,
      guess: guessCoords,
      distance,
      points,
    };
    setResultsList((prev) => [...prev, curResult]);

    // Plot true target capital marker in Leaflet map
    const correctIcon = L.divIcon({
      className: "custom-correct-icon",
      html: `<div class="w-7 h-7 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-[pulse_1.5s_infinite]">
              <span class="text-[10px] text-white font-extrabold font-sans">✓</span>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const actualMarker = L.marker([currentCapital.lat, currentCapital.lon], { icon: correctIcon })
      .addTo(mapRef.current)
      .bindTooltip(`<b>${currentCapital.name}</b> (${currentCapital.country})`, { permanent: true, direction: "top", offset: [0, -10] });

    actualMarkerRef.current = actualMarker;

    // Draw connecting polyline with elegant dashed dash-array decoration
    const connectorLine = L.polyline([guessCoords, [currentCapital.lat, currentCapital.lon]], {
      color: "#4b5563",
      weight: 2,
      dashArray: "6, 6",
    }).addTo(mapRef.current);

    connectorLineRef.current = connectorLine;

    // Zoom/pan map to tightly show both markers
    const group = L.featureGroup([guessMarkerRef.current!, actualMarker]);
    mapRef.current.flyToBounds(group.getBounds(), {
      padding: [50, 50],
      duration: 1.2,
    });
  };

  // 4. Progress to Next Round or Finish
  const handleNextRound = () => {
    // Clear markings
    if (guessMarkerRef.current && mapRef.current) mapRef.current.removeLayer(guessMarkerRef.current);
    if (actualMarkerRef.current && mapRef.current) mapRef.current.removeLayer(actualMarkerRef.current);
    if (connectorLineRef.current && mapRef.current) mapRef.current.removeLayer(connectorLineRef.current);

    guessMarkerRef.current = null;
    actualMarkerRef.current = null;
    connectorLineRef.current = null;

    setGuessCoords(null);
    setIsLockedIn(false);
    setRoundPoints(0);
    setRoundDistance(0);

    if (currentRoundIndex + 1 < CAPITAL_CITIES.length) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  // Calculate stats for end screen
  const totalScore = resultsList.reduce((acc, r) => acc + r.points, 0);
  const avgDistance = resultsList.length > 0 
    ? Math.round(resultsList.reduce((acc, r) => acc + r.distance, 0) / resultsList.length)
    : 0;

  // Reset entirely
  const handlePlayAgain = () => {
    setCurrentRoundIndex(0);
    setCumulativeScore(0);
    setGuessCoords(null);
    setIsLockedIn(false);
    setRoundPoints(0);
    setRoundDistance(0);
    setIsGameOver(false);
    setResultsList([]);
  };

  return (
    <div className="w-full flex flex-col gap-6" id="capital_chain_wrapper">
      
      {/* 1. Header Row - compact breadcrumb + navigation actions */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="game_header_nav">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-150 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer hover:scale-105 active:scale-95"
          id="btn_back_to_menu"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-xs font-black text-gray-900 uppercase">Capital Chain</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="game_running_grid">
          
          {/* Left panel (~65% width) holding Dominant Interactive Map */}
          <div className="lg:col-span-8 flex flex-col gap-3" id="game_maps_stage_side">
            
            {/* Round info card */}
            <div className="bg-white border border-gray-200 rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="round_stat_display">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  ROUND {currentRoundIndex + 1} OF {CAPITAL_CITIES.length}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight">
                  Where is <span className="underline decoration-black decoration-2 underline-offset-2">{currentCapital.name}</span>?
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  National Capital City of <span className="text-gray-900">{currentCapital.country}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-[8px] self-start sm:self-auto">
                <div className="text-center px-1">
                  <span className="text-[9px] text-gray-400 font-mono uppercase block">RUNNING SCORE</span>
                  <span className="text-sm font-mono font-black text-gray-950">{cumulativeScore}</span>
                </div>
              </div>
            </div>

            {/* Dominant Map Canvas Container */}
            <div className="relative flex-1 flex flex-col bg-white rounded-[12px] border border-gray-200 p-1.5 shadow-sm overflow-hidden min-h-[420px] lg:min-h-[500px]" id="capital_chain_map_holder">
              
              {/* Floating state hint */}
              {!guessCoords && (
                <div className="absolute top-4 left-4 right-4 sm:left-auto z-40 bg-black/90 backdrop-blur-sm border border-gray-700 px-4 py-2.5 rounded-[8px] shadow-md text-xs font-semibold text-white pointer-events-none text-center sm:text-left select-none animate-pulse">
                  📍 Click anywhere on the map to drop your initial guess pin!
                </div>
              )}

              {/* Map object renderer */}
              <div ref={mapContainerRef} className="w-full h-full min-h-[420px] lg:min-h-[520px] custom-leaflet-map" id="capital_leaflet_stage" style={{ zIndex: 10 }} />
            </div>
          </div>

          {/* Right panel (~35% width) holding feedback logs, actions */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="game_sidebar_actions_side">
            <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[320px]">
              
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 mb-4">
                  Round Operations
                </h3>

                {/* State A: Place custom Pin layout */}
                {!guessCoords && (
                  <div className="text-center py-8 text-gray-400" id="op_waiting_guess">
                    <Compass className="w-10 h-10 text-gray-200 mx-auto animate-spin" style={{ animationDuration: "15s" }} />
                    <p className="text-xs font-bold mt-3 uppercase tracking-wider text-gray-400">Awaiting Click Position</p>
                    <p className="text-[11px] text-gray-500 leading-normal px-4 mt-1 font-semibold">
                      Your answer will be locked once you submit. Take your time to click precisely on the map.
                    </p>
                  </div>
                )}

                {/* State B: Pin exists, awaiting Lock In */}
                {guessCoords && !isLockedIn && (
                  <div className="space-y-4" id="op_has_guess">
                    <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-[8px] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono uppercase text-gray-400">Refining Placement</span>
                        <p className="text-xs font-bold text-gray-900 leading-none mt-0.5">Pin Dropped</p>
                        <p className="text-[10px] text-gray-500 leading-none mt-1 font-mono">
                          Coords: {guessCoords[0].toFixed(3)}°N, {guessCoords[1].toFixed(3)}°E
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                      You can click on the map again to shift your pin before confirming. When you are ready, lock below.
                    </p>

                    <button
                      onClick={handleLockIn}
                      className="w-full bg-gray-950 hover:bg-black text-white py-3.5 rounded-[8px] uppercase font-bold text-xs tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      id="btn_lock_in_answer"
                    >
                      Lock In Answer
                    </button>
                  </div>
                )}

                {/* State C: Locked In - show round distance and points */}
                {isLockedIn && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                    id="op_is_locked"
                  >
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      Round Assessment
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">DISTANCE ACCURACY</span>
                        <strong className="text-base font-mono font-black text-gray-950">{roundDistance} <span className="text-[10px]">km</span></strong>
                        <span className="block text-[8px] text-gray-500 mt-0.5 uppercase tracking-wider">off the center</span>
                      </div>

                      <div className="bg-gray-900 text-white p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">POINTS AWARDED</span>
                        <strong className="text-xl font-mono font-black text-emerald-400">+{roundPoints}</strong>
                        <span className="block text-[8px] text-gray-400 mt-0.5 uppercase tracking-wider">out of 1000</span>
                      </div>
                    </div>

                    {/* Fun assessment remark */}
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed bg-gray-50 border border-gray-200 p-3 rounded-[8px]">
                      {roundDistance < PERFECT_THRESHOLD_KM 
                        ? "⭐ Flawless placement! Spot on accuracy."
                        : roundDistance <= 250
                        ? "Excellent estimation. Very close proximity."
                        : roundDistance <= 600
                        ? "Decent regional placement. You have the correct sphere."
                        : roundDistance <= 1200
                        ? "Fair location. Could use some fine-tuning."
                        : "Out of range. Better study your coordinates for the next capital!"
                      }
                    </p>

                    <button
                      onClick={handleNextRound}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      id="btn_next_capital_round"
                    >
                      <span>{currentRoundIndex + 1 === CAPITAL_CITIES.length ? "Finish Expedition" : "Next Capital"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* General Guidelines */}
              <div className="border-t border-gray-150 pt-3 mt-4 text-[10px] text-gray-400 font-mono leading-relaxed select-none">
                <span className="block font-bold">TUNING CONFIGS:</span>
                • Near points gets {MAX_POINTS}pts (inside {PERFECT_THRESHOLD_KM}km radial radius)<br/>
                • Proportional decline up to {MAX_THRESHOLD_KM}km (0pts boundary)
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* End-of-Game summary screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-[16px] p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative z-20"
          id="capital_chain_gameover_block"
        >
          <div className="relative mb-6">
            <div className="relative w-20 h-20 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-10 h-10 text-gray-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
            Expedition Summarised!
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
            CAPITAL CHAIN GEOGRAPHY REPORT
          </p>

          {/* Stats Summary Panel */}
          <div className="grid grid-cols-2 gap-4 w-full text-center border-t border-b border-gray-200 py-6 mb-6">
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                COMBINED POINTS
              </span>
              <strong className="text-2xl font-mono font-black text-gray-950">
                {totalScore}
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                AVG. ACCURACY
              </span>
              <strong className="text-2xl font-mono font-black text-gray-950">
                {avgDistance} <span className="text-xs">km</span>
              </strong>
            </div>
          </div>

          {/* Detailed round-by-round breakdown */}
          <div className="w-full text-left space-y-2 max-h-[220px] overflow-y-auto pr-1.5 mb-6" id="cc_round_breakdown">
            <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
              Round Accuracy Logs
            </h4>
            {resultsList.map((res) => (
              <div
                key={res.round}
                className="bg-gray-55 border border-gray-150 p-2.5 rounded-[8px] flex items-center justify-between text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-mono">#{String(res.round).padStart(2, "0")}</span>
                  <span className="text-gray-900">{res.capital.name}</span>
                  <span className="text-[10px] text-gray-400">({res.capital.country})</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-[10px] text-gray-500 font-mono">{res.distance} km off</span>
                  <span className="text-xs font-black text-gray-900 font-mono">+{res.points}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Final controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="cc_gameover_actions">
            <button
              onClick={() => onFinishGame(totalScore, "Capital Chain")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              id="btn_cc_save_results"
            >
              <span>Submit & Save Result</span>
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              id="btn_cc_play_again"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Expedition</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
