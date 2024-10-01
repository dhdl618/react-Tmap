import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import dovi_png from "./img/dovi_ai.png"
import person_png from "./img/person_48.png"

const AIguide = () => {
  const nav = useNavigate();
  const locationHook = useLocation();
  const poiData = locationHook.state?.poi;

  const address = poiData.newAddressList.newAddress[0].fullAddressRoad;
  const place = poiData.name;

  const [resWord, setResWord] = useState(null);
  const [count, setCount] = useState(0);
  const [isTextDone, setIsTextDone] = useState(false);

  const [aiRes, setAiRes] = useState(null);

  const reqAIGuide = async () => {
    try {
      // alert("일단 들어와써")
      const response = await fetch(
        "http://10.0.2.2:8080/api/gpt",
        {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({address, place})
        });

        const responseData = await response?.json()
      setAiRes(responseData?.answer);
      
    } catch (e) {
      setAiRes("오류가 발생하여 답변이 불가능합니다. 다시 시도해주세요")
    }
  };

  // const resText =
  //   "한경대학교의 첫 번째 맛집으로는 니하오마라탕이 있습니다. 마라탕의 간은 먹을 때마다 일정하며, 꿔바로우는 두툼한 고기를 자랑합니다. 무엇보다도 계란볶음밥의 맛이 우수합니다.";

  const reloadMap = () => {
    nav("/");
  };

  useEffect(() => {
    reqAIGuide()
  }, [])

  useEffect(() => {
    const typingText = setInterval(() => {
      if (aiRes) {
        setResWord((prev) => {
          let oneWord = prev ? prev + aiRes[count] : aiRes[0];
          setCount(count + 1);

          if (count >= aiRes?.length - 1) {
            setIsTextDone(true);
          }

          return oneWord;
        });
      }
    }, 50);

    // 모든 텍스트를 출력하면 인터벌 종료
    if (isTextDone || count >= aiRes?.length) {
      clearInterval(typingText);
    }

    // 컴포넌트 언마운트 시, 인터벌 종료
    return () => {
      clearInterval(typingText);
    };
  }, [count, aiRes]);

  // 스크롤 하단으로 이동시키기 위한 Ref
  const resRef = useRef(null);

  // 응답이 길어짐에 따라 자동으로 스크롤 하단 이동 
  useEffect(() => {
    resRef.current.scrollIntoView();
  }, [resWord]);

  return (
    <div className="ai-container">
      <div className="ai-title">
        <p>AI 가이드</p>
      </div>
      <div className="ai-body">
        <div className="ai-des-location">
          <p>{place}</p>
        </div>
        <div className="ai-text-area">
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <div className="ai-req-div">
              <img className="ai-req-img" src={person_png}/>
            </div>
          </div>
          <div className="ai-req-container">
            <div className="ai-req-area">
              <p><b>{place}</b>에 대해 가이드 해줘</p>
            </div>
          </div>
          <div className="ai-res-container">
            <div className="ai-res-div">
              <img className="ai-res-img" src={dovi_png}/>
            </div>
            <div id="resArea" className="ai-res-area">
              <p>
                {!resWord ? "답변을 기다리는 중..." : resWord}
                {isTextDone ? "" : "🔸"}
              </p>
            </div>
            <div ref={resRef}></div>
          </div>
        </div>
      </div>
      <div className="ai-end-btn-area">
        <button onClick={reloadMap} className="ai-end-btn">
          <p>가이드 종료</p>
        </button>
      </div>
    </div>
  );
};

export default AIguide;
