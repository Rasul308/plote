import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ArrowRight, RefreshCw, ChevronLeft, Map, Check, X } from "lucide-react";

// Types
interface EraOption {
  id: "ancient" | "medieval" | "early-modern" | "modern";
  name: string;
  range: string;
  description: string;
}

interface EmpireQuestion {
  territoryName: string;
  territoryDesc: string;
  bounds: [[number, number], [number, number]]; // Leaflet rectangle bounds: [southwest, northeast]
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface EmpireBuilderGameProps {
  onFinishGame: (finalScore: number, gameId: string) => void;
  onBackToMenu: () => void;
  currentLang: "en" | "ru" | "uz";
}

// 4 ERA OPTIONS DATA
const ERA_OPTIONS: EraOption[] = [
  {
    id: "ancient",
    name: "Ancient Era",
    range: "3000 BC – 500 AD",
    description: "Cradles of civilization, massive Pharaoh domains, and the rise of Rome and Carthage."
  },
  {
    id: "medieval",
    name: "Medieval Era",
    range: "500 – 1500 AD",
    description: "Feudal kingdoms, Viking expansions, Crusader factions, and Silk Road Caliphates."
  },
  {
    id: "early-modern",
    name: "Early Modern Era",
    range: "1500 – 1800 AD",
    description: "Global maritime empires, the Renaissance expansion, Gunpowder Empires, and Age of Sail."
  },
  {
    id: "modern",
    name: "Modern Era",
    range: "1800 – 1950 AD",
    description: "Colonial divisions, industrial expansions, world coalitions, and early global border shifts."
  }
];

// PLACEHOLDER QUESTIONS DATA PER ERA (10 questions each)
const QUESTIONS_BY_ERA: Record<EraOption["id"], EmpireQuestion[]> = {
  ancient: [
    {
      territoryName: "The Nile Delta and Levant",
      territoryDesc: "A prosperous agrarian empire focused around agricultural expansion on the Nile River and Levant trade routes.",
      bounds: [[24.0, 30.0], [32.0, 35.0]],
      options: ["New Kingdom of Egypt", "Assyrian Empire", "Hittite Empire", "Carthage"],
      correctAnswerIndex: 0,
      explanation: "The New Kingdom of Egypt reached the peak of its geographical extent during the 15th century BC, controlling territory from modern Sudan to southern Syria."
    },
    {
      territoryName: "The Italian Peninsula and Mediterranean Coasts",
      territoryDesc: "A expansive maritime and terrestrial hegemon centered in central Italy, controlling all Mediterranean sea lanes.",
      bounds: [[35.0, -5.0], [45.0, 25.0]],
      options: ["Roman Empire", "Macedonian Empire", "Persian Empire", "Phoenicia"],
      correctAnswerIndex: 0,
      explanation: "At its height in 117 AD under Trajan, the Roman Empire spanned from Britannia to Egypt, enclosing the Mediterranean Sea as 'Mare Nostrum' (Our Sea)."
    },
    {
      territoryName: "Mesopotamia and the Iranian Plateau",
      territoryDesc: "An expansive iron-age state centering in modern Iran and conquering Babylon, Lydia, and Egypt.",
      bounds: [[28.0, 44.0], [40.0, 60.0]],
      options: ["Achaemenid Empire (Persia)", "Neo-Babylonian Empire", "Sumerian City States", "Seleucid Empire"],
      correctAnswerIndex: 0,
      explanation: "Cyrus the Great founded the Achaemenid Empire, which ruled over the largest percentage of the world's population of any empire in history."
    },
    {
      territoryName: "The Yellow River and Yangtze Basins",
      territoryDesc: "The very first imperial dynasty to unify the warring factions of early East Asia.",
      bounds: [[30.0, 105.0], [38.0, 120.0]],
      options: ["Qin Dynasty", "Han Dynasty", "Zhou Dynasty", "Shang Dynasty"],
      correctAnswerIndex: 0,
      explanation: "Under Qin Shi Huang, the Qin Dynasty unified China in 221 BC, standardizing script, currency, and building early defensive walls."
    },
    {
      territoryName: "The Indus Valley and Ganges Basins",
      territoryDesc: "An expansive ancient subcontinental empire known for promoting Buddhism and peaceful cultural edicts.",
      bounds: [[20.0, 70.0], [30.0, 88.0]],
      options: ["Maurya Empire", "Gupta Empire", "Kushan Empire", "Mughal Empire"],
      correctAnswerIndex: 0,
      explanation: "The Maurya Empire, particularly under Emperor Ashoka, ruled almost the entire Indian subcontinent with a state philosophy of non-violence."
    },
    {
      territoryName: "The Peloponnese and Aegean Sea",
      territoryDesc: "A powerful, militaristic city-state league dominating the southern Greek peninsula.",
      bounds: [[36.5, 21.0], [38.0, 24.0]],
      options: ["Spartan Hegemony", "Athenian Empire", "Theban League", "Kingdom of Macedon"],
      correctAnswerIndex: 0,
      explanation: "Sparta was the dominant military land power of ancient Greece, famously triumphing over Athens in the Peloponnesian War."
    },
    {
      territoryName: "The North African Coast and Iberia",
      territoryDesc: "A powerful Phoenician mercantile civilization dominating Western Mediterranean trade routes.",
      bounds: [[34.0, 5.0], [38.0, 15.0]],
      options: ["Carthaginian Empire", "Numidian Kingdom", "Roman Republic", "Garamantes"],
      correctAnswerIndex: 0,
      explanation: "Carthage was a dominant trade power that fought Rome in the three historic Punic Wars before its complete destruction in 146 BC."
    },
    {
      territoryName: "The Anatolian Highlands and Levant North",
      territoryDesc: "An advanced Bronze Age civilization famous for early iron forging and chariot warfare.",
      bounds: [[37.0, 30.0], [41.0, 37.0]],
      options: ["Hittite Empire", "Phrygian Kingdom", "Lydian Empire", "Mitanni Kingdom"],
      correctAnswerIndex: 0,
      explanation: "The Hittites were formidable rivals of Ancient Egypt, culminating in the Battle of Kadesh, history's largest chariot clash."
    },
    {
      territoryName: "Central Mesopotamia",
      territoryDesc: "One of the world's earliest urban civilizations, famous for cuneiform writing and massive ziggurat temples.",
      bounds: [[30.0, 45.0], [33.0, 48.0]],
      options: ["Sumerian Civilization", "Akkadian Empire", "Babylonian Empire", "Assyrian Empire"],
      correctAnswerIndex: 0,
      explanation: "Sumerians established city-states like Uruk and Ur around 4000 BC, inventing early mathematical bases and agricultural irrigation."
    },
    {
      territoryName: "Central Andes Highlands",
      territoryDesc: "An early South American civilization known for its intricate temple complexes and monumental stone masonry.",
      bounds: [[-12.0, -78.0], [-8.0, -74.0]],
      options: ["Chavín Culture", "Inca Empire", "Moche Civilization", "Wari Empire"],
      correctAnswerIndex: 0,
      explanation: "The Chavín culture developed in the high Andes from 900 BC to 200 BC, influencing subsequent Andean religions and textiles."
    }
  ],
  medieval: [
    {
      territoryName: "The Eurasian Steppe from Hungary to Sea of Japan",
      territoryDesc: "The largest contiguous land empire in human history, forged by swift nomadic horse archer coalitions.",
      bounds: [[40.0, 40.0], [55.0, 120.0]],
      options: ["Mongol Empire", "Gokturk Khaganate", "Russian Empire", "Golden Horde"],
      correctAnswerIndex: 0,
      explanation: "Genghis Khan unified the nomadic tribes in 1206, launching conquests that stretched from Eastern Europe to China."
    },
    {
      territoryName: "The Eastern Roman Provinces (Balkans and Anatolia)",
      territoryDesc: "The Greek-speaking continuation of the Roman Empire that survived through the Middle Ages, centered at Constantinople.",
      bounds: [[35.0, 20.0], [42.0, 35.0]],
      options: ["Byzantine Empire", "Holy Roman Empire", "Ottoman Empire", "Kingdom of Greece"],
      correctAnswerIndex: 0,
      explanation: "The Byzantine Empire preserved Roman legal traditions and culture, serving as a buffer state until its fall in 1453."
    },
    {
      territoryName: "Arabian Peninsula and Levant",
      territoryDesc: "An expansive caliphate under the descendants of the Prophet Muhammad's uncle, ushering in an Islamic Golden Age.",
      bounds: [[15.0, 35.0], [35.0, 48.0]],
      options: ["Abbasid Caliphate", "Umayyad Caliphate", "Fatimid Caliphate", "Ayyubid Dynasty"],
      correctAnswerIndex: 0,
      explanation: "Centered in Baghdad, the Abbasid Caliphate championed scientific translations, algebra, and classical philosophy."
    },
    {
      territoryName: "Central Europe and Northern Italy",
      territoryDesc: "A complex multi-ethnic confederation of elective states, crowned by the Pope as the restoration of western Rome.",
      bounds: [[45.0, 6.0], [54.0, 18.0]],
      options: ["Holy Roman Empire", "Frankish Kingdom", "Austrian Empire", "Kingdom of France"],
      correctAnswerIndex: 0,
      explanation: "Founded by Charlemagne and later Otto I, this loose empire existed for over a millennium until its dissolution in 1806."
    },
    {
      territoryName: "The Mesoamerican Valley of Mexico",
      territoryDesc: "A powerful triple alliance of city-states practicing complex agriculture, hydraulics, and central ritual worship.",
      bounds: [[15.0, -102.0], [21.0, -95.0]],
      options: ["Aztec Empire", "Mayan Civilization", "Zapotec Empire", "Toltec State"],
      correctAnswerIndex: 0,
      explanation: "The Aztec Empire dominated central Mexico from Tenochtitlan until the Spanish conquest led by Hernán Cortés in 1521."
    },
    {
      territoryName: "Central Andes Mountains",
      territoryDesc: "The largest pre-Columbian empire in the Americas, linked by high-altitude stone roads and terrace agriculture.",
      bounds: [[-20.0, -75.0], [0.0, -65.0]],
      options: ["Inca Empire", "Chimu Kingdom", "Tiwanaku Empire", "Wari Empire"],
      correctAnswerIndex: 0,
      explanation: "Tawantinsuyu (The Inca Empire) coordinated millions of subjects using a centralized record system of knotted strings called quipus."
    },
    {
      territoryName: "The Scandinavian Peninsula and Baltic Sea",
      territoryDesc: "Seafaring Norse raiders and merchants who colonized coastal Europe, Iceland, and reached North America.",
      bounds: [[55.0, 5.0], [65.0, 20.0]],
      options: ["Viking Kingdoms", "Danish Empire", "Sweden", "Hanseatic League"],
      correctAnswerIndex: 0,
      explanation: "Norse mariners expanded heavily between the 8th and 11th centuries, trading as far as Baghdad and settling in Kiev."
    },
    {
      territoryName: "Southern Indochina and Mekong River",
      territoryDesc: "A highly advanced agrarian empire centered around the sprawling, monumental complex of Angkor.",
      bounds: [[10.0, 102.0], [15.0, 106.0]],
      options: ["Khmer Empire", "Champa Kingdom", "Sukhothai Kingdom", "Dai Viet"],
      correctAnswerIndex: 0,
      explanation: "The Khmer Empire constructed Angkor Wat, the world's largest single religious monument, powered by intricate baray reservoirs."
    },
    {
      territoryName: "The Deccan Plateau and Southern India",
      territoryDesc: "A powerful maritime empire dominating Indian Ocean trade lanes, invading Sumatra and Sri Lanka.",
      bounds: [[8.0, 75.0], [14.0, 81.0]],
      options: ["Chola Dynasty", "Pandyan Empire", "Vijayanagara Empire", "Rashtrakuta Dynasty"],
      correctAnswerIndex: 0,
      explanation: "The medieval Chola Dynasty reached its zenith under Rajaraja I, projecting naval power deep into Southeast Asia."
    },
    {
      territoryName: "The West African Savannah (Niger Bend)",
      territoryDesc: "An early wealthy medieval empire controlling the trans-Saharan trade of gold, salt, and manuscripts.",
      bounds: [[12.0, -8.0], [18.0, 2.0]],
      options: ["Mali Empire", "Ghana Empire", "Songhai Empire", "Kingdom of Benin"],
      correctAnswerIndex: 0,
      explanation: "The Mali Empire consolidated regional trade networks, establishing Timbuktu as a preeminent Islamic university town."
    }
  ],
  "early-modern": [
    {
      territoryName: "The Iberian Peninsula and Central/South America",
      territoryDesc: "The world's first global empire, possessing massive mining wealth in Potosí and trade lanes across the Pacific.",
      bounds: [[-40.0, -80.0], [25.0, -40.0]],
      options: ["Spanish Empire", "Portuguese Empire", "British Empire", "French Empire"],
      correctAnswerIndex: 0,
      explanation: "Spain's silver fleets funded European conflicts, establishing colonization networks that spanned five continents."
    },
    {
      territoryName: "Anatolia, Levant, Egypt, and North Africa",
      territoryDesc: "An Islamic superpower bridging East and West, establishing Constantinople as its central administrative capital.",
      bounds: [[20.0, 25.0], [45.0, 45.0]],
      options: ["Ottoman Empire", "Safavid Empire", "Mamluk Sultanate", "Seljuk Empire"],
      correctAnswerIndex: 0,
      explanation: "The Ottoman Empire controlled Mediterranean trade routes for centuries, reaching its height under Suleiman the Magnificent."
    },
    {
      territoryName: "The Indian Subcontinent",
      territoryDesc: "A rich early modern gunpowder empire famous for monumental Indo-Persian architecture, including the Taj Mahal.",
      bounds: [[10.0, 70.0], [30.0, 90.0]],
      options: ["Mughal Empire", "Maratha Empire", "Delhi Sultanate", "Sikh Empire"],
      correctAnswerIndex: 0,
      explanation: "Established by Babur in 1526, the Mughal Empire presided over an incredibly wealthy state, unifying most of India."
    },
    {
      territoryName: "The East Asian Qing Domain",
      territoryDesc: "The last imperial dynasty of China, ruled by Manchu clans and expanding borders into Tibet, Xinjiang, and Mongolia.",
      bounds: [[25.0, 95.0], [45.0, 125.0]],
      options: ["Qing Dynasty", "Ming Dynasty", "Yuan Dynasty", "Song Dynasty"],
      correctAnswerIndex: 0,
      explanation: "The Qing Dynasty presided over a highly populated, prosperous empire before encountering western pressure in the 19th century."
    },
    {
      territoryName: "The Iranian Plateau",
      territoryDesc: "A powerful Shia state that revitalized Persian national identity and engaged in fierce rivalry with the Ottomans.",
      bounds: [[25.0, 45.0], [38.0, 62.0]],
      options: ["Safavid Empire", "Afsharid Dynasty", "Qajar Dynasty", "Timurid Empire"],
      correctAnswerIndex: 0,
      explanation: "Shah Ismail I declared Shia Islam the state religion of the Safavid Empire, triggering a cultural renaissance in Isfahan."
    },
    {
      territoryName: "Eastern Europe and Siberia",
      territoryDesc: "A massive, expanding land empire stretching from the Baltic Sea to the Pacific Ocean, modernized under Peter the Great.",
      bounds: [[50.0, 30.0], [70.0, 130.0]],
      options: ["Russian Empire", "Polish-Lithuanian Commonwealth", "Swedish Empire", "Ottoman Empire"],
      correctAnswerIndex: 0,
      explanation: "Peter the Great established St. Petersburg as a 'window to Europe', formalizing the modern Russian Empire in 1721."
    },
    {
      territoryName: "The Japanese Archipelago",
      territoryDesc: "A strict feudal military government that closed its borders to foreigners, ushering in the peaceful Edo period.",
      bounds: [[31.0, 130.0], [43.0, 142.0]],
      options: ["Tokugawa Shogunate", "Ashikaga Shogunate", "Kamakura Shogunate", "Meiji Government"],
      correctAnswerIndex: 0,
      explanation: "Tokugawa Ieyasu unified Japan at the Battle of Sekigahara, establishing an era of strict isolationism (Sakoku)."
    },
    {
      territoryName: "North American Great Lakes and Mississippi",
      territoryDesc: "A vast North American territory focused on fur trading alliances with indigenous tribes, called 'New France'.",
      bounds: [[29.0, -92.0], [48.0, -71.0]],
      options: ["French Colonial Empire", "British Empire", "Spanish Empire", "Dutch West India Company"],
      correctAnswerIndex: 0,
      explanation: "France claimed vast inland waterways of North America before conceding most territories to Britain in the Seven Years' War."
    },
    {
      territoryName: "The Baltic Coast and Scandinavia",
      territoryDesc: "A highly disciplined northern military power that dominated Baltic trade in the 17th century.",
      bounds: [[55.0, 12.0], [62.0, 22.0]],
      options: ["Swedish Empire", "Danish Kingdom", "Polish Kingdom", "Russian Empire"],
      correctAnswerIndex: 0,
      explanation: "During the Deluge and Thirty Years' War, Sweden projected dominant military power across northern Europe."
    },
    {
      territoryName: "Eastern Europe (Poland & Lithuania)",
      territoryDesc: "A unique dual-state federal monarchy known for its religious tolerance and influential noble democracy.",
      bounds: [[48.0, 18.0], [55.0, 28.0]],
      options: ["Polish-Lithuanian Commonwealth", "Prussian Kingdom", "Russian Empire", "Habsburg Monarchy"],
      correctAnswerIndex: 0,
      explanation: "The Union of Lublin in 1569 formally merged Poland and Lithuania, creating a massive, culturally diverse federation."
    }
  ],
  modern: [
    {
      territoryName: "The British Isles, Indian Raj, and African Colonies",
      territoryDesc: "The largest global empire in history, famously described as 'the empire on which the sun never sets'.",
      bounds: [[-35.0, -120.0], [55.0, 140.0]], // Enormous global bounds
      options: ["British Empire", "French Colonial Empire", "German Empire", "Dutch Empire"],
      correctAnswerIndex: 0,
      explanation: "Following victory in the Napoleonic Wars, Great Britain became the dominant global industrial, financial, and maritime power."
    },
    {
      territoryName: "Indochina and North/West Africa",
      territoryDesc: "A massive modern colonial empire centered on intensive administrative rule in Algeria, Senegal, and Southeast Asia.",
      bounds: [[5.0, -15.0], [50.0, 105.0]],
      options: ["French Colonial Empire", "Belgian Empire", "Italian Empire", "Portuguese Empire"],
      correctAnswerIndex: 0,
      explanation: "During the 19th-century 'Scramble for Africa', France consolidated enormous territorial holdings across the continent."
    },
    {
      territoryName: "Central Europe (Austria and Hungary)",
      territoryDesc: "A powerful dual monarchy ruling over diverse linguistic groups, whose heir's assassination sparked World War I.",
      bounds: [[45.0, 10.0], [50.0, 26.0]],
      options: ["Austria-Hungary", "German Empire", "Russian Empire", "Kingdom of Prussia"],
      correctAnswerIndex: 0,
      explanation: "Established in the Compromise of 1867, Austria-Hungary was a major European power until its dissolution in 1918."
    },
    {
      territoryName: "North America (The Fifty States)",
      territoryDesc: "A federal republic that expanded rapidly across North America, emerging as a major global power after World War II.",
      bounds: [[24.0, -125.0], [49.0, -66.0]],
      options: ["United States of America", "Canada", "Mexican Republic", "Confederate States"],
      correctAnswerIndex: 0,
      explanation: "Through purchases, treaties, and industrialization, the USA transformed from thirteen colonies into a global superpower."
    },
    {
      territoryName: "Eurasia (Soviet Republics)",
      territoryDesc: "The world's first socialist federal state, emerging from the ruins of the Russian Empire to fight a global Cold War.",
      bounds: [[40.0, 30.0], [75.0, 140.0]],
      options: ["Soviet Union (USSR)", "Russian Empire", "People's Republic of China", "Eastern Bloc"],
      correctAnswerIndex: 0,
      explanation: "Established in 1922 following the Bolshevik Revolution, the USSR was a central superpower opposing the United States."
    },
    {
      territoryName: "The German Lands",
      territoryDesc: "A highly militarized state forged by Otto von Bismarck following victorious conflicts with Austria and France.",
      bounds: [[47.0, 6.0], [55.0, 19.0]],
      options: ["German Empire", "Prussian Kingdom", "Austrian Empire", "Weimar Republic"],
      correctAnswerIndex: 0,
      explanation: "The unification of Germany in 1871 fundamentally altered the balance of power in continental Europe, accelerating industrial competition."
    },
    {
      territoryName: "The Indonesian Archipelago",
      territoryDesc: "A wealthy colonial domain established by a joint-stock company and subsequently administered by the European state.",
      bounds: [[-10.0, 95.0], [5.0, 140.0]],
      options: ["Dutch East Indies", "Spanish Philippines", "British Malaya", "Portuguese Timor"],
      correctAnswerIndex: 0,
      explanation: "The Dutch East India Company (VOC) initiated trade monopoly controls, which the Netherlands nationalized in 1800."
    },
    {
      territoryName: "Central Africa (The Congo Basin)",
      territoryDesc: "A brutal, highly exploitative private colony belonging to a European monarch before being transferred to the state.",
      bounds: [[-10.0, 12.0], [5.0, 30.0]],
      options: ["Congo Free State (Belgian)", "French Equatorial Africa", "Portuguese Angola", "German East Africa"],
      correctAnswerIndex: 0,
      explanation: "King Leopold II of Belgium ruled the Congo Free State as a private business venture, causing tragic population decline before international outcry forced state transfer."
    },
    {
      territoryName: "The Balkan Peninsula and Black Sea Coast",
      territoryDesc: "A declining early modern empire known as the 'sick man of Europe' during the 19th century as borders receded.",
      bounds: [[38.0, 22.0], [44.0, 35.0]],
      options: ["Late Ottoman Empire", "Kingdom of Greece", "Bulgarian Tsardom", "Kingdom of Serbia"],
      correctAnswerIndex: 0,
      explanation: "The Ottoman Empire lost massive European territories during the Balkan Wars, leading to its post-WWI reorganization into modern Turkey."
    },
    {
      territoryName: "The East Asian Isles",
      territoryDesc: "A rapidly modernizing Asian state that launched militaristic expansion across the Pacific before 1945.",
      bounds: [[20.0, 120.0], [45.0, 145.0]],
      options: ["Empire of Japan", "Qing China", "Korean Empire", "Republic of China"],
      correctAnswerIndex: 0,
      explanation: "Following the Meiji Restoration, Japan industrialized swiftly, conquering Taiwan, Korea, and parts of mainland China."
    }
  ]
};

const POINTS_PER_CORRECT = 1000;

export default function EmpireBuilderGame({
  onFinishGame,
  onBackToMenu,
  currentLang = "en"
}: EmpireBuilderGameProps) {
  // Navigation states
  const [activeEra, setActiveEra] = useState<EraOption["id"] | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [answersLog, setAnswersLog] = useState<{
    round: number;
    question: EmpireQuestion;
    selectedText: string;
    correctText: string;
    isCorrect: boolean;
  }[]>([]);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.Rectangle | null>(null);

  // Filter questions based on active era selection
  const eraQuestions = activeEra ? QUESTIONS_BY_ERA[activeEra] : [];
  const currentQuestion = eraQuestions[currentRoundIndex];

  // Initialize map when era is chosen and rounds progress
  useEffect(() => {
    if (!activeEra || isGameOver || !mapContainerRef.current) return;

    // Remove old maps if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize Leaflet map
    const leafletMap = L.map(mapContainerRef.current, {
      center: [25.0, 0.0],
      zoom: 2,
      zoomControl: false,
      minZoom: 1,
      maxZoom: 8,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: false
    });

    L.control.zoom({ position: "topright" }).addTo(leafletMap);

    // Warm gray neutral cartridge tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(leafletMap);

    mapRef.current = leafletMap;

    // Draw the red semi-transparent bounding territory overlay box
    if (currentQuestion) {
      const bounds = L.latLngBounds(currentQuestion.bounds);
      const rectangle = L.rectangle(bounds, {
        color: "#111827",
        weight: 1.5,
        fillColor: "#111827",
        fillOpacity: 0.22,
        dashArray: "3, 3"
      }).addTo(leafletMap);

      overlayRef.current = rectangle;

      // Pan & zoom map automatically to encapsulate bounds perfectly
      leafletMap.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        overlayRef.current = null;
      }
    };
  }, [activeEra, currentRoundIndex, isGameOver]);

