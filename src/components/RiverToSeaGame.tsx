import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Trophy, Check, X, RefreshCw, ArrowRight } from "lucide-react";

// PLACEHOLDER DATA
interface RiverData {
  name: string;
  correctDestination: string;
  options: string[]; // 4 options including correct one
  explanation: string;
}

const RIVER_DATA_LIST: RiverData[] = [
  {
    name: "Danube",
    correctDestination: "Black Sea",
    options: ["Black Sea", "Caspian Sea", "Adriatic Sea", "Mediterranean Sea"],
    explanation: "The Danube flows southeast through ten countries before draining into the Black Sea via the Danube Delta."
  },
  {
    name: "Rhine",
    correctDestination: "North Sea",
    options: ["North Sea", "Baltic Sea", "Celtic Sea", "English Channel"],
    explanation: "The Rhine flows north from Switzerland through Germany and the Netherlands into the North Sea."
  },
  {
    name: "Volga",
    correctDestination: "Caspian Sea",
    options: ["Caspian Sea", "Black Sea", "Baltic Sea", "Barents Sea"],
    explanation: "The Volga is Europe's longest river, flowing through central Russia into the landlocked Caspian Sea."
  },
  {
    name: "Nile",
    correctDestination: "Mediterranean Sea",
    options: ["Mediterranean Sea", "Red Sea", "Persian Gulf", "Indian Ocean"],
    explanation: "The Nile, historically the world's longest river, flows northward through northeastern Africa into the Mediterranean Sea."
  },
  {
    name: "Amazon",
    correctDestination: "Atlantic Ocean",
    options: ["Atlantic Ocean", "Pacific Ocean", "Caribbean Sea", "Gulf of Mexico"],
    explanation: "The Amazon River discharges the largest volume of water globally, emptying into the Atlantic Ocean on Brazil's northern coast."
  },
  {
    name: "Mississippi",
    correctDestination: "Gulf of Mexico",
    options: ["Gulf of Mexico", "Atlantic Ocean", "Chesapeake Bay", "Hudson Bay"],
    explanation: "The Mississippi River flows south through the United States, discharging into the Gulf of Mexico south of New Orleans."
  },
  {
    name: "Ganges",
    correctDestination: "Bay of Bengal",
    options: ["Bay of Bengal", "Arabian Sea", "Laccadive Sea", "South China Sea"],
    explanation: "The Ganges flows through India and Bangladesh, emptying into the Bay of Bengal and forming the world's largest delta."
  },
  {
    name: "Mekong",
    correctDestination: "South China Sea",
    options: ["South China Sea", "Andaman Sea", "Gulf of Thailand", "East China Sea"],
    explanation: "The Mekong flows from the Tibetan Plateau through Southeast Asia, draining into the South China Sea south of Ho Chi Minh City."
  },
  {
    name: "Congo",
    correctDestination: "Atlantic Ocean",
    options: ["Atlantic Ocean", "Indian Ocean", "Red Sea", "Mediterranean Sea"],
    explanation: "The Congo is the world's deepest river and flows westward across central Africa, discharging into the Atlantic Ocean."
  },
  {
    name: "Colorado",
    correctDestination: "Gulf of California",
    options: ["Gulf of California", "Pacific Ocean", "Gulf of Mexico", "Great Salt Lake"],
    explanation: "The Colorado River flows through the Southwestern US and northwestern Mexico, historically draining into the Gulf of California."
  }
];

// SCORING CONSTANT
const CORRECT_POINTS = 1000;

interface RiverToSeaGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

