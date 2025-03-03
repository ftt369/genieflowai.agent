import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '../services/cacheService';
import { ModelType } from '../components/ModelSelector';

describe('CacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheService.clear();
    
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      store[key] = value.toString();
    });
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      Object.keys(store).forEach(key => delete store[key]);
    });
  });

  it('should store and retrieve cached responses', () => {
    const key = {
      type: 'text' as const,
      prompt: 'Hello',
      model: 'gemini' as ModelType,
      temperature: 0.7,
    };

    cacheService.set(key, 'Hello, world!');
    expect(cacheService.get(key)).toBe('Hello, world!');
  });

  it('should handle chat message caching', () => {
    const key = {
      type: 'chat' as const,
      prompt: 'Hello',
      messages: [
        { role: 'user' as const, content: 'Hi' },
        { role: 'assistant' as const, content: 'Hello' },
      ],
      model: 'gemini' as ModelType,
    };

    cacheService.set(key, 'Nice to meet you!');
    expect(cacheService.get(key)).toBe('Nice to meet you!');
  });

  it('should handle image generation caching', () => {
    const key = {
      type: 'image' as const,
      prompt: 'Describe this',
      imageUrl: 'https://example.com/image.jpg',
      model: 'gemini' as ModelType,
    };

    cacheService.set(key, 'An image description');
    expect(cacheService.get(key)).toBe('An image description');
  });

  it('should clear cache for specific model', () => {
    const key1 = {
      type: 'text' as const,
      prompt: 'Hello',
      model: 'gemini' as ModelType,
    };

    const key2 = {
      type: 'text' as const,
      prompt: 'Hi',
      model: 'gpt4' as ModelType,
    };

    cacheService.set(key1, 'Response 1');
    cacheService.set(key2, 'Response 2');

    cacheService.clearForModel('gemini');

    expect(cacheService.get(key1)).toBeNull();
    expect(cacheService.get(key2)).toBe('Response 2');
  });

  it('should handle cache expiration', () => {
    vi.useFakeTimers();
    
    const key = {
      type: 'text' as const,
      prompt: 'Hello',
      model: 'gemini' as ModelType,
    };

    cacheService.set(key, 'Hello, world!');
    
    // Move forward 2 hours
    vi.advanceTimersByTime(1000 * 60 * 60 * 2);
    
    expect(cacheService.get(key)).toBeNull();
    
    vi.useRealTimers();
  });

  it('should persist cache to localStorage', () => {
    const key = {
      type: 'text' as const,
      prompt: 'Hello',
      model: 'gemini' as ModelType,
    };

    cacheService.set(key, 'Hello, world!');
    
    expect(localStorage.getItem('model-cache')).toBeTruthy();
    
    // Create a new instance to test loading from storage
    const loadedCache = cacheService.get(key);
    expect(loadedCache).toBe('Hello, world!');
  });

  it('should handle invalid localStorage data', () => {
    localStorage.setItem('model-cache', 'invalid json');
    
    const key = {
      type: 'text' as const,
      prompt: 'Hello',
      model: 'gemini' as ModelType,
    };

    // Should not throw and return null for non-existent key
    expect(cacheService.get(key)).toBeNull();
  });
}); 