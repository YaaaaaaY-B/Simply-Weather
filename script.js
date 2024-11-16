const apiKey = "0205e35eb49d37f35b1b0708b3af32c0"; // Replace with your actual API key
const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Load history and favorites on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  loadFavorites();
});

// Function to toggle themes (optional if desired)
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// Fetch weather data based on city
async function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  displayLoading(true);
  clearPreviousResults();

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

    const data = await response.json();
    displayWeather(data);
    saveToHistory(city);
  } catch (error) {
    document.getElementById("error").textContent = error.message;
  } finally {
    displayLoading(false);
  }
}

// Fetch weather data based on geolocation
async function getCurrentLocationWeather() {
  if (!navigator.geolocation) {
    document.getElementById("error").textContent = "Geolocation is not supported by this browser.";
    return;
  }

  displayLoading(true);
  clearPreviousResults();

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      displayWeather(data);
      saveToHistory(data.name);
    } catch (error) {
      document.getElementById("error").textContent = error.message;
    } finally {
      displayLoading(false);
    }
  }, (error) => {
    document.getElementById("error").textContent = `Error getting location: ${error.message}`;
    displayLoading(false);
  });
}

// Display weather data
function displayWeather(data) {
  const weatherInfo = document.getElementById("weatherInfo");
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  weatherInfo.innerHTML = `
    <h2>${data.name}</h2>
    <img src="${iconUrl}" alt="${data.weather[0].description}" />
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Condition: ${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <button onclick="addToFavorites('${data.name}')">Add to Favorites</button>
  `;
}

// Save a city to history
function saveToHistory(city) {
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    loadHistory();
  }
}

// Load history
function loadHistory() {
  const historyList = document.getElementById("history");
  historyList.innerHTML = history.map(city => `<li onclick="selectCity('${city}')">${city}</li>`).join("");
}

// Add a city to favorites
function addToFavorites(city) {
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
  }
}

// Load favorites
function loadFavorites() {
  const favoritesList = document.getElementById("favorites");
  favoritesList.innerHTML = favorites.map(city => `<li onclick="selectCity('${city}')">${city}</li>`).join("");
}

// Select a city from history or favorites
function selectCity(city) {
  document.getElementById("city").value = city;
  getWeather();
}

// Display loading animation
function displayLoading(isLoading) {
  document.getElementById("loading").style.display = isLoading ? "block" : "none";
}

// Clear previous results
function clearPreviousResults() {
  document.getElementById("weatherInfo").innerHTML = "";
  document.getElementById("error").textContent = "";
}

// Update `setDynamicBackground` to use better visuals
function setDynamicBackground(weatherCondition) {
    const body = document.body;
    switch (weatherCondition.toLowerCase()) {
      case "clear":
        body.style.backgroundImage = "url('sunny.jpeg')";
        break;
      case "clouds":
        body.style.backgroundImage = "url('cloudy.jpeg')";
        break;
      case "rain":
        body.style.backgroundImage = "url('rainy.jpeg')";
        break;
      case "snow":
        body.style.backgroundImage = "url('snowy.jpeg')";
        break;
      default:
        body.style.backgroundImage = "linear-gradient(to bottom, #4facfe, #00f2fe)";
    }
    body.style.backgroundSize = "cover";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";
  }
  