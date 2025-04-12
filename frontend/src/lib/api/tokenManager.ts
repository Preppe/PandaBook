/**
 * TokenManager: Handles access and refresh token storage/retrieval.
 * Uses localStorage/sessionStorage or in-memory fallback for SSR.
 * No hardcoded secrets or env vars.
 * Modular and testable.
 */

export interface TokenPair {
  accessToken: string | null;
  refreshToken: string | null;
}

class TokenManager {
  private accessKey = 'accessToken';
  private refreshKey = 'refreshToken';
  private memoryTokens: TokenPair = { accessToken: null, refreshToken: null };

  // Use localStorage if available, otherwise fallback to memory (SSR-safe)
  private get storage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      // SSR or restricted
    }
    return null;
  }

  getAccessToken(): string | null {
    const storage = this.storage;
    if (storage) {
      return storage.getItem(this.accessKey);
    }
    return this.memoryTokens.accessToken;
  }

  setAccessToken(token: string | null) {
    const storage = this.storage;
    if (storage) {
      if (token) storage.setItem(this.accessKey, token);
      else storage.removeItem(this.accessKey);
    } else {
      this.memoryTokens.accessToken = token;
    }
  }

  getRefreshToken(): string | null {
    const storage = this.storage;
    if (storage) {
      return storage.getItem(this.refreshKey);
    }
    return this.memoryTokens.refreshToken;
  }

  setRefreshToken(token: string | null) {
    const storage = this.storage;
    if (storage) {
      if (token) storage.setItem(this.refreshKey, token);
      else storage.removeItem(this.refreshKey);
    } else {
      this.memoryTokens.refreshToken = token;
    }
  }

  clearTokens() {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }

  getTokens(): TokenPair {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
  }

  setTokens(tokens: TokenPair) {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
  }
}

const tokenManager = new TokenManager();
export default tokenManager;