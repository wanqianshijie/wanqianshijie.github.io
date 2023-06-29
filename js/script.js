$(document).ready(function() {
  var page = 1;
  var perPage = 4;
  var gallery = $('#gallery');

  loadPhotos();

  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
      loadPhotos();
    }
  });

  function loadPhotos() {
    var apiUrl = 'https://api.github.com/repos/{username}/{repository}/contents/{path}';
    var username = 'wanqianshijie';
    var repository = 'photos';
    var path = 'img';

    $.ajax({
      url: apiUrl.replace('{username}', username).replace('{repository}', repository).replace('{path}', path),
      dataType: 'json',
      success: function(data) {
        var start = (page - 1) * perPage;
        var end = start + perPage;

        for (var i = start; i < end; i++) {
          if (i >= data.length) {
            break;
          }

          var photo = data[i];
          var photoUrl = photo.download_url;
          var photoInfo = getPhotoInfo(photoUrl);

          var photoElement = $('<div class="photo">');
          var imgElement = $('<img>').attr('src', photoUrl);
          var infoElement = $('<div class="photo-info">').html(photoInfo);

          photoElement.append(imgElement);
          photoElement.append(infoElement);
          gallery.append(photoElement);
        }

        page++;
      }
    });
  }

  function getPhotoInfo(photoUrl) {
    var photoInfo = '';

    EXIF.getData(photoUrl, function() {
      var exifData = EXIF.getAllTags(this);

      var date = exifData.DateTimeOriginal;
      var latitude = exifData.GPSLatitude;
      var longitude = exifData.GPSLongitude;
      var exposureTime = exifData.ExposureTime;
      var aperture = exifData.FNumber;
      var iso = exifData.ISOSpeedRatings;
      var make = exifData.Make;
      var model = exifData.Model;

      // Format the date
      var formattedDate = formatDate(date);

      // Convert latitude and longitude to readable format
      var formattedLatitude = convertCoordinate(latitude);
      var formattedLongitude = convertCoordinate(longitude);

      photoInfo = 'Date: ' + formattedDate + '<br>';
      photoInfo += 'Latitude: ' + formattedLatitude + '<br>';
      photoInfo += 'Longitude: ' + formattedLongitude + '<br>';
      photoInfo += 'Exposure Time: ' + exposureTime + '<br>';
      photoInfo += 'Aperture: ' + aperture + '<br>';
      photoInfo += 'ISO: ' + iso + '<br>';
      photoInfo += 'Device: ' + make + ' ' + model;
    });

    return photoInfo;
  }

  function formatDate(date) {
    var parts = date.split(' ');
    var datePart = parts[0].split(':').reverse().join('-');
    var timePart = parts[1];
    return datePart + ' ' + timePart;
  }

  function convertCoordinate(coord) {
    var degrees = coord[0];
    var minutes = coord[1];
    var seconds = coord[2];
    var direction = coord[3];

    var decimal = degrees + (minutes / 60) + (seconds / 3600);
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }

    return decimal.toFixed(6);
  }
});
