(function(){
  var _ = self.ClearCover = function(){
    this.map = L.Map();
    this.overlayImageUrl = '/img/blank.gif';

    this.coverImageOverlay = function (){
      return L.imageOverlay(this.overlayImageUrl, this.map.getBounds(), {opacity:0});
    };

    this.updateImageOverlay = function () {
      this.map.removeLayer(this.overlayImage);
      this.ovelayImage = this.coverImageOverlay();
      this.overlayImage.addTo(this.map);
    };

  };

  _.prototype = {
    addTo: function(inMap){
      this.map = inMap;
      this.overlayImage = this.coverImageOverlay();
      this.overlayImage.addTo(this.map);
      this.map.on('move', this.updateImageOverlay, this);
    }
  };

})();