// GitHub repository information
const username = 'wanqianshijie';
const repository = 'photos';
const path = 'img';

// Fetch photos from GitHub repository
fetch(`https://api.github.com/repos/${username}/${repository}/contents/${path}`)
  .then(response => response.json())
  .then(photos => {
    photos.forEach(photo => {
      const photoUrl = photo.download_url;

      // Create photo element
      const photoElement = document.createElement('img');
      photoElement.classList.add('photo');
      photoElement.src = photoUrl;

      // Create EXIF info element
      const exifInfoElement = document.createElement('div');
      exifInfoElement.classList.add('exif-info');

      // Get EXIF data using exif.js
      EXIF.getData(photoElement, function() {
        const exifData = EXIF.getAllTags(this);
        const {
          DateTimeOriginal,
          GPSLatitude,
          GPSLongitude,
          ExposureTime,
          FNumber,
          ISOSpeedRatings,
          Make,
          Model
        } = exifData;

        // Format GPS coordinates
        const latitude = convertCoordinate(GPSLatitude);
        const longitude = convertCoordinate(GPSLongitude);

        // Format ExposureTime as a fraction
        const exposureTime = formatFraction(ExposureTime);

        // Format DateTimeOriginal
        const date = formatDate(DateTimeOriginal);

        // Create EXIF info content
        const content = `
          <p>Date: ${date}</p>
          <p>Latitude: ${latitude}</p>
          <p>Longitude: ${longitude}</p>
          <p>Exposure Time: ${exposureTime}</p>
          <p>Aperture: ${FNumber}</p>
          <p>ISO: ${ISOSpeedRatings}</p>
          <p>Camera: ${Make} ${Model}</p>
        `;
        exifInfoElement.innerHTML = content;
      });

      // Append photo and EXIF info to the container
      const photoContainer = document.getElementById('photo-container');
      photoContainer.appendChild(photoElement);
      photoContainer.appendChild(exifInfoElement);
    });
  });

// Helper function to convert GPS coordinates to decimal format
function convertCoordinate(coordinate) {
  if (!coordinate) return '';

  const degrees = coordinate[0].numerator / coordinate[0].denominator;
  const minutes = coordinate[1].numerator / coordinate[1].denominator;
  const seconds = coordinate[2].numerator / coordinate[2].denominator;

  const decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
  const direction = coordinate[0].value === 0 ? 'S' : 'N';

  return `${decimalDegrees.toFixed(6)}° ${direction}`;
}

// Helper function to format ExposureTime as a fraction
function formatFraction(value) {
  if (!value) return '';

  const numerator = value.numerator;
  const denominator = value.denominator;
  return `1/${denominator/numerator}`;
}

// Helper function to format date
function formatDate(dateTime) {
  if (!dateTime) return '';

  const [date, time] = dateTime.split(' ');
  const [year, month, day] = date.split(':');

  return `${day}/${month}/${year} ${time}`;
}
