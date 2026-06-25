import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Trophy, Check, X, RefreshCw, ArrowRight } from "lucide-react";

// PLACEHOLDER DATA
interface PeakOption {
  name: string;
  elevation: number; // in meters
}

interface PeakCountryData {
  country: string;
  correctPeak: string;
  correctElevation: number;
  options: PeakOption[]; // 4 options containing correct & wrong peaks
  note: string;
}

const PEAK_COUNTRY_LIST: PeakCountryData[] = [
  {
    country: "Russia",
    correctPeak: "Mount Elbrus",
    correctElevation: 5642,
    options: [
      { name: "Mount Elbrus", elevation: 5642 },
      { name: "Mont Blanc", elevation: 4808 },
      { name: "Pik Pobedy", elevation: 7439 },
      { name: "Mount Kazbek", elevation: 5054 }
    ],
    note: "Mount Elbrus is an inactive volcano in the Caucasus Mountains and is considered the highest peak in all of Europe."
  },
  {
    country: "Argentina",
    correctPeak: "Aconcagua",
    correctElevation: 6961,
    options: [
      { name: "Aconcagua", elevation: 6961 },
      { name: "Ojos del Salado", elevation: 6893 },
      { name: "Huascarán", elevation: 6768 },
      { name: "Chimborazo", elevation: 6263 }
    ],
    note: "Aconcagua is the highest mountain outside of Asia, located entirely within Argentina in the Andes range."
  },
  {
    country: "Japan",
    correctPeak: "Mount Fuji",
    correctElevation: 3776,
    options: [
      { name: "Mount Fuji", elevation: 3776 },
      { name: "Mount Kita", elevation: 3193 },
      { name: "Mount Hotaka", elevation: 3190 },
      { name: "Mount Tate", elevation: 3015 }
    ],
    note: "Mount Fuji is an active stratovolcano and one of Japan's 'Three Holy Mountains', renowned for its symmetrical cone shape."
  },
  {
    country: "United States",
    correctPeak: "Denali",
    correctElevation: 6190,
    options: [
      { name: "Denali", elevation: 6190 },
      { name: "Mount Whitney", elevation: 4421 },
      { name: "Mount Rainier", elevation: 4392 },
      { name: "Mount Elbert", elevation: 4401 }
    ],
    note: "Denali, formerly Mount McKinley, is located in Alaska and is the tallest mountain peak in North America."
  },
  {
    country: "Tanzania",
    correctPeak: "Mount Kilimanjaro",
    correctElevation: 5895,
    options: [
      { name: "Mount Kilimanjaro", elevation: 5895 },
      { name: "Mount Kenya", elevation: 5199 },
      { name: "Mount Stanley", elevation: 5109 },
      { name: "Mount Meru", elevation: 4562 }
    ],
    note: "Kilimanjaro is a dormant volcano in Tanzania and holds the title of the tallest free-standing mountain in the world."
  },
  {
    country: "Switzerland",
    correctPeak: "Dufourspitze",
    correctElevation: 4634,
    options: [
      { name: "Dufourspitze", elevation: 4634 },
      { name: "Matterhorn", elevation: 4478 },
      { name: "Jungfrau", elevation: 4158 },
      { name: "Eiger", elevation: 3967 }
    ],
    note: "Dufourspitze is the highest peak of Monte Rosa and the tallest summit in Switzerland, although the Matterhorn is more famous."
  },
  {
    country: "Nepal",
    correctPeak: "Mount Everest",
    correctElevation: 8848,
    options: [
      { name: "Mount Everest", elevation: 8848 },
      { name: "K2", elevation: 8611 },
      { name: "Kangchenjunga", elevation: 8586 },
      { name: "Lhotse", elevation: 8516 }
    ],
    note: "Mount Everest, located on the border between Nepal and China, is Earth's highest mountain above sea level."
  },
  {
    country: "Australia",
    correctPeak: "Mount Kosciuszko",
    correctElevation: 2228,
    options: [
      { name: "Mount Kosciuszko", elevation: 2228 },
      { name: "Mount Townsend", elevation: 2209 },
      { name: "Mawson Peak", elevation: 2745 },
      { name: "Mount Twynam", elevation: 2196 }
    ],
    note: "Mount Kosciuszko is located in New South Wales. While Mawson Peak is higher, it is located on a remote external territory."
  },
  {
    country: "Italy",
    correctPeak: "Mont Blanc",
    correctElevation: 4808,
    options: [
      { name: "Mont Blanc", elevation: 4808 },
      { name: "Gran Paradiso", elevation: 4061 },
      { name: "Monte Rosa", elevation: 4634 },
      { name: "Mount Etna", elevation: 3357 }
    ],
    note: "Mont Blanc (Monte Bianco in Italian) sits on the French-Italian border, representing the highest peak in Italy and Western Europe."
  },
  {
    country: "Canada",
    correctPeak: "Mount Logan",
    correctElevation: 5959,
    options: [
      { name: "Mount Logan", elevation: 5959 },
      { name: "Mount Robson", elevation: 3954 },
      { name: "Mount Waddington", elevation: 4019 },
      { name: "Mount Columbia", elevation: 3747 }
    ],
    note: "Mount Logan is located in southwestern Yukon and is the second-tallest peak in North America, behind Denali."
  }
];

