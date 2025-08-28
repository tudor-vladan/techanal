export interface StoredAIPreferences {
  model: string;
  temperature: number;
  maxTokens: number;
}

const AI_PREFERENCES_KEY = 'ai-preferences';

export function getStoredAIPreferences(): StoredAIPreferences {
  try {
    const raw = localStorage.getItem(AI_PREFERENCES_KEY);
    if (!raw) {
      return { model: 'gpt-4-turbo', temperature: 0.7, maxTokens: 2000 };
    }
    const parsed = JSON.parse(raw) as StoredAIPreferences;
    return {
      model: parsed?.model ?? 'gpt-4-turbo',
      temperature: typeof parsed?.temperature === 'number' ? parsed.temperature : 0.7,
      maxTokens: typeof parsed?.maxTokens === 'number' ? parsed.maxTokens : 2000,
    };
  } catch {
    return { model: 'gpt-4-turbo', temperature: 0.7, maxTokens: 2000 };
  }
}

export function setStoredAIPreferences(prefs: StoredAIPreferences): void {
  try {
    localStorage.setItem(AI_PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // no-op
  }
}


