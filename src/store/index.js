import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"
import postReducer from "./postSlice"
import categoryReducer from "./categorySlice"
import commentsReducer from "./commentSlice"
import friendReducer from "./friendSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    category: categoryReducer,
    comments: commentsReducer,
    friends: friendReducer,
  },
});

export default store;
