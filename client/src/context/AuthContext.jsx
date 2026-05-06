import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/portalApi.js';

const STORAGE_KEY = 'credithub-session';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setBooting(false);
        return;
      }

      setBooting(true);

      try {
        const response = await authApi.me(token);
        if (!cancelled) {
          setUser(response.user);
          setBooting(false);
        }
      } catch (error) {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
          setBooting(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem(STORAGE_KEY, response.token);
    setBooting(true);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    setBooting(false);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      booting,
      login,
      logout
    }),
    [booting, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
