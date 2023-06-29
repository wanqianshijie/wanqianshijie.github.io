$(document).ready(function() {
  var page = 1;
  var perPage = 4;
  var photoContainer = $('#photoContainer');

  loadPhotos();

  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
      page++;
      loadPhotos();
    }
  });

  function loadPhotos() {
    var apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img?ref=main';

    $.ajax({
      url: apiUrl,
      method: 'GET',
      data: { page: page, per_page: perPage },
      headers: { 'Authorization': 'token 您的GitHub访问令牌' },
      success: function(response) {
        for(var i = 0; i < response.length; i++) {
          var photoData = response[i];
          var photoUrl = photoData.download_url;

          getPhotoMetadata(photoUrl, function(metadata) {
            var photoElement = createPhotoElement(photoUrl, metadata);
            photoContainer.append(photoElement);
          });
        }
      }
    });
  }

  function getPhotoMetadata(photoUrl, callback) {
    EXIF.getData(photoUrl, function() {
      var metadata = {};

      var exifData = EXIF.getAllTags(this);
      metadata.timestamp = exifData.DateTimeOriginal;
      metadata.latitude = formatCoordinates(exifData.GPSLatitude, exifData.GPSLatitudeRef);
      metadata.longitude = formatCoordinates(exifData.GPSLongitude, exifData.GPSLongitudeRef);
      metadata.exposureTime = exifData.ExposureTime;
      metadata.aperture = exifData.FNumber;
      metadata.iso = exifData.ISOSpeedRatings;
      metadata.device = exifData.Model;

      callback(metadata);
    });
  }

  function createPhotoElement(photoUrl, metadata) {
    var photoElement = $('<div>').addClass('photo');
    var photoImage = $('<img>').attr('src', photoUrl);
    var photoInfo = $('<div>').addClass('photoInfo').html(
      '<strong>Date:</strong> ' + formatDate(metadata.timestamp) + '<br>' +
      '<strong>Latitude:</strong> ' + metadata.latitude + '<br>' +
      '<strong>Longitude:</strong> ' + metadata.longitude + '<br>' +
      '<strong>Exposure Time:</strong> ' + metadata.exposureTime + '<br>' +
      '<strong>Aperture:</strong> ' + metadata.aperture + '<br>' +
      '<strong>ISO:</strong> ' + metadata.iso + '<br>' +
      '<strong>Device:</strong> ' + metadata.device
    );

    photoElement.append(photoImage);
    photoElement.append(photoInfo);

    return photoElement;
  }

  function formatCoordinates(coordinates, direction) {
    var degrees = coordinates[0];
    var minutes = coordinates[1];
    var seconds = coordinates[2];

    var decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
    decimalDegrees = direction === 'S' || direction === 'W' ? -decimalDegrees : decimalDegrees;

    return decimalDegrees.toFixed(6);
  }

  function formatDate(timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var formattedDate = year + '-' + month + '-' + day;

    return formattedDate;
  }
});
