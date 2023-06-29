$(document).ready(function() {
    var page = 1; // 当前页码
    var perPage = 4; // 每页照片数量
    var baseUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img'; // GitHub API URL
    var gallery = $('#gallery'); // 照片展示容器

    loadPhotos();

    // 滚动到底部时加载更多照片
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            page++;
            loadPhotos();
        }
    });

    // 加载照片
    function loadPhotos() {
        var url = baseUrl + '?page=' + page + '&per_page=' + perPage;
        $.getJSON(url, function(data) {
            $.each(data, function(index, photo) {
                var img = $('<img>').attr('src', photo.download_url).addClass('photo');
                var info = $('<div>').addClass('info');

                // 获取照片的EXIF信息
                getExifInfo(photo.download_url, function(exif) {
                    var time = formatDate(exif.DateTimeOriginal);
                    var latitude = formatCoordinate(exif.GPSLatitude, exif.GPSLatitudeRef);
                    var longitude = formatCoordinate(exif.GPSLongitude, exif.GPSLongitudeRef);
                    var exposureTime = exif.ExposureTime;
                    var aperture = exif.FNumber;
                    var iso = exif.ISOSpeedRatings;
                    var make = exif.Make;
                    var model = exif.Model;

                    // 创建照片信息的HTML元素
                    var infoHtml = '<p>拍摄时间：' + time + '</p>' +
                                   '<p>经度坐标：' + longitude + '</p>' +
                                   '<p>纬度坐标：' + latitude + '</p>' +
                                   '<p>曝光时间：' + exposureTime + '</p>' +
                                   '<p>光圈大小：' + aperture + '</p>' +
                                   '<p>ISO：' + iso + '</p>' +
                                   '<p>设备信息：' + make + ' ' + model + '</p>';

                    info.html(infoHtml);

                    // 将照片和信息添加到照片展示容器中
                    gallery.append(img);
                    gallery.append(info);
                });
            });
        });
    }

    // 获取照片的EXIF信息
    function getExifInfo(url, callback) {
        EXIF.getData(url, function() {
            var exif = EXIF.getAllTags(this);
            callback(exif);
        });
    }

    // 格式化经度/纬度坐标
    function formatCoordinate(coordinate, direction) {
        var degrees = coordinate[0];
        var minutes = coordinate[1];
        var seconds = coordinate[2];

        var formatted = degrees + '° ' + minutes + '\' ' + seconds + '\" ' + direction;

        return formatted;
    }

    // 格式化日期
    function formatDate(dateString) {
        var date = new Date(dateString);
        var formatted = date.getFullYear() + '-' + padZero(date.getMonth() + 1) + '-' + padZero(date.getDate());
        return formatted;
    }

    // 补零函数
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }
});
