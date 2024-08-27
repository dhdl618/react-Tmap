import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

import redMarker_img from "./img/red_marker_48.png";
import blueMarker_img from "./img/blue_marker_48.png";
import x_img from "./img/white_x_48.png";
import loading_gif from "./img/loading.gif";
import myLoc_img from "./img/my_location_50.png";
import redPoint_img from "./img/redPoint_15.png";

const { Tmapv2 } = window;

const PedestrianRoute = () => {
  const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;

  const {
    state: { myCurrentLocation, poi },
  } = useLocation();
  const [myMap, setMyMap] = useState(null);
  const [sMarker, setSMarker] = useState(null);
  const [eMarker, setEMarker] = useState(null);
  // const [routeData, setRouteData] = useState(null);
  const shortRouteRef = useRef(null);
  const safeRouteRef = useRef(null);

  const [shortRoute, setShortRoute] = useState(null);
  const [safeRoute, setSafeRoute] = useState(null);
  // 최단경로, 안심경로 거리 값 저장
  const [shortDistance, setShortDistance] = useState(null);
  const [safeDistance, setSafeDistance] = useState(null);
  // 최단경로, 안심경로 선택 정보 값 저장
  const [isShortOrSafe, setIsShortOrSafe] = useState("short");
  // 안내 시작 클릭 유무 값 저장
  const [isNavigating, setIsNavigating] = useState(false);
  // 현재 위치 값 저장
  const [realTimeLocation, setRealTimeLocation] = useState(null);
  // 현재 위치 마커
  const [realTimeMarker, setRealTimeMarker] = useState(null);

  const [shortLine, setShortLine] = useState(null);
  const [safeLine, setSafeLine] = useState(null);

  const nav = useNavigate();

  useEffect(() => {
    if (isShortOrSafe === "short") {
      // if (!shortRoute) {
      fetchShortRoute();
      // }
    } else if (isShortOrSafe === "safe") {
      fetchSafeRoute();
    }
  }, [isShortOrSafe, shortRoute, safeRoute]);

  useEffect(() => {
    initRouteMap();
  }, []);

  const initRouteMap = () => {
    const mapDiv = document.getElementById("route-map-div");

    // id가 route-map-div인 요소에 자식이 없으면 Map 생성
    if (!mapDiv.children.length) {
      const latToNum = Number(poi.noorLat);
      const lngToNum = Number(poi.noorLon);

      const myLatToNum = myCurrentLocation.lat;
      const myLngToNum = myCurrentLocation.lng;

      const centerLat = (latToNum + myLatToNum) / 2;
      const centerLng = (lngToNum + myLngToNum) / 2;

      const centerCoord = new Tmapv2.LatLng(centerLat, centerLng);
      const newMap = new Tmapv2.Map("route-map-div", {
        center: centerCoord,
        width: "100vw",
        height: "84vh",
        zoom: 15,
        zoomControl: true,
        scrollwheel: true,
        httpsMode: true,
      });

      // 출발지와 도착지에 따라 지도 크기 조절
      const min_lat = Math.min(myCurrentLocation.lat, poi.noorLat);
      const max_lat = Math.max(myCurrentLocation.lat, poi.noorLat);
      const min_lng = Math.min(myCurrentLocation.lng, poi.noorLon);
      const max_lng = Math.max(myCurrentLocation.lng, poi.noorLon);

      const bounds = new Tmapv2.LatLngBounds(
        new Tmapv2.LatLng(min_lat, min_lng)
      );

      bounds.extend(new Tmapv2.LatLng(max_lat, max_lng));

      const margin = {
        left: 70,
        top: 300,
        right: 70,
        bottom: 250,
      };

      setMyMap(newMap);

      newMap.fitBounds(bounds, margin);

      // 시작 마커
      const startMarker = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(
          myCurrentLocation.lat,
          myCurrentLocation.lng
        ),
        map: newMap,
        icon: blueMarker_img,
      });
      setSMarker(startMarker);

      // 도착 마커
      const endMarker = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(poi.noorLat, poi.noorLon),
        map: newMap,
        icon: redMarker_img,
      });
      setEMarker(endMarker);
    }
  };

  const reloadMap = () => {
    nav("/");
  };

  // 보행자 경로 안내 데이터 및 경로 그리기
  const resultdrawArr = useRef([]);

  const fetchShortRoute = async () => {
    if (shortRouteRef.current) {
      handleResponse(shortRouteRef.current, "short");
      // alert("short Route: api 호출 안해")
    } else {
      try {
        // alert("short Route: api 호출 계속 해")
        const headers = { appKey: TMAP_API_KEY };
        const response = await axios.post(
          "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
          {
            startX: myCurrentLocation.lng,
            startY: myCurrentLocation.lat,
            endX: poi.noorLon,
            endY: poi.noorLat,
            startName: "출발지",
            endName: "도착지",
          },
          { headers }
        );

        // 받아온 데이터
        const resultData = response?.data.features;

        shortRouteRef.current = resultData;
        setShortRoute(resultData);
        // alert(routeData.current);

        handleResponse(resultData, "short");

        let distance = resultData[0].properties.totalDistance;
        if (distance >= 1000) {
          distance = (distance / 1000).toFixed(1) + "km";
        } else {
          distance = distance + "m";
        }

        setShortDistance(distance);
      } catch (error) {
        console.error("Error fetching route:", error);
        alert(error);
      }
    }
  };

  const fetchSafeRoute = async () => {
    // alert("safe route 준비중")
    if (safeRouteRef.current) {
      handleResponse(safeRouteRef.current, "safe");
      // alert("safe Route: api 호출 안해")
    } else {
      try {
        // alert("safe Route: api 호출 계속 해")
        const headers = { appKey: TMAP_API_KEY };
        const response = await axios.post(
          "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
          {
            startX: 127.0895584,   // 양주 디에트르 아파트 기준 (테스트)
            startY: 37.829882,
            endX: poi.noorLon,
            endY: poi.noorLat,
            startName: "출발지",
            endName: "도착지",
          },
          { headers }
        );

        // 받아온 데이터
        const resultData = response?.data.features;

        safeRouteRef.current = resultData;
        setSafeRoute(resultData);
        // alert(routeData.current);

        handleResponse(resultData, "safe");

        let distance = resultData[0].properties.totalDistance;
        if (distance >= 1000) {
          distance = (distance / 1000).toFixed(1) + "km";
        } else {
          distance = distance + "m";
        }

        setSafeDistance(distance);
      } catch (error) {
        console.error("Error fetching route:", error);
        alert(error);
      }
    }
  };

  // 받아온 데이터를 이용해서 경로 그리기 위한 값 추출
  const handleResponse = (resultData, routeType) => {
    const drawInfoArr = [];

    resultData?.forEach((item) => {
      const geometry = item.geometry;

      if (geometry.type === "LineString") {
        geometry.coordinates.forEach((coordinate) => {
          const latlng = new Tmapv2.LatLng(coordinate[1], coordinate[0]);
          drawInfoArr.push(latlng);
        });
      } else {
      }
    });

    if (routeType === "short") {
      safeLine?.setMap(null);
    } else if (routeType === "safe") {
      shortLine?.setMap(null);
    }

    // if ((!shortLine && routeType === "short") || (!safeLine && routeType === "safe")) {
    const polyline_ = new Tmapv2.Polyline({
      path: drawInfoArr,
      strokeColor: "#dd0000",
      strokeWeight: 6,
      map: myMap,
      outline: true,
      outlineColor: "#ffffff",
    });

    if (routeType === "short") {
      setShortLine(polyline_);
    } else if (routeType === "safe") {
      setSafeLine(polyline_);
    }
    // }

    // drawLine(drawInfoArr);
  };

  // 경로 그리기
  // const drawLine = (arrPoint) => {
  //     const polyline_ = new Tmapv2.Polyline({
  //       path: arrPoint,
  //       strokeColor: "#6cafff",
  //       strokeWeight: 6,
  //       map: myMap,
  //     });

  //     // polyline_.setMap(null)

  //     // resultdrawArr.current.push(polyline_);
  // };

  const shortOrSafeSelected = (e) => {
    const selectedRoute = e.currentTarget.getAttribute("data-info");
    // alert(selectedRoute)

    if (selectedRoute == "short") {
      setIsShortOrSafe("short");
    } else {
      setIsShortOrSafe("safe");
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);

    myMap.setCenter(
      new Tmapv2.LatLng(myCurrentLocation.lat - 0.0003, myCurrentLocation.lng)
    );

    myMap.setZoom(18);
  };

  const handleCurrentLocationClick = () => {
    myMap.setCenter(
      new Tmapv2.LatLng(myCurrentLocation.lat - 0.0003, myCurrentLocation.lng)
    );
  };

  // 웹뷰에서 메시지를 받을 때마다 위치를 업데이트 (지도 및 마커용)
  useEffect(() => {
    if (isNavigating) {
      const handleMessage = (e) => {
        const myLocation = JSON.parse(e.data);
        // alert(myLocation);
        const { lat, lng } = myLocation;
        setRealTimeLocation({ lat, lng });
      };

      // 지속적으로 listen
      document.addEventListener("message", handleMessage);

      // 언마운트 시 종료
      return () => {
        document.removeEventListener("message", handleMessage);
      };
    }
  }, [isNavigating]);

  useEffect(() => {
    // 마커 업데이트 함수
    if (realTimeLocation) {
      const newLoc = new Tmapv2.LatLng(
        realTimeLocation.lat,
        realTimeLocation.lng
      );

      if (realTimeMarker) {
        realTimeMarker.setPosition(newLoc);
      } else {
        const newMarker = new Tmapv2.Marker({
          position: newLoc,
          map: myMap,
          icon: redPoint_img,
        });
        setRealTimeMarker(newMarker);
      }
    }
  }, [realTimeLocation]);
  //*************************************************

  return (
    <div className="pedestrian-route-main-container">
      <div id="route-map-div"></div>
      {isNavigating && (
        <button
          className="is-nav-cur-loc-btn"
          onClick={handleCurrentLocationClick}
        >
          <img className="my-loc-img" src={myLoc_img} />
        </button>
      )}
      <div className="destination-name-div">
        <p>도착지: {poi.name}</p>
      </div>
      {!isNavigating && (
        <div className="choice-route-div">
          <div
            className={
              (isShortOrSafe === "short" ? "selected-" : "") +
              "choice-route-div-div"
            }
            onClick={shortOrSafeSelected}
            data-info="short"
          >
            <p style={{ fontSize: "15px" }}>최단 경로</p>
            <p
              className={
                (isShortOrSafe === "short" ? "selected-" : "") +
                "choice-route-div-div-distance"
              }
            >
              {shortDistance}
            </p>
          </div>
          <div
            className={
              (isShortOrSafe === "safe" ? "selected-" : "") +
              "choice-route-div-div"
            }
            onClick={shortOrSafeSelected}
            data-info="safe"
          >
            <p style={{ fontSize: "15px" }}>안심 경로</p>
            <p
              className={
                (isShortOrSafe === "safe" ? "selected-" : "") +
                "choice-route-div-div-distance"
              }
            >
              {safeDistance}
            </p>
          </div>
        </div>
      )}

      <div>
        <button className="x-btn" onClick={reloadMap}>
          <img src={x_img} />
        </button>
      </div>
      <div>
        {isNavigating ? (
          <div className="is-navigation-div">
            {isShortOrSafe == "short" ? (
              <p>최단 경로로 안내중</p>
            ) : (
              <p>안심 경로로 안내중</p>
            )}
            <img src={loading_gif} />
          </div>
        ) : (
          <>
            <div className="select-route-div">
              <button onClick={startNavigation}>
                <p>경로 안내 시작</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PedestrianRoute;
