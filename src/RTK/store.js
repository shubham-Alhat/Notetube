import { configureStore } from "@reduxjs/toolkit";
import notebookReducer from "../RTK/feature/noteBookSlice";
export const store = configureStore({
  reducer: {
    notebook: notebookReducer,
  },
});
