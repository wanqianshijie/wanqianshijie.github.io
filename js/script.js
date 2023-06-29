window.onload = function() {
  // 使用GitHub API获取照片列表
  fetch('https://api.github.com/repos/wanqianshijie/photos/contents/img')
    .then(response => response.json())
    .then(data => {
      // 遍历照片列表并展示
      data.forEach(photo => {
        if (photo.name.endsWith('.jpg') || photo.name.endsWith('.jpeg') || photo.name.endsWith('.png')) {
          displayPhoto(photo.download_url);
        }
      });
    })
    .catch(error => console.error(error));
};

function displayPhoto(photoUrl) {
  // 创建照片元素
  var photoElement = document.createElement('img');
  photoElement.src = photoUrl;

  // 监听照片加载完成事件
  photoElement.onload = function() {
    // 获取照片的EXIF信息
    var exifData = EXIF.getData(photoElement);
    var exifInfo = getFormattedExifInfo(exifData);

    // 创建照片容器
    var photoContainer = document.createElement('div');
    photoContainer.classList.add('photo-container');

    // 创建照片描述
    var descriptionElement = document.createElement('div');
    descriptionElement.classList.add('photo-description');
    descriptionElement.innerText = exifInfo;

    // 将照片和描述添加到页面中
    photoContainer.appendChild(photoElement);
    photoContainer.appendChild(descriptionElement);
    document.getElementById('photo-container').appendChild(photoContainer);
  };
}

function getFormattedExifInfo(exifData) {
  // 提取EXIF信息
  var dateTimeOriginal = exifData.DateTimeOriginal;
  var latitude = exifData.GPSLatitude;
  var longitude = exifData.GPSLongitude;
  var exposureTime = exifData.ExposureTime;
  var apertureValue = exifData.ApertureValue;
  var isoSpeedRatings = exifData.ISOSpeedRatings;
  var make = exifData.Make;
  var model = exifData.Model;

  // 优化经度和纬度坐标
  var latitudeRef = exifData.GPSLatitudeRef;
  var longitudeRef = exifData.GPSLongitudeRef;
  latitude = optimizeCoordinate(latitude, latitudeRef);
  longitude = optimizeCoordinate(longitude, longitudeRef);

  // 优化拍摄日期格式
  dateTimeOriginal = formatDateTimeOriginal(dateTimeOriginal);

  // 优化曝光时间格式
  exposureTime = formatExposureTime(exposureTime);

  // 构建EXIF信息字符串
  var exifInfo = "拍摄时间：" + dateTimeOriginal + "\n";
  exifInfo += "经度坐标：" + longitude + "\n";
  exifInfo += "纬度坐标：" + latitude + "\n";
  exifInfo += "曝光时间：" + exposureTime + " 秒\n";
  exifInfo += "光圈大小：" + apertureValue + "\n";
  exifInfo += "ISO：" + isoSpeedRatings + "\n";
  exifInfo += "设备信息：" + make + " " + model;

  return exifInfo;
}

function optimizeCoordinate(coordinate, coordinateRef) {
  // 将度分秒坐标转换为十进制坐标
  var degrees = coordinate[0].numerator / coordinate[0].denominator;
  var minutes = coordinate[1].numerator / coordinate[1].denominator / 60;
  var seconds = coordinate[2].numerator / coordinate[2].denominator / 3600;
  var direction = coordinateRef === 'N' || coordinateRef === 'E' ? 1 : -1;
  var decimalCoordinate = (degrees + minutes + seconds) * direction;
  
  return decimalCoordinate.toFixed(6);
}

function formatDateTimeOriginal(dateTimeOriginal) {
  // 将拍摄日期格式化为"YYYY-MM-DD HH:MM:SS"的形式
  var date = new Date(dateTimeOriginal * 1000);
  var formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
  var formattedTime = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
  
  return formattedDate + ' ' + formattedTime;
}

function formatExposureTime(exposureTime) {
  // 将曝光时间格式化为分数
  var numerator = exposureTime.numerator;
  var denominator = exposureTime.denominator;
  if (denominator >= 1 && denominator <= 100) {
    // 分母是小数，按照四舍五入取整
    numerator = Math.round(numerator / denominator);
    denominator = 1;
  }
  
  return numerator + '/' + denominator;
}
