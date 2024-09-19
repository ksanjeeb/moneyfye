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
    console.error("Failed to load state from IndexedDB", err);
    return undefined;
  }
};

const saveState = async (state: any) => {
  try {
    const db = await openDB("appDB", 1);
    await db.put("userState", JSON.stringify(state), "state");
  } catch (err) {
    console.error("Failed to save state to IndexedDB", err);
  }
};

export const store = configureStore({
  reducer: userDataReducer,
  preloadedState: await loadState(),
});

store.subscribe(async () => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
