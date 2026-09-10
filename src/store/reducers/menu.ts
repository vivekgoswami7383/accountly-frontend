import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'utils/axios';
import { MenuProps } from 'types/menu';

const initialState: MenuProps = {
  openItem: ['dashboard'],
  openComponent: 'buttons',
  selectedID: null,
  drawerOpen: false,
  componentDrawerOpen: true,
  menu: {},
  error: null
};

export const fetchMenu = createAsyncThunk('', async () => {
  try {
    const response = await axios.get('/api/menu/dashboard');
    return response.data;
  } catch (error) {
    return {
      id: 'group-dashboard',
      title: 'dashboard',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: 'dashboard',
          type: 'item',
          url: '/dashboard',
          icon: 'dashboard'
        }
      ]
    };
  }
});

const menu = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    activeItem(state, action) {
      state.openItem = action.payload.openItem;
    },

    activeID(state, action) {
      state.selectedID = action.payload;
    },

    activeComponent(state, action) {
      state.openComponent = action.payload.openComponent;
    },

    openDrawer(state, action) {
      state.drawerOpen = action.payload;
    },

    openComponentDrawer(state, action) {
      state.componentDrawerOpen = action.payload.componentDrawerOpen;
    },

    hasError(state, action) {
      state.error = action.payload;
    }
  },

  extraReducers(builder) {
    builder.addCase(fetchMenu.fulfilled, (state, action) => {
      state.menu = action.payload.dashboard;
    });
  }
});

export default menu.reducer;

export const { activeItem, activeComponent, openDrawer, openComponentDrawer, activeID } = menu.actions;
