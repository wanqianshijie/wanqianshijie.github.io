new Vue({
  el: '#app',
  data: {
    photos: [],
  },
  created() {
    this.fetchPhotos();
  },
  methods: {
    fetchPhotos() {
      const apiUrl = 'https://api.github.com/repos/wanqianshijie/photos/contents/img';
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          this.photos = data.map(photo => {
            return {
              id: photo.name,
              title: photo.name,
              url: photo.download_url,
              exif: this.getExifInfo(photo.download_url),
            };
          });
        })
        .catch(error => {
          console.error('Error fetching photos:', error);
        });
    },
    getExifInfo(photoUrl) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = photoUrl;

        image.onload = function() {
          EXIF.getData(image, function() {
            const exifData = EXIF.getAllTags(this);
            resolve(exifData);
          });
        };

        image.onerror = function() {
          reject(new Error('Failed to load image'));
        };
      });
    },
  },
});
