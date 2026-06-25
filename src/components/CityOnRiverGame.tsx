import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Trophy, Check, X, RefreshCw, ArrowRight } from "lucide-react";

// PLACEHOLDER DATA
interface CityRiverData {
  city: string;
  country: string;
  correctRiver: string;
  variants: string[]; // spelling variants or common names in lowercase
  note: string;
}

const CITY_RIVER_LIST: CityRiverData[] = [
  {
    city: "Paris",
    country: "France",
    correctRiver: "Seine",
    variants: ["seine", "la seine", "sen", "seina"],
    note: "The Seine flows right through the heart of Paris and is decorated by 37 magnificent bridges including the Pont Neuf."
  },
  {
    city: "London",
    country: "United Kingdom",
    correctRiver: "Thames",
    variants: ["thames", "river thames", "temse", "tames"],
    note: "The Thames is the longest river entirely in England, flowing through London directly into the North Sea."
  },
  {
    city: "Rome",
    country: "Italy",
    correctRiver: "Tiber",
    variants: ["tiber", "tevere", "tibis"],
    note: "Rome was founded on the banks of the Tiber River, which provided critical freshwater and access to trade routes."
  },
  {
    city: "Vienna",
    country: "Austria",
    correctRiver: "Danube",
    variants: ["danube", "donau", "dunaj", "duna"],
    note: "Vienna grew significantly along the Danube, Europe's second-longest river, which connects ten countries."
  },
  {
    city: "Prague",
    country: "Czech Republic",
    correctRiver: "Vltava",
    variants: ["vltava", "moldau", "wltava"],
    note: "Prague is split by the Vltava River, famously spanned by the historical Charles Bridge with its 30 stone statues."
  },
  {
    city: "Budapest",
    country: "Hungary",
    correctRiver: "Danube",
    variants: ["danube", "duna", "donau", "dunaj"],
    note: "The Danube River divides the capital into its two historic halves: hilly Buda and flat Pest."
  },
  {
    city: "Madrid",
    country: "Spain",
    correctRiver: "Manzanares",
    variants: ["manzanares", "río manzanares"],
    note: "Madrid was established around a fortress built on a cliff overlooking the Manzanares river valley."
  },
  {
    city: "Lisbon",
    country: "Portugal",
    correctRiver: "Tagus",
    variants: ["tagus", "tejo", "tajo"],
    note: "Lisbon is situated at the mouth of the Tagus River, the longest river on the Iberian Peninsula."
  },
  {
    city: "Dublin",
    country: "Ireland",
    correctRiver: "Liffey",
    variants: ["liffey", "an life", "river liffey"],
    note: "Dublin sits at the mouth of the River Liffey, which has divided the north and south sides of Dublin for centuries."
  },
  {
    city: "Berlin",
    country: "Germany",
    correctRiver: "Spree",
    variants: ["spree"],
    note: "The Spree River snakes through Berlin, forming the world-famous Museum Island in the center of the city."
  }
];

