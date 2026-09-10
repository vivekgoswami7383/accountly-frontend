import { createSlice } from '@reduxjs/toolkit';

import axios from 'utils/axios';
import { dispatch } from '../index';

import { ChatStateProps } from 'types/chat';

const initialState: ChatStateProps = {
  error: null,
  chats: [],
  user: {},
  users: []
};

const chat = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    hasError(state, action) {
      state.error = action.payload;
    },

    getUserSuccess(state, action) {
      state.user = action.payload;
    },

    getUserChatsSuccess(state, action) {
      state.chats = action.payload;
    },

    getUsersSuccess(state, action) {
      state.users = action.payload;
    }
  }
});

export default chat.reducer;

export function getUser(id: number) {
  return async () => {
    try {
      const response = await axios.post('/api/chat/users/id', { id });
      dispatch(chat.actions.getUserSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getUserChats(user: string | undefined) {
  return async () => {
    try {
      const response = await axios.post('/api/chat/filter', { user });
      dispatch(chat.actions.getUserChatsSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function insertChat(chat: any) {
  return async () => {
    try {
      await axios.post('/api/chat/insert', chat);
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getUsers() {
  return async () => {
    try {
      const response = await axios.get('/api/chat/users');
      dispatch(chat.actions.getUsersSuccess(response.data.users));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}
