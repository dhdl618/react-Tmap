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






import React, { useState, useEffect, useRef } from "react";
import redPoint from './img/redPoint_10.png';
import bluePoint from './img/bluePoint_10.png';
import './App.css';

const { Tmapv2 } = window;

const App = () => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  // 지도 초기화 함수
  const initMap = (lat, lng) => {
    const mapDiv = document.getElementById("map_div");

    if (!mapDiv.children.length) {
      const defaultLocation = new Tmapv2.LatLng(lat, lng);
      const newMap = new Tmapv2.Map("map_div", {
        center: defaultLocation,
        width: "100vw",
        height: "97vh",
        zoom: 14,
        zoomControl: true,
        scrollwheel: true,
      });

      setMap(newMap);
      mapRef.current = newMap;

      // 마커 초기화
      const newMarker = new Tmapv2.Marker({
        position: defaultLocation,
        map: newMap,
        icon: redPoint,
      });
      setMarker(newMarker);
    }
  };

  // 마커 업데이트 함수
  const updateMarker = (lat, lng) => {
    const newLoc = new Tmapv2.LatLng(lat, lng);

    if (marker) {
      marker.setPosition(newLoc);
    } else if (map) {
      const newMarker = new Tmapv2.Marker({
        position: newLoc,
        map: map,
        icon: redPoint,
      });
      setMarker(newMarker);
    }

    // map.setCenter(newLoc);
  };

  // 웹뷰에서 메시지를 받을 때마다 위치를 업데이트
  useEffect(() => {
    const handleMessage = (e) => {
      const myLocation = JSON.parse(e.data);
      console.log("Received location:", myLocation);
      const { lat, lng } = myLocation;
      setCurrentLocation({ lat, lng });

      if (!map) {
        initMap(lat, lng);
      } else {
        updateMarker(lat, lng);
      }
    };

    document.addEventListener("message", handleMessage);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener("message", handleMessage);
    };
  }, [map, marker]);

  // 현재 위치 버튼 클릭 핸들러
  const handleCurrentLocationClick = () => {
    if (currentLocation && map) {
      map.setCenter(new Tmapv2.LatLng(currentLocation.lat, currentLocation.lng));
    }
  };

  return (
    <div>
      <div id="map_div" className="sh_map"></div>
      <button onClick={handleCurrentLocationClick} className="btn">현재 위치로 이동</button>
      {map && (<button>map 존재</button>)}
      {currentLocation && (<button>현재 위치 존재</button>)}
    </div>
  );
};

export default App;
