import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Trophy, Users, ArrowRight, RefreshCw } from "lucide-react";

// PLACEHOLDER DATA
interface MetroCity {
  name: string;
  country: string;
  population: number; // actual metropolitan population figure
  fact: string; // Fun context line
}

const METRO_CITIES: MetroCity[] = [
  {
    name: "Istanbul",
    country: "Turkey",
    population: 16000000,
    fact: "Istanbul is the largest city in Europe by population — larger than London or Moscow."
  },
  {
    name: "London",
    country: "United Kingdom",
    population: 14800000,
    fact: "London's metropolitan area contains more than 15% of the total UK population."
  },
  {
    name: "Paris",
    country: "France",
    population: 13100000,
    fact: "Paris is the largest metropolitan economy in Europe, slightly ahead of London."
  },
  {
    name: "Katowice",
    country: "Poland",
    population: 2700000,
    fact: "The Katowice metropolitan area is a major industrial hub, larger in population than Warsaw's metro core."
  },
  {
    name: "Kharkiv",
    country: "Ukraine",
    population: 2100000,
    fact: "Kharkiv is Ukraine's second-largest city and is famous for its vast public squares and student population."
  },
  {
    name: "Zurich",
    country: "Switzerland",
    population: 1400000,
    fact: "Zurich's metropolitan region, though relatively small globally, produces over 20% of Swiss GDP."
  },
  {
    name: "Vienna",
    country: "Austria",
    population: 2900000,
    fact: "Nearly a third of Austria's entire population lives in the Vienna metropolitan area."
  },
  {
    name: "Athens",
    country: "Greece",
    population: 3800000,
    fact: "Athens' metropolitan area contains more than one-third of the total Greek population."
  },
  {
    name: "Munich",
    country: "Germany",
    population: 6200000,
    fact: "The Munich metropolitan region is one of the fastest-growing economic areas in Germany."
  },
  {
    name: "Lisbon",
    country: "Portugal",
    population: 3000000,
    fact: "Lisbon's metropolitan area accounts for roughly 45% of Portugal's national economic output."
  }
];

// SCORING CONSTANTS
const MAX_POINTS = 1000;
const PERFECT_THRESHOLD_PCT = 10; // within 10% = full points
const ZERO_THRESHOLD_PCT = 50; // more than 50% error = 0 points

interface RoundResult {
  round: number;
  city: MetroCity;
  estimate: number;
  pctError: number;
  points: number;
}

interface MetroPopulationGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

