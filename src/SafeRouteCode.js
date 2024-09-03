import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

const { Tmapv2 } = window;

const SafeRouteCode = () => {
  const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;
  const [isTrue, setIsTrue] = useState(true);

  const [safeCoords1, setSafeCoords1] = useState(null);
  const [safeCoords2, setSafeCoords2] = useState(null);

  const [centerCoords, setCenterCoords] = useState(null);

  useEffect(() => {
    if (isTrue) {
      
      fetchTmapData();

      setIsTrue(false);
    }
  }, [isTrue]);

  const fetchTmapData = async () => {
    try {
      // alert("short Route: api 호출 계속 해")
      const headers = { appKey: TMAP_API_KEY };
      const response = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: 127.2642483,
          startY: 37.0116265,
          endX: 127.1475203,
          endY: 36.9947188,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      // 받아온 데이터
      const resultData = response?.data.features;

      handleResponse(resultData, "short");
    } catch (error) {
      console.error("Error fetching route:", error);
      alert(error);
    }
  };

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
    
    console.log("drawInfo 배열 데이터 확인", drawInfoArr);
    console.log("drawInfo 배열 길이", drawInfoArr.length);

    const halfDataLength = Math.ceil(drawInfoArr.length / 2);

    const cenLat = drawInfoArr[halfDataLength]._lat
    const cenLng = drawInfoArr[halfDataLength]._lng
    setCenterCoords({lat: cenLat, lng: cenLng});

    console.log("길이의 반", halfDataLength);
  };

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
        url: "http://localhost:8080/cctv",
        params: {
          startLat: 37.0116265, // 출발지
          startLon: 127.2642483, // 출발지
          endLat: centerCoords?.lat, // 중간지점
          endLon: centerCoords?.lng, // 중간지점
        },
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.request(options);
      console.log(res.data);

      setSafeCoords1({ lat: res.data[0].latitude, lng: res.data[0].longitude });
    } catch (e) {
      console.log(e);
    }
  };

  const reqCctvRoute2 = async () => {
    try {
      const options = {
        method: "GET",
        url: "http://localhost:8080/cctv",
        params: {
          startLat: centerCoords?.lat, // 중간지점
          startLon: centerCoords?.lng, // 중간지점
          endLat: 36.9947188, // 도착점
          endLon: 127.1475203, // 도착점
        },
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.request(options);
      console.log(res.data);

      setSafeCoords2({ lat: res.data[0].latitude, lng: res.data[0].longitude });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (safeCoords1 && safeCoords2 && centerCoords) {
      reqSafeRoute();
    }
  }, [safeCoords1, safeCoords2, centerCoords]);

  const reqSafeRoute = async () => {
    try {
      // alert("short Route: api 호출 계속 해")
      const headers = { appKey: TMAP_API_KEY };

      const response1 = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: 127.2642483,
          startY: 37.0116265,
          endX: safeCoords1?.lng,
          endY: safeCoords1?.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      const response2 = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: safeCoords1?.lng,
          startY: safeCoords1?.lat,
          endX: centerCoords?.lng,
          endY: centerCoords?.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      const response3 = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: centerCoords?.lng,
          startY: centerCoords?.lat,
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
          endX: 127.1475203,
          endY: 36.9947188,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      // 받아온 데이터
      const combineResponse = [
        ...response1?.data.features,
        ...response2?.data.features,
        ...response3?.data.features,
        ...response4?.data.features,
      ]

      console.log("데이터가 어떤형식?", combineResponse)
      
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <p>
        {safeCoords1?.lat} {safeCoords1?.lng}
      </p>
      <p>
        {safeCoords2?.lat} {safeCoords2?.lng}
      </p>
    </div>
  );
};

export default SafeRouteCode;
