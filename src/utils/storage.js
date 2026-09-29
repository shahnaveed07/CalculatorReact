/**
 * Local storage abstraction with in-memory fallback for private browsing or restricted environments.
 */

const STORAGE_KEYS = {
  HISTORY: 'calculator_history_v1',
  ANGLE_MODE: 'calculator_angle_mode_v1',
  SCIENTIFIC_OPEN: 'calculator_scientific_open_v1',
  MEMORY: 'calculator_memory_v1',
};

const memoryFallback = {};

/**
 * Checks if localStorage is available and working.
 */
function isStorageAvailable() {
  try {
    const testKey = '__test_storage__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const canUseStorage = typeof window !== 'undefined' && isStorageAvailable();

export function getStoredHistory() {
  try {
    let rawList = [];
    if (canUseStorage) {
      const data = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
      rawList = data ? JSON.parse(data) : [];
    } else {
      rawList = memoryFallback[STORAGE_KEYS.HISTORY] || [];
    }

    if (!Array.isArray(rawList)) {
      return [];
    }

    // Ensure every loaded history item has a guaranteed unique ID
    const seenIds = new Set();
    return rawList.map((item, idx) => {
      let uniqueId = item?.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `${item?.timestamp || Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`;
      }
      seenIds.add(uniqueId);
      return {
        ...item,
        id: uniqueId,
      };
    });
  } catch {
    return [];
  }
}

export function saveStoredHistory(historyList) {
  try {
    // Keep max 50 recent items to preserve storage
    const trimmed = (historyList || []).slice(0, 50);
    if (canUseStorage) {
      window.localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
    } else {
      memoryFallback[STORAGE_KEYS.HISTORY] = trimmed;
    }
  } catch {
    // Ignore storage quota or security errors
  }
}

export function getStoredAngleMode() {
  try {
    if (canUseStorage) {
      const mode = window.localStorage.getItem(STORAGE_KEYS.ANGLE_MODE);
      return mode === 'RAD' ? 'RAD' : 'DEG';
    }
    return memoryFallback[STORAGE_KEYS.ANGLE_MODE] || 'DEG';
  } catch {
    return 'DEG';
  }
}

export function saveStoredAngleMode(mode) {
  try {
    const validMode = mode === 'RAD' ? 'RAD' : 'DEG';
    if (canUseStorage) {
      window.localStorage.setItem(STORAGE_KEYS.ANGLE_MODE, validMode);
    } else {
      memoryFallback[STORAGE_KEYS.ANGLE_MODE] = validMode;
    }
  } catch {
    // Ignore
  }
}

export function getStoredScientificOpen() {
  try {
    if (canUseStorage) {
      const val = window.localStorage.getItem(STORAGE_KEYS.SCIENTIFIC_OPEN);
      return val !== null ? val === 'true' : true; // Default open on desktop
    }
    return memoryFallback[STORAGE_KEYS.SCIENTIFIC_OPEN] !== undefined
      ? memoryFallback[STORAGE_KEYS.SCIENTIFIC_OPEN]
      : true;
  } catch {
    return true;
  }
}

export function saveStoredScientificOpen(isOpen) {
  try {
    if (canUseStorage) {
      window.localStorage.setItem(STORAGE_KEYS.SCIENTIFIC_OPEN, String(Boolean(isOpen)));
    } else {
      memoryFallback[STORAGE_KEYS.SCIENTIFIC_OPEN] = Boolean(isOpen);
    }
  } catch {
    // Ignore
  }
}

export function getStoredMemory() {
  try {
    if (canUseStorage) {
      const val = window.localStorage.getItem(STORAGE_KEYS.MEMORY);
      const parsed = parseFloat(val);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return memoryFallback[STORAGE_KEYS.MEMORY] || 0;
  } catch {
    return 0;
  }
}

export function saveStoredMemory(memVal) {
  try {
    const num = Number(memVal) || 0;
    if (canUseStorage) {
      window.localStorage.setItem(STORAGE_KEYS.MEMORY, String(num));
    } else {
      memoryFallback[STORAGE_KEYS.MEMORY] = num;
    }
  } catch {
    // Ignore
  }
}
