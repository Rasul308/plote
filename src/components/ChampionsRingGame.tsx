import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import { motion } from "motion/react";
import { Compass, Trophy, ArrowRight, ChevronLeft, MapPin } from "lucide-react";

// Types
interface Dynasty {
  team: string;
  sport: string;
  stadium: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  fact: string;
}

interface RoundResult {
  round: number;
  dynasty: Dynasty;
  guess: [number, number] | null;
  distance: number; // km
  points: number;
}

interface ChampionsRingGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// 3. Dynasty Arena Data List (10 iconic champions)
const DYNASTIES: Dynasty[] = [
  {
    team: "Chicago Bulls (1990s Dynasty)",
    sport: "Basketball (NBA)",
    stadium: "United Center",
    lat: 41.8807,
    lon: -87.6742,
    city: "Chicago",
    country: "USA",
    fact: "Led by Michael Jordan, they won 6 championships in 8 years with two separate three-peats."
  },
  {
    team: "Real Madrid (Champions League)",
    sport: "Football (UEFA)",
    stadium: "Santiago Bernabéu",
    lat: 40.4531,
    lon: -3.7176,
    city: "Madrid",
    country: "Spain",
    fact: "Real Madrid became the first club in modern history to achieve a Champions League three-peat (2016-2018)."
  },
  {
    team: "Montreal Canadiens (Stanley Cup Legend)",
    sport: "Ice Hockey (NHL)",
    stadium: "Bell Centre / Forum",
    lat: 45.4961,
    lon: -73.5693,
    city: "Montreal",
    country: "Canada",
    fact: "Won 24 Stanley Cups in total, including an unbeaten record of 5 consecutive cups between 1956 and 1960."
  },
  {
    team: "New England Patriots (Brady Era)",
    sport: "American Football (NFL)",
    stadium: "Gillette Stadium",
    lat: 42.0909,
    lon: -71.2643,
    city: "Foxborough",
    country: "USA",
    fact: "The quarterback-coach duo of Tom Brady and Bill Belichick engineered 9 Super Bowl runs, securing 6 rings."
  },
  {
    team: "Golden State Warriors (Splash Brothers)",
    sport: "Basketball (NBA)",
    stadium: "Chase Center / Oracle Arena",
    lat: 37.7749,
    lon: -122.4194,
    city: "San Francisco",
    country: "USA",
    fact: "Set the all-time NBA regular-season record with 73 wins in 2015-16, capturing 4 titles in 8 seasons."
  },
  {
    team: "Manchester City (Four in a Row)",
    sport: "Football (Premier League)",
    stadium: "Etihad Stadium",
    lat: 53.4831,
    lon: -2.2004,
    city: "Manchester",
    country: "United Kingdom",
    fact: "Became the first club in English football history to win four consecutive top-flight league titles (2021-2024)."
  },
  {
    team: "Boston Celtics (1960s Dominance)",
    sport: "Basketball (NBA)",
    stadium: "TD Garden / Boston Garden",
    lat: 42.3662,
    lon: -71.0621,
    city: "Boston",
    country: "USA",
    fact: "Won an astronomical 11 championships in 13 seasons, including an unbroken streak of 8 titles in a row from 1959 to 1966."
  },
  {
    team: "Juventus FC (9 Consecutive Scudettos)",
    sport: "Football (Serie A)",
    stadium: "Allianz Stadium",
    lat: 45.1096,
    lon: 7.6413,
    city: "Turin",
    country: "Italy",
    fact: "Established the record for most consecutive Italian Serie A titles, winning 9 Scudettos in a row (2012-2020)."
  },
  {
    team: "Bayern Munich (11 Bundesliga Titles)",
    sport: "Football (Bundesliga)",
    stadium: "Allianz Arena",
    lat: 48.2188,
    lon: 11.6248,
    city: "Munich",
    country: "Germany",
    fact: "Completely dominated German domestic football by winning 11 consecutive Bundesliga championships from 2013 to 2023."
  },
  {
    team: "San Francisco 49ers (1980s West Coast)",
    sport: "American Football (NFL)",
    stadium: "Levi's Stadium",
    lat: 37.4030,
    lon: -121.9698,
    city: "Santa Clara",
    country: "USA",
    fact: "Pioneered the West Coast Offense with Joe Montana and Jerry Rice, going undefeated in 5 Super Bowls."
  }
];

// SCORING CONFIGURATION CONSTANTS
const PERFECT_THRESHOLD_KM = 80;  // Distance inside which user gets maximum points (1000)
const MAX_THRESHOLD_KM = 3500;   // Distance past which user gets 0 points
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

