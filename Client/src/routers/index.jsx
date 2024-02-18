import React, { Component, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { IntlProvider } from "react-intl"
import { FallbackSpinner } from '@components'

const MainRouter = lazy(() => import('./MainRouter'))
const Login = lazy(() => import('@pages/login'))
const Home = lazy(() => import('@pages/home'))
const ResetPassword= lazy(() => import('@pages/recoveryPassword/ResetPassword'))
const Recovery = lazy(() => import('@pages/recoveryPassword/Recovery'))
const Register = lazy(() => import('@pages/register/Register'))
const DoneRegister = lazy(() => import('@pages/register/DoneRegister'))
const ActiveUser = lazy(() => import('@pages/register/ActiveUser'))

function AppRouter() {
	let state = {
		"default_locale": "vi",
		"messages": "...",
		"change_locale": {}
	} 

	return (
	  <BrowserRouter>
	  	<Suspense fallback={<FallbackSpinner />} >
		  <IntlProvider locale={state.default_locale} messages={state.messages}>
		<Routes>
		  <Route path="/*" element={<MainRouter/>} />
		  <Route exact path="/" element={<Home/>} />
		  <Route exact path="/login" element={<Login/>} />
		  <Route exact path="/forgot-password" element={<Recovery/>} />
		  <Route exact path="/reset-password" element={<ResetPassword/>} />
		  <Route exact path="/register" element={<Register/>} />
		  <Route exact path="/done-register" element={<DoneRegister/>} />
		  <Route path="/active-user/:activeCode" element={<ActiveUser/>} />
		</Routes>
		</IntlProvider>
		</Suspense>
	  </BrowserRouter>
	);
  }

export default AppRouter