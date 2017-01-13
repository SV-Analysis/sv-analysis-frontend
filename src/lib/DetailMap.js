import L from 'leafLet'

let DetailMap = function(el, cityInfo){
  this.$el = el;
  this.cityInfo = cityInfo
};

DetailMap.prototype.init = function(){
  var cities = new L.LayerGroup();

  var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

  let grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: null});
  let streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: null});

  this.map = L.map(this.$el, {
    center: this.cityInfo.gps,
    zoom: 10.5,
    layers: [grayscale, cities],
    zoomControl: false
  });

  var baseLayers = {
    "Grayscale": grayscale,
    "Streets": streets
  };

  var overlays = {
    "Cities": cities
  };

  if(this.cityInfo.bound) this.map.fitBounds(this.cityInfo.bound);
  L.control.layers(baseLayers, overlays).addTo(this.map);

};

DetailMap.prototype.fitBounds = function(bound){
  this.map.fitBounds(bound);
};


DetailMap.prototype.onEvent = function(eventName, handler){
  this.map.on(eventName, function(){
    handler(eventName);
  });
};
DetailMap.prototype.distableAllInteraction = function(){
  this.map.dragging.disable();
  this.map.touchZoom.disable();
  this.map.doubleClickZoom.disable();
  this.map.scrollWheelZoom.disable();
};

DetailMap.prototype.getBounds = function(){
  let bound = this.map.getBounds();
  // console.log('lsss', this.map.latLngToContainerPoint(bound._southWest), this.map.latLngToContainerPoint(bound._northEast));
  // console.log('bound', bound);
  return bound;
};

DetailMap.prototype.worldToContaierPoints = function(arr){
  let outArr = [];
  let time = new Date();
  for(var i = 0, ilen = arr.length; i < ilen; i++){
    let newPoint = L.latLng(arr[i][0],arr[i][1]);
    outArr.push({pos: this.map.latLngToContainerPoint(newPoint), 'type': arr[i][2]});
  }
  console.log('time', new Date() - time);
  return outArr
};

export default DetailMap

