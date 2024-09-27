console.log("loaded");
let gallery = document.getElementById("gallery");
let filter = document.getElementById("filter");
let row = gallery.children;
let filteredPhotos = []
filter.addEventListener('input', (event) => {
    filteredPhotos = [];
    let sstring = event.target.value.toLowerCase();
    let photos = document.getElementsByClassName("thContainer");
    gallery.classList.add("container")
    for (let index = 0; index < photos.length; index++) {
        let photo = photos[index].getElementsByTagName("img")[0];
        if (!photo.alt.toLowerCase().includes(sstring)) {
            photos[index].style.display = "none";
        } else {
            photos[index].style = "";
            filteredPhotos.push(photos[index]);
        }
    }

})
var markers = []
mapboxgl.accessToken = 'pk.eyJ1IjoiamFrdWIxMzM3IiwiYSI6ImNscDZ4OThpZTI0eTQya3BiNG8yaHgxMWcifQ.f5487E17UKf_jkgPL-bt6Q';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: [18.353411, 48.396864], 
    zoom: 15
});




function displayGallery() {
    var gallery = document.getElementById("modalGallery");
    gallery.style.display = "flex";
    document.body.classList.add("modal-open");
}

function hideGallery() {
    var gallery = document.getElementById("modalGallery");
    gallery.style.display = "none";
    document.body.classList.remove("modal-open");
}
let closeButton = document.getElementById("closeGallery");
closeButton.addEventListener("click", function () {
    hideGallery();
})


let carrFlag = true;

function createCarouselItem(data, info) {
    let cont = document.createElement("div");
    cont.classList.add("item");
 
    if (carrFlag) {
        cont.classList.add("active");
        carrFlag = false;
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
    let time = document.createElement("p");
    time.innerHTML = data.timestamp;
    let loc = document.createElement('p');
    loc.innerHTML = data.location.lat + " " + data.location.lng;
    caption.appendChild(desc);
    caption.appendChild(time);
    caption.appendChild(loc);
    cont.appendChild(img);
    cont.appendChild(caption);
    return cont;
}

function makeActive(alt) {
    var liElements = document.querySelectorAll('li');
    var cInner = document.getElementById("innerCarousel");
    for (var i = 1; i < cInner.childNodes.length; i++) {
        var tmpImg = cInner.childNodes[i].childNodes[0].getAttribute('alt');
        if (tmpImg == alt) {
            cInner.childNodes[i].classList.add('active');
            liElements[i - 1].classList.add('active');
        } else {
            liElements[i - 1].classList.remove('active');
            if (cInner.childNodes[i].nodeType === 1) { 
                cInner.childNodes[i].classList.remove('active');
            }
        }
    }

}

function getImages() {
    return fetch('./img.json').then(response => {
        if (response.ok) {
            return response.json();
        }
        return null;
    }).then(result => {
        if (result != null) {
            let thRow = document.createElement('div');
            let carouselInner = document.getElementById("innerCarousel");
            thRow.classList.add('justify-content-center');
            thRow.classList.add('row');
            gallery.appendChild(thRow);
            result.images.forEach(img => {
                let thumbnail = document.createElement('img')
                let thContainer = document.createElement("div");
                thContainer.addEventListener("click", function () {
                    displayGallery();
                    makeActive(img.description);
                    if (markers.length != 0) {
                        markers[0].remove();
                    }
                    markers.pop();
                    var marker = new mapboxgl.Marker()
                        .setLngLat([img.location.lng, img.location.lat]);
                    markers.push(marker);
                    markers[0].addTo(map);
                })
                carouselInner.appendChild(createCarouselItem(img, false));
                thContainer.classList.add("col-sm-4");
                thContainer.classList.add("p-2");
                thContainer.classList.add('thContainer');
                thumbnail.src = img.url;
                thumbnail.alt = img.description;
                thContainer.appendChild(thumbnail);
                thRow.appendChild(thContainer);
                gallery.appendChild(thRow);
            })
        } else {
            console.error("response is empty");
        }
    })
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

function extractCoordinates(inputString) {
    var regex = /(\d+\.\d+)\s(\d+\.\d+)/;

    var match = inputString.match(regex);

    if (match) {
        var latitude = parseFloat(match[1]);
        var longitude = parseFloat(match[2]);

        return {
            lng: longitude,
            lat: latitude

        };
    } else {
        return null;
    }
}

$('#myCarousel').on('slid.bs.carousel', function () {
    if (markers.length != 0) {
        markers[0].remove();
    }
    markers.pop();
    var activeItem = $(this).find('.carousel-item.active');
    activeItem = activeItem.prevObject[0].innerText;
    var coord = extractCoordinates(activeItem);
    if (coord.lat <= 90) {
        var marker = new mapboxgl.Marker()
            .setLngLat([coord.lng, coord.lat]);
        markers.push(marker);
        markers[0].addTo(map);
    }
});

getImages();