export default function RiverToSeaGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: RiverToSeaGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  const currentRiver = RIVER_DATA_LIST[currentRoundIndex];

  const handleSelectOption = (option: string) => {
    if (hasSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (hasSubmitted || !selectedOption) return;

    const isCorrect = selectedOption === currentRiver.correctDestination;
    if (isCorrect) {
      setCumulativeScore((prev) => prev + CORRECT_POINTS);
      setCorrectAnswersCount((prev) => prev + 1);
    }

    setHasSubmitted(true);
  };

  const handleNextRound = () => {
    if (currentRoundIndex + 1 < RIVER_DATA_LIST.length) {
      setCurrentRoundIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    }
  };

  const isGameOver = hasSubmitted && currentRoundIndex + 1 === RIVER_DATA_LIST.length;

  return (
    <div className="w-full flex flex-col gap-6 font-sans text-gray-900" id="river_to_sea_root">
      {/* Header crumb */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4" id="river_to_sea_header">
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
          id={`river_to_sea_round_${currentRoundIndex}`}
        >
          {/* Optional visual: A small static non-interactive map/svg representing the river path in the background */}
          <div className="absolute right-4 top-4 w-24 h-24 opacity-10 pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-gray-950 fill-none stroke-[3] stroke-linecap-round">
              <path d="M10,10 C30,15 20,45 50,50 C70,55 80,85 90,90" />
              <circle cx="90" cy="90" r="4" className="fill-gray-950" />
            </svg>
          </div>

          {/* Round Header */}
          <div className="flex flex-col gap-1 text-center md:text-left border-b border-gray-100 pb-4 z-10">
            <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
              Round {currentRoundIndex + 1} of {RIVER_DATA_LIST.length}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-955 mt-1">
              Which body of water does the river{" "}
              <span className="underline decoration-gray-300 decoration-2 underline-offset-4 font-black text-black">
                {currentRiver.name}
              </span>{" "}
              ultimately flow into?
            </h2>
          </div>

          {/* 4 Option cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 z-10" id="river_options_grid">
            {currentRiver.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentRiver.correctDestination;
              
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
                  onClick={() => handleSelectOption(option)}
                  disabled={hasSubmitted}
                  className={`p-4 rounded-[8px] border text-left flex items-center justify-between gap-3 transition-all font-sans text-xs font-black uppercase tracking-wider cursor-pointer ${cardStyle}`}
                >
                  <span className={isSelected ? "text-gray-950 font-black" : "text-gray-700"}>
                    {option}
                  </span>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Action and feedback block */}
          <div className="flex flex-col gap-4 z-10">
            {!hasSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className={`w-full py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  selectedOption
                    ? "bg-gray-950 text-white hover:bg-black"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
                id="btn_submit_river_choice"
              >
                Confirm Destination
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
                id="river_feedback_pane"
              >
                {/* Result Announcement */}
                <div className={`p-4 rounded-[8px] border text-xs leading-relaxed font-semibold ${
                  selectedOption === currentRiver.correctDestination
                    ? "bg-green-50/30 border-green-200 text-green-800"
                    : "bg-red-50/30 border-red-200 text-red-800"
                }`}>
                  <strong className="block uppercase font-mono text-[9px] tracking-wider mb-0.5">
                    {selectedOption === currentRiver.correctDestination ? "CORRECT ANSWER" : "INCORRECT CHOICE"}
                  </strong>
                  {selectedOption === currentRiver.correctDestination 
                    ? `Brilliant! The river flows into the ${currentRiver.correctDestination}. (+1000 pts)`
                    : `Incorrect. You chose ${selectedOption}, but it actually flows into the ${currentRiver.correctDestination}.`}
                </div>

                {/* Geographical Background Explanation */}
                <div className="bg-gray-50 border border-gray-150 p-4 rounded-[8px] text-xs text-gray-600 leading-relaxed font-semibold">
                  <span className="font-mono text-[9px] text-gray-400 block uppercase mb-1">GEOGRAPHICAL BACKGROUND</span>
                  "{currentRiver.explanation}"
                </div>

                {/* Next round control */}
                <button
                  onClick={handleNextRound}
                  className="w-full bg-gray-950 hover:bg-black text-white py-4 rounded-[8px] font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  id="btn_next_river_round"
                >
                  {currentRoundIndex + 1 < RIVER_DATA_LIST.length ? "Next Round" : "See Final Summary"}
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
          id="river_to_sea_gameover"
        >
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-2xs">
            <Trophy className="w-6 h-6 text-gray-800" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight">
              River Outlet Campaign Finished!
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
              RIVER SYSTEM OUTLET ANALYSIS
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
                {correctAnswersCount} / {RIVER_DATA_LIST.length}
              </strong>
            </div>
          </div>

          {/* Action trigger controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="river_to_sea_end_actions">
            <button
              onClick={() => onFinishGame(cumulativeScore, "River Outlets")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_river_to_sea_save"
            >
              Save Results
            </button>
            <button
              onClick={() => {
                setCurrentRoundIndex(0);
                setSelectedOption(null);
                setHasSubmitted(false);
                setCumulativeScore(0);
                setCorrectAnswersCount(0);
              }}
              className="w-full sm:flex-1 border border-gray-300 hover:border-gray-600 bg-white text-gray-850 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
              id="btn_river_to_sea_replay"
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
