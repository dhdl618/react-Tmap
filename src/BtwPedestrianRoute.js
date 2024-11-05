import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

import SMarker_img from "./img/marker_start_50.png";
import EMarker_img from "./img/marker_end_50.png";
import x_img from "./img/white_x_48.png";
import loading_gif from "./img/loading.gif";
import myLoc_img from "./img/my_location_50.png";
import myLoc_noFollow_img from "./img/my_location_nofollow_50.png";
import redPoint_img from "./img/redPoint_20.png";
import bluePoint_img from "./img/bluePoint_20.png";
import camera_img from "./img/cctv_28.png";
import shield_img from "./img/shield_19.png";

import AiModal from "./AiModal";

const { Tmapv2 } = window;

const BtwPedestrianRoute = () => {
  const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;

  const {
    state: { myBtwCurrentLocation, othersLocation, othersID, myID },
  } = useLocation();

  // 맵, 출발, 도착 마커 값 저장
  const [myMap, setMyMap] = useState(null);
  const [sMarker, setSMarker] = useState(null);
  const [eMarker, setEMarker] = useState(null);
  // const [routeData, setRouteData] = useState(null);
  // 최단경로, 안심경로 값 저장
  const shortRouteRef = useRef(null);
  const safeRouteRef = useRef(null);
  // CCTV 마커 표시
  const [cctv1Marker, setCctv1Marker] = useState(null);
  const [cctv2Marker, setCctv2Marker] = useState(null);

  const [shortRoute, setShortRoute] = useState(null);
  const [safeRoute, setSafeRoute] = useState(null);
  // 최단경로, 안심경로 거리 값 저장
  const [shortDistance, setShortDistance] = useState(null);
  const [safeDistance, setSafeDistance] = useState(null);
  // 최단경로, 안심경로 총 시간 값 저장
  const [shortTime, setShortTime] = useState(null);
  const [safeTime, setSafeTime] = useState(null);
  // 최단경로, 안심경로 선택 정보 값 저장
  const [isShortOrSafe, setIsShortOrSafe] = useState("short");
  // 안내 시작 클릭 유무 값 저장
  const [isNavigating, setIsNavigating] = useState(false);
  // 현재 위치 값 저장
  const [realTimeLocation, setRealTimeLocation] = useState({lat: myBtwCurrentLocation.lat, lng: myBtwCurrentLocation.lng});
  // 현재 위치 마커
  const [realTimeMarker, setRealTimeMarker] = useState(null);

  const [shortLine, setShortLine] = useState(null);
  const [safeLine, setSafeLine] = useState(null);

  // 안심경로 두 좌표 값 저장
  const [safeCoords1, setSafeCoords1] = useState(null);
  const [safeCoords2, setSafeCoords2] = useState(null);
  // 중간지점 좌표 값 저장
  const [centerCoords, setCenterCoords] = useState(null);
  // 목적지 도착 여부 값
  const [isArrived, setIsArrived] = useState(false);

  // 파싱 데이터
  const [parsedData, setParsedData] = useState(null);

  const nav = useNavigate();

  useEffect(() => {
    if (isShortOrSafe === "short") {
      fetchShortRoute();
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
      const latToNum = Number(othersLocation.lat);
      const lngToNum = Number(othersLocation.lng);

      const myLatToNum = myBtwCurrentLocation?.lat;
      const myLngToNum = myBtwCurrentLocation?.lng;

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
      const min_lat = Math.min(myBtwCurrentLocation.lat, othersLocation.lat);
      const max_lat = Math.max(myBtwCurrentLocation.lat, othersLocation.lat);
      const min_lng = Math.min(myBtwCurrentLocation.lng, othersLocation.lng);
      const max_lng = Math.max(myBtwCurrentLocation.lng, othersLocation.lng);

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
          myBtwCurrentLocation.lat,
          myBtwCurrentLocation.lng
        ),
        map: newMap,
        icon: SMarker_img,
      });
      setSMarker(startMarker);

      // 도착 마커
      const endMarker = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(othersLocation.lat, othersLocation.lng),
        map: newMap,
        icon: EMarker_img,
      });
      setEMarker(endMarker);
    }
  };

  const reloadMap = async () => {
    try {
      const response = await axios.delete(
        `https://yunharyu.shop/api/interactions/${myID}`
      );

      nav("/");
    } catch (error) {
      console.log("에러 발생: ", error);
    }
  };

  // 최단 경로 API 요청
  const fetchShortRoute = async () => {
    if (shortRouteRef.current) {
      handleResponse(shortRouteRef.current, "short");
    } else {
      try {
        const headers = { appKey: TMAP_API_KEY };
        const response = await axios.post(
          "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
          {
            startX: myBtwCurrentLocation.lng,
            startY: myBtwCurrentLocation.lat,
            endX: othersLocation.lng,
            endY: othersLocation.lat,
            startName: "출발지",
            endName: "도착지",
          },
          { headers }
        );

        // 받아온 데이터
        const resultData = response?.data.features;

        shortRouteRef.current = resultData;
        setShortRoute(resultData);

        // 응답 값을 인자로 보냄
        handleResponse(resultData, "short");

        // 거리 계산
        let distance = resultData[0].properties.totalDistance;
        if (distance >= 1000) {
          distance = (distance / 1000).toFixed(1) + "km";
        } else {
          distance = distance + "m";
        }

        setShortDistance(distance);

        let shTime = resultData[0].properties.totalTime;
        if (shTime >= 60) {
          shTime = (shTime / 60).toFixed(0) + "분";
        } else {
          shTime = "1분";
        }

        setShortTime(shTime);
      } catch (e) {
        // alert("fetchShortRoute 에서 알림: " + e);
      }
    }
  };

  const fetchSafeRoute = () => {
    if (safeRouteRef.current) {
      handleResponse(safeRouteRef.current, "safe");
    } else {
    }
  };

  //***********************오늘추가*************************
  useEffect(() => {
    if (centerCoords) {
      reqCctvRoute1();
      reqCctvRoute2();
    }
  }, [centerCoords]);

  const reqCctvRoute1 = async () => {
    try {
      const options = {
        method: "GET",
        // url: "http://10.0.2.2:8080/cctv",
        url: "https://yunharyu.shop/cctv",
        params: {
          startLat: myBtwCurrentLocation?.lat, // 출발지
          startLon: myBtwCurrentLocation?.lng, // 출발지
          endLat: centerCoords?.lat, // 중간지점
          endLon: centerCoords?.lng, // 중간지점
        },
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.request(options);

      // alert(res?.data)

      setSafeCoords1({
        lat: res?.data[0].latitude,
        lng: res?.data[0].longitude,
      });
    } catch (e) {
      // alert("reqCctvRoute1 에서 알림: " + e);
      console.log(e);
    }
  };

  const reqCctvRoute2 = async () => {
    try {
      const options = {
        method: "GET",
        // url: "http://10.0.2.2:8080/cctv",
        url: "https://yunharyu.shop/cctv",
        params: {
          startLat: centerCoords?.lat, // 중간지점
          startLon: centerCoords?.lng, // 중간지점
          endLat: othersLocation?.lat, // 도착점
          endLon: othersLocation?.lng, // 도착점
        },
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.request(options);

      setSafeCoords2({
        lat: res?.data[0].latitude,
        lng: res?.data[0].longitude,
      });
    } catch (e) {
      // alert("reqCctvRoute2 에서 알림: " + e);
      console.log(e);
    }
  };

  useEffect(() => {
    if (safeCoords1 && safeCoords2 && centerCoords) {
      reqSafeRoute();

      const cctvCamera1 = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(safeCoords1?.lat, safeCoords1?.lng),
        map: myMap,
        icon: camera_img,
      });
      setCctv1Marker(cctvCamera1);

      const cctvCamera2 = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(safeCoords2?.lat, safeCoords2?.lng),
        map: myMap,
        icon: camera_img,
      });
      setCctv2Marker(cctvCamera2);
    }
  }, [safeCoords1, safeCoords2, centerCoords]);

  const reqSafeRoute = async () => {
    try {
      const headers = { appKey: TMAP_API_KEY };

      const response1 = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: myBtwCurrentLocation?.lng,
          startY: myBtwCurrentLocation?.lat,
          endX: safeCoords1?.lng,
          endY: safeCoords1?.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      // const response2 = await axios.post(
      //   "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
      //   {
      //     startX: safeCoords1?.lng,
      //     startY: safeCoords1?.lat,
      //     endX: centerCoords?.lng,
      //     endY: centerCoords?.lat,
      //     startName: "출발지",
      //     endName: "도착지",
      //   },
      //   { headers }
      // );

      const response3 = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: safeCoords1?.lng,
          startY: safeCoords1?.lat,
          endX: safeCoords2?.lng,
          endY: safeCoords2?.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      const response4 = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: safeCoords2?.lng,
          startY: safeCoords2?.lat,
          endX: othersLocation?.lng,
          endY: othersLocation?.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      // 받아온 데이터 하나의 배열에 저장 (폴리라인 그리기 위함)
      const combineResponse = [
        ...response1?.data.features,
        // ...response2?.data.features,
        ...response3?.data.features,
        ...response4?.data.features,
      ];

      // 각각의 0번째 값에 총 거리 값이 저장되어 있기 때문에 거리 합치기 위한 코드
      const safeDistance1 =
        response1?.data.features[0].properties.totalDistance;
      // const safeDistance2 =
      //   response2?.data.features[0].properties.totalDistance;
      const safeDistance3 =
        response3?.data.features[0].properties.totalDistance;
      const safeDistance4 =
        response4?.data.features[0].properties.totalDistance;
      const safeTotalDistance = safeDistance1 + safeDistance3 + safeDistance4;

      console.log("데이터가 어떤형식?", combineResponse);

      safeRouteRef.current = combineResponse;
      setSafeRoute(combineResponse);

      // 합친 데이터를 함수 인자로 보냄
      handleResponse(combineResponse, "safe");

      // 합친 총 길이를 계산
      let distance = safeTotalDistance;
      if (distance >= 1000) {
        distance = (distance / 1000).toFixed(1) + "km";
      } else {
        distance = distance + "m";
      }

      setSafeDistance(distance);

      const safeTime1 = response1?.data.features[0].properties.totalTime;
      // const safeTime2 =
      //   response2?.data.features[0].properties.totalTime;
      const safeTime3 = response3?.data.features[0].properties.totalTime;
      const safeTime4 = response4?.data.features[0].properties.totalTime;

      let safeTotalTime = safeTime1 + safeTime3 + safeTime4;

      if (safeTotalTime >= 60) {
        safeTotalTime = (safeTotalTime / 60).toFixed(0) + "분";
      } else {
        safeTotalTime = "1분";
      }

      setSafeTime(safeTotalTime);
    } catch (e) {
      // alert("reqSafeRoute 에서 알림: " + e);
    }
  };
  //*******************************************************

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

    //*******************************************************
    // 처음 로딩 때 최단 경로에서 보낸 데이터를 이용해서 중앙 좌표값 구하기
    if (!centerCoords) {
      console.log("drawInfo 배열 데이터 확인", drawInfoArr);
      console.log("drawInfo 배열 길이", drawInfoArr.length);

      const halfDataLength = Math.ceil(drawInfoArr.length / 2);

      const cenLat = drawInfoArr[halfDataLength]._lat;
      const cenLng = drawInfoArr[halfDataLength]._lng;

      setCenterCoords({ lat: cenLat, lng: cenLng });

      console.log("길이의 반", halfDataLength);
    }
    //*******************************************************

    if (routeType === "short") {
      safeLine?.setMap(null);
    } else if (routeType === "safe") {
      shortLine?.setMap(null);
    }

    // if ((!shortLine && routeType === "short") || (!safeLine && routeType === "safe")) {
    const polyline_ = new Tmapv2.Polyline({
      path: drawInfoArr,
      strokeColor: isShortOrSafe === "short" ? "#dd0000" : "#008000",
      strokeWeight: 6,
      map: myMap,
      outline: true,
      outlineColor: "#ffffff",
    });

    if (routeType === "short") {
      setShortLine(polyline_);
      cctv1Marker?.setVisible(false);
      cctv2Marker?.setVisible(false);
    } else if (routeType === "safe") {
      setSafeLine(polyline_);
      cctv1Marker?.setVisible(true);
      cctv2Marker?.setVisible(true);
    }
  };

  const shortOrSafeSelected = (e) => {
    const selectedRoute = e.currentTarget.getAttribute("data-info");

    if (selectedRoute === "short") {
      setIsShortOrSafe("short");
    } else {
      setIsShortOrSafe("safe");
    }
  };

  const startNavigation = async () => {
    setIsNavigating(true);
    setIsTTSAllowed(true);

    const text = "안내를 시작합니다.";
    sendToTTS(text);

    myMap.setCenter(
      new Tmapv2.LatLng(
        myBtwCurrentLocation.lat - 0.0003,
        myBtwCurrentLocation.lng
      )
    );

    myMap.setZoom(18);

    sMarker?.setVisible(false);
    eMarker?.setVisible(false);

    // 최단경로, 안심경로 판단 후, 파싱 함수를 호출
    if (isShortOrSafe === "short" && shortRoute) {
      const desArray = shortRoute.map((item) => ({
        coords: item.geometry.coordinates,
        descript: item.properties.description,
      }));

      sendToParsing(desArray);
    } else if (isShortOrSafe === "safe" && safeRoute) {
      const desArray = safeRoute.map((item) => ({
        coords: item.geometry.coordinates,
        descript: item.properties.description,
      }));

      sendToParsing(desArray);
    }
  };

  // description을 파싱하기 위해 API 요청
  const sendToParsing = async (data) => {
    try {
      // const response = await axios.post("http://10.0.2.2:8080/api/navi/parse", data)
      const response = await axios.post(
        "https://yunharyu.shop/api/navi/parse",
        data
      );

      const resData = response?.data;
      setParsedData(resData);
      // setIsTTSAllowed(true)
    } catch (e) {
      alert("파싱 오류 " + e);
    }
  };

  // 파싱 데이터를 이용해서 TTS 호출
  const [isTTSAllowed, setIsTTSAllowed] = useState(false);
  const [lastDescript, setLastDescript] = useState(null);

  const TTSRef = useRef(null);

  useEffect(() => {
    if (parsedData && isTTSAllowed) {
      const TTSdescript = parsedData?.find((item) =>
        isLocationMatch(item.coords, realTimeLocation)
      );

      if (
        TTSdescript?.descript !== undefined &&
        TTSdescript?.descript !== lastDescript
      ) {
        sendToTTS(TTSdescript.descript);
        setLastDescript(TTSdescript.descript);
      } else {
        // alert("디스크립션 undefined")
      }
    }
  }, [realTimeLocation, isTTSAllowed]);

  const isLocationMatch = (coords, myLocation) => {
    const lat = Array.isArray(coords[0]) ? coords[0][1] : coords[1];
    const lng = Array.isArray(coords[0]) ? coords[0][0] : coords[0];

    const locDiff = 0.0002; // 약 20m 차이

    // 현재 위치가 오차 범위 안에 들어오는지 판별
    const latMatch = Math.abs(lat - myLocation.lat) <= locDiff;
    const lngMatch = Math.abs(lng - myLocation.lng) <= locDiff;

    return latMatch && lngMatch;
  };

  const sendToTTS = async (text) => {
    try {
      const response = await axios.post(
        // "http://10.0.2.2:8080/api/tts/convert",
        "https://yunharyu.shop/api/tts/convert",
        { text },
        {
          responseType: "blob", // 음성 파일이 blob 형태로 응답되기 때문에 이 설정이 필요
        }
      );
      // 음성 파일을 브라우저에서 재생하는 코드
      const audioBlob = new Blob([response.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      // const audio = new Audio(audioUrl);
      // audio.autoplay = true  // 자동 재생 허용

      // TTSRef.current = audio;

      // 오디오객체를 Ref로 저장해서 재사용
      if (TTSRef.current) {
        TTSRef.current.src = audioUrl;
      } else {
        TTSRef.current = new Audio(audioUrl);
      }
      await TTSRef.current.play();

      // if (TTSRef.current === audio) {
      //   await audio.play(); // 음성 파일 재생
      // }
    } catch (e) {
      alert("TTS 오류 " + e);
    }
  };

  const [isFollow, setIsFollow] = useState(false);

  const setMapCenter = () => {
    setIsFollow(!isFollow);
    handleCurrentLocationClick();
  };

  const handleCurrentLocationClick = () => {
    if (realTimeLocation && myMap) {
      myMap.setCenter(
        new Tmapv2.LatLng(realTimeLocation.lat - 0.0003, realTimeLocation.lng)
      );
    }
  };

  // 웹뷰에서 메시지를 받을 때마다 위치를 업데이트 (지도 및 마커용)
  useEffect(() => {
    const handleMessage = (e) => {
      const myLocation = JSON.parse(e.data);

      const { lat, lng } = myLocation;
      setRealTimeLocation({ lat, lng });
    };

    // 지속적으로 listen
    document.addEventListener("message", handleMessage);

    // 언마운트 시 종료
    return () => {
      document.removeEventListener("message", handleMessage);
    };
  }, [isNavigating]);

  const [othersRealTimeLocation, setOthersRealTimeLocation] = useState({lat: othersLocation.lat, lng: othersLocation.lng});
  const [othersRealTimeMarker, setOthersRealTimeMarker] = useState(null);

  // 3초마다 상대방 위치 받아오기
  useEffect(() => {
    putMyRealTimeLocation();
    getRealtimeOthersLocation();
  }, [realTimeLocation]);

  const putMyRealTimeLocation = async () => {
    const myRealTimeLocation = {
      latitude: realTimeLocation?.lat,
      longitude: realTimeLocation?.lng,
    };

    try {
      const response = await axios.put(
        `https://yunharyu.shop/api/interactions/${myID}`,
        myRealTimeLocation
      );
    } catch (error) {
      alert("Location PUT 에러: " + error);
    }
  };

  const [isOthersLocSaved, setIsOthersLocSaved] = useState(true);

  const getRealtimeOthersLocation = async () => {
    try {
      const response = await axios.get(
        `https://yunharyu.shop/api/interactions/${othersID}`
      );

      const data = response?.data;
      setOthersRealTimeLocation({ lat: data.latitude, lng: data.longitude });
    } catch (error) {
      setIsOthersLocSaved(false);
    }
  };

  useEffect(() => {
    // 마커 업데이트 함수
    if (realTimeLocation && isNavigating) {
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

    // 상대방 마커 추가
    if (othersRealTimeLocation && isNavigating) {
      const newOthersLoc = new Tmapv2.LatLng(
        othersRealTimeLocation.lat,
        othersRealTimeLocation.lng
      );

      if (othersRealTimeMarker) {
        othersRealTimeMarker.setPosition(newOthersLoc);
      } else {
        const newOthersMarker = new Tmapv2.Marker({
          position: newOthersLoc,
          map: myMap,
          icon: bluePoint_img,
        });
        setOthersRealTimeMarker(newOthersMarker);
      }
    }

    // 현재 위치를 센터로 고정
    if (isFollow) {
      handleCurrentLocationClick();
    }
  }, [realTimeLocation]);
  //*************************************************

  useEffect(() => {
    // 상대방 주변에 대한 경위도 차이 값 (약 20m)
    const locDiff = 0.0002;

    // 상대방 기준 0.0002 만큼의 +/- 위도
    const lat_diff_minus = Number(othersRealTimeLocation.lat) - locDiff;
    const lat_diff_plus = Number(othersRealTimeLocation.lat) + locDiff;

    // 상대방 기준 0.0002 만큼의 +/- 경도
    const lng_diff_minus = Number(othersRealTimeLocation.lng) - locDiff;
    const lng_diff_plus = Number(othersRealTimeLocation.lng) + locDiff;

    if (
      isNavigating &&
      realTimeLocation?.lat >= lat_diff_minus &&
      realTimeLocation?.lat <= lat_diff_plus &&
      realTimeLocation?.lng >= lng_diff_minus &&
      realTimeLocation?.lng <= lng_diff_plus
    ) {
      setIsArrived(true);
    }
  }, [realTimeLocation, othersRealTimeLocation]);

  return (
    <div className="pedestrian-route-main-container">
      <div id="route-map-div"></div>
      {isNavigating && (
        <button className="is-nav-cur-loc-btn" onClick={setMapCenter}>
          <img
            className="my-loc-img"
            src={isFollow ? myLoc_img : myLoc_noFollow_img}
          />
        </button>
      )}
      <div className="destination-name-div">
        <p>도착지: ID {othersID}</p>
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
            <div className="short-div">
              <p>최단 경로</p>
            </div>
            <div className="distance-time-div">
              <div style={{ textAlign: "center" }}>
                <p
                  className={
                    (isShortOrSafe === "short" ? "selected-" : "") +
                    "choice-route-div-div-time"
                  }
                >
                  {shortTime}
                </p>
              </div>
              <div>
                <p className="slash">|</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  className={
                    (isShortOrSafe === "short" ? "selected-" : "") +
                    "choice-route-div-div-distance"
                  }
                >
                  {shortDistance}
                </p>
              </div>
            </div>
          </div>
          {safeCoords1 && safeCoords2 && (
            <div
              className={
                (isShortOrSafe === "safe" ? "selected-" : "") +
                "choice-route-div-div"
              }
              onClick={shortOrSafeSelected}
              data-info="safe"
            >
              <div className="safe-div">
                <p>안심 경로</p>
              </div>
              <div className="distance-time-div">
                <div style={{ textAlign: "center" }}>
                  <p
                    className={
                      (isShortOrSafe === "short" ? "selected-" : "") +
                      "choice-route-div-div-time"
                    }
                  >
                    {safeTime}
                  </p>
                </div>
                <div>
                  <p className="slash">|</p>
                </div>
                <div style={{ textAlign: "center" }}>
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
            </div>
          )}
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
      {isArrived && <AiModal myID={myID} />}
      {!isOthersLocSaved && <AiModal myID={myID} locSave={isOthersLocSaved} />}
    </div>
  );
};

export default BtwPedestrianRoute;
