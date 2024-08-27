import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

import PedestrianRoute from './PedestrianRoute'

import X_img from './img/white_x_48.png' 
import search_img from './img/white_search_50.png'

const StartEndInput = () => {
    // const {state: {selected, myCurrentLocation, poi}} = useLocation()
    const nav = useNavigate()
    
    const [startCoord, setStartCoord] = useState(null)
    const [endCoord, setEndCoord] = useState(null)
    const [startInput, setStartInput] = useState(null)
    const [endInput, setEndInput] = useState(null)
    const [isRouteOpen, setIsRouteOpen] = useState(false)

    useEffect(()=> {
        // if(selected == 'start') {
        //     setStartCoord(poi)

        //     setStartInput(poi.name)
        // } else {
        //     setStartCoord(myCurrentLocation)
        //     setEndCoord(poi)

            const options = {
                method: "GET",
                url: "https://apis.openapi.sk.com/tmap/geo/reversegeocoding",
                params: {
                  version: "1",
                  lat: 37.0116265,
                  lon: 127.2642483,
                },
                headers: {
                  Accept: "application/json",
                  appKey: "pboZppgQ8U4d6HG9FcdfX5KABc9DMuC5bDO7Ot98",
                },
              };
              axios
                .request(options)
                .then((res) => {
                  // 정상적으로 불러오면
                  const poiData = res.data;
                  console.log("데이터", poiData)

                  setStartInput(poiData.addressInfo.fullAddress)

                  console.log(startInput)
                })
                .catch((e) => {
                  console.log(e)
                });

                // setIsRouteOpen(true)
        // }
    }, [])

    const reloadMap = () => {
      nav("/");
    }

    const changeStartInput = (e) => {
        setStartInput(e.target.value)
    }

    const changeEndInput = (e) => {
        setEndInput(e.target.value)
    }

  return (
    <div className="entire-container">
      <div className="top-nav-container">
        <div className="start-end-input-div">
          <div>
            <input
              value={startInput}
              onChange={changeStartInput}
              placeholder="출발지를 입력하세요"
            ></input>
          </div>
          <div style={{ marginTop: "2px" }}>
            <input
              value={endInput}
              onChange={changeEndInput}
              placeholder="도착지를 입력하세요"
            ></input>
          </div>
        </div>
        <div className="x-search-btn-div">
          <button
            className="X-btn"
            onClick={reloadMap}
          >
            <img src={X_img} />
          </button>
        </div>
      </div>
      {isRouteOpen && (
        <div>
          <PedestrianRoute />
        </div>
      )}
    </div>
  );
}

export default StartEndInput