import { ReactElement } from 'react';

import firebase from 'firebase/compat/app';

export type GuardProps = {
  children: ReactElement | null;
};

export type UserProfile = {
  id?: string;
  _id?: string;
  email?: string;
  avatar?: string;
  image?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  tier?: string;
  theme?: 'light' | 'dark';
  language?: string;
  permissions?: string[];
  business?: {
    _id?: string;
    business_name?: string;
  };
};

export type BusinessProfile = {
  _id?: string;
  business_name?: string;
  business_type?: string;
  address?: string;
  logo?: string;
  gst_number?: string;
  currency?: string;
};

export interface AuthProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null;
  business?: BusinessProfile | null;
  token?: string | null;
}

export interface AuthActionProps {
  type: string;
  payload?: AuthProps;
}

export type FirebaseContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  logout: () => Promise<void>;
  login: () => void;
  firebaseRegister: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  firebaseEmailPasswordSignIn: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  firebaseGoogleSignIn: () => Promise<firebase.auth.UserCredential>;
  firebaseTwitterSignIn: () => Promise<firebase.auth.UserCredential>;
  firebaseFacebookSignIn: () => Promise<firebase.auth.UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
};

export type AWSCognitoContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<unknown>;
  resetPassword: (verificationCode: string, newPassword: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
};

export interface InitialLoginContextProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
}

export interface JWTDataProps {
  userId: string;
}

export type JWTContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  business?: BusinessProfile | null | undefined;
  logout: () => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (businessName: string, name: string, phone: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (payload?: Record<string, any>) => Promise<void>;
  updateBusiness: (payload?: Record<string, any>) => Promise<void>;
};

export type Auth0ContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  logout: () => void;
  login: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
};
