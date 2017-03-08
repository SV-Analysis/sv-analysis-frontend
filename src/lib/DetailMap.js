import L from "leafLet";
import * as Config from '../Config'

let DetailMap = function(el, cityInfo){
  this.$el = el;
  this.cityInfo = cityInfo;
  this.kvPolylines = {};
  this.keyPoints = {};
  this.serverLink = Config.serverLink;
};

DetailMap.prototype.init = function(){
  this.cities = new L.LayerGroup();

  var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoieWlkaW5neWlkaW4iLCJhIjoiY2lnajcwMjIxMDAyM3R0bHVsamh5M3B2diJ9.-ZvX8uRwCv4IdYSvzi7HPg';

  this.grayscaleDark   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: null});
  this.grayscaleLight   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: null});
  this.streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: null});

  this.map = L.map(this.$el, {
    center: this.cityInfo.gps,
    zoom: 9,
    layers: [this.grayscaleDark, this.cities],
    zoomControl: false,
    maxZoom: 18,
    rotate: true,
    touchRotate: true
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



  // var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
  //   imageBounds = [[40.712216, -74.22655], [40.873941, -74.12544]];
  // L.imageOverlay(imageUrl, imageBounds).addTo(this.map);
};

DetailMap.prototype.setColorStyle = function(colorStyle){
  this.colorStyle = colorStyle;
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

DetailMap.prototype.fitBoundByImgList = function(imgList){
  let node_list = imgList;
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

  min_lat -= 0.005;
  min_lon -= 0.005;
  max_lat += 0.005;
  min_lon += 0.005;

  this.map.fitBounds([[min_lon , min_lat ],[max_lon , max_lat]]);
};


DetailMap.prototype.addMapScale = function(){
  L.control.scale().addTo(this.map)
};

DetailMap.prototype.boundContainSinglePoint = function(point){
  var bounds = this.getBounds();
  return bounds.contains(point);
};
DetailMap.prototype.filterPointsArrInBounds = function(points){
  let bounds = this.getBounds();
  let newArrs = [];

  points.forEach(function(d){
    if(bounds.contains(d)){
      newArrs.push(d)
    }
  });
  return newArrs;
};

//Interaction among different views
DetailMap.prototype.drawMultiplePolylines = function(polylinePoints, lineId){
  let allPolyLines = [];
  for(var i = 0, ilen = polylinePoints.length; i < ilen; i++){
    allPolyLines.push({
      "type": "LineString",
      "coordinates": polylinePoints[i]
    })
  }
  var myStyle = {
    "color": "#ff7800",
    "weight": 1,
    "opacity": 0.65
  };
  let geoJsonObj = L.geoJSON(allPolyLines, {
    style: myStyle
  });
  this.kvPolylines[lineId] = geoJsonObj;
  geoJsonObj.addTo(this.map);
};

DetailMap.prototype.deletePolyline = function(id){
  // Hack: the parameter should be points list
  if(this.kvPolylines[id] != undefined){
    this.map.removeLayer(this.kvPolylines[id]);
  }
};

DetailMap.prototype.drawImagePoints = function(img_list, pointsId){
  let render_img_list = [];
  let _this = this;

  for(var i = 0, ilen = img_list.length; i < ilen; i++){
    render_img_list.push({
      "type": "Feature",
      "properties": {
        "maxAttr": img_list[i]['max_attr']['attr'],
        'img_id': img_list[i]['index'],
        'img_path': img_list[i]['img_path']
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
      let _color = _this.getColor(maxAttr);
      let circleMarder = L.circleMarker(latlng, {
        radius: 1,
        fillColor: _color,
        color: _color,
        opacity: 0.8,
        fillOpacity: 0.3
      });
      let imageId = feature['properties']['img_id'];
      let imgPath = feature['properties']['img_path'];
      let imgitems = imgPath.split('/');
      let cityname = imgitems[0];
      let cid = imgitems[2];
      let iid = imgitems[3];

      let imageLink = '<img src=' + _this.serverLink  + 'getImage?city=' + cityname +'&cid='+cid +'&iid=' + iid+ ' style="width:120px;">' ;
      circleMarder.bindPopup(imageLink);
      return circleMarder;
    }
  });
  points_layer.addTo(this.map)
  if(this.keyPoints[pointsId] == undefined){
    this.keyPoints[pointsId] = points_layer;
  }else{
    console.log('Points exited!')
  }
  L.popup();
  return img_list;
};

DetailMap.prototype.deletePoints = function(id) {
  if(this.keyPoints[id] != undefined){
    this.map.removeLayer(this.keyPoints[id]);
  }
};

DetailMap.prototype.calculateImgLocations = function(imgList){
  this.aggregatedImages = imgList;
  this.drawImagePoints(this.aggregatedImages, 'temp_id');
};
// DetailMap.prototype.calculateImgLocations = function(imgList){
//   let _this = this;
//   this.imgList = imgList;
//   let locationMap = {};
//
//   let aggregateImgList = [];
//
//   for(let i = 0, ilen = imgList.length; i < ilen; i++){
//     let imgObj = imgList[i];
//     let [x, y] = imgObj['location'];
//
//     if(locationMap[x] == undefined){
//       locationMap[x] = {};
//     }
//     if(locationMap[x][y] == undefined){
//       locationMap[x][y] = {
//         imgList:[],
//         location: [x,y],
//         attrObj:{}
//       };
//       aggregateImgList.push(locationMap[x][y])
//     }
//     locationMap[x][y]['imgList'].push(imgObj);
//   }
//   let features = this.colorStyle['allFeatures'];
//   aggregateImgList.forEach(function(agImg, i){
//     // Init attrs in the AggregateImgOb
//     features.forEach(function(attr){
//       agImg['attrObj'][attr] = 0;
//     });
//     //  Calculate Attr
//     agImg['imgList'].forEach(function(imgObj){
//       features.forEach(function(attr){
//         agImg['attrObj'][attr] += (imgObj[attr] / agImg['imgList'].length);
//       })
//     });
//     let largestValue = 0;
//     let largestAttr = null;
//     features.forEach(function(attr){
//       if(largestValue < agImg['attrObj'][attr]){
//         largestValue = agImg['attrObj'][attr]
//         largestAttr = attr;
//       }
//     });
//     agImg['max_attr'] = {
//       attr: largestAttr,
//       value: largestValue
//     }
//     agImg['img_path'] = agImg['imgList'][0]['img_path'];
//     agImg['id'] = 'aggregate_' + agImg['imgList'][0]['index'];
//
//
//     let imgPath = agImg['img_path']
//     let imgitems = imgPath.split('/');
//     let cityname = imgitems[0];
//     let cid = imgitems[2];
//     let iid = imgitems[3];
//
//     let imgLink = _this.serverLink  + 'getImage?city=' + cityname +'&cid='+cid +'&iid=' + iid;
//     agImg['formatImgPath'] = imgLink;
//     agImg['aggregateIndex'] = i;
//   });
//   this.drawImagePoints(aggregateImgList, 'temp_id');
//   for(var i = 1, ilen = aggregateImgList.length; i < ilen; i++){
//     let fpos = aggregateImgList[i - 1]['location'];
//     var firstLatlng = L.latLng(fpos[0], fpos[1]);
//     let spos = aggregateImgList[i]['location'];
//     var secondLatlng = L.latLng(spos[0], spos[1]);
//     let distance = firstLatlng.distanceTo(secondLatlng);
//   }
//   this.aggregatedImages = aggregateImgList;
//   // this.displayAllImages(aggregateImgList)
// };

//No using.
DetailMap.prototype.displayAllImages = function(imgList){

  for(let i = 0, ilen = imgList.length; i < ilen; i++){
    if(i % 20 != 0) continue
    console.log('here');
    let imgObj = imgList[i];
    let location = imgObj['location'];
    location[0] += 0.001;

    let imgPath = imgObj['img_path']
    let imgitems = imgPath.split('/');
    let cityname = imgitems[0];
    let cid = imgitems[2];
    let iid = imgitems[3];

    let imgLink = this.serverLink  + 'getImage?city=' + cityname +'&cid='+cid +'&iid=' + iid;

    let firstImgObj = imgList[0];
    let lastImgObj = imgList[imgList.length - 1];

    let streetVectorY = lastImgObj['location'][1] - firstImgObj['location'][1];
    let streetVectorX = lastImgObj['location'][0] - firstImgObj['location'][0];
    let renderRatio = - streetVectorY / streetVectorX;
    let distance = 0.1;
    let dy = distance * distance / (1 + renderRatio * renderRatio);
    let dx = dy / renderRatio;
    let newPosition = [location[0] + dx, location[1] + dy];
    let imageBounds = [[newPosition[1], newPosition[0]], [newPosition[1] + 0.003, newPosition[0]+ 0.004]];

    // imageBounds = [location, [40.773941, -74.12544]];

    L.imageOverlay(imgLink, imageBounds).addTo(this.map);
  }
};

DetailMap.prototype.sampleImagesInTheBound = function(){
  let _this = this;
  // return Images sampled in the bound, return the scale
  let bounds = this.getBounds();

  let imagesObj = {
    imgList: [], // Each img object with a position of screen x and y;
    mapScale: this.getZoomLevel(),
  };
  let newImages = [];
  this.aggregatedImages.forEach(function(d){
    let location = [d['location'][1],d['location'][0]]
    if(bounds.contains(location)){
      d['screenLocation'] = _this.map.latLngToContainerPoint(location)
      newImages.push(d);
    }
  });
  imagesObj['newImages'] = newImages;
  return newImages;
};








///// will not be used
// DetailMap.prototype.deletePolyline = function(streetInfo){
//   // Hack: the parameter should be points list
//   let polylineId = streetInfo['id'];
//   // for(var i = 0; i < this.polylines.length; i++){
//   //   if(polylineObj == this.polylines[i]){
//   //     this.polylines.splice(i,1);
//   //     this.map.removeLayer(polylineObj);
//   //     return;
//   //   }
//   // }
//   if(this.kvPolylines[polylineId] != undefined){
//     this.map.removeLayer(this.kvPolylines[polylineId]);
//   }
// };

// Old version
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
        "maxAttr": img_list[i]['max_attr']['attr'],
        'img_id': img_list[i]['index'],
        'img_path': img_list[i]['img_path']
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
      let _color = _this.getColor(maxAttr);
      let circleMarder = L.circleMarker(latlng, {
        radius: 1,
        fillColor: _color,
        color: _color,
        opacity: 0.8,
        fillOpacity: 0.3
      });
      let imageId = feature['properties']['img_id'];
      let imgPath = feature['properties']['img_path'];
      let imgitems = imgPath.split('/');
      let cityname = imgitems[0];
      let cid = imgitems[2];
      let iid = imgitems[3];

      let imageLink = '<img src=' + _this.serverLink  + 'getImage?city=' + cityname +'&cid='+cid +'&iid=' + iid+ ' style="width:120px;">' ;
      circleMarder.bindPopup(imageLink);
      return circleMarder;
    }
  });
  points_layer.addTo(this.map)
  if(this.keyPoints[pointsId] == undefined){
    this.keyPoints[pointsId] = points_layer;
  }else{
    console.log('Points exited!')
  }
  L.popup();
  return streetInfo;
};

// DetailMap.prototype.deletePoints = function(streetInfo) {
//   let pointsId = streetInfo['id'];
//   if(this.keyPoints[pointsId] != undefined){
//     this.map.removeLayer(this.keyPoints[pointsId]);
//   }
// };

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
export default DetailMap

