import React, { useState } from "react";
import { Menu, X, Compass, ChevronDown, User, LogOut, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { updateProfile } from "firebase/auth";

interface NavbarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onOpenResults?: () => void;
  onOpenLogin?: () => void;
  onLogoClick?: () => void;
  currentLang: "en" | "ru" | "uz";
  onLangChange: (lang: "en" | "ru" | "uz") => void;
  currentUser?: any;
  onSignOut?: () => void;
}

export default function Navbar({
  activeCategory = "Maps",
  onCategoryChange,
  onOpenResults,
  onOpenLogin,
  onLogoClick,
  currentLang = "en",
  onLangChange,
  currentUser,
  onSignOut,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showNicknameInLogo, setShowNicknameInLogo] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState("");

  React.useEffect(() => {
    if (currentUser) {
      setTempNickname(currentUser.displayName || "");
    }
  }, [currentUser, userDropdownOpen]);

  const handleUpdateNickname = async () => {
    const trimmed = tempNickname.trim();
    if (!trimmed) {
      setNicknameError("Nickname cannot be empty");
      return;
    }
    if (trimmed.length > 15) {
      setNicknameError("Max 15 characters");
      return;
    }
    setNicknameError("");
    setIsUpdatingNickname(true);
    try {
      await updateProfile(currentUser, { displayName: trimmed });
      currentUser.displayName = trimmed;
    } catch (err: any) {
      setNicknameError(err.message || "Failed to update nickname");
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const handleSafeSignOut = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      if (onSignOut) {
        onSignOut();
      }
      setIsSigningOut(false);
      setSignOutConfirm(false);
      setUserDropdownOpen(false);
    }, 1200);
  };

  const navItems = [
    { name: "Maps", id: "maps" },
    { name: "History", id: "history" },
    { name: "Geography", id: "geography" },
    { name: "Sports", id: "sports" },
    { name: "Random", id: "random" },
  ];

  // Simple clean translation helper in Navbar context
  const getNavLabel = (itemId: string) => {
    const labels: Record<string, Record<"en" | "ru" | "uz", string>> = {
      maps: { en: "Maps", ru: "Карты", uz: "Xaritalar" },
      history: { en: "History", ru: "История", uz: "Tarix" },
      geography: { en: "Geography", ru: "География", uz: "Geografiya" },
      sports: { en: "Sports", ru: "Спорт", uz: "Sport" },
      random: { en: "Random", ru: "Случайно", uz: "Tasodifiy" },
      results: { en: "My Results", ru: "Мои результаты", uz: "Natijalarim" },
      resultsHistory: { en: "My Results History", ru: "История моих результатов", uz: "Natijalarim tarixi" },
      login: { en: "Login", ru: "Войти", uz: "Kirish" },
      logout: { en: "Sign Out", ru: "Выйти", uz: "Chiqish" },
      categoryHubs: { en: "Category Hubs", ru: "Центры категорий", uz: "Turkum markazlari" },
    };
    return labels[itemId]?.[currentLang] || labels[itemId]?.["en"] || itemId;
  };

  const handleCategoryClick = (categoryName: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryName);
    }
    setIsOpen(false);
  };

  const languages: { code: "en" | "ru" | "uz"; flag: string; label: string }[] = [
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "ru", flag: "🇷🇺", label: "RU" },
    { code: "uz", flag: "🇺🇿", label: "UZ" },
  ];

  return (
    <nav 
      className="w-full bg-[#1A1A1A] text-white relative z-50 transition-all duration-200" 
      style={{ height: "64px" }}
      id="plote_navbar"
    >
      <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        
        {/* Left Side: Logo & Desktop Links */}
        <div className="flex items-center gap-6 lg:gap-8 h-full">
          {/* Rotating Logo icon + Wordmark as separate clickable units */}
          <div 
            className="select-none flex items-center gap-2"
            id="navbar_logo"
          >
            <Compass 
              className="w-5 h-5 text-[#5DCAA5] animate-slow-spin cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                if (currentUser) {
                  setShowNicknameInLogo(!showNicknameInLogo);
                }
              }}
            />
            <span 
              className="font-personality text-[22px] font-bold text-[#5DCAA5] cursor-pointer"
              onClick={() => {
                if (onLogoClick) {
                  onLogoClick();
                }
              }}
            >
              {showNicknameInLogo && currentUser
                ? (currentUser.displayName || currentUser.email?.split("@")[0] || "Explorer")
                : "PLOTE"}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center h-full gap-3 lg:gap-4" id="navbar_desktop_links">
            {navItems.map((item) => {
              const isActive = activeCategory.toLowerCase() === item.id;
              return (
                <li key={item.id} className="h-full flex items-center">
                  <button
                    onClick={() => handleCategoryClick(item.name)}
                    className={`text-[14px] font-medium transition-all duration-150 cursor-pointer pb-0.5 ${
                      isActive 
                        ? "text-[#5DCAA5] border-b-2 border-[#5DCAA5]" 
                        : "text-[#ECECEC] hover:text-[#5DCAA5]"
                    }`}
                  >
                    <span>{getNavLabel(item.id)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Side: My Results, Language switcher, Login/User menu */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Desktop "My Results" Link */}
          <button
            onClick={onOpenResults}
            className="hidden md:block text-[14px] font-medium text-[#ECECEC] hover:text-[#5DCAA5] transition-colors duration-150 cursor-pointer"
            id="navbar_desktop_results"
          >
            {getNavLabel("results")}
          </button>

          {/* Language switcher - flag icons only, 20x15px, 0.6 inactive, 1.0 active, 8px gap */}
          <div className="flex items-center gap-2" id="navbar_lang_flags">
            {languages.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onLangChange(lang.code)}
                  className={`transition-all duration-150 cursor-pointer hover:scale-110 active:scale-90 ${
                    isActive ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ 
                    width: "20px", 
                    height: "15px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "14px"
                  }}
                  title={lang.label}
                >
                  <span className="select-none leading-none">{lang.flag}</span>
                </button>
              );
            })}
          </div>

          {/* Authenticated user avatar or Login Button */}
          {currentUser ? (
            <div className="relative" id="navbar_user_container">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setSignOutConfirm(false);
                }}
                className="flex items-center justify-center bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-[#3E8C7C] w-9 h-9 rounded-full transition-all duration-150 cursor-pointer select-none text-base text-[#5DCAA5]"
                id="navbar_user_badge_trigger"
                title="Account Settings"
              >
                👤
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent cursor-default" 
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setSignOutConfirm(false);
                      }} 
                    />

                    {/* Dropdown Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="absolute right-0 mt-2.5 bg-white border border-gray-250 shadow-xl rounded-[12px] p-4.5 z-50 flex flex-col w-[260px] gap-3.5 text-gray-900"
                      id="navbar_user_dropdown_menu"
                    >
                      {/* Explorer info header */}
                      <div className="flex flex-col gap-1 pb-2 border-b border-gray-150">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">
                          Explorer Profile
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {currentUser.photoURL ? (
                            <img 
                              src={currentUser.photoURL} 
                              alt="User avatar" 
                              className="w-8 h-8 rounded-full border border-gray-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-gray-950 truncate">
                              {currentUser.displayName || "Explorer"}
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold truncate leading-tight">
                              {currentUser.email || "No email linked"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nickname Editor */}
                      <div className="flex flex-col gap-1.5 pt-1 pb-2 border-b border-gray-150 text-left" id="dropdown_nickname_editor">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">
                          Edit Nickname
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            maxLength={15}
                            value={tempNickname}
                            onChange={(e) => {
                              setTempNickname(e.target.value.slice(0, 15));
                              if (nicknameError) setNicknameError("");
                            }}
                            placeholder="Max 15 chars"
                            className="flex-1 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-gray-950 focus:bg-white rounded-[6px] px-2 py-1 text-xs font-semibold focus:outline-none"
                            id="navbar_nickname_input"
                          />
                          <button
                            onClick={handleUpdateNickname}
                            disabled={isUpdatingNickname || !tempNickname.trim() || tempNickname.trim() === currentUser?.displayName}
                            className="bg-gray-955 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-[6px] disabled:opacity-30 cursor-pointer flex items-center gap-1 shrink-0"
                            id="navbar_nickname_save_btn"
                          >
                            {isUpdatingNickname ? (
                              <Loader2 className="w-3 h-3 animate-spin text-white" />
                            ) : (
                              "Save"
                            )}
                          </button>
                        </div>
                        {nicknameError && (
                          <span className="text-[9px] text-rose-600 font-semibold mt-0.5">
                            {nicknameError}
                          </span>
                        )}
                        <span className="text-[9px] text-gray-400 font-medium self-end">
                          {tempNickname.length}/15 chars
                        </span>
                      </div>

                      {/* Actions / Sign out section */}
                      <div className="flex flex-col gap-2 pt-1">
                        <AnimatePresence mode="wait">
                          {!signOutConfirm ? (
                            <motion.button
                              key="signout-trigger"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setSignOutConfirm(true)}
                              className="w-full bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-200 py-2.5 px-3 rounded-[9px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              id="dropdown_signout_trigger_btn"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>{getNavLabel("logout")}</span>
                            </motion.button>
                          ) : (
                            <motion.div
                              key="signout-confirmation"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="flex flex-col gap-2 p-1 bg-rose-50/50 border border-rose-150 rounded-[10px]"
                            >
                              <span className="text-[10px] font-bold text-rose-800 text-center block px-1 py-1">
                                Are you sure you want to exit?
                              </span>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  disabled={isSigningOut}
                                  onClick={handleSafeSignOut}
                                  className="bg-rose-600 hover:bg-rose-700 text-white py-1.5 px-2 rounded-[6px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  {isSigningOut ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-white" />
                                  ) : (
                                    "Yes, Exit"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={isSigningOut}
                                  onClick={() => setSignOutConfirm(false)}
                                  className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 py-1.5 px-2 rounded-[6px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                                >
                                  Cancel
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="text-[13px] font-semibold border border-[#3E8C7C] text-[#5DCAA5] px-4 py-1.5 rounded-[6px] bg-transparent hover:bg-[#3E8C7C]/15 transition-all duration-150 cursor-pointer"
              id="navbar_login_button"
            >
              {getNavLabel("login")}
            </button>
          )}

          {/* Mobile Hamburger Icon */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 text-gray-300 hover:text-white focus:outline-none transition-colors duration-150 cursor-pointer"
            aria-label="Toggle menu"
            id="navbar_mobile_toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div 
          className="md:hidden absolute top-[64px] left-0 w-full bg-[#1A1A1A] border-b border-white/10 z-[100] animate-[fadeIn_150ms_ease-out] flex flex-col p-4 gap-3 shadow-xl"
          id="navbar_mobile_dropdown"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-3 font-mono">
            {getNavLabel("categoryHubs")}
          </span>
          <ul className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = activeCategory.toLowerCase() === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleCategoryClick(item.name)}
                    className={`w-full text-left py-2 px-3 text-[13px] font-semibold transition-all duration-150 rounded-[6px] cursor-pointer flex items-center justify-between ${
                      isActive 
                        ? "bg-[#2D2D2D] text-[#5DCAA5] border border-[#3E8C7C]" 
                        : "text-[#ECECEC] hover:bg-[#252525] hover:text-white border border-transparent"
                    }`}
                  >
                    <span>{getNavLabel(item.id)}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5] animate-pulse" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="h-[1px] bg-white/10 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              if (onOpenResults) onOpenResults();
            }}
            className="w-full text-left py-2 px-3 text-[13px] font-semibold text-[#ECECEC] hover:bg-[#252525] hover:text-white transition-all duration-150 rounded-[6px] cursor-pointer"
          >
            {getNavLabel("resultsHistory")}
          </button>
        </div>
      )}
    </nav>
  );
}
