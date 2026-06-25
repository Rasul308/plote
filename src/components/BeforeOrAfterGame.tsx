import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Trophy, ArrowRight, RefreshCw, ChevronLeft, Zap } from "lucide-react";

interface ChronoPair {
  eventA: string;
  descA: string;
  yearA: number;
  eventB: string;
  descB: string;
  yearB: number;
}

interface BeforeOrAfterGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// PLACEHOLDER DATA — replace with real content easily
const CHRONO_PAIRS: ChronoPair[] = [
  {
    eventA: "Construction of the Great Wall of China",
    descA: "Sovereign fortifications initiated under Emperor Qin Shi Huang to repel northern steppe invasions.",
    yearA: -221,
    eventB: "Assassination of Julius Caesar",
    descB: "The legendary Roman dictator is stabbed to death by mutinous senators on the Ides of March.",
    yearB: -44
  },
  {
    eventA: "Signing of the Magna Carta",
    descA: "Barons force King John to sign historic civil concessions near Windsor.",
    yearA: 1215,
    eventB: "Travels of Marco Polo to East Asia",
    descB: "The Venetian merchant voyages along the Silk Road, visiting the court of Kublai Khan.",
    yearB: 1271
  },
  {
    eventA: "Fall of Constantinople",
    descA: "Ottoman armies breach Byzantine city walls, ending the historic Roman Empire.",
    yearA: 1453,
    eventB: "Invention of the Gutenberg Printing Press",
    descB: "Johannes Gutenberg introduces movable metal type printing to Europe, sparking a text renaissance.",
    yearB: 1440
  },
  {
    eventA: "Columbus reaches the Americas",
    descA: "The Genoese explorer lands in the Bahamas, bridging global hemispheres.",
    yearA: 1492,
    eventB: "Completion of the Sistine Chapel Ceiling",
    descB: "Michelangelo paints his iconic fresco cycle under the patronage of Pope Julius II.",
    yearB: 1512
  },
  {
    eventA: "Martin Luther posts his 95 Theses",
    descA: "A theological challenge is nailed to the Wittenberg castle door, igniting Protestantism.",
    yearA: 1517,
    eventB: "Crowning of Suleiman the Magnificent",
    descB: "Suleiman ascends to the Ottoman throne, starting the empire's golden expansion era.",
    yearB: 1520
  },
  {
    eventA: "Founding of Jamestown colony",
    descA: "The first permanent English settlement in North America is chartered in Virginia.",
    yearA: 1607,
    eventB: "First telescope observation by Galileo",
    descB: "Galileo Galilei builds a refracting telescope and observes craters on the Moon.",
    yearB: 1609
  },
  {
    eventA: "Beginning of the French Revolution",
    descA: "Sovereign monarchical power is shattered by the storming of the Bastille in Paris.",
    yearA: 1789,
    eventB: "Drafting of the US Constitution",
    descB: "Constitutional delegates meet in Philadelphia to draft a supreme legal document.",
    yearB: 1787
  },
  {
    eventA: "Publication of On the Origin of Species",
    descA: "Charles Darwin publishes his revolutionary treatise detailing evolutionary biology.",
    yearA: 1859,
    eventB: "First successful laying of Transatlantic Telegraph Cable",
    descB: "A copper communications cable is successfully connected on the Atlantic floor, bridging continents.",
    yearB: 1858
  },
  {
    eventA: "Invention of the telephone by Alexander Graham Bell",
    descA: "Bell secures a patent and makes the first successful bi-directional wire call.",
    yearA: 1876,
    eventB: "Invention of the lightbulb by Thomas Edison",
    descB: "Edison successfully develops a long-lasting incandescent carbon filament bulb.",
    yearB: 1879
  },
  {
    eventA: "First flight of the Wright Brothers",
    descA: "Controlled, sustained motorized flight is achieved at Kitty Hawk, North Carolina.",
    yearA: 1903,
    eventB: "Sinking of the Titanic",
    descB: "The massive White Star ocean liner hits an iceberg in the North Atlantic and sinks.",
    yearB: 1912
  }
];

const POINTS_CORRECT = 1000;
const AUTO_ADVANCE_MS = 2500; // Giving 2.5s to read event context properly before transition

