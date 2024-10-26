import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

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
      const response = await axios.delete(`https://yunharyu.shop/api/interactions/${1959}`)
    } catch (error) {
      console.log("에러 발생: ", error)
    }
  }

  return <div>
    <button onClick={createRanID}>내 ID 생성</button>
    <button onClick={getOthersLoc}>상대방 위치</button>
    <button onClick={updateMyLoc}>내 위치 갱신</button>
    <button onClick={deleteID}>내 ID 삭제</button>
  </div>;
};

export default ConsoleTest;
