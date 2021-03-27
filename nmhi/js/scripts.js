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
document.getElementById("search").addEventListener("keypress", searchInCities);
document.getElementById("searchBtn").addEventListener("click", searchCity);

let cities = [];

let wheatherKey1 =
  "7ed18cf6-8726-11eb-9f69-0242ac130002-7ed18d64-8726-11eb-9f69-0242ac130002";
let wheatherKey2 =
  "c211895a-871f-11eb-8ad5-0242ac130002-c2118a86-871f-11eb-8ad5-0242ac130002";
let wheaterParams =
  "airTemperature,cloudCover,gust,humidity,precipitation,windSpeed";
let geocodeKey = "aAUORVN56nmMcGN5QmVuHjmELGIstOil";

function getLocation() {
  loadInForecasts();
  loadCities();
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
  // console.log(yourForecast);

  if (yourForecast == null) {
    date = new Date();
  } else date = new Date(yourForecast.searched);

  if (yourForecast == null) {
    console.log("<---- CALLING API STORM GLASS ---->");
    let forecast = new Forecast();
    forecast.lat = position.coords.latitude;
    forecast.lng = position.coords.longitude;

    fetch(
      `https://api.stormglass.io/v2/weather/point?lat=${forecast.lat}&lng=${forecast.lng}&params=${wheaterParams}`,
      {
        headers: {
          Authorization: wheatherKey1,
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
  // console.log(forecast);

  let date = new Date(forecast.searched);
  let currentHour = date.getHours();
  let name = forecast.city.split(" ");
  

  $(".widget-container").prepend(`
    <div id="${name[0]}-upper" class="widget ${setWheaterBackground(
    forecast
  )}">
                    <div class="upper-wideget">
                        <div class="city">
                            <h5>${name[0]}</h5>
                        </div>
                        <div class="cloud">
                            <p>${
                              forecast.wheater.hours[currentHour].cloudCover
                                .smhi
                            }</p>
                            <p>CLD</p> 
                        </div>
                        <div class="rain">
                            <p>${
                              forecast.wheater.hours[currentHour].precipitation
                                .smhi
                            }</p>
                            <p>PPI</p> 
                        </div>
                        <div class="humidity">
                            <p>${
                              forecast.wheater.hours[currentHour].humidity.smhi
                            }</p> 
                            <p>HUM</p>
                        </div>
                        <div class="wind-speed">
                            <p>${
                              forecast.wheater.hours[currentHour].windSpeed.smhi
                            }</p> 
                            <p>WND</p> 
                        </div>
                        <div class="temp">
                            <h3>${Math.round(
                              forecast.wheater.hours[currentHour].airTemperature
                                .smhi
                            )}&deg;</h3>
                        </div>
                    </div> 
                    <div id="${name[0]}" class="lower-widget">
                        <div class="t1">
                            <p>${currentHour + 2}.00</p> 
                            <h4>${
                              forecast.wheater.hours[currentHour + 2]
                                .airTemperature.smhi
                            }&deg;</h4> 
                        </div>
                        <div class="t2">
                            <p>${currentHour + 4}.00</p> 
                            <h4>${
                              forecast.wheater.hours[currentHour + 4]
                                .airTemperature.smhi
                            }&deg;</h4>  
                        </div>
                        <div class="t3">
                            <p>${currentHour + 6}.00</p> 
                            <h4>${
                              forecast.wheater.hours[currentHour + 6]
                                .airTemperature.smhi
                            }&deg;</h4> 
                        </div>
                        <div class="t4">
                            <p>${currentHour + 8}.00</p> 
                            <h4>${
                              forecast.wheater.hours[currentHour + 8]
                                .airTemperature.smhi
                            }&deg;</h4> 
                        </div>
                        <div class="t5">
                            <p>${currentHour + 10}.00</p> 
                            <h4>${
                              forecast.wheater.hours[currentHour + 10]
                                .airTemperature.smhi
                            }&deg;</h4>  
                        </div>
                    </div>
                </div>
                `);

  $(`#${name[0]}`).children().fadeToggle(0);
  let boxHeight = $(`#${name[0]}-upper`).height();
  $(`#${name[0]}-upper`)
    .mouseenter(function () {
      $(this)
        .stop(true, false)
        .animate(
          {
            height: "122",
            margin: "0 16 0 16",
          },
          120
        )
        .find(`#${name[0]}`)
        .children()
        .stop(true)
        .fadeToggle(200);
    })
    .mouseleave(function () {
      $(this)
        .stop(true, false)
        .animate(
          {
            height: boxHeight,
            margin: "16 16 16 16",
          },
          180
        )
        .find(`#${name[0]}`)
        .children()
        .stop(true)
        .fadeToggle(160);
    })
    .click(function () {
      showBigForecast(forecast);
    });
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

function searchCityFromButton(cityName) {
  console.log("SÖKER PÅ STAD FRÅN FÖRSLAG PÅ SÖKNING");
  document.getElementById("searchArea").innerHTML = "";

  fetch(
    `http://www.mapquestapi.com/geocoding/v1/address?key=${geocodeKey}&location=${cityName}`
  )
    .then((response) => response.json())
    .then((location) => getCityOnSearch(location));
}

function getCityOnSearch(location) {
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
        Authorization: wheatherKey1,
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
  let name = forecast.name.split(" ");

  $(".widget-container").append(`
        <div id="${name[0]}-upper" class="widget ${setWheaterBackground(
    forecast
  )}">
                        <div class="upper-wideget">
                            <div class="city">
                                <h5>${name[0]}</h5>
                            </div>
                            <div class="cloud">
                                <p>${
                                  forecast.wheater.hours[currentHour].cloudCover
                                    .smhi
                                }</p>
                                <p>CLD</p> 
                            </div>
                            <div class="rain">
                                <p>${
                                  forecast.wheater.hours[currentHour]
                                    .precipitation.smhi
                                }</p>
                                <p>PPI</p> 
                            </div>
                            <div class="humidity">
                                <p>${
                                  forecast.wheater.hours[currentHour].humidity
                                    .smhi
                                }</p> 
                                <p>HUM</p>
                            </div>
                            <div class="wind-speed">
                                <p>${
                                  forecast.wheater.hours[currentHour].windSpeed
                                    .smhi
                                }</p> 
                                <p>WND</p> 
                            </div>
                            <div class="temp">
                                <h3>${Math.round(
                                  forecast.wheater.hours[currentHour]
                                    .airTemperature.smhi
                                )}&deg;</h3>
                            </div>
                        </div> 
                        <div id="${name[0]}" class="lower-widget">
                            <div class="t1">
                                <p>${currentHour + 2}.00</p> 
                                <h4>${
                                  forecast.wheater.hours[currentHour + 2]
                                    .airTemperature.smhi
                                }&deg;</h4> 
                            </div>
                            <div class="t2">
                                <p>${currentHour + 4}.00</p> 
                                <h4>${
                                  forecast.wheater.hours[currentHour + 4]
                                    .airTemperature.smhi
                                }&deg;</h4>  
                            </div>
                            <div class="t3">
                                <p>${currentHour + 6}.00</p> 
                                <h4>${
                                  forecast.wheater.hours[currentHour + 6]
                                    .airTemperature.smhi
                                }&deg;</h4> 
                            </div>
                            <div class="t4">
                                <p>${currentHour + 8}.00</p> 
                                <h4>${
                                  forecast.wheater.hours[currentHour + 8]
                                    .airTemperature.smhi
                                }&deg;</h4> 
                            </div>
                            <div class="t5">
                                <p>${currentHour + 10}.00</p> 
                                <h4>${
                                  forecast.wheater.hours[currentHour + 10]
                                    .airTemperature.smhi
                                }&deg;</h4>  
                            </div>
                        </div>
                    </div>
                    `);

  $(`#${name[0]}`).children().fadeToggle(0);
  let boxHeight = $(`#${name[0]}-upper`).height();
  $(`#${name[0]}-upper`)
    .mouseenter(function () {
      $(this)
        .stop(true, false)
        .animate(
          {
            height: "122",
            margin: "0 16 0 16",
          },
          120
        )
        .find(`#${name[0]}`)
        .children()
        .stop(true)
        .fadeToggle(200);
    })
    .mouseleave(function () {
      $(this)
        .stop(true, false)
        .animate(
          {
            height: boxHeight,
            margin: "16 16 16 16",
          },
          180
        )
        .find(`#${name[0]}`)
        .children()
        .stop(true)
        .fadeToggle(160);
    })
    .click(function () {
      showBigForecast(forecast);
    });

    let searchedForecast = JSON.parse(localStorage.getItem("searchedForecasts"));
    if(searchedForecast == null) {
      console.log("TOMT i sök, skapar ny array")
      searchedForecast = [forecast];
    }
    else searchedForecast.push(forecast);
    localStorage.setItem("searchedForecasts", JSON.stringify(searchedForecast));
}

function loadInForecasts() {
  let forecasts = JSON.parse(localStorage.getItem("searchedForecasts"));
  if (forecasts != null) {
    forecasts.forEach((forecast) => {
      let name = forecast.name.split(" ");
      let date = new Date(forecast.searched);
      let currentHour = date.getHours();


      $(".widget-container")
      .append(`
      <div id="${name[0]}-upper" class="widget ${setWheaterBackground(
        forecast
      )}">
      <div class="upper-wideget">
      <div class="city">
      <h5>${name[0]}</h5>
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
      <h3>${Math.round(
        forecast.wheater.hours[currentHour].airTemperature.smhi
      )}&deg;</h3>
      </div>
      </div> 
      <div id="${name[0]}" class="lower-widget">
      <div class="t1">
      <p>${currentHour + 2}.00</p> 
      <h4>${
        forecast.wheater.hours[currentHour + 2].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t2">
      <p>${currentHour + 4}.00</p> 
      <h4>${
        forecast.wheater.hours[currentHour + 4].airTemperature.smhi
      }&deg;</h4>  
      </div>
      <div class="t3">
      <p>${currentHour + 6}.00</p> 
      <h4>${
        forecast.wheater.hours[currentHour + 6].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t4">
      <p>${currentHour + 8}.00</p> 
      <h4>${
        forecast.wheater.hours[currentHour + 8].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t5">
      <p>${currentHour + 10}.00</p> 
      <h4>${
        forecast.wheater.hours[currentHour + 10].airTemperature.smhi
      }&deg;</h4>  
      </div>
      </div>
      </div>
      `);

      $(`#${name[0]}`).children().fadeToggle(0);
      let boxHeight = $(`#${name[0]}-upper`).height();
      $(`#${name[0]}-upper`)
        .mouseenter(function () {
          $(this)
            .stop(true, false)
            .animate(
              {
                height: "122",
                margin: "0 16 0 16",
              },
              120
            )
            .find(`#${name[0]}`)
            .children()
            .stop(true)
            .fadeToggle(200);
        })
        .mouseleave(function () {
          $(this)
            .stop(true, false)
            .animate(
              {
                height: boxHeight,
                margin: "16 16 16 16",
              },
              180
            )
            .find(`#${name[0]}`)
            .children()
            .stop(true)
            .fadeToggle(160);
        })
        .click(function () {
          showBigForecast(forecast);
        });
    });
  }
}

function showBigForecast(forecast) {
  document.getElementById("jumbotron").innerHTML = "";
  console.log(forecast);
  $("#jumbotron")
  .prepend(`
  <div class="city-and-close-button">
  <h1>${forecast.name}</h1>
  </div>`)
  renderTodaysForecast(forecast);
  renderTomorrowsForecast(forecast);
  renderDayAfterTomorrowForecast(forecast);
}

function renderDayAfterTomorrowForecast(forecast){
  let afterTomorrow = "";
  let now = new Date();
  let ms = now.getTime();
  let msDayAfterTommorow = ms + 172800000;
  let dateDayAfterTomorrow = new Date(msDayAfterTommorow);

  let day = getDayOfTheWeek(dateDayAfterTomorrow);
  let name = forecast.name.split(" ");
  afterTomorrow += `
  <div class="jumbotron-day">
  <div id="${name[0]}-jumbotron-afttmrw" class="jumbotron-item">
  <div class="item-day">
    <h2>${day}</h2>
  </div>
  <div class="item-temp">
    <h5>Temp C</h5>
    <h3>${forecast.wheater.hours[61].airTemperature.smhi}&deg;</h3>
  </div>
  <div class="item-cloud">
    <h5>Cloud %</h5>
    <p>${forecast.wheater.hours[61].cloudCover.smhi}</p>
  </div>
  <div class="item-percipitation">
    <h5>Rain mm</h5>
    <p>${forecast.wheater.hours[61].precipitation.smhi}</p>
  </div>
  <div class="item-wind">
    <h5>Wind m/s</h5>
    <p>${forecast.wheater.hours[61].windSpeed.smhi}</p>
  </div>
  <div class="item-gust">
    <h5>Gust m/s</h5>
    <p>${forecast.wheater.hours[61].gust.smhi}</p>
  </div>
  <div class="item-humidity">
    <h5>Humidity %</h5>
    <p>${forecast.wheater.hours[61].humidity.smhi}</p>
  </div>
</div>`;

   for(i = 48; i < 72; i++){
    afterTomorrow +=`
    <div id="${name[0]}-jumbotron-inner-afttmrw" class="jumbotron-item-days">
      <div class="jumbotron-content">
        <div class="c-hour">
          <h3>${i-48}.00</h3>
        </div>
        <div class="c-temp">
          <h4>${forecast.wheater.hours[i].airTemperature.smhi}&deg;</h4>
        </div>
        <div class="c-cloud">
          <p>${forecast.wheater.hours[i].cloudCover.smhi}</p>
        </div>
        <div class="item-percipitation">
          <p>${forecast.wheater.hours[i].precipitation.smhi}</p>
        </div>
        <div class="item-wind">
          <p>${forecast.wheater.hours[i].windSpeed.smhi}</p>
        </div>
        <div class="c-gust">
          <p>${forecast.wheater.hours[i].gust.smhi}</p>
        </div>
        <div class="c-humidity">
          <p>${forecast.wheater.hours[i].humidity.smhi}</p>
        </div>
      </div>
    </div>
  `;
  }
  afterTomorrow += "</div>";
  
  $("#jumbotron")
  .append(afterTomorrow);

  $(`#${name[0]}-jumbotron-afttmrw`)
  .click(function () {
      $(`#${name[0]}-jumbotron-inner-afttmrw`)
      .stop(true)
      .slideToggle(350);
  });
}

function renderTomorrowsForecast(forecast){

  let tomorrow = "";
  let name = forecast.name.split(" ");
  tomorrow += `
  <div class="jumbotron-day">
  <div id="${name[0]}-jumbotron-tmrw" class="jumbotron-item">
  <div class="item-day">
    <h2>Tomorrow</h2>
  </div>
  <div class="item-temp">
    <h5>Temp C</h5>
    <h3>${forecast.wheater.hours[37].airTemperature.smhi}&deg;</h3>
  </div>
  <div class="item-cloud">
    <h5>Cloud %</h5>
    <p>${forecast.wheater.hours[37].cloudCover.smhi}</p>
  </div>
  <div class="item-percipitation">
    <h5>Rain mm</h5>
    <p>${forecast.wheater.hours[37].precipitation.smhi}</p>
  </div>
  <div class="item-wind">
    <h5>Wind m/s</h5>
    <p>${forecast.wheater.hours[37].windSpeed.smhi}</p>
  </div>
  <div class="item-gust">
    <h5>Gust m/s</h5>
    <p>${forecast.wheater.hours[37].gust.smhi}</p>
  </div>
  <div class="item-humidity">
    <h5>Humidity %</h5>
    <p>${forecast.wheater.hours[37].humidity.smhi}</p>
  </div>
</div>`;

   for(i = 24; i < 48; i++){
    tomorrow +=`
    <div id="${name[0]}-jumbotron-inner-tmrw" class="jumbotron-item-days">
      <div class="jumbotron-content">
        <div class="c-hour">
          <h3>${i-24}.00</h3>
        </div>
        <div class="c-temp">
          <h4>${forecast.wheater.hours[i].airTemperature.smhi}&deg;</h4>
        </div>
        <div class="c-cloud">
          <p>${forecast.wheater.hours[i].cloudCover.smhi}</p>
        </div>
        <div class="item-percipitation">
          <p>${forecast.wheater.hours[i].precipitation.smhi}</p>
        </div>
        <div class="item-wind">
          <p>${forecast.wheater.hours[i].windSpeed.smhi}</p>
        </div>
        <div class="c-gust">
          <p>${forecast.wheater.hours[i].gust.smhi}</p>
        </div>
        <div class="c-humidity">
          <p>${forecast.wheater.hours[i].humidity.smhi}</p>
        </div>
      </div>
    </div>
  `;
  }
  tomorrow += "</div>";
  
  $("#jumbotron")
  .append(tomorrow);

  $(`#${name[0]}-jumbotron-tmrw`)
  .click(function () {
      $(`#${name[0]}-jumbotron-inner-tmrw`)
      .stop(true)
      .slideToggle(350);
  });

}

function renderTodaysForecast(forecast){
  let date = new Date(forecast.searched);
  let name = forecast.name.split(" ");

  let currentHour = date.getHours();
  let jumbotron = `
  <div class="jumbotron-day">
  <div id="${name[0]}-jumbotron-tdy" class="jumbotron-item">
  <div class="item-day">
    <h2>Today</h2>
  </div>
  <div class="item-temp">
    <h5>Temp C</h5>
    <h3>${forecast.wheater.hours[currentHour].airTemperature.smhi}&deg;</h3>
  </div>
  <div class="item-cloud">
    <h5>Cloud %</h5>
    <p>${forecast.wheater.hours[currentHour].cloudCover.smhi}</p>
  </div>
  <div class="item-percipitation">
    <h5>Rain mm</h5>
    <p>${forecast.wheater.hours[currentHour].precipitation.smhi}</p>
  </div>
  <div class="item-wind">
    <h5>Wind m/s</h5>
    <p>${forecast.wheater.hours[currentHour].windSpeed.smhi}</p>
  </div>
  <div class="item-gust">
    <h5>Gust m/s</h5>
    <p>${forecast.wheater.hours[currentHour].gust.smhi}</p>
  </div>
  <div class="item-humidity">
    <h5>Humidity %</h5>
    <p>${forecast.wheater.hours[currentHour].humidity.smhi}</p>
  </div>
</div>`;

   for(i = currentHour + 1; i < 24; i++){
    jumbotron +=`
    <div id="${name[0]}-jumbotron-inner-tdy" class="jumbotron-item-days">
      <div class="jumbotron-content">
        <div class="c-hour">
          <h3>${i}.00</h3>
        </div>
        <div class="c-temp">
          <h4>${forecast.wheater.hours[i].airTemperature.smhi}&deg;</h4>
        </div>
        <div class="c-cloud">
          <p>${forecast.wheater.hours[i].cloudCover.smhi}</p>
        </div>
        <div class="item-percipitation">
          <p>${forecast.wheater.hours[i].precipitation.smhi}</p>
        </div>
        <div class="item-wind">
          <p>${forecast.wheater.hours[i].windSpeed.smhi}</p>
        </div>
        <div class="c-gust">
          <p>${forecast.wheater.hours[i].gust.smhi}</p>
        </div>
        <div class="c-humidity">
          <p>${forecast.wheater.hours[i].humidity.smhi}</p>
        </div>
      </div>
    </div>
  `;
  }
  jumbotron += "</div>";
  
  $("#jumbotron").append(jumbotron);

  $(`#${name[0]}-jumbotron-tdy`)
    .click(function () {
        $(`#${name[0]}-jumbotron-inner-tdy`)
        .stop(true)
        .slideToggle(350);
    });
}

function getDayOfTheWeek(date) {
  let day = "";
  switch (date.getDay()) {
    case 0:
      return (day = "Sunday");
    case 1:
      return (day = "Monday");
    case 2:
      return (day = "Tuesday");
    case 3:
      return (day = "Wednesday");
    case 4:
      return (day = "Thursday");
    case 5:
      return (day = "Friday");
    case 6:
      return (day = "Saturday");
  }
}

function loadCities() {
  cities = JSON.parse(localStorage.getItem("cities"));
  if (cities == null) {
    console.log("SENDING XHR TO GET CITIES");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "src/svenskastäderArr.json");
    xhr.send();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let resp = xhr.response;
        cities = JSON.parse(resp);
        localStorage.setItem("cities", JSON.stringify(cities));
        console.log(cities); // array
      }
    };
  }

  console.log("Returning cities from localstorage");
  reduceCities();
}

// DENNA FUNKTION RENSAR ALLA STÄDER SOM BÖRJAR PÅ SMÅ BOKSTÄVER I VÅR JSON FIL. ALLA STÄDER STÅR DUBBELT I DEN...
// DEN GÖR ÄVEN ALLA STÄDER TILL UPPERCASE SÅ ATT DET GÅR ATT SÖKA MED INCLUDES();
function reduceCities() {
  let check = "";
  if(cities != null){

    for (i = 0; i < cities.length; i++) {
      check = cities[i];
      if (/[A-ZÅÄÖ]/.test(check[0]) == false) cities.splice(i, 1);
    }
    
    for (i = 0; i < cities.length; i++) {
      check = cities[i];
      let c = check.toUpperCase();
      cities[i] = c;
    }
    
    localStorage.setItem("cities", JSON.stringify(cities));
  }
}

function searchInCities(event) {
  if (event.key == "Enter") {
    let value = document.getElementById("search").value;
    let search = value.toUpperCase();
    let searchArea = document.getElementById("searchArea");
    searchArea.innerHTML = "";
    let searchResult = cities.filter((city) => city.includes(search));

    searchResult.forEach((city, index) => {
      searchArea.innerHTML += `<button id="${index}-button" href="#" class="search-result">
      <h3>${capitaliseString(city)}</h3>
      </button>`;
      document.getElementById("search").value = "";
    });
    setSearchButtons(searchResult);
  }
}
function setSearchButtons(searchResult) {
  let searchButtons = document.getElementsByClassName("search-result");
  for (i = 0; i < searchButtons.length; i++) {
    let city = searchResult[i];
    searchButtons[i].addEventListener("click", function () {
      searchCityFromButton(city);
    });
  }
}

function setWheaterBackground(forecast) {
  console.log("SET WHEATER BACKGROUND");
  // console.log(forecast);
  let background = "";
  let date = new Date(forecast.searched);
  let currentHour = date.getHours();

  let downfall = forecast.wheater.hours[currentHour].precipitation.smhi;
  let cloudCover = forecast.wheater.hours[currentHour].cloudCover.smhi;
  let airTemperature = forecast.wheater.hours[currentHour].airTemperature.smhi;

  if (downfall == 0 && cloudCover <= 25) return (background = "day-clear");
  if (downfall > 0) return (background = "day-cloudy-rainy");
  if (downfall > 0 && airTemperature < 0)
    return (background = "day-cloudy-snowy");
  if (downfall == 0 && cloudCover > 25) return (background = "day-cloudy");
}

function capitaliseString(str) {
  let big = str[0];
  for (let i = 1; i < str.length; i++) {
    big += str[i].toLowerCase();
  }
  return big;
}


