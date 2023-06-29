new Vue({
  el: '#app',
  data: {
    photos: []
  },
  mounted() {
    this.fetchPhotos();
  },
  methods: {
    fetchPhotos() {
      const apiUrl = 'https://api.github.com/repos/lairdmax/lairdmax.github.io/contents/images';
      // 使用实际的GitHub用户名和存储照片的仓库替换上述的"username/repo"
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          this.photos = data.map(photo => ({
            id: photo.name,
            url: photo.download_url,
            name: photo.name,
            showExif: false,
            exif: {}
          }));
        });
    },
    showExif(photo) {
      photo.showExif = !photo.showExif;
      if (photo.showExif && Object.keys(photo.exif).length === 0) {
        this.fetchExif(photo);
      }
    },
    fetchExif(photo) {
      const imageUrl = photo.url;
      EXIF.getData(imageUrl, function() {
        const exifData = EXIF.getAllTags(this);
        photo.exif = {
          shootTime: exifData.DateTimeOriginal,
          device: exifData.Model,
          parameters: `Aperture: f/${exifData.FNumber}, Shutter Speed: ${exifData.ExposureTime}s, ISO: ${exifData.ISO}`
        };
      });
    }
  }
});
