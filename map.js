
mapboxgl.accessToken = 'TOKEN';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [18.353411, 48.396864],
    zoom: 15
});
const bounds = [
    [18, 48],
    [19, 49]
];
map.setMaxBounds(bounds);


let markers = [];

function getLatLong() {
    return fetch('./img.json').then(response => {
        if (response.ok) {
            return response.json();
        }
        return null;
    }).then(result => {
        if (result != null) {
            result.images.forEach(img => {
                var marker = new mapboxgl.Marker()
                    .setLngLat([img.location.lng, img.location.lat]);

                marker.getElement().addEventListener('click', function () {
                    fillGallery(img.location.lat, img.location.lng);
                    displayGallery();
                });
                markers.push(marker);
            })
            markers.forEach(marker => {
                marker.addTo(map);
            })
        } else {
            console.error("response is empty");
        }
    })
}
getLatLong();

let toggle = true;
let toggleRoute = document.getElementById("show");
let geojson;


const start = [18.353411, 48.396864];

async function fillGallery(lat, lng) {
    let gallery = [];
    let carouselInner = document.getElementById("innerCarousel");
    while (carouselInner.firstChild) {
        carouselInner.removeChild(carouselInner.firstChild);
    }
    var flag = true;
    const query = await fetch('img.json');
    const json = await query.json();
    for (let i = 0; i < json.images.length; i++) {
        if (json.images[i].location.lng == lng && json.images[i].location.lat == lat) {
            gallery.push(json.images[i]);

            if (flag) {
                flag = false;
                carouselInner.appendChild(createCarouselItem(json.images[i], true));
            }
            else {
                carouselInner.appendChild(createCarouselItem(json.images[i], false));
            }
        }
    }
    var carouselIndicat = document.getElementById("cIndicators");
    while (carouselIndicat.firstChild) {
        carouselIndicat.removeChild(carouselIndicat.firstChild);
    }
    for (let i = 0; i < gallery.length; i++) {

        var listItem = document.createElement("li");
        listItem.setAttribute('data-target', '#myCarousel');
        listItem.setAttribute('data-slide-to', i);
        carouselIndicat.appendChild(listItem);
        if (i == 0) {
            listItem.classList.add("active");
        }
    }
}
function haversineDistanceBetweenPoints(coordinates) {
    const R = 6371;
    let distance = 0;


    for (let i = 0; i < coordinates.length - 1; i++) {
        const [lat1, lon1] = coordinates[i];
        const [lat2, lon2] = coordinates[i + 1];

        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const dist = R * c;

        distance += dist;
    }

    return distance;
}

function roundToDecimalPlaces(number, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
}

let spanLen = document.getElementById('routeLen');

async function getRoute(end) {
    const query = await fetch('img.json');
    const json = await query.json();
    var route = [];
    for (let i = 0; i < json.images.length; i++) {
        var item = [];
        item.push(json.images[i].location.lng);
        item.push(json.images[i].location.lat);
        route.push(item);
    }

    geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    spanLen.innerHTML = "Dĺžka cesty " + roundToDecimalPlaces(haversineDistanceBetweenPoints(geojson.geometry.coordinates), 2) + " km";
    const routeId = 'route';
    if (map.getSource(routeId)) {
        map.getSource(routeId).setData(geojson);
    } else {
        map.addLayer({
            id: routeId,
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }
}
toggleRoute.addEventListener("click", function () {
    if (toggle) {
        getRoute(start);

    } else {

        spanLen.innerHTML = "Cesta nie je zapnutá";
        const routeId = 'route';
        map.removeLayer(routeId);
        map.removeSource(routeId);
    }
    toggle = !toggle;
})

function displayGallery() {
    var gallery = document.getElementById("modalGallery");
    gallery.style.display = "flex";
    document.body.classList.add("modal-open");
}

let closeButton = document.getElementById("closeGallery");
closeButton.addEventListener("click", function () {
    hideGallery();
})

function hideGallery() {
    var gallery = document.getElementById("modalGallery");
    gallery.style.display = "none";
    document.body.classList.remove("modal-open");
}

function createCarouselItem(data, info) {
    let cont = document.createElement("div");
    cont.classList.add("item");
    if (info) {
        cont.classList.add("active");
    }

    let img = document.createElement("img");
    img.src = data.url;
    img.alt = data.description;
    let caption = document.createElement('div');
    caption.classList.add("carousel-caption");
    let head = document.createElement("h3");
    head.innerHTML = data.name
    caption.appendChild(head);
    let desc = document.createElement("p");
    desc.innerHTML = data.description;
    caption.appendChild(desc);
    cont.appendChild(img);
    cont.appendChild(caption);
    return cont;
}


let stopSlideShowButton = document.getElementById("stopSlideShow");
let car = document.getElementById('myCarousel');
let startStop = true;
stopSlideShowButton.addEventListener("click", function () {
    if (startStop) {
        $(car).carousel('pause');
        startStop = false;
    } else {
        $(car).carousel('cycle');
        startStop = true;
    }

});