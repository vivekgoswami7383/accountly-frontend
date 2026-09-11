import { REGISTER, LOGIN, LOGOUT } from './actions';

import { AuthProps, AuthActionProps } from 'types/auth';

export const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  business: null
};

const auth = (state = initialState, action: AuthActionProps) => {
  switch (action.type) {
    case REGISTER: {
      const { user, business } = action.payload!;
      return {
        ...state,
        user,
        business
      };
    }
    case LOGIN: {
      const { user, business } = action.payload!;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user,
        business
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null,
        business: null
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
