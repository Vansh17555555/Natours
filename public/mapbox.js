/*eslint-disable*/
const locations=JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
mapboxgl.accessToken='pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEi0iJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V&w7cyT1Kq5rT9Z1A';
var map=new mapboxgl.Map({
    container:'map',
    style:'mapbox://styles/mapbox/streets-v11'
})
