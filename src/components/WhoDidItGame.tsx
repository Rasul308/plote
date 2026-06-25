import React, { useState } from "react";
import { motion } from "motion/react";
import { Trophy, ArrowRight, RefreshCw, ChevronLeft, HelpCircle, Check, X } from "lucide-react";

interface TriviaQuestion {
  description: string;
  options: string[];
  correctAnswerIndex: number;
  funFact: string;
}

interface WhoDidItGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// PLACEHOLDER DATA — replace with real content easily
const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    description: "This legendary navigator led the very first fleet to circumnavigate the globe, demonstrating that the oceans are a single, interconnected world body, although he was unfortunately killed in the Philippines before his remaining ship, Victoria, returned home.",
    options: [
      "Ferdinand Magellan",
      "Vasco da Gama",
      "Christopher Columbus",
      "Francis Drake"
    ],
    correctAnswerIndex: 0,
    funFact: "While Magellan organized and sailed the majority of the voyage, it was Juan Sebastián Elcano who actually captained the Victoria back home to Spain."
  },
  {
    description: "In the ancient world, this formidable ruler established one of the world's first sophisticated postal networks, called the 'Chapar Khaneh', spanning thousands of miles across a vast empire using express relay courier stations.",
    options: [
      "Julius Caesar of Rome",
      "Cyrus the Great of Persia",
      "Alexander the Great of Macedon",
      "Qin Shi Huang of China"
    ],
    correctAnswerIndex: 1,
    funFact: "The system was so efficient that Greek historians marveled at its speed, claiming 'neither snow, rain, heat, nor darkness' stayed these couriers from their swift rounds."
  },
  {
    description: "Determined to break through feudal isolationism, this visionary queen orchestrated political reforms, unified fractured factions, and sponsored voyages of discovery that reshaped global commerce in the 15th century.",
    options: [
      "Isabella I of Castile",
      "Elizabeth I of England",
      "Catherine the Great of Russia",
      "Wu Zetian of Tang China"
    ],
    correctAnswerIndex: 0,
    funFact: "Isabella also financed Christopher Columbus's 1492 voyage, utilizing royal funds to expand Castile's domain into the Americas."
  },
  {
    description: "An legendary astronomer, polymath, and medical scholar, this figure is famously credited with formalizing the scientific method in optics and medieval physics, publishing the groundbreaking Book of Optics while under house arrest in Cairo.",
    options: [
      "Ibn al-Haytham (Alhazen)",
      "Ibn Sina (Avicenna)",
      "Al-Khwarizmi",
      "Al-Biruni"
    ],
    correctAnswerIndex: 0,
    funFact: "Ibn al-Haytham is widely regarded as one of the very first theoretical physicists, pioneering experimental proof of how eyes perceive light."
  },
  {
    description: "This legendary military general achieved one of history's greatest tactical feats by marching war elephants across the treacherous, snow-covered Alps to strike the heart of the Roman Republic from an unexpected northern front.",
    options: [
      "Julius Caesar",
      "Hannibal Barca",
      "Scipio Africanus",
      "Spartacus"
    ],
    correctAnswerIndex: 1,
    funFact: "Despite losing almost half his army and most of his elephants to the freezing alpine cold, Hannibal terrorized Italy for 15 years without losing a major battle."
  },
  {
    description: "This historical civilization drafted the Code of Hammurabi, one of the earliest and most complete written legal codes in human history, famously displaying the laws publicly on giant black stone steles.",
    options: [
      "The Babylonians",
      "The Sumerians",
      "The Phoenicians",
      "The Assyrians"
    ],
    correctAnswerIndex: 0,
    funFact: "The code is famous for its strict retributive justice, establishing the principle of 'an eye for an eye, a tooth for a tooth'."
  },
  {
    description: "Seeking to secure vast trade routes across East Asia, this emperor of the Ming Dynasty commissioned Admiral Zheng He to lead a series of seven magnificent naval expeditions, deploying giant treasure ships across the Indian Ocean.",
    options: [
      "The Yongle Emperor",
      "The Hongwu Emperor",
      "The Kangxi Emperor",
      "The Qianlong Emperor"
    ],
    correctAnswerIndex: 0,
    funFact: "Zheng He's fleet included up to 300 massive vessels, dwarfing contemporary European ships and reaching as far as East Africa."
  },
  {
    description: "This ancient queen of Palmyra famously revolted against the Roman Empire, successfully conquering Egypt and Anatolia before being defeated by Emperor Aurelian and paraded through Rome in golden chains.",
    options: [
      "Queen Zenobia",
      "Cleopatra VII",
      "Queen Boudica",
      "Queen Nefertiti"
    ],
    correctAnswerIndex: 0,
    funFact: "Zenobia was highly educated, fluent in multiple languages, and created a multicultural court that patronized prominent intellectuals."
  },
  {
    description: "This medieval king of Mali is widely considered one of the wealthiest individuals in human history, famously spending so much gold during his pilgrimage to Mecca that he accidentally caused localized inflation across Egypt.",
    options: [
      "Mansa Musa",
      "Sundiata Keita",
      "Askia the Great",
      "Sonni Ali"
    ],
    correctAnswerIndex: 0,
    funFact: "Mansa Musa's caravan included tens of thousands of soldiers and heralds, carrying gold staffs and sacks of pure gold dust."
  },
  {
    description: "This brilliant military strategist and first Shogun of a unified Japan established an administrative era of peace, artistic growth, and strict social structure that lasted undisturbed for over 250 years.",
    options: [
      "Tokugawa Ieyasu",
      "Oda Nobunaga",
      "Toyotomi Hideyoshi",
      "Minamoto no Yoritomo"
    ],
    correctAnswerIndex: 0,
    funFact: "The Tokugawa shogunate established Edo (modern Tokyo) as its administrative capital, starting Japan's prosperous Edo period."
  }
];

