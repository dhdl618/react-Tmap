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
  const [myCurrentLocation, setMyCurrentLocation] = useState(null); // 내 현재 위치 3초마다 갱신
  const [inputID, setInputID] = useState(null);

  const reload = () => {
    nav("/");
  };

  useEffect(() => {
    const handleMessage = (e) => {
      const myLocation = JSON.parse(e.data);
      // alert(myLocation);
      const { lat, lng } = myLocation;
      setMyCurrentLocation({ lat, lng });
    };

    // 지속적으로 listen
    document.addEventListener("message", handleMessage);

    // 언마운트 시 종료
    return () => {
      document.removeEventListener("message", handleMessage);
    };
  }, [myCurrentLocation, loadingCoords]);

  const handleKeyword = (e) => {
    setInputID(e.target.value);
  };

  // 나의 ID 받기
  const getMyID = () => {
    /* 자신의 ID를 받음 (난수)
    받은 ID를 setMyID(response)로 저장 */
  };

  // 상대방의 위치를 DB로 받고, 받은 값을 넘겨주면서 화면 이동
  const receiveOthersCoords = () => {
    // alert(inputID)

    if(!inputID.includes(" ")) {
        alert(inputID)
        setLoadingCoords(true);
    } else {
        alert("공백이 포함되었습니다")
    }

    /* 디비로 상대방의 위치를 가져와서 
    setOthersLocation(상대방위치) 하고
    if(othersLocation) {
    예시) nav('/pedestrian-route', {state : {myCurrentLocation, othersLocation}})
        nav([경로 안내하는 창으로 이동]) + 상대방 위치값을 넘겨줌
    }*/
  };

  return (
    <div className="btw-upath-container">
      <div className="btw-upath-body">
        <div className="btw-upath-me">
          <p>내 ID: {myID}</p>
          <div style={{ textAlign: "center" }}>
            <button onClick={getMyID}>내 ID 받기</button>
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
          <button disabled={inputID === null || inputID === ""} onClick={receiveOthersCoords}>
            받기
          </button>
        </div>
        {loadingCoords && (
          <div className="btw-upath-loadingdiv">
            <img src={loading_gif} />
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
