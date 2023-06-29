window.onload = function() {
    fetch('https://api.github.com/repos/wanqianshijie/photos/contents/img')
        .then(response => response.json())
        .then(data => {
            let gallery = document.querySelector('.gallery');

            for (let i = 0; i < data.length; i++) {
                let photoUrl = data[i].download_url;
                let photoElement = createPhotoElement(photoUrl);
                gallery.appendChild(photoElement);
            }
        })
        .catch(error => {
            console.log('Error:', error);
        });
};

function createPhotoElement(photoUrl) {
    let photoElement = document.createElement('div');
    photoElement.className = 'photo';

    let imageElement = document.createElement('img');
    imageElement.src = photoUrl;
    photoElement.appendChild(imageElement);

    let infoElement = document.createElement('div');
    infoElement.className = 'info';
    photoElement.appendChild(infoElement);

    getImageInfo(photoUrl, infoElement);

    return photoElement;
}

function getImageInfo(photoUrl, infoElement) {
    let img = new Image();
    img.onload = function() {
        EXIF.getData(img, function() {
            let photoInfo = {
                DateTimeOriginal: EXIF.getTag(this, 'DateTimeOriginal'),
                GPSLatitude: getFormattedCoordinate(EXIF.getTag(this, 'GPSLatitude')),
                GPSLongitude: getFormattedCoordinate(EXIF.getTag(this, 'GPSLongitude')),
                ExposureTime: EXIF.getTag(this, 'ExposureTime'),
                FNumber: EXIF.getTag(this, 'FNumber'),
                ISOSpeedRatings: EXIF.getTag(this, 'ISOSpeedRatings'),
                Make: EXIF.getTag(this, 'Make'),
                Model: EXIF.getTag(this, 'Model')
            };

            displayImageInfo(photoInfo, infoElement);
        });
    };
    img.src = photoUrl;
}

function getFormattedCoordinate(coordinate) {
    if (coordinate && coordinate.length === 3) {
        let degrees = coordinate[0].numerator;
        let minutes = coordinate[1].numerator;
        let seconds = coordinate[2].numerator / coordinate[2].denominator;

        let direction = coordinate[0].denominator === 1 ? coordinate[0].value : '';
        let formattedCoordinate = degrees + '° ' + minutes + '\' ' + seconds + '" ' + direction;
        return formattedCoordinate;
    }

    return '';
}

function displayImageInfo(photoInfo, infoElement) {
    let html = '';
    if (photoInfo.DateTimeOriginal) {
        html += '<p>拍摄时间：' + photoInfo.DateTimeOriginal + '</p>';
    }
    if (photoInfo.GPSLatitude && photoInfo.GPSLongitude) {
        html += '<p>经度坐标：' + photoInfo.GPSLongitude + '</p>';
        html += '<p>纬度坐标：' + photoInfo.GPSLatitude + '</p>';
    }
    if (photoInfo.ExposureTime) {
        html += '<p>曝光时间：' + photoInfo.ExposureTime + '</p>';
    }
    if (photoInfo.FNumber) {
        html += '<p>光圈大小：' + photoInfo.FNumber + '</p>';
    }
    if (photoInfo.ISOSpeedRatings) {
        html += '<p>ISO：' + photoInfo.ISOSpeedRatings + '</p>';
    }
    if (photoInfo.Make && photoInfo.Model) {
        html += '<p>设备信息：' + photoInfo.Make + ' ' + photoInfo.Model + '</p>';
    }

    infoElement.innerHTML = html;
}
