import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  'message': {
    'show': false
  }
}

export const notiSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    show_notification: (state, action) => {

      state.message = {...action.payload, "show": true}
    },
    hide_notification: (state) => {
      state.message.show = false
    },
  },
})

// Action creators are generated for each case reducer function
export const { show_notification, hide_notification } = notiSlice.actions

export default notiSlice.reducer