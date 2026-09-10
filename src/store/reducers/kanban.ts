import { createSlice } from '@reduxjs/toolkit';

import axios from 'utils/axios';
import { dispatch } from '../index';

import { KanbanStateProps, KanbanColumn, KanbanComment, KanbanItem, KanbanUserStory } from 'types/kanban';

const initialState: KanbanStateProps = {
  error: null,
  columns: [],
  columnsOrder: [],
  comments: [],
  items: [],
  profiles: [],
  selectedItem: false,
  userStory: [],
  userStoryOrder: []
};

const slice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    hasError(state, action) {
      state.error = action.payload;
    },

    addColumnSuccess(state, action) {
      state.columns = action.payload.columns;
      state.columnsOrder = action.payload.columnsOrder;
    },

    editColumnSuccess(state, action) {
      state.columns = action.payload.columns;
    },

    updateColumnOrderSuccess(state, action) {
      state.columnsOrder = action.payload.columnsOrder;
    },

    deleteColumnSuccess(state, action) {
      state.columns = action.payload.columns;
      state.columnsOrder = action.payload.columnsOrder;
    },

    addItemSuccess(state, action) {
      state.items = action.payload.items;
      state.columns = action.payload.columns;
      state.userStory = action.payload.userStory;
    },

    editItemSuccess(state, action) {
      state.items = action.payload.items;
      state.columns = action.payload.columns;
      state.userStory = action.payload.userStory;
    },

    updateColumnItemOrderSuccess(state, action) {
      state.columns = action.payload.columns;
    },

    selectItemSuccess(state, action) {
      state.selectedItem = action.payload.selectedItem;
    },

    addItemCommentSuccess(state, action) {
      state.items = action.payload.items;
      state.comments = action.payload.comments;
    },

    deleteItemSuccess(state, action) {
      state.items = action.payload.items;
      state.columns = action.payload.columns;
      state.userStory = action.payload.userStory;
    },

    addStorySuccess(state, action) {
      state.userStory = action.payload.userStory;
      state.userStoryOrder = action.payload.userStoryOrder;
    },

    editStorySuccess(state, action) {
      state.userStory = action.payload.userStory;
    },

    updateStoryOrderSuccess(state, action) {
      state.userStoryOrder = action.payload.userStoryOrder;
    },

    updateStoryItemOrderSuccess(state, action) {
      state.userStory = action.payload.userStory;
    },

    addStoryCommentSuccess(state, action) {
      state.userStory = action.payload.userStory;
      state.comments = action.payload.comments;
    },

    deleteStorySuccess(state, action) {
      state.userStory = action.payload.userStory;
      state.userStoryOrder = action.payload.userStoryOrder;
    },

    getColumnsSuccess(state, action) {
      state.columns = action.payload;
    },

    getColumnsOrderSuccess(state, action) {
      state.columnsOrder = action.payload;
    },

    getCommentsSuccess(state, action) {
      state.comments = action.payload;
    },

    getProfilesSuccess(state, action) {
      state.profiles = action.payload;
    },

    getItemsSuccess(state, action) {
      state.items = action.payload;
    },

    getUserStorySuccess(state, action) {
      state.userStory = action.payload;
    },

    getUserStoryOrderSuccess(state, action) {
      state.userStoryOrder = action.payload;
    }
  }
});

export default slice.reducer;

