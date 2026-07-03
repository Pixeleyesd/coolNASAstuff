const API_KEY = import.meta.env.VITE_NASA_API_KEY;

document.querySelector('#app').innerHTML =  "<p>loading...</p>";

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`).
then( response => response.json()).then (data => {
  document.querySelector("#app").innerHTML = `
    <h1>${data.title}</h1>
    <img src="${data.url}" />
    <p>${data.explanation}</p>`;
})
