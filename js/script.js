window.addEventListener('DOMContentLoaded', function () {
    const photoContainer = document.getElementById('photoContainer');
    let photos = [];
    let currentIndex = 0;
    const photosPerLoad = 4;

    // 获取照片信息
    function getPhotos() {
        const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                photos = data;
                displayPhotos();
            })
            .catch(error => console.log(error));
    }

    // 显示照片
    function displayPhotos() {
        const endIndex = currentIndex + photosPerLoad;
        const photosToShow = photos.slice(currentIndex, endIndex);

        photosToShow.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            photoContainer.appendChild(photoCard);
        });

        currentIndex += photosPerLoad;

        if (currentIndex < photos.length) {
            showLoadMoreButton();
        }
    }

    // 创建照片卡片
    function createPhotoCard(photo) {
        const photoCard = document.createElement('div');
        photoCard.className = 'photoCard';

        const img = document.createElement('img');
        img.src = photo.download_url;
        photoCard.appendChild(img);

        const photoInfo = document.createElement('div');
        photoInfo.className = 'photoInfo';

        const exifData = getExifData(photo.exif_url);
        photoInfo.innerHTML = `
            <p><span>拍摄时间：</span>${formatDate(exifData.DateTimeOriginal)}</p>
            <p><span>经度坐标：</span>${optimizeCoordinate(exifData.GPSLongitude)}</p>
            <p><span>纬度坐标：</span>${optimizeCoordinate(exifData.GPSLatitude)}</p>
            <p><span>曝光时间：</span>${exifData.ExposureTime}</p>
            <p><span>光圈大小：</span>${exifData.FNumber}</p>
            <p><span>ISO：</span>${exifData.ISO}</p>
            <p><span>设备信息：</span>${exifData.Make} ${exifData.Model}</p>
        `;

        photoCard.appendChild(photoInfo);

        return photoCard;
    }

    // 获取照片的EXIF数据
    function getExifData(exifUrl) {
        const exifData = EXIF.getData(exifUrl);
        return exifData;
    }

    // 优化坐标显示
    function optimizeCoordinate(coordinate) {
        const degrees = coordinate[0];
        const minutes = coordinate[1];
        const seconds = coordinate[2];

        const optimizedCoordinate = degrees + '°' + minutes + "'" + seconds + '"';
        return optimizedCoordinate;
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        return formattedDate;
    }

    // 显示加载更多按钮
    function showLoadMoreButton() {
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'loadMoreBtn';
        loadMoreBtn.innerHTML = '<button onclick="loadMorePhotos()">加载更多</button>';
        photoContainer.appendChild(loadMoreBtn);
    }

    // 加载更多照片
    function loadMorePhotos() {
        const loadMoreBtn = document.querySelector('.loadMoreBtn');
        photoContainer.removeChild(loadMoreBtn);
        displayPhotos();
    }

    getPhotos();
});
