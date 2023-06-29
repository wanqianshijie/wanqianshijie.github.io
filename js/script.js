$(document).ready(function() {
  var page = 1;
  var perPage = 4;
  var galleryContainer = $('#gallery');
  
  loadPhotos();

  $(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
      page++;
      loadPhotos();
    }
  });

  function loadPhotos() {
    var apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img?page=' + page + '&per_page=' + perPage;

    $.getJSON(apiUrl, function(data) {
      $.each(data, function(index, photo) {
        var imageUrl = photo.download_url;

        $('<img/>').attr('src', imageUrl).on('load', function() {
          var img = this;
          var exifData = getExifData(img);
          var exifInfo = formatExifInfo(exifData);

          var photoContainer = $('<div class="photo-container"></div>');
          var photoInfo = $('<div class="photo-info"></div>').html(exifInfo);

          photoContainer.append(img);
          photoContainer.append(photoInfo);
          galleryContainer.append(photoContainer);
        });
      });
    });
  }

  function getExifData(img) {
    var exifData = null;

    EXIF.getData(img, function() {
      exifData = EXIF.getAllTags(this);
    });

    return exifData;
  }

  function formatExifInfo(exifData) {
    var formattedInfo = '';
    var dateTime = exifData.DateTimeOriginal;
    var latitude = exifData.GPSLatitude;
    var longitude = exifData.GPSLongitude;
    var exposureTime = exifData.ExposureTime;
    var aperture = exifData.FNumber;
    var iso = exifData.ISO;
    var make = exifData.Make;
    var model = exifData.Model;

    if (dateTime) {
      var date = dateTime.split(' ')[0];
      var time = dateTime.split(' ')[1];
      var formattedDate = formatDate(date);
      formattedInfo += '<p><strong>Date:</strong> ' + formattedDate + '</p>';
      formattedInfo += '<p><strong>Time:</strong> ' + time + '</p>';
    }

    if (latitude && longitude) {
      var formattedLat = convertDMSToDD(latitude);
      var formattedLng = convertDMSToDD(longitude);
      formattedInfo += '<p><strong>Latitude:</strong> ' + formattedLat + '</p>';
      formattedInfo += '<p><strong>Longitude:</strong> ' + formattedLng + '</p>';
    }

    if (exposureTime) {
      formattedInfo += '<p><strong>Exposure Time:</strong> ' + exposureTime + '</p>';
    }

    if (aperture) {
      formattedInfo += '<p><strong>Aperture:</strong> ' + aperture + '</p>';
    }

    if (iso) {
      formattedInfo += '<p><strong>ISO:</strong> ' + iso + '</p>';
    }

    if (make && model) {
      formattedInfo += '<p><strong>Device:</strong> ' + make + ' ' + model + '</p>';
    }

    return formattedInfo;
  }

  function formatDate(date) {
    var parts = date.split(':');
    var year = parts[0];
    var month = parts[1];
    var day = parts[2];

    return day + '/' + month + '/' + year;
  }

  function convertDMSToDD(coordinate) {
    var degrees = coordinate[0];
    var minutes = coordinate[1];
    var seconds = coordinate[2];

    var dd = degrees + minutes / 60 + seconds / 3600;

    return dd;
  }
});
