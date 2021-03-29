class Forecast {
  constructor(city, name, searched, weather, lat, lng) {
    this.city = city;
    this.name = name;
    this.searched = searched;
    this.weather = weather;
    this.lat = lat;
    this.lng = lng;
  }
}

// håller koll på vilekn forecast som ska renderas efter man tagit bort en widget
let clickedForecasts = [];
let close = true;

window.addEventListener("load", getLocation);
document.getElementById("search").addEventListener("keypress", searchInCities);
document.getElementById("searchBtn").addEventListener("click", searchCity);

let cities = [];

let weatherKey1 =
  "7ed18cf6-8726-11eb-9f69-0242ac130002-7ed18d64-8726-11eb-9f69-0242ac130002";
let weatherKey2 =
  "c211895a-871f-11eb-8ad5-0242ac130002-c2118a86-871f-11eb-8ad5-0242ac130002";
let weatherParams =
  "airTemperature,cloudCover,gust,humidity,precipitation,windSpeed";
let geocodeKey = "aAUORVN56nmMcGN5QmVuHjmELGIstOil";

function getLocation() {
  loadInForecasts();
  loadCities();
  let forecast = JSON.parse(localStorage.getItem("yourPos"));
  showBigForecast(forecast);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showForecast);
  } else {
    document.getElementById("demo").innerHTML =
      "Geolocation is not supported by this browser.";
  }
}

function showForecast(position) {
  let yourForecast = JSON.parse(localStorage.getItem("yourPos"));

  if (yourForecast == null) {
    date = new Date();
  } else date = new Date(yourForecast.searched);

  if (yourForecast == null) {
    console.log("<---- CALLING API STORM GLASS ---->");
    let forecast = new Forecast();
    forecast.lat = position.coords.latitude;
    forecast.lng = position.coords.longitude;

    fetch(
      `https://api.stormglass.io/v2/weather/point?lat=${forecast.lat}&lng=${forecast.lng}&params=${weatherParams}`,
      {
        headers: {
          Authorization: weatherKey2,
        },
      }
    )
      .then((response) => response.json())
      .then((jsonData) => generateForecast(jsonData, forecast));
  } else {
    renderData(yourForecast);
  }
}

