import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import { motion } from "motion/react";
import { Trophy, ArrowRight, RefreshCw, ChevronLeft, MapPin, Compass } from "lucide-react";

// Types
interface HistoricalLocationQuestion {
  question: string;
  description: string;
  actualLat: number;
  actualLng: number;
  locationName: string;
}

interface RoundResult {
  round: number;
  question: HistoricalLocationQuestion;
  guess: [number, number] | null;
  distance: number; // km
  points: number;
}

interface WhereWereTheyGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// PLACEHOLDER DATA — replace with real content easily
const LOCATION_QUESTIONS: HistoricalLocationQuestion[] = [
  {
    question: "Where did the first ancient Olympic Games take place?",
    description: "These athletic festivals were held in honor of Zeus in ancient Greece, drawing competitors from various city-states.",
    actualLat: 37.6384,
    actualLng: 21.6300,
    locationName: "Olympia, Greece"
  },
  {
    question: "Where was Napoleon Bonaparte exiled for the final time?",
    description: "Following his definitive defeat at Waterloo, the British exiled the former French Emperor to a remote volcanic island in the South Atlantic.",
    actualLat: -15.9650,
    actualLng: -5.7089,
    locationName: "Saint Helena Island"
  },
  {
    question: "Where was Genghis Khan, founder of the Mongol Empire, born?",
    description: "The legendary conqueror was born near the mountain Burkhan Khaldun and the Onon River in modern northeastern territory.",
    actualLat: 48.8611,
    actualLng: 111.0802,
    locationName: "Delüün Boldog, Mongolia"
  },
  {
    question: "Where was the Great Pyramid of Giza constructed?",
    description: "Commissioned by the Pharaoh Khufu of the Old Kingdom, this structural masterpiece stands as the oldest of the Seven Wonders of the Ancient World.",
    actualLat: 29.9792,
    actualLng: 31.1342,
    locationName: "Giza, Egypt"
  },
  {
    question: "Where was the Magna Carta sealed in 1215?",
    description: "King John met rebellious barons at a meadow by the River Thames to formally put his seal on the historic charter.",
    actualLat: 51.4442,
    actualLng: -0.5651,
    locationName: "Runnymede, England"
  },
  {
    question: "Where did the catastrophic eruption of Mount Vesuvius bury Pompeii in 79 AD?",
    description: "A colossal volcanic eruption entombed entire cities in hot ash, preserving them perfectly for modern archaeologists.",
    actualLat: 40.7512,
    actualLng: 14.4869,
    locationName: "Pompeii, Italy"
  },
  {
    question: "Where did the historic Wright Brothers flight take place in 1903?",
    description: "The brothers made four brief, wind-swept flights with their powered biplane on the outer barrier islands of North Carolina.",
    actualLat: 36.0138,
    actualLng: -75.6682,
    locationName: "Kitty Hawk, USA"
  },
  {
    question: "Where was the ancient city of Troy located?",
    description: "The setting for Homer's legendary Iliad is an archaeological site at Hisarlik in modern northwest Anatolia.",
    actualLat: 39.9575,
    actualLng: 26.2391,
    locationName: "Hisarlik, Turkey"
  },
  {
    question: "Where did the Aztec Empire construct its capital, Tenochtitlan?",
    description: "Founded on an island in Lake Texcoco, this majestic city featured high causeways, elaborate aqueducts, and massive temples.",
    actualLat: 19.4326,
    actualLng: -99.1332,
    locationName: "Mexico City (Tenochtitlan)"
  },
  {
    question: "Where was Siddhartha Gautama (the Buddha) born?",
    description: "According to Buddhist tradition, the spiritual teacher was born in a sacred grove of garden gardens in modern Nepal.",
    actualLat: 27.5020,
    actualLng: 83.2758,
    locationName: "Lumbini, Nepal"
  }
];

// SCORING CONFIGURATION
const PERFECT_THRESHOLD_KM = 100; // Perfect score boundary
const MAX_THRESHOLD_KM = 3500;   // Maximum scoring radius
const MAX_POINTS = 1000;

// Haversine calculation
function calculateDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

