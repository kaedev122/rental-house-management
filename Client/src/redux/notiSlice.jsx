import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  msg: "",
  variant: ""
}

export const notiSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    updateNotification: (state, action) => {
      const { msg, variant } = action.payload;
      state.msg = msg;
      state.variant = variant;
    }
  },
})

// Action creators are generated for each case reducer function
export const { updateNotification } = notiSlice.actions

export default notiSlice.reducer