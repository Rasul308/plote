import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Award,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Globe,
  Compass,
  Info,
  Layers,
  Sparkles,
  Trophy
} from "lucide-react";

import {
  ORIGIN_COORDS,
  ROUNDS_CONFIG,
  EUROPEAN_CITIES,
  findCityByName,
  getCitiesInBand,
  getDistanceKM
} from "./data";
import { City, GuessResult, RoundConfig } from "./types";
import Navbar from "./components/Navbar";
import CapitalChainGame from "./components/CapitalChainGame";
import BorderBlindGame from "./components/BorderBlindGame";
import DistanceDuelGame from "./components/DistanceDuelGame";
import TimelineDropGame from "./components/TimelineDropGame";
import WhoDidItGame from "./components/WhoDidItGame";
import WhereWereTheyGame from "./components/WhereWereTheyGame";
import BeforeOrAfterGame from "./components/BeforeOrAfterGame";
import StadiumLocatorGame from "./components/StadiumLocatorGame";
import OlympicCitiesGame from "./components/OlympicCitiesGame";
import ChampionsRingGame from "./components/ChampionsRingGame";
import AthleteMapGame from "./components/AthleteMapGame";
import F1CircuitsGame from "./components/F1CircuitsGame";
import EmpireBuilderGame from "./components/EmpireBuilderGame";
import MetroPopulationGame from "./components/MetroPopulationGame";
import RiverToSeaGame from "./components/RiverToSeaGame";
import CityOnRiverGame from "./components/CityOnRiverGame";
import PeakFinderGame from "./components/PeakFinderGame";
import LoginSignup from "./components/LoginSignup";
import ContactModal from "./components/ContactModal";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

const TRANSLATIONS = {
  en: {
    allGames: "All Games",
    home: "Home",
    headline: "PLOTE - your ultimate gateway to knowledge",
    featuredDailyMission: "Featured Daily Mission",
    dailyChallengeTitle: "Daily Challenge: Central European Metropolitan Cores",
    dailyChallengeDesc: "Formulate physical and demographic estimations inside the 500km coordinate radius. Spot the highest density sovereign capitals and trace coordinates accurately to secure a 200pt completion bonus.",
    playNow: "Play Now",
    mapGames: "Map Games",
    historyGames: "History Games",
    geographyGames: "Geography Games",
    sportGames: "Sport Games",
    bestQuizzesTitle: "10 Best Quizzes of the Day",
    popularGamesTitle: "10 Most Popular Games of All Time",
    recentNewsTitle: "Recent News",
    newsUpdate1: "June 20, 2026: System update. Geographic coordinate projection updated to WGS84 Standard for increased navigation fidelity.",
    newsUpdate2: "June 12, 2026: Weekly leaderboard rewards are active! Join our community to secure your rank.",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    faq: "FAQ",
    termsConditions: "Terms & Conditions",
    privacyPolicy: "Privacy Policy",
    allSpheresReserved: "All Spheres Reserved.",
    // Quizzes list
    quiz1: "Capitals of Europe Core Sphere",
    quiz2: "Balkan Sovereign Border Matrix",
    quiz3: "Iberian Demographics 400km",
    quiz4: "Scandinavia Coordinate Ring",
    quiz5: "Eastern Plains Population Hubs",
    quiz6: "Mediterranean Maritime Trade Nodes",
    quiz7: "Olympic Cities Historical Radial",
    quiz8: "Alpine Sovereign High Ports",
    quiz9: "Baltic Sea Demographics Focus",
    quiz10: "Benelux Urban Area Expansion",
    // Popular list
    pop1: "Global Capital Cities",
    pop2: "The Coordinate Expansion Sphere",
    pop3: "Cold War Landmark Finders",
    pop4: "Rivers and Waters of Central Europe",
    pop5: "Active Coordinate Grid Finder",
    pop6: "Geographical Sovereign Capitals",
    pop7: "Borders, Spheres, and Segments",
    pop8: "Italian Coordinate Hub Finder",
    pop9: "Sovereign Medieval Expansion",
    pop10: "Ancient Settlements of Rome",
    // Help Modal
    helpFab: "Help / Report a Problem",
    helpTitle: "Report a Problem / Help",
    helpDesc: "Having trouble with the coordinates, maps loading, or demographics calculation? Fill out the details below and we will investigate it immediately.",
    helpTextareaLabel: "Describe the Issue",
    helpPlaceholder: "Specify your system details or map behavior...",
    cancel: "Cancel",
    submitReport: "Submit Report",
    submittedTitle: "Report Submitted Successfully",
    submittedDesc: "Thank you! Your feedback has been received. Our team will review the coordinate alignment or technical issue promptly.",
    done: "Done",
  },
  ru: {
    allGames: "Все игры",
    home: "Главная",
    headline: "PLOTE — ваш главный путь к знаниям",
    featuredDailyMission: "Рекомендуемая ежедневная миссия",
    dailyChallengeTitle: "Ежедневное испытание: Ядра городов Центральной Европы",
    dailyChallengeDesc: "Сделайте физические и демографические оценки в пределах радиуса координат 500 км. Найдите самые густонаселенные суверенные столицы и точно отследите координаты, чтобы получить бонус в размере 200 очков.",
    playNow: "Играть сейчас",
    mapGames: "Игры с картами",
    historyGames: "Исторические игры",
    geographyGames: "Географические игры",
    sportGames: "Спортивные игры",
    bestQuizzesTitle: "10 лучших викторин дня",
    popularGamesTitle: "10 самых популярных игр за все время",
    recentNewsTitle: "Последние новости",
    newsUpdate1: "20 июня 2026 г.: Системное обновление. Проекция географических координат обновлена до стандарта WGS84 для повышения точности навигации.",
    newsUpdate2: "12 июня 2026 г.: Награды за еженедельную таблицу лидеров активны! Присоединяйтесь к нашему сообществу, чтобы занять свое место.",
    aboutUs: "О нас",
    contactUs: "Контакты",
    faq: "Часто задаваемые вопросы (FAQ)",
    termsConditions: "Условия использования",
    privacyPolicy: "Политика конфиденциальности",
    allSpheresReserved: "Все сферы защищены.",
    // Quizzes list
    quiz1: "Столицы европейского ядра",
    quiz2: "Матрица границ Балканских стран",
    quiz3: "Демография Пиренеев 400 км",
    quiz4: "Координатное кольцо Скандинавии",
    quiz5: "Населенные центры Восточных равнин",
    quiz6: "Средиземноморские торговые узлы",
    quiz7: "Исторический радиус олимпийских городов",
    quiz8: "Высокогорные альпийские порты",
    quiz9: "Фокус на демографии Балтийского моря",
    quiz10: "Расширение городских зон Бенилюкса",
    // Popular list
    pop1: "Мировые столицы",
    pop2: "Сфера расширения координат",
    pop3: "Достопримечательности Холодной войны",
    pop4: "Реки и воды Центральной Европы",
    pop5: "Поиск активной координатной сетки",
    pop6: "Географические суверенные столицы",
    pop7: "Границы, сферы и сегменты",
    pop8: "Поиск итальянских координатных узлов",
    pop9: "Суверенное средневековое расширение",
    pop10: "Древние поселения Рима",
    // Help Modal
    helpFab: "Помощь / Сообщить о технической проблеме",
    helpTitle: "Сообщить о проблеме / Помощь",
    helpDesc: "Не укладываетесь в координаты, не загружаются карты или есть проблемы с демографическими расчетами? Заполните форму, и мы немедленно разберемся.",
    helpTextareaLabel: "Опишите проблему",
    helpPlaceholder: "Укажите детали вашей системы или поведение карты...",
    cancel: "Отмена",
    submitReport: "Отправить отчет",
    submittedTitle: "Отчет успешно отправлен",
    submittedDesc: "Спасибо! Ваш отзыв получен. Наша команда оперативно проверит выравнивание координат или техническую проблему.",
    done: "Готово",
  },
  uz: {
    allGames: "Barcha o'yinlar",
    home: "Bosh sahifa",
    headline: "PLOTE — bilimga bo'lgan g'ayrioddiy yo'lingiz",
    featuredDailyMission: "Tavsiya etilgan kundalik missiya",
    dailyChallengeTitle: "Kundalik sinov: Markaziy Evropa shahar yadrolari",
    dailyChallengeDesc: "500 km koordinata radiusi ichida jismoniy va demografik hisob-kitoblarni amalga oshiring. Eng zich joylashgan poytaxtlarni toping va 200 ballik bonusni olish uchun koordinatalarni aniq belgilang.",
    playNow: "Hozir o'ynash",
    mapGames: "Xarita o'yinlari",
    historyGames: "Tarixiy o'yinlar",
    geographyGames: "Geografiya o'yinlari",
    sportGames: "Sport o'yinlari",
    bestQuizzesTitle: "Kunning 10 ta eng yaxshi viktorinasi",
    popularGamesTitle: "Barcha davrlarning 10 ta eng ommabop o'yini",
    recentNewsTitle: "So'nggi yangiliklar",
    newsUpdate1: "20 iyun, 2026 yil: Tizim yangilanishi. Navigatsiya aniqligini oshirish uchun geografik koordinatalar proeksiyasi WGS84 standartiga yangilandi.",
    newsUpdate2: "12 iyun, 2026 yil: Haftalik peshqadamlar jadvali mukofotlari faol! O'z o'rningizni saqlab qolish uchun jamoamizga qo'shiling.",
    aboutUs: "Biz haqimizda",
    contactUs: "Aloqa",
    faq: "TSS (FAQ)",
    termsConditions: "Foydalanish shartlari",
    privacyPolicy: "Maxfiylik siyosati",
    allSpheresReserved: "Barcha sohalar himoyalangan.",
    // Quizzes list
    quiz1: "Evropa yadrosi poytaxtlari",
    quiz2: "Bolqon suveren chegaralari matritsasi",
    quiz3: "Iberiya demografiyasi 400km",
    quiz4: "Skandinaviya koordinata halqasi",
    quiz5: "Sharqiy tekisliklar aholi markazlari",
    quiz6: "O'rta er dengizi dengiz savdo tugunlari",
    quiz7: "Olimpiada shaharlari tarixiy radiusi",
    quiz8: "Alp tog'lari suveren yuqori portlari",
    quiz9: "Boltiq dengizi demografiyasiga e'tibor",
    quiz10: "Benilyuks shahar hududlarini kengaytirish",
    // Popular list
    pop1: "Global poytaxt shaharlari",
    pop2: "Koordinata kengayish sferasi",
    pop3: "Yana sovuq urush davri yodgorliklari",
    pop4: "Markaziy Evropaning daryolari va suvlari",
    pop5: "Faol koordinata tarmog'ini qidiruvchi",
    pop6: "Geografik suveren poytaxtlar",
    pop7: "Chegaralar, sferalar va segmentlar",
    pop8: "Italiya koordinata markazini topuvchi",
    pop9: "Suveren o'rta asrlar kengayishi",
    pop10: "Qadimgi Rim aholi punktlari",
    // Help Modal
    helpFab: "Yordam / Muammo haqida xabar berish",
    helpTitle: "Muammo haqida xabar / Yordam",
    helpDesc: "Koordinatalar, xaritalarni yuklash yoki demografik hisob-kitoblar bilan muammo bormi? Quyidagi tafsilotlarni to'ldiring va biz darhol ko'rib chiqamiz.",
    helpTextareaLabel: "Muammoni tavsiflang",
    helpPlaceholder: "Tizim tafsilotlarini yoki xarita holatini kiriting...",
    cancel: "Bekor qilish",
    submitReport: "Hisobotni yuborish",
    submittedTitle: "Hisobot muvaffaqiyatli yuborildi",
    submittedDesc: "Rahmat! Sizning fikr-mulohazangiz qabul qilindi. Bizning jamoamiz koordinatalar mosligini yoki texnik muammoni tezda ko'rib chiqadi.",
    done: "Tayyor",
  }
};