function generateForecast(weather, forecast) {
  forecast.weather = weather;
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
  let date = new Date();
  let currentHour = date.getHours();
  let name = forecast.city.split(" ");

  $(".widget-container").prepend(`
    <div id="${name[0]}-upper" class="widget ${setWeatherBackground(forecast)}">
                    <div class="upper-wideget">
                        <button class="close close-${name[0]}">
                          <h5>&times;</h5>
                        </button>
                        <div class="city">
                            <h5>${name[0]}</h5>
                        </div>
                        <div class="cloud">
                            <p>${
                              forecast.weather.hours[currentHour].cloudCover
                                .smhi
                            }</p>
                            <p>CLD</p> 
                        </div>
                        <div class="rain">
                            <p>${
                              forecast.weather.hours[currentHour].precipitation
                                .smhi
                            }</p>
                            <p>PPI</p> 
                        </div>
                        <div class="humidity">
                            <p>${
                              forecast.weather.hours[currentHour].humidity.smhi
                            }</p> 
                            <p>HUM</p>
                        </div>
                        <div class="wind-speed">
                            <p>${
                              forecast.weather.hours[currentHour].windSpeed.smhi
                            }</p> 
                            <p>WND</p> 
                        </div>
                        <div class="temp">
                            <h3>${Math.round(
                              forecast.weather.hours[currentHour].airTemperature
                                .smhi
                            )}&deg;</h3>
                        </div>
                    </div> 
                    <div id="${name[0]}-lower" class="lower-widget">
                        <div class="t1">
                            <p>${currentHour + 2}.00</p> 
                            <h4>${
                              forecast.weather.hours[currentHour + 2]
                                .airTemperature.smhi
                            }&deg;</h4> 
                        </div>
                        <div class="t2">
                            <p>${currentHour + 4}.00</p> 
                            <h4>${
                              forecast.weather.hours[currentHour + 4]
                                .airTemperature.smhi
                            }&deg;</h4>  
                        </div>
                        <div class="t3">
                            <p>${currentHour + 6}.00</p> 
                            <h4>${
                              forecast.weather.hours[currentHour + 6]
                                .airTemperature.smhi
                            }&deg;</h4> 
                        </div>
                        <div class="t4">
                            <p>${currentHour + 8}.00</p> 
                            <h4>${
                              forecast.weather.hours[currentHour + 8]
                                .airTemperature.smhi
                            }&deg;</h4> 
                        </div>
                        <div class="t5">
                            <p>${currentHour + 10}.00</p> 
                            <h4>${
                              forecast.weather.hours[currentHour + 10]
                                .airTemperature.smhi
                            }&deg;</h4>  
                        </div>
                    </div>
                </div>
                `);
  close = true;
  $(`#${name[0]}-upper`)
    .stop(true)
    .find(".close-" + name[0])
    .click(function () {
      setTimeout(function () {
        if (clickedForecasts.length > 0) clickedForecasts.pop();
        closeWidget(forecast, close);
      }, 300);
    });
  $(`#${name[0]}-upper`)
    .mouseenter(function () {
      $(this)
        .find(".close-" + name[0])
        .fadeToggle(0);
    })
    .mouseleave(function () {
      $(this)
        .find(".close-" + name[0])
        .fadeToggle(0);
    });
  $(`#${name[0]}-lower`).children().fadeToggle(0);
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
        .find(`#${name[0]}-lower`)
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
          110
        )
        .find(`#${name[0]}-lower`)
        .children()
        .stop(true)
        .fadeToggle(160);
    })
    .click(function () {
      clickedForecasts.push(forecast);
      close = false;
      setTimeout(function () {
        closeWidget(forecast, close);
      }, 300);
    });
}

function searchCity() {
  let cityNameToSearch = document.getElementById("search").value;
  document.getElementById("search").value = "";

  let searchedCities = JSON.parse(localStorage.getItem("searchedForecasts"));
  let allowedSearch = true;

  cityNameToSearch = cityNameToSearch.toUpperCase();
  if (searchedCities != null) {
    searchedCities.forEach((city) => {
      let cityUpperCase = city.name.toUpperCase();
      cityUpperCase = cityUpperCase.split(" ");
      if (cityUpperCase[0] === cityNameToSearch) {
        allowedSearch = false;
        alert("Widget for city already exists");
      }
    });
  }
  if (allowedSearch) {
    fetch(
      `http://www.mapquestapi.com/geocoding/v1/address?key=${geocodeKey}&location=${cityNameToSearch}`
    )
      .then((response) => response.json())
      .then((location) => getCityOnSearch(location));
  }
}

function searchCityFromButton(cityName) {
  console.log("SÖKER PÅ STAD FRÅN FÖRSLAG PÅ SÖKNING");
  document.getElementById("searchArea").innerHTML = "";
  document.getElementById("search").value = "";


  let searchedCities = JSON.parse(localStorage.getItem("searchedForecasts"));
  let allowedSearch = true;

  cityName = cityName.toUpperCase();

  if (searchedCities != null) {
    searchedCities.forEach((city) => {
      let cityUpperCase = city.name.toUpperCase();
      cityUpperCase = cityUpperCase.split(" ");
      if (cityUpperCase[0] === cityName) {
        allowedSearch = false;
        alert("Widget for city already exists");
      }
    });
  }

  if (allowedSearch) {
    fetch(
      `http://www.mapquestapi.com/geocoding/v1/address?key=${geocodeKey}&location=${cityName}`
    )
      .then((response) => response.json())
      .then((location) => getCityOnSearch(location));
  }
}

function getCityOnSearch(location) {
  let forecast = new Forecast();

  forecast.city = location.results[0].locations[0].adminArea5;
  forecast.lat = location.results[0].locations[0].latLng.lat;
  forecast.lng = location.results[0].locations[0].latLng.lng;
  forecast.name = location.results[0].locations[0].adminArea5;
  forecast.searched = new Date();
  if (forecast.city == "") {
    alert("City was not found");
  } else generateWeatherForSearchedPos(forecast);
}

