import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js'

const globe_geometry = new THREE.BufferGeometry(); // Hold points makin up the earth
const globe_radius = 100;
const array_width = 4098;
const array_height = 1968;
let user_coords;
let  globe_container, canvas, scene, camera, renderer;

function init_scene(){
    globe_container = document.getElementById("Globe");
    canvas = globe_container.getElementsByTagName("canvas")[0];
    // Grab width of container
    var width = globe_container.getBoundingClientRect().width;
    var height = globe_container.getBoundingClientRect().height;
    // Create scene, camera and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000 );
    renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(width, height);
    var controls = new OrbitControls( camera, canvas );
	  controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.autoRotate = true;
};


// Helper function to convert a cartesian (x,y) point to geographic coordinates (long,lat)
function xy_to_geo(x, y){

  var latitude = ((x - (array_width/2)) / (array_width/2))*-180; // latitude, multiply by -180 to flip
  var longitude = ((y - (array_height/2)) / (array_height/2)) * -90; // longitude, multiply by -90 to flip
  // convert to rad
  latitude *= (Math.PI / 180);
  longitude*=(Math.PI / 180);
  return {latitude, longitude};
}

function geo_to_cart(x, y){
  var { latitude, longitude } = xy_to_geo(x, y);
  var x = Math.cos(latitude) * Math.cos(longitude) * globe_radius;
  var y = Math.sin(longitude) * globe_radius;
  var z = Math.sin(latitude) * Math.cos(longitude) * globe_radius;
  return {x, y, z};
}

// Function to read points from json
function read_world_points(){
  // Points are stored as 2d coordinates in globe_points.js, will use 
    let points = fetch('./globe_points.json').then(res => res.json()).then(json_data =>{
      return (json_data.points);
    });
    return points;
  }


function init_points(points){
  var geometry_positions = [];  // has the form [x,y,z,x,y,z,x,y,z...] as defined at https://threejsfundamentals.org/threejs/lessons/threejs-custom-buffergeometry.html
  var colors = []; // has the form [r,g,b,r,g,b,r,g,b....] link above
  for (var point of points){
   const {x, y, z} = geo_to_cart(point.x, point.y); // Get the 3d coordinate after projection
   //const {x,y,z} = convertFlatCoordsToSphereCoords(point.x, point.y);
   if (x && y && z){
     // If point is good, add to geometry buffer
     geometry_positions.push(x);
     geometry_positions.push(y);
     geometry_positions.push(z);
     colors.push(255);
     colors.push(255);
     colors.push(255);
   }
  }
  // done setting points, add points and colors to buffergeometry
  globe_geometry.setAttribute('position', new THREE.Float32BufferAttribute(geometry_positions, 3));
  globe_geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  globe_geometry.computeBoundingSphere();
  var material = new THREE.PointsMaterial( {vertexColors: THREE.VertexColors, size: 0.7} );
  var mesh = new THREE.Points( globe_geometry, material );
  scene.add(mesh);
}

var render = function(){
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function get_location(){
  if (navigator.geolocation){
    var s = navigator.geolocation.getCurrentPosition(function (position){
      user_coords = position.coords;
    });
  }
}


$(document).ready(function(){
  init_scene();
  get_location();
  var points = read_world_points();
  points.then(function (result){init_points(result)});
  render();
});