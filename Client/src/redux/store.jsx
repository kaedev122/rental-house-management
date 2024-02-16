import { configureStore } from '@reduxjs/toolkit'
import notiReducer from './notiSlice'

export const store = configureStore({
  reducer: {
    notification: notiReducer,
  },
})