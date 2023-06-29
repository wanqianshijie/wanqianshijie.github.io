window.onload = function() {
    fetch('https://api.github.com/repos/wanqianshijie/photos/contents/img')
        .then(response => response.json())
        .then(data => {
            let gallery = document.querySelector('.gallery');
            let row = document.createElement('div');
            row.className = 'row';

            for (let i = 0; i < data.length; i++) {
                let photoUrl = data[i].download_url;
                let photoElement = createPhotoElement(photoUrl);
                row.appendChild(photoElement);

                if ((i + 1) % 3 === 0) {
                    gallery.appendChild(row);
                    row = document.createElement('div');
                    row.className = 'row';
                }
            }

            if (row.hasChildNodes()) {
                gallery.appendChild(row);
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
                GPSLatitude: getFormattedCoordinates(EXIF.getTag(this, 'GPSLatitude')),
                GPSLongitude: getFormattedCoordinates(EXIF.getTag(this, 'GPSLongitude')),
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

function getFormattedCoordinates(coordinates) {
    if (coordinates && coordinates.length === 3) {
        let degrees = coordinates[0].numerator;
        let minutes = coordinates[1].numerator;
        let seconds = coordinates[2].numerator / coordinates[2].denominator;

        let direction = coordinates[0].denominator === 1 ? coordinates[0].value : '';
        let formattedCoordinates = degrees + '° ' + minutes + '\' ' + seconds + '" ' + direction;
        return formattedCoordinates;
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
