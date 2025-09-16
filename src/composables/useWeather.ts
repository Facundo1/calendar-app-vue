import { ref, computed, readonly } from "vue";
import {
  getWeatherForCity,
  formatWeatherDisplay,
  WeatherServiceError,
} from "../services/weather";
import type { WeatherCache, WeatherCacheState } from "../types";

const weatherCache = ref<WeatherCache>({});
const pendingRequests = ref<Record<string, Promise<string | undefined>>>({});

const CACHE_EXPIRY_MS = 10 * 60 * 1000; 
const MAX_CACHE_SIZE = 100; 

interface CacheEntry {
  data: string | null;
  timestamp: number;
}

const enhancedCache = ref<Record<string, CacheEntry>>({});

function normalizeCityName(city: string): string {
  return city.toLowerCase().trim().replace(/\s+/g, " ");
}


function isCacheEntryValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_EXPIRY_MS;
}

function manageCacheSize(): void {
  const entries = Object.entries(enhancedCache.value);

  if (entries.length <= MAX_CACHE_SIZE) return;

  const sortedEntries = entries
    .sort(([, a], [, b]) => a.timestamp - b.timestamp)
    .slice(0, entries.length - MAX_CACHE_SIZE);

  sortedEntries.forEach(([key]) => {
    delete enhancedCache.value[key];
  });
}

export function useWeather() {

  async function getWeatherWithCache(
    cityName: string
  ): Promise<string | undefined> {
    if (!cityName || typeof cityName !== "string" || !cityName.trim()) {
      return undefined;
    }

    const normalizedCity = normalizeCityName(cityName);

    const cacheEntry = enhancedCache.value[normalizedCity];
    if (cacheEntry && isCacheEntryValid(cacheEntry)) {
      return cacheEntry.data || undefined;
    }

    const pendingRequest = pendingRequests.value[normalizedCity];
    if (pendingRequest) {
      try {
        return await pendingRequest;
      } catch (error) {
        delete pendingRequests.value[normalizedCity];
      }
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
      const weatherData = await getWeatherForCity(normalizedCity);
      const weatherString = weatherData
        ? formatWeatherDisplay(weatherData)
        : null;

      enhancedCache.value[normalizedCity] = {
        data: weatherString,
        timestamp: Date.now(),
      };

      weatherCache.value[normalizedCity] = weatherString;

      manageCacheSize();

      return weatherString || undefined;
    } catch (error) {
      if (error instanceof WeatherServiceError) {
        console.warn(
          `Weather service error for "${normalizedCity}": ${error.message}`
        );

        enhancedCache.value[normalizedCity] = {
          data: null,
          timestamp: Date.now(),
        };

        weatherCache.value[normalizedCity] = null;
        return undefined;
      }

      console.error(
        `Unexpected error fetching weather for "${normalizedCity}":`,
        error
      );

      return undefined;
    }
  }


  function clearWeatherCache(): void {
    weatherCache.value = {};
    enhancedCache.value = {};

    Object.keys(pendingRequests.value).forEach((key) => {
      delete pendingRequests.value[key];
    });
  }


  function clearExpiredCache(): void {

    Object.entries(enhancedCache.value).forEach(([city, entry]) => {
      if (!isCacheEntryValid(entry)) {
        delete enhancedCache.value[city];
        delete weatherCache.value[city];
      }
    });
  }


  function getWeatherCacheState(): WeatherCacheState {
    return {
      cache: { ...weatherCache.value },
      pending: Object.keys(pendingRequests.value),
    };
  }

  function getCacheStats() {
    const entries = Object.values(enhancedCache.value);
    const validEntries = entries.filter(isCacheEntryValid);
    const successfulEntries = validEntries.filter(
      (entry) => entry.data !== null
    );

    return {
      totalEntries: entries.length,
      validEntries: validEntries.length,
      successfulEntries: successfulEntries.length,
      pendingRequests: Object.keys(pendingRequests.value).length,
      cacheHitRate:
        entries.length > 0 ? validEntries.length / entries.length : 0,
    };
  }

  async function preloadWeatherData(cities: string[]): Promise<void> {
    const promises = cities
      .filter((city) => city && city.trim())
      .map((city) => getWeatherWithCache(city).catch(() => undefined));

    await Promise.allSettled(promises);
  }

  const cacheSize = computed(() => Object.keys(enhancedCache.value).length);
  const pendingRequestsCount = computed(
    () => Object.keys(pendingRequests.value).length
  );

  if (typeof window !== "undefined") {
    const cleanupInterval = setInterval(clearExpiredCache, 5 * 60 * 1000); // Every 5 minutes

    window.addEventListener("beforeunload", () => {
      clearInterval(cleanupInterval);
    });
  }

  return {
    getWeatherWithCache,
    clearWeatherCache,
    clearExpiredCache,
    preloadWeatherData,
    getWeatherCacheState,
    getCacheStats,

    cacheSize: readonly(cacheSize),
    pendingRequestsCount: readonly(pendingRequestsCount),
  };
}
