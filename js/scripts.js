// scripts.js
const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';
const photoContainer = document.getElementById('photoContainer');
const loadMoreButton = document.getElementById('loadMoreButton');
let page = 1;

function fetchPhotos(pageSize) {
    fetch(`${apiUrl}?page=${page}&per_page=${pageSize}`)
        .then(response => response.json())
        .then(data => {
            const photoPromises = data.map(photo => fetchPhotoData(photo));
            Promise.all(photoPromises).then(photos => {
                photos.forEach(photo => {
                    const photoElement = createPhotoElement(photo);
                    photoContainer.appendChild(photoElement);
                });
                page++;
                loadMoreButton.disabled = false;
            });
        })
        .catch(error => console.error('Error:', error));
}

function fetchPhotoData(photo) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = photo.download_url;
        image.onload = function() {
            EXIF.getData(image, function() {
                const exifData = EXIF.getAllTags(this);
                const formattedData = formatExifData(exifData);
                resolve({ image, exifData: formattedData });
            });
        };
        image.onerror = reject;
    });
}

function formatExifData(exifData) {
    const latitude = exifData.GPSLatitude;
    const longitude = exifData.GPSLongitude;

    const formattedExifData = {
        timestamp: exifData.DateTimeOriginal,
        latitude: convertCoordinates(latitude),
        longitude: convertCoordinates(longitude),
        exposureTime: exifData.ExposureTime,
        aperture: exifData.FNumber,
        iso: exifData.ISO,
        device: exifData.Model
    };

    return formattedExifData;
}

function convertCoordinates(coordinates) {
    if (!coordinates) {
        return null;
    }

    const degrees = coordinates[0];
    const minutes = coordinates[1];
    const seconds = coordinates[2];

    const decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
    return decimalDegrees;
}

function createPhotoElement(photo) {
    const { image, exifData } = photo;
    const photoElement = document.createElement('div');
    photoElement.classList.add('photo');

    const imgElement = document.createElement('img');
    imgElement.src = image.src;
    photoElement.appendChild(imgElement);

    const infoElement = document.createElement('div');
    infoElement.classList.add('info');

    for (const key in exifData) {
        const value = exifData[key];
        const infoItem = document.createElement('div');
        infoItem.innerHTML = `<strong>${key}:</strong> ${value}`;
        infoElement.appendChild(infoItem);
    }

    photoElement.appendChild(infoElement);

    return photoElement;
}

loadMoreButton.addEventListener('click', () => {
    loadMoreButton.disabled = true;
    fetchPhotos(4);
});

fetchPhotos(4);
