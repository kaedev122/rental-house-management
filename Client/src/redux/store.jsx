import { configureStore } from '@reduxjs/toolkit'
import notiReducer from './notiSlice'
import apartmentSlice from './apartmentSlice'

export const store = configureStore({
  reducer: {
    notification: notiReducer,
    apartment: apartmentSlice,
  },
})