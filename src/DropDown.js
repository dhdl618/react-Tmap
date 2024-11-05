import React from "react";
import { useNavigate } from "react-router-dom";

import person_img from "./img/person_50.png";

const DropDown = () => {
  const nav = useNavigate();

  const goUserPath = () => {
    nav("/between-user-path");
  };

  // 준비 중인 기능들 처리
  const ontheAnvil = () => {
    alert("준비 중 입니다.");
  }

  return (
    <div className="menu-container">
      <div className="menu-profile">
        <div className="menu-profile-img">
          <img onClick={ontheAnvil} src={person_img} />
        </div>
        <div className="menu-profile-user">
          <p style={{ fontSize: "15px", marginBottom: "5px" }}>
            <b>Nickname</b>
          </p>
          <p style={{ fontSize: "12px" }}>ID</p>
        </div>
      </div>
      <div className="menu-list">
        <div onClick={ontheAnvil}>로그아웃</div>
        <div onClick={goUserPath}>사용자 간 경로</div>
        <div onClick={ontheAnvil}>설정</div>
      </div>
    </div>
  );
};

export default DropDown;
