const photoContainer = document.getElementById('photoContainer');
const photosPerPage = 4;
const githubUsername = 'wanqianshijie';
const githubRepo = 'photos';

// 获取照片信息并显示
async function displayPhotos(page) {
  const startIndex = (page - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;

  try {
    const response = await fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/img`);
    const photos = await response.json();

    for (let i = startIndex; i < endIndex && i < photos.length; i++) {
      const photo = photos[i];
      const photoUrl = photo.download_url;

      const photoElement = document.createElement('div');
      photoElement.classList.add('photo');

      const imgElement = document.createElement('img');
      imgElement.src = photoUrl;
      photoElement.appendChild(imgElement);

      const photoInfoElement = document.createElement('div');
      photoInfoElement.classList.add('photoInfo');

      const exifData = await getExifData(photoUrl);

      const takenDate = formatTakenDate(exifData.DateTimeOriginal);
      const latitude = optimizeCoordinates(exifData.GPSLatitude, exifData.GPSLatitudeRef);
      const longitude = optimizeCoordinates(exifData.GPSLongitude, exifData.GPSLongitudeRef);

      photoInfoElement.innerHTML = `
        <p>拍摄日期：${takenDate}</p>
        <p>经度坐标：${longitude}</p>
        <p>纬度坐标：${latitude}</p>
        <p>曝光时间：${exifData.ExposureTime}</p>
        <p>光圈大小：${exifData.FNumber}</p>
        <p>ISO：${exifData.ISO}</p>
        <p>设备信息：${exifData.Model}</p>
      `;

      photoElement.appendChild(photoInfoElement);
      photoContainer.appendChild(photoElement);
    }
  } catch (error) {
    console.error(error);
  }
}

// 获取照片的EXIF数据
function getExifData(photoUrl) {
  return new Promise((resolve, reject) => {
    EXIF.getData(photoUrl, function() {
      const exifData = EXIF.getAllTags(this);
      resolve(exifData);
    });
  });
}

// 优化坐标显示
function optimizeCoordinates(coordinates, direction) {
  let optimizedCoordinates = coordinates[0] + '° ';
  optimizedCoordinates += coordinates[1] + "' ";
  optimizedCoordinates += coordinates[2] + '" ';
  optimizedCoordinates += direction;

  return optimizedCoordinates;
}

// 优化拍摄日期格式
function formatTakenDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('zh-CN', options);
}

// 监听滚动事件，加载更多照片
window.addEventListener('scroll', function() {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    displayPhotos(Math.floor(photoContainer.childElementCount / photosPerPage) + 1);
  }
});

// 页面加载完成后显示初始照片
window.addEventListener('DOMContentLoaded', function() {
  displayPhotos(1);
});
