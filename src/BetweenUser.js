import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import whiteX from "./img/white_x_48.png";
import loading_gif from "./img/loading.gif";

const BetweenUser = () => {
  const nav = useNavigate();
  const [myID, setMyID] = useState(null); // 내 ID 값
  const [loadingCoords, setLoadingCoords] = useState(false); // 받기 버튼 누른 후, 상대 위치 값 반환 유무
  const [othersLocation, setOthersLocation] = useState(null); // 상대방 위치
  const [myBtwCurrentLocation, setMyBtwCurrentLocation] = useState(null); // 내 현재 위치 3초마다 갱신
  const [inputID, setInputID] = useState(null); // 입력란에 적은 ID
  const [isCorrect, setIsCorrect] = useState(true)
  const [othersID, setOthersID] = useState(null)
  const [hasSpace, setHasSpace] = useState(false)

  const reload = () => {
    nav("/");
  };

  useEffect(() => {
    const handleMessage = (e) => {
      const myLocation = JSON.parse(e.data);
      // alert(myLocation);
      const { lat, lng } = myLocation;
      setMyBtwCurrentLocation({ lat, lng });
    };

    // 지속적으로 listen
    document.addEventListener("message", handleMessage);

    // 언마운트 시 종료
    return () => {
      document.removeEventListener("message", handleMessage);
    };
  }, [myBtwCurrentLocation, loadingCoords]);

  const handleKeyword = (e) => {
    setInputID(e.target.value);
  };

  // 나의 ID 받기
  const getMyID = async () => {
    /* 자신의 ID를 받음 (난수)
    받은 ID를 setMyID(response)로 저장 */
    try {
      const myLocation = {
        latitude: myBtwCurrentLocation?.lat,
        longitude: myBtwCurrentLocation?.lng,
      };

      const response = await axios.post(
        "https://yunharyu.shop/api/interactions/RandomId",
        myLocation
      );

      // 받아온 데이터
      // console.log("데이터는 ", response);

      setMyID(response?.data);
    } catch (error) {
      console.log("에러 발생: ", error);
    }
  };

  // 상대방의 위치를 DB로 받고, 받은 값을 넘겨주면서 화면 이동
  const receiveOthersCoords = async () => {
    // alert(inputID)

    if (!inputID.includes(" ")) {
      setLoadingCoords(true);
      setHasSpace(false)

      try {
        const response = await axios.get(
          `https://yunharyu.shop/api/interactions/${inputID}`
        );

        const data = response?.data;
        setOthersID(data?.id)

        setOthersLocation({ lat: data?.latitude, lng: data?.longitude });
        
        // alert(othersLocation.lat)
      } catch (error) {
        setLoadingCoords(false)
        setIsCorrect(false)
      }
    } else {
      setHasSpace(true)
    }

    /* 디비로 상대방의 위치를 가져와서 
    setOthersLocation(상대방위치) 하고
    if(othersLocation) {
    예시) nav('/pedestrian-route', {state : {myCurrentLocation, othersLocation}})
        nav([경로 안내하는 창으로 이동]) + 상대방 위치값을 넘겨줌
    }*/
  };

  useEffect(() => {
    if(othersLocation) {
      nav('/btw-pedestrian-route', {state : {myBtwCurrentLocation, othersLocation, othersID, myID}})
      setLoadingCoords(false)
    }
  }, [othersLocation, othersID])

  return (
    <div className="btw-upath-container">
      <div className="btw-upath-body">
        <div className="btw-upath-me">
          <p>내 ID: {myID}</p>
          <div style={{ textAlign: "center" }}>
            <button 
            disabled={myBtwCurrentLocation === null}
            onClick={getMyID}>내 ID 받기</button>
          </div>
        </div>
        <div className="btw-upath-them">
          <input
            type="text"
            placeholder="상대방의 ID를 입력하세요"
            onChange={handleKeyword}
            onKeyDown={(e) => {
              if (e.key == "Enter" && inputID) {
                receiveOthersCoords();
              }
            }}
          ></input>
          <button
            disabled={inputID === null || inputID === ""}
            onClick={receiveOthersCoords}
          >
            받기
          </button>
        </div>
        {loadingCoords && isCorrect && (
          <div className="btw-upath-loadingdiv">
            <img src={loading_gif} />
          </div>
        )} {!loadingCoords && !isCorrect && !hasSpace && (
          <div className="btw-upath-loadingdiv">
            <p>ID가 존재하지 않습니다.</p>
          </div>
        )} {!loadingCoords && hasSpace && !isCorrect && (
          <div className="btw-upath-loadingdiv">
            <p>공백이 존재합니다.</p>
          </div>
        )}
        <div className="btw-upath-gohome" onClick={reload}>
          <img src={whiteX} />
        </div>
      </div>
    </div>
  );
};

export default BetweenUser;
