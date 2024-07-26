import React from 'react'
import { useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';

const SearchResult = () => {
    // useNavigate를 통해 보낸 porps 받는 useLocation
    // 검색 결과와 키워드를 props로 받아서 렌더링 처리
    const {state: {poiArray, poiKeyword}} = useLocation()
    console.log(poiKeyword)
  return (
    <div>
      <div>
        <SearchBar props={true} />
      </div>
      <div>
        <div className="loc-results">
          {poiArray == "no-result" ? (
            <div className="no-result">
                <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            poiArray.map((poi, index) => (
              <button key={index} className="poi-result-btn">
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
                  <p className="poi-explanation">{poi.detailBizName}</p>
                </div>
                <p className="poi-addr">
                  {poi.upperAddrName} {poi.roadName} {poi.firstBuildNo}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResult