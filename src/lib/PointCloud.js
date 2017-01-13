/**
 * Created by yiding on 2017/1/12.
 */
import THREE from "Three.js"

let PointCloud = function(el){
  this.$el = el;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;

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
PointCloud.prototype.setData = function(arr){
  var _this = this;
  _this.scene.children.forEach(function(object){
    _this.scene.remove(object);
  });
  var geometry = new THREE.Geometry();

  for (let i = 0; i < arr.length; i ++ ) {
    var vertex = new THREE.Vector3(arr[i]['x'], arr[i]['y'], 0);
    var world_vertex = this.screenToWorldOrth(vertex);
    geometry.vertices.push(world_vertex);
  }
  this.parameters = [ [1, 1, 0.5], 5 ];

  this.materials = new THREE.PointsMaterial( { size: 3, opacity: 0.1 } );

  let particles = new THREE.Points( geometry, this.materials );
  this.scene.add( particles );

};

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
  var time = Date.now() * 0.00005;
  var color = this.parameters[0];
  var h = ( 360 * ( color[0] + time ) % 360 ) / 360;
  this.materials.color.setHSL( h, color[1], color[2] );
  this.renderer.render( this.scene, this.camera );
};

PointCloud.prototype.updatePointCloud = function(data) {
  //如何在animate 的同时添加数据， 我觉得可以尝试使用正交摄像头来做，省了一步映射的过程
  this.setData(data);
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
  // var pos = new THREE.Vector(position.x / this.width * 2 - 1,
  //   -1 * position.y / this.height * 2 + 1, 1);
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
}

export default PointCloud
