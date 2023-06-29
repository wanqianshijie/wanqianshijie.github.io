$(document).ready(function() {
  var username = 'wanqianshijie';
  var repository = 'photos';
  var path = 'img';

  var apiUrl = 'https://api.github.com/repos/' + username + '/' + repository + '/contents/' + path;

  $.get(apiUrl, function(data) {
    $.each(data, function(index, item) {
      if (item.type === 'file' && item.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
        var photoUrl = item.download_url;
        var photoName = item.name;
        
        // Create a new photo element
        var photoElement = $('<div class="photo"></div>');

        // Create an image element
        var imgElement = $('<img>').attr('src', photoUrl);

        // Append image element to the photo element
        photoElement.append(imgElement);

        // Append photo element to the photo gallery
        $('#photo-gallery').append(photoElement);

        // Load EXIF data for the image
        EXIF.getData(imgElement[0], function() {
          var exifData = this.exifdata;
          
          // Create an exif element
          var exifElement = $('<div class="exif"></div>');

          // Extract and format the required EXIF information
          var dateTimeOriginal = exifData.DateTimeOriginal;
          var exposureTime = exifData.ExposureTime;
          var apertureValue = exifData.ApertureValue;
          var isoSpeedRatings = exifData.ISOSpeedRatings;
          var gpsLatitude = exifData.GPSLatitude;
          var gpsLongitude = exifData.GPSLongitude;
          var make = exifData.Make;
          var model = exifData.Model;

          var formattedDateTime = formatDateTime(dateTimeOriginal);
          var formattedExposureTime = formatFraction(exposureTime);
          
          // Create HTML content for the exif element
          var exifContent = '<p>拍摄时间：' + formattedDateTime + '</p>' +
                            '<p>经度坐标：' + formatCoordinate(gpsLongitude) + '</p>' +
                            '<p>纬度坐标：' + formatCoordinate(gpsLatitude) + '</p>' +
                            '<p>曝光时间：' + formattedExposureTime + ' 秒</p>' +
                            '<p>光圈大小：f/' + apertureValue.toFixed(1) + '</p>' +
                            '<p>ISO：' + isoSpeedRatings + '</p>' +
                            '<p>设备信息：' + make + ' ' + model + '</p>';

          // Set the exif content
          exifElement.html(exifContent);

          // Append exif element to the photo element
          photoElement.append(exifElement);
        });
      }
    });
  });

  // Format the date and time
  function formatDateTime(dateTimeString) {
    var dateTime = new Date(dateTimeString);
    var year = dateTime.getFullYear();
    var month = ('0' + (dateTime.getMonth() + 1)).slice(-2);
    var day = ('0' + dateTime.getDate()).slice(-2);
    var hours = ('0' + dateTime.getHours()).slice(-2);
    var minutes = ('0' + dateTime.getMinutes()).slice(-2);
    var seconds = ('0' + dateTime.getSeconds()).slice(-2);

    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  }

  // Format the fraction
  function formatFraction(fraction) {
    var numerator = fraction.numerator;
    var denominator = Math.round(fraction.denominator);

    return numerator + '/' + denominator;
  }

  // Format the coordinate
  function formatCoordinate(coordinate) {
    var degrees = coordinate[0].numerator / coordinate[0].denominator;
    var minutes = coordinate[1].numerator / coordinate[1].denominator;
    var seconds = coordinate[2].numerator / coordinate[2].denominator;

    return degrees + '° ' + minutes + '\' ' + seconds + '"';
  }
});
