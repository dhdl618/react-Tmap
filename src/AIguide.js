import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


const AIguide = () => {
  const nav = useNavigate();

  const [resWord, setResWord] = useState(null);
  const [count, setCount] = useState(0);
  const [isTextDone, setIsTextDone] = useState(false);

  const resText =
    "한경대학교의 첫 번째 맛집으로는 니하오마라탕이 있습니다. 마라탕의 간은 먹을 때마다 일정하며, 꿔바로우는 두툼한 고기를 자랑합니다. 무엇보다도 계란볶음밥의 맛이 우수합니다.";

  const reloadMap = () => {
    nav("/");
  };

  useEffect(() => {
    const typingText = setInterval(() => {
      setResWord((prev) => {
        let oneWord = prev ? prev + resText[count] : resText[0];
        setCount(count + 1);

        if (count >= resText.length - 1) {
          setIsTextDone(true);
        }

        return oneWord;
      });
    }, 50);

    // 모든 텍스트를 출력하면 인터벌 종료
    if (isTextDone) {
      clearInterval(typingText);
    }

    // 컴포넌트 언마운트 시, 인터벌 종료
    return () => {
      clearInterval(typingText);
    };
  }, [count]);

  // 스크롤 하단으로 이동시키기 위한 Ref
  const resRef = useRef(null)

  // 스크롤 이동 시, smooth하게 이동하는 옵션을 주고 이동
  useEffect(()=> {
    resRef.current.scrollIntoView()
  }, [resWord])

  return (
    <div className="ai-container">
      <div className="ai-title">
        <p>AI 가이드</p>
      </div>
      <div className="ai-body">
        <div className="ai-des-location">
          <p>한경대학교 공학관(목적지)</p>
        </div>
        <div className="ai-text-area">
          <div className="ai-req-container">
            <div className="ai-req-area">
              <p>한경대학교에 대해 가이드 해줘</p>
            </div>
          </div>
          <div className="ai-res-container">
            <div id="resArea" className="ai-res-area">
              <p>
                {resWord}
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
