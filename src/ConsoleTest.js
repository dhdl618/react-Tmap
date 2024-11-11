import React from "react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const { Tmapv2 } = window;

const ConsoleTest = () => {
  const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;
  const [myID, setMyID] = useState(null);

  useEffect(() => {
  }, []);

  const createRanID = async () => {
    const myLocation = {
      latitude: 37.009193,
      longitude: 127.256577
    }
    
    try {
      // const headers = { appKey: TMAP_API_KEY };
      // const response = await axios.post(
      //   "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
      //   {
      //     startX: 127.2642483, //한경대 출발
      //     startY: 37.0116265,
      //     endX: 127.2674896, //스타벅스 계동DT점 도착
      //     endY: 36.9860133,
      //     startName: "출발지",
      //     endName: "도착지",
      //   },
      //   { headers }
      // );

      const response = await axios.post('https://yunharyu.shop/api/interactions/RandomId', myLocation)

      // 받아온 데이터

      console.log("데이터는 ", response)

      setMyID(response.data)
    } catch (error) {
      console.log("에러 발생: ", error);
    }
  };

  const getOthersLoc = async () => {
    try {
      const response = await axios.get(`https://yunharyu.shop/api/interactions/${9116}`)

      console.log("위치", response.data)
    } catch (error) {
      console.log("에러 발생: ", error)
    }
  }

  const updateMyLoc = async () => {
    const  newLoc = {
      latitude: 37.009193,
      longitude: 127.256577
    }

    try {
      const response = await axios.put(`https://yunharyu.shop/api/interactions/${9116}`, newLoc)
    } catch (error) {
      console.log("에러 발생: ", error)
    }
  }

  const deleteID = async () => {
    try {
      const response = await axios.delete(`https://yunharyu.shop/api/interactions/${5013}`)
    } catch (error) {
      console.log("에러 발생: ", error)
    }
  }



  const [safeCoords1, setSafeCoords1] = useState(null)
  const [safeCoords2, setSafeCoords2] = useState(null)

  const start = {
    lat: 37.0116265,  // 테스트용 위치 (한경대학교 기준)
    lng: 127.2642483
  }

  const end = {
    lat: 36.995404, 
    lng: 127.147563
  }

  const reqCctvRoute1 = async () => {
    try {
      const options = {
        method: "GET",
        // url: "http://10.0.2.2:8080/cctv",
        url: "https://yunharyu.shop/cctv",
        params: {
          startLat: start.lat, // 출발지
          startLon: start.lng, // 출발지
          endLat: centerCoords?.lat, // 중간지점
          endLon: centerCoords?.lng, // 중간지점
        },
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.request(options);

      setSafeCoords1({ lat: res?.data[0].latitude, lng: res?.data[0].longitude });
      
    } catch (e) {
      // alert("reqCctvRoute1 에서 알림: " + e);
      console.log("CCTV1 오류: ", e);
    }

    try {
      const options = {
        method: "GET",
        // url: "http://10.0.2.2:8080/cctv",
        url: "https://yunharyu.shop/cctv",
        params: {
          startLat: centerCoords?.lat, // 중간지점
          startLon: centerCoords?.lng, // 중간지점
          endLat: end.lat, // 도착점
          endLon: end.lng, // 도착점
        },
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await axios.request(options);

      setSafeCoords2({ lat: res?.data[0].latitude, lng: res?.data[0].longitude });
      
    } catch (e) {
      // alert("reqCctvRoute2 에서 알림: " + e);
      console.log("CCTV2 오류: ", e);
    }
  };
  const [centerCoords, setCenterCoords] = useState(null)
  
  useEffect(()=>{
    if(centerCoords && safeCoords1 && safeCoords2) {
      reqSafeRoute()
    }
  }, [safeCoords1, safeCoords2, centerCoords])
  

  

  const handleResponse = (resultData) => {
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

    if (!centerCoords) {
      console.log("drawInfo 배열 데이터 확인", drawInfoArr);
      console.log("drawInfo 배열 길이", drawInfoArr.length);

      const halfDataLength = Math.ceil(drawInfoArr.length / 2);

      const cenLat = drawInfoArr[halfDataLength]._lat;
      const cenLng = drawInfoArr[halfDataLength]._lng;

      setCenterCoords({ lat: cenLat, lng: cenLng });

      // console.log("길이의 반", halfDataLength);
    }
  };

  useEffect(()=> {
    if(centerCoords) {
      reqCctvRoute1()
    }
  }, [centerCoords])

  const shortRef = useRef(null)
  const safeRef = useRef(null)

  const shortRoute = async () => {
    try {
      const headers = { appKey: TMAP_API_KEY };

      const response = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: start.lng,
          startY: start.lat,
          endX: end.lng,
          endY: end.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      handleResponse(response?.data.features)
      
      shortRef.current = response?.data.features

    } catch (e) {
      console.log("shortRoute함수 오류: ", e);
    }
  };

  const reqSafeRoute = async () => {
    try {
      const headers = { appKey: TMAP_API_KEY };
      
      const response1 = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: start.lng,
          startY: start.lat,
          endX: safeCoords1?.lng,
          endY: safeCoords1?.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

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
          endX: end.lng,
          endY: end.lat,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      // 받아온 데이터 하나의 배열에 저장 (폴리라인 그리기 위함)
      const combineResponse = [
        ...response1?.data.features,
        ...response3?.data.features,
        ...response4?.data.features,
      ];

      console.log("데이터가 어떤형식?", combineResponse);

      // 합친 데이터를 함수 인자로 보냄
      // handleResponse(combineResponse);

      safeRef.current = combineResponse

      parsingData(shortRef.current, "short")
      parsingData(safeRef.current, "safe")

    } catch (e) {
      console.log("reqSafeRoute함수 오류: ", e);
    }
  };

  const parsingData = (data, type) => {
    const desArray = data.map((item) => ({
      coords: item.geometry.coordinates,
      descript: item.properties.description,
    }));

    console.log(type, ": ", desArray)
    sendToParsing(desArray, type)
  };

  const sendToParsing = async (data, type) => {
    try {
      // const response = await axios.post("http://10.0.2.2:8080/api/navi/parse", data)
      const response = await axios.post("https://yunharyu.shop/api/navi/parse", data)

      const resData = response?.data
      console.log("파싱 후 ",type, " : ", resData)
      // setIsTTSAllowed(true)
    } catch (e) {
      console.log("파싱 오류 ",type, ": ",  e)
    }
  }

  return <div>
    <button onClick={createRanID}>내 ID 생성</button>
    <button onClick={getOthersLoc}>상대방 위치</button>
    <button onClick={updateMyLoc}>내 위치 갱신</button>
    <button onClick={deleteID}>내 ID 삭제</button>
    <button onClick={shortRoute}>안심경로</button>
    {safeRef.current.map((value)=> {
      <p>{value}</p>
    })}
  </div>;
};

export default ConsoleTest;
