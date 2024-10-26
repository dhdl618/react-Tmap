import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import menu_img from "./img/menu_50.png";
import back_img from "./img/back_20.png";
import search_img from "./img/search_20.png";

import DropDown from "./DropDown";

const SearchBar = ({ state, lat, lng }) => {
  const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY;

  const touchRef = useRef(null);

  // 검색창에 적은 값을 저장
  const [poiKeyword, setPoiKeyword] = useState("");

  const [view, setView] = useState(false);

  // 쿼리 파라미터를 이용하여 키워드 가져오기
  const { params } = useParams();

  // 페이지 이동을 위한 useNavigate
  const nav = useNavigate();

  // Tmap으로부터 검색한 정보 받아오는 함수 axios 사용
  const getPOIData = () => {
    const options = {
      method: "GET",
      url: "https://apis.openapi.sk.com/tmap/pois",
      params: {
        version: "1",
        searchKeyword: poiKeyword,
        count: "20",
        page: "1",
        centerLat: lat, // 정확도 순이면서 현재 위치 기준으로 검색
        centerLon: lng,
      },
      headers: {
        Accept: "application/json",
        appKey: TMAP_API_KEY,
      },
    };
    axios
      .request(options)
      .then((res) => {
        // 정상적으로 불러오면 poiArray에 검색 결과 저장
        const poiArray = res.data.searchPoiInfo.pois.poi;

        // 검색 결과와 키워드를 props로 넘김
        nav(`/search-result/${poiKeyword}`, {
          state: { poiArray, poiKeyword },
        });

        console.log(poiArray);
      })
      .catch((e) => {
        console.log(e);

        // 검색 실패 시, 빈 베열을 props로 넘김
        const poiArray = [];
        nav(`/search-result/${poiKeyword}`, {
          state: { poiArray, poiKeyword },
        });
      });
  };

  // 검색 창 value 핸들러 함수
  const handleKeyword = (e) => {
    setPoiKeyword(e.target.value);
  };

  // 메인 화면으로 이동하는 함수
  const reloadMap = () => {
    nav("/");
  };

  const dropMenu = () => {
    setView(!view);
  };

  return (
    <div>
      <div className="search-bar-container">
        {state ? (
          <button className="back-btn" onClick={reloadMap}>
            <img src={back_img} />
          </button>
        ) : (
          <button className="menu-btn" onClick={dropMenu}>
            <img src={menu_img} />
          </button>
        )}
        <input
          type="text"
          placeholder="주소 및 장소 검색"
          className="search-input"
          onChange={handleKeyword}
          value={params}
          onKeyDown={(e) => {
            if (e.key == "Enter" && poiKeyword) {
              getPOIData();
            }
          }}
        ></input>
        <button
          disabled={poiKeyword === ""}
          className="search-btn"
          onClick={getPOIData}
        >
          <img src={search_img} />
        </button>
        {view && (
          <div
            className="touch-interaction"
            ref={touchRef}
            onClick={(e) => {
              if (e.target === touchRef.current) {
                setView(!view);
              }
            }}
          ></div>
        )}
        {view && <DropDown />}
      </div>
    </div>
  );
};

export default SearchBar;
