const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';
const photosPerPage = 4;
let currentPage = 1;

function getPhotos(page) {
    const startIndex = (page - 1) * photosPerPage;
    const endIndex = startIndex + photosPerPage;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const photos = response.slice(startIndex, endIndex);
            displayPhotos(photos);
        }
    };
    xhr.send();
}

function displayPhotos(photos) {
    const gallery = document.getElementById('gallery');

    photos.forEach(function(photo) {
        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photo');

        const photoImage = new Image();
        photoImage.classList.add('photo-image');
        photoImage.src = photo.download_url;
        photoImage.onload = function() {
            const exifData = getExifData(photoImage);
            const photoInfo = createPhotoInfo(exifData);

            const infoContainer = document.createElement('div');
            infoContainer.classList.add('info');
            infoContainer.innerHTML = photoInfo;

            photoContainer.style.backgroundImage = `url(${photo.download_url})`;
            photoContainer.appendChild(infoContainer);
        };

        gallery.appendChild(photoContainer);
    });

    currentPage++;
}

function getExifData(image) {
    const exifData = EXIF.readFromBinaryFile(base64ToArrayBuffer(image.src));
    return exifData;
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64.split(',')[1]);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
}

function createPhotoInfo(exifData) {
    const dateTime = exifData.DateTimeOriginal;
    const latitude = exifData.GPSLatitude;
    const longitude = exifData.GPSLongitude;
    const exposureTime = exifData.ExposureTime;
    const aperture = exifData.FNumber;
    const iso = exifData.ISO;
    const deviceInfo = exifData.Make + ' ' + exifData.Model;

    const formattedDateTime = formatDateTime(dateTime);
    const formattedLatitude = formatCoordinate(latitude);
    const formattedLongitude = formatCoordinate(longitude);

    const photoInfo = `
        <div><strong>Date:</strong> ${formattedDateTime}</div>
        <div><strong>Latitude:</strong> ${formattedLatitude}</div>
        <div><strong>Longitude:</strong> ${formattedLongitude}</div>
        <div><strong>Exposure Time:</strong> ${exposureTime}</div>
        <div><strong>Aperture:</strong> ${aperture}</div>
        <div><strong>ISO:</strong> ${iso}</div>
        <div><strong>Device Info:</strong> ${deviceInfo}</div>
    `;

    return photoInfo;
}

function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatCoordinate(coordinate) {
    const degrees = Math.abs(coordinate[0]);
    const minutes = coordinate[1];
    const seconds = coordinate[2];
    const direction = coordinate[3] > 0 ? 'N' : 'S';

    const formattedCoordinate = `${degrees}° ${minutes}' ${seconds}" ${direction}`;
    return formattedCoordinate;
}

function loadMorePhotos() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading');
    loadingDiv.textContent = 'Loading...';

    const gallery = document.getElementById('gallery');
    gallery.appendChild(loadingDiv);

    getPhotos(currentPage);
    gallery.removeChild(loadingDiv);
}

window.addEventListener('DOMContentLoaded', function() {
    getPhotos(currentPage);
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            loadMorePhotos();
        }
    });
});
