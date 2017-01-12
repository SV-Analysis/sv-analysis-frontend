/**
 * Created by yiding on 2017/1/12.
 */

import L from 'leafLet'

let SimpleMap = function(el, cityInfo){
  this.$el = el;
  this.cityInfo = cityInfo
};

SimpleMap.prototype.init = function(){
  var cities = new L.LayerGroup();
  var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

  let grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: null});
  let streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: null});

  this.map = L.map(this.$el, {
    center: this.cityInfo.gps,
    zoom: 9,
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

  L.control.layers(baseLayers, overlays).addTo(this.map);

};

SimpleMap.prototype.on = function(eventName, handler){
  this.map.on(eventName, handler(event))
};


export default DetailMap

