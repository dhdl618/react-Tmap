import { Route, Routes, BrowserRouter } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Main from './Main'
import SearchResult from "./SearchResult";
import WalkingRouteResult from "./WalkingRouteResult";
import PedestrianRoute from "./PedestrianRoute";
import SafeRouteCode from "./SafeRouteCode";
import AIguide from "./AIguide";
import ConsoleTest from "./ConsoleTest";
import BetweenUser from "./BetweenUser";
import BtwPedestrianRoute from "./BtwPedestrianRoute";

const App = () => {
  
  useEffect(()=> {
    setScreenSize()
  }, [])

  const setScreenSize = () => {
    let vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty("--vh", `${vh}px`)

    let vw = window.innerWidth * 0.01
    document.documentElement.style.setProperty("--vw", `${vw}px`)
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/search-result/:keyword" element={<SearchResult />} />
        <Route path="/poi-route-result/:keyword" element={<WalkingRouteResult />} />
        <Route path="/pedestrian-route" element={<PedestrianRoute />} />
        <Route path="/ai-guide" element={<AIguide />} />
        <Route path="/between-user-path" element={<BetweenUser />} />
        <Route path="/btw-pedestrian-route" element={<BtwPedestrianRoute />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
