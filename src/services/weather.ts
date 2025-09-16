const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export interface WeatherData {
  main: string;
  description: string;
  icon: string;
  temperature: number;
}

export async function getWeatherForCity(
  city: string
): Promise<WeatherData | null> {
  try {
    if (!API_KEY) {
      console.error("❌ OpenWeatherMap API key not configured");
      return null;
    }

    const url = `${BASE_URL}?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric&lang=en`;
    console.log("Fetching weather for:", city);

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Weather API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      main: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      temperature: Math.round(data.main.temp),
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

export function getWeatherEmoji(weatherMain: string): string {
  const weatherEmojis: { [key: string]: string } = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️",
    Dust: "🌪️",
    Sand: "🌪️",
    Ash: "🌋",
    Squall: "💨",
    Tornado: "🌪️",
  };

  return weatherEmojis[weatherMain] || "🌤️";
}
