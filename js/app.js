new Vue({
  el: '#app',
  data() {
    return {
      photos: []
    };
  },
  mounted() {
    this.fetchPhotos();
  },
  methods: {
    fetchPhotos() {
      const url = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';
      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.photos = data.map(item => {
            const photo = {
              id: item.sha,
              url: item.download_url,
              title: item.name,
              exif: {}
            };
            // 使用exif.js获取照片的exif信息，并保存到photo对象中的exif属性中
            EXIF.getData(item, function() {
              photo.exif = {
                datetime: EXIF.getTag(this, 'DateTimeOriginal'),
                longitude: EXIF.getTag(this, 'GPSLongitude'),
                latitude: EXIF.getTag(this, 'GPSLatitude'),
                exposureTime: EXIF.getTag(this, 'ExposureTime'),
                aperture: EXIF.getTag(this, 'FNumber'),
                iso: EXIF.getTag(this, 'ISOSpeedRatings'),
                camera: EXIF.getTag(this, 'Model')
              };
            });
            return photo;
          });
        })
        .catch(error => {
          console.error('Error fetching photos:', error);
        });
    }
  }
});
