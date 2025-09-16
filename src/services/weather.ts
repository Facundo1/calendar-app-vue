import type { WeatherData } from "../types";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const REQUEST_TIMEOUT = 5000; // 5 seconds

interface OpenWeatherMapResponse {
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  name: string;
  cod: number;
  message?: string;
}


export class WeatherServiceError extends Error {
  public readonly code?: string | number;

  constructor(message: string, code?: string | number) {
    super(message);
    this.name = "WeatherServiceError";
    this.code = code;
  }
}


function validateCityName(city: string): boolean {
  return (
    typeof city === "string" &&
    city.trim().length > 0 &&
    city.trim().length <= 100
  );
}


function createWeatherApiUrl(city: string): string {
  const params = new URLSearchParams({
    q: city.trim(),
    appid: API_KEY!,
    units: "metric",
    lang: "en",
  });

  return `${BASE_URL}?${params.toString()}`;
}


async function fetchWithTimeout(
  url: string,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}


function transformWeatherData(apiData: OpenWeatherMapResponse): WeatherData {
  if (!apiData.weather?.[0] || !apiData.main) {
    throw new WeatherServiceError("Invalid weather data structure");
  }

  return {
    main: apiData.weather[0].main,
    description: apiData.weather[0].description,
    icon: apiData.weather[0].icon,
    temperature: Math.round(apiData.main.temp),
  };
}


export async function getWeatherForCity(
  city: string
): Promise<WeatherData | null> {
  try {
    // Validate inputs
    if (!validateCityName(city)) {
      throw new WeatherServiceError("Invalid city name provided");
    }

    if (!API_KEY) {
      console.warn(
        "OpenWeatherMap API key not configured. Weather data will not be available."
      );
      return null;
    }

    const url = createWeatherApiUrl(city);
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`City "${city}" not found`);
        return null;
      }

      if (response.status === 401) {
        throw new WeatherServiceError("Invalid API key", 401);
      }

      if (response.status === 429) {
        throw new WeatherServiceError("API rate limit exceeded", 429);
      }

      throw new WeatherServiceError(
        `Weather API error: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const apiData: OpenWeatherMapResponse = await response.json();

    if (apiData.cod && apiData.cod !== 200) {
      throw new WeatherServiceError(
        apiData.message || `API error code: ${apiData.cod}`,
        apiData.cod
      );
    }

    return transformWeatherData(apiData);
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      console.error("Weather service error:", error.message);
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("Network error fetching weather data");
      return null;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Weather request timeout");
      return null;
    }

    console.error("Unexpected error fetching weather:", error);
    return null;
  }
}

const WEATHER_EMOJIS: Readonly<Record<string, string>> = {
  Clear: "☀️",

  Clouds: "☁️",

  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Sleet: "🌨️",

  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🌫️",

  Dust: "🌪️",
  Sand: "🌪️",
  Ash: "🌋",
  Squall: "💨",
  Tornado: "🌪️",

  default: "🌤️",
} as const;


export function getWeatherEmoji(weatherMain: string): string {
  if (!weatherMain || typeof weatherMain !== "string") {
    return WEATHER_EMOJIS.default;
  }

  return WEATHER_EMOJIS[weatherMain] || WEATHER_EMOJIS.default;
}


export function formatWeatherDisplay(weatherData: WeatherData): string {
  const emoji = getWeatherEmoji(weatherData.main);
  return `${emoji} ${weatherData.description} ${weatherData.temperature}°C`;
}
