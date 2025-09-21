'use client';

/**
 * A type-safe utility for interacting with the browser's localStorage.
 * This module is marked with 'use client' because localStorage is a
 * browser-only API and is not available on the server.
 */

/**
 * Retrieves an item from localStorage and parses it as JSON.
 * @param {string} key The key of the item to retrieve.
 * @returns {T | null} The retrieved and parsed item, or null if the item
 * doesn't exist, localStorage is unavailable, or parsing fails.
 */
export function getStorageItem<T>(key: string): T | null {
  // Check if localStorage is available (ensures code doesn't break on the server).
  if (typeof window === 'undefined' ||!window.localStorage) {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    // If the item doesn't exist, return null. Otherwise, parse it.
    return item? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return null;
  }
}

/**
 * Saves an item to localStorage after stringifying it.
 * @param {string} key The key under which to store the item.
 * @param {T} value The value to store. Can be any JSON-serializable type.
 * @returns {void}
 */
export function setStorageItem<T>(key: string, value: T): void {
  // Check if localStorage is available.
  if (typeof window === 'undefined' ||!window.localStorage) {
    console.warn(`localStorage is not available. Could not set item for key "${key}".`);
    return;
  }

  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
}