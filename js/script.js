// GitHub API URL for retrieving photos
const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';

// Number of photos to load initially and on scroll
const photosPerPage = 4;

// Load photos from GitHub API
async function loadPhotos() {
    try {
        const response = await fetch(apiUrl);
        const photos = await response.json();

        // Randomly select photosPerPage number of photos
        const randomPhotos = getRandomElements(photos, photosPerPage);

        // Display photos on the page
        randomPhotos.forEach(photo => displayPhoto(photo));
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

// Display a single photo on the page
function displayPhoto(photo) {
    const gallery = document.getElementById('gallery');

    // Create photo container
    const photoContainer = document.createElement('div');
    photoContainer.classList.add('photo-container');

    // Create image element
    const image = document.createElement('img');
    image.src = photo.download_url;
    image.alt = photo.name;
    image.classList.add('photo');

    // Create photo info element
    const info = document.createElement('div');
    info.classList.add('info');

    // Fetch EXIF data using exif.js
    EXIF.getData(image, function () {
        const exifData = EXIF.getAllTags(this);

        // Extract relevant information
        const {
            DateTimeOriginal,
            GPSLatitude,
            GPSLongitude,
            ExposureTime,
            FNumber,
            ISOSpeedRatings,
            Model
        } = exifData;

        // Format date
        const formattedDate = formatDateTime(DateTimeOriginal);

        // Create info HTML
        const infoHTML = `
            <p>Date: ${formattedDate}</p>
            <p>Latitude: ${formatCoordinates(GPSLatitude)}</p>
            <p>Longitude: ${formatCoordinates(GPSLongitude)}</p>
            <p>Exposure Time: ${ExposureTime}</p>
            <p>Aperture: ${FNumber}</p>
            <p>ISO: ${ISOSpeedRatings}</p>
            <p>Device: ${Model}</p>
        `;

        // Insert info HTML into info element
        info.innerHTML = infoHTML;
    });

    // Append image and info to photo container
    photoContainer.appendChild(image);
    photoContainer.appendChild(info);

    // Append photo container to the gallery
    gallery.appendChild(photoContainer);
}

// Helper function to format date and time
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
    return formattedDate;
}

// Helper function to format coordinates
function formatCoordinates(coordinates) {
    const degrees = coordinates[0].numerator / coordinates[0].denominator;
    const minutes = coordinates[1].numerator / coordinates[1].denominator;
    const seconds = coordinates[2].numerator / coordinates[2].denominator;
    const direction = coordinates[3];

    const formattedCoordinates = `${degrees}° ${minutes}' ${seconds}" ${direction}`;
    return formattedCoordinates;
}

// Helper function to get a random subset of elements from an array
function getRandomElements(array, numElements) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numElements);
}

// Load initial set of photos
loadPhotos();

// Load more photos on scroll
window.addEventListener('scroll', function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        loadPhotos();
    }
});
