/**
 * Created by yiding on 2017/1/12.
 */
import THREE from "Three.js"

let PointCloud = function(el, platform){
  this.$el = el;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;
  this.disablePoint = false;
  this.platform = platform;
};

PointCloud.prototype.setColorStyle = function(colorStyle){
  this.colorStyle = colorStyle;
};

PointCloud.prototype.init = function(){
  this.container = document.createElement( 'div' );

  this.$el.appendChild(this.container);
  // this.camera = new THREE.PerspectiveCamera(75,this.width/this.height, -1, 1);
  this.camera = new THREE.OrthographicCamera(-this.width/2, this.width/2, this.height/2, -this.height/2, -100000, 100000);
  this.camera.position.set(0,0,2000);
  this.camera.lookAt(0,0,0);
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );
  // let data = generateWorldData();
  // this.setData(data);
  this.initRender();

};
function generateData(){
  let arr = [];
  for (let i = 0; i < 150000; i ++ ) {
    arr.push({
      x: Math.random() * 3000 - 1500,
      y: Math.random() * 3000 - 1500,
    })
  }
  return arr;
}
function generateWorldData(width, total){
  this.width = width;
  this.height = 400;
  let arr = [];
  for (let i = 0; i < total; i ++ ) {
    arr.push({
      x: Math.random() * this.width,
      y: Math.random() * this.height

    })
  }
  return arr;
}

function generateAnotherWorldData(width, total){
  this.width = width;
  this.height = 500;
  let arr = [];
  for (let i = 0; i < total; i ++ ) {
    arr.push({
      x: Math.random() * this.width - this.width / 2,
      y: Math.random() * this.height - this.height / 2

    })
  }
  return arr;
}

PointCloud.prototype.setData = function(arr, level){

  var _this = this;
  _this.scene.children.forEach(function(object){
    _this.scene.remove(object);
  });
  let point_size = this.platform == 'MacIntel' ? 10: 1;

  if(!arr || arr.length == 0) return;
  if(level > 12){
    point_size = point_size + 40 / Math.abs(level - 19) * Math.abs(12 - level)
  }
  // point_size = 10
  var geometry = new THREE.Geometry();
  var colors = [];
  for (let i = 0; i < arr.length; i ++ ) {
    var item = arr[i].pos;
    var type = arr[i].type;
    var vertex = new THREE.Vector3(item['x'], item['y'], 0);
    var world_vertex = this.screenToWorldOrth(vertex);
    colors.push(new THREE.Color(this.getColor(type)));
    geometry.vertices.push(world_vertex);
  }
  geometry.colors = colors;

  this.materials = new THREE.PointsMaterial( {
    size: point_size,
    transparent: true,
    opacity: 0.7,
    vertexColors: THREE.VertexColors
  } );

  let particles = new THREE.Points( geometry, this.materials );
  this.scene.add( particles );

};
//Hack TT
PointCloud.prototype.getColor = function(type){
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
PointCloud.prototype.clearAll = function(){
  let _this = this;
  _this.scene.children.forEach(function(object){
    _this.scene.remove(object);
  });
};

PointCloud.prototype.initRender = function(){
  this.renderer = new THREE.WebGLRenderer({ alpha: true });
  this.renderer.setPixelRatio( window.devicePixelRatio );
  this.renderer.setSize( this.$el.clientWidth, this.$el.clientHeight);
  this.container.appendChild( this.renderer.domElement );
};

PointCloud.prototype.animate = function(){
  let _this = this;
  function animate(){
    requestAnimationFrame( animate );
    _this.render();
  }
  animate();
};

PointCloud.prototype.render = function() {
  if(!this.materials) return
  this.renderer.render( this.scene, this.camera );
};

PointCloud.prototype.updatePointCloud = function(data, level) {
  //如何在animate 的同时添加数据， 我觉得可以尝试使用正交摄像头来做，省了一步映射的过程
  this.setData(data, level);
};

PointCloud.prototype.screenToWorld = function(position){
  var vector = new THREE.Vector3();
  vector.set( ( position.x / this.width ) * 2 - 1, - ( position.y / this.height ) * 2 + 1, 0.5 );
  vector.unproject( this.camera );
  var dir = vector.sub( this.camera.position ).normalize();
  var distance = - this.camera.position.z / dir.z;
  var pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );
  return pos;
};

PointCloud.prototype.screenToWorldOrth = function(position){
  return new THREE.Vector3(position.x - this.width / 2, -position.y + this.height / 2, 0)
};

PointCloud.prototype.worldToScreen = function(position){
  var pos = position.clone();
  pos.project(this.camera);
  pos.x = ( pos.x + 1 ) * this.width / 2;
  pos.y = ( - pos.y + 1) * this.height / 2;
  var particlePos = pos;
  particlePos.value = position.value;
  return particlePos;
};

PointCloud.prototype.switchCoordinate = function(position){
  var x = position.x, y = position.y;

  var pos = new THREE.Vector3(0, 0, 0);
  var pMouse = new THREE.Vector3(
    (x / this.width) * 2 - 1,
    -(y / this.height) * 2 + 1,
    1
  );
  //
  pMouse.project(this.camera)

  var cam = this.camera.position;
  var m = pMouse.y / ( pMouse.y - cam.y );

  pos.x = pMouse.x + ( cam.x - pMouse.x ) * m;
  pos.z = pMouse.z + ( cam.z - pMouse.z ) * m;

  return pos;
};

PointCloud.prototype.getCanvas = function(){
  return this.renderer.domElement;
};

PointCloud.prototype.setCanvasToMap = function(callback){
  callback(this.renderer.domElement);
};

PointCloud.prototype.disablePointCloud = function(callback){

};
export default PointCloud