export default function MetroPopulationGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: MetroPopulationGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  
  // Slider position from 0 to 100
  const [sliderPos, setSliderPos] = useState<number>(0);
  // Synced input value
  const [estimateValue, setEstimateValue] = useState<number>(100000);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  // Logarithmic conversion helper
  // Range: 100,000 to 20,000,000
  const MIN_POP = 100000;
  const MAX_POP = 20000000;
  const logRatio = MAX_POP / MIN_POP; // 200

  const convertSliderToPop = (pos: number): number => {
    return Math.round(MIN_POP * Math.pow(logRatio, pos / 100));
  };

  const convertPopToSlider = (pop: number): number => {
    if (pop <= MIN_POP) return 0;
    if (pop >= MAX_POP) return 100;
    return 100 * (Math.log(pop / MIN_POP) / Math.log(logRatio));
  };

  const currentCity = METRO_CITIES[currentRoundIndex];

  // Reset round state
  const startRound = (index: number) => {
    setCurrentRoundIndex(index);
    setSliderPos(0);
    setEstimateValue(MIN_POP);
    setIsDirty(false);
    setHasSubmitted(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderPos(val);
    setEstimateValue(convertSliderToPop(val));
    setIsDirty(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    const val = cleaned === "" ? 0 : parseInt(cleaned, 10);
    setEstimateValue(val);
    setIsDirty(true);
    
    // Sync slider pos
    const pos = convertPopToSlider(val);
    setSliderPos(pos);
  };

  const handleBlur = () => {
    let clamped = estimateValue;
    if (estimateValue < MIN_POP) {
      clamped = MIN_POP;
    } else if (estimateValue > MAX_POP) {
      clamped = MAX_POP;
    }
    setEstimateValue(clamped);
    setSliderPos(convertPopToSlider(clamped));
  };

  const handleCalculateScore = () => {
    if (hasSubmitted) return;

    const actual = currentCity.population;
    const diff = Math.abs(estimateValue - actual);
    const pctError = (diff / actual) * 100;

    let points = 0;
    if (pctError <= PERFECT_THRESHOLD_PCT) {
      points = MAX_POINTS;
    } else if (pctError >= ZERO_THRESHOLD_PCT) {
      points = 0;
    } else {
      // Linear scaling between PERFECT_THRESHOLD_PCT and ZERO_THRESHOLD_PCT
      const scaleRange = ZERO_THRESHOLD_PCT - PERFECT_THRESHOLD_PCT;
      const errorDiff = pctError - PERFECT_THRESHOLD_PCT;
      points = Math.round(MAX_POINTS * (1 - errorDiff / scaleRange));
    }

    setCumulativeScore((prev) => prev + points);
    
    const result: RoundResult = {
      round: currentRoundIndex + 1,
      city: currentCity,
      estimate: estimateValue,
      pctError: pctError,
      points: points
    };

    setRoundResults((prev) => [...prev, result]);
    setHasSubmitted(true);
  };

  const handleNextRound = () => {
    if (currentRoundIndex + 1 < METRO_CITIES.length) {
      startRound(currentRoundIndex + 1);
    } else {
      // Game over state is handled inline
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const isGameOver = roundResults.length === METRO_CITIES.length && hasSubmitted;

  // Stats
  const avgPctError = roundResults.length > 0 
    ? Math.round(roundResults.reduce((acc, r) => acc + r.pctError, 0) / roundResults.length) 
    : 0;

  const mostAccurateGuess = roundResults.length > 0
    ? roundResults.reduce((prev, curr) => prev.pctError < curr.pctError ? prev : curr)
    : null;

  return (
    <div className="w-full flex flex-col gap-6 font-sans text-gray-900" id="metro_pop_root">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4" id="metro_pop_header">
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
          id={`metro_pop_round_${currentRoundIndex}`}
        >
          {/* Round Header */}
          <div className="flex flex-col gap-1 text-center md:text-left border-b border-gray-100 pb-4">
            <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
              Round {currentRoundIndex + 1} of {METRO_CITIES.length}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-950 mt-1">
              How many people live in the greater metropolitan area of{" "}
              <span className="underline decoration-gray-300 decoration-2 underline-offset-4 font-black text-black">
                {currentCity.name}
              </span>
              , {currentCity.country}?
            </h2>
          </div>

          {!hasSubmitted ? (
            <div className="flex flex-col gap-6" id="estimate_input_state">
              {/* Slider & Input interaction */}
              <div className="flex flex-col items-center gap-6 bg-gray-50/50 border border-gray-150 p-6 rounded-[8px]">
                
                {/* Synced Large Numeric Display */}
                <div className="text-center">
                  <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1">
                    YOUR CURRENT ESTIMATE
                  </span>
                  <div className="text-3xl font-black text-gray-950 tracking-tight font-mono">
                    {formatNumber(estimateValue)}
                  </div>
                </div>

                {/* Logarithmic Slider */}
                <div className="w-full flex flex-col gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={sliderPos}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-950"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono tracking-wider">
                    <span>100K (Min)</span>
                    <span>1.4M</span>
                    <span>20M (Max)</span>
                  </div>
                </div>

                {/* Numeric Manual Input Input */}
                <div className="w-full max-w-xs flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase text-center">
                    OR TYPE VALUE MANUALLY
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={estimateValue === 0 ? "" : estimateValue}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 1,500,000"
                      className="w-full text-center px-4 py-3 bg-white border border-gray-200 rounded-[8px] font-mono text-sm font-black text-gray-950 focus:border-gray-500 focus:outline-none focus:ring-0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-mono text-[10px] uppercase font-bold tracking-widest">
                      PEOPLE
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleCalculateScore}
                disabled={!isDirty}
                className={`w-full py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  isDirty
                    ? "bg-gray-950 text-white hover:bg-black"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
                id="btn_submit_estimate"
              >
                Submit Estimate
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
              id="feedback_reveal_state"
            >
              {/* Feedback Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-[8px] text-center">
                  <span className="text-[10px] text-gray-400 font-mono block uppercase">Your Guess</span>
                  <strong className="text-xl font-mono font-black text-gray-950 block mt-1">
                    {formatNumber(estimateValue)}
                  </strong>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-[8px] text-center">
                  <span className="text-[10px] text-gray-400 font-mono block uppercase">Actual Population</span>
                  <strong className="text-xl font-mono font-black text-green-700 block mt-1">
                    {formatNumber(currentCity.population)}
                  </strong>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-[8px] text-center">
                  <span className="text-[10px] text-gray-400 font-mono block uppercase">Accuracy Metric</span>
                  <strong className={`text-xl font-mono font-black block mt-1 ${
                    Math.abs(estimateValue - currentCity.population) / currentCity.population <= PERFECT_THRESHOLD_PCT / 100
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}>
                    {Math.round(Math.abs(estimateValue - currentCity.population) / currentCity.population * 100)}% Error
                  </strong>
                </div>

              </div>

              {/* Awarded Points Alert */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-[8px] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-400 font-mono uppercase block">SCORING DISTRIBUTION</span>
                  <p className="text-xs text-gray-700 font-semibold mt-0.5">
                    {roundResults[roundResults.length - 1]?.points === MAX_POINTS 
                      ? "Flawless estimation! Full points awarded." 
                      : roundResults[roundResults.length - 1]?.points === 0 
                      ? "Estimation error exceeded 50%. Zero points earned."
                      : `Points scaled based on ${Math.round(roundResults[roundResults.length - 1]?.pctError)}% error.`}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-[6px] text-center">
                  <span className="text-[8px] text-gray-400 font-mono uppercase block">EARNED</span>
                  <span className="text-md font-mono font-black text-gray-950">
                    +{roundResults[roundResults.length - 1]?.points} pts
                  </span>
                </div>
              </div>

              {/* Fun contextual fact */}
              <div className="border-l-4 border-gray-950 bg-gray-50/50 p-4 rounded-r-[8px] text-xs text-gray-600 leading-relaxed font-semibold">
                <span className="font-mono text-[9px] text-gray-400 block uppercase mb-1">GEOGRAPHICAL BACKGROUND</span>
                "{currentCity.fact}"
              </div>

              {/* Next Round Button */}
              <button
                onClick={handleNextRound}
                className="w-full bg-gray-950 hover:bg-black text-white py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                id="btn_next_round"
              >
                {currentRoundIndex + 1 < METRO_CITIES.length ? "Next Round" : "See Final Summary"}
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
          id="metro_pop_gameover"
        >
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-2xs">
            <Trophy className="w-6 h-6 text-gray-800" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight">
              Metropolitan Campaign Finished!
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
              POPULATION RECKONING ANALYSIS
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full text-center border-t border-b border-gray-200 py-6 my-2">
            <div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">TOTAL SCORE</span>
              <strong className="text-lg font-mono font-black text-gray-950">{cumulativeScore}</strong>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">AVG ERROR</span>
              <strong className="text-lg font-mono font-black text-gray-950">{avgPctError}%</strong>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-mono block uppercase">BEST GUESS</span>
              <strong className="text-lg font-mono font-black text-green-700">
                {mostAccurateGuess ? `${Math.round(mostAccurateGuess.pctError)}%` : "N/A"}
              </strong>
            </div>
          </div>

          {mostAccurateGuess && (
            <div className="w-full text-left bg-gray-50 border border-gray-150 p-4 rounded-[8px] text-xs">
              <span className="text-[9px] text-gray-400 font-mono block uppercase mb-1">MOST ACCURATE ESTIMATE</span>
              <p className="text-gray-700 font-semibold leading-relaxed">
                You estimated <strong className="text-gray-950 font-black">{formatNumber(mostAccurateGuess.estimate)}</strong> for <strong className="text-gray-950 font-black">{mostAccurateGuess.city.name}</strong> (Actual: {formatNumber(mostAccurateGuess.city.population)}). This is an outstanding accuracy tier!
              </p>
            </div>
          )}

          {/* Action trigger controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="metro_pop_end_actions">
            <button
              onClick={() => onFinishGame(cumulativeScore, "Metro Population Challenge")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_metro_pop_save"
            >
              Save Results
            </button>
            <button
              onClick={() => startRound(0)}
              className="w-full sm:flex-1 border border-gray-300 hover:border-gray-600 bg-white text-gray-850 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
              id="btn_metro_pop_replay"
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
