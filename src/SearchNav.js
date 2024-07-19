import React, {useState} from "react";
import axios from "axios";

const SearchNav = () => {

    const [poiKeyword, setPoiKeyword] = useState('')
    const [poiList, setPoiList] = useState([])

    const getPOIData = () => {
        const options = {
          method: 'GET',
          url: 'https://apis.openapi.sk.com/tmap/pois',
          params: {
            version: '1',
            searchKeyword: poiKeyword,
            count: '10'
          },
          headers: {Accept: 'application/json', appKey: 'pboZppgQ8U4d6HG9FcdfX5KABc9DMuC5bDO7Ot98'}
        }
        axios
          .request(options)
          .then((res) => {
            const poiArray = res.data.searchPoiInfo.pois.poi
            setPoiList(poiArray)
            
            console.log(poiArray)
          })
          .catch((e) => {
            console.log(e)
          })
      }
    
      const handleKeyword = (e) => {
        setPoiKeyword(e.target.value)
        // console.log(e.target.value)
      }

  return (
    <div>
      <input type="text" value={poiKeyword} onChange={handleKeyword}></input>
      <button onClick={getPOIData}>정보가져오기</button>
      {poiList?.map((poi, index) => (
        <div key={index} className="poi-result-container">
          <p className="poi-name">{poi.name}</p>
          <p className="poi-addr">
            {poi.upperAddrName} {poi.roadName} {poi.firstBuildNo}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SearchNav;
