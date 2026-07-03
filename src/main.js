const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const app = document.querySelector("#app");

const REFRESH_MS = 60_000; // one minute, for the two "live" sections
const $ = (id) => document.querySelector(id);

app.innerHTML = `
  <section id="apod"><p>Loading...</p></section>

  <section id="neows">
    <h2>Near Earth Objects (today)</h2>
    <p>Loading...</p>
  </section>

  <section id="nasa-library">
    <h2>Latest from the NASA Image and Video Library</h2>
    <p>Loading...</p>
  </section>
`;

// pic of day
async function loadApod() {
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
    if (!res.ok) throw new Error(`request failed (${res.status})`);
    const data = await res.json();

    const media =
      data.media_type === "image"
        ? `<img src="${data.url}" alt="${data.title}" style="width: 400px; height: 300px; margin: 0 auto"/>`
        : `<video src="${data.url}" controls></video>`;

    $("#apod").innerHTML = `
      <h1>${data.title}</h1>
      ${media}
      <p>${data.explanation}</p>
    `;
  } catch (err) {
    $("#apod").innerHTML = `<p>Error loading APOD: ${err.message}</p>`;
  }
}

// objects with close prox with earth today
async function loadNeoWs() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`
    );
    if (!res.ok) throw new Error(`request failed (${res.status})`);
    const data = await res.json();

    const neos = data.near_earth_objects[today] ?? [];
    const rows = neos
      .slice(0, 8)
      .map((neo) => {
        const diameter = neo.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
        const approach = neo.close_approach_data[0];
        const distanceKm = Number(approach.miss_distance.kilometers).toLocaleString();
        const flag = neo.is_potentially_hazardous_asteroid ? "potentially hazardous" : "safe";
        return `<li><strong>${neo.name}</strong> — up to ${diameter} m, passing ${distanceKm} km away (${flag})</li>`;
      })
      .join("");

    $("#neows").innerHTML = `
      <h2>Near Earth Objects (today)</h2>
      <p>${neos.length} object${neos.length === 1 ? "" : "s"} tracked for ${today}.</p>
      <ul>${rows || "<li>None reported.</li>"}</ul>
    `;
  } catch (err) {
    $("#neows").innerHTML = `<h2>Near Earth Objects (today)</h2><p>Error: ${err.message}</p>`;
  }
}

async function loadNasaLibrary() {
  try {
    const res = await fetch(`https://images-api.nasa.gov/search?q=nasa&media_type=image,video`);
    if (!res.ok) throw new Error(`request failed (${res.status})`);
    const data = await res.json();

    const items = data.collection.items.slice(0, 6);
    const cards = items
      .map((item) => {
        const info = item.data[0];
        const thumb = item.links?.[0]?.href;
        return `
          <figure>
            ${thumb ? `<img src="${thumb}" alt="${info.title}" />` : ""}
            <figcaption>${info.title}</figcaption>
          </figure>
        `;
      })
      .join("");

    $("#nasa-library").innerHTML = `
      <h2>Latest from the NASA Image and Video Library</h2>
      <p>W photos & videos.</p>
      <div class="photo-grid">${cards}</div>
    `;
  } catch (err) {
    $("#nasa-library").innerHTML = `<h2>Latest from the NASA Image and Video Library</h2><p>Error: ${err.message}</p>`;
  }
}

// run stuff
loadApod();
loadNeoWs();
loadNasaLibrary();

setInterval(loadNasaLibrary, REFRESH_MS);