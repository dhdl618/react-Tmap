// import React, { useState } from "react";
// import { useEffect } from "react";
// import redPoint from './img/redPoint_10.png'
// import bluePoint from './img/bluePoint_10.png'

// const { Tmapv2 } = window;

// const App = () => {
//   //임의의 좌표값
//   var nowLat = 37.8367295
//   var nowLng = 127.0846731

//   const [currentLocation, setCurrentLocation] = useState(null)

//   //지도 띄우기
//   const initMap = () => {
//     const mapDiv = document.getElementById("map_div");

//     if (!mapDiv.children.length) {
//       var map = new Tmapv2.Map("map_div", {
//         center: new Tmapv2.LatLng((nowLat+37.8386259)/2, (nowLng+127.0834541)/2),
//         width: "100%",
//         height: "400px",
//         zoom: 14,
//         zoomControl: true,
//         scrollwheel: true,
//       });
//     }

//     //현재위치 불러와 값 저장

//       navigator.geolocation.getCurrentPosition((position) => {
//         var myLat = position.coords.latitude;
//         var myLng = position.coords.longitude;

//         setCurrentLocation({myLat, myLng})

//         var myLoc = new Tmapv2.LatLng(myLat, myLng);

//         console.log(myLoc)

//         getCurrentPosition(myLoc)
//       });

//     const getCurrentPosition = (myLoc) =>{
//       console.log("가져왔어", myLoc._lat, myLoc._lng)
//       var marker_me = new Tmapv2.Marker({
//         position: new Tmapv2.LatLng(myLoc._lat, myLoc._lng),
//         map: map,
//         icon: redPoint
//       })
//       return marker_me
//     }

//     //마커 찍기
//     const addMarker = (status, lat, lng) => {
//       var imgURL;
//       switch (status) {
//         case "Start":
//           imgURL = bluePoint;
//           break;
//         case "Pass":
//           imgURL = redPoint;
//           break;
//         case "End":
//           imgURL = redPoint;
//           break;
//         default:
//       }

//       if ((status = "Start")) {
//         var marker_s = new Tmapv2.Marker({
//           position: new Tmapv2.LatLng(lat, lng),
//           icon: imgURL,
//           map: map,
//         });
//         return marker_s;
//       } else if ((status = "End")) {
//         var marker_e = new Tmapv2.Marker({
//           position: new Tmapv2.LatLng(lat, lng),
//           icon: imgURL,
//           map: map,
//         });
//         return marker_e;
//       } else if ((status = "Pass")) {
//         var marker_p = new Tmapv2.Marker({
//           position: new Tmapv2.LatLng(lat, lng),
//           icon: imgURL,
//           map: map,
//         });
//         return marker_p;
//       }
//     };

//     addMarker("Start", currentLocation.myLat, currentLocation.myLng);
//     addMarker("End", 37.8191621, 127.1007697);
//     addMarker("Me");
//   };

//   //마운트 시, 한 번 실행
//   useEffect(() => {
//     initMap();

//     document.addEventListener("message", (e) => {
//       alert(e.data)
//     })
//   }, [currentLocation]);

//   return (
//     <div id="map_div" className="sh_map">
//       지도
//     </div>
//   );
// };

// export default App;

import { Route, Routes, BrowserRouter } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Main from './Main'
import SearchResult from "./SearchResult";
import WalkingRouteResult from "./WalkingRouteResult";
import PedestrianRoute from "./PedestrianRoute";
import StartEndInput from "./StartEndInput";


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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
