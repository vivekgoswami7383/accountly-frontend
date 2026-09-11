import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import chat from './chat';
import calendar from './calendar';
import menu from './menu';
import snackbar from './snackbar';
import productReducer from './product';
import cartReducer from './cart';
import kanban from './kanban';
import invoice from './invoice';
import customers from './accountly/customers';
import transactions from './accountly/transactions';
import dashboard from './accountly/dashboard';
import { RESET_ACCOUNTLY_STATE } from './accountly/resetAction';

export { RESET_ACCOUNTLY_STATE };

const appReducers = combineReducers({
  chat,
  calendar,
  menu,
  snackbar,
  customers,
  transactions,
  dashboard,
  cart: persistReducer(
    {
      key: 'cart',
      storage,
      keyPrefix: 'mantis-ts-'
    },
    cartReducer
  ),
  product: productReducer,
  kanban,
  invoice
});

const reducers = (state: ReturnType<typeof appReducers> | undefined, action: { type: string }) => {
  if (action.type === RESET_ACCOUNTLY_STATE && state) {
    state = { ...state, customers: undefined, transactions: undefined, dashboard: undefined } as any;
  }
  return appReducers(state, action);
};

export default reducers;
