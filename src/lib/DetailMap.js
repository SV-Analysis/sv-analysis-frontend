import L from 'leafLet'

let DetailMap = function(el, cityInfo){
  this.$el = el;
  this.cityInfo = cityInfo;
  this.kvPolylines = {};
  this.keyPoints = {};
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
    layers: [this.grayscaleDark, this.cities],
    zoomControl: false,
    maxZoom: 18
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

DetailMap.prototype.setColorStyle = function(colorStyle){
  this.colorStyle = colorStyle;
  console.log('color style', colorStyle);
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
    this.currentLayer = this.baseLayers[layerName];
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

DetailMap.prototype.getBoundsRegion = function(){
  let bound = this.map.getBounds();
  return bound;
};

DetailMap.prototype.worldToContaierPointsArr = function(arr){
  let outArr = [];
  let time = new Date();
  for(var i = 0, ilen = arr.length; i < ilen; i++){
    let newPoint = L.latLng(arr[i][0],arr[i][1]);
    outArr.push({pos: this.map.latLngToContainerPoint(newPoint), 'type': arr[i][2]});
  }
  console.log('time', new Date() - time);
  return outArr
};

DetailMap.prototype.worldToContaierPointsObj = function(data){
  let arr = data.records;
  let outArr = [];
  let time = new Date();
  for(var i = 0, ilen = arr.length; i < ilen; i++){
    let location = arr[i]['location']
    // Location[longtitude, latitude]
    let newPoint = L.latLng(location[1], location[0]);
    outArr.push({
      'pos': this.map.latLngToContainerPoint(newPoint),
      'rawdata': arr[i],
      'type': arr[i]['max_attr']['attr']});
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

DetailMap.prototype.addCanvasLayer = function(callback){
  callback(this.map);
};

DetailMap.prototype.getMapInstance = function(){
  return this.map;
};

DetailMap.prototype.getZoomLevel = function(){
  return this.map.getZoom();
};



DetailMap.prototype.drawPolygon = function(streetInfo){
  // Hack: the parameter should be points list
  let node_list = streetInfo['node_list'];
  let pointList = [];
  for(var i = 0; i < node_list.length; i ++){
    let node = node_list[i]['location'];
    pointList.push(new L.LatLng(node[1], node[0]))
  }

  var firstpolyline = new L.Polyline(pointList, {
    color: 'red',
    weight: 2,
    opacity: 0.5,
    smoothFactor: 1
  });

  // this.addPolyline(firstpolyline);
  // this.polylines.push({
  //   streetInfo.id: firstpolyline
  // });
  this.kvPolylines[streetInfo['id']] = firstpolyline;
  firstpolyline.addTo(this.map);
  return streetInfo;
};

DetailMap.prototype.deletePolyline = function(streetInfo){
  // Hack: the parameter should be points list
  let polylineId = streetInfo['id'];
  // for(var i = 0; i < this.polylines.length; i++){
  //   if(polylineObj == this.polylines[i]){
  //     this.polylines.splice(i,1);
  //     this.map.removeLayer(polylineObj);
  //     return;
  //   }
  // }
  if(this.kvPolylines[polylineId] != undefined){
    this.map.removeLayer(this.kvPolylines[polylineId]);
  }
};

DetailMap.prototype.getColor = function(type){
  if(this.colorStyle == undefined){
    if(type == 'green') return '#2ca02c';
    else if(type == 'sky') return '#17becf';
    else if(type == 'road') return '#8c564b';
    else if(type == 'building') return '#ff7f0e';
  }else{
    if(this.colorStyle[type] == undefined){
      console.log('Error in color style');
    }
    return this.colorStyle[type];
  }
}
DetailMap.prototype.drawPointsToMap = function(streetInfo){
  // Hack: the parameter should be points list
  let _this = this;
  let pointsId = streetInfo['id'];
  let img_list = streetInfo['image_list'];
  let render_img_list = [];
  for(var i = 0, ilen = img_list.length; i < ilen; i++){
    render_img_list.push({
      "type": "Feature",
      "properties": {
        "maxAttr": img_list[i]['max_attr']['attr']
      },
      "geometry": {
        "type": "Point",
        "coordinates": img_list[i]['location']
      }
    })
  }
  let points_layer = L.geoJSON(render_img_list, {
    pointToLayer: function (feature, latlng) {
      let maxAttr = feature['properties'].maxAttr;
      let _color = _this.getColor(maxAttr)
      return L.circleMarker(latlng, {
        radius: 1,
        fillColor: _color,
        color: _color,
        // weight: 1,
        opacity: 0.8,
        fillOpacity: 0.3
      });
    }
  });
  points_layer.addTo(this.map)
  if(this.keyPoints[pointsId] == undefined){
    this.keyPoints[pointsId] = points_layer;
  }else{
    console.log('Points exited!')
  }
  return streetInfo;
};

DetailMap.prototype.deletePoints = function(streetInfo) {
  let pointsId = streetInfo['id'];
  if(this.keyPoints[pointsId] != undefined){
    this.map.removeLayer(this.keyPoints[pointsId]);
  }
};

DetailMap.prototype.fitBoundByStreet = function(streetInfo){
  let node_list = streetInfo['node_list'];
  let max_lat = -180;
  let max_lon = -180;
  let min_lat = 180;
  let min_lon = 180;
  for(var i = 0; i < node_list.length; i ++){
    let node = node_list[i]['location'];
    // pointList.push(new L.LatLng(node[1], node[0]))
    max_lat = max_lat < node[0]?node[0]: max_lat;
    max_lon = max_lon < node[1]?node[1]: max_lon;
    min_lat = min_lat > node[0]?node[0]: min_lat;
    min_lon = min_lon > node[1]?node[1]: min_lon;
  }

  min_lat -= 0.01;
  min_lon -= 0.01;
  max_lat += 0.01;
  min_lon += 0.01;

  this.map.fitBounds([[min_lon , min_lat ],[max_lon , max_lat]]);
};

DetailMap.prototype.addMapScale = function(){
  L.control.scale().addTo(this.map)
}

export default DetailMap

