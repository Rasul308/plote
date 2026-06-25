import { City, RoundConfig } from "./types";

export const ORIGIN_COORDS = { lat: 48.0125, lon: 16.5123 }; // A beautiful point near Vienna (approx. 25km southeast)

// Haversine formula to compute great-circle distance between two coordinates in kilometers.
export function getDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const EUROPEAN_CITIES: City[] = [
  // Austria
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738, population: 1950000, alternatives: ["Wien", "Vienne"] },
  { name: "Graz", country: "Austria", lat: 47.0707, lon: 15.4395, population: 290000, alternatives: ["Grac"] },
  { name: "Linz", country: "Austria", lat: 48.3069, lon: 14.2858, population: 205000 },
  { name: "Salzburg", country: "Austria", lat: 47.8095, lon: 13.0550, population: 155000 },

  // Slovakia
  { name: "Bratislava", country: "Slovakia", lat: 48.1486, lon: 17.1077, population: 430000, alternatives: ["Pressburg", "Pozsony"] },
  { name: "Kosice", country: "Slovakia", lat: 48.7164, lon: 21.2611, population: 240000, alternatives: ["Košice", "Kaschau"] },

  // Czechia
  { name: "Prague", country: "Czechia", lat: 50.0755, lon: 14.4378, population: 1335000, alternatives: ["Praha", "Prag"] },
  { name: "Brno", country: "Czechia", lat: 49.1951, lon: 16.6068, population: 380000, alternatives: ["Brünn"] },
  { name: "Ostrava", country: "Czechia", lat: 49.8209, lon: 18.2625, population: 290000, alternatives: ["Ostrau"] },

  // Hungary
  { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402, population: 1750000 },
  { name: "Debrecen", country: "Hungary", lat: 47.5316, lon: 21.6273, population: 200000 },

  // Slovenia
  { name: "Ljubljana", country: "Slovenia", lat: 46.0569, lon: 14.5058, population: 295000, alternatives: ["Laibach"] },

  // Croatia
  { name: "Zagreb", country: "Croatia", lat: 45.8153, lon: 15.9819, population: 810000, alternatives: ["Agram"] },
  { name: "Split", country: "Croatia", lat: 43.5081, lon: 16.4402, population: 180000, alternatives: ["Spalato"] },

  // Bosnia and Herzegovina
  { name: "Sarajevo", country: "Bosnia and Herzegovina", lat: 43.8563, lon: 18.4131, population: 275000 },

  // Serbia
  { name: "Belgrade", country: "Serbia", lat: 44.7872, lon: 20.4573, population: 1375000, alternatives: ["Beograd", "Belgrad"] },
  { name: "Novi Sad", country: "Serbia", lat: 45.2671, lon: 19.8335, population: 250000, alternatives: ["Neusatz"] },

  // Germany
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, population: 3670000 },
  { name: "Munich", country: "Germany", lat: 48.1351, lon: 11.5820, population: 1485000, alternatives: ["München", "Monaco"] },
  { name: "Hamburg", country: "Germany", lat: 53.5511, lon: 9.9937, population: 1850000 },
  { name: "Frankfurt", country: "Germany", lat: 50.1109, lon: 8.6821, population: 760000, alternatives: ["Frankfurt am Main"] },
  { name: "Cologne", country: "Germany", lat: 50.9375, lon: 6.9603, population: 1080000, alternatives: ["Köln"] },
  { name: "Stuttgart", country: "Germany", lat: 48.7758, lon: 9.1829, population: 630000 },
  { name: "Düsseldorf", country: "Germany", lat: 51.2271, lon: 6.7735, population: 620000, alternatives: ["Dusseldorf"] },
  { name: "Dortmund", country: "Germany", lat: 51.5136, lon: 7.4653, population: 585000 },
  { name: "Essen", country: "Germany", lat: 51.4556, lon: 7.0116, population: 580000 },
  { name: "Leipzig", country: "Germany", lat: 51.3397, lon: 12.3731, population: 600000 },
  { name: "Dresden", country: "Germany", lat: 51.0504, lon: 13.7373, population: 555000 },
  { name: "Nuremberg", country: "Germany", lat: 49.4521, lon: 11.0768, population: 515000, alternatives: ["Nürnberg"] },

  // Poland
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122, population: 1795000, alternatives: ["Warszawa", "Varsovie"] },
  { name: "Kraków", country: "Poland", lat: 50.0647, lon: 19.9450, population: 780000, alternatives: ["Krakow", "Cracow", "Krakau"] },
  { name: "Łódź", country: "Poland", lat: 51.7592, lon: 19.4560, population: 680000, alternatives: ["Lodz", "Litzmannstadt"] },
  { name: "Wrocław", country: "Poland", lat: 51.1079, lon: 17.0385, population: 640000, alternatives: ["Wroclaw", "Breslau"] },
  { name: "Poznań", country: "Poland", lat: 52.4064, lon: 16.9252, population: 535000, alternatives: ["Poznan", "Posen"] },
  { name: "Gdańsk", country: "Poland", lat: 54.3520, lon: 18.6464, population: 470000, alternatives: ["Gdansk", "Danzig"] },

  // Ukraine
  { name: "Kyiv", country: "Ukraine", lat: 50.4501, lon: 30.5234, population: 2960000, alternatives: ["Kiev"] },
  { name: "Kharkiv", country: "Ukraine", lat: 49.9935, lon: 36.2304, population: 1430000, alternatives: ["Kharkov"] },
  { name: "Odesa", country: "Ukraine", lat: 46.4825, lon: 30.7233, population: 1015000, alternatives: ["Odessa"] },
  { name: "Lviv", country: "Ukraine", lat: 49.8397, lon: 24.0297, population: 720000, alternatives: ["Lemberg", "Lvov"] },
  { name: "Dnipro", country: "Ukraine", lat: 48.4647, lon: 35.0462, population: 970000, alternatives: ["Dnepropetrovsk"] },

  // Romania
  { name: "Bucharest", country: "Romania", lat: 44.4268, lon: 26.1025, population: 1830000, alternatives: ["Bucuresti", "Bukarest"] },
  { name: "Cluj-Napoca", country: "Romania", lat: 46.7712, lon: 23.6236, population: 325000, alternatives: ["Cluj", "Klausenburg"] },
  { name: "Timișoara", country: "Romania", lat: 45.7537, lon: 21.2257, population: 320000, alternatives: ["Timisoara", "Temeswar"] },
  { name: "Iași", country: "Romania", lat: 47.1585, lon: 27.6014, population: 290000, alternatives: ["Iasi", "Jassy"] },

  // Italy
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964, population: 2870000, alternatives: ["Roma", "Rome"] },
  { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.1900, population: 1395000, alternatives: ["Milano", "Mailand"] },
  { name: "Naples", country: "Italy", lat: 40.8518, lon: 14.2681, population: 960000, alternatives: ["Napoli", "Neapel"] },
  { name: "Turin", country: "Italy", lat: 45.0703, lon: 7.6869, population: 870000, alternatives: ["Torino", "Turijn"] },
  { name: "Palermo", country: "Italy", lat: 38.1157, lon: 13.3615, population: 660000 },
  { name: "Genoa", country: "Italy", lat: 44.4056, lon: 8.9463, population: 575000, alternatives: ["Genova", "Genua"] },
  { name: "Bologna", country: "Italy", lat: 44.4949, lon: 11.3426, population: 390000 },
  { name: "Florence", country: "Italy", lat: 43.7696, lon: 11.2558, population: 380000, alternatives: ["Firenze", "Florenz"] },
  { name: "Venice", country: "Italy", lat: 45.4408, lon: 12.3155, population: 260000, alternatives: ["Venezia", "Venedig"] },

  // France
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, population: 2160000, alternatives: ["Lutetia"] },
  { name: "Marseille", country: "France", lat: 43.2965, lon: 5.3698, population: 870000 },
  { name: "Lyon", country: "France", lat: 45.7640, lon: 4.8357, population: 515000 },
  { name: "Toulouse", country: "France", lat: 43.6047, lon: 1.4442, population: 490000 },
  { name: "Nice", country: "France", lat: 43.7102, lon: 7.2620, population: 340000, alternatives: ["Nizza"] },
  { name: "Nantes", country: "France", lat: 47.2184, lon: -1.5536, population: 310000 },
  { name: "Strasbourg", country: "France", lat: 48.5734, lon: 7.7521, population: 285000, alternatives: ["Straßburg"] },

  // United Kingdom
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, population: 8980000, alternatives: ["Londres"] },
  { name: "Birmingham", country: "United Kingdom", lat: 52.4862, lon: -1.8904, population: 1140000 },
  { name: "Glasgow", country: "United Kingdom", lat: 55.8642, lon: -4.2518, population: 635000 },
  { name: "Manchester", country: "United Kingdom", lat: 53.4808, lon: -2.2426, population: 550000 },
  { name: "Leeds", country: "United Kingdom", lat: 53.8008, lon: -1.5491, population: 790000 },
  { name: "Liverpool", country: "United Kingdom", lat: 53.4084, lon: -2.9916, population: 500000 },

  // Ireland
  { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603, population: 545000, alternatives: ["Baile Átha Cliath"] },

  // Spain
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, population: 3265000 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lon: 2.1734, population: 1620000 },
  { name: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3774, population: 800000 },
  { name: "Seville", country: "Spain", lat: 37.3891, lon: -5.9845, population: 690000, alternatives: ["Sevilla"] },
  { name: "Zaragoza", country: "Spain", lat: 41.6488, lon: -0.8891, population: 675000, alternatives: ["Saragossa"] },
  { name: "Málaga", country: "Spain", lat: 36.7213, lon: -4.4214, population: 575000, alternatives: ["Malaga"] },

  // Belgium
  { name: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517, population: 1210000, alternatives: ["Bruxelles", "Brussel"] },
  { name: "Antwerp", country: "Belgium", lat: 51.2194, lon: 4.4025, population: 530000, alternatives: ["Antwerpen", "Anvers"] },

  // Netherlands
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041, population: 870000 },
  { name: "Rotterdam", country: "Netherlands", lat: 51.9244, lon: 4.4777, population: 650000 },
  { name: "The Hague", country: "Netherlands", lat: 52.0705, lon: 4.3007, population: 515000, alternatives: ["Den Haag", "Gravenhage"] },

  // Switzerland
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417, population: 415000, alternatives: ["Zürich"] },
  { name: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432, population: 200000, alternatives: ["Genève", "Genf"] },

  // Belarus
  { name: "Minsk", country: "Belarus", lat: 53.9006, lon: 27.5590, population: 2010000, alternatives: ["Miensk"] },

  // Baltics
  { name: "Vilnius", country: "Lithuania", lat: 54.6872, lon: 25.2797, population: 580000, alternatives: ["Wilna"] },
  { name: "Riga", country: "Latvia", lat: 56.9496, lon: 24.1052, population: 630000, alternatives: ["Rīga"] },
  { name: "Tallinn", country: "Estonia", lat: 59.4370, lon: 24.7535, population: 430000, alternatives: ["Reval"] },

  // Nordics
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686, population: 975000 },
  { name: "Gothenburg", country: "Sweden", lat: 57.7089, lon: 11.9746, population: 580000, alternatives: ["Göteborg"] },
  { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522, population: 690000, alternatives: ["Christiania"] },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683, population: 630000, alternatives: ["København", "Kopenhagen"] },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384, population: 655000, alternatives: ["Helsingfors"] },

  // Portugal
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393, population: 545000, alternatives: ["Lisboa"] },
  { name: "Porto", country: "Portugal", lat: 41.1579, lon: -8.6291, population: 215000, alternatives: ["Oporto"] },

  // Greece
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275, population: 664000, alternatives: ["Athina", "Athen"] },

  // Bulgaria
  { name: "Sofia", country: "Bulgaria", lat: 42.6977, lon: 23.3219, population: 1240000, alternatives: ["Sofiya"] },

  // Turkey
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784, population: 15400000, alternatives: ["İstanbul", "Constantinople", "Byzantium"] },

  // Russia & Urals (European)
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, population: 12500000, alternatives: ["Moskva", "Moskau"] },
  { name: "Saint Petersburg", country: "Russia", lat: 59.9343, lon: 30.3351, population: 5350000, alternatives: ["St. Petersburg", "Leningrad", "Petrograd", "Sankt-Peterburg"] },
  { name: "Yekaterinburg", country: "Russia", lat: 56.8389, lon: 60.6057, population: 1495000, alternatives: ["Ekaterinburg", "Sverdlovsk"] },
  { name: "Perm", country: "Russia", lat: 58.0104, lon: 56.2502, population: 1050000 },
  { name: "Ufa", country: "Russia", lat: 54.7388, lon: 55.9721, population: 1130000 },
  { name: "Samara", country: "Russia", lat: 53.2028, lon: 50.1340, population: 1160000, alternatives: ["Kuibyshev"] },
  { name: "Kazan", country: "Russia", lat: 55.7887, lon: 49.1221, population: 1250000 },
  { name: "Nizhny Novgorod", country: "Russia", lat: 56.2965, lon: 44.0041, population: 1250000, alternatives: ["Gorky"] },
  { name: "Rostov-on-Don", country: "Russia", lat: 47.2357, lon: 39.7015, population: 1140000, alternatives: ["Rostov"] },
  { name: "Volgograd", country: "Russia", lat: 48.7080, lon: 44.5133, population: 1010000, alternatives: ["Stalingrad"] },
  { name: "Voronezh", country: "Russia", lat: 51.6608, lon: 39.2003, population: 1050000 },

  // Iceland
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426, population: 130000, alternatives: ["Reykjavík"] },

  // Azores (Portugal)
  { name: "Ponta Delgada", country: "Portugal", lat: 37.7412, lon: -25.6756, population: 68000 }
];

// Round config increments by exactly 200km per round, up to 4000km to cover Azores to Urals
export const ROUNDS_CONFIG: RoundConfig[] = Array.from({ length: 20 }, (_, i) => ({
  number: i + 1,
  minRadiusKM: i * 200,
  maxRadiusKM: (i + 1) * 200
}));

// Resolves a user's typed name against the database using case-insensitive, trimmed lookup.
export function findCityByName(inputName: string): City | undefined {
  const norm = inputName.trim().toLowerCase();
  if (!norm) return undefined;
  
  return EUROPEAN_CITIES.find(city => {
    if (city.name.toLowerCase() === norm) return true;
    if (city.alternatives?.some(alt => alt.toLowerCase() === norm)) return true;
    return false;
  });
}

// Find all cities in a specific distance band from the starting origin coords.
export function getCitiesInBand(minKM: number, maxKM: number): City[] {
  return EUROPEAN_CITIES.filter(city => {
    const dist = getDistanceKM(ORIGIN_COORDS.lat, ORIGIN_COORDS.lon, city.lat, city.lon);
    return dist > minKM && dist <= maxKM;
  });
}
