import { ref } from "vue";
import { getWeatherForCity } from "../services/weather";

const weatherCache = ref<{ [city: string]: string | null }>({});
const pendingRequests = ref<{ [city: string]: Promise<string | undefined> }>(
  {}
);

export function useWeather() {
  async function getWeatherWithCache(
    cityName: string
  ): Promise<string | undefined> {
    if (!cityName.trim()) return undefined;

    const normalizedCity = cityName.toLowerCase().trim();

    if (weatherCache.value[normalizedCity] !== undefined) {
      return weatherCache.value[normalizedCity] || undefined;
    }

    if (await pendingRequests.value[normalizedCity]) {
      return await pendingRequests.value[normalizedCity];
    }

    const request = fetchAndCacheWeather(normalizedCity);
    pendingRequests.value[normalizedCity] = request;

    try {
      const result = await request;
      return result;
    } finally {
      delete pendingRequests.value[normalizedCity];
    }
  }

  async function fetchAndCacheWeather(
    normalizedCity: string
  ): Promise<string | undefined> {
    try {
      const weather = await getWeatherForCity(normalizedCity);
      const weatherString = weather
        ? `${weather.description} ${Math.round(weather.temperature)}°C`
        : null;

      weatherCache.value[normalizedCity] = weatherString;

      return weatherString || undefined;
    } catch (error) {
      console.error("Error getting weather:", error);
      weatherCache.value[normalizedCity] = null;
      return undefined;
    }
  }

  function clearWeatherCache() {
    weatherCache.value = {};
    pendingRequests.value = {};
  }

  function getWeatherCacheState() {
    return {
      cache: { ...weatherCache.value },
      pending: Object.keys(pendingRequests.value),
    };
  }

  return {
    getWeatherWithCache,
    clearWeatherCache,
    getWeatherCacheState,
  };
}