function generateWeatherForSearchedPos(forecast) {
  console.log("Calling API for searched city STORM GLASS");
  fetch(
    `https://api.stormglass.io/v2/weather/point?lat=${forecast.lat}&lng=${forecast.lng}&params=${weatherParams}`,
    {
      headers: {
        Authorization: weatherKey2,
      },
    }
  )
    .then((response) => response.json())
    .then((weather) => renderSearchData(weather, forecast));
}

function renderSearchData(weather, forecast) {
  if (weather.hours[0].airTemperature.smhi == null) {
    alert("Kunde inte hämta vädret för staden");
  } else {
    forecast.weather = weather;
    let date = new Date();
    let currentHour = date.getHours();
    let name = forecast.name.split(" ");

    $(".widget-container").append(`
      <div id="${name[0]}-upper" class="widget ${setWeatherBackground(
        forecast
      )}">
      <div class="upper-wideget">
      <button z-index class="close close-${name[0]}">
      <h5>&times;</h5>
      </button>
      <div class="city">
      <h5>${name[0]}</h5>
      </div>
      <div class="cloud">
      <p>${forecast.weather.hours[currentHour].cloudCover.smhi}</p>
      <p>CLD</p> 
      </div>
      <div class="rain">
      <p>${forecast.weather.hours[currentHour].precipitation.smhi}</p>
      <p>PPI</p> 
      </div>
      <div class="humidity">
      <p>${forecast.weather.hours[currentHour].humidity.smhi}</p> 
      <p>HUM</p>
      </div>
      <div class="wind-speed">
      <p>${forecast.weather.hours[currentHour].windSpeed.smhi}</p> 
      <p>WND</p> 
      </div>
      <div class="temp">
      <h3>${Math.round(
        forecast.weather.hours[currentHour].airTemperature.smhi
      )}&deg;</h3>
      </div>
      </div> 
      <div id="${name[0]}-lower" class="lower-widget">
      <div class="t1">
      <p>${convertHours(currentHour + 2)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 2].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t2">
      <p>${convertHours(currentHour + 4)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 4].airTemperature.smhi
      }&deg;</h4>  
      </div>
      <div class="t3">
      <p>${convertHours(currentHour + 6)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 6].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t4">
      <p>${convertHours(currentHour + 8)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 8].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t5">
      <p>${convertHours(currentHour + 10)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 10].airTemperature.smhi
      }&deg;</h4>  
      </div>
      </div>
      </div>
      `);
      $(`#${name[0]}-lower`).children().fadeToggle(0);
      let boxHeight = $(`#${name[0]}-upper`).height();
      $(`#${name[0]}-upper`)
        .stop(true)
        .find(".close-" + name[0])
        .click(function () {
          setTimeout(function () {
            close = true;
            if (clickedForecasts.length > 0) clickedForecasts.pop();
            closeWidget(forecast, close);
          }, 300);
        });
      $(`#${name[0]}-upper`)
        .mouseenter(function () {
          $(this)
            .find(".close-" + name[0])
            .fadeToggle(0);
        })
        .mouseleave(function () {
          $(this)
            .find(".close-" + name[0])
            .fadeToggle(0);
        });

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
            .find(`#${name[0]}-lower`)
            .children()
            .stop(true)
            .fadeToggle(120);
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
            .find(`#${name[0]}-lower`)
            .children()
            .stop(true)
            .fadeToggle(110);
        })
        .click(function () {
          clickedForecasts.push(forecast);
          close = false;
          setTimeout(function () {
            closeWidget(forecast, close);
          }, 300);
        });

    let searchedForecast = JSON.parse(
      localStorage.getItem("searchedForecasts")
    );
    if (searchedForecast == null) {
      console.log("TOMT i sök, skapar ny array");
      searchedForecast = [forecast];
    } else searchedForecast.push(forecast);
    localStorage.setItem("searchedForecasts", JSON.stringify(searchedForecast));
  }
}

