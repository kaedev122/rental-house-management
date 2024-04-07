import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  'list': [],
  'current': ""
}

export const apartmentSlice = createSlice({
  name: 'apartment',
  initialState,
  reducers: {
    set_apartment_list: (state, action) => {
      console.log(state)
      console.log(action)
      state.list = action.payload
    },
    set_apartment_current: (state, action) => {
      console.log(state)
      console.log(action)
      state.current = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { set_apartment_list, set_apartment_current } = apartmentSlice.actions

export default apartmentSlice.reducer