export function getColumns() {
  return async () => {
    try {
      const response = await axios.get('/api/kanban/columns');
      dispatch(slice.actions.getColumnsSuccess(response.data.columns));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getColumnsOrder() {
  return async () => {
    try {
      const response = await axios.get('/api/kanban/columns-order');
      dispatch(slice.actions.getColumnsOrderSuccess(response.data.columnsOrder));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getComments() {
  return async () => {
    try {
      const response = await axios.get('/api/kanban/comments');
      dispatch(slice.actions.getCommentsSuccess(response.data.comments));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getProfiles() {
  return async () => {
    try {
      const response = await axios.get('/api/kanban/profiles');
      dispatch(slice.actions.getProfilesSuccess(response.data.profiles));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getItems() {
  return async () => {
    try {
      const response = await axios.get('/api/kanban/items');
      dispatch(slice.actions.getItemsSuccess(response.data.items));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getUserStory() {
  return async () => {
    try {
      const response = await axios.get('/api/kanban/userstory');
      dispatch(slice.actions.getUserStorySuccess(response.data.userStory));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getUserStoryOrder() {
  return async () => {
    try {
      const response = await axios.get('/api/kanban/userstory-order');
      dispatch(slice.actions.getUserStoryOrderSuccess(response.data.userStoryOrder));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addColumn(column: KanbanColumn, columns: KanbanColumn[], columnsOrder: string[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/add-column', { column, columns, columnsOrder });
      dispatch(slice.actions.addColumnSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function editColumn(column: KanbanColumn, columns: KanbanColumn[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/edit-column', { column, columns });
      dispatch(slice.actions.editColumnSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updateColumnOrder(columnsOrder: string[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/update-column-order', { columnsOrder });
      dispatch(slice.actions.updateColumnOrderSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deleteColumn(columnId: string, columnsOrder: string[], columns: KanbanColumn[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/delete-column', { columnId, columnsOrder, columns });
      dispatch(slice.actions.deleteColumnSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addItem(
  columnId: string,
  columns: KanbanColumn[],
  item: KanbanItem,
  items: KanbanItem[],
  storyId: string,
  userStory: KanbanUserStory[]
) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/add-item', { columnId, columns, item, items, storyId, userStory });
      dispatch(slice.actions.addItemSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function editItem(
  columnId: string,
  columns: KanbanColumn[],
  item: KanbanItem,
  items: KanbanItem[],
  storyId: string,
  userStory: KanbanUserStory[]
) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/edit-item', { items, item, userStory, storyId, columns, columnId });
      dispatch(slice.actions.editItemSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updateColumnItemOrder(columns: KanbanColumn[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/update-item-order', { columns });
      dispatch(slice.actions.updateColumnItemOrderSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function selectItem(selectedItem: string | false) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/select-item', { selectedItem });
      dispatch(slice.actions.selectItemSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addItemComment(itemId: string | false, comment: KanbanComment, items: KanbanItem[], comments: KanbanComment[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/add-item-comment', { items, itemId, comment, comments });
      dispatch(slice.actions.addItemCommentSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deleteItem(itemId: string | false, items: KanbanItem[], columns: KanbanColumn[], userStory: KanbanUserStory[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/delete-item', { columns, itemId, userStory, items });
      dispatch(slice.actions.deleteItemSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addStory(story: any, userStory: KanbanUserStory[], userStoryOrder: string[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/add-story', { userStory, story, userStoryOrder });
      dispatch(slice.actions.addStorySuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function editStory(story: KanbanUserStory, userStory: KanbanUserStory[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/edit-story', { userStory, story });
      dispatch(slice.actions.editStorySuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updateStoryOrder(userStoryOrder: string[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/update-story-order', { userStoryOrder });
      dispatch(slice.actions.updateStoryOrderSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updateStoryItemOrder(userStory: KanbanUserStory[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/update-storyitem-order', { userStory });
      dispatch(slice.actions.updateStoryItemOrderSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addStoryComment(storyId: string, comment: KanbanComment, comments: KanbanComment[], userStory: KanbanUserStory[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/add-story-comment', { userStory, storyId, comment, comments });
      dispatch(slice.actions.addStoryCommentSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deleteStory(storyId: string, userStory: KanbanUserStory[], userStoryOrder: string[]) {
  return async () => {
    try {
      const response = await axios.post('/api/kanban/delete-story', { userStory, storyId, userStoryOrder });
      dispatch(slice.actions.deleteStorySuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
