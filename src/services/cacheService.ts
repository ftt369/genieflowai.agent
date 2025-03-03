import { ModelType } from '../components/ModelSelector';

interface CacheEntry {
  response: string;
  timestamp: number;
  model: ModelType;
  temperature?: number;
  maxTokens?: number;
}

interface CacheKey {
  type: 'text' | 'chat' | 'image';
  prompt: string;
  messages?: { role: 'user' | 'assistant'; content: string }[];
  imageUrl?: string;
  model: ModelType;
  temperature?: number;
  maxTokens?: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number;

  private constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of entries
    this.ttl = 1000 * 60 * 60; // 1 hour TTL
    this.loadFromStorage();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private generateKey(key: CacheKey): string {
    return JSON.stringify({
      type: key.type,
      prompt: key.prompt,
      messages: key.messages,
      imageUrl: key.imageUrl,
      model: key.model,
      temperature: key.temperature,
      maxTokens: key.maxTokens,
    });
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('model-cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading cache:', error);
      this.cache.clear();
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem('model-cache', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  private cleanup() {
    const now = Date.now();
    let deleted = false;

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        deleted = true;
      }
    }

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      while (entries.length > this.maxSize) {
        const [key] = entries.shift()!;
        this.cache.delete(key);
        deleted = true;
      }
    }

    if (deleted) {
      this.saveToStorage();
    }
  }

  get(key: CacheKey): string | null {
    this.cleanup();
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(cacheKey);
      this.saveToStorage();
      return null;
    }

    return entry.response;
  }

  set(key: CacheKey, response: string): void {
    const cacheKey = this.generateKey(key);
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now(),
      model: key.model,
      temperature: key.temperature,
      maxTokens: key.maxTokens,
    });

    this.cleanup();
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  clearForModel(model: ModelType): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.model === model) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }
}

export const cacheService = CacheService.getInstance(); 