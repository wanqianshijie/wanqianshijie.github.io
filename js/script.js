const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');

let page = 1;
const perPage = 4;

function getPhotos() {
  loading.style.display = 'block';

  // 使用GitHub API获取照片信息
  fetch(`https://api.github.com/repos/wanqianshijie/photos/contents/img/?page=${page}&per_page=${perPage}`)
    .then(response => response.json())
    .then(data => {
      loading.style.display = 'none';

      // 随机排序照片
      const shuffledData = shuffleArray(data);

      shuffledData.forEach(photo => {
        const photoInfo = document.createElement('div');
        photoInfo.className = 'photo-info';

        const img = new Image();
        img.src = photo.download_url;
        img.onload = function() {
          const exifData = EXIF.getData(this);

          // 提取拍摄信息
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

          // 优化经度和纬度的显示格式
          const latitude = formatCoordinates(GPSLatitude);
          const longitude = formatCoordinates(GPSLongitude);

          const photoDetails = `
            <p>Shot on: ${formatDate(DateTimeOriginal)}</p>
            <p>Latitude: ${latitude}</p>
            <p>Longitude: ${longitude}</p>
            <p>Exposure Time: ${ExposureTime}</p>
            <p>Aperture: f/${FNumber}</p>
            <p>ISO: ${ISOSpeedRatings}</p>
            <p>Device: ${Make} ${Model}</p>
          `;

          photoInfo.innerHTML = photoDetails;

          const photoContainer = document.createElement('div');
          photoContainer.className = 'photo';
          photoContainer.appendChild(img);
          photoContainer.appendChild(photoInfo);

          gallery.appendChild(photoContainer);
        };
      });
    })
    .catch(error => {
      loading.textContent = 'Error occurred while fetching photos.';
      console.error(error);
    });
}

// 优化经度和纬度的显示格式
function formatCoordinates(coordinates) {
  if (!coordinates) return '';

  const degrees = coordinates[0].numerator / coordinates[0].denominator;
  const minutes = coordinates[1].numerator / coordinates[1].denominator;
  const seconds = coordinates[2].numerator / coordinates[2].denominator;

  return `${degrees}° ${minutes}' ${seconds}"`;
}

// 格式化日期显示
function formatDate(date) {
  if (!date) return '';

  const [year, month, day] = date.split(':');
  return `${day}-${month}-${year}`;
}

// 随机排序数组
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 监听滚动事件，加载更多照片
window.addEventListener('scroll', () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    page++;
    getPhotos();
  }
});

// 初始加载照片
getPhotos();