  const handleSelectEra = (eraId: EraOption["id"]) => {
    setActiveEra(eraId);
    setCurrentRoundIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setCumulativeScore(0);
    setIsGameOver(false);
    setAnswersLog([]);
  };

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;

    setIsSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      setCumulativeScore((prev) => prev + POINTS_PER_CORRECT);
    }

    // Highlight bounding box green or red after submission
    if (mapRef.current && overlayRef.current) {
      overlayRef.current.setStyle({
        color: isCorrect ? "#10b981" : "#ef4444",
        fillColor: isCorrect ? "#10b981" : "#ef4444",
        fillOpacity: 0.28
      });
    }

    setAnswersLog((prev) => [
      ...prev,
      {
        round: currentRoundIndex + 1,
        question: currentQuestion,
        selectedText: currentQuestion.options[selectedOption],
        correctText: currentQuestion.options[currentQuestion.correctAnswerIndex],
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);

    if (currentRoundIndex + 1 < eraQuestions.length) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handleResetToEraSelection = () => {
    setActiveEra(null);
    setCurrentRoundIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setCumulativeScore(0);
    setIsGameOver(false);
    setAnswersLog([]);
  };

  const totalCorrect = answersLog.filter((ans) => ans.isCorrect).length;

  return (
    <div className="w-full flex flex-col gap-6" id="empire_builder_wrapper">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3" id="eb_top_nav">
        <button
          onClick={activeEra ? handleResetToEraSelection : onBackToMenu}
          className="flex items-center gap-1 bg-white hover:bg-gray-100 p-2 rounded-[6px] border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 transition-all cursor-pointer"
          id="btn_eb_back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{activeEra ? "Back to Eras" : "Exit Game"}</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block">QUIZ GAME TYPE</span>
          <span className="text-[10px] sm:text-xs font-black text-gray-900 uppercase">Which empire controlled the territory?</span>
        </div>
      </div>

      {/* STAGE 1: ERA SELECTION SCREEN */}
      <AnimatePresence mode="wait">
        {!activeEra && (
          <motion.div
            key="era_selection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full space-y-6"
            id="eb_era_select_screen"
          >
            <div className="text-left max-w-xl">
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight">
                Select an Empire Era
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Choose an era to explore. All ten coordinate-based questions will be drawn exclusively from that epoch's empire boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="eb_eras_grid">
              {ERA_OPTIONS.map((era) => (
                <motion.button
                  whileHover={{ y: -3, borderColor: "rgb(17, 24, 39)" }}
                  whileTap={{ scale: 0.98 }}
                  key={era.id}
                  onClick={() => handleSelectEra(era.id)}
                  className="bg-white border border-gray-200 rounded-[12px] p-5 text-left flex flex-col justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-all shadow-xs group min-h-[140px]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-gray-950 uppercase group-hover:underline">
                        {era.name}
                      </h3>
                      <span className="text-[9px] font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-[4px] border border-gray-200">
                        {era.range}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                      {era.description}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase text-gray-400 tracking-widest block self-end">
                    Launch Era →
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STAGE 2: RUNNING GAMEPLAY SCREEN */}
        {activeEra && !isGameOver && (
          <motion.div
            key="gameplay_running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            id="eb_running_grid"
          >
            
            {/* Map Reference & Question prompt area (65%) */}
            <div className="lg:col-span-8 flex flex-col gap-4" id="eb_map_section">
              
              {/* Question Text Prompt banner */}
              <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm" id="eb_prompt_card">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                    ROUND {currentRoundIndex + 1} OF {eraQuestions.length}
                  </span>
                  <span className="text-[8px] font-mono font-black text-gray-950 bg-gray-100 border border-gray-200 px-1.5 py-0.2 rounded uppercase">
                    {ERA_OPTIONS.find(e => e.id === activeEra)?.name}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-tight">
                  Which empire or civilization controlled this highlighted territory?
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Description: {currentQuestion.territoryDesc}
                </p>
              </div>

              {/* Bounding Box Map Display */}
              <div className="relative w-full h-[320px] md:h-[380px] bg-gray-100 rounded-[12px] border border-gray-250 overflow-hidden shadow-inner" id="eb_map_box">
                <div ref={mapContainerRef} className="w-full h-full z-0" />
                <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-xs text-white border border-white/10 px-3 py-1.5 rounded-[6px] text-[10px] font-mono font-bold uppercase tracking-widest pointer-events-none select-none">
                  🗺️ Bounding box territory overlay
                </div>
              </div>

            </div>

            {/* Answer Cards Sidebar controls (35%) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4" id="eb_sidebar_section">
              <div className="bg-white border border-gray-250 rounded-[12px] p-5 shadow-sm flex flex-col justify-between h-full min-h-[360px]">
                
                <div className="space-y-4">
                  
                  {/* Performance stats headers */}
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-2.5 rounded-[8px] select-none">
                    <div>
                      <span className="text-[8px] text-gray-400 font-mono block">RUNNING SCORE</span>
                      <strong className="text-sm font-mono font-black text-gray-950">{cumulativeScore}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 font-mono block text-right font-bold">ERA TOTALS</span>
                      <strong className="text-sm font-mono font-bold text-gray-950 block text-right">
                        {currentRoundIndex + 1}/{eraQuestions.length}
                      </strong>
                    </div>
                  </div>

                  {/* Four Selection Option cards */}
                  <div className="space-y-2" id="eb_multiple_choices">
                    {currentQuestion.options.map((opt, idx) => {
                      const isThisSelected = selectedOption === idx;
                      const isCorrect = idx === currentQuestion.correctAnswerIndex;
                      const isWrongSelection = isThisSelected && !isCorrect;

                      let btnStyle = "bg-white border-gray-200 hover:border-gray-500 text-gray-900";
                      if (isThisSelected) {
                        btnStyle = "bg-gray-100 border-gray-900 text-gray-950";
                      }
                      if (isSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20";
                        } else if (isWrongSelection) {
                          btnStyle = "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20";
                        } else {
                          btnStyle = "bg-white border-gray-200 text-gray-300 opacity-50";
                        }
                      }

                      return (
                        <motion.button
                          whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3.5 rounded-[8px] border text-xs font-black uppercase tracking-wider flex items-center justify-between group transition-all ${btnStyle} ${!isSubmitted ? "cursor-pointer" : "cursor-default"}`}
                        >
                          <span className="max-w-[85%]">{opt}</span>
                          <div className="shrink-0 flex items-center justify-center">
                            {isSubmitted && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            {isSubmitted && isWrongSelection && <X className="w-3.5 h-3.5 text-rose-600" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Post-answer description contextual explanations */}
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 border border-gray-200 p-3 rounded-[8px] text-left text-[11px]"
                      id="eb_explanation_panel"
                    >
                      <strong className="block text-gray-400 font-mono text-[8px] tracking-widest uppercase mb-1">
                        HISTORICAL CONTEXT
                      </strong>
                      <p className="text-gray-600 font-semibold leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}

                </div>

                {/* Confirm / Next Level navigators */}
                <div className="pt-4 border-t border-gray-150 mt-4">
                  {!isSubmitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedOption === null}
                      className="w-full bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      id="btn_eb_confirm"
                    >
                      {selectedOption === null ? "Choose Option" : "Confirm Answer"}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      id="btn_eb_next"
                    >
                      <span>
                        {currentRoundIndex + 1 === eraQuestions.length ? "Finish Era Campaign" : "Next Region"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            </div>

          </motion.div>
        )}

        {/* STAGE 3: GAME OVER CAMPAIGN SUMMARY */}
        {activeEra && isGameOver && (
          <motion.div
            key="game_over_campaign"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto bg-white border border-gray-250 rounded-[16px] p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative z-20"
            id="eb_summary_block"
          >
            <div className="relative mb-5">
              <div className="relative w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                <Trophy className="w-8 h-8 text-gray-950" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight mb-1">
              Campaign Complete!
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-6">
              EMPIRE CONTROL PERFORMANCE SHEET
            </p>

            <div className="grid grid-cols-2 gap-3 w-full text-center border-t border-b border-gray-200 py-6 mb-6">
              <div>
                <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                  COMBINED SCORE
                </span>
                <strong className="text-xl font-mono font-black text-gray-950">
                  {cumulativeScore}
                </strong>
              </div>
              <div>
                <span className="block text-[8px] text-gray-400 font-mono uppercase tracking-widest mb-1">
                  ACCURACY RATE
                </span>
                <strong className="text-xl font-mono font-black text-gray-950">
                  {totalCorrect} / {eraQuestions.length}
                </strong>
              </div>
            </div>

            {/* Historical Answers Log list */}
            <div className="w-full text-left space-y-2 max-h-[180px] overflow-y-auto pr-1 mb-6" id="eb_rounds_log">
              <h4 className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mb-2">
                Regional Campaigns History
              </h4>
              {answersLog.map((log) => (
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
                    <span className="text-gray-950 mt-0.5 truncate leading-tight block">
                      Region: {log.question.territoryName}
                    </span>
                  </div>
                  <span className="text-xs font-black text-gray-900 font-mono">
                    {log.isCorrect ? `+${POINTS_PER_CORRECT}` : "0"}
                  </span>
                </div>
              ))}
            </div>

            {/* Trigger actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full" id="eb_end_actions">
              <button
                onClick={() => onFinishGame(cumulativeScore, `Which empire controlled the territory? - ${activeEra}`)}
                className="w-full sm:flex-1 bg-gray-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer text-center font-bold"
                id="btn_eb_save"
              >
                Submit & Save Score
              </button>
              <button
                onClick={handleResetToEraSelection}
                className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs font-black uppercase tracking-wider py-3.5 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 font-bold"
                id="btn_eb_retry"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Play Another Era</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
