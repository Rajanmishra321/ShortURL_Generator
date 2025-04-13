import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from './api';

// Async Thunks
export const fetchLinks = createAsyncThunk(
  'links/fetchLinks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/links');
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch links',
        status: error.response?.status
      });
    }
  }
);

export const createShortLink = createAsyncThunk(
  'links/createShortLink',
  async ({ originalUrl, customAlias }, { rejectWithValue }) => {
    try {
      const payload = { originalUrl };
      if (customAlias) {
        payload.customAlias = customAlias;
      }
      
      const response = await API.post('/links', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create short link',
        status: error.response?.status
      });
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'links/fetchAnalytics',
  async ({ linkId, range = '7d' }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/analytics/${linkId}?range=${range}`);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch analytics',
        status: error.response?.status
      });
    }
  }
);

export const deleteLink = createAsyncThunk(
  'links/deleteLink',
  async (linkId, { rejectWithValue }) => {
    try {
      await API.delete(`/links/${linkId}`);
      return linkId;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete link',
        status: error.response?.status
      });
    }
  }
);

const linksSlice = createSlice({
  name: 'links',
  initialState: {
    links: [],
    selectedLink: null,
    analytics: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    createStatus: 'idle', // Separate status for creation
    error: null,
    lastCreatedLink: null
  },
  reducers: {
    selectLink: (state, action) => {
      state.selectedLink = action.payload;
      state.analytics = null; // Clear analytics when selecting new link
    },
    clearError: (state) => {
      state.error = null;
    },
    resetCreateStatus: (state) => {
      state.createStatus = 'idle';
      state.lastCreatedLink = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Links
      .addCase(fetchLinks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.links = action.payload;
        // Auto-select first link if none selected
        if (action.payload.length > 0 && !state.selectedLink) {
          state.selectedLink = action.payload[0]._id;
        }
      })
      .addCase(fetchLinks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create Short Link
      .addCase(createShortLink.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createShortLink.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.links.unshift(action.payload); // Add new link to beginning
        state.lastCreatedLink = action.payload;
        state.selectedLink = action.payload._id; // Select the newly created link
      })
      .addCase(createShortLink.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete Link
      .addCase(deleteLink.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteLink.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.links = state.links.filter(link => link._id !== action.payload);
        // Reset selection if deleted link was selected
        if (state.selectedLink === action.payload) {
          state.selectedLink = state.links.length > 0 ? state.links[0]._id : null;
          state.analytics = null;
        }
      })
      .addCase(deleteLink.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { selectLink, clearError, resetCreateStatus } = linksSlice.actions;

// Selectors
export const selectAllLinks = (state) => state.links.links;
export const selectSelectedLink = (state) => state.links.selectedLink;
export const selectLinkAnalytics = (state) => state.links.analytics;
export const selectLinkStatus = (state) => state.links.status;
export const selectCreateStatus = (state) => state.links.createStatus;
export const selectLastCreatedLink = (state) => state.links.lastCreatedLink;
export const selectLinkError = (state) => state.links.error;

export default linksSlice.reducer;