import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FallbackSpinner } from "@components";
import React, { Component, Suspense, lazy, Fragment, useState } from "react";
import { Container } from "reactstrap";
import { is_authenticated, get_role_storage } from "@utils";

const Home = lazy(() => import('@pages/admin/home/Home'))

const HeaderAdminNavbar = lazy(() => import("@layout/navbar/HeaderAdminNavbar"));

const AdminRouter = (props) => {
    if (!is_authenticated()) {
        return <Navigate to="/login"/>
    }
    const init_menu = [{}];
    
    return (
        <Fragment>
            <HeaderAdminNavbar
                {...props}
                menu_build={init_menu}
            />
            <Suspense fallback={<FallbackSpinner />}>
                <Routes>
                    <Route exact path="/home" element={<Home />} />
                </Routes>
            </Suspense>
        </Fragment>
    )
};

export default AdminRouter;