const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';
const galleryElement = document.getElementById('gallery');
let photosData = [];

function fetchData(url) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            photosData = data;
            displayPhotos(0, 4); // Display initial photos
        })
        .catch(error => console.error('Error:', error));
}

function displayPhotos(startIndex, count) {
    const endIndex = startIndex + count;
    const photosToShow = photosData.slice(startIndex, endIndex);

    photosToShow.forEach(photo => {
        const photoCard = createPhotoCard(photo);
        galleryElement.appendChild(photoCard);
    });
}

function createPhotoCard(photoData) {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');

    const img = document.createElement('img');
    img.src = photoData.download_url;
    photoCard.appendChild(img);

    const details = document.createElement('div');
    details.classList.add('details');
    photoCard.appendChild(details);

    getPhotoExif(photoData.download_url)
        .then(exifData => {
            const { DateTimeOriginal, GPSLatitude, GPSLongitude, ExposureTime, FNumber, ISO, Make, Model } = exifData;

            const formattedDate = formatPhotoDate(DateTimeOriginal);
            const formattedCoordinates = formatCoordinates(GPSLatitude, GPSLongitude);

            const detailsContent = `
                Date: ${formattedDate}<br>
                Latitude: ${formattedCoordinates.latitude}<br>
                Longitude: ${formattedCoordinates.longitude}<br>
                Exposure Time: ${ExposureTime}<br>
                F-Number: ${FNumber}<br>
                ISO: ${ISO}<br>
                Device: ${Make} ${Model}
            `;

            details.innerHTML = detailsContent;
        });

    return photoCard;
}

function getPhotoExif(photoUrl) {
    return new Promise((resolve, reject) => {
        EXIF.getData(photoUrl, function() {
            const exifData = EXIF.getAllTags(this);
            resolve(exifData);
        });
    });
}

function formatPhotoDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatCoordinates(latitude, longitude) {
    const formattedLatitude = convertDMSToDD(latitude);
    const formattedLongitude = convertDMSToDD(longitude);
    return { latitude: formattedLatitude, longitude: formattedLongitude };
}

function convertDMSToDD(dms) {
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];
    const direction = dms[3];

    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
        dd = -dd;
    }
    return dd.toFixed(6);
}

fetchData(apiUrl);