function loadInForecasts() {
  let forecasts = JSON.parse(localStorage.getItem("searchedForecasts"));
  document.getElementById("widget-container").innerHTML = "";
  if (forecasts != null) {
    forecasts.forEach((forecast) => {
      let name = forecast.name.split(" ");
      let date = new Date();
      let currentHour = date.getHours();

      $(".widget-container").append(`
      <div id="${name[0]}-upper" class="widget ${setWeatherBackground(forecast)}">
      <div class="upper-wideget">
      <button z-index class="close close-${name[0]}">
      <h5>&times;</h5>
      </button>
      <div class="city">
      <h5>${name[0]}</h5>
      </div>
      <div class="cloud">
      <p>${forecast.weather.hours[currentHour].cloudCover.smhi}</p>
      <p>CLD</p> 
      </div>
      <div class="rain">
      <p>${forecast.weather.hours[currentHour].precipitation.smhi}</p>
      <p>PPI</p> 
      </div>
      <div class="humidity">
      <p>${forecast.weather.hours[currentHour].humidity.smhi}</p> 
      <p>HUM</p>
      </div>
      <div class="wind-speed">
      <p>${forecast.weather.hours[currentHour].windSpeed.smhi}</p> 
      <p>WND</p> 
      </div>
      <div class="temp">
      <h3>${Math.round(
        forecast.weather.hours[currentHour].airTemperature.smhi
      )}&deg;</h3>
      </div>
      </div> 
      <div id="${name[0]}-lower" class="lower-widget">
      <div class="t1">
      <p>${convertHours(currentHour + 2)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 2].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t2">
      <p>${convertHours(currentHour + 4)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 4].airTemperature.smhi
      }&deg;</h4>  
      </div>
      <div class="t3">
      <p>${convertHours(currentHour + 6)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 6].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t4">
      <p>${convertHours(currentHour + 8)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 8].airTemperature.smhi
      }&deg;</h4> 
      </div>
      <div class="t5">
      <p>${convertHours(currentHour + 10)}.00</p> 
      <h4>${
        forecast.weather.hours[currentHour + 10].airTemperature.smhi
      }&deg;</h4>  
      </div>
      </div>
      </div>
      `);
      $(`#${name[0]}-lower`).children().fadeToggle(0);
      let boxHeight = $(`#${name[0]}-upper`).height();
      $(`#${name[0]}-upper`)
        .stop(true)
        .find(".close-" + name[0])
        .click(function () {
          setTimeout(function () {
            close = true;
            if (clickedForecasts.length > 0) clickedForecasts.pop();
            closeWidget(forecast, close);
          }, 300);
        });
      $(`#${name[0]}-upper`)
        .mouseenter(function () {
          $(this)
            .find(".close-" + name[0])
            .fadeToggle(0);
        })
        .mouseleave(function () {
          $(this)
            .find(".close-" + name[0])
            .fadeToggle(0);
        });
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
            .find(`#${name[0]}-lower`)
            .children()
            .stop(true)
            .fadeToggle(120);
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
            .find(`#${name[0]}-lower`)
            .children()
            .stop(true)
            .fadeToggle(110);
        })
        .click(function () {
          clickedForecasts.push(forecast);
          close = false;
          setTimeout(function () {
            closeWidget(forecast, close);
          }, 300);
        });
    });
  }
}

function showBigForecast(forecast) {
  if (forecast == undefined) return;
  document.getElementById("jumbotron").innerHTML = "";
  let name = forecast.city.split(" ");
  $("#jumbotron").prepend(`
  <div class="city-and-close-button">
  <h1>${name[0]}</h1>
  </div>`);
  renderTodaysForecast(forecast);
  renderTomorrowsForecast(forecast);
  renderDayAfterTomorrowForecast(forecast);
}

