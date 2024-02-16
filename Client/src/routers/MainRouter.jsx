import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FallbackSpinner } from "@components";
import React, { Component, Suspense, lazy, Fragment, useState } from "react";
import { Container } from "reactstrap";
import { is_authenticated } from "@utils";

const Home = lazy(() => import('@pages/home'))

const MainRouter = (props) => {
  if (!is_authenticated()) {
    // return <Navigate to="/login"/>
  }
  
  return (
    <Fragment>
      <Suspense fallback={<FallbackSpinner />}>
        <Routes>
          <Route exact path="/home" element={<Home />} />

					<Route exact path="/login" render={() => (<Navigate to={{ pathname: "/" }} />)} />
        </Routes>
      </Suspense>
    </Fragment>
  )
};

export default MainRouter;
