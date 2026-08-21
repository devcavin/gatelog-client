const ACCESS_TOKEN_KEY = import.meta.env.VITE_PRIVATE_ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = import.meta.env.VITE_PRIVATE_REFRESH_TOKEN_KEY;

export const tokenStorage = {
  getAccess: (): string | null =>
    localStorage.getItem(ACCESS_TOKEN_KEY),

  getRefresh: (): string | null =>
    localStorage.getItem(REFRESH_TOKEN_KEY),

  set: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};