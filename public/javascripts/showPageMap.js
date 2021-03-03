mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/light-v10", // style URL
	center: business.geometry.coordinates, // starting position [lng, lat]
	zoom: 9 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
	.setLngLat(business.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<h3>${business.title}</h3><p>${business.location}</p>`
		)
	)
	.addTo(map);
