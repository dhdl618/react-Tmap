import React from "react";

import person_img from "./img/person_50.png";

const DropDown = () => {

    const goUserPath = () => {
        alert("사용자 간 경로를 실행합니다.")
    }

  return (
    <div className="menu-container">
      <div className="menu-profile">
        <div className="menu-profile-img">
          <img src={person_img} />
        </div>
        <div className="menu-profile-user">
          <p style={{ fontSize: "15px", marginBottom: "5px" }}>
            <b>Nickname</b>
          </p>
          <p style={{ fontSize: "12px" }}>ID</p>
        </div>
      </div>
      <div className="menu-list">
        <div>
          로그아웃
        </div>
        <div onClick={goUserPath}>
          사용자 간 경로
        </div>
        <div>
          설정
        </div>
      </div>
    </div>
  );
};

export default DropDown;