export default function WhereWereTheyGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: WhereWereTheyGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(false);
  const [roundPoints, setRoundPoints] = useState<number>(0);
  const [roundDistance, setRoundDistance] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [resultsList, setResultsList] = useState<RoundResult[]>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const guessMarkerRef = useRef<L.Marker | null>(null);
  const actualMarkerRef = useRef<L.Marker | null>(null);
  const connectorLineRef = useRef<L.Polyline | null>(null);

  const currentQuestion = LOCATION_QUESTIONS[currentRoundIndex];

  // Map Initialization
  useEffect(() => {
    if (isGameOver || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const leafletMap = L.map(mapContainerRef.current, {
      center: [20.0, 0.0],
      zoom: 2,
      zoomControl: false,
      minZoom: 1,
      maxZoom: 10,
    });

    L.control.zoom({ position: "topright" }).addTo(leafletMap);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
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
  }, [isGameOver, currentRoundIndex]);

  // Lock In Action
  const handleLockIn = () => {
    if (!guessCoords || isLockedIn || !mapRef.current) return;

    setIsLockedIn(true);
    const actualLat = currentQuestion.actualLat;
    const actualLng = currentQuestion.actualLng;

    const distance = calculateDistanceKM(guessCoords[0], guessCoords[1], actualLat, actualLng);
    setRoundDistance(distance);

    let points = 0;
    if (distance <= PERFECT_THRESHOLD_KM) {
      points = MAX_POINTS;
    } else if (distance < MAX_THRESHOLD_KM) {
      points = Math.round(
        MAX_POINTS * (1 - (distance - PERFECT_THRESHOLD_KM) / (MAX_THRESHOLD_KM - PERFECT_THRESHOLD_KM))
      );
    }

    setRoundPoints(points);
    setCumulativeScore((prev) => prev + points);

    // Draw correct answer location pin
    const actualIcon = L.divIcon({
      className: "custom-actual-icon",
      html: `<div class="w-6 h-6 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2">
              <span class="text-white text-[10px] font-black">✓</span>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    actualMarkerRef.current = L.marker([actualLat, actualLng], { icon: actualIcon }).addTo(mapRef.current);

    // Draw connector lines
    connectorLineRef.current = L.polyline(
      [guessCoords, [actualLat, actualLng]],
      { color: "#10b981", weight: 2, dashArray: "5, 5" }
    ).addTo(mapRef.current);

    // Zoom and pan map to fit pins
    const group = new L.FeatureGroup([guessMarkerRef.current!, actualMarkerRef.current!]);
    mapRef.current.fitBounds(group.getBounds().pad(0.3));

    const resultEntry: RoundResult = {
      round: currentRoundIndex + 1,
      question: currentQuestion,
      guess: guessCoords,
      distance,
      points
    };
    setResultsList((prev) => [...prev, resultEntry]);
  };

  const handleNextRound = () => {
    setGuessCoords(null);
    setIsLockedIn(false);
    setRoundPoints(0);
    setRoundDistance(0);

    if (currentRoundIndex + 1 < LOCATION_QUESTIONS.length) {
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
    <div className="w-full flex flex-col gap-6" id="where_were_they_wrapper">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="wwt_top_nav">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer"
          id="btn_wwt_exit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-xs font-black text-gray-900 uppercase">Locate Historical Events</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="wwt_running_grid">
          
          {/* Map canvas side (65%) */}
          <div className="lg:col-span-8 flex flex-col gap-4" id="wwt_map_panel">
            
            {/* Header event prompt */}
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm" id="wwt_prompt_card">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                ROUND {currentRoundIndex + 1} OF {LOCATION_QUESTIONS.length}
              </span>
              <h1 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-tight mt-1">
                {currentQuestion.question}
              </h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                {currentQuestion.description}
              </p>
            </div>

            {/* Interactive Leaflet Map Box */}
            <div className="relative w-full h-[360px] md:h-[420px] bg-gray-100 rounded-[12px] border border-gray-250 overflow-hidden shadow-inner" id="wwt_map_box">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              
              {/* Overlay guides when pin is absent */}
              {!guessCoords && (
                <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-xs text-white border border-white/10 px-3 py-1.5 rounded-[6px] text-[10px] font-mono font-bold uppercase pointer-events-none tracking-widest select-none">
                  📍 Click map to drop pin guess
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Panel (35%) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="wwt_control_panel">
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[340px]">
              
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 mb-4">
                  Target Location Controls
                </h3>

                {/* Score status tracking */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 border border-gray-200 p-2 rounded-[8px] text-center">
                    <span className="text-[8px] text-gray-400 font-mono block">RUNNING SCORE</span>
                    <strong className="text-sm font-mono font-black text-gray-950">{cumulativeScore}</strong>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-2 rounded-[8px] text-center">
                    <span className="text-[8px] text-gray-400 font-mono block">ACCURACY</span>
                    <strong className="text-sm font-mono font-black text-gray-955">
                      {currentRoundIndex > 0 ? Math.round((resultsList.filter(r => r.points >= 500).length / currentRoundIndex) * 100) : 0}%
                    </strong>
                  </div>
                </div>

                {/* State A: Awaiting first placement pin */}
                {guessCoords === null && (
                  <div className="text-center py-8 text-gray-400" id="wwt_waiting_state">
                    <Compass className="w-8 h-8 text-gray-200 mx-auto animate-spin" style={{ animationDuration: "10s" }} />
                    <p className="text-xs font-bold mt-2 uppercase tracking-wider text-gray-400">Awaiting Target Pin</p>
                    <p className="text-[10px] text-gray-500 leading-normal px-2 mt-1">
                      Click anywhere on the world map layout to lock coordinate pin estimations for this historical prompt.
                    </p>
                  </div>
                )}

                {/* State B: Selected, Ready to lock */}
                {guessCoords !== null && !isLockedIn && (
                  <div className="space-y-4" id="wwt_selected_state">
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] flex items-center gap-2.5">
                      <MapPin className="w-5 h-5 text-gray-950 animate-bounce" />
                      <div>
                        <span className="text-[8px] text-gray-400 font-mono uppercase block">PIN COORDINATES</span>
                        <p className="text-[10px] font-mono font-bold text-gray-900 leading-tight">
                          Lat: {guessCoords[0].toFixed(4)}, Lng: {guessCoords[1].toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLockIn}
                      className="w-full bg-gray-950 hover:bg-black text-white text-xs font-black py-3.5 rounded-[8px] uppercase tracking-wider transition-all cursor-pointer"
                      id="btn_wwt_lock_in"
                    >
                      Lock In Coordinates
                    </button>
                  </div>
                )}

                {/* State C: Locked and analyzed */}
                {isLockedIn && guessCoords !== null && (
                  <div className="space-y-4" id="wwt_locked_state">
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] space-y-2 text-left">
                      <span className="text-[8px] text-gray-400 font-mono uppercase block">TARGET ANALYSIS</span>
                      <p className="text-xs font-extrabold text-gray-950 leading-tight">
                        Target Location: <span className="text-emerald-700">{currentQuestion.locationName}</span>
                      </p>
                      <div className="flex justify-between text-xs pt-1 border-t border-gray-150">
                        <span className="text-gray-400">Distance Error:</span>
                        <strong className="text-gray-900 font-mono">{roundDistance} km</strong>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Points Earned:</span>
                        <strong className="text-emerald-600 font-mono">+{roundPoints} pts</strong>
                      </div>
                    </div>

                    <button
                      onClick={handleNextRound}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="btn_wwt_next_round"
                    >
                      <span>
                        {currentRoundIndex + 1 === LOCATION_QUESTIONS.length ? "Finish Challenge" : "Next Location"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>

              {/* Informative Rules Footer */}
              <div className="border-t border-gray-150 pt-3 text-[10px] text-gray-400 font-mono leading-relaxed select-none mt-4">
                <span className="font-bold">METRIC GUIDELINES:</span>
                • Perfect target hits (&lt;{PERFECT_THRESHOLD_KM}km) grant {MAX_POINTS} points.<br />
                • Scaling degradation down to zero past {MAX_THRESHOLD_KM}km distance.
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* End game report card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl mx-auto bg-white border border-gray-250 rounded-[16px] p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative z-20"
          id="wwt_summary_block"
        >
          <div className="relative mb-5">
            <div className="relative w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-8 h-8 text-gray-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
            Locations Map Finished!
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
            SPATIAL PROXIMITY DISCOVERY ANALYSIS
          </p>

          <div className="grid grid-cols-2 gap-3 w-full text-center border-t border-b border-gray-200 py-6 mb-6">
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
                AVG. DISTANCE ERROR
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {avgDistance} <span className="text-xs">km</span>
              </strong>
            </div>
          </div>

          {/* Rundown detail logs */}
          <div className="w-full text-left space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-6" id="wwt_rounds_log">
            <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
              Discoveries Logs
            </h4>
            {resultsList.map((res) => (
              <div
                key={res.round}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-[8px] flex items-center justify-between text-xs font-semibold"
              >
                <div className="flex flex-col max-w-[70%]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400 font-mono">#{String(res.round).padStart(2, "0")}</span>
                    <span className="text-gray-950 truncate">{res.question.locationName}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">
                    Distance: {res.distance} km off the spot
                  </span>
                </div>
                <span className="text-xs font-black text-gray-900 font-mono">+{res.points}</span>
              </div>
            ))}
          </div>

          {/* Action trigger buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="wwt_end_actions">
            <button
              onClick={() => onFinishGame(totalScore, "Locate Historical Events")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_wwt_save"
            >
              Submit & Save Score
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold"
              id="btn_wwt_retry"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Discoveries Challenge</span>
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}
