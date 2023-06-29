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
  const container = document.createElement('div');
  container.className = 'photo-container';

  const img = document.createElement('img');
  img.src = photo.download_url;
  container.appendChild(img);

  const exifInfo = document.createElement('div');
  exifInfo.className = 'exif-info';

  const exifData = getExifData(photo.exif);
  const { dateTime, latitude, longitude, exposureTime, aperture, iso, make, model } = exifData;

  const formattedDateTime = formatDateTime(dateTime);
  const formattedLatitude = formatCoordinate(latitude);
  const formattedLongitude = formatCoordinate(longitude);

  exifInfo.innerHTML = `
    <div class="exif-info-row">
      <div class="exif-info-item">Date: ${formattedDateTime}</div>
      <div class="exif-info-item">Latitude: ${formattedLatitude}</div>
      <div class="exif-info-item">Longitude: ${formattedLongitude}</div>
    </div>
    <div class="exif-info-row">
      <div class="exif-info-item">Exposure Time: ${exposureTime}</div>
      <div class="exif-info-item">Aperture: ${aperture}</div>
      <div class="exif-info-item">ISO: ${iso}</div>
    </div>
    <div class="exif-info-row">
      <div class="exif-info-item">Device: ${make} ${model}</div>
    </div>
  `;

  container.appendChild(exifInfo);

  return container;
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
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  return new Intl.DateTimeFormat('en-US', options).format(date);
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

window.onload = loadPhotos;
