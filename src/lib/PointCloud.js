/**
 * Created by yiding on 2017/1/12.
 */
import THREE from "Three.js"

let PointCloud = function(el){
  this.$el = el;
};

PointCloud.prototype.init = function(){
  this.container = document.createElement( 'div' );

  this.$el.appendChild(this.container);
  this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  this.camera.position.z = 1000;
  this.camera.position.x = 0;
  this.camera.position.y = 0;

  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

  this.geometry = new THREE.Geometry();

  for (let i = 0; i < 160000; i ++ ) {
    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 1000 - 500;
    vertex.y = Math.random() * 1000 - 500;
    vertex.z = 0;

    this.geometry.vertices.push( vertex );
  }
  this.parameters = [
    [ [1, 1, 0.5], 5 ],
    [ [0.95, 1, 0.5], 4 ],
    [ [0.90, 1, 0.5], 3 ],
    [ [0.85, 1, 0.5], 2 ],
    [ [0.80, 1, 0.5], 1 ]];

  this.materials = [];

  for (let i = 0; i < this.parameters.length; i ++ ) {
    let color = this.parameters[i][0];
    let size  = this.parameters[i][1];

    this.materials[i] = new THREE.PointsMaterial( { size: 3, opacity: 0.3 } );

    let particles = new THREE.Points( this.geometry, this.materials[i] );
    this.scene.add( particles );
  }

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
  var time = Date.now() * 0.00005;
  for ( var i = 0; i < this.materials.length; i ++ ) {
    var color = this.parameters[i][0];
    var h = ( 360 * ( color[0] + time ) % 360 ) / 360;
    this.materials[i].color.setHSL( h, color[1], color[2] );
  }
  this.renderer.render( this.scene, this.camera );
};

export default PointCloud
