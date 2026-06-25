import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import { motion } from "motion/react";
import { Compass, Trophy, ArrowRight, RefreshCw, ChevronLeft, MapPin } from "lucide-react";

// Types
interface BorderCountry {
  country: string;
  imagePath: string; // Placeholder file path as requested
  lat: number;
  lng: number;
  svgPath: string; // Inline SVG path for rich browser visuals
}

interface RoundResult {
  round: number;
  country: BorderCountry;
  guess: [number, number] | null;
  distance: number; // km
  points: number;
}

interface BorderBlindGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// 10 placeholder country border/coastline objects
const BORDER_COUNTRIES: BorderCountry[] = [
  {
    country: "Italy",
    imagePath: "/borders/italy.svg",
    lat: 41.8719,
    lng: 12.5674,
    svgPath: "M 30,10 C 35,15 45,25 45,35 C 45,45 35,55 45,70 C 47,73 50,75 52,70 C 54,65 58,68 62,72 C 65,75 70,85 68,88 C 65,90 55,85 50,88 C 45,90 40,85 35,80 C 30,75 28,60 32,50 C 35,42 25,35 20,25 C 18,20 25,12 30,10 Z"
  },
  {
    country: "France",
    imagePath: "/borders/france.svg",
    lat: 46.2276,
    lng: 2.2137,
    svgPath: "M 50,15 L 75,30 L 75,60 L 50,75 L 25,60 L 25,30 Z"
  },
  {
    country: "United Kingdom",
    imagePath: "/borders/united_kingdom.svg",
    lat: 55.3781,
    lng: -3.4360,
    svgPath: "M 45,10 C 48,15 43,22 47,30 C 50,35 55,40 52,55 C 50,60 42,65 40,75 C 38,80 32,85 28,80 C 25,75 28,65 25,60 C 22,55 25,48 20,40 C 23,30 35,20 40,15 Z"
  },
  {
    country: "Japan",
    imagePath: "/borders/japan.svg",
    lat: 36.2048,
    lng: 138.2529,
    svgPath: "M 15,75 C 25,65 40,50 55,35 C 65,25 75,18 85,15 C 80,22 70,32 60,42 C 45,58 30,72 20,85 Z"
  },
  {
    country: "Australia",
    imagePath: "/borders/australia.svg",
    lat: -25.2744,
    lng: 133.7751,
    svgPath: "M 20,40 C 25,30 40,25 50,35 C 55,30 65,30 75,35 C 80,45 85,55 80,65 C 75,70 65,65 55,75 C 45,75 30,70 20,60 Z"
  },
  {
    country: "Brazil",
    imagePath: "/borders/brazil.svg",
    lat: -14.2350,
    lng: -51.9253,
    svgPath: "M 35,15 C 50,12 70,25 75,40 C 80,50 70,65 60,75 C 50,85 40,88 35,85 C 30,80 25,65 22,50 C 20,35 25,20 35,15 Z"
  },
  {
    country: "Egypt",
    imagePath: "/borders/egypt.svg",
    lat: 26.8206,
    lng: 30.8025,
    svgPath: "M 20,20 L 50,22 C 52,25 55,20 58,22 L 80,20 L 78,80 L 20,78 Z"
  },
  {
    country: "Canada",
    imagePath: "/borders/canada.svg",
    lat: 56.1304,
    lng: -106.3468,
    svgPath: "M 15,25 C 20,18 30,20 40,15 C 50,15 60,22 75,18 C 85,25 80,40 85,50 C 80,60 70,65 60,70 C 45,75 30,70 20,65 C 15,55 18,40 15,25 Z"
  },
  {
    country: "India",
    imagePath: "/borders/india.svg",
    lat: 20.5937,
    lng: 78.9629,
    svgPath: "M 35,15 C 45,10 55,18 60,25 C 65,35 62,45 55,55 C 50,65 45,75 40,85 C 38,82 35,70 32,60 C 28,50 25,35 25,28 C 28,22 30,18 35,15 Z"
  },
  {
    country: "Madagascar",
    imagePath: "/borders/madagascar.svg",
    lat: -18.7669,
    lng: 46.8691,
    svgPath: "M 35,15 C 42,25 45,40 52,60 C 55,70 50,80 45,85 C 38,80 32,65 28,45 C 25,30 28,20 35,15 Z"
  }
];

