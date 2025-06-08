import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"
import postReducer from "./postSlice"
import categoryReducer from "./categorySlice"
import commentsReducer from "./commentSlice"

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    category: categoryReducer,
    comments: commentsReducer
  },
});

export default store;
