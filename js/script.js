const gallery = document.getElementById('gallery');
let photos = [];
let currentBatch = 0;
const batchSize = 4;

function loadPhotos() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.github.com/repos/wanqianshijie/photos/contents/img', true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      photos = response;
      showPhotos();
    }
  }
  xhr.send();
}

function showPhotos() {
  const start = currentBatch * batchSize;
  const end = start + batchSize;
  const batch = photos.slice(start, end);
  batch.forEach(photo => {
    const photoElement = createPhotoElement(photo);
    gallery.appendChild(photoElement);
  });
  currentBatch++;
}

function createPhotoElement(photo) {
  const div = document.createElement('div');
  div.className = 'photo';

  const img = document.createElement('img');
  img.src = photo.download_url;
  div.appendChild(img);

  const info = document.createElement('div');
  info.className = 'info';

  const exifData = getExifData(photo.exif);
  const { dateTime, latitude, longitude, exposureTime, aperture, iso, make, model } = exifData;

  const formattedDateTime = formatDateTime(dateTime);
  const formattedLatitude = formatCoordinate(latitude);
  const formattedLongitude = formatCoordinate(longitude);

  info.innerHTML = `
    <p>Date: ${formattedDateTime}</p>
    <p>Latitude: ${formattedLatitude}</p>
    <p>Longitude: ${formattedLongitude}</p>
    <p>Exposure Time: ${exposureTime}</p>
    <p>Aperture: ${aperture}</p>
    <p>ISO: ${iso}</p>
    <p>Device: ${make} ${model}</p>
  `;

  div.appendChild(info);

  return div;
}

function getExifData(exif) {
  const exifData = {};
  exif.forEach(data => {
    exifData[data.tag] = data.value;
  });
  return exifData;
}

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  return `${formattedDate}, ${formattedTime}`;
}

function formatCoordinate(coordinate) {
  const degrees = Math.floor(coordinate);
  const minutes = Math.floor((coordinate - degrees) * 60);
  const seconds = Math.round((coordinate - degrees - minutes / 60) * 3600);
  return `${degrees}° ${minutes}' ${seconds}"`;
}

window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight) {
    showPhotos();
  }
});

loadPhotos();
