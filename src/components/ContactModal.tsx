import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, CheckCircle2, AlertTriangle, Send, Trophy, Flame, Play, Sparkles, Award } from "lucide-react";

interface ContactModalProps {
  onClose: () => void;
  currentLang: string;
}

interface QuizItem {
  rank: number;
  name: string;
  category: string;
  gameId: string;
  plays: number;
  highScore: number;
  badge?: string;
}

export default function ContactModal({ onClose, currentLang }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [todayScores, setTodayScores] = useState<any[]>([]);

  const accessKey = (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY;
  const isDemoMode = !accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY";

  // Load real high scores if any exist in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("plote_scores");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTodayScores(parsed.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const getTranslation = (key: string) => {
    const dicts: Record<string, Record<string, string>> = {
      en: {
        title: "Contact Us",
        appreciation: "Thanks for using our site. We appreciate your feedback!",
        labelName: "Your Name",
        labelEmail: "Your Email",
        labelMessage: "Your Message",
        placeholderName: "Enter your name",
        placeholderEmail: "Enter your email address",
        placeholderMessage: "Write your feedback or message here...",
        btnSubmit: "Submit Message",
        btnSending: "Sending...",
        btnDone: "Close",
        successTitle: "Message Sent!",
        successDesc: "Thank you for reaching out! We have received your feedback and will review it shortly.",
        demoBadge: "Demo Mode",
        demoNotice: "Form submission is simulated. Add a real VITE_WEB3FORMS_ACCESS_KEY env variable to go live.",
        errorTitle: "Submission Failed",
        requiredFields: "Please fill in all fields before submitting.",
        invalidEmail: "Please provide a valid email address.",
        leaderboardTitle: "Top 10 of Today's Quizzes",
        quizPlays: "plays today",
        recentTrophies: "Recent Real High Scores",
        noRecentScores: "No high scores recorded yet today! Play a game to see your name here.",
        launchQuiz: "Launch Quiz"
      },
      ru: {
        title: "Связаться с нами",
        appreciation: "Спасибо, что пользуетесь нашим сайтом. Мы ценим ваши отзывы!",
        labelName: "Ваше имя",
        labelEmail: "Ваш email",
        labelMessage: "Ваше сообщение",
        placeholderName: "Введите ваше имя",
        placeholderEmail: "Введите ваш email",
        placeholderMessage: "Напишите ваш отзыв или сообщение здесь...",
        btnSubmit: "Отправить сообщение",
        btnSending: "Отправка...",
        btnDone: "Закрыть",
        successTitle: "Сообщение отправлено!",
        successDesc: "Спасибо за обращение! Мы получили ваш отзыв и скоро его рассмотрим.",
        demoBadge: "Демо-режим",
        demoNotice: "Отправка симулируется. Добавьте реальный ключ VITE_WEB3FORMS_ACCESS_KEY, чтобы запустить.",
        errorTitle: "Ошибка отправки",
        requiredFields: "Пожалуйста, заполните все поля перед отправкой.",
        invalidEmail: "Пожалуйста, укажите корректный адрес электронной почты.",
        leaderboardTitle: "Топ-10 викторин сегодня",
        quizPlays: "игр сегодня",
        recentTrophies: "Реальные рекорды сегодня",
        noRecentScores: "Рекордов сегодня еще нет! Сыграйте в игру, чтобы увидеть себя здесь.",
        launchQuiz: "Запустить"
      },
      uz: {
        title: "Biz bilan bog'lanish",
        appreciation: "Saytimizdan foydalanganingiz uchun rahmat. Fikr-mulohazalaringizni qadrlaymiz!",
        labelName: "Ismingiz",
        labelEmail: "Email manzilingiz",
        labelMessage: "Xabaringiz",
        placeholderName: "Ismingizni kiriting",
        placeholderEmail: "Email manzilingizni kiriting",
        placeholderMessage: "Fikr-mulohazangiz yoki xabaringizni yozing...",
        btnSubmit: "Xabarni yuborish",
        btnSending: "Yuborilmoqda...",
        btnDone: "Yopish",
        successTitle: "Xabar yuborildi!",
        successDesc: "Murojaatingiz uchun rahmat! Fikr-mulohazangiz qabul qilindi va tez orada ko'rib chiqiladi.",
        demoBadge: "Demo Rejim",
        demoNotice: "Yuborish simulyatsiya qilindi. Haqiqiy VITE_WEB3FORMS_ACCESS_KEY kalitini qo'shing.",
        errorTitle: "Yuborishda xatolik",
        requiredFields: "Iltimos, yuborishdan oldin barcha maydonlarni to'ldiring.",
        invalidEmail: "Iltimos, to'g'ri email manzilini kiriting.",
        leaderboardTitle: "Bugungi Top 10 Viktorina",
        quizPlays: "marta o'ynaldi",
        recentTrophies: "Bugungi Real Rekordlar",
        noRecentScores: "Bugun hech qanday rekord yo'q! Ismingizni ko'rish uchun o'yin o'ynang.",
        launchQuiz: "Boshlash"
      }
    };

    const lang = dicts[currentLang] ? currentLang : "en";
    return dicts[lang][key] || dicts["en"][key] || "";
  };

  // Predefined top 10 quizzes of today with dynamic-looking play stats
  const topQuizzes: QuizItem[] = [
    { rank: 1, name: "Stadium Locator", category: "Sports", gameId: "stadium-locator", plays: 245, highScore: 4950, badge: "🔥 Hot" },
    { rank: 2, name: "Border Blind", category: "Geography", gameId: "border-blind", plays: 210, highScore: 5000, badge: "⚡ Trending" },
    { rank: 3, name: "Olympic Cities", category: "Sports", gameId: "olympic-cities", plays: 188, highScore: 4800 },
    { rank: 4, name: "Capital Chain", category: "Geography", gameId: "capital-chain", plays: 165, highScore: 4750 },
    { rank: 5, name: "Empire Builder", category: "History", gameId: "empire-builder", plays: 142, highScore: 4600 },
    { rank: 6, name: "Where Were They", category: "History", gameId: "where-were-they", plays: 124, highScore: 4500 },
    { rank: 7, name: "River To Sea", category: "Geography", gameId: "river-to-sea", plays: 98, highScore: 4300 },
    { rank: 8, name: "Who Did It", category: "History", gameId: "who-did-it", plays: 85, highScore: 4200 },
    { rank: 9, name: "F1 Circuits", category: "Sports", gameId: "f1-circuits", plays: 72, highScore: 4100 },
    { rank: 10, name: "Metro Population", category: "Geography", gameId: "metro-population", plays: 54, highScore: 4000 }
  ];

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage(getTranslation("requiredFields"));
      setSubmitStatus("error");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage(getTranslation("invalidEmail"));
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);

    if (isDemoMode) {
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitStatus("success");
      }, 1000);
    } else {
      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            access_key: accessKey,
            name: name,
            email: email,
            message: message,
            subject: `PLOTE Map Games Feedback from ${name}`,
            from_name: "PLOTE App Contact Form"
          })
        });

        const result = await response.json();
        setIsSubmitting(false);

        if (result.success) {
          setSubmitStatus("success");
        } else {
          setErrorMessage(result.message || "Failed to deliver message via Web3Forms.");
          setSubmitStatus("error");
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage(err.message || "An unexpected error occurred.");
        setSubmitStatus("error");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
      id="contact_modal_backdrop"
    >
      {/* Outer elegant container with a thin white/grey outline on a dark/black background */}
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-[#0f1115] text-white w-full max-w-4xl p-1.5 rounded-[18px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col md:flex-row gap-5 my-8"
        id="contact_modal_outer_card"
      >
        
        {/* CLOSE BUTTON AT TOP-RIGHT OF MODAL */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white transition-colors text-lg font-bold cursor-pointer bg-white/5 hover:bg-white/15 p-2 rounded-full w-9 h-9 flex items-center justify-center border border-white/5"
          aria-label="Close"
          id="btn_close_contact"
        >
          ✕
        </button>

        {/* INNER GRID LAYOUT FOR CONTACT US & LEADERBOARD */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 p-4 md:p-5">
          
          {/* LEFT COLUMN: CONTACT US PART */}
          <div className="md:col-span-7 flex flex-col gap-4" id="contact_us_part_container">
            
            {/* Header styled uniquely */}
            <div className="flex flex-col gap-1 pb-1" id="contact_us_part_header">
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-cyan-400">
                Feedback & Support
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                <span>Contact Us Part</span>
              </h3>
            </div>

            {/* Inner panel (containing the actual form/success) with solid darker background and border */}
            <div className="bg-[#151922] border border-white/5 rounded-[12px] p-5 flex-1 flex flex-col justify-between shadow-inner" id="contact_us_inner_form_panel">
              {submitStatus === "success" ? (
                /* Success Screen */
                <div className="space-y-6 py-12 text-center my-auto" id="contact_success_screen">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">
                    {getTranslation("successTitle")}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-md mx-auto">
                    {getTranslation("successDesc")}
                  </p>
                  
                  <div className="pt-6 max-w-xs mx-auto">
                    <button
                      onClick={onClose}
                      className="w-full text-xs font-black text-white bg-white/10 hover:bg-white/15 border border-white/10 py-3 rounded-[8px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      id="btn_done_contact"
                    >
                      {getTranslation("btnDone")}
                    </button>
                  </div>
                </div>
              ) : (
                /* Form and Appreciation Container */
                <div className="space-y-5 flex-1 flex flex-col justify-between">
                  
                  {/* Appreciation Note */}
                  <div className="bg-[#1c2230] border border-white/5 rounded-[10px] p-4 text-center shadow-xs">
                    <p className="text-xs font-bold text-gray-200 leading-relaxed italic">
                      "{getTranslation("appreciation")}"
                    </p>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-center" id="form_contact">
                    
                    {/* Name Field */}
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        {getTranslation("labelName")}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={getTranslation("placeholderName")}
                        className="w-full bg-[#1b212f] border border-white/10 rounded-[8px] px-3.5 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 text-xs font-semibold transition-colors shadow-sm"
                        id="input_contact_name"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        {getTranslation("labelEmail")}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={getTranslation("placeholderEmail")}
                        className="w-full bg-[#1b212f] border border-white/10 rounded-[8px] px-3.5 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 text-xs font-semibold transition-colors shadow-sm"
                        id="input_contact_email"
                        required
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        {getTranslation("labelMessage")}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={getTranslation("placeholderMessage")}
                        className="w-full bg-[#1b212f] border border-white/10 rounded-[8px] px-3.5 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 text-xs font-semibold h-28 resize-none transition-colors shadow-sm"
                        id="input_contact_message"
                        required
                      />
                    </div>

                    {/* Error message */}
                    {submitStatus === "error" && errorMessage && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-[8px] text-[10px] text-red-400 font-semibold flex items-center gap-2" id="contact_error_alert">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Submit and action buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-[10px] font-black text-gray-400 border border-white/10 hover:bg-white/5 px-4 py-2.5 rounded-[8px] uppercase tracking-wider transition-all cursor-pointer"
                        id="btn_cancel_contact"
                      >
                        {getTranslation("btnDone")}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-[10px] font-black text-[#0f1115] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 px-5 py-2.5 rounded-[8px] uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-400/10 active:scale-95"
                        id="btn_submit_contact"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {isSubmitting ? getTranslation("btnSending") : getTranslation("btnSubmit")}
                        </span>
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: TOP 10 OF TODAY'S QUIZZES */}
          <div className="md:col-span-5 flex flex-col gap-4" id="leaderboard_part_container">
            
            {/* Header matching left side height */}
            <div className="flex flex-col gap-1 pb-1" id="leaderboard_part_header">
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-amber-400">
                Daily Stats & Hot Picks
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <span>Top 10 of Today's Quizzes</span>
              </h3>
            </div>

            {/* Container representing the top 10 list */}
            <div className="bg-[#12151c] border border-white/5 rounded-[12px] p-4 flex flex-col justify-between flex-1 gap-3.5 shadow-md" id="leaderboard_inner_panel">
              
              {/* Leaderboard list of top 10 quizzes */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin" id="leaderboard_list_items">
                {topQuizzes.map((quiz, idx) => {
                  // Style colors for top 3 rankings
                  const rankStyles = [
                    "bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-300",
                    "bg-slate-300 text-black border-white/40",
                    "bg-amber-700 text-white border-amber-600/40"
                  ];
                  const rankBadge = rankStyles[idx] || "bg-[#1d222e] text-gray-400 border-white/5";

                  return (
                    <div 
                      key={quiz.gameId}
                      className="group bg-[#171c26]/60 border border-white/5 hover:border-white/10 p-2.5 rounded-[8px] flex items-center justify-between transition-all gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Rank Circle */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${rankBadge} shrink-0 shadow-xs`}>
                          {quiz.rank}
                        </div>
                        
                        {/* Name and category */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-white truncate block">
                              {quiz.name}
                            </span>
                            {quiz.badge && (
                              <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-amber-500/20 uppercase shrink-0">
                                {quiz.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">
                            {quiz.category}
                          </span>
                        </div>
                      </div>

                      {/* Plays count & high score */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-300 block font-mono">
                          ★ {quiz.highScore}
                        </span>
                        <span className="text-[8px] font-semibold text-gray-500 block">
                          {quiz.plays} {getTranslation("quizPlays")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RECENT REAL HIGH SCORES FROM CURRENT SESSION / LOCALSTORAGE */}
              <div className="border-t border-white/5 pt-3 mt-1" id="recent_high_scores_footer">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-2">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{getTranslation("recentTrophies")}</span>
                </span>
                {todayScores.length > 0 ? (
                  <div className="space-y-1.5">
                    {todayScores.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-[6px] text-[10px] font-semibold text-gray-300">
                        <span className="truncate max-w-[120px]">👑 {item.username}</span>
                        <span className="text-gray-500 shrink-0 truncate max-w-[100px]">{item.category}</span>
                        <span className="font-mono text-amber-300 font-extrabold shrink-0">+{item.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
                    {getTranslation("noRecentScores")}
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>

      </motion.div>
    </motion.div>
  );
}
