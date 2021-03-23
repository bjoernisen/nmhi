class Forecast {
  constructor(city, name, searched, wheater, lat, lng) {
    this.city = city;
    this.name = name;
    this.searched = searched;
    this.wheater = wheater;
    this.lat = lat;
    this.lng = lng;
  }
}

window.addEventListener("load", getLocation);
document.getElementById("search").addEventListener("keypress", loadCities);
document.getElementById("searchBtn").addEventListener("click", searchCity);

let wheatherKey1 =
  "7ed18cf6-8726-11eb-9f69-0242ac130002-7ed18d64-8726-11eb-9f69-0242ac130002";
let wheatherKey2 =
  "c211895a-871f-11eb-8ad5-0242ac130002-c2118a86-871f-11eb-8ad5-0242ac130002";
let wheaterParams =
  "airTemperature,cloudCover,gust,humidity,precipitation,windSpeed";
let geocodeKey = "aAUORVN56nmMcGN5QmVuHjmELGIstOil";
let lat = "";
let lng = "";

let apiFromCity = `http://www.mapquestapi.com/geocoding/v1/address?key=${geocodeKey}&location=Washington,DC`;
let apiFromCoordinates = `http://www.mapquestapi.com/geocoding/v1/reverse?key=${geocodeKey}&location=${lat},${lng}&includeRoadMetadata=true&includeNearestIntersection=true`;

let latitude = "59.858211";
let longitude = "17.644494"; // STOCKHOLM

let latSearched = "";
let lngSearched = "";

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showForecast);
  } else {
    document.getElementById("demo").innerHTML =
      "Geolocation is not supported by this browser.";
  }
}

function showForecast(position) {
  let yourForecast = JSON.parse(localStorage.getItem("yourPos"));
  let date;
  console.log(yourForecast);

  if (yourForecast == null) {
    date = new Date();
  }
  else date = new Date(yourForecast.searched);

  let hour = date.getHours();

  if (yourForecast == null) {
    console.log("<---- CALLING API STORM GLASS ---->");
    let forecast = new Forecast();
    forecast.lat = position.coords.latitude;
    forecast.lng = position.coords.longitude;

    fetch(
      `https://api.stormglass.io/v2/weather/point?lat=${forecast.lat}&lng=${forecast.lng}&params=${wheaterParams}`,
      {
        headers: {
          Authorization: wheatherKey2,
        },
      }
    )
      .then((response) => response.json())
      .then((jsonData) => generateForecast(jsonData, forecast));
  } else {
    renderData(yourForecast);
  }
}

function generateForecast(wheater, forecast) {
  console.log(wheater);
  forecast.wheater = wheater;
  forecast.name = "YourPos";
  forecast.searched = new Date();
  getCityFromYourPosition(forecast);
}

function getCityFromYourPosition(forecast) {
  console.log("<---- CALLING API MAPQUEST ON YOUR POSITION ---->");
  fetch(
    `http://www.mapquestapi.com/geocoding/v1/reverse?key=${geocodeKey}&location=${forecast.lat},${forecast.lng}&includeRoadMetadata=true&includeNearestIntersection=true`
  )
    .then((response) => response.json())
    .then((location) => setCityOnYourPosition(location, forecast));
}

function setCityOnYourPosition(location, forecast) {
  forecast.city = location.results[0].locations[0].adminArea5;
  localStorage.setItem("yourPos", JSON.stringify(forecast));
  renderData(forecast);
}