export default function ChampionsRingGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en",
}: ChampionsRingGameProps) {
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

  const currentDynasty = DYNASTIES[currentRoundIndex];

  // Initialize Leaflet Map once on render
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
      minZoom: 2,
      maxZoom: 12,
    });

    L.control.zoom({ position: "topright" }).addTo(leafletMap);

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

  // Adjust map size
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
    const distance = calculateDistanceKM(guessLat, guessLon, currentDynasty.lat, currentDynasty.lon);

    let points = 0;
    if (distance <= PERFECT_THRESHOLD_KM) {
      points = MAX_POINTS;
    } else if (distance < MAX_THRESHOLD_KM) {
      points = Math.round(MAX_POINTS * (1 - (distance - PERFECT_THRESHOLD_KM) / (MAX_THRESHOLD_KM - PERFECT_THRESHOLD_KM)));
    }

    setRoundPoints(points);
    setRoundDistance(distance);
    setCumulativeScore((prev) => prev + points);

    const curResult: RoundResult = {
      round: currentRoundIndex + 1,
      dynasty: currentDynasty,
      guess: guessCoords,
      distance,
      points,
    };
    setResultsList((prev) => [...prev, curResult]);

    const correctIcon = L.divIcon({
      className: "custom-correct-icon",
      html: `<div class="w-7 h-7 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-[pulse_1.5s_infinite]">
              <span class="text-[10px] text-white font-extrabold font-sans">✓</span>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const actualMarker = L.marker([currentDynasty.lat, currentDynasty.lon], { icon: correctIcon })
      .addTo(mapRef.current)
      .bindTooltip(`<b>${currentDynasty.team}</b> (${currentDynasty.stadium})`, { permanent: true, direction: "top", offset: [0, -10] });

    actualMarkerRef.current = actualMarker;

    const connectorLine = L.polyline([guessCoords, [currentDynasty.lat, currentDynasty.lon]], {
      color: "#4b5563",
      weight: 2,
      dashArray: "6, 6",
    }).addTo(mapRef.current);

    connectorLineRef.current = connectorLine;

    const group = L.featureGroup([guessMarkerRef.current!, actualMarker]);
    mapRef.current.flyToBounds(group.getBounds(), {
      padding: [50, 50],
      duration: 1.2,
    });
  };

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

    if (currentRoundIndex + 1 < DYNASTIES.length) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const totalScore = resultsList.reduce((acc, r) => acc + r.points, 0);
  const avgDistance = resultsList.length > 0 
    ? Math.round(resultsList.reduce((acc, r) => acc + r.distance, 0) / resultsList.length)
    : 0;

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
    <div className="w-full flex flex-col gap-6" id="champions_ring_wrapper">
      
      {/* Header Row */}
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
          <span className="text-xs font-black text-gray-900 uppercase">Champions Ring</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="game_running_grid">
          
          {/* Left panel */}
          <div className="lg:col-span-8 flex flex-col gap-3" id="game_maps_stage_side">
            
            {/* Round info card */}
            <div className="bg-white border border-gray-200 rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="round_stat_display">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  ROUND {currentRoundIndex + 1} OF {DYNASTIES.length}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-gray-955 uppercase tracking-tight">
                  Where is the <span className="underline decoration-black decoration-2 underline-offset-2">{currentDynasty.team}</span>?
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Sport: <span className="text-gray-955 font-bold">{currentDynasty.sport}</span> &mdash; Home Arena: <span className="text-gray-900">{currentDynasty.stadium}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-[8px] self-start sm:self-auto">
                <div className="text-center px-1">
                  <span className="text-[9px] text-gray-400 font-mono uppercase block">RUNNING SCORE</span>
                  <span className="text-sm font-mono font-black text-gray-955">{cumulativeScore}</span>
                </div>
              </div>
            </div>

            {/* Map Canvas Container */}
            <div className="relative flex-1 flex flex-col bg-white rounded-[12px] border border-gray-200 p-1.5 shadow-sm overflow-hidden min-h-[420px] lg:min-h-[500px]" id="champions_map_holder">
              
              {!guessCoords && (
                <div className="absolute top-4 left-4 right-4 sm:left-auto z-40 bg-black/90 backdrop-blur-sm border border-gray-700 px-4 py-2.5 rounded-[8px] shadow-md text-xs font-semibold text-white pointer-events-none text-center sm:text-left select-none animate-pulse">
                  📍 Click on the map to pin this championship dynasty's home venue!
                </div>
              )}

              <div ref={mapContainerRef} className="w-full h-full min-h-[420px] lg:min-h-[520px] custom-leaflet-map" id="champions_leaflet_stage" style={{ zIndex: 10 }} />
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="game_sidebar_actions_side">
            <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[320px]">
              
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 mb-4">
                  Round Operations
                </h3>

                {!guessCoords && (
                  <div className="text-center py-8 text-gray-400" id="op_waiting_guess">
                    <Compass className="w-10 h-10 text-gray-200 mx-auto animate-spin" style={{ animationDuration: "15s" }} />
                    <p className="text-xs font-bold mt-3 uppercase tracking-wider text-gray-400">Awaiting Click Position</p>
                    <p className="text-[11px] text-gray-500 leading-normal px-4 mt-1 font-semibold">
                      Pin the precise hometown/venue location of this dominant championship sports dynasty.
                    </p>
                  </div>
                )}

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
                      Adjust your pin if needed, then confirm below to assess.
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
                        <strong className="text-base font-mono font-black text-gray-955">{roundDistance} <span className="text-[10px]">km</span></strong>
                        <span className="block text-[8px] text-gray-500 mt-0.5 uppercase tracking-wider">off the center</span>
                      </div>

                      <div className="bg-gray-950 text-white p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">POINTS AWARDED</span>
                        <strong className="text-xl font-mono font-black text-white">+{roundPoints}</strong>
                        <span className="block text-[8px] text-gray-400 mt-0.5 uppercase tracking-wider">out of 1000</span>
                      </div>
                    </div>

                    {/* Reveal Notes & Dynasty Trivia */}
                    <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-[8px] space-y-2 text-left">
                      <span className="text-[9px] text-gray-400 font-mono uppercase block">REVEAL NOTES</span>
                      <p className="text-xs font-black text-gray-955 uppercase tracking-tight">
                        {currentDynasty.city}, {currentDynasty.country} &mdash; {currentDynasty.stadium}
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed font-semibold font-sans mt-1 border-t border-gray-200 pt-1.5">
                        <strong className="text-gray-900 font-bold">Dynasty Trivia:</strong> {currentDynasty.fact}
                      </p>
                    </div>

                    <button
                      onClick={handleNextRound}
                      className="w-full bg-gray-950 hover:bg-black text-white rounded-[8px] py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      id="btn_next_dynasty_round"
                    >
                      <span>{currentRoundIndex + 1 === DYNASTIES.length ? "Finish Challenge" : "Next Dynasty"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>

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
          className="bg-white border border-gray-200 rounded-[16px] p-6 sm:p-10 text-center max-w-xl mx-auto flex flex-col gap-6 shadow-sm z-20"
          id="champions_gameover_summary"
        >
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6 text-black" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block">CHALLENGE COMPLETE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-955 uppercase tracking-tight mt-1">
              Champions Ring
            </h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Final result log of your championship dynasty arena coordinate proximity evaluations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-gray-150 py-6" id="summary_stat_grid">
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase block">TOTAL ACCUMULATED SCORE</span>
              <strong className="text-2xl sm:text-3xl font-mono font-black text-gray-955">{totalScore}</strong>
              <span className="block text-[9px] text-gray-500 uppercase tracking-widest mt-1">out of {DYNASTIES.length * MAX_POINTS} max</span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase block">AVERAGE ERROR DISTANCE</span>
              <strong className="text-2xl sm:text-3xl font-mono font-black text-gray-955">{avgDistance} <span className="text-xs sm:text-sm">km</span></strong>
              <span className="block text-[9px] text-gray-500 uppercase tracking-widest mt-1">from exact centers</span>
            </div>
          </div>

          <div className="text-left bg-gray-50 border border-gray-200 rounded-[12px] p-4 max-h-[220px] overflow-y-auto" id="score_history_logs">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-150 pb-1.5 mb-2">Round Details</h3>
            <ul className="space-y-2 text-xs font-semibold text-gray-600">
              {resultsList.map((r) => (
                <li key={r.round} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                  <span>
                    Round {r.round}: <strong className="text-gray-900">{r.dynasty.team}</strong>
                  </span>
                  <span className="font-mono text-[11px]">
                    {r.distance} km &mdash; <strong className="text-gray-900">+{r.points} pts</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handlePlayAgain}
              className="flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              id="btn_replay_game"
            >
              Play Challenge Again
            </button>
            <button
              onClick={() => onFinishGame(totalScore, "champions-ring")}
              className="flex-1 bg-white hover:bg-gray-100 text-gray-950 text-xs font-black uppercase tracking-wider py-3.5 border border-gray-300 rounded-[8px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              id="btn_finish_leaderboard"
            >
              Save & Exit to Hub
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