// SCORING CONSTANT
const CORRECT_POINTS = 1000;

interface PeakFinderGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

export default function PeakFinderGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: PeakFinderGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [selectedPeak, setSelectedPeak] = useState<PeakOption | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const currentItem = PEAK_COUNTRY_LIST[currentRoundIndex];

  const handleSelectPeak = (peak: PeakOption) => {
    if (hasSubmitted) return;
    setSelectedPeak(peak);
  };

  const handleSubmit = () => {
    if (hasSubmitted || !selectedPeak) return;

    const isCorrect = selectedPeak.name === currentItem.correctPeak;
    if (isCorrect) {
      setCumulativeScore((prev) => prev + CORRECT_POINTS);
      setCorrectCount((prev) => prev + 1);
    }

    setHasSubmitted(true);
  };

  const handleNextRound = () => {
    if (currentRoundIndex + 1 < PEAK_COUNTRY_LIST.length) {
      setCurrentRoundIndex((prev) => prev + 1);
      setSelectedPeak(null);
      setHasSubmitted(false);
    }
  };

  const isGameOver = hasSubmitted && currentRoundIndex + 1 === PEAK_COUNTRY_LIST.length;

  return (
    <div className="w-full flex flex-col gap-6 font-sans text-gray-900" id="peak_finder_root">
      {/* Header crumbs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4" id="peak_finder_header">
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
          className="bg-white border border-gray-250 rounded-[12px] p-6 shadow-xs flex flex-col gap-6 relative overflow-hidden"
          id={`peak_finder_round_${currentRoundIndex}`}
        >
          {/* Optional visual: A simple mountain peak outline silhouette backdrop */}
          <div className="absolute right-6 top-6 w-28 h-16 opacity-[0.06] pointer-events-none select-none flex items-end justify-end">
            <svg viewBox="0 0 100 50" className="w-full h-full stroke-gray-950 fill-none stroke-[2.5] stroke-linejoin-round">
              <path d="M5,45 L35,10 L50,28 L75,5 L95,45 Z" />
              <path d="M35,10 L41,18 L33,22" />
              <path d="M75,5 L81,15 L72,18" />
            </svg>
          </div>

          {/* Round Header */}
          <div className="flex flex-col gap-1 text-center md:text-left border-b border-gray-100 pb-4 z-10">
            <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
              Round {currentRoundIndex + 1} of {PEAK_COUNTRY_LIST.length}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-955 mt-1">
              What is the highest mountain peak in the country of{" "}
              <span className="underline decoration-gray-300 decoration-2 underline-offset-4 font-black text-black">
                {currentItem.country}
              </span>?
            </h2>
          </div>

          {/* 4 Peak Multiple Choice Option cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 z-10" id="peak_options_grid">
            {currentItem.options.map((option, index) => {
              const isSelected = selectedPeak?.name === option.name;
              const isCorrect = option.name === currentItem.correctPeak;
              
              let cardStyle = "border-gray-200 bg-white hover:border-gray-400";
              let iconElement = null;

              if (hasSubmitted) {
                if (isCorrect) {
                  cardStyle = "border-green-600 bg-green-50/50";
                  iconElement = <Check className="w-4 h-4 text-green-600 shrink-0" />;
                } else if (isSelected) {
                  cardStyle = "border-red-600 bg-red-50/50";
                  iconElement = <X className="w-4 h-4 text-red-600 shrink-0" />;
                } else {
                  cardStyle = "border-gray-200 bg-white opacity-60";
                }
              } else if (isSelected) {
                cardStyle = "border-gray-950 bg-gray-50/50";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectPeak(option)}
                  disabled={hasSubmitted}
                  className={`p-4 rounded-[8px] border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? "text-gray-955" : "text-gray-700"}`}>
                      {option.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {option.elevation.toLocaleString()} meters ({Math.round(option.elevation * 3.28084).toLocaleString()} ft)
                    </span>
                  </div>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Action Trigger control */}
          <div className="flex flex-col gap-4 z-10">
            {!hasSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedPeak}
                className={`w-full py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  selectedPeak
                    ? "bg-gray-950 text-white hover:bg-black"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
                id="btn_submit_peak"
              >
                Confirm Mountain Peak
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
                id="peak_feedback_pane"
              >
                {/* Answer evaluation banners */}
                <div className={`p-4 rounded-[8px] border text-xs leading-relaxed font-semibold ${
                  selectedPeak?.name === currentItem.correctPeak
                    ? "bg-green-50/30 border-green-200 text-green-800"
                    : "bg-red-50/30 border-red-200 text-red-800"
                }`}>
                  <strong className="block uppercase font-mono text-[9px] tracking-wider mb-0.5">
                    {selectedPeak?.name === currentItem.correctPeak ? "CORRECT SUMMIT" : "INCORRECT PEAK"}
                  </strong>
                  {selectedPeak?.name === currentItem.correctPeak
                    ? `Outstanding! ${currentItem.correctPeak} (${currentItem.correctElevation.toLocaleString()}m) is indeed the highest point. (+1000 pts)`
                    : `Incorrect. You chose ${selectedPeak?.name}, but the highest summit is ${currentItem.correctPeak} at ${currentItem.correctElevation.toLocaleString()} meters.`}
                </div>

                {/* Geographical explanatory notes */}
                <div className="bg-gray-50 border border-gray-150 p-4 rounded-[8px] text-xs text-gray-600 leading-relaxed font-semibold">
                  <span className="font-mono text-[9px] text-gray-400 block uppercase mb-1">GEOGRAPHICAL BACKGROUND</span>
                  "{currentItem.note}"
                </div>

                {/* Navigation CTA controls */}
                <button
                  onClick={handleNextRound}
                  className="w-full bg-gray-950 hover:bg-black text-white py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  id="btn_next_peak_round"
                >
                  {currentRoundIndex + 1 < PEAK_COUNTRY_LIST.length ? "Next Round" : "See Final Summary"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-250 rounded-[12px] p-6 shadow-xs text-center flex flex-col items-center gap-6 max-w-xl mx-auto"
          id="peak_finder_gameover"
        >
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-2xs">
            <Trophy className="w-6 h-6 text-gray-800" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-955 uppercase tracking-tight">
              Summit Expedition Campaign Finished!
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
              GLOBAL SUMMIT ACCURACY SHEET
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
                {correctCount} / {PEAK_COUNTRY_LIST.length} Correct
              </strong>
            </div>
          </div>

          {/* Action trigger controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="peak_finder_end_actions">
            <button
              onClick={() => onFinishGame(cumulativeScore, "Highest Peak Finder")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_peak_finder_save"
            >
              Save Results
            </button>
            <button
              onClick={() => {
                setCurrentRoundIndex(0);
                setSelectedPeak(null);
                setHasSubmitted(false);
                setCumulativeScore(0);
                setCorrectCount(0);
              }}
              className="w-full sm:flex-1 border border-gray-300 hover:border-gray-600 bg-white text-gray-850 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
              id="btn_peak_finder_replay"
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
