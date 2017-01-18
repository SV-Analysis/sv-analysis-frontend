import L from 'leafLet'

let DetailMap = function(el, cityInfo){
  this.$el = el;
  this.cityInfo = cityInfo
};

DetailMap.prototype.init = function(){
  this.cities = new L.LayerGroup();

  var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

  this.grayscaleDark   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: null});
  this.grayscaleLight   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: null});
  this.streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: null});

  this.map = L.map(this.$el, {
    center: this.cityInfo.gps,
    zoom: 9,
    layers: [this.grayscaleLight, this.cities],
    zoomControl: false
  });

  this.baseLayers = {
    "GrayScaleLight": this.grayscaleLight,
    "GrayScaleDark": this.grayscaleDark,
    "Streets": this.streets
  };

  this.currentLayer = this.grayscaleLight;
  // this.overlays = {
  //   "Cities": this.cities
  // };

  if(this.cityInfo.bound) this.map.fitBounds(this.cityInfo.bound);
};

DetailMap.prototype.enableControlLayer = function(){
  L.control.layers(this.baseLayers).addTo(this.map);
};

DetailMap.prototype.onBaseLayerChange = function(callback){
  this.map.on('baselayerchange', function(event){
    callback(event);
  });
};

DetailMap.prototype.updateLayer = function(layerName){
  if( this.baseLayers[layerName]!= undefined ){
    this.map.removeLayer(this.currentLayer);
    this.currentLayer = this.baseLayers[layerName]
    this.map.addLayer(this.currentLayer);
  }
  else{
    console.log('Error layer', layerName);
  }
};


DetailMap.prototype.fitBounds = function(bound){
  this.map.fitBounds(bound);
};


DetailMap.prototype.onEvent = function(eventName, handler){
  this.map.on(eventName, function(){
    handler(eventName);
  });
};

DetailMap.prototype.disableAllInteraction = function(){
  this.map.dragging.disable();
  this.map.touchZoom.disable();
  this.map.doubleClickZoom.disable();
  this.map.scrollWheelZoom.disable();
};

DetailMap.prototype.getBounds = function(){
  let bound = this.map.getBounds();
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

DetailMap.prototype.contaierPointsToWorld = function(arr){
  let outArr = [];
  let time = new Date();
  for(var i = 0, ilen = arr.length; i < ilen; i++){
    let newPoint = L.point(arr[i][0],arr[i][1]);
    outArr.push(this.map.containerPointToLatLng(newPoint));
  }
  console.log('time', new Date() - time);
  return outArr
};

export default DetailMap