function renderDayAfterTomorrowForecast(forecast) {
  let afterTomorrow = "";
  let now = new Date();
  let ms = now.getTime();
  let msDayAfterTommorow = ms + 172800000;
  let dateDayAfterTomorrow = new Date(msDayAfterTommorow);

  let day = getDayOfTheWeek(dateDayAfterTomorrow);
  let name = forecast.name.split(" ");

  // Forecast hour 61 always shows the weather for hour 13, 2 days ahead
  afterTomorrow += `
  <div class="jumbotron-day">
  <div id="${name[0]}-jumbotron-afttmrw" class="jumbotron-item">
  <div class="item-day">
    <h2>${day}</h2>
  </div>
  <div class="item-temp">
    <h5>Temp C</h5>
    <p>${forecast.weather.hours[61].airTemperature.smhi}&deg;</p>
  </div>
  <div class="item-cloud">
    <h5>Cloud %</h5>
    <p>${forecast.weather.hours[61].cloudCover.smhi}</p>
  </div>
  <div class="item-percipitation">
    <h5>Rain mm</h5>
    <p>${forecast.weather.hours[61].precipitation.smhi}</p>
  </div>
  <div class="item-wind">
    <h5>Wind m/s</h5>
    <p>${forecast.weather.hours[61].windSpeed.smhi}</p>
  </div>
  <div class="item-gust">
    <h5>Gust m/s</h5>
    <p>${forecast.weather.hours[61].gust.smhi}</p>
  </div>
  <div class="item-humidity">
    <h5>Humidity %</h5>
    <p>${forecast.weather.hours[61].humidity.smhi}</p>
  </div>
</div>`;

  for (i = 48; i < 73; i+= 3) {
    afterTomorrow += `
    <div class="${name[0]}-jumbotron-inner-afttmrw jumbotron-item-days">
      <div class="jumbotron-content">
        <div class="c-hour">
          <h3>${i - 48}.00</h3>
        </div>
        <div class="c-temp">
          <p>${forecast.weather.hours[i].airTemperature.smhi}&deg;</p>
        </div>
        <div class="c-cloud">
          <p>${forecast.weather.hours[i].cloudCover.smhi}</p>
        </div>
        <div class="item-percipitation">
          <p>${forecast.weather.hours[i].precipitation.smhi}</p>
        </div>
        <div class="item-wind">
          <p>${forecast.weather.hours[i].windSpeed.smhi}</p>
        </div>
        <div class="c-gust">
          <p>${forecast.weather.hours[i].gust.smhi}</p>
        </div>
        <div class="c-humidity">
          <p>${forecast.weather.hours[i].humidity.smhi}</p>
        </div>
      </div>
    </div>
  `;
  }
  afterTomorrow += "</div>";

  $("#jumbotron").append(afterTomorrow);

  $(`#${name[0]}-jumbotron-afttmrw`).click(function () {
    $(`.${name[0]}-jumbotron-inner-afttmrw`).stop(true).slideToggle(350);
  });
}

