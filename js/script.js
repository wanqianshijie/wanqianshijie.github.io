// 获取照片信息并展示
function loadPhotos() {
  const gallery = document.getElementById('gallery');
  const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';

  // 使用GitHub API获取照片列表
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const photoUrls = data.map(photo => photo.download_url);
      const photosCount = photoUrls.length;

      // 随机获取4张照片
      const randomPhotos = getRandomPhotos(photoUrls, 4);

      randomPhotos.forEach(photoUrl => {
        // 创建照片容器
        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photo-container');

        // 创建照片元素
        const photo = document.createElement('img');
        photo.src = photoUrl;
        photo.classList.add('photo');
        photoContainer.appendChild(photo);

        // 获取照片的EXIF信息
        getExifData(photoUrl)
          .then(exifData => {
            // 创建显示EXIF信息的元素
            const exifInfo = document.createElement('div');
            exifInfo.classList.add('exif-info');

            // 解析EXIF信息并添加到页面
            const parsedExif = parseExifData(exifData);
            exifInfo.innerHTML = `
              <p><strong>Date:</strong> ${parsedExif.date}</p>
              <p><strong>Location:</strong> ${parsedExif.location}</p>
              <p><strong>Exposure Time:</strong> ${parsedExif.exposureTime}</p>
              <p><strong>Aperture:</strong> ${parsedExif.aperture}</p>
              <p><strong>ISO:</strong> ${parsedExif.iso}</p>
              <p><strong>Device:</strong> ${parsedExif.device}</p>
            `;

            photoContainer.appendChild(exifInfo);
          });

        gallery.appendChild(photoContainer);
      });
    });
}

// 获取随机照片
function getRandomPhotos(photos, count) {
  const randomPhotos = [];
  const shuffledPhotos = photos.sort(() => 0.5 - Math.random());

  for (let i = 0; i < count; i++) {
    randomPhotos.push(shuffledPhotos[i]);
  }

  return randomPhotos;
}

// 使用exif.js获取照片的EXIF信息
function getExifData(photoUrl) {
  return new Promise((resolve, reject) => {
    EXIF.getData(photoUrl, function() {
      const exifData = EXIF.pretty(this);
      resolve(exifData);
    });
  });
}

// 解析EXIF信息
function parseExifData(exifData) {
  const exif = {};

  exifData.split('\n').forEach(item => {
    const keyValue = item.split(':');
    const key = keyValue[0].trim();
    const value = keyValue[1].trim();
    exif[key] = value;
  });

  // 优化经度和纬度坐标
  if (exif.GPSLatitude && exif.GPSLongitude) {
    const latitude = convertCoordinates(exif.GPSLatitude, exif.GPSLatitudeRef);
    const longitude = convertCoordinates(exif.GPSLongitude, exif.GPSLongitudeRef);
    exif.location = `Latitude: ${latitude}, Longitude: ${longitude}`;
  }

  // 优化日期格式
  if (exif.DateTimeOriginal) {
    const date = formatDate(exif.DateTimeOriginal);
    exif.date = date;
  }

  return exif;
}

// 转换经度和纬度坐标
function convertCoordinates(coordinates, direction) {
  const degrees = coordinates[0];
  const minutes = coordinates[1];
  const seconds = coordinates[2];
  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }

  return decimal.toFixed(6);
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// 页面加载时加载照片
window.addEventListener('DOMContentLoaded', loadPhotos);
