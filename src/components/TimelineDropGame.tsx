import React, { useState } from "react";
import { motion } from "motion/react";
import { Trophy, ArrowRight, RefreshCw, ChevronLeft, Calendar } from "lucide-react";

// Types
interface HistoryEvent {
  name: string;
  description: string;
  actualYear: number;
}

interface RoundResult {
  round: number;
  event: HistoryEvent;
  estimatedYear: number;
  difference: number;
  points: number;
}

interface TimelineDropGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// PLACEHOLDER DATA — replace with real content easily
const TIMELINE_EVENTS: HistoryEvent[] = [
  {
    name: "Signing of the Magna Carta",
    description: "King John of England was forced to sign a charter of rights, limiting royal power for the first time.",
    actualYear: 1215
  },
  {
    name: "Fall of Constantinople",
    description: "The capital of the Byzantine Empire was captured by the Ottoman Empire, marking the end of the Middle Ages.",
    actualYear: 1453
  },
  {
    name: "Columbus Reaches the Americas",
    description: "The Italian explorer made landfall in the Caribbean, initiating centuries of trans-Atlantic contact and colonization.",
    actualYear: 1492
  },
  {
    name: "Martin Luther's 95 Theses",
    description: "Luther nailed his theological challenges to the Wittenberg church door, sparking the Protestant Reformation.",
    actualYear: 1517
  },
  {
    name: "Founding of Jamestown",
    description: "The first permanent English settlement in North America was established in Virginia.",
    actualYear: 1607
  },
  {
    name: "Beginning of the French Revolution",
    description: "Citizen storming of the Bastille prison in Paris marked a seismic shift away from absolute monarchy.",
    actualYear: 1789
  },
  {
    name: "Napoleon's Defeat at Waterloo",
    description: "The French Emperor was conclusively defeated by coalition forces under the Duke of Wellington.",
    actualYear: 1815
  },
  {
    name: "Publication of On the Origin of Species",
    description: "Charles Darwin introduced his scientific theory of natural selection to the public.",
    actualYear: 1859
  },
  {
    name: "First Flight of the Wright Brothers",
    description: "The Wright Flyer made the world's first sustained, controlled, powered heavier-than-air flight at Kitty Hawk.",
    actualYear: 1903
  },
  {
    name: "The Moon Landing",
    description: "Apollo 11 astronauts Neil Armstrong and Buzz Aldrin became the first humans to walk on another celestial body.",
    actualYear: 1969
  }
];

// TIMELINE CONFIGURATION LIMITS
const TIMELINE_MIN_YEAR = 1000;
const TIMELINE_MAX_YEAR = 2000;
const PERFECT_THRESHOLD_YEARS = 5;
const MAX_THRESHOLD_YEARS = 100;
const MAX_POINTS = 1000;

