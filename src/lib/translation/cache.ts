import { TranslationCache } from "./languages.ts";

// Simple in-memory cache
class TranslationCacheManager {
  private cache: TranslationCache = {};
  private maxCacheSize = 1000;
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate cache key from text and language pair
   */
  private getCacheKey(text: string, from: string, to: string): string {
    return `${from}_${to}_${text.length}_${this.hashString(text)}`;
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get cached translation
   */
  get(text: string, from: string, to: string): string | null {
    const key = this.getCacheKey(text, from, to);
    const cached = this.cache[key];

    if (!cached) return null;

    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.cacheDuration) {
      delete this.cache[key];
      return null;
    }

    return cached.result;
  }

  /**
   * Set cache entry
   */
  set(text: string, from: string, to: string, result: string): void {
    const key = this.getCacheKey(text, from, to);

    // Simple cache eviction if too large
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      const oldestKey = Object.entries(this.cache).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      )[0][0];
      delete this.cache[oldestKey];
    }

    this.cache[key] = {
      result,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache = {};
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return Object.keys(this.cache).length;
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: Object.keys(this.cache).length,
      maxSize: this.maxCacheSize,
      entries: Object.keys(this.cache).length,
    };
  }
}

export const translationCache = new TranslationCacheManager();