function renderTomorrowsForecast(forecast) {
  let tomorrow = "";
  let name = forecast.name.split(" ");
  // Forecast hour 37 always shows the weather for hour 13, 1 day ahead
  tomorrow += `
  <div class="jumbotron-day">
  <div id="${name[0]}-jumbotron-tmrw" class="jumbotron-item">
  <div class="item-day">
    <h2>Tomorrow</h2>
  </div>
  <div class="item-temp">
    <h5>Temp C</h5>
    <p>${forecast.weather.hours[37].airTemperature.smhi}&deg;</p>
  </div>
  <div class="item-cloud">
    <h5>Cloud %</h5>
    <p>${forecast.weather.hours[37].cloudCover.smhi}</p>
  </div>
  <div class="item-percipitation">
    <h5>Rain mm</h5>
    <p>${forecast.weather.hours[37].precipitation.smhi}</p>
  </div>
  <div class="item-wind">
    <h5>Wind m/s</h5>
    <p>${forecast.weather.hours[37].windSpeed.smhi}</p>
  </div>
  <div class="item-gust">
    <h5>Gust m/s</h5>
    <p>${forecast.weather.hours[37].gust.smhi}</p>
  </div>
  <div class="item-humidity">
    <h5>Humidity %</h5>
    <p>${forecast.weather.hours[37].humidity.smhi}</p>
  </div>
</div>`;

  for (i = 24; i < 48; i++) {
    tomorrow += `
    <div class="${name[0]}-jumbotron-inner-tmrw jumbotron-item-days">
      <div class="jumbotron-content">
        <div class="c-hour">
          <h3>${i - 24}.00</h3>
        </div>
        <div class="c-temp">
          <p>${forecast.weather.hours[i].airTemperature.smhi}&deg;</p>
        </div>
        <div class="c-cloud">
          <p>${forecast.weather.hours[i].cloudCover.smhi}</p>
        </div>
        <div class="item-percipitation">
          <p>${forecast.weather.hours[i].precipitation.smhi}</p>
        </div>
        <div class="item-wind">
          <p>${forecast.weather.hours[i].windSpeed.smhi}</p>
        </div>
        <div class="c-gust">
          <p>${forecast.weather.hours[i].gust.smhi}</p>
        </div>
        <div class="c-humidity">
          <p>${forecast.weather.hours[i].humidity.smhi}</p>
        </div>
      </div>
    </div>
  `;
  }
  tomorrow += "</div>";

  $("#jumbotron").append(tomorrow);

  $(`#${name[0]}-jumbotron-tmrw`).click(function () {
    $(`.${name[0]}-jumbotron-inner-tmrw`).stop(true).slideToggle(350);
  });
}

