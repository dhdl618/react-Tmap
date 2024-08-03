import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./App.css";
import SearchBar from "./SearchBar";

import redPoint_img from "./img/redPoint_15.png";
import myLoc_img from "./img/my_location_50.png"

// Tmap API를 사용
const { Tmapv2 } = window;

const Main = () => {
  // 지도, 마커, 현재 위치 값을 저장
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  // 지도 초기화 함수
  const initMap = (lat, lng) => {
    const mapDiv = document.getElementById("map_div");

    // id가 map_div인 요소에 자식이 없으면 Map 생성
    if (!mapDiv.children.length) {
      const defaultLocation = new Tmapv2.LatLng(lat, lng);
      const newMap = new Tmapv2.Map("map_div", {
        center: defaultLocation,
        width: "100vw",
        height: "100vh",
        zoom: 15,
        zoomControl: true,
        scrollwheel: true,
        httpsMode: true,
      });

      setMap(newMap);
      mapRef.current = newMap;

      // 마커 초기화
      const newMarker = new Tmapv2.Marker({
        position: defaultLocation,
        map: newMap,
        icon: redPoint_img,
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
        icon: redPoint_img,
      });
      setMarker(newMarker);
    }
  };

  // 웹뷰에서 메시지를 받을 때마다 위치를 업데이트 (지도 및 마커용)
  useEffect(() => {
    const handleMessage = (e) => {
      const myLocation = JSON.parse(e.data);
      // alert(myLocation);
      const { lat, lng } = myLocation;
      setCurrentLocation({ lat, lng });

      if (!map) {
        initMap(lat, lng);
      } else {
        updateMarker(lat, lng);
      }
    };

    // 지속적으로 listen
    document.addEventListener("message", handleMessage);

    // 언마운트 시 종료
    return () => {
      document.removeEventListener("message", handleMessage);
    };
  }, [map, marker]);


  // 현재 위치 버튼 클릭 핸들러
  const handleCurrentLocationClick = () => {
    if (currentLocation && map) {
      map.setCenter(
        new Tmapv2.LatLng(currentLocation.lat, currentLocation.lng)
      );
    }
  };

  return (
    <div>
      <div id="map_div" className="sh_map"></div>
      <button className="cur-loc-btn" onClick={handleCurrentLocationClick}>
        <img className="my-loc-img" src={myLoc_img} /></button>
      <SearchBar state={false} lat={currentLocation?.lat} lng={currentLocation?.lng}/>
    </div>
  );
};

export default Main;