export default function TimelineDropGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: TimelineDropGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [estimatedYear, setEstimatedYear] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(false);
  const [roundPoints, setRoundPoints] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [resultsList, setResultsList] = useState<RoundResult[]>([]);

  const currentEvent = TIMELINE_EVENTS[currentRoundIndex];

  // Calculate coordinates for horizontal placement relative to container
  const getPercentageForYear = (year: number) => {
    const range = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;
    const clamped = Math.max(TIMELINE_MIN_YEAR, Math.min(TIMELINE_MAX_YEAR, year));
    return ((clamped - TIMELINE_MIN_YEAR) / range) * 100;
  };

  // Convert timeline pixel horizontal click or drop offset to a specific year
  const calculateYearFromOffset = (element: HTMLDivElement, clientX: number) => {
    const rect = element.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    const range = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;
    return Math.round(TIMELINE_MIN_YEAR + percentage * range);
  };

  // React HTML5 drag events
  const handleDragStart = (e: React.DragEvent) => {
    if (isLockedIn) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", "token");
    // Ensure smooth drag styling
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isLockedIn) return;
    const year = calculateYearFromOffset(e.currentTarget, e.clientX);
    setEstimatedYear(year);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLockedIn) return;
    const year = calculateYearFromOffset(e.currentTarget, e.clientX);
    setEstimatedYear(year);
  };

  // Lock in year guess and score
  const handleLockIn = () => {
    if (estimatedYear === null) return;

    setIsLockedIn(true);

    const actual = currentEvent.actualYear;
    const diff = Math.abs(estimatedYear - actual);

    // Score computation
    let points = 0;
    if (diff <= PERFECT_THRESHOLD_YEARS) {
      points = MAX_POINTS;
    } else if (diff < MAX_THRESHOLD_YEARS) {
      points = Math.round(
        MAX_POINTS * (1 - (diff - PERFECT_THRESHOLD_YEARS) / (MAX_THRESHOLD_YEARS - PERFECT_THRESHOLD_YEARS))
      );
    }

    setRoundPoints(points);
    setCumulativeScore((prev) => prev + points);

    const resultEntry: RoundResult = {
      round: currentRoundIndex + 1,
      event: currentEvent,
      estimatedYear,
      difference: diff,
      points
    };
    setResultsList((prev) => [...prev, resultEntry]);
  };

  const handleNextRound = () => {
    setEstimatedYear(null);
    setIsLockedIn(false);
    setRoundPoints(0);

    if (currentRoundIndex + 1 < TIMELINE_EVENTS.length) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentRoundIndex(0);
    setCumulativeScore(0);
    setEstimatedYear(null);
    setIsLockedIn(false);
    setRoundPoints(0);
    setIsGameOver(false);
    setResultsList([]);
  };

  const scoreCommentary = (points: number) => {
    if (points === MAX_POINTS) return "Flawless chronological precision!";
    if (points >= 800) return "Remarkably close estimation!";
    if (points >= 500) return "Pretty accurate era placement.";
    if (points >= 200) return "Slightly out of alignment.";
    return "Way off the historical mark!";
  };

  const totalScore = resultsList.reduce((acc, r) => acc + r.points, 0);
  const avgError = resultsList.length > 0
    ? Math.round(resultsList.reduce((acc, r) => acc + r.difference, 0) / resultsList.length)
    : 0;

  const bestRound = resultsList.length > 0
    ? [...resultsList].sort((a, b) => b.points - a.points)[0]
    : null;

  return (
    <div className="w-full flex flex-col gap-6" id="timeline_drop_wrapper">
      {/* Header navigations */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="td_header_nav">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer"
          id="btn_td_exit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-xs font-black text-gray-900 uppercase">Historical Event Timeline</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="td_running_grid">
          
          {/* Main timeline interactive board (65% width) */}
          <div className="lg:col-span-8 flex flex-col gap-4" id="td_board_side">
            
            {/* Header prompt details */}
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="td_header_prompt">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  ROUND {currentRoundIndex + 1} OF {TIMELINE_EVENTS.length}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-gray-950 uppercase tracking-tight mt-0.5">
                  {currentEvent.name}
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {currentEvent.description}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-[8px] shrink-0 self-start sm:self-auto">
                <div className="text-center px-1">
                  <span className="text-[9px] text-gray-400 font-mono uppercase block">RUNNING SCORE</span>
                  <span className="text-sm font-mono font-black text-gray-950">{cumulativeScore}</span>
                </div>
              </div>
            </div>

            {/* Drag Board and Interactive Timeline Container */}
            <div className="bg-white rounded-[12px] border border-gray-250 p-6 shadow-sm flex flex-col gap-10 min-h-[340px] justify-between" id="td_timeline_canvas">
              
              {/* Event Token Card (The Draggable component) */}
              <div className="flex justify-center" id="td_token_holder">
                {!isLockedIn ? (
                  <div
                    draggable
                    onDragStart={handleDragStart}
                    className="cursor-grab active:cursor-grabbing bg-gray-900 text-white border-2 border-white px-5 py-3 rounded-[10px] shadow-md flex items-center gap-2 select-none"
                    id="td_draggable_token"
                  >
                    <Calendar className="w-4 h-4 text-gray-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Drag Me onto Timeline
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Assessment completed</span>
                  </div>
                )}
              </div>

              {/* Visual Timeline Bar */}
              <div className="relative pb-6" id="td_timeline_track_container">
                
                {/* Horizontal line track */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleTimelineClick}
                  className="w-full h-4 bg-gray-100 border border-gray-200 rounded-full relative cursor-crosshair hover:bg-gray-150 transition-colors shadow-inner"
                  id="td_track"
                >
                  {/* Grid tick marks */}
                  {Array.from({ length: 11 }).map((_, idx) => {
                    const year = TIMELINE_MIN_YEAR + idx * 100;
                    const pct = getPercentageForYear(year);
                    return (
                      <div
                        key={year}
                        className="absolute h-6 w-0.5 bg-gray-300 top-1/2 -translate-y-1/2"
                        style={{ left: `${pct}%` }}
                      >
                        <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-400 font-extrabold">
                          {year}
                        </span>
                      </div>
                    );
                  })}

                  {/* Guess marker pin */}
                  {estimatedYear !== null && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
                      style={{ left: `${getPercentageForYear(estimatedYear)}%` }}
                    >
                      <div className="bg-gray-950 text-white border-2 border-white text-[10px] font-mono font-black px-1.5 py-0.5 rounded-[4px] shadow-md mb-6 transform -translate-y-4">
                        {estimatedYear}
                      </div>
                      <div className="w-5 h-5 bg-gray-950 border-2 border-white rounded-full flex items-center justify-center shadow-md animate-[bounce_1s_infinite]">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      </div>
                    </div>
                  )}

                  {/* Actual Answer Pin */}
                  {isLockedIn && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex flex-col items-center"
                      style={{ left: `${getPercentageForYear(currentEvent.actualYear)}%` }}
                    >
                      <div className="bg-emerald-600 text-white border-2 border-white text-[10px] font-mono font-black px-1.5 py-0.5 rounded-[4px] shadow-md mb-6 transform -translate-y-4">
                        {currentEvent.actualYear}
                      </div>
                      <div className="w-5 h-5 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-[10px] text-white font-black">✓</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Informational Guidance bar */}
              <p className="text-[10px] text-center text-gray-400 font-mono mt-2">
                Click directly on the line or drag the token to fine-tune placement. Spans years {TIMELINE_MIN_YEAR}–{TIMELINE_MAX_YEAR} AD.
              </p>

            </div>

          </div>

          {/* Controller sidebar actions (35% width) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="td_sidebar_side">
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[320px]">
              
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 mb-4">
                  Timeline Placement Controls
                </h3>

                {/* State A: Awaiting choice */}
                {estimatedYear === null && (
                  <div className="text-center py-10 text-gray-400" id="td_waiting_state">
                    <Calendar className="w-10 h-10 text-gray-200 mx-auto animate-spin" style={{ animationDuration: "12s" }} />
                    <p className="text-xs font-bold mt-3 uppercase tracking-wider text-gray-400">Awaiting Year Placement</p>
                    <p className="text-[11px] text-gray-500 leading-normal px-4 mt-1 font-semibold">
                      Drag the event card down and drop it over the timeline track, or click on the year axis to make your selection.
                    </p>
                  </div>
                )}

                {/* State B: Selected, Awaiting Lock */}
                {estimatedYear !== null && !isLockedIn && (
                  <div className="space-y-4" id="td_selected_state">
                    <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-[8px] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 font-mono font-black text-xs text-gray-950">
                        {estimatedYear}
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono uppercase text-gray-400">Selected Year Position</span>
                        <p className="text-xs font-bold text-gray-900 leading-none mt-0.5">
                          Roughly {estimatedYear} AD
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                      Double-check your chronological estimation. Points scale down quickly past a 5-year threshold.
                    </p>

                    <button
                      onClick={handleLockIn}
                      className="w-full bg-gray-950 hover:bg-black text-white py-3.5 rounded-[8px] uppercase font-bold text-xs tracking-wider transition-all cursor-pointer"
                      id="btn_td_lock_in"
                    >
                      Lock In Year
                    </button>
                  </div>
                )}

                {/* State C: Feedback Revleaved */}
                {isLockedIn && estimatedYear !== null && (
                  <div className="space-y-4" id="td_feedback_state">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                      Placement Analysis
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">YEARS OFFSET</span>
                        <strong className="text-lg font-mono font-black text-gray-950">
                          {Math.abs(estimatedYear - currentEvent.actualYear)}
                        </strong>
                        <span className="block text-[8px] text-gray-500 mt-0.5 uppercase tracking-wider">years difference</span>
                      </div>

                      <div className="bg-gray-900 text-white p-3 rounded-[8px] text-center">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block">POINTS AWARDED</span>
                        <strong className="text-xl font-mono font-black text-emerald-400">+{roundPoints}</strong>
                        <span className="block text-[8px] text-gray-400 mt-0.5 uppercase tracking-wider">out of 1000</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] text-xs">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px] font-bold block mb-1">
                        Commentary
                      </span>
                      <p className="text-xs font-extrabold text-gray-900">
                        {scoreCommentary(roundPoints)}
                      </p>
                    </div>

                    <button
                      onClick={handleNextRound}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="btn_td_next_round"
                    >
                      <span>
                        {currentRoundIndex + 1 === TIMELINE_EVENTS.length ? "View Report Card" : "Next Event"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>

              {/* Rules description footer */}
              <div className="border-t border-gray-150 pt-3 mt-4 text-[10px] text-gray-400 font-mono leading-relaxed select-none">
                <span className="block font-bold">SCORING SCALE:</span>
                • Within {PERFECT_THRESHOLD_YEARS} years gets {MAX_POINTS}pts.<br />
                • Score degrades to zero past {MAX_THRESHOLD_YEARS} years difference.
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
          id="td_summary_block"
        >
          <div className="relative mb-5">
            <div className="relative w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-8 h-8 text-gray-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
            Timeline Campaign Finished!
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
            CHRONOLOGICAL PLACEMENT ANALYSIS
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
                AVG. YEAR ERROR
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {avgError} <span className="text-xs">yrs</span>
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                BEST MATCH
              </span>
              <strong className="text-xs font-black text-gray-900 block truncate mt-1">
                {bestRound ? `${bestRound.event.name} (${bestRound.difference} yrs error)` : "N/A"}
              </strong>
            </div>
          </div>

          {/* Breakdown logs */}
          <div className="w-full text-left space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-6" id="td_rounds_log">
            <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
              Chrono Placement Logs
            </h4>
            {resultsList.map((res) => (
              <div
                key={res.round}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-[8px] flex items-center justify-between text-xs font-semibold"
              >
                <div className="flex flex-col max-w-[70%]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400 font-mono">#{String(res.round).padStart(2, "0")}</span>
                    <span className="text-gray-950 truncate">{res.event.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">
                    Actual: {res.event.actualYear} | Estimated: {res.estimatedYear}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-[10px] text-gray-500 font-mono">{res.difference} yrs off</span>
                  <span className="text-xs font-black text-gray-900 font-mono">+{res.points}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="td_end_actions">
            <button
              onClick={() => onFinishGame(totalScore, "Historical Event Timeline")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_td_save"
            >
              Submit & Save Score
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold"
              id="btn_td_retry"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Timeline Challenge</span>
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}
