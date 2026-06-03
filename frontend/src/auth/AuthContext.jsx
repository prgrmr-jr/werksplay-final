import { createContext, useContext, useEffect, useState } from "react";
import { getCsrfToken, getMe, login as apiLogin, logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);   // null = not loaded yet
  const [loading, setLoading] = useState(true);   // true while checking session

  useEffect(() => {
    // 1. Ensure the csrftoken cookie exists (Django sets it on this GET)
    // 2. Then check if there's already a valid session
    getCsrfToken()
      .then(() => getMe())
      .then((r) => setUser(r.data))
      .catch(() => setUser(false))   // false = confirmed unauthenticated
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    // Re-fetch full user object so is_staff is populated
    const me = await getMe();
    setUser(me.data);
    return res;
  };

  const logout = async () => {
    await apiLogout().catch(() => {});
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