export default function App() {
  // Game Phase states
  const [phase, setPhase] = useState<"landing" | "game-select" | "coming-soon" | "playing" | "feedback" | "gameover">("landing");
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState<number>(-1);
  const [guessResults, setGuessResults] = useState<GuessResult[]>([]);

  // Navbar states
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [currentLang, setCurrentLang] = useState<"en" | "ru" | "uz">("en");
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(() => localStorage.getItem("plote_username") || "Explorer");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Monitor Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setUsername(user.displayName || user.email?.split("@")[0] || "Explorer");
      } else {
        setCurrentUser(null);
        setUsername("Explorer");
      }
    });
    return () => unsubscribe();
  }, []);

  // Simple helper to translate page keys
  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || "";
  };

  // Wireframe specific states
  const [showInfoDetails, setShowInfoDetails] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [pinpointMode, setPinpointMode] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [helpFeedbackText, setHelpFeedbackText] = useState<string>("");
  const [helpSubmitted, setHelpSubmitted] = useState<boolean>(false);

  // Timer simulation hook
  useEffect(() => {
    let timerInterval: any = null;
    if (phase === "playing") {
      timerInterval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [phase, currentRoundIndex]);

  
  // Feedback results for current round
  const [currentFeedback, setCurrentFeedback] = useState<{
    guessedCityName: string;
    guessedCity?: City;
    correctCity: City;
    pointsEarned: number;
    bandCities: City[];
    errorMessage?: string;
  } | null>(null);

  // Map reference & HTML container element state callback
  const [mapContainerElement, setMapContainerElement] = useState<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Suggested item scroll refs for scrolling active suggestions
  const suggestionListRef = useRef<HTMLUListElement>(null);

  // States for toggling map city names (labels)
  const [showMapLabels, setShowMapLabels] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // 1. Initialise Map Once (on mount / entering playing state)
  useEffect(() => {
    if (phase === "landing" || phase === "gameover") {
      // Clean up map when we are not actively playing
      setIsMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
        tileLayerRef.current = null;
      }
      return;
    }

    if (!mapContainerElement || mapRef.current) return;

    // Create Leaflet Map centered near Vienna (Bratislava/Lower Austria origin)
    const leafMap = L.map(mapContainerElement, {
      center: [ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], // centered around starting center region
      zoom: 5,
      zoomControl: false, 
      minZoom: 3,
      maxZoom: 9,
      fadeAnimation: true
    });

    // Zoom controls styled in top-right
    L.control.zoom({ position: "topright" }).addTo(leafMap);

    // Layer Group to hold dynamic geometry overlays (circles, center point, markers)
    const layerGroup = L.layerGroup().addTo(leafMap);
    layerGroupRef.current = layerGroup;
    mapRef.current = leafMap;

    // Zoom to fit initial Europe area well
    leafMap.setView([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], 5);

    // Load initial tile layer based on status of labels toggle
    const initialTileUrl = showMapLabels
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png";

    const initialLayer = L.tileLayer(initialTileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(leafMap);
    tileLayerRef.current = initialLayer;

    // Set map state as ready AFTER ref assignment and fully configured
    setIsMapReady(true);

    // Bulletproof ResizeObserver: forces Leaflet to invalidate size and redraw whenever
    // the container container's width/height shifts (e.g. during mounting animations)
    const resizeObserver = new ResizeObserver(() => {
      if (leafMap) {
        leafMap.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerElement);

    // Run custom timeout invalidation too as a safe fallback
    const t = setTimeout(() => {
      if (leafMap) {
        leafMap.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(t);
      resizeObserver.disconnect();
      setIsMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [phase, mapContainerElement]);

  // 1b. Dynamic Base Map Tile Loader - Loads voyager with/without text labels based on user toggle
  useEffect(() => {
    const leafMap = mapRef.current;
    if (!leafMap || phase === "landing" || phase === "gameover") return;

    // Remove the current tile layer to avoid stacks of tiles
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = showMapLabels
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png";

    const newLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(leafMap);

    tileLayerRef.current = newLayer;
  }, [showMapLabels, phase, mapContainerElement, isMapReady]);

  // 1c. Register map click pinpoint listener
  useEffect(() => {
    const leafMap = mapRef.current;
    if (!leafMap || !isMapReady) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (!pinpointMode) return;
      const currentConfig = ROUNDS_CONFIG[currentRoundIndex];
      const bandCities = getCitiesInBand(currentConfig.minRadiusKM, currentConfig.maxRadiusKM);
      
      let closestCity: any = null;
      let minDistance = Infinity;

      bandCities.forEach((city) => {
        const dist = getDistanceKM(e.latlng.lat, e.latlng.lng, city.lat, city.lon);
        if (dist < minDistance) {
          minDistance = dist;
          closestCity = city;
        }
      });

      if (closestCity && minDistance < 500) {
        setInputVal(closestCity.name);
        L.popup()
          .setLatLng([closestCity.lat, closestCity.lon])
          .setContent(`<div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 4px; font-weight: 500;">Pinpointed City: <strong>${closestCity.name}</strong></div>`)
          .openOn(leafMap);
      }
    };

    leafMap.on("click", onMapClick);
    return () => {
      leafMap.off("click", onMapClick);
    };
  }, [pinpointMode, currentRoundIndex, isMapReady, phase]);

  // 2. Synchronise circles, masks, and pins on Leaflet Map
  useEffect(() => {
    const leafMap = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!leafMap || !layerGroup) return;

    // Clear previous drawing layers
    layerGroup.clearLayers();

    // Custom origin home-base marker icon (gold pulsing center) near Vienna
    const originMarker = L.circleMarker([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], {
      radius: 9,
      color: "#ffffff", // Pure white outer ring
      fillColor: "#ea580c", // Vibrant orange/terracotta center
      fillOpacity: 1.0,
      weight: 3.5
    }).addTo(layerGroup);
    
    originMarker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; text-align: center; min-width: 140px;">
        <span style="font-size: 9px; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em;">Game Center</span>
        <h4 style="margin: 2px 0 0 0; font-size: 13px; font-weight: bold; color: #2d2922;">Lower Austria</h4>
        <span style="font-size: 10px; color: #6a5e53;">(Near Vienna)</span>
      </div>
    `);

    // A. Plot historic completely filled circles (lined with crisp white borders, sand fill to block map data)
    guessResults.forEach((result) => {
      L.circle([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], {
        radius: result.maxRadiusKM * 1000,
        color: "#ffffff", // Crisp white edge
        fillColor: "#eae1d4", // warm opaque sandy gray
        fillOpacity: 0.88, 
        weight: 3.5
      }).addTo(layerGroup);
    });

    if (phase === "playing") {
      const currentConfig = ROUNDS_CONFIG[currentRoundIndex];

      // Draw active outer boundary (filled with beautiful semi-transparent royal blue, bordered with a robust premium white line!)
      L.circle([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], {
        radius: currentConfig.maxRadiusKM * 1000,
        color: "#ffffff", // Beautiful pure white edge for aesthetic contrast
        fillColor: "#2563eb", // Vibrant royal blue
        fillOpacity: 0.18,
        weight: 4.5 // robust white lining
      }).addTo(layerGroup);

      // If we have an inner mask bound for the current active ring, draw a solid warm sand core
      if (currentConfig.minRadiusKM > 0) {
        L.circle([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], {
          radius: currentConfig.minRadiusKM * 1000,
          color: "#ffffff", // Beautiful pure white edge
          fillColor: "#eae1d4", // warm sandy mask
          fillOpacity: 0.88,
          weight: 3.5
        }).addTo(layerGroup);
      }

      // Force instant dimension updates for Leaflet before fitting layout limits
      leafMap.invalidateSize();

      // Automatically fly map to fit the current active circle bounds neatly
      const outerBounds = L.latLng([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon]).toBounds(currentConfig.maxRadiusKM * 1000);
      leafMap.flyToBounds(outerBounds, {
        padding: [40, 40],
        duration: 1.2
      });
    }

    if (phase === "feedback" && currentFeedback) {
      const currentConfig = ROUNDS_CONFIG[currentRoundIndex];

      // Re-draw outer circle (solid royal blue ring with white edge)
      L.circle([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], {
        radius: currentConfig.maxRadiusKM * 1000,
        color: "#ffffff", // Crisp white contour
        fillColor: "#2563eb", // Vibrant royal blue
        fillOpacity: 0.12,
        weight: 4.5
      }).addTo(layerGroup);

      // Draw the previous mask to show precisely the ring area
      if (currentConfig.minRadiusKM > 0) {
        L.circle([ORIGIN_COORDS.lat, ORIGIN_COORDS.lon], {
          radius: currentConfig.minRadiusKM * 1000,
          color: "#ffffff", // Crisp white edge
          fillColor: "#eae1d4",
          fillOpacity: 0.88,
          weight: 3.5
        }).addTo(layerGroup);
      }

      // Plot markers for ALL candidate cities inside this active ring
      currentFeedback.bandCities.forEach((city) => {
        const isUserGuessed = currentFeedback.guessedCity?.name === city.name;
        const isCorrect = currentFeedback.correctCity.name === city.name;

        let ringColor = "#64748b"; // Muted slate for non-critical candidates
        let fillColor = "#cbd5e1";
        let markerRadius = 6;
        let ringWeight = 1.5;

        if (isCorrect) {
          ringColor = "#22c55e"; // Success emerald for the absolute maximum population city
          fillColor = "#4ade80";
          markerRadius = 11;
          ringWeight = 3;
        } else if (isUserGuessed) {
          ringColor = "#ef4444"; // Coral red for the user's secondary guess
          fillColor = "#fca5a5";
          markerRadius = 9;
          ringWeight = 2.5;
        }

        const cityMarker = L.circleMarker([city.lat, city.lon], {
          radius: markerRadius,
          color: ringColor,
          fillColor: fillColor,
          fillOpacity: 0.95,
          weight: ringWeight
        }).addTo(layerGroup);

        // Bind a highly polished custom HTML Popup detailing the city size
        const tooltipHTML = `
          <div style="font-family: 'Inter', sans-serif; min-width: 170px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
              <div>
                <h4 style="margin: 0; font-weight: 700; font-size: 13.5px; color: #0f172a;">${city.name}</h4>
                <span style="font-size: 10px; color: #64748b; font-weight: 500;">${city.country}</span>
              </div>
              <span style="font-size: 10px; font-weight: bold; color: #475569; padding: 1px 4px; background: #f1f5f9; border-radius:3px;">
                ${Math.round(getDistanceKM(ORIGIN_COORDS.lat, ORIGIN_COORDS.lon, city.lat, city.lon))} km
              </span>
            </div>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #334155; display: flex; align-items: center; justify-content: space-between;">
              <span>Population:</span>
              <strong style="font-family: 'JetBrains Mono', monospace; color: #1e3a8a;">${city.population.toLocaleString()}</strong>
            </p>
            ${
              isCorrect
                ? `<div style="margin-top: 6px; display: flex; align-items: center; gap: 4px; padding: 3px 6px; font-size: 9.5px; font-weight: bold; background-color: #dcfce7; color: #15803d; border-radius: 4px;">
                    👑 Largest in Ring (Target)
                   </div>`
                : ""
            }
            ${
              isUserGuessed && !isCorrect
                ? `<div style="margin-top: 6px; display: flex; align-items: center; gap: 4px; padding: 3px 6px; font-size: 9.5px; font-weight: bold; background-color: #fee2e2; color: #b91c1c; border-radius: 4px;">
                    🎯 Your Guess (${Math.round(
                      (city.population / currentFeedback.correctCity.population) * 100
                    )}% points)
                   </div>`
                : ""
            }
          </div>
        `;

        cityMarker.bindPopup(tooltipHTML, {
          closeButton: false,
          className: "custom-leaflet-popup"
        });

        // Open popup automatically on the target and guessed city so they are immediately legibly laid out!
        if (isCorrect || isUserGuessed) {
          cityMarker.openPopup();
        }
      });

      // Recalculate dimensions and bounds
      leafMap.invalidateSize();

      // Fly map to enclose the band candidate cities perfectly
      const bandBounds = L.featureGroup(
        currentFeedback.bandCities.map((c) => L.marker([c.lat, c.lon]))
      ).getBounds();

      if (bandBounds.isValid()) {
        leafMap.flyToBounds(bandBounds.pad(0.2), {
          duration: 1.5
        });
      }
    }
  }, [phase, currentRoundIndex, guessResults, currentFeedback, isMapReady]);

  // Save score to local history when game over
  useEffect(() => {
    if (phase === "gameover" && score > 0) {
      const historyJson = localStorage.getItem("plote_scores") || "[]";
      try {
        const history = JSON.parse(historyJson);
        const lastEntry = history[0];
        const isDuplicate = lastEntry && lastEntry.score === score && (Date.now() - lastEntry.timestamp < 10000);
        if (!isDuplicate) {
          history.unshift({
            score,
            category: activeCategory,
            username,
            timestamp: Date.now(),
            roundsPlayed: guessResults.length
          });
          localStorage.setItem("plote_scores", JSON.stringify(history.slice(0, 15)));
        }
      } catch (e) {
        console.error("Failed to save plote history", e);
      }
    }
  }, [phase, score, activeCategory, username, guessResults.length]);

  // 3. Autocomplete Suggestion Logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputVal(rawVal);
    setFocusedSuggestionIndex(-1);

    const norm = rawVal.trim().toLowerCase();
    if (!norm) {
      setSuggestions([]);
      return;
    }

    // Filter cities matching name or alternative spellings
    const matches = EUROPEAN_CITIES.filter((city) => {
      const matchName = city.name.toLowerCase().includes(norm);
      const matchAlt = city.alternatives?.some((alt) => alt.toLowerCase().includes(norm));
      return matchName || matchAlt;
    });

    // Limit suggestions to top 5 to keep UI clean and scannable
    setSuggestions(matches.slice(0, 5));
  };

  // Keyboard accessibility inside autocomplete suggestions
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => {
        const next = prev < suggestions.length - 1 ? prev + 1 : 0;
        scrollSuggestionIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => {
        const next = prev > 0 ? prev - 1 : suggestions.length - 1;
        scrollSuggestionIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < suggestions.length) {
        selectSuggestion(suggestions[focusedSuggestionIndex]);
      } else {
        // Submit first matching suggestion if any
        selectSuggestion(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setFocusedSuggestionIndex(-1);
    }
  };

  const scrollSuggestionIntoView = (index: number) => {
    if (!suggestionListRef.current) return;
    const items = suggestionListRef.current.children;
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  };

  const selectSuggestion = (city: City) => {
    setInputVal(city.name);
    setSuggestions([]);
    setFocusedSuggestionIndex(-1);
  };

  // 4. Submission Handler
  const handleSubmitGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const userGuessText = inputVal.trim();
    if (!userGuessText) return;

    const currentConfig = ROUNDS_CONFIG[currentRoundIndex];

    // Identify candidate target cities currently located within the active ring
    const bandCities = getCitiesInBand(currentConfig.minRadiusKM, currentConfig.maxRadiusKM);

    // Safeguard edge case where the active ring didn't host any of our database cities
    if (bandCities.length === 0) {
      // Advance automatically
      handleSkipRound();
      return;
    }

    // Determine target (absolute largest city population in active band)
    const sortedCorrectList = [...bandCities].sort((a, b) => b.population - a.population);
    const correctCity = sortedCorrectList[0];

    // Find the city typed by the user in our entire master database
    const matchedCity = findCityByName(userGuessText);

    if (!matchedCity) {
      // Trigger user alert warning instead of failing
      setCurrentFeedback({
        guessedCityName: userGuessText,
        guessedCity: undefined,
        correctCity,
        bandCities,
        pointsEarned: 0,
        errorMessage: "This city is unknown. Check your spelling or select from the dropdown!"
      });
      setPhase("feedback");
      return;
    }

    // Compute distance from center origin
    const distFromOrigin = getDistanceKM(ORIGIN_COORDS.lat, ORIGIN_COORDS.lon, matchedCity.lat, matchedCity.lon);

    // Verify boundary constraints
    if (distFromOrigin > currentConfig.maxRadiusKM) {
      setCurrentFeedback({
        guessedCityName: matchedCity.name,
        guessedCity: matchedCity,
        correctCity,
        bandCities,
        pointsEarned: 0,
        errorMessage: `"${matchedCity.name}" resides outside the current outer boundary (${Math.round(distFromOrigin)}km from origin). Focus inside the visible band!`
      });
      setPhase("feedback");
      return;
    }

    if (distFromOrigin <= currentConfig.minRadiusKM) {
      setCurrentFeedback({
        guessedCityName: matchedCity.name,
        guessedCity: matchedCity,
        correctCity,
        bandCities,
        pointsEarned: 0,
        errorMessage: `"${matchedCity.name}" already belongs to previous rounds' masked interior territory. Focus on the freshly revealed light ring!`
      });
      setPhase("feedback");
      return;
    }

    // Valid guess! Calculate proportional score based on city populations inside active ring
    const pointsRatio = matchedCity.population / correctCity.population;
    const pointsEarned = Math.round(100 * pointsRatio);

    setScore((prev) => prev + pointsEarned);
    setCurrentFeedback({
      guessedCityName: matchedCity.name,
      guessedCity: matchedCity,
      correctCity,
      bandCities,
      pointsEarned
    });

    // Record the result
    const resultItem: GuessResult = {
      roundNumber: currentConfig.number,
      guessedCityName: matchedCity.name,
      guessedCity: matchedCity,
      correctCity,
      pointsEarned,
      maxRadiusKM: currentConfig.maxRadiusKM
    };

    setGuessResults((prev) => [...prev, resultItem]);
    setPhase("feedback");
  };

  // 5. Skip / Give Up Round Handler
  const handleSkipRound = () => {
    const currentConfig = ROUNDS_CONFIG[currentRoundIndex];
    const bandCities = getCitiesInBand(currentConfig.minRadiusKM, currentConfig.maxRadiusKM);
    
    // Fail-safe fallback if no cities exist in this band
    const defaultCity: City = { name: "No major city", country: "N/A", lat: ORIGIN_COORDS.lat, lon: ORIGIN_COORDS.lon, population: 0 };
    const correctCity = bandCities.length > 0
      ? bandCities.reduce((prev, curr) => (prev.population > curr.population ? prev : curr), bandCities[0])
      : defaultCity;

    setCurrentFeedback({
      guessedCityName: "No Guess",
      guessedCity: undefined,
      correctCity,
      bandCities,
      pointsEarned: 0
    });

    const resultItem: GuessResult = {
      roundNumber: currentConfig.number,
      guessedCityName: "Skipped",
      guessedCity: undefined,
      correctCity,
      pointsEarned: 0,
      maxRadiusKM: currentConfig.maxRadiusKM
    };

    setGuessResults((prev) => [...prev, resultItem]);
    setPhase("feedback");
  };

  // Finds the next valid round index that contains at least one target city in its band
  const getNextValidRoundIndex = (startIndex: number): number => {
    let index = startIndex;
    while (index < ROUNDS_CONFIG.length) {
      const config = ROUNDS_CONFIG[index];
      const cities = getCitiesInBand(config.minRadiusKM, config.maxRadiusKM);
      if (cities.length > 0) {
        return index;
      }
      index++;
    }
    return -1; // No more rounds with cities
  };

  // 6. Progress on click Next Round
  const handleNextRound = () => {
    setInputVal("");
    setSuggestions([]);
    setCurrentFeedback(null);

    const nextIndex = getNextValidRoundIndex(currentRoundIndex + 1);
    if (nextIndex === -1) {
      setPhase("gameover");
    } else {
      setCurrentRoundIndex(nextIndex);
      setPhase("playing");
    }
  };

  // 7. Restart Game
  const handleRestartGame = () => {
    setScore(0);
    const firstIndex = getNextValidRoundIndex(0);
    setCurrentRoundIndex(firstIndex !== -1 ? firstIndex : 0);
    setGuessResults([]);
    setInputVal("");
    setSuggestions([]);
    setCurrentFeedback(null);
    setActiveGameId("circle-expand");
    setPhase(firstIndex !== -1 ? "playing" : "gameover");
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setScore(0);
    setInputVal("");
    setSuggestions([]);
    setCurrentFeedback(null);
    setGuessResults([]);
    
    if (category.toLowerCase() === "all" || category === "Random") {
      setPhase("landing");
      setActiveGameId(null);
    } else if (
      category.toLowerCase() === "maps" ||
      category.toLowerCase() === "history" ||
      category.toLowerCase() === "geography" ||
      category.toLowerCase() === "sports"
    ) {
      setPhase("game-select");
      setActiveGameId(null);
    } else {
      setPhase("coming-soon");
      setActiveGameId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans select-none antialiased overflow-x-hidden relative" id="app_root">
      
      {/* Plote Responsive Figma Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onOpenResults={() => setShowResultsModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogoClick={() => {
          setPhase("landing");
          setActiveCategory("All");
        }}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        currentUser={currentUser}
        onSignOut={() => signOut(auth)}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 gap-6 relative z-20 max-w-7xl mx-auto w-full" id="game_main">
        <AnimatePresence mode="wait">
          
          {/* Landing State Screen */}
          {phase === "landing" && (
            <motion.div
              key={`landing_view_${currentLang}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col gap-8 z-20"
              id="landing_view"
            >
              {/* 1. Breadcrumb style label */}
              <div 
                className="text-[11px] font-sans font-semibold tracking-[0.08em] text-[#6B7280] uppercase select-none flex items-center gap-1.5"
                id="homepage_breadcrumb"
              >
                <span>{t("home")}</span>
              </div>

              {/* 2. Large headline & 3. Daily Mission */}
              <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto gap-6" id="homepage_hero">
                <h1 
                  className="font-personality text-[36px] font-bold text-[#1A1A1A] leading-tight select-none"
                  id="homepage_headline"
                >
                  {t("headline").toUpperCase()}
                </h1>

                {/* Daily Mission - Distinct eye-catching card, larger padding, bordered */}
                <div 
                  className="w-full bg-[#FFFBF0] border-[1.5px] border-[#E8A838] rounded-[12px] p-6 flex flex-col items-center gap-3 max-w-2xl text-center"
                  id="homepage_daily_mission"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-[#E8A838] font-sans">
                    <span>{t("featuredDailyMission").toUpperCase()}</span>
                  </div>
                  <h3 className="font-personality text-[20px] font-bold text-[#1A1A1A] leading-snug">
                    {t("dailyChallengeTitle")}
                  </h3>
                  <p className="font-sans text-[14px] text-[#6B7280] leading-relaxed max-w-lg">
                    {t("dailyChallengeDesc")}
                  </p>
                </div>

                {/* 4. Play Now Button */}
                <div className="pt-2" id="homepage_cta_zone">
                  <button 
                    onClick={() => {
                      document.getElementById("category_grid_container")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-[#3E8C7C] hover:bg-[#5DCAA5] text-white font-sans text-[14px] font-semibold px-8 py-3 rounded-[8px] transition-all duration-150 cursor-pointer select-none"
                    id="btn_start_game_badge"
                  >
                    {t("playNow")}
                  </button>
                </div>
              </div>

              {/* Main Landing Grid: 2x2 Category Cards (Left) & Sidebar (Right) */}
              <div 
                className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start w-full mt-4" 
                id="homepage_main_grid"
              >
                {/* Left Side: 2x2 Category cards */}
                <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-4" id="category_grid_wrapper">
                  {/* Removed the 'Primary Nav Content / 4 Core Categories' division block */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="category_grid_container">
                    {/* Map Games Card */}
                    <div
                      className="border border-[#3E8C7C] rounded-[12px] p-8 sm:p-6 md:p-8 bg-white hover:bg-[#F0FAF7] hover:border-[#5DCAA5] transition-all duration-150 flex flex-col gap-6"
                      id="card_category_maps"
                    >
                      {/* Centered Category Header */}
                      <div className="flex flex-col items-center justify-center text-center gap-2 border-b border-gray-100 pb-4">
                        <div className="text-[#3E8C7C]">
                          <Compass className="w-6 h-6" />
                        </div>
                        <h3 className="font-personality text-[18px] text-[#1A1A1A] font-bold">
                          {t("mapGames")}
                        </h3>
                        <button
                          onClick={() => handleCategoryChange("Maps")}
                          className="font-sans text-[11px] font-semibold text-[#3E8C7C] tracking-[0.08em] hover:text-[#5DCAA5] cursor-pointer uppercase"
                        >
                          VIEW ALL
                        </button>
                      </div>

                      <div className="flex flex-col">
                        {/* 1. Circle Expand */}
                        <button
                          onClick={() => {
                            const firstIndex = getNextValidRoundIndex(0);
                            setCurrentRoundIndex(firstIndex !== -1 ? firstIndex : 0);
                            setActiveGameId("circle-expand");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Circle Expand
                        </button>

                        {/* 2. Capital Chain */}
                        <button
                          onClick={() => {
                            setActiveGameId("capital-chain");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Capital Chain
                        </button>

                        {/* 3. Border Blind */}
                        <button
                          onClick={() => {
                            setActiveGameId("border-blind");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Border Blind
                        </button>

                        {/* 4. Distance Duel */}
                        <button
                          onClick={() => {
                            setActiveGameId("distance-duel");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Distance Duel
                        </button>
                      </div>
                    </div>

                    {/* History Games Card */}
                    <div
                      className="border border-[#3E8C7C] rounded-[12px] p-8 sm:p-6 md:p-8 bg-white hover:bg-[#F0FAF7] hover:border-[#5DCAA5] transition-all duration-150 flex flex-col gap-6"
                      id="card_category_history"
                    >
                      {/* Centered Category Header */}
                      <div className="flex flex-col items-center justify-center text-center gap-2 border-b border-gray-100 pb-4">
                        <div className="text-[#3E8C7C]">
                          <Award className="w-6 h-6" />
                        </div>
                        <h3 className="font-personality text-[18px] text-[#1A1A1A] font-bold">
                          {t("historyGames")}
                        </h3>
                        <button
                          onClick={() => handleCategoryChange("History")}
                          className="font-sans text-[11px] font-semibold text-[#3E8C7C] tracking-[0.08em] hover:text-[#5DCAA5] cursor-pointer uppercase"
                        >
                          VIEW ALL
                        </button>
                      </div>

                      <div className="flex flex-col">
                        {/* 1. Timeline Drop */}
                        <button
                          onClick={() => {
                            setActiveGameId("timeline-drop");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Historical Event Timeline
                        </button>

                        {/* 2. Who Did It? */}
                        <button
                          onClick={() => {
                            setActiveGameId("who-did-it");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Identify the Historical Figure
                        </button>

                        {/* 3. Where Were They? */}
                        <button
                          onClick={() => {
                            setActiveGameId("where-were-they");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Locate Historical Events
                        </button>

                        {/* 4. Before or After? */}
                        <button
                          onClick={() => {
                            setActiveGameId("before-or-after");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Which Event Happened First?
                        </button>

                        {/* 5. Empire Builder */}
                        <button
                          onClick={() => {
                            setActiveGameId("empire-builder");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Which empire controlled the territory?
                        </button>
                      </div>
                    </div>

                    {/* Geography Games Card */}
                    <div
                      className="border border-[#3E8C7C] rounded-[12px] p-8 sm:p-6 md:p-8 bg-white hover:bg-[#F0FAF7] hover:border-[#5DCAA5] transition-all duration-150 flex flex-col gap-6"
                      id="card_category_geography"
                    >
                      {/* Centered Category Header */}
                      <div className="flex flex-col items-center justify-center text-center gap-2 border-b border-gray-150 pb-4">
                        <div className="text-[#3E8C7C]">
                          <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="font-personality text-[18px] text-[#1A1A1A] font-bold">
                          {t("geographyGames")}
                        </h3>
                        <button
                          onClick={() => handleCategoryChange("Geography")}
                          className="font-sans text-[11px] font-semibold text-[#3E8C7C] tracking-[0.08em] hover:text-[#5DCAA5] cursor-pointer uppercase"
                        >
                          VIEW ALL
                        </button>
                      </div>

                      <div className="flex flex-col">
                        {/* 1. Metro Population Challenge */}
                        <button
                          onClick={() => {
                            setActiveCategory("Geography");
                            setActiveGameId("metro-pop");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Metro Population Challenge
                        </button>

                        {/* 2. River Outlets */}
                        <button
                          onClick={() => {
                            setActiveCategory("Geography");
                            setActiveGameId("river-to-sea");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          River Outlets
                        </button>

                        {/* 3. City on the River */}
                        <button
                          onClick={() => {
                            setActiveCategory("Geography");
                            setActiveGameId("city-river");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          City on the River
                        </button>

                        {/* 4. Highest Peak Finder */}
                        <button
                          onClick={() => {
                            setActiveCategory("Geography");
                            setActiveGameId("peak-finder");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Highest Peak Finder
                        </button>
                      </div>
                    </div>

                    {/* Sport Games Card */}
                    <div
                      className="border border-[#3E8C7C] rounded-[12px] p-8 sm:p-6 md:p-8 bg-white hover:bg-[#F0FAF7] hover:border-[#5DCAA5] transition-all duration-150 flex flex-col gap-6"
                      id="card_category_sports"
                    >
                      {/* Centered Category Header */}
                      <div className="flex flex-col items-center justify-center text-center gap-2 border-b border-gray-150 pb-4">
                        <div className="text-[#3E8C7C]">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <h3 className="font-personality text-[18px] text-[#1A1A1A] font-bold">
                          {t("sportGames")}
                        </h3>
                        <button
                          onClick={() => handleCategoryChange("Sports")}
                          className="font-sans text-[11px] font-semibold text-[#3E8C7C] tracking-[0.08em] hover:text-[#5DCAA5] cursor-pointer uppercase"
                        >
                          VIEW ALL
                        </button>
                      </div>

                      <div className="flex flex-col">
                        {/* 1. Stadium Locator */}
                        <button
                          onClick={() => {
                            setActiveCategory("Sports");
                            setActiveGameId("stadium-locator");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Stadium Locator
                        </button>

                        {/* 2. Olympic Cities */}
                        <button
                          onClick={() => {
                            setActiveCategory("Sports");
                            setActiveGameId("olympic-cities");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Olympic Cities
                        </button>

                        {/* 3. Champions Ring */}
                        <button
                          onClick={() => {
                            setActiveCategory("Sports");
                            setActiveGameId("champions-ring");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Champions Ring
                        </button>

                        {/* 4. Athlete Map */}
                        <button
                          onClick={() => {
                            setActiveCategory("Sports");
                            setActiveGameId("athlete-map");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-b border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Athlete Map
                        </button>

                        {/* 5. Grand Prix Circuits */}
                        <button
                          onClick={() => {
                            setActiveCategory("Sports");
                            setActiveGameId("f1-circuits");
                            setPhase("playing");
                          }}
                          className="w-full text-left py-2.5 border-[#F3F4F6] text-[14px] text-[#1A1A1A] hover:text-[#3E8C7C] transition-all duration-150 cursor-pointer font-sans"
                        >
                          Grand Prix Circuits
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Sidebar (Quiz lists + News) */}
                <div 
                  className="md:col-span-5 lg:col-span-4 flex flex-col gap-6" 
                  id="homepage_sidebar"
                >
                  {/* List A: 10 Best Quizzes of the Day */}
                  <div 
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-4 flex flex-col gap-3"
                    id="sidebar_best_quizzes"
                  >
                    <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
                      <h4 className="text-[12px] font-bold text-[#1A1A1A] tracking-[0.06em] uppercase font-sans">
                        {t("bestQuizzesTitle")}
                      </h4>
                      <span className="text-[10px] font-bold text-[#E8A838] bg-[#E8A838]/12 rounded-[4px] px-1.5 py-0.5">
                        HOT
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[13px] text-[#1A1A1A] font-sans">
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">01.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz1")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">02.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz2")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">03.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz3")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">04.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz4")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">05.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz5")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">06.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz6")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">07.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz7")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">08.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz8")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">09.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz9")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">10.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("quiz10")}</span>
                      </li>
                    </ul>
                  </div>

                  {/* List B: 10 Most Popular Games of All Time */}
                  <div 
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-4 flex flex-col gap-3"
                    id="sidebar_popular_games"
                  >
                    <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
                      <h4 className="text-[12px] font-bold text-[#1A1A1A] tracking-[0.06em] uppercase font-sans">
                        {t("popularGamesTitle")}
                      </h4>
                      <span className="text-[10px] font-bold text-[#E8A838] bg-[#E8A838]/12 rounded-[4px] px-1.5 py-0.5">
                        ALL TIME
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[13px] text-[#1A1A1A] font-sans">
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">01.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop1")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">02.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop2")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">03.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop3")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">04.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop4")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">05.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop5")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">06.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop6")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">07.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop7")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">08.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop8")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">09.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop9")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#6B7280]">10.</span>
                        <span className="hover:text-[#3E8C7C] cursor-pointer transition-colors duration-150">{t("pop10")}</span>
                      </li>
                    </ul>
                  </div>

                  {/* List C: Recent News - Visually least important, smaller height, less padding */}
                  <div 
                    className="p-4 bg-white border border-[#E5E7EB] rounded-[8px] flex flex-col gap-3"
                    id="sidebar_recent_news"
                  >
                    <div className="border-b border-gray-100 pb-1.5">
                      <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.08em] font-sans">
                        {t("recentNewsTitle")}
                      </span>
                    </div>
                    <div className="space-y-2 text-[13px] text-[#6B7280] leading-relaxed font-sans">
                      <p>
                        {t("newsUpdate1")}
                      </p>
                      <p>
                        {t("newsUpdate2")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Game Selection Phase Screen */}
          {phase === "game-select" && (
            <motion.div
              key="game_select_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full flex flex-col gap-6 z-20"
              id="game_select_view"
            >
              {/* Back to Home Breadcrumb */}
              <div className="text-[11px] font-mono font-bold tracking-wider text-gray-400 uppercase select-none flex items-center gap-1.5" id="games_breadcrumb">
                <button 
                  onClick={() => {
                    setPhase("landing");
                    setActiveCategory("All");
                  }}
                  className="hover:text-black cursor-pointer uppercase transition-colors"
                >
                  {t("allGames")}
                </button>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-gray-600">
                  {activeCategory === "History" 
                    ? "History Selection" 
                    : activeCategory === "Geography" 
                    ? "Geography Selection" 
                    : activeCategory === "Sports"
                    ? "Sports Selection"
                    : "Maps Selection"}
                </span>
              </div>

              {/* Page Titles */}
              <div className="text-left max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-955 uppercase tracking-tight">
                  {activeCategory === "History" 
                    ? "History Games Hub" 
                    : activeCategory === "Geography" 
                    ? "Geography Games Hub" 
                    : activeCategory === "Sports"
                    ? "Sports Games Hub"
                    : "Map Games Hub"}
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {activeCategory === "History" 
                    ? "Select a chronology, identity, or territory-based historical assignment below."
                    : activeCategory === "Geography"
                    ? "Select an river system, summit, or metropolitan population assignment below to begin."
                    : activeCategory === "Sports"
                    ? "Select a stadium locator, Olympic host, championship dynasty, legendary athlete, or Formula 1 circuit assignment below to begin."
                    : "Select a coordinate-based geographical assignment below to begin."}
                </p>
              </div>

              {/* Game cards grid */}
              {activeCategory === "History" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="history_game_grid_cards">
                  
                  {/* 1. Timeline Drop */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Historical Event Timeline</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Place critical historical events onto their correct timeline positions using relative offset proximity scoring.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("timeline-drop");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 2. Who Did It? */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Identify the Historical Figure</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Deconstruct historical achievements, direct quotes, and policy decisions to identify correct global figures.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("who-did-it");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 3. Where Were They? */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Locate Historical Events</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Map coordinate placements of lost ancient cities, monuments, and iconic historic battles on a world map.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("where-were-they");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 4. Before or After? */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Which Event Happened First?</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Determine sequence dynamics under tense timers by comparing which of two target incidents occurred first.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("before-or-after");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 5. Empire Builder */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Which empire controlled the territory?</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Analyze spatial borders drawn from major global eras to specify the correct sovereign hegemon of that epoch.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("empire-builder");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                </div>
              ) : activeCategory === "Geography" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="geography_game_grid_cards">
                  
                  {/* 1. Metro Population Challenge */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Metro Population Challenge</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Estimate European metropolitan populations using a logarithmic slider and synced manual inputs.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("metro-pop");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 2. River Outlets */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">River Outlets</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Trace global rivers to their correct sea, ocean, or inland lake outlets with custom geographical notes.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("river-to-sea");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 3. City on the River */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">City on the River</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Recall the critical river system that each prominent European city was founded on. Includes spelling auto-fuzziness.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("city-river");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 4. Highest Peak Finder */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Highest Peak Finder</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Identify the highest mountain peak and elevations for countries around the globe.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("peak-finder");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                </div>
              ) : activeCategory === "Sports" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="sports_game_grid_cards">
                  
                  {/* 1. Stadium Locator */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Stadium Locator</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Pin famous global stadiums and home clubs on the world map and check your proximity metrics.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("stadium-locator");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 2. Olympic Cities */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Olympic Cities</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Identify the host cities of historic Olympic Summer and Winter Games on the map.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("olympic-cities");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 3. Champions Ring */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Champions Ring</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Pin the home stadiums and arenas of iconic championship dynasties and events.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("champions-ring");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 4. Athlete Map */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Athlete Map</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Locate the precise birthplaces of legendary global athletes across multiple sports.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("athlete-map");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                  {/* 5. Grand Prix Circuits */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Grand Prix Circuits</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Pin legendary Formula 1 race track layouts on the world map and test your speedway knowledge.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("f1-circuits");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Game
                      </button>
                    </div>
                  </motion.div>

                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="maps_game_grid_cards">
                  
                  {/* 1. Circle Expand */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Circle Expand</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Identify population density centers within variable radial boundary targets centered near Vienna.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          const firstIndex = getNextValidRoundIndex(0);
                          setCurrentRoundIndex(firstIndex !== -1 ? firstIndex : 0);
                          setActiveGameId("circle-expand");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Begin Expedition
                      </button>
                    </div>
                  </motion.div>

                  {/* 2. Capital Chain */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Capital Chain</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Pinpoint exact coordinates of country capital cities on the map and check your physical offset metrics.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("capital-chain");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Quiz
                      </button>
                    </div>
                  </motion.div>

                  {/* 3. Border Blind */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Border Blind</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Identify country outline shapes on a world map using pure visual matching with no labels or surrounding context.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("border-blind");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Quiz
                      </button>
                    </div>
                  </motion.div>

                  {/* 4. Distance Duel */}
                  <motion.div
                    whileHover={{ y: -2, borderColor: "#3E8C7C" }}
                    className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 flex flex-col justify-between gap-4 transition-all duration-150"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight font-sans">Distance Duel</h3>
                      <p className="text-xs text-gray-500 leading-normal font-sans mt-1">
                        Estimate the real-world kilometer distance between prominent city pairs with the help of a static map.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setActiveGameId("distance-duel");
                          setPhase("playing");
                        }}
                        className="w-full bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Launch Duel
                      </button>
                    </div>
                  </motion.div>

                </div>
              )}
            </motion.div>
          )}

          {/* Other Categories Coming Soon Screen */}
          {phase === "coming-soon" && (
            <motion.div
              key="coming_soon_view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-md mx-auto text-center bg-white border border-[#E5E7EB] rounded-[8px] p-8 py-12 z-20 flex flex-col items-center gap-4"
              id="coming_soon_view"
            >
              <div className="w-12 h-12 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#3E8C7C]">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wide font-sans">Category Integration</h3>
                <p className="text-xs text-gray-500 tracking-wider uppercase mt-0.5 font-sans font-semibold">{activeCategory} Games</p>
                <p className="text-xs text-gray-500 px-2 mt-3 font-sans leading-relaxed">
                  Interactive quizzes for the {activeCategory} category are currently being calibrated under physical coordinate constraints. Check back shortly.
                </p>
              </div>
              <button
                onClick={() => {
                  setPhase("landing");
                  setActiveCategory("All");
                }}
                className="mt-2 bg-[#1A1A1A] hover:bg-[#3E8C7C] text-white text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-[8px] transition-all cursor-pointer"
              >
                Return to Directory
              </button>
            </motion.div>
          )}

           {/* Core Interactive Layout (Playing & Feedback Phase) */}
          {(phase === "playing" || phase === "feedback") && (
            activeGameId === "capital-chain" ? (
              <CapitalChainGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  // Save the final results to leaderboard/results history
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: "Maps - Capital Chain",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  // Update parent states
                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Maps");
                  setActiveGameId(null);
                  
                  // Open results history modal layout
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Maps");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "border-blind" ? (
              <BorderBlindGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: "Maps - Border Blind",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Maps");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Maps");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "distance-duel" ? (
              <DistanceDuelGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: "Maps - Distance Duel",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Maps");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Maps");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "timeline-drop" ? (
              <TimelineDropGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "History - Timeline",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "who-did-it" ? (
              <WhoDidItGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "History - Identify Historical Figure",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "where-were-they" ? (
              <WhereWereTheyGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "History - Locate Historical Events",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "before-or-after" ? (
              <BeforeOrAfterGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "History - Which Event Happened First?",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "empire-builder" ? (
              <EmpireBuilderGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "History - Which empire controlled the territory?",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("History");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "metro-pop" ? (
              <MetroPopulationGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Geography - Metro Population Challenge",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "river-to-sea" ? (
              <RiverToSeaGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Geography - River Outlets",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "city-river" ? (
              <CityOnRiverGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Geography - City on the River",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "peak-finder" ? (
              <PeakFinderGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Geography - Highest Peak Finder",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Geography");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "stadium-locator" ? (
              <StadiumLocatorGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Sports - Stadium Locator",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "olympic-cities" ? (
              <OlympicCitiesGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Sports - Olympic Cities",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "champions-ring" ? (
              <ChampionsRingGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Sports - Champions Ring",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "athlete-map" ? (
              <AthleteMapGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Sports - Athlete Map",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                }}
              />
            ) : activeGameId === "f1-circuits" ? (
              <F1CircuitsGame
                currentLang={currentLang}
                onFinishGame={(finalValue, nameGame) => {
                  const scoreEntry = {
                    score: finalValue,
                    username: username || "Explorer",
                    category: nameGame || "Sports - Grand Prix Circuits",
                    timestamp: new Date().toISOString()
                  };
                  try {
                    const historic = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                    historic.unshift(scoreEntry);
                    localStorage.setItem("plote_scores", JSON.stringify(historic.slice(0, 50)));
                  } catch (e) {}

                  setScore(finalValue);
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                  setShowResultsModal(true);
                }}
                onBackToMenu={() => {
                  setPhase("game-select");
                  setActiveCategory("Sports");
                  setActiveGameId(null);
                }}
              />
            ) : (
              <div key="active_game_view" className="w-full flex flex-col md:flex-row gap-6 items-stretch z-20" id="playing_and_feedback_layout">
              
              {/* Main Content Area (left ~65% of screen on md+) */}
              <div className="w-full md:w-[65%] flex flex-col" id="main_content_area">
                {/* 2. Question/Prompt for current round */}
                <div className="mb-3 bg-white p-4 border border-gray-200 rounded-[8px]" id="current_question_prompt">
                  <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">
                    {phase === "playing" 
                      ? "Find this city on the map" 
                      : `Reviewing Results for Stage ${String(currentRoundIndex + 1).padStart(2, '0')}`}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {phase === "playing"
                      ? `Identify the absolute largest population hub inside the active segment! It is between the ${ROUNDS_CONFIG[currentRoundIndex].minRadiusKM}km and ${ROUNDS_CONFIG[currentRoundIndex].maxRadiusKM}km radial boundaries.`
                      : `A comparison of your guess versus the true target highlight city inside this band sphere.`}
                  </p>
                </div>

                {/* 3. Collapsible info toggle ("ⓘ details" link) */}
                <div className="mb-3" id="collapsible_details_container">
                  <button 
                    onClick={() => setShowInfoDetails(!showInfoDetails)}
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors focus:outline-none"
                  >
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-[10px] font-extrabold select-none">i</span>
                    <span>{showInfoDetails ? "Hide information details" : "Show information details"}</span>
                  </button>
                  <AnimatePresence>
                    {showInfoDetails && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 text-xs text-gray-600 space-y-1 p-3.5 bg-gray-50 border border-gray-200 rounded-[8px] font-medium"
                      >
                        <div><strong>Created:</strong> June 19, 2026 (Live Session)</div>
                        <div><strong>Radial Bounds:</strong> {ROUNDS_CONFIG[currentRoundIndex].minRadiusKM}km to {ROUNDS_CONFIG[currentRoundIndex].maxRadiusKM}km from Origin</div>
                        <div><strong>Projection Standard:</strong> WGS84 Geographic Core Ellipsoid Matrix</div>
                        <div><strong>Difficulty level:</strong> Highly Advanced Geographic Inference</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Answer input area with Timer element to its left */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch mb-3" id="answer_input_timer_row">
                  {/* Timer Display */}
                  <div className="sm:col-span-3 bg-gray-900 text-white rounded-[8px] p-3 flex flex-col justify-center items-center text-center shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Timer</span>
                    <span className="text-lg font-mono font-black mt-0.5" id="game_timer_display">{formatTime(timerSeconds)}</span>
                  </div>

                  {/* Action form or feedback results display */}
                  <div className="sm:col-span-9 flex flex-col justify-center bg-white border border-gray-200 rounded-[8px] p-3 shadow-sm">
                    {phase === "playing" ? (
                      <form onSubmit={handleSubmitGuess} className="relative w-full" id="city_guess_form">
                        <div className="relative">
                          <input
                            type="text"
                            value={inputVal}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Type target city name (e.g. Rome, Berlin, Munich)..."
                            className="w-full bg-white border border-gray-200 hover:border-gray-400 rounded-[8px] px-3.5 py-2 text-gray-900 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-400 font-semibold"
                            autoFocus
                          />
                          <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                          <ul
                            ref={suggestionListRef}
                            className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-[8px] max-h-48 overflow-y-auto z-50 divide-y divide-gray-100 shadow-lg"
                            id="suggestions_dropdown"
                          >
                            {suggestions.map((city, idx) => (
                              <li
                                key={city.name}
                                onClick={() => selectSuggestion(city)}
                                className={`px-3 py-2 text-xs font-semibold cursor-pointer flex justify-between items-center transition-colors ${
                                  idx === focusedSuggestionIndex
                                    ? "bg-gray-100 text-black font-extrabold"
                                    : "hover:bg-gray-50 text-gray-800"
                                }`}
                              >
                                <div>
                                  <span className="block">{city.name}</span>
                                  <span className="text-[9px] text-gray-400 uppercase font-mono">{city.country}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">{(city.population / 1000000).toFixed(2)}M pop</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </form>
                    ) : (
                      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" id="game_feedback_summary_block">
                        <div className="flex-1 text-center sm:text-left">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight block">Round Outcome</span>
                          <div className="text-sm font-extrabold text-gray-950 mt-0.5">
                            {currentFeedback?.pointsEarned === 0 
                              ? "Incorrect guess or skipped" 
                              : `Scored +${currentFeedback?.pointsEarned} / 100 points!`}
                          </div>
                        </div>
                        <button
                          onClick={handleNextRound}
                          className="w-full sm:w-auto bg-gray-950 hover:bg-black text-white px-5 py-2.5 rounded-[8px] font-bold text-xs uppercase tracking-wider transition-all"
                          id="btn_continue_to_next_sphere"
                        >
                          {currentRoundIndex >= ROUNDS_CONFIG.length - 1
                            ? "See Game Summary"
                            : `Next Sphere Zone ➔`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Hint button area with red exclamation icon */}
                {phase === "playing" && (
                  <div className="mb-3" id="hint_trigger_row">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-400 text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-[8px] transition-all flex items-center gap-1.5"
                      >
                        <span className="inline-flex items-center justify-center bg-gray-950 text-white rounded-full w-3.5 h-3.5 text-[9px] font-black font-mono">!</span>
                        <span>{showHint ? "Hide Hint" : "Reveal Hint"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmitGuess()}
                        disabled={!inputVal.trim()}
                        className="bg-gray-950 hover:bg-black disabled:opacity-30 disabled:hover:bg-gray-950 text-white font-extrabold text-xs px-3 py-1.5 rounded-[8px]"
                        id="btn_submit_city"
                      >
                        Submit Response
                      </button>

                      <button
                        type="button"
                        onClick={handleSkipRound}
                        className="text-gray-500 hover:text-black font-bold text-xs"
                        id="btn_skip_step"
                      >
                        Skip Round
                      </button>
                    </div>

                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-[8px] text-xs text-gray-600 font-medium leading-relaxed"
                        >
                          <strong>Active Hub Hint:</strong> The maximum target center city resides in <strong>{(() => {
                            if (currentRoundIndex < 0 || currentRoundIndex >= ROUNDS_CONFIG.length) return "Europe/Central coordinate zones";
                            const bandCities = getCitiesInBand(ROUNDS_CONFIG[currentRoundIndex].minRadiusKM, ROUNDS_CONFIG[currentRoundIndex].maxRadiusKM);
                            const maxCity = bandCities.length > 0 ? bandCities.reduce((max, c) => c.population > max.population ? c : max, bandCities[0]) : null;
                            return maxCity ? maxCity.country : "Europe/Central coordinate zones";
                          })()}</strong>.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 6. Active feedback details or city bands matching (Only in feedback phase) */}
                {phase === "feedback" && currentFeedback && (
                  <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-[8px]" id="feedback_details_block">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 font-mono">
                      Population Metrics Analysis
                    </h4>
                    <div className="space-y-2 mb-3 text-xs">
                      <div className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded-[8px]">
                        <span className="text-gray-500 font-medium">Your Guess:</span>
                        <strong className="text-gray-900">{currentFeedback.guessedCity ? `${currentFeedback.guessedCity.name} (${currentFeedback.guessedCity.population.toLocaleString()} pop)` : "No Match / Skipped"}</strong>
                      </div>
                      <div className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded-[8px]">
                        <span className="text-gray-500 font-medium">True Maximum City:</span>
                        <strong className="text-emerald-700">{currentFeedback.correctCity.name} ({currentFeedback.correctCity.population.toLocaleString()} pop)</strong>
                      </div>
                    </div>

                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-mono">
                      Additional cities inside this band sphere:
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1 divide-y divide-gray-150">
                      {currentFeedback.bandCities
                        .sort((a, b) => b.population - a.population)
                        .map((city, idx) => (
                          <div key={city.name} className="flex justify-between items-center text-xs py-1 text-gray-800">
                            <span className="font-semibold">{city.name} ({city.country})</span>
                            <span className="font-mono text-gray-500">{city.population.toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* THE MAP: Dominant Visual centerpiece of the screen layout */}
                <div className="flex-1 relative flex flex-col bg-white rounded-[8px] border border-gray-200 p-1 shadow-sm overflow-hidden min-h-[480px] lg:min-h-[580px] xl:min-h-[640px]" id="dominant_map_wrapper">
                  {/* Map Overlay Controls */}
                  <div className="absolute top-3 left-3 z-40 bg-white/90 border border-gray-200 backdrop-blur-md px-3 py-1.5 rounded-[8px] flex items-center gap-3 shadow-sm select-none">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-800 uppercase tracking-tight">
                      <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                      <span>Active Sphere: {ROUNDS_CONFIG[currentRoundIndex].minRadiusKM}km to {ROUNDS_CONFIG[currentRoundIndex].maxRadiusKM}km</span>
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-40 pointer-events-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMapLabels(prev => !prev)}
                      className={`px-3 py-1.5 rounded-[8px] text-[10px] font-bold border flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        showMapLabels 
                          ? "bg-gray-950 text-white border-transparent"
                          : "bg-white/95 hover:bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      <span>Labels: {showMapLabels ? "ON" : "OFF"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPinpointMode(prev => !prev)}
                      className={`px-3 py-1.5 rounded-[8px] text-[10px] font-bold border flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        pinpointMode 
                          ? "bg-gray-950 text-white border-transparent"
                          : "bg-white/95 hover:bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      <span>Pinpoint Mode: {pinpointMode ? "ACTIVE" : "OFF"}</span>
                    </button>
                  </div>

                  <div ref={setMapContainerElement} className="w-full h-full min-h-[480px] lg:min-h-[580px] custom-leaflet-map" id="game_map_container" />
                </div>
              </div>

              {/* Sidebar Area (right ~35% of screen on md+, stacks below on mobile) */}
              <div className="w-full md:w-[35%] flex flex-col justify-between" id="sidebar_controls_area">
                <div className="space-y-4">
                  
                  {/* Profile & Live stats Tray */}
                  <div className="bg-white border border-gray-200 rounded-[8px] p-4 shadow-sm">
                    <span className="block text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-2 font-mono">Live Expedition Metrics</span>
                    <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100">
                      <div className="pr-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight block">Accumulated Score</span>
                        <strong className="text-gray-900 text-base font-mono font-black">{score.toLocaleString()} pts</strong>
                      </div>
                      <div className="pl-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight block">Expansive Stage</span>
                        <strong className="text-gray-900 text-base font-mono font-black">{currentRoundIndex + 1} / {ROUNDS_CONFIG.length}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Games card */}
                  <div className="bg-white border border-gray-200 rounded-[8px] p-4 shadow-sm">
                    <h3 className="text-xs font-black text-gray-900 tracking-wider uppercase mb-3 border-b border-gray-100 pb-2">Recommended quizzes</h3>
                    <ul className="space-y-3">
                      <li className="group pointer-events-auto cursor-pointer" onClick={() => handleCategoryChange("All")}>
                        <span className="block text-xs font-extrabold text-gray-900 group-hover:underline">European Sovereign Capitals</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5 leading-relaxed font-semibold">Guess European centers of administrative and regional influence.</span>
                      </li>
                      <li className="group pointer-events-auto cursor-pointer" onClick={() => handleCategoryChange("Geography")}>
                        <span className="block text-xs font-extrabold text-gray-900 group-hover:underline">Global Boundaries & Coordinates</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5 leading-relaxed font-semibold">Identify physical and political geographic boundaries inside micro quadrants.</span>
                      </li>
                      <li className="group pointer-events-auto cursor-pointer" onClick={() => handleCategoryChange("Random")}>
                        <span className="block text-xs font-extrabold text-gray-900 group-hover:underline">Random Geographic Expedition</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5 leading-relaxed font-semibold">Randomly shifted coordinates bounds with unpredictable density segments.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Interactive Logs */}
                  <div className="bg-white border border-gray-200 rounded-[8px] p-4 shadow-sm max-h-48 overflow-y-auto">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Stage History Logs</span>
                    {guessResults.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No historical stages finished yet. Complete first guess.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {guessResults.map((result, i) => (
                          <div key={i} className="flex justify-between items-center text-xs text-gray-800 border-b border-gray-50 py-1 last:border-0">
                            <span>Stage {result.roundNumber}: {result.guessedCityName}</span>
                            <strong className="font-mono">+{result.pointsEarned}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Call-To-Action Footers */}
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowResultsModal(true)}
                    className="w-full bg-white border border-gray-300 hover:border-gray-900 text-gray-900 font-extrabold p-3 rounded-[8px] text-xs uppercase tracking-wider transition-all text-center"
                    id="btn_see_my_results"
                  >
                    See my results!
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Would you like to abort the active session and re-route to setup constraints?")) {
                        setPhase("landing");
                        setScore(0);
                        setGuessResults([]);
                      }
                    }}
                    className="w-full bg-white border border-gray-300 hover:border-gray-950 text-gray-900 font-extrabold p-3 rounded-[8px] text-xs uppercase tracking-wider transition-all text-center"
                    id="btn_create_own_game"
                  >
                    Create my own game!
                  </button>
                </div>
              </div>
            </div>
            )
          )}

          {/* Game Over Scoreboard Screen */}
          {phase === "gameover" && (
            <motion.div
              key="gameover_view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-12 text-center bg-white border border-gray-200 rounded-[8px] p-8 shadow-sm z-20 animate-fade-in"
              id="gameover_view"
            >
              <div className="relative mb-6">
                <div className="relative w-20 h-20 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                  <Award className="w-10 h-10 text-gray-950" />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-2">Continent Conquered!</h2>
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-8">All progressive coordinate zones resolved</p>

              <div className="grid grid-cols-3 gap-3 w-full text-center mb-8 border-t border-b border-gray-200 py-6">
                <div>
                  <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">Score Accumulated</span>
                  <strong className="text-lg font-mono font-black text-gray-950">{score}</strong>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">Perfect Zones</span>
                  <strong className="text-lg font-mono font-black text-emerald-700">
                    {guessResults.filter(r => r.pointsEarned === 100).length}
                  </strong>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">Explorer IQ</span>
                  <strong className="text-xs font-bold text-gray-700 uppercase">
                    {score >= 1000 ? "Grand Explorer" : "Apprentice"}
                  </strong>
                </div>
              </div>

              {/* Restart */}
              <button
                onClick={handleRestartGame}
                className="bg-gray-950 hover:bg-gray-900 text-white font-bold px-8 py-3 rounded-[8px] uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2"
                id="btn_play_again"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Begin Another Expedition</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* FOOTER (bottom of page): Elegant dark background for clear separation */}
        <footer 
          className="w-full bg-gray-950 text-gray-300 rounded-[14px] p-6 sm:p-8 mt-16 flex flex-col gap-4 text-left shadow-lg border border-gray-900 select-none"
          id="homepage_footer"
        >
          <div className="flex flex-col gap-2 max-w-xs" id="footer_links_container">
            <a href="#about" className="text-xs text-gray-400 hover:text-white hover:underline transition-colors uppercase font-mono tracking-wider">
              {t("aboutUs")}
            </a>
            <a 
              href="#contact" 
              onClick={(e) => {
                e.preventDefault();
                setShowContactModal(true);
              }}
              className="text-xs text-gray-400 hover:text-white hover:underline transition-colors uppercase font-mono tracking-wider"
            >
              {t("contactUs")}
            </a>
            <a href="#faq" className="text-xs text-gray-400 hover:text-white hover:underline transition-colors uppercase font-mono tracking-wider">
              {t("faq")}
            </a>
            <a href="#terms" className="text-xs text-gray-400 hover:text-white hover:underline transition-colors uppercase font-mono tracking-wider">
              {t("termsConditions")}
            </a>
            <a href="#privacy" className="text-xs text-gray-400 hover:text-white hover:underline transition-colors uppercase font-mono tracking-wider">
              {t("privacyPolicy")}
            </a>
          </div>
          <div className="mt-4 border-t border-gray-800 pt-4 text-[10px] text-gray-500 font-mono tracking-wide uppercase">
            &copy; {new Date().getFullYear()} PLOTE. {t("allSpheresReserved")}
          </div>
        </footer>
      </main>

      {/* Modern High-contrast Grayscale Modal Overlays */}
      <AnimatePresence>
        {showResultsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white text-gray-900 w-full max-w-lg p-6 relative border border-gray-250 shadow-2xl rounded-[8px]"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gray-950" />
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest">My Results History</h3>
                </div>
                <button 
                  onClick={() => setShowResultsModal(false)}
                  className="text-gray-500 hover:text-black text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {(() => {
                  let scoresList = [];
                  try {
                    scoresList = JSON.parse(localStorage.getItem("plote_scores") || "[]");
                  } catch (e) {}

                  if (scoresList.length === 0) {
                    return (
                      <div className="text-center py-10 text-gray-500 text-xs">
                        <Compass className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                        No attempts logged yet. Check your bounds.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {scoresList.map((entry: any, i: number) => (
                        <div 
                          key={i} 
                          className="bg-gray-50 border border-gray-200 p-3 flex items-center justify-between rounded-[8px]"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded-[4px]">
                                {entry.category || "All"}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs font-semibold mt-1">
                              Explorer: <span className="text-gray-900">{entry.username || "Explorer"}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-gray-900 font-mono">
                              {entry.score.toLocaleString()}
                            </div>
                            <div className="text-[8px] uppercase tracking-wider text-gray-400">pts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-xs font-black text-gray-900 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-[8px] uppercase tracking-wider transition-all"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showLoginModal && (
          <LoginSignup
            onClose={() => setShowLoginModal(false)}
            currentLang={currentLang}
            onSuccess={(name) => {
              setUsername(name);
              localStorage.setItem("plote_username", name);
            }}
            projectId={firebaseConfig.projectId}
          />
        )}

        {showContactModal && (
          <ContactModal
            onClose={() => setShowContactModal(false)}
            currentLang={currentLang}
          />
        )}

        {/* Global Interactive Help & Problem Reporter Modal */}
        {showHelpModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[115] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white text-gray-900 w-full max-w-md p-6 relative border border-gray-250 shadow-2xl rounded-[8px]"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-950" />
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest">{t("helpTitle")}</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowHelpModal(false);
                    setHelpSubmitted(false);
                    setHelpFeedbackText("");
                  }}
                  className="text-gray-500 hover:text-black text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {helpSubmitted ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-gray-900" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{t("submittedTitle")}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold px-2">
                    {t("submittedDesc")}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowHelpModal(false);
                        setHelpSubmitted(false);
                        setHelpFeedbackText("");
                      }}
                      className="text-xs font-black text-white bg-gray-950 hover:bg-black px-6 py-2 rounded-[8px] uppercase tracking-wider transition-all"
                    >
                      {t("done")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {t("helpDesc")}
                  </p>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {t("helpTextareaLabel")}
                    </label>
                    <textarea
                      value={helpFeedbackText}
                      onChange={(e) => setHelpFeedbackText(e.target.value)}
                      placeholder={t("helpPlaceholder")}
                      className="w-full bg-white border border-gray-300 rounded-[8px] px-3 py-2 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-black text-xs font-semibold h-24 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowHelpModal(false);
                        setHelpSubmitted(false);
                        setHelpFeedbackText("");
                      }}
                      className="text-xs font-black text-gray-900 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-[8px] uppercase tracking-wider transition-all"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      onClick={() => {
                        if (helpFeedbackText.trim()) {
                          setHelpSubmitted(true);
                        }
                      }}
                      disabled={!helpFeedbackText.trim()}
                      className="text-xs font-black text-white bg-gray-950 hover:bg-black disabled:opacity-40 disabled:hover:bg-gray-950 px-5 py-2 rounded-[8px] uppercase tracking-wider transition-all"
                    >
                      {t("submitReport")}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Floating Action Button (independent of footer and content flow, fixed position) */}
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40" id="global_floating_help_fab">
          <button
            onClick={() => setShowHelpModal(true)}
            className="bg-white hover:bg-gray-50 text-gray-900 font-extrabold px-4 py-2.5 rounded-[9999px] text-[11px] uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border border-gray-300 select-none"
            id="btn_help_report_floating"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-900 animate-pulse" />
            <span>{t("helpFab")}</span>
          </button>
        </div>
      </AnimatePresence>
    </div>
  );
}
