import React, { createContext, useEffect, useReducer } from 'react';
import jwtDecode from 'jwt-decode';
import { LOGIN, LOGOUT } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';
import Loader from 'components/Loader';
import axios from 'utils/axios';
import businessService from 'services/accountly/businessService';
import { KeyedObject } from 'types/root';
import { AuthProps, JWTContextType } from 'types/auth';

const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken: (st: string) => boolean = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  try {
    const decoded: KeyedObject = jwtDecode(serviceToken);
    if (!decoded) return false;
    if (decoded.exp) return decoded.exp > Date.now() / 1000;
    return true;
  } catch {
    return false;
  }
};

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
  } else {
    localStorage.removeItem('serviceToken');
  }
};

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/api/auth/me');
          const { user } = response.data.data;
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { phone, password });
      const { token } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      setSession(token);

      const userResponse = await axios.get('/api/auth/me');
      const { user } = userResponse.data.data;

      if (!user) {
        throw new Error('No user data received from server');
      }

      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (businessName: string, name: string, phone: string, password: string) => {
    await businessService.createBusiness({
      business_name: businessName,
      user: { name, phone, password }
    });
    await login(phone, password);
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email: string) => {};

  const updateProfile = async (payload?: Record<string, any>) => {
    const userId = (state.user as any)?._id || state.user?.id;
    if (!payload || !userId) return;
    const body = {
      name: payload.name ?? state.user?.name ?? '',
      phone: payload.phone ?? state.user?.phone ?? '',
      theme: payload.theme ?? state.user?.theme ?? 'light'
    };
    await axios.patch(`/api/user/${userId}`, body);
    const response = await axios.get('/api/auth/me');
    const { user } = response.data.data;
    dispatch({ type: LOGIN, payload: { isLoggedIn: true, user } });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
