import { createContext, useContext, useState } from 'react';
import { api} from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ttm_user')) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('ttm_token') || null
  );

  const [loading, setLoading] = useState(false);

  

  // =========================================
  // LOGIN
  // =========================================

  const login = async (email, password) => {

    setLoading(true);

    try {

      const data = await api.post('/auth/login', {
        email,
        password,
      });

      const t = data.token;

      const u = data.user;

      // FORCE NORMALIZED ROLE

      const normalizedUser = {
        ...u,
        role:
          u.role === 'admin'
            ? 'Admin'
            : u.role === 'member'
            ? 'Member'
            : u.role,
      };

      localStorage.setItem('ttm_token', t);

      localStorage.setItem(
        'ttm_user',
        JSON.stringify(normalizedUser)
      );

      setToken(t);

      setUser(normalizedUser);

      return normalizedUser;

    } finally {

      setLoading(false);

    }

  };

  // =========================================
  // SIGNUP
  // =========================================

  const signup = async (name, email, password) => {

    setLoading(true);

    try {

      const data = await api.post('/auth/signup', {
        name,
        email,
        password,
      });

      return data;

    } finally {

      setLoading(false);

    }

  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {

    localStorage.removeItem('ttm_token');

    localStorage.removeItem('ttm_user');

    setToken(null);

    setUser(null);

  };

  return (

    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>

  );

}

export const useAuth = () => useContext(AuthContext);