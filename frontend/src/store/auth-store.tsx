import * as React from "react";
import {
  api,
  clearTokens,
  getAccessToken,
  setTokens,
  type AuthUser,
} from "@/services/api";

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUser: (patch: Partial<Pick<AuthUser, "fullName" | "phone" | "profileImage" | "email">>) => Promise<AuthUser>;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getAccessToken()) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }
      try {
        const profile = await api.profile();
        if (!cancelled) setUser(profile);
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = React.useMemo<AuthState>(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user && getAccessToken()),
      login: async (email, password) => {
        const result = await api.login({ email, password });
        setTokens(result.accessToken, result.refreshToken);
        setUser(result.user);
      },
      logout: async () => {
        await api.logout();
        setUser(null);
      },
      refreshProfile: async () => {
        const profile = await api.profile();
        setUser(profile);
      },
      updateUser: async (patch) => {
        const updated = await api.updateProfile(patch);
        setUser(updated);
        return updated;
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
