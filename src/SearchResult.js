import React, {useEffect, useState, useRef} from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import axios from 'axios';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from "react-router-dom";

import loadingGIF from './img/loading.gif'

const SearchResult = () => {
  const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY
    // useNavigate를 통해 보낸 porps 받는 useLocation
    // 검색 결과와 키워드를 props로 받아서 렌더링 처리
    const {state: {poiArray, poiKeyword}} = useLocation();

    // 무한 스크롤을 위해 page 값을 상태 값으로 저장
    const [page, setPage] = useState(2);

    // 현재 위치 정보를 저장하는 상태 값
    const [currentLocation, setCurrentLocation] = useState(null);

    // 검색 결과 리스트를 상태 값으로 저장하고 useLocation으로 받아온
    // poiArray 값으로 초기화
    const [dataList, setDataList] = useState(poiArray);

    // 검색결과가 20개 이상인 경우, 무한 스크롤이 가능
    const [hasMore, setHasMore] = useState(true);

    // 이전 키워드와 현재 키워드 비교
    const prevKeyword = useRef(poiKeyword);

    // 무한 스크롤을 구현하기 위한 라이브러리
    const [ref, inView] = useInView();

    // 페이지 이동을 위한 useNavigate
    const nav = useNavigate()

    // 검색결과 출력 시, 페이지 상단으로 이동하고 상태 값들 초기화
    useEffect(() => {
      window.scrollTo(0, 0)
      if (prevKeyword.current !== poiKeyword) {
        prevKeyword.current = poiKeyword;
        setDataList([])
        setDataList(poiArray);
        setPage(2);
        setHasMore(true);
      }
    }, [poiKeyword]);

    // 조건 만족 시, 무한 스크롤 가능
    useEffect(() => {
      if (inView && hasMore) {
        dataFetch();
      }
    }, [inView]);

    // 웹뷰에서 메시지를 받을 때마다 위치를 업데이트 (무한 스크롤링용)
    useEffect(() => {
    const handleMessage = (e) => {
      const myLocation = JSON.parse(e.data);
      // alert(myLocation);
      const { lat, lng } = myLocation;
      setCurrentLocation({ lat, lng });
    };

    // 지속적으로 listen
    document.addEventListener("message", handleMessage);

    // 언마운트 시 종료
    return () => {
      document.removeEventListener("message", handleMessage);
    };
  }, [currentLocation]);

    // 무한 스크롤 이용 시, API 호출하는 함수
    const dataFetch = async () => {
      // 처음 검색 시, 결과가 20개면 추가 API 호출 가능
      if (poiArray.length == 20) {
        try {
          const options = {
            method: "GET",
            url: "https://apis.openapi.sk.com/tmap/pois",
            params: {
              version: "1",
              searchKeyword: poiKeyword,
              page: page,
              count: "20",
              centerLat: currentLocation?.lat,  // 정확도 순이면서 현재 위치 기준으로 검색
              centerLon: currentLocation?.lng,
              multiPoint: "Y"
            },
            headers: {
              Accept: "application/json",
              appKey: TMAP_API_KEY,
            },
          };
  
          const res = await axios.request(options);
          const addPoiArray = res.data.searchPoiInfo.pois.poi;
  
          // 추가 API 호출하여 받은 데이터가 20개 미만인 경우, 무한 스크롤 방지
          if (addPoiArray.length < 20) {
            setHasMore(false);
          }
  
          // 기존 리스트에 추가로 요청한 데이터를 더함
          setDataList((prev) => [...prev, ...addPoiArray]);

          // 페이지 값도 1 증가시켜 무한 스크롤 시, 다른 검색 결과값 요청
          setPage((prev) => prev + 1);
        } catch (e) {
          console.log(e);
        }
      } else {
        // 처음 검색 결과가 20개가 아니면 무한 스크롤 방지
        setHasMore(false)
      }
      
    };

    const searchRouteResult = (poi) => {
      // console.log("정보", poi)
      nav(`/poi-route-result/${poiKeyword}`, {state: {poi}})
    }

    return (
      <div>
        <div>
          <SearchBar state={true} lat={currentLocation?.lat} lng={currentLocation?.lng} />
        </div>
        <div className="white-nav-bar" />
        <div>
          <div className="loc-results" id='poi-div'>
            {Array.isArray(poiArray) && poiArray.length === 0 ? (
              <div className="no-result">
                  <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              dataList?.map((poi, index) => (
                <button key={index} className="poi-result-btn" onClick={() => searchRouteResult(poi)}>
                  <div className="poi-result-btn-inner-div">
                    {poi.name.includes(poiKeyword) ? (
                      <p className="poi-name">
                        {poi.name.split(poiKeyword)[0]}
                        <span style={{ color: "#328af5" }}>{poiKeyword}</span>
                        {poi.name.split(poiKeyword)[1]}
                      </p>
                    ) : (
                      <p className="poi-name">{poi.name}</p>
                    )}
                    <p className="poi-explanation">{poi.middleBizName}</p>
                  </div>
                  <p className="poi-addr">
                    {poi.upperAddrName} {poi.roadName} {poi.firstBuildNo}
                  </p>
                </button>
              ))
            )}
            {/* hasMore 값이 true여야만 무한 스크롤 가능 */}
            {hasMore && 
            <div ref={ref} className='inf-scroll-div'>
              <img src={loadingGIF}/>
            </div>}
          </div>
        </div>
      </div>
    );
}

export default SearchResult;
