import { configureStore } from "@reduxjs/toolkit";
import userDataReducer from "../src/slices/user-details";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem("userState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load state from localStorage", err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: userDataReducer,
  preloadedState: loadState(),
});

store.subscribe(() => {
  try {
    const serializedState = JSON.stringify(store.getState());
    localStorage.setItem("userState", serializedState);
  } catch (err) {
    console.error("Failed to save state to localStorage", err);
  }
});

export type RootState = ReturnType<typeof store.getState>;
