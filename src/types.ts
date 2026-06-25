export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  population: number;
  alternatives?: string[];
}

export interface RoundConfig {
  number: number;
  minRadiusKM: number;
  maxRadiusKM: number;
}

export interface GuessResult {
  roundNumber: number;
  guessedCityName: string;
  guessedCity?: City;
  correctCity: City;
  pointsEarned: number;
  maxRadiusKM: number;
}
