window.addEventListener('DOMContentLoaded', () => {
  const galleryElement = document.getElementById('gallery');
  let photoCount = 0;
  
  // Function to load and display photos
  const loadPhotos = () => {
    // Make a request to GitHub API to fetch photos from a repository
    fetch('https://api.github.com/repos/wanqianshijie/photos/contents/img')
      .then(response => response.json())
      .then(data => {
        const photos = data.filter(item => item.type === 'file');
        const photoBatch = photos.slice(photoCount, photoCount + 4);
        
        photoBatch.forEach(photo => {
          const photoContainer = document.createElement('div');
          photoContainer.classList.add('photo-container');
          
          const img = document.createElement('img');
          img.classList.add('photo');
          img.src = photo.download_url;
          img.onload = () => {
            // Use exif.js to extract photo information
            EXIF.getData(img, () => {
              const photoInfo = document.createElement('div');
              photoInfo.classList.add('photo-info');
              photoInfo.innerHTML = `
                <p>Date: ${formatDate(EXIF.getTag(img, 'DateTimeOriginal'))}</p>
                <p>Latitude: ${formatCoordinate(EXIF.getTag(img, 'GPSLatitude'))}</p>
                <p>Longitude: ${formatCoordinate(EXIF.getTag(img, 'GPSLongitude'))}</p>
                <p>Exposure Time: ${EXIF.getTag(img, 'ExposureTime')}</p>
                <p>Aperture: ${EXIF.getTag(img, 'FNumber')}</p>
                <p>ISO: ${EXIF.getTag(img, 'ISOSpeedRatings')}</p>
                <p>Device: ${EXIF.getTag(img, 'Model')}</p>
              `;
              photoContainer.appendChild(photoInfo);
            });
          };
          
          photoContainer.appendChild(img);
          galleryElement.appendChild(photoContainer);
        });
        
        photoCount += 4;
      })
      .catch(error => {
        console.log('Error fetching photos:', error);
      });
  };
  
  // Format the coordinate value (convert from degrees to decimal format)
  const formatCoordinate = (coordinate) => {
    if (!coordinate) return '';
    
    const degrees = coordinate[0].numerator / coordinate[0].denominator;
    const minutes = coordinate[1].numerator / coordinate[1].denominator;
    const seconds = coordinate[2].numerator / coordinate[2].denominator;
    
    const decimalDegrees = degrees + minutes / 60 + seconds / 3600;
    
    return decimalDegrees.toFixed(6);
  };
  
  // Format the date value (convert to a desired format)
  const formatDate = (date) => {
    if (!date) return '';
    
    const [year, month, day] = date.split(':');
    
    return `${day}/${month}/${year}`;
  };
  
  // Load initial batch of photos
  loadPhotos();
  
  // Load more photos when scrolling to the bottom of the page
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
      loadPhotos();
    }
  });
});