function renderData(forecast) {
  console.log(forecast);

  let date = new Date(forecast.searched);
  let currentHour = date.getHours();

  $(".widget-container")
    .append(`
    <div id="${forecast.name}-upper" class="widget day-clear">
                    <div class="upper-wideget">
                        <div class="city">
                            <h5>${forecast.city}</h5>
                        </div>
                        <div class="cloud">
                            <p>${forecast.wheater.hours[currentHour].cloudCover.smhi}</p>
                            <p>CLD</p> 
                        </div>
                        <div class="rain">
                            <p>${forecast.wheater.hours[currentHour].precipitation.smhi}</p>
                            <p>PPI</p> 
                        </div>
                        <div class="humidity">
                            <p>${forecast.wheater.hours[currentHour].humidity.smhi}</p> 
                            <p>HUM</p>
                        </div>
                        <div class="wind-speed">
                            <p>${forecast.wheater.hours[currentHour].windSpeed.smhi}</p> 
                            <p>WND</p> 
                        </div>
                        <div class="temp">
                            <h3>${Math.round(forecast.wheater.hours[currentHour].airTemperature.smhi)}&deg;</h3>
                        </div>
                    </div> 
                    <div id="${forecast.name}" class="lower-widget">
                        <div class="t1">
                            <p>${currentHour + 2}.00</p> 
                            <h4>${forecast.wheater.hours[currentHour + 2].airTemperature.smhi}&deg;</h4> 
                        </div>
                        <div class="t2">
                            <p>${currentHour + 4}.00</p> 
                            <h4>${forecast.wheater.hours[currentHour + 4].airTemperature.smhi}&deg;</h4>  
                        </div>
                        <div class="t3">
                            <p>${currentHour + 6}.00</p> 
                            <h4>${forecast.wheater.hours[currentHour + 6].airTemperature.smhi}&deg;</h4> 
                        </div>
                        <div class="t4">
                            <p>${currentHour + 8}.00</p> 
                            <h4>${forecast.wheater.hours[currentHour + 8].airTemperature.smhi}&deg;</h4> 
                        </div>
                        <div class="t5">
                            <p>${currentHour + 10}.00</p> 
                            <h4>${forecast.wheater.hours[currentHour + 10].airTemperature.smhi}&deg;</h4>  
                        </div>
                    </div>
                </div>
                `);

  $(`#${forecast.name}`).children().fadeToggle(0);
  let boxHeight = $(`#${forecast.name}-upper`).height();
  $(`#${forecast.name}-upper`).mouseenter(function () {
    $(this)
      .stop(true, false)
      .animate({
        height: "122",
        margin: "0 16 0 16"
      }, 120)
      .find(`#${forecast.name}`)
      .children()
      .stop(true)
      .fadeToggle(200, console.log("a"));
  })
    .mouseleave(function () {
      $(this)
        .stop(true, false)
        .animate({
          height: boxHeight,
          margin: "16 16 16 16"
        }, 180)
        .find(`#${forecast.name}`)
        .children()
        .stop(true)
        .fadeToggle(160, console.log("b"));
    });

  //updateWidgets();


  // localStorage.setItem("wheatherOnYourPosition", JSON.stringify(forecast));
}

function searchCity() {
  let cityName = document.getElementById("search").value;
  console.log(cityName);

  fetch(
    `http://www.mapquestapi.com/geocoding/v1/address?key=${geocodeKey}&location=${cityName}`
  )
    .then((response) => response.json())
    .then((location) => getCityOnSearch(location));
}

function getCityOnSearch(location) {
  console.log(location);
  let forecast = new Forecast();

  forecast.city = location.results[0].locations[0].adminArea5;
  forecast.lat = location.results[0].locations[0].latLng.lat;
  forecast.lng = location.results[0].locations[0].latLng.lng;
  forecast.name = location.results[0].locations[0].adminArea5;
  forecast.searched = new Date();
  generateWheaterForSearchedPos(forecast);
}

function generateWheaterForSearchedPos(forecast) {

  console.log("Calling API for searched city STORM GLASS");
  fetch(
    `https://api.stormglass.io/v2/weather/point?lat=${forecast.lat}&lng=${forecast.lng}&params=${wheaterParams}`,
    {
      headers: {
        Authorization: wheatherKey2,
      },
    }
  )
    .then((response) => response.json())
    .then((wheater) => renderSearchData(wheater, forecast));
}


