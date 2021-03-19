class Forecast{
    constructor(city, name, searched, wheater){
      this.city = city;
      this.name = name;
      this.searched = searched;
      this.wheater = wheater;
    }
  }
  
  
  let wheatherKey1 = "7ed18cf6-8726-11eb-9f69-0242ac130002-7ed18d64-8726-11eb-9f69-0242ac130002";
  let wheatherKey2 = "c211895a-871f-11eb-8ad5-0242ac130002-c2118a86-871f-11eb-8ad5-0242ac130002";
  let wheaterParams ="airTemperature,cloudCover,gust,humidity,precipitation,windSpeed";
  let geocodeKey = "aAUORVN56nmMcGN5QmVuHjmELGIstOil";
  let lat = "";
  let lng = "";
  
  let apiFromCity = `http://www.mapquestapi.com/geocoding/v1/address?key=${geocodeKey}&location=Washington,DC`;
  let apiFromCoordinates = `http://www.mapquestapi.com/geocoding/v1/reverse?key=${geocodeKey}&location=${lat},${lng}&includeRoadMetadata=true&includeNearestIntersection=true`;
  
  
  
  let latitude = "59.858211";
  let longitude = "17.644494"; // STOCKHOLM
  
  let latSearched = "";
  let lngSearched = "";
  
  
  let date = new Date();
  console.log(date);
  let index = date.getHours();
  console.log(index);
  
  
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      document.getElementById("demo").innerHTML = "Geolocation is not supported by this browser.";
    }
  }
  
  function showPosition(position) {
    console.log(position);
    let wheater = JSON.parse(localStorage.getItem("wheatherOnYourPosition"));
    if (wheater == null) {
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      console.log("<---- CALLING API STORM GLASS ---->");
      console.log(lat);
      console.log(lng);
      fetch(
        `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${wheaterParams}`,
        {
          headers: {
            Authorization:
              wheatherKey1,
          },
        }
      )
        .then((response) => response.json())
        .then((jsonData) => renderData(jsonData));
    } else {
      renderData(wheater);
    }
  }
  
  function renderData(wheater) {
    console.log(wheater);
    console.log(wheater.hours[index].airTemperature.smhi);
    let currentTemp = wheater.hours[index].airTemperature.smhi;
    let currentPrecipation = wheater.hours[index].precipitation.smhi;
    let currentWindSpeed = wheater.hours[index].windSpeed.smhi;
    let currentcloudCover = wheater.hours[index].cloudCover.smhi;
    let currenthumidity = wheater.hours[index].humidity.smhi;
    let currentgusts = wheater.hours[index].gust.smhi;
    let currentTime = wheater.hours[index].time;
  
    document.getElementById("demo").innerText = `
      Nuvarande temperatur på din plats: ${currentTemp}c
      Nuvarande nederbörd på din plats: ${currentPrecipation}mm
      Nuvarande vindstyrka på din plats: ${currentWindSpeed}m/s
      Nuvarande styrka i vindbyar på din plats: ${currentgusts}m/s
      Nuvarande molnighet på din plats: ${currentcloudCover}%
      Nuvarande fuktighet på din plats: ${currenthumidity}%
      Nuvarande tid på din plats: ${currentTime}%
      `;
  
    localStorage.setItem("wheatherOnYourPosition", JSON.stringify(wheater));
  }
  
  function getCityFromYourPosition(){
    let location = JSON.parse(localStorage.getItem("yourPosition"));
    if(location == null){
      console.log("<---- CALLING API MAPQUEST ON YOUR POSITION ---->");
      fetch(`http://www.mapquestapi.com/geocoding/v1/reverse?key=${geocodeKey}&location=${lat},${lng}&includeRoadMetadata=true&includeNearestIntersection=true`)
        .then((response) => response.json())
        .then((location) => showCityOnYourPosition(location));
      }
      else showCityOnYourPosition(location);
    }
  
  function showCityOnYourPosition(location){
   
    console.log(location);
  
    let street = location.results[0].locations[0].street;
    let city = location.results[0].locations[0].adminArea5;
    let län = location.results[0].locations[0].adminArea3;
    let land = location.results[0].locations[0].adminArea1;
    
    document.getElementById("demo2").innerText = `
      Nuvarande plats: ${city}
      Gata: ${street}
      Län: ${län}
      Land: ${land}
    `;
  
    localStorage.setItem("yourPosition", JSON.stringify(location));
  }
  
  
  function searchCity(){
    let cityName = document.getElementById("hej").value;
    console.log(cityName);
  
    fetch(`http://www.mapquestapi.com/geocoding/v1/address?key=${geocodeKey}&location=${cityName}`)
        .then((response) => response.json())
        .then((location) => showCityOnSearch(location));
  }
  
  function showCityOnSearch(location){
    console.log(location); // Hej rasmus :D
    
    let city = location.results[0].locations[0].adminArea5;
    let county = location.results[0].locations[0].adminArea3;
    let country = location.results[0].locations[0].adminArea1;
    latSearched = location.results[0].locations[0].latLng.lat;
    lngSearched = location.results[0].locations[0].latLng.lng;
  
    document.getElementById("demo3").innerText = `
      Sökt på stad: ${city}
      Län: ${county}
      Land: ${country}
      Latitude: ${latSearched}
      Longitude: ${lngSearched}
    `;
  }
  
  function searchedWheater(){
    fetch(
      `https://api.stormglass.io/v2/weather/point?lat=${latSearched}&lng=${lngSearched}&params=${wheaterParams}`,
      {
        headers: {
          Authorization:
            wheatherKey1,
        },
      }
    )
      .then((response) => response.json())
      .then((jsonData) => renderSearchData(jsonData));
  }
  
  
  
  function renderSearchData(wheater) {
  
    console.log(wheater);
    console.log(wheater.hours[index].airTemperature.smhi);
    let currentTemp = wheater.hours[index].airTemperature.smhi;
    let currentPrecipation = wheater.hours[index].precipitation.smhi;
    let currentWindSpeed = wheater.hours[index].windSpeed.smhi;
    let currentcloudCover = wheater.hours[index].cloudCover.smhi;
    let currenthumidity = wheater.hours[index].humidity.smhi;
    let currentgusts = wheater.hours[index].gust.smhi;
    let currentTime = wheater.hours[index].time;
  
    document.getElementById("demo4").innerText = `
      Sökt stads temperatur: ${currentTemp}c
      Sökt stads nederbörd: ${currentPrecipation}mm
      Sökt stads vindstyrka: ${currentWindSpeed}m/s
      Sökt stads styrka i vindbyar: ${currentgusts}m/s
      Sökt stads molnighet: ${currentcloudCover}%
      Sökt stads fuktighet: ${currenthumidity}%
      Sökt stads tid: ${currentTime}%
      `;
  
    let searchedWheater = JSON.parse(localStorage.getItem("searchedWheater"));
    if(searchedWheater == null) searchedWheater = [];
    searchedWheater.pop(wheater);
    localStorage.setItem("searchedWheater", JSON.stringify(searchedWheater));
  }
  