// FUZZY MATCH UTILITY (Levenshtein Distance)
// Returns the edit distance between two strings
function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i, j;
  const la = a.length;
  const lb = b.length;

  if (la === 0) return lb;
  if (lb === 0) return la;

  for (i = 0; i <= la; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= lb; j++) {
    tmp[0][j] = j;
  }

  for (i = 1; i <= la; i++) {
    for (j = 1; j <= lb; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[la][lb];
}

// Check if player answer fuzzy matches the target or variants within edit distance of 2
function checkFuzzyMatch(playerInput: string, target: string, variants: string[]): { isCorrect: boolean; distance: number } {
  const cleanInput = playerInput.trim().toLowerCase();
  
  // Collect all valid answer variants
  const allTargets = [target.toLowerCase(), ...variants.map(v => v.toLowerCase())];
  
  let minDistance = 999;
  for (const tgt of allTargets) {
    const dist = getLevenshteinDistance(cleanInput, tgt);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  // Edit distance of 2 or less counts as correct
  return {
    isCorrect: minDistance <= 2,
    distance: minDistance
  };
}

// SCORING CONSTANT
const CORRECT_POINTS = 1000;

interface RoundResult {
  round: number;
  city: CityRiverData;
  playerInput: string;
  isCorrect: boolean;
  distance: number;
}

interface CityOnRiverGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

export default function CityOnRiverGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: CityOnRiverGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [typedValue, setTypedValue] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const currentItem = CITY_RIVER_LIST[currentRoundIndex];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (hasSubmitted || typedValue.trim() === "") return;

    const matchResult = checkFuzzyMatch(typedValue, currentItem.correctRiver, currentItem.variants);
    
    if (matchResult.isCorrect) {
      setCumulativeScore((prev) => prev + CORRECT_POINTS);
      setCorrectCount((prev) => prev + 1);
    }

    const result: RoundResult = {
      round: currentRoundIndex + 1,
      city: currentItem,
      playerInput: typedValue,
      isCorrect: matchResult.isCorrect,
      distance: matchResult.distance
    };

    setRoundResults((prev) => [...prev, result]);
    setHasSubmitted(true);
  };

  const handleNextRound = () => {
    if (currentRoundIndex + 1 < CITY_RIVER_LIST.length) {
      setCurrentRoundIndex((prev) => prev + 1);
      setTypedValue("");
      setHasSubmitted(false);
    }
  };

  const isGameOver = hasSubmitted && currentRoundIndex + 1 === CITY_RIVER_LIST.length;

  // Stats - Find "most interesting miss" (the wrong answer that had the furthest Levenshtein distance)
  const wrongAnswers = roundResults.filter(r => !r.isCorrect);
  const mostInterestingMiss = wrongAnswers.length > 0
    ? wrongAnswers.reduce((prev, curr) => prev.distance > curr.distance ? prev : curr)
    : null;

  return (
    <div className="w-full flex flex-col gap-6 font-sans text-gray-900" id="city_river_root">
      {/* Header crumbs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4" id="city_river_header">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-all cursor-pointer"
          id="btn_back_to_menu"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Menu
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">SCORE</span>
            <span className="text-sm font-black text-gray-900 font-mono">{cumulativeScore} pts</span>
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <motion.div
          key={currentRoundIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-gray-250 rounded-[12px] p-6 shadow-xs flex flex-col gap-6"
          id={`city_river_round_${currentRoundIndex}`}
        >
          {/* Round Header */}
          <div className="flex flex-col gap-1 text-center md:text-left border-b border-gray-100 pb-4">
            <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
              Round {currentRoundIndex + 1} of {CITY_RIVER_LIST.length}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-955 mt-1">
              Which river is the city of{" "}
              <span className="underline decoration-gray-300 decoration-2 underline-offset-4 font-black text-black">
                {currentItem.city}
              </span>
              , {currentItem.country} founded on?
            </h2>
          </div>

          {!hasSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" id="city_river_input_form">
              {/* Interaction Text Field */}
              <div className="flex flex-col gap-2 bg-gray-50/50 border border-gray-150 p-6 rounded-[8px] items-center">
                <label className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-2">
                  TYPE NAME OF THE RIVER
                </label>
                <input
                  type="text"
                  value={typedValue}
                  onChange={(e) => setTypedValue(e.target.value)}
                  placeholder="Type river name..."
                  autoFocus
                  className="w-full max-w-md text-center px-4 py-3.5 bg-white border border-gray-200 rounded-[8px] font-mono text-base font-black text-gray-950 focus:border-gray-500 focus:outline-none"
                  id="river_spelling_input"
                />
                <span className="text-[10px] text-gray-400 font-mono mt-1">
                  Matching is fuzzy. Close spellings (within 2 letters edit distance) are accepted.
                </span>
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                disabled={typedValue.trim() === ""}
                className={`w-full py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  typedValue.trim() !== ""
                    ? "bg-gray-950 text-white hover:bg-black"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
                id="btn_submit_spelling"
              >
                Submit River Name
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-5"
              id="city_river_feedback_pane"
            >
              {/* Correct/Incorrect Alerts */}
              <div className={`p-4 rounded-[8px] border text-xs leading-relaxed font-semibold ${
                roundResults[roundResults.length - 1]?.isCorrect
                  ? "bg-green-50/30 border-green-200 text-green-800"
                  : "bg-red-50/30 border-red-200 text-red-800"
              }`}>
                <strong className="block uppercase font-mono text-[9px] tracking-wider mb-0.5">
                  {roundResults[roundResults.length - 1]?.isCorrect ? "CORRECT SPELLING" : "INCORRECT RECALL"}
                </strong>
                {roundResults[roundResults.length - 1]?.isCorrect ? (
                  `Superb! You correctly identified the River ${currentItem.correctRiver}. ${
                    roundResults[roundResults.length - 1]?.playerInput.toLowerCase() !== currentItem.correctRiver.toLowerCase()
                      ? `(Close match accepted for '${roundResults[roundResults.length - 1]?.playerInput}')`
                      : ""
                  } (+1000 pts)`
                ) : (
                  <span>
                    Incorrect. You entered '<span className="font-mono">{typedValue}</span>' — the correct river is the <strong className="font-bold underline">{currentItem.correctRiver}</strong>. (Levenshtein distance: {roundResults[roundResults.length - 1]?.distance} edits)
                  </span>
                )}
              </div>

              {/* Historical background note */}
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-[8px] text-xs text-gray-600 leading-relaxed font-semibold">
                <span className="font-mono text-[9px] text-gray-400 block uppercase mb-1">GEOGRAPHICAL BACKGROUND</span>
                "{currentItem.note}"
              </div>

              {/* Next Round controls */}
              <button
                onClick={handleNextRound}
                className="w-full bg-gray-950 hover:bg-black text-white py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                id="btn_next_river_round"
              >
                {currentRoundIndex + 1 < CITY_RIVER_LIST.length ? "Next Round" : "See Final Summary"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-250 rounded-[12px] p-6 shadow-xs text-center flex flex-col items-center gap-6 max-w-xl mx-auto"
          id="city_river_gameover"
        >
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-2xs">
            <Trophy className="w-6 h-6 text-gray-800" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-955 uppercase tracking-tight">
              City on the River Campaign Finished!
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
              FLUVIAL URBAN SETTLEMENT RECALL
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full text-center border-t border-b border-gray-200 py-6 my-2">
            <div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">TOTAL SCORE</span>
              <strong className="text-lg font-mono font-black text-gray-955">{cumulativeScore}</strong>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">ACCURACY</span>
              <strong className="text-lg font-mono font-black text-gray-955">
                {correctCount} / {CITY_RIVER_LIST.length} Correct
              </strong>
            </div>
          </div>

          {mostInterestingMiss && (
            <div className="w-full text-left bg-gray-50 border border-gray-150 p-4 rounded-[8px] text-xs">
              <span className="text-[9px] text-gray-400 font-mono block uppercase mb-1">MOST INTERESTING MISS</span>
              <p className="text-gray-700 font-semibold leading-relaxed">
                For the city of <strong className="text-gray-955 font-black">{mostInterestingMiss.city.city}</strong> (Target: <span className="font-mono font-bold text-gray-955">{mostInterestingMiss.city.correctRiver}</span>), you typed '<span className="font-mono text-red-600">{mostInterestingMiss.playerInput}</span>' (Distance: {mostInterestingMiss.distance} spelling steps).
              </p>
            </div>
          )}

          {/* Action trigger controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="city_river_end_actions">
            <button
              onClick={() => onFinishGame(cumulativeScore, "City on the River")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_city_river_save"
            >
              Save Results
            </button>
            <button
              onClick={() => {
                setCurrentRoundIndex(0);
                setTypedValue("");
                setHasSubmitted(false);
                setCumulativeScore(0);
                setCorrectCount(0);
                setRoundResults([]);
              }}
              className="w-full sm:flex-1 border border-gray-300 hover:border-gray-600 bg-white text-gray-850 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
              id="btn_city_river_replay"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replay Game
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
