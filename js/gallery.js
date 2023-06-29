// gallery.js

const galleryContainer = document.getElementById('gallery');
const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';
const photosPerLoad = 4;

let page = 1;
let photosLoaded = 0;

function fetchPhotos() {
  fetch(`${apiUrl}?page=${page}&per_page=${photosPerLoad}`)
    .then(response => response.json())
    .then(data => {
      data.forEach(photo => {
        const photoCard = createPhotoCard(photo.download_url);
        galleryContainer.appendChild(photoCard);
        photosLoaded++;
        if (photosLoaded % photosPerLoad === 0) {
          page++;
        }
      });
    })
    .catch(error => {
      console.error('Error fetching photos:', error);
    });
}

function createPhotoCard(photoUrl) {
  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');

  const imgElement = document.createElement('img');
  imgElement.src = photoUrl;
  photoCard.appendChild(imgElement);

  const detailsElement = document.createElement('div');
  detailsElement.classList.add('details');
  photoCard.appendChild(detailsElement);

  readExifData(photoUrl, detailsElement);

  return photoCard;
}

function readExifData(photoUrl, detailsElement) {
  EXIF.getData(photoUrl, function() {
    const exifData = EXIF.getAllTags(this);

    const { GPSLatitude, GPSLongitude } = exifData;
    const latitude = convertCoordinate(GPSLatitude);
    const longitude = convertCoordinate(GPSLongitude);

    const dateTimeOriginal = formatDateTime(exifData.DateTimeOriginal);
    const exposureTime = exifData.ExposureTime;
    const apertureValue = exifData.ApertureValue;
    const isoSpeedRatings = exifData.ISOSpeedRatings;
    const make = exifData.Make;
    const model = exifData.Model;

    const detailsHtml = `
      <span>Time: ${dateTimeOriginal}</span>
      <span>Latitude: ${latitude}</span>
      <span>Longitude: ${longitude}</span>
      <span>Exposure Time: ${exposureTime}</span>
      <span>Aperture: ${apertureValue}</span>
      <span>ISO: ${isoSpeedRatings}</span>
      <span>Device: ${make} ${model}</span>
    `;

    detailsElement.innerHTML = detailsHtml;
  });
}

function convertCoordinate(coordArray) {
  if (coordArray && coordArray.length === 3) {
    const degrees = coordArray[0];
    const minutes = coordArray[1];
    const seconds = coordArray[2];
    const decimal = degrees + minutes / 60 + seconds / 3600;
    return decimal.toFixed(6);
  }
  return 'N/A';
}

function formatDateTime(dateTime) {
  const dateObj = new Date(dateTime);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

fetchPhotos();
