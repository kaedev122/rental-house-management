import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FallbackSpinner } from "@components";
import React, { Component, Suspense, lazy, Fragment, useState } from "react";
import { Container } from "reactstrap";
import { is_authenticated, get_role_storage } from "@utils";

const Home = lazy(() => import('@pages/home/Home'))
const ListApartment = lazy(() => import('@pages/apartment/ListApartment'))
const ListCustomer = lazy(() => import('@pages/customer/ListCustomer'))
const ListContract = lazy(() => import('@pages/contract/ListContract'))
const ListBill = lazy(() => import('@pages/bill/ListBill'))
const ListRevenue = lazy(() => import('@pages/revenue/ListRevenue'))
const ListReport = lazy(() => import('@pages/report/ListReport'))
const Setting = lazy(() => import('@pages/setting/Setting'))

const HeaderNavbar = lazy(() => import("@layout/navbar/HeaderNavbar"));

const CmsRouter = (props) => {
    if (!is_authenticated()) {
        return <Navigate to="/login"/>
    }
	const init_menu = [{}];
	
	return (
		<Fragment>
			<HeaderNavbar
				{...props}
				menu_build={init_menu}
			/>
			<Suspense fallback={<FallbackSpinner />}>
				<Routes>			
					<Route exact path="/home" element={<Home />} />
					<Route exact path="/apartment" element={<ListApartment />} />
					<Route exact path="/customer" element={<ListCustomer />} />
					<Route exact path="/contract" element={<ListContract />} />
					<Route exact path="/bill" element={<ListBill />} />
					<Route exact path="/revenue" element={<ListRevenue />} />
					<Route exact path="/report" element={<ListReport />} />
					<Route exact path="/setting" element={<Setting />} />
					<Route exact path="/login" render={() => (<Navigate to={{ pathname: "/" }} />)} />
				</Routes>
			</Suspense>
		</Fragment>
	)
};

export default CmsRouter;
