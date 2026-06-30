import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  relations: {}, // userId -> status
};

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setFriendStatus: (state, action) => {
      const { userId, status } = action.payload;
      state.relations[userId] = status;
    },

    setBulkStatuses: (state, action) => {
      state.relations = {
        ...state.relations,
        ...action.payload,
      };
    },
  },
});

export const { setFriendStatus, setBulkStatuses } = friendSlice.actions;
export default friendSlice.reducer;
