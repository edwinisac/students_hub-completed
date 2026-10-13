import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("studenthub_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem("studenthub_token")).finally(()=>setLoading(false));
  }, []);
  async function login(email,password) {
    const { data } = await api.post("/auth/login",{email,password});
    localStorage.setItem("studenthub_token",data.token); setUser(data.user); return data.user;
  }
  function logout() { localStorage.removeItem("studenthub_token"); setUser(null); }
  return <AuthContext.Provider value={{user,loading,login,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