export default function BeforeOrAfterGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: BeforeOrAfterGameProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<"A" | "B" | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [runningScore, setRunningScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(Math.ceil(AUTO_ADVANCE_MS / 1000));
  const [roundStats, setRoundStats] = useState<{
    round: number;
    pair: ChronoPair;
    userGuess: "A" | "B";
    correctChoice: "A" | "B";
    isCorrect: boolean;
  }[]>([]);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentPair = CHRONO_PAIRS[currentIdx];
  const correctChoice = currentPair.yearA < currentPair.yearB ? "A" : "B";

  const handleGuess = (guess: "A" | "B") => {
    if (isRevealed) return;

    setSelectedEvent(guess);
    setIsRevealed(true);

    const isCorrect = guess === correctChoice;

    if (isCorrect) {
      setRunningScore((prev) => prev + POINTS_CORRECT);
      setCurrentStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      setCurrentStreak(0);
    }

    setRoundStats((prev) => [
      ...prev,
      {
        round: currentIdx + 1,
        pair: currentPair,
        userGuess: guess,
        correctChoice,
        isCorrect
      }
    ]);

    // Start auto-advance countdown triggers
    let remainingSec = Math.ceil(AUTO_ADVANCE_MS / 1000);
    setCountdown(remainingSec);

    countdownIntervalRef.current = setInterval(() => {
      remainingSec -= 1;
      setCountdown(Math.max(0, remainingSec));
    }, 1000);

    autoAdvanceTimerRef.current = setTimeout(() => {
      handleNext();
    }, AUTO_ADVANCE_MS);
  };

  const handleNext = () => {
    // Clear any timers
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setSelectedEvent(null);
    setIsRevealed(false);

    if (currentIdx + 1 < CHRONO_PAIRS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIdx(0);
    setSelectedEvent(null);
    setIsRevealed(false);
    setRunningScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setIsGameOver(false);
    setRoundStats([]);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const totalCorrectCount = roundStats.filter((r) => r.isCorrect).length;

  return (
    <div className="w-full flex flex-col gap-6" id="before_or_after_wrapper">
      {/* Top Bar navigations */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="boa_top_nav">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer"
          id="btn_boa_exit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-xs font-black text-gray-900 uppercase">Which Event Happened First?</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full flex flex-col gap-6" id="boa_running_board">
          
          {/* Round Header detail card */}
          <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="boa_header_card">
            <div>
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                ROUND {currentIdx + 1} OF {CHRONO_PAIRS.length}
              </span>
              <h1 className="text-lg font-black text-gray-950 uppercase tracking-tight mt-0.5">
                Which event happened first?
              </h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Select the historical event that occurred earlier in chronology. Fast mode with immediate choice.
              </p>
            </div>

            {/* Score & Streak trackers */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-[8px] self-start sm:self-auto select-none shrink-0">
              <div className="text-center px-2 border-r border-gray-200">
                <span className="text-[9px] text-gray-400 font-mono block">RUNNING SCORE</span>
                <span className="text-sm font-mono font-black text-gray-950">{runningScore}</span>
              </div>
              <div className="text-center px-2 flex items-center gap-1">
                <span className="text-[14px]">🔥</span>
                <div>
                  <span className="text-[9px] text-gray-400 font-mono block leading-none">STREAK</span>
                  <span className="text-xs font-mono font-black text-gray-950">{currentStreak}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Side-by-side card items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="boa_options_grid">
            
            {/* CARD A */}
            <motion.button
              whileHover={{ y: isRevealed ? 0 : -3, borderColor: isRevealed ? "" : "rgb(17, 24, 39)" }}
              whileTap={{ scale: isRevealed ? 1 : 0.98 }}
              disabled={isRevealed}
              onClick={() => handleGuess("A")}
              className={`text-left p-6 rounded-[16px] border flex flex-col justify-between gap-4 min-h-[220px] transition-all relative ${
                !isRevealed
                  ? "bg-white border-gray-200 hover:bg-gray-50/50 cursor-pointer text-gray-900"
                  : correctChoice === "A"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20"
                  : selectedEvent === "A"
                  ? "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20"
                  : "bg-white border-gray-200 opacity-50 text-gray-400"
              }`}
              id="boa_card_a"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-black">
                    EVENT A
                  </span>
                  {isRevealed && (
                    <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-[4px] ${
                      correctChoice === "A" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {currentPair.yearA < 0 ? `${Math.abs(currentPair.yearA)} BC` : `${currentPair.yearA} AD`}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold tracking-tight uppercase text-gray-950">
                  {currentPair.eventA}
                </h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  {currentPair.descA}
                </p>
              </div>

              {isRevealed && correctChoice === "A" && (
                <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                  ✓ Happened First
                </div>
              )}
            </motion.button>

            {/* CARD B */}
            <motion.button
              whileHover={{ y: isRevealed ? 0 : -3, borderColor: isRevealed ? "" : "rgb(17, 24, 39)" }}
              whileTap={{ scale: isRevealed ? 1 : 0.98 }}
              disabled={isRevealed}
              onClick={() => handleGuess("B")}
              className={`text-left p-6 rounded-[16px] border flex flex-col justify-between gap-4 min-h-[220px] transition-all relative ${
                !isRevealed
                  ? "bg-white border-gray-200 hover:bg-gray-50/50 cursor-pointer text-gray-900"
                  : correctChoice === "B"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20"
                  : selectedEvent === "B"
                  ? "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20"
                  : "bg-white border-gray-200 opacity-50 text-gray-400"
              }`}
              id="boa_card_b"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-black">
                    EVENT B
                  </span>
                  {isRevealed && (
                    <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-[4px] ${
                      correctChoice === "B" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {currentPair.yearB < 0 ? `${Math.abs(currentPair.yearB)} BC` : `${currentPair.yearB} AD`}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold tracking-tight uppercase text-gray-950">
                  {currentPair.eventB}
                </h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  {currentPair.descB}
                </p>
              </div>

              {isRevealed && correctChoice === "B" && (
                <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                  ✓ Happened First
                </div>
              )}
            </motion.button>

          </div>

          {/* Immediate dynamic countdown transition info */}
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-250 p-4 rounded-[12px] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
              id="boa_countdown_guide"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-gray-950 animate-bounce" />
                <p className="text-xs font-semibold text-gray-700">
                  {selectedEvent === correctChoice ? (
                    <span className="text-emerald-700 font-extrabold block">Correct Chronology! Streak continues.</span>
                  ) : (
                    <span className="text-rose-700 font-extrabold block">Incorrect Chronology. Streak resets.</span>
                  )}
                  Auto-advancing in <strong className="font-mono">{countdown}s</strong>...
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto bg-gray-950 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider px-5 py-2 rounded-[6px] transition-all cursor-pointer shrink-0"
                id="btn_boa_manual_next"
              >
                Skip Countdown & Next
              </button>
            </motion.div>
          )}

        </div>
      ) : (
        /* End-of-game summary screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl mx-auto bg-white border border-gray-250 rounded-[16px] p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative z-20"
          id="boa_summary_block"
        >
          <div className="relative mb-5">
            <div className="relative w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-8 h-8 text-gray-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
            Chrono Speed Run Finished!
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
            WHICH EVENT HAPPENED FIRST? PERFORMANCE CARD
          </p>

          <div className="grid grid-cols-3 gap-3 w-full text-center border-t border-b border-gray-200 py-6 mb-6">
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                COMBINED POINTS
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {runningScore}
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                ACCURACY RATE
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {totalCorrectCount} / {CHRONO_PAIRS.length}
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                LONGEST STREAK
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                🔥 {maxStreak}
              </strong>
            </div>
          </div>

          {/* Breakdown session details logs */}
          <div className="w-full text-left space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-6" id="boa_rounds_log">
            <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
              Chrono Pairs History
            </h4>
            {roundStats.map((log) => (
              <div
                key={log.round}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-[8px] flex items-center justify-between text-xs font-semibold"
              >
                <div className="flex flex-col max-w-[70%]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400 font-mono">#{String(log.round).padStart(2, "0")}</span>
                    <span className={`text-[9px] font-bold ${log.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                      {log.isCorrect ? "CORRECT" : "WRONG"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono leading-none mt-0.5 block truncate">
                    Years: {log.pair.yearA} vs {log.pair.yearB}
                  </span>
                </div>
                <span className="text-xs font-black text-gray-900 font-mono">
                  {log.isCorrect ? `+${POINTS_CORRECT}` : "0"}
                </span>
              </div>
            ))}
          </div>

          {/* Action trigger controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="boa_end_actions">
            <button
              onClick={() => onFinishGame(runningScore, "Which Event Happened First?")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_boa_save"
            >
              Submit & Save Score
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold"
              id="btn_boa_retry"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Speed Run</span>
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}
