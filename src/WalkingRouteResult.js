import React, {useEffect, useState, useRef} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

import SearchBar from './SearchBar'

import redMarker_img from "./img/markerE_45.png"
import myLoc_img from "./img/my_location_50.png"
import redPoint_img from "./img/redPoint_20.png"
import loading_gif from './img/loading.gif'
import upArrow_img from './img/up_arrow_48.png'
import downArrow_img from './img/down_arrow_48.png'
import call_img from './img/call_64.png'


// Tmap API를 사용
const { Tmapv2 } = window;

const WalkingRouteResult = () => {
    const TMAP_API_KEY = process.env.REACT_APP_TMAP_API_KEY

    const {state: {poi}} = useLocation()
    console.log("정보가져오기", poi)

    const nav = useNavigate()
  
    const [map, setMap] = useState(null)
    const [myCurrentLocation, setMyCurrentLocation] = useState(null)
    const [destinationMarker, setDestinationMarker] = useState(null)
    const [currentMarker, setCurrentMarker] = useState(null)
    const [distance, setDistance] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isHiding, setIsHiding] = useState(false)
    const [fixLocation, setFixLocation] = useState(null)
    const [isSave, setIsSave] = useState(false)

    const initDestinationMap = () => {
        const latToNum = Number(poi.noorLat)
        const newCenterLat = String(latToNum - 0.002)

        const destinationMapDiv = document.getElementById("destination-map")
        if(!destinationMapDiv.children.length) {
            const newCenterCoord = new Tmapv2.LatLng(newCenterLat, poi.noorLon);
            const destinationLocation = new Tmapv2.LatLng(poi.noorLat, poi.noorLon);
            const newMap = new Tmapv2.Map("destination-map", {
                center: newCenterCoord,
                width: "100vw",
                height: "100vh",
                zoom: 16,
                zoomControl: true,
                scrollwheel: true,
                httpsMode: true,
              });

              setMap(newMap)
    
              const newMarker = new Tmapv2.Marker({
                position: destinationLocation,
                map: newMap,
                icon: redMarker_img,
              });

              setDestinationMarker(newMarker)
        }
    }

    // 직선거리 구하는 함수 - 사용 x
    const distanceToDestination = async () => {
      console.log("안뜨나?",fixLocation)
        try {
            const options = {
              method: "GET",
              url: "https://apis.openapi.sk.com/tmap/routes/distance",
              params: {
                version: "1",
                startX: fixLocation?.lng,  // 시작점 경도
                startY: fixLocation?.lat,  // 시작점 위도
                endX: poi.noorLon,               // 도착점 경도
                endY: poi.noorLat,               // 도착점 위도
              },
              headers: {
                Accept: "application/json",
                appKey: TMAP_API_KEY,
              },
            };
    
            const res = await axios.request(options);
            const resDistance = res.data.distanceInfo;
            console.log(resDistance.distance)

            setDistance(resDistance.distance)

            distance ? setIsLoading(false) : setIsLoading(true)
          } catch (e) {
            console.log(e);
          }
    }

    // 현재 위치 버튼 클릭 핸들러
  const handleCurrentLocationClick = () => {
    if (myCurrentLocation && map) {
      map.setCenter(
        new Tmapv2.LatLng(myCurrentLocation?.lat, myCurrentLocation?.lng)
      );
    }
  };

  // 내 위치 포인트 업데이트 함수
  const updateMarker = (lat, lng) => {
    const newLoc = new Tmapv2.LatLng(lat, lng);

    if (currentMarker) {
        currentMarker.setPosition(newLoc);
    } else if (map) {
      const newMarker = new Tmapv2.Marker({
        position: newLoc,
        map: map,
        icon: redPoint_img,
      });
      setCurrentMarker(newMarker);
    }
  };

  const fixMyLoc = () => {
    setFixLocation(myCurrentLocation)
  }

    useEffect(()=> {
        initDestinationMap()
    },[])

    // 웹뷰에서 메시지를 받을 때마다 위치를 업데이트 (지도 및 마커용)
    useEffect(() => {
        const handleMessage = (e) => {
          const myLocation = JSON.parse(e.data);

          const { lat, lng } = myLocation;
          setMyCurrentLocation({ lat, lng });

          if(myCurrentLocation && !isSave) {
            fixMyLoc()
            setIsSave(true)
          }
        };

        if (!map) {
            initDestinationMap();
          } else {
            updateMarker(myCurrentLocation?.lat, myCurrentLocation?.lng);
            
            // 경로 탐색 api 요청 함수
            // distanceToDestination()
          }
    
        // 지속적으로 listen
        document.addEventListener("message", handleMessage);
    
        // 언마운트 시 종료
        return () => {
          document.removeEventListener("message", handleMessage);
        };
      }, [myCurrentLocation]);

      const goPedestrianRoute = (e) => {
        if(myCurrentLocation) {
          nav('/pedestrian-route', {state : {myCurrentLocation, poi}})
        }
      }

  return (
    <div className="route-result-main-div">
      <div>
        <SearchBar state={true} lat={myCurrentLocation?.lat} lng={myCurrentLocation?.lng} />
      </div>
      <div id="destination-map"></div>
      <div
        className={
          isHiding ? "destination-info-div-hide" : "destination-info-div-appear"
        }
      >
        <div className="cur-loc-div">
          <button
            className="res-cur-loc-btn"
            onClick={handleCurrentLocationClick}
          >
            <img className="my-loc-img" src={myLoc_img} />
          </button>
        </div>
        <div className="up-down-arrow-div">
          {isHiding ? (
            <button onClick={() => setIsHiding(false)}>
              <img src={upArrow_img} />
            </button>
          ) : (
            <button onClick={() => setIsHiding(true)}>
              <img src={downArrow_img} />
            </button>
          )}
        </div>
        {!isLoading ? (
          <div className="loading-destination-info">
            <img src={loading_gif} />
          </div>
        ) : (
          <div className="destination-info-div">
            <div>
              <div className="info-header-div">
                <p className="info-name">{poi.name}</p>
                <p className="info-middle-name">{poi.middleBizName}</p>
              </div>
              <div className="info-addr-div">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ color: "#a5a5a5" }}>도로명 :</p>
                  <p className="info-addr">
                    {poi.newAddressList.newAddress[0].fullAddressRoad}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ color: "#a5a5a5" }}>지번 :</p>
                  <p className="info-addr">
                    {poi.lowerAddrName} {poi.detailAddrName} {poi.firstNo}-
                    {poi.secondNo}
                  </p>
                </div>
                <div className="info-call-div">
                  <img className="info-call-img" src={call_img} />
                  <p className="info-tel-num">{poi.telNo}</p>
                </div>
              </div>
              <div className="info-footer">
                <div>
                  {/* <p>
                    {distance && distance >= 1000
                      ? (distance / 1000).toFixed(1) + "km"
                      : distance + "m"}
                  </p> */}
                  {/* <p>293m</p> */}
                </div>
                <div className='depart-desti-btn-div'>
                  <button onClick={goPedestrianRoute} value="end"><p>목적지 설정</p></button>
                </div>
              </div>
            </div>
            {/* <div></div> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default WalkingRouteResult