import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AiModal = ({ poi, myID, locSave }) => {
  const modalBgRef = useRef(null);

  const nav = useNavigate();

  const reloadMap = async () => {
    try {
      const response = await axios.delete(`https://yunharyu.shop/api/interactions/${myID}`)
      
      // alert("정상적으로 삭제하였습니다.")

      nav("/");
      
    } catch (error) {
      alert("ID 삭제 에러: " + error)
    }
  };

  const goAIGuide = () => {
    nav("/ai-guide", { state: { poi } });
  };

  return (
    <div>
      {/* 모달 */}
      <div
        className="modal-bg"
        ref={modalBgRef}
        onClick={(e) => {
          if (e.target === modalBgRef.current) {
            reloadMap();
          }
        }}
      >
        <div className="modal-inner">
          {locSave === false ? (
            <p style={{ marginBottom: "3px" }}>상대방이 연결을 종료하였습니다.</p>
          ) : locSave === null && (
            <p style={{ marginBottom: "3px" }}>목적지에 도착하였습니다.</p>
          )}
          <p>안내를 종료합니다.</p>
          <br />
          {poi ? (
            <div>
              <p style={{ marginBottom: "20px" }}>
                <b>목적지에 대한 가이드</b>를 진행 하시겠습니까?
              </p>
              <button
                style={{ backgroundColor: "#ffe600", marginRight: "10px" }}
                onClick={goAIGuide}
              >
                수락
              </button>
              <button
                style={{ backgroundColor: "#fffbda" }}
                onClick={reloadMap}
              >
                거절
              </button>
            </div>
          ) : (
            <button
                style={{ backgroundColor: "#fffbda" }}
                onClick={reloadMap}
              >
                닫기
              </button>
          )}
        </div>
      </div>
      {/* 모달 */}
    </div>
  );
};

export default AiModal;
