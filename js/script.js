// 使用GitHub API获取照片列表
const githubUsername = 'wanqianshijie';
const repoName = 'photos';
const path = 'img';

fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${path}`)
    .then(response => response.json())
    .then(data => {
        // 遍历照片列表
        data.forEach(photo => {
            const imageUrl = photo.download_url;
            
            // 创建照片元素
            const photoElement = document.createElement('img');
            photoElement.src = imageUrl;
            photoElement.classList.add('photo');
            
            // 在照片下方创建exif信息元素
            const exifInfoElement = document.createElement('div');
            exifInfoElement.classList.add('exif-info');
            
            // 使用exif.js获取exif信息
            EXIF.getData(photoElement, function() {
                const exifData = EXIF.getAllTags(this);
                
                // 解析并显示exif信息
                const exifInfo = parseExifData(exifData);
                exifInfoElement.innerText = exifInfo;
            });
            
            // 将照片和exif信息添加到页面上
            const photoContainer = document.getElementById('photo-container');
            photoContainer.appendChild(photoElement);
            photoContainer.appendChild(exifInfoElement);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

// 解析exif信息
function parseExifData(exifData) {
    let exifInfo = '';
    
    if (exifData.DateTimeOriginal) {
        const date = new Date(exifData.DateTimeOriginal);
        const formattedDate = formatDate(date);
        exifInfo += `拍摄时间：${formattedDate}\n`;
    }
    
    if (exifData.GPSLatitude && exifData.GPSLongitude) {
        const latitude = parseCoordinate(exifData.GPSLatitude, exifData.GPSLatitudeRef);
        const longitude = parseCoordinate(exifData.GPSLongitude, exifData.GPSLongitudeRef);
        exifInfo += `经度坐标：${longitude}\n`;
        exifInfo += `纬度坐标：${latitude}\n`;
    }
    
    if (exifData.ExposureTime) {
        const exposureTime = parseFraction(exifData.ExposureTime);
        exifInfo += `曝光时间：${exposureTime}\n`;
    }
    
    if (exifData.FNumber) {
        exifInfo += `光圈大小：f/${exifData.FNumber}\n`;
    }
    
    if (exifData.ISO) {
        exifInfo += `ISO：${exifData.ISO}\n`;
    }
    
    if (exifData.Make && exifData.Model) {
        exifInfo += `设备信息：${exifData.Make} ${exifData.Model}\n`;
    }
    
    return exifInfo;
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 解析经度和纬度坐标
function parseCoordinate(coordinate, ref) {
    const degrees = coordinate[0];
    const minutes = coordinate[1];
    const seconds = coordinate[2];
    
    const decimal = degrees + (minutes / 60) + (seconds / 3600);
    const direction = ref === 'N' || ref === 'E' ? '' : '-';
    
    return `${direction}${decimal.toFixed(6)}`;
}

// 解析分数
function parseFraction(fraction) {
    const numerator = fraction.numerator;
    const denominator = fraction.denominator;
    
    if (denominator === 1) {
        return numerator;
    } else {
        return Math.round(numerator / denominator);
    }
}
