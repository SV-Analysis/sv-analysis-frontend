import L from "leafLet";
import * as Config from '../Config'

let DetailMap = function(el, cityInfo){
  this.$el = el;
  this.cityInfo = cityInfo;
  this.kvPolylines = {};
  this.kvPolygons = {};
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
  this.outdoor  = L.tileLayer(mbUrl, {id: 'mapbox.outdoors',   attribution: null});
  this.satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: null});

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
    "Streets": this.streets,
    "Outdoor": this.outdoor,
    "satellite": this.satellite
  };

  this.currentLayer = this.grayscaleLight;
  // this.overlays = {
  //   "Cities": this.cities
  // };

  if(this.cityInfo.bound) this.map.fitBounds(this.cityInfo.bound);


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
function isMarkerInsidePolygon(marker, poly) {
  var polyPoints = poly.getLatLngs();
  var x = marker.lat, y = marker.lng;

  var inside = false;
  for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
    var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
    var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};
function inside(point, vs) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};


DetailMap.prototype.worldToContaierPointsArr = function(arr, boundaryDict){
  let allBoundaries = [];
  let newArr = undefined;
  if(boundaryDict != undefined){
    newArr = [];
    for(let attr in boundaryDict){
      boundaryDict[attr].forEach(function(b){
        let _b = [];
        b.forEach(function(point){
          _b.push([point[1], point[0]])
        })
        allBoundaries.push(_b)
      })
    }
    arr.forEach(function(d){
      for(var i = 0, ilen = allBoundaries.length; i < ilen; i++) {
        let boundary = allBoundaries[i];
        // let conainSign = isMarkerInsidePolygon(L.latLng(d[0], d[1]), boundary)
        let conainSign = inside(d, boundary);
        if (conainSign) {
          newArr.push(d)
          break;
        }
      }
    })
  }
  if(newArr != undefined) arr = newArr;
  let outArr = [];
  let time = new Date();
  for(var i = 0, ilen = arr.length; i < ilen; i++){
    let newPoint = L.latLng(arr[i][0],arr[i][1]);
    outArr.push({pos: this.map.latLngToContainerPoint(newPoint), 'type': arr[i][2]});
  }
  console.log('time', new Date() - time);
  return outArr
};

DetailMap.prototype.worldToContaierPointsObj = function(data, boundaryDict){
  let arr = data.records;

  let allBoundaries = [];
  let newArr = undefined;
  if(boundaryDict != undefined){
    newArr = [];
    for(let attr in boundaryDict){
      boundaryDict[attr].forEach(function(b){
        let _b = [];
        b.forEach(function(point){
          _b.push([point[1], point[0]])
        })
        allBoundaries.push(_b)
      })
    }
    arr.forEach(function(d){
      for(var i = 0, ilen = allBoundaries.length; i < ilen; i++) {
        let boundary = allBoundaries[i];
        let newPosition = [d['location'][1], d['location'][0]]
        // let conainSign = isMarkerInsidePolygon(L.latLng(d[0], d[1]), boundary)
        let conainSign = inside(newPosition, boundary);
        if (conainSign) {
          newArr.push(d)
          break;
        }
      }
    })
  }
  if(newArr != undefined) arr = newArr;



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
  console.log('here');
  if(streetInfo['node_list'] == undefined) return
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

DetailMap.prototype.fitBoundByRegion = function(regionInfo){
  console.log('region', regionInfo);
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
DetailMap.prototype.drawMultiplePolylines = function(polylinePoints, lineId, polygonSign){
  let allPolyLines = [];
  let allPolygons = [];
  for(var i = 0, ilen = polylinePoints.length; i < ilen; i++){
    allPolyLines.push({
      "type": "LineString",
      "coordinates": polylinePoints[i]
    });
    if(polygonSign == true){
      allPolygons.push({
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [polylinePoints[i]]
        }
      })}
  }
  var myStyle = {
    "color": "#ffffff",
    "weight": 1,
    "opacity": 0.8,
    "fill": null
  };
  let geoJsonObj = L.geoJSON(allPolyLines, {
    style: myStyle
  });

  this.kvPolylines[lineId] = geoJsonObj;
  geoJsonObj.addTo(this.map);

  if(polygonSign){
    let polygonObj = L.geoJSON(allPolygons, {
      style: myStyle
    });
    polygonObj.addTo(this.map);
    this.kvPolygons[lineId] = polygonObj;
  }
};

DetailMap.prototype.deletePolyline = function(id){
  // Hack: the parameter should be points list
  if(this.kvPolylines[id] != undefined){
    this.map.removeLayer(this.kvPolylines[id]);
  }
  if(this.kvPolygons[id] != undefined){
    this.map.removeLayer(this.kvPolygons[id]);
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
      },
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
        opacity: 0.3,
        fillOpacity: 0.1
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

DetailMap.prototype.generateImgObjWithScreenPosition = function(){
  let mewImages = [];
  let _this = this;
  this.aggregatedImages.forEach(function(d){
    let location = [d['location'][1],d['location'][0]]

    d['screenLoc'] = _this.map.latLngToContainerPoint(location)
    mewImages.push(d);

  });

  return mewImages;

};

export default DetailMap

