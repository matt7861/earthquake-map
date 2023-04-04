// Initialize the Google Map
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 3,
    center: { lat: 0, lng: 0 },
  });

  // Create a single InfoWindow instance for reusing
  let infoWindow = new google.maps.InfoWindow();

  fetchEarthquakeData(map, infoWindow);
}

// Fetch earthquake data using the USGS API
async function fetchEarthquakeData(map, infoWindow) {
  try {
    const request = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    );
    const data = await request.json();
    renderMarkers(map, data.features, infoWindow);
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
  }
}

// Render markers on the map for each earthquake
function renderMarkers(map, data, infoWindow) {
  data.forEach((earthquake) => {
    const coordinates = earthquake.geometry.coordinates;
    const title = `${earthquake.properties.mag} - ${earthquake.properties.place}`;

    const marker = new google.maps.Marker({
      position: { lat: coordinates[1], lng: coordinates[0] },
      map: map,
      title: title,
    });

    // Handle marker click event
    marker.addListener("click", () => {
      // Close the existing info window if it's open
      if (infoWindow.getMap()) {
        infoWindow.close();
      }

      // Update the info window content and open it
      infoWindow.setContent(`
        <div class="info">
          <p>${earthquake.properties.title}</p>
          <a href="#" class="details-link">More details</a>
        </div>
      `);
      infoWindow.open(map, marker);

      // Attach click event listener for 'More details' link
      google.maps.event.addListener(infoWindow, "domready", () => {
        document
          .querySelector(".details-link")
          .addEventListener("click", (event) => {
            event.preventDefault();
            displayEarthquakeDetails(earthquake);
          });
      });
    });
  });
}

// Display earthquake details in the info panel
function displayEarthquakeDetails(earthquake) {
  const infoPanelWrapper = document.getElementById("info-panel-wrapper");
  const infoPanelContent = document.getElementById("info-panel-content");
  const time = new Date(earthquake.properties.time).toLocaleString();
  const details = `
    <h2>${earthquake.properties.place}</h2>
    <p><span>Magnitude:</span> ${earthquake.properties.mag}</p>
    <p><span>Date/Time:</span> ${time}</p>
    <p><span>Depth:</span> ${earthquake.geometry.coordinates[2]} km</p>
    <p><span>More info:</span> <a href="${earthquake.properties.url}" target="_blank">USGS</a></p>
  `;

  infoPanelContent.innerHTML = details;
  infoPanelWrapper.classList.add("display");
}

// Initialize the map
initMap();
