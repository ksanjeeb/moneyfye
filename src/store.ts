/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from "@reduxjs/toolkit";
import userDataReducer from "../src/slices/user-details";
import { openDB } from "idb";

const loadState = async () => {
  try {
    const db = await openDB("moneyfyeDB", 1, {
      upgrade(db) {
        db.createObjectStore("userState");
      },
    });
    const serializedState = await db.get("userState", "state");
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = async (state: any) => {
  try {
    const db = await openDB("moneyfyeDB", 1);
    await db.put("userState", JSON.stringify(state), "state");
  } catch (err) {
    console.error("Failed to save state to IndexedDB", err);
  }
};

export const setupStore = async () => {
  const preloadedState = await loadState();
  const store = configureStore({
    reducer: userDataReducer,
    preloadedState,
  });

  store.subscribe(async () => {
    saveState(store.getState());
  });

  return store;
};

export const store = await setupStore();

export type RootState = ReturnType<typeof store.getState>;