function renderTodaysForecast(forecast) {
  let date = new Date();
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
    <p>${forecast.weather.hours[currentHour].airTemperature.smhi}&deg;</p>
  </div>
  <div class="item-cloud">
    <h5>Cloud %</h5>
    <p>${forecast.weather.hours[currentHour].cloudCover.smhi}</p>
  </div>
  <div class="item-percipitation">
    <h5>Rain mm</h5>
    <p>${forecast.weather.hours[currentHour].precipitation.smhi}</p>
  </div>
  <div class="item-wind">
    <h5>Wind m/s</h5>
    <p>${forecast.weather.hours[currentHour].windSpeed.smhi}</p>
  </div>
  <div class="item-gust">
    <h5>Gust m/s</h5>
    <p>${forecast.weather.hours[currentHour].gust.smhi}</p>
  </div>
  <div class="item-humidity">
    <h5>Humidity %</h5>
    <p>${forecast.weather.hours[currentHour].humidity.smhi}</p>
  </div>
</div>`;

  for (i = currentHour + 1; i < 24; i++) {
    jumbotron += `
    <div class="${name[0]}-jumbotron-inner-tdy jumbotron-item-days">
      <div class="jumbotron-content">
        <div class="c-hour">
          <h3>${i}.00</h3>
        </div>
        <div class="c-temp">
          <p>${forecast.weather.hours[i].airTemperature.smhi}&deg;</p>
        </div>
        <div class="c-cloud">
          <p>${forecast.weather.hours[i].cloudCover.smhi}</p>
        </div>
        <div class="item-percipitation">
          <p>${forecast.weather.hours[i].precipitation.smhi}</p>
        </div>
        <div class="item-wind">
          <p>${forecast.weather.hours[i].windSpeed.smhi}</p>
        </div>
        <div class="c-gust">
          <p>${forecast.weather.hours[i].gust.smhi}</p>
        </div>
        <div class="c-humidity">
          <p>${forecast.weather.hours[i].humidity.smhi}</p>
        </div>
      </div>
    </div>
  `;
  }
  jumbotron += "</div>";

  $("#jumbotron").append(jumbotron);

  $(`#${name[0]}-jumbotron-tdy`).click(function () {
    $(`.${name[0]}-jumbotron-inner-tdy`).stop(true).slideToggle(350);
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
  if (cities != null) {
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
 // if (event.key == "Enter") {
    let value = document.getElementById("search").value;
    let search = value.toUpperCase();
    let searchArea = document.getElementById("searchArea");
    searchArea.innerHTML = "";
    let searchResult = cities.filter((city) => city.includes(search));

    searchResult.forEach((city, index) => {
      if(index < 3){
        searchArea.innerHTML += `<button id="${index}-button" href="#" class="search-result">
        <p>${capitaliseString(city)}</p>
        </button>`;
      }
    });
    setSearchButtons(searchResult);
  //}
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

function setWeatherBackground(forecast) {
  console.log("SET WEATHER BACKGROUND");
  let background = "";
  let date = new Date(forecast.searched);
  let currentHour = date.getHours();

  // let downfall = 1;
  // let cloudCover = 75;
  // let airTemperature = 10;
  let downfall = forecast.weather.hours[currentHour].precipitation.smhi;
  let cloudCover = forecast.weather.hours[currentHour].cloudCover.smhi;
  let airTemperature = forecast.weather.hours[currentHour].airTemperature.smhi;

  if (downfall == 0 && cloudCover < 3) return (background = "day-clear");
  else if (downfall == 0 && cloudCover < 15)
    return (background = "day-cloudy-1");
  else if (downfall == 0 && cloudCover < 25)
    return (background = "day-cloudy-2");
  else if (downfall == 0 && cloudCover < 50)
    return (background = "day-cloudy-3");
  else if (downfall == 0 && cloudCover < 75)
    return (background = "day-cloudy-4");
  else if (downfall == 0 && cloudCover <= 100)
    return (background = "day-cloudy-5");
  else if (downfall > 0 && cloudCover < 15 && airTemperature > 0)
    return (background = "day-cloudy-1-rainy");
  else if (downfall > 0 && cloudCover < 25 && airTemperature > 0)
    return (background = "day-cloudy-2-rainy");
  else if (downfall > 0 && cloudCover < 50 && airTemperature > 0)
    return (background = "day-cloudy-3-rainy");
  else if (downfall > 0 && cloudCover < 75 && airTemperature > 0)
    return (background = "day-cloudy-4-rainy");
  else if (downfall > 0 && cloudCover <= 100 && airTemperature > 0)
    return (background = "day-cloudy-5-rainy");
  else if (downfall > 0 && cloudCover < 15)
    return (background = "day-cloudy-1-snowy");
  else if (downfall > 0 && cloudCover < 25)
    return (background = "day-cloudy-2-snowy");
  else if (downfall > 0 && cloudCover < 50)
    return (background = "day-cloudy-3-snowy");
  else if (downfall > 0 && cloudCover < 75)
    return (background = "day-cloudy-4-snowy");
  else if (downfall > 0 && cloudCover <= 100)
    return (background = "day-cloudy-5-snowy");
}

function capitaliseString(str) {
  let big = str[0];
  for (let i = 1; i < str.length; i++) {
    big += str[i].toLowerCase();
  }
  return big;
}

function convertHours(hour) {
  let newHour = hour;
  if (newHour < 10) {
    return "0" + newHour;
  } else if (newHour > 23) {
    return newHour % 24;
  } else return newHour;
}
function closeWidget(forecast, removeForecast) {
  let forecasts = JSON.parse(localStorage.getItem("searchedForecasts"));
  if (removeForecast == true) {
    console.log("removing");
    forecasts.forEach((f, index) => {
      if (f.name == forecast.name) {
        if (forecasts.length == 1) {
          forecasts.pop();
          localStorage.setItem("searchedForecasts", JSON.stringify(forecasts));
        } else {
          forecasts.splice(index, 1);
          localStorage.setItem("searchedForecasts", JSON.stringify(forecasts));
        }
      }
    });
    loadInForecasts();
    localStorage.setItem("searchedForecasts", JSON.stringify(forecasts)); // HÄR UPPE
    let yourForecast = JSON.parse(localStorage.getItem("yourPos"));
    renderData(yourForecast);
    showBigForecast(clickedForecasts[clickedForecasts.length]);
  } else {
    console.log("not removing");
    setTimeout(function () {
      showBigForecast(clickedForecasts[clickedForecasts.length - 1]);
    }, 0);
  }
}