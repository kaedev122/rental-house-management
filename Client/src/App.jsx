import './App.scss'
import { store } from './redux/store.jsx'
import { Provider } from 'react-redux'
import AppRouter from './routers'
import { SnackbarProvider } from 'notistack';
import React, { Fragment, useEffect, useState } from 'react'

function App() {
	return (
		<Provider store={store}>
			<SnackbarProvider maxSnack={3} preventDuplicate>
				<AppRouter />
			</SnackbarProvider>
		</Provider>)
}

export default App