function renderSearchData(wheater, forecast) {
  forecast.wheater = wheater;
  let date = new Date(forecast.searched);
  let currentHour = date.getHours();

  $(".widget-container")
    .append(`
        <div id="${forecast.name}-upper" class="widget day-clear">
                        <div class="upper-wideget">
                            <div class="city">
                                <h5>${forecast.city}</h5>
                            </div>
                            <div class="cloud">
                                <p>${forecast.wheater.hours[currentHour].cloudCover.smhi}</p>
                                <p>CLD</p> 
                            </div>
                            <div class="rain">
                                <p>${forecast.wheater.hours[currentHour].precipitation.smhi}</p>
                                <p>PPI</p> 
                            </div>
                            <div class="humidity">
                                <p>${forecast.wheater.hours[currentHour].humidity.smhi}</p> 
                                <p>HUM</p>
                            </div>
                            <div class="wind-speed">
                                <p>${forecast.wheater.hours[currentHour].windSpeed.smhi}</p> 
                                <p>WND</p> 
                            </div>
                            <div class="temp">
                                <h3>${Math.round(forecast.wheater.hours[currentHour].airTemperature.smhi)}&deg;</h3>
                            </div>
                        </div> 
                        <div id="${forecast.name}" class="lower-widget">
                            <div class="t1">
                                <p>${currentHour + 2}.00</p> 
                                <h4>${forecast.wheater.hours[currentHour + 2].airTemperature.smhi}&deg;</h4> 
                            </div>
                            <div class="t2">
                                <p>${currentHour + 4}.00</p> 
                                <h4>${forecast.wheater.hours[currentHour + 4].airTemperature.smhi}&deg;</h4>  
                            </div>
                            <div class="t3">
                                <p>${currentHour + 6}.00</p> 
                                <h4>${forecast.wheater.hours[currentHour + 6].airTemperature.smhi}&deg;</h4> 
                            </div>
                            <div class="t4">
                                <p>${currentHour + 8}.00</p> 
                                <h4>${forecast.wheater.hours[currentHour + 8].airTemperature.smhi}&deg;</h4> 
                            </div>
                            <div class="t5">
                                <p>${currentHour + 10}.00</p> 
                                <h4>${forecast.wheater.hours[currentHour + 10].airTemperature.smhi}&deg;</h4>  
                            </div>
                        </div>
                    </div>
                    `);

  $(`#${forecast.name}`).children().fadeToggle(0);
  let boxHeight = $(`#${forecast.name}-upper`).height();
  $(`#${forecast.name}-upper`).mouseenter(function () {
    $(this)
      .stop(true, false)
      .animate({
        height: "122",
        margin: "0 16 0 16"
      }, 120)
      .find(`#${forecast.name}`)
      .children()
      .stop(true)
      .fadeToggle(200, console.log("a"));
  })
    .mouseleave(function () {
      $(this)
        .stop(true, false)
        .animate({
          height: boxHeight,
          margin: "16 16 16 16"
        }, 180)
        .find(`#${forecast.name}`)
        .children()
        .stop(true)
        .fadeToggle(160, console.log("b"));
    });

  //updateWidgets();

  // let searchedWheater = JSON.parse(localStorage.getItem("searchedWheater"));
  // if (searchedWheater == null) searchedWheater = [forecast];
  // else searchedWheater.pop(forecast);
  // localStorage.setItem("searchedWheater", JSON.stringify(searchedWheater));
}

// wheater.hours.forEach((hour, index) => {
//   let date2 = new Date(hour.time);
//   let day = getDayOfTheWeek(date2);
//   // console.log("<-->")
//   // console.log(`Dag:${day}`);
//   // console.log(`Timme:${date2.getHours()}`);
//   // console.log(`Temperatur:${hour.airTemperature.smhi}`);
//   // console.log(hour.time);
//   // console.log(`Index:${index}`);
//   // console.log(">--<");
//   if(index > date.getHours() && index == 0 || index == 6 || index == 12 || index == 18){
//     console.log(`Dag:${day}`);
//     console.log(`Index:${index}`);
//     console.log(`Temperatur:${hour.airTemperature.smhi}`);
//   }

// });

function getDayOfTheWeek(date) {
  let day = "";
  switch (date.getDay()) {
    case 0:
      return (day = "Söndag");
    case 1:
      return (day = "Måndag");
    case 2:
      return (day = "Tisdag");
    case 3:
      return (day = "Onsdag");
    case 4:
      return (day = "Torsdag");
    case 5:
      return (day = "Fredag");
    case 6:
      return (day = "Lördag");

    default:
      return day = "Vet inte";
  }
}

function loadCities(){
  let cities = JSON.parse(localStorage.getItem("cities"));
  if(cities == null){
    console.log("SENDING XHR TO GET CITIES");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "src/svenskastäder.json");
    xhr.send();
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4 && xhr.status === 200){
        let resp = xhr.response;
        cities = JSON.parse(resp);
        localStorage.setItem("cities", JSON.stringify(cities));
        console.log(cities); // array
      }
    }
  }
  console.log("Returning cities from localstorage");
  searchInCities(cities);
}

function searchInCities(cities){
  let search = document.getElementById("search").value;

  cities.foreach(city => {
    
  })
}




