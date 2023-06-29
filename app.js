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
      const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';
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
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        EXIF.getData(img, function() {
          const exifData = EXIF.getAllTags(this);
          photo.exif = {
            shootTime: exifData.DateTimeOriginal,
            device: exifData.Model,
            parameters: `Aperture: f/${exifData.FNumber}, Shutter Speed: ${exifData.ExposureTime}s, ISO: ${exifData.ISO}`
          };
        });
      };
    }
  }
});
