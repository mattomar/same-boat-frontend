import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3079'; // Adjust if needed

// Async thunk to fetch user profile by id
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('User Profile Response:', response.data);  // Check if data is received

      // Return the profile data
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.response || error);
      return thunkAPI.rejectWithValue(error.response.data || 'Error fetching profile');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profiles: {},  // Store user profiles by ID
    loading: false,
    error: null,
  },
  reducers: {
    clearProfile(state, action) {
      delete state.profiles[action.payload];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { id, profile } = action.payload;
      
        // Deep copy the entire payload (not just the profile) to avoid Proxy
        const plainUserProfile = JSON.parse(JSON.stringify(action.payload));
      
        // Store the plain object in the Redux state
        state.profiles[id] = plainUserProfile;
      
        console.log('Profile stored in Redux (plain object):', state.profiles);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