// SCORING CONFIGURATION CONSTANTS (Grayscale Neutral design parameters)
const PERFECT_THRESHOLD_KM = 150; // Proximity in km for full score
const MAX_THRESHOLD_KM = 3000;    // Distance in km past which score is zero
const MAX_POINTS = 1000;

// Haversine formula for distance calculation
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

export default function BorderBlindGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: BorderBlindGameProps) {
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

  const currentCountry = BORDER_COUNTRIES[currentRoundIndex];

  // Initialize Map
  useEffect(() => {
    if (isGameOver || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // World Map initialization centered near equator
    const leafletMap = L.map(mapContainerRef.current, {
      center: [20.0, 10.0],
      zoom: 2,
      zoomControl: false,
      minZoom: 2,
      maxZoom: 10,
    });

    L.control.zoom({ position: "topright" }).addTo(leafletMap);

    // Grayscale / Neutral CartoDB Voyager Nolabels layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(leafletMap);

    mapRef.current = leafletMap;

    leafletMap.on("click", (e: L.LeafletMouseEvent) => {
      setIsLockedIn((locked) => {
        if (locked) return true;

        const clickedCoords: [number, number] = [e.latlng.lat, e.latlng.lng];
        setGuessCoords(clickedCoords);

        if (guessMarkerRef.current) {
          guessMarkerRef.current.setLatLng(e.latlng);
        } else {
          const guessIcon = L.divIcon({
            className: "custom-guess-icon-blind",
            html: `<div class="w-6 h-6 bg-gray-900 border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
                    <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
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

  // Handle resizing
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [guessCoords]);

  // Lock in Answer
  const handleLockIn = () => {
    if (!guessCoords || !mapRef.current) return;

    setIsLockedIn(true);

    const [guessLat, guessLon] = guessCoords;
    const distance = calculateDistanceKM(guessLat, guessLon, currentCountry.lat, currentCountry.lng);

    // Proximity Scoring Calculation
    let points = 0;
    if (distance <= PERFECT_THRESHOLD_KM) {
      points = MAX_POINTS;
    } else if (distance < MAX_THRESHOLD_KM) {
      points = Math.round(
        MAX_POINTS * (1 - (distance - PERFECT_THRESHOLD_KM) / (MAX_THRESHOLD_KM - PERFECT_THRESHOLD_KM))
      );
    }

    setRoundPoints(points);
    setRoundDistance(distance);
    setCumulativeScore((prev) => prev + points);

    const curResult: RoundResult = {
      round: currentRoundIndex + 1,
      country: currentCountry,
      guess: guessCoords,
      distance,
      points
    };
    setResultsList((prev) => [...prev, curResult]);

    // Render Correct country Centroid
    const correctIcon = L.divIcon({
      className: "custom-correct-icon-blind",
      html: `<div class="w-7 h-7 bg-gray-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-[pulse_1.5s_infinite]">
              <span class="text-[10px] text-white font-extrabold">✓</span>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const actualMarker = L.marker([currentCountry.lat, currentCountry.lng], { icon: correctIcon })
      .addTo(mapRef.current)
      .bindTooltip(`<b>${currentCountry.country}</b>`, { permanent: true, direction: "top", offset: [0, -10] });

    actualMarkerRef.current = actualMarker;

    // Line connector
    const connectorLine = L.polyline([guessCoords, [currentCountry.lat, currentCountry.lng]], {
      color: "#6b7280",
      weight: 2,
      dashArray: "5, 5",
    }).addTo(mapRef.current);

    connectorLineRef.current = connectorLine;

    // Fly bounds to include both marks
    const group = L.featureGroup([guessMarkerRef.current!, actualMarker]);
    mapRef.current.flyToBounds(group.getBounds(), {
      padding: [80, 80],
      duration: 1.2
    });
  };

  // Move to next round
  const handleNextRound = () => {
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

    if (currentRoundIndex + 1 < BORDER_COUNTRIES.length) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

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

  const totalScore = resultsList.reduce((acc, r) => acc + r.points, 0);
  const avgDistance = resultsList.length > 0
    ? Math.round(resultsList.reduce((acc, r) => acc + r.distance, 0) / resultsList.length)
    : 0;

  return (
    <div className="w-full flex flex-col gap-6" id="border_blind_wrapper">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="bb_header_nav">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer"
          id="btn_bb_exit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-xs font-black text-gray-900 uppercase">Border Blind</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="bb_running_grid">
          
          {/* Main Map & Image section (65% width) */}
          <div className="lg:col-span-8 flex flex-col gap-4" id="bb_stage_side">
            
            {/* Stage Info Header Card */}
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="bb_stat_display">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  ROUND {currentRoundIndex + 1} OF {BORDER_COUNTRIES.length}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-gray-950 uppercase tracking-tight mt-0.5">
                  Which country owns this cropped border section?
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Examine the outline shape on the right, then drop your pin at the correct country location on the map below.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-[8px] self-start sm:self-auto">
                <div className="text-center px-1">
                  <span className="text-[9px] text-gray-400 font-mono uppercase block">RUNNING SCORE</span>
                  <span className="text-sm font-mono font-black text-gray-950">{cumulativeScore}</span>
                </div>
              </div>
            </div>

            {/* Split layout: cropped border section and interactive map */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch" id="bb_map_and_outline_container">
              
              {/* Cropped Outline Section Panel */}
              <div className="md:col-span-4 bg-white border border-gray-250 rounded-[12px] p-5 flex flex-col items-center justify-center shadow-sm min-h-[220px]" id="bb_outline_image_panel">
                <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest mb-3 text-center block">
                  CROPPED BORDER SECTION
                </span>
                
                {/* Visual rendering of the stylized geometric border outline */}
                <div className="w-40 h-40 bg-gray-50 border border-gray-200 rounded-[8px] flex items-center justify-center p-2 shadow-inner relative overflow-hidden">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-32 h-32 text-gray-800 drop-shadow-md"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={currentCountry.svgPath} className="fill-gray-100" />
                  </svg>
                </div>

                <p className="text-[10px] text-gray-400 text-center font-mono mt-3 select-none leading-normal">
                  No labels, no coordinates.<br />Use pure visual shape matching.
                </p>
              </div>

              {/* Map Canvas Container */}
              <div className="md:col-span-8 relative flex flex-col bg-white rounded-[12px] border border-gray-250 p-1.5 shadow-sm overflow-hidden min-h-[380px]" id="bb_map_holder">
                {!guessCoords && (
                  <div className="absolute top-4 left-4 right-4 z-40 bg-black/90 backdrop-blur-sm border border-gray-700 px-4 py-2.5 rounded-[8px] shadow-md text-xs font-semibold text-white pointer-events-none text-center select-none animate-pulse">
                    📍 Examine the shape on the left, then click on the map to place your pin!
                  </div>
                )}
                <div ref={mapContainerRef} className="w-full h-full min-h-[360px] custom-leaflet-map" id="bb_leaflet_stage" style={{ zIndex: 10 }} />
              </div>

            </div>

          </div>

          {/* Operation action panel (35% width) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="bb_sidebar_actions">
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[320px]">
              
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 mb-4">
                  Assessment Controls
                </h3>

                {/* State A: Awaiting Pin */}
                {!guessCoords && (
                  <div className="text-center py-10 text-gray-400" id="bb_waiting_guess">
                    <Compass className="w-10 h-10 text-gray-200 mx-auto animate-spin" style={{ animationDuration: "12s" }} />
                    <p className="text-xs font-bold mt-3 uppercase tracking-wider text-gray-400">Awaiting Guess Marker</p>
                    <p className="text-[11px] text-gray-500 leading-normal px-4 mt-1 font-semibold">
                      Your guess distance determines points. Place a pin on the world map when you recognize the shape outline.
                    </p>
                  </div>
                )}

                {/* State B: Pin Placed, awaiting Lock */}
                {guessCoords && !isLockedIn && (
                  <div className="space-y-4" id="bb_has_guess">
                    <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-[8px] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono uppercase text-gray-400">Selected Guess Location</span>
                        <p className="text-xs font-bold text-gray-900 leading-none mt-0.5 font-mono">
                          {guessCoords[0].toFixed(3)}°N, {guessCoords[1].toFixed(3)}°E
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                      You can adjust the pin by clicking somewhere else on the map. Ready? Submit your guess.
                    </p>

                    <button
                      onClick={handleLockIn}
                      className="w-full bg-gray-950 hover:bg-black text-white py-3.5 rounded-[8px] uppercase font-bold text-xs tracking-wider transition-all cursor-pointer"
                      id="btn_bb_lock_in"
                    >
                      Lock In Answer
                    </button>
                  </div>
                )}

                {/* State C: locked in feedback */}
                {isLockedIn && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                    id="bb_feedback_card"
                  >
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      Proximity Result
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">DISTANCE ACCURACY</span>
                        <strong className="text-base font-mono font-black text-gray-950">
                          {roundDistance} <span className="text-[10px]">km</span>
                        </strong>
                        <span className="block text-[8px] text-gray-500 mt-0.5 uppercase tracking-wider">off the centroid</span>
                      </div>

                      <div className="bg-gray-900 text-white p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">POINTS AWARDED</span>
                        <strong className="text-lg font-mono font-black text-emerald-400">+{roundPoints}</strong>
                        <span className="block text-[8px] text-gray-400 mt-0.5 uppercase tracking-wider">out of 1000</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] text-xs">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px] font-bold block mb-1">Actual country</span>
                      <p className="text-xs font-black text-gray-900 uppercase">
                        {currentCountry.country}
                      </p>
                    </div>

                    <button
                      onClick={handleNextRound}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="btn_bb_next_round"
                    >
                      <span>
                        {currentRoundIndex + 1 === BORDER_COUNTRIES.length ? "View Report Card" : "Next Round"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

              </div>

              {/* Operations Footer info */}
              <div className="border-t border-gray-150 pt-3 mt-4 text-[10px] text-gray-400 font-mono leading-relaxed select-none">
                <span className="block font-bold">SCORING STANDARD:</span>
                • Near points gets {MAX_POINTS}pts (inside {PERFECT_THRESHOLD_KM}km center point)<br />
                • Score degrades to zero at {MAX_THRESHOLD_KM}km
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* End Summary State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl mx-auto bg-white border border-gray-250 rounded-[16px] p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative z-20"
          id="bb_summary_block"
        >
          <div className="relative mb-5">
            <div className="relative w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-8 h-8 text-gray-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
            Border Blind Finished!
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
            OUTLINE SHAPE MATCHING METRICS
          </p>

          <div className="grid grid-cols-2 gap-4 w-full text-center border-t border-b border-gray-200 py-6 mb-6">
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                AGGREGATED POINTS
              </span>
              <strong className="text-2xl font-mono font-black text-gray-950">
                {totalScore}
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                AVG. DISTANCE OFF
              </span>
              <strong className="text-2xl font-mono font-black text-gray-950">
                {avgDistance} <span className="text-xs">km</span>
              </strong>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="w-full text-left space-y-2 max-h-[200px] overflow-y-auto pr-1 mb-6" id="bb_round_breakdown">
            <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
              Round Detail Log
            </h4>
            {resultsList.map((res) => (
              <div
                key={res.round}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-[8px] flex items-center justify-between text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-mono">#{String(res.round).padStart(2, "0")}</span>
                  <span className="text-gray-950">{res.country.country}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-[10px] text-gray-500 font-mono">{res.distance} km off</span>
                  <span className="text-xs font-black text-gray-900 font-mono">+{res.points}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="bb_end_controls">
            <button
              onClick={() => onFinishGame(totalScore, "Border Blind")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center"
              id="btn_bb_save"
            >
              Submit & Save Score
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2"
              id="btn_bb_retry"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Challenge</span>
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}
