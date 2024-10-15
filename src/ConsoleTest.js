import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

const ConsoleTest = () => {
  const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;
  const [description, setDescription] = useState(null);

  useEffect(() => {
    if (!description) {
      fetchTmapData();
    }
    console.log("데이터", description);
  }, [description]);

  const fetchTmapData = async () => {
    try {
      // alert("short Route: api 호출 계속 해")
      const headers = { appKey: TMAP_API_KEY };
      const response = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        {
          startX: 127.2642483, //한경대 출발
          startY: 37.0116265,
          endX: 127.2674896, //스타벅스 계동DT점 도착
          endY: 36.9860133,
          startName: "출발지",
          endName: "도착지",
        },
        { headers }
      );

      // 받아온 데이터
      const resultData = response?.data.features;


        const desArray = resultData?.map((item) => ({
        coords: item.geometry.coordinates,
        descript: item.properties.description,
        }));
        
        sentToParsing(desArray);
        setDescription(1)
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const sentToParsing = async (data) => {
    try {
      console.log("data가 있어?", data)
      const response = await axios.post("http://localhost:8080/api/navi/parse", data)

      const resData = response?.data

      console.log("파싱 데이터", resData)
    } catch (e) {
      console.log("파싱 에러")
    }
  }

  return <div>ConsoleTest</div>;
};

export default ConsoleTest;