const POINTS_PER_CORRECT = 1000;

export default function WhoDidItGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: WhoDidItGameProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [answersLog, setAnswersLog] = useState<{
    questionIndex: number;
    questionText: string;
    selectedText: string;
    correctText: string;
    isCorrect: boolean;
  }[]>([]);

  const currentQuestion = TRIVIA_QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;

    setIsSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      setScore((prev) => prev + POINTS_PER_CORRECT);
    }

    setAnswersLog((prev) => [
      ...prev,
      {
        questionIndex: currentIndex + 1,
        questionText: currentQuestion.description,
        selectedText: currentQuestion.options[selectedOption],
        correctText: currentQuestion.options[currentQuestion.correctAnswerIndex],
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);

    if (currentIndex + 1 < TRIVIA_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsGameOver(false);
    setAnswersLog([]);
  };

  const correctAnswersCount = answersLog.filter((ans) => ans.isCorrect).length;

  return (
    <div className="w-full flex flex-col gap-6" id="who_did_it_wrapper">
      {/* Header and Quit Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="wdi_top_nav">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer"
          id="btn_wdi_exit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Game</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-xs font-black text-gray-900 uppercase">Identify the Historical Figure</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="wdi_running_grid">
          
          {/* Question Presentation Area (65%) */}
          <div className="lg:col-span-8 flex flex-col gap-4" id="wdi_left_panel">
            
            {/* Round info card */}
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm" id="wdi_round_info_card">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-2">
                ROUND {currentIndex + 1} OF {TRIVIA_QUESTIONS.length}
              </span>
              
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-[10px] min-h-[140px] flex items-center">
                <p className="text-sm md:text-base font-extrabold text-gray-900 leading-relaxed tracking-tight text-center w-full">
                  "{currentQuestion.description}"
                </p>
              </div>
            </div>

            {/* Answer choice cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="wdi_options_grid">
              {currentQuestion.options.map((option, idx) => {
                const isThisSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctAnswerIndex;
                const isWrongSelection = isThisSelected && !isCorrect;

                let cardStyle = "bg-white border-gray-200 hover:border-gray-500 hover:bg-gray-50 text-gray-900";
                if (isThisSelected) {
                  cardStyle = "bg-gray-100 border-gray-900 text-gray-950";
                }
                
                if (isSubmitted) {
                  if (isCorrect) {
                    cardStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20";
                  } else if (isWrongSelection) {
                    cardStyle = "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20";
                  } else {
                    cardStyle = "bg-white border-gray-200 text-gray-400 opacity-60";
                  }
                }

                return (
                  <motion.button
                    whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isSubmitted}
                    className={`text-left p-4 rounded-[12px] border transition-all text-xs font-black uppercase tracking-wider flex items-center justify-between group min-h-[64px] ${cardStyle} ${!isSubmitted ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span className="max-w-[85%]">{option}</span>
                    <div className="shrink-0 flex items-center justify-center">
                      {isSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                      {isSubmitted && isWrongSelection && <X className="w-4 h-4 text-rose-600" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Post submission context detail */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm space-y-2 text-left"
                id="wdi_fun_fact_panel"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-[4px] border ${
                    selectedOption === currentQuestion.correctAnswerIndex
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {selectedOption === currentQuestion.correctAnswerIndex ? "CORRECT" : "NOT QUITE"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">FUN HISTORICAL FACT:</span>
                </div>
                <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                  {currentQuestion.funFact}
                </p>
              </motion.div>
            )}

          </div>

          {/* Controls Sidebar (35%) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="wdi_right_panel">
            <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[280px]">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-150 pb-2 mb-3">
                    Game Progression
                  </h3>
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-[8px]">
                    <div>
                      <span className="block text-[8px] text-gray-400 font-mono uppercase">RUNNING SCORE</span>
                      <span className="text-sm font-mono font-black text-gray-950">{score}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-400 font-mono uppercase text-right">ACCURACY</span>
                      <span className="text-xs font-mono font-bold text-gray-950 block text-right">
                        {currentIndex > 0 ? Math.round((answersLog.filter(a => a.isCorrect).length / currentIndex) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit and Next controls */}
                <div className="space-y-3">
                  {!isSubmitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedOption === null}
                      className="w-full bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-4 rounded-[8px] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-center"
                      id="btn_wdi_submit"
                    >
                      {selectedOption === null ? "Choose an Option" : "Confirm & Submit"}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider py-4 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2"
                      id="btn_wdi_next"
                    >
                      <span>
                        {currentIndex + 1 === TRIVIA_QUESTIONS.length ? "Finish Quiz" : "Next Question"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Informative Footer */}
              <div className="border-t border-gray-150 pt-3 text-[10px] text-gray-400 font-mono leading-relaxed select-none">
                <span className="font-bold">SCORING CRITERIA:</span>
                • 1,000 points awarded for every correct submission.<br />
                • Zero points for incorrect responses. Double-check before confirming.
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Game Over screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl mx-auto bg-white border border-gray-250 rounded-[16px] p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative z-20"
          id="wdi_summary_block"
        >
          <div className="relative mb-5">
            <div className="relative w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-8 h-8 text-gray-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
            Quiz Finished!
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
            HISTORICAL FIGURES REPORT CARD
          </p>

          <div className="grid grid-cols-2 gap-3 w-full text-center border-t border-b border-gray-200 py-6 mb-6">
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                COMBINED SCORE
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {score}
              </strong>
            </div>
            <div>
              <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                ACCURACY RATE
              </span>
              <strong className="text-xl font-mono font-black text-gray-950">
                {correctAnswersCount} / {TRIVIA_QUESTIONS.length}
              </strong>
            </div>
          </div>

          {/* Summary Logs */}
          <div className="w-full text-left space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-6" id="wdi_rounds_log">
            <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
              Chronological Logs
            </h4>
            {answersLog.map((log) => (
              <div
                key={log.questionIndex}
                className="bg-gray-50 border border-gray-200 p-2.5 rounded-[8px] flex items-center justify-between text-xs font-semibold"
              >
                <div className="flex flex-col max-w-[70%]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400 font-mono">#{String(log.questionIndex).padStart(2, "0")}</span>
                    <span className={`text-[9px] font-bold ${log.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                      {log.isCorrect ? "CORRECT" : "WRONG"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">
                    Chosen: {log.selectedText} | Correct: {log.correctText}
                  </p>
                </div>
                <span className="text-xs font-black text-gray-900 font-mono">
                  {log.isCorrect ? `+${POINTS_PER_CORRECT}` : "0"}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="wdi_end_actions">
            <button
              onClick={() => onFinishGame(score, "Identify the Historical Figure")}
              className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
              id="btn_wdi_save"
            >
              Submit & Save Score
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold"
              id="btn_wdi_retry"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Quiz Mode</span>
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}
