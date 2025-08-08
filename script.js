"use strict";

const API = "ee0bdbbd4a9f231cdee107d130f26659";

const dayEl = document.querySelector(".weather-app__day");
const dateEl = document.querySelector(".weather-app__date");
const btnEl = document.querySelector(".weather-app__search-btn");
const inputEl = document.querySelector(".weather-app__input");
const iconSectionEl = document.querySelector(".weather-app__icon-section");
const detailsContainer = document.querySelector(".weather-app__details");
const forecastListEl = document.querySelector(".weather-app__forecast-list");
const tempButtons = document.querySelectorAll(".weather-app__temp-btn");

let currentWeatherData;
let forecastData;
let currentUnit = "celsius";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const day = new Date();
const dayName = days[day.getDay()];
dayEl.textContent = dayName;

let month = day.toLocaleString("default", { month: "long" });
let date = day.getDate();
let year = day.getFullYear();
dateEl.textContent = `${date} ${month} ${year}`;

btnEl.addEventListener("click", async (e) => {
  e.preventDefault();

  if (inputEl.value.trim() !== "") {
    const searchLocation = inputEl.value.trim();
    inputEl.value = "";
    await findLocation(searchLocation);
  } else {
    alert("Please enter a city or country name.");
  }
});

tempButtons.forEach(button => {
  button.addEventListener("click", () => {
    const unit = button.dataset.unit;
    if (unit !== currentUnit) {
      currentUnit = unit;
      tempButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      updateDisplay();
    }
  });
});

async function findLocation(name) {
  iconSectionEl.innerHTML = `<div class="weather-app__loader"></div>`;
  detailsContainer.style.opacity = 0;
  forecastListEl.innerHTML = "";
  iconSectionEl.classList.remove("loaded");

  try {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API}`;
    const response = await fetch(API_URL);
    const result = await response.json();

    if (result.cod !== 200) {
      iconSectionEl.innerHTML = `<p class="weather-app__error-msg">${result.message}</p>`;
      detailsContainer.style.opacity = 1;
      return;
    }

    currentWeatherData = result;
    await fetchForecast(result.coord.lat, result.coord.lon);
    updateDisplay();

  } catch (error) {
    iconSectionEl.innerHTML = `<p class="weather-app__error-msg">An error occurred. Please try again later.</p>`;
    detailsContainer.style.opacity = 1;
  }
}

async function fetchForecast(lat, lon) {
  const FORECAST_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}`;
  const response = await fetch(FORECAST_API);
  forecastData = await response.json();
}

function updateDisplay() {
  displayCurrentWeather();
  displayForecast();
}

function displayCurrentWeather() {
  const tempKelvin = currentWeatherData.main.temp;
  const temp = convertTemp(tempKelvin, currentUnit);
  const unitSymbol = currentUnit === "celsius" ? "°C" : "°F";

  const html = `
    <h2 class="weather-app__temp">${temp}${unitSymbol}</h2>
    <img src="https://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@4x.png" alt="Weather icon" class="weather-app__icon">
    <h3 class="weather-app__description">${currentWeatherData.weather[0].description}</h3>
  `;
  iconSectionEl.innerHTML = html;
  iconSectionEl.classList.add("loaded");

  document.querySelector('[data-id="location"]').textContent = currentWeatherData.name;
  document.querySelector('[data-id="temp"]').textContent = `${temp}${unitSymbol}`;
  document.querySelector('[data-id="humidity"]').textContent = `${currentWeatherData.main.humidity}%`;
  document.querySelector('[data-id="wind"]').textContent = `${currentWeatherData.wind.speed} Km/h`;
  detailsContainer.style.opacity = 1;
}

function displayForecast() {
  const uniqueForecastDays = [];
  const daysForecast = forecastData.list.filter((forecast) => {
    const forecastDate = new Date(forecast.dt_txt).getDate();
    if (!uniqueForecastDays.includes(forecastDate)) {
      return uniqueForecastDays.push(forecastDate);
    }
  });

  forecastListEl.innerHTML = daysForecast.slice(0, 4).map(item => {
    const day = new Date(item.dt_txt).getDay();
    const dayName = days[day].substring(0, 3);
    const temp = convertTemp(item.main.temp, currentUnit);
    const unitSymbol = currentUnit === "celsius" ? "°C" : "°F";

    return `
      <li class="weather-app__forecast-item">
        <span class="weather-app__forecast-day">${dayName}</span>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Forecast icon" class="weather-app__forecast-icon">
        <span class="weather-app__forecast-temp">${temp}${unitSymbol}</span>
      </li>
    `;
  }).join('');
}

function convertTemp(kelvin, unit) {
  if (unit === "fahrenheit") {
    return Math.round(((kelvin - 273.15) * 9 / 5) + 32);
  } else {
    return Math.round(kelvin - 273.15);
  }
}

findLocation("Jaipur");