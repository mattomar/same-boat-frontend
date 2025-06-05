import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"
import postReducer from "./postSlice"
import categoryReducer from "./categorySlice"

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    category: categoryReducer
  },
});

export default store;
