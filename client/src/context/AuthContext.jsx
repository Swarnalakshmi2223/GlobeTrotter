import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = 'globetrotter_token';
const STORAGE_USER_KEY = 'globetrotter_user';

const initialState = {
  user: null,
  token: localStorage.getItem(STORAGE_TOKEN_KEY) || null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem(STORAGE_TOKEN_KEY, action.payload.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
    case 'AUTH_ERROR':
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'UPDATE_USER':
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount, verify stored token with /api/auth/me
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const res = await authAPI.getMe();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user: res.data.user },
        });
      } catch {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await authAPI.signup({ name, email, password });
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    return res.data;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const contextValue = useMemo(
    () => ({
      ...state,
      login,
      signup,
      logout,
      updateUser,
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
