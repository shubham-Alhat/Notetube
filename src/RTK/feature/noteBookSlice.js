import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  noteBookArr: Object.keys(localStorage).map((key) =>
    JSON.parse(localStorage.getItem(key))
  ),
};

export const noteBookSlice = createSlice({
  name: "notebook",
  initialState,
  reducers: {
    addNoteBook: (state, action) => {
      // add in redux state
      state.noteBookArr.push(action.payload);

      // sync redux state with local storage
      localStorage.setItem(action.payload.id, JSON.stringify(action.payload));
    },
    deleteNoteBook: (state, action) => {
      // set redux state with new array.
      state.noteBookArr = state.noteBookArr.filter(
        (obj) => obj.id !== action.payload
      );

      // sync with local storage
      localStorage.removeItem(action.payload);
    },
    addNote: (state, action) => {
      // access the date sent.
      const { noteObj, id } = action.payload;

      // assign new array to noteBookArr.
      state.noteBookArr = state.noteBookArr.map((obj) =>
        obj.id == id ? { ...obj, notes: [...obj.notes, noteObj] } : obj
      );

      // sync with local storage
      const updatedObj = state.noteBookArr.find((obj) => obj.id == id);
      if (updatedObj) localStorage.setItem(id, JSON.stringify(updatedObj));
    },
    deleteNote: (state, action) => {
      // access the sent data
      const { id, noteId } = action.payload;

      // assign new array
      state.noteBookArr = state.noteBookArr.map((obj) =>
        obj.id == id
          ? {
              ...obj,
              notes: obj.notes.filter((noteObj) => noteObj.noteId != noteId),
            }
          : obj
      );

      // sync with local storage
      const updatedObj = state.noteBookArr.find((obj) => obj.id == id);
      if (updatedObj) localStorage.setItem(id, JSON.stringify(updatedObj));
    },
  },
});

export const { addNoteBook, deleteNoteBook, addNote, deleteNote } =
  noteBookSlice.actions;

export default noteBookSlice.reducer;
