import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js'

const globe_geometry = new THREE.Geometry(); // Hold points makin up the earth
const user_position_geometry = new THREE.Geometry(); // Hold pointer representing user position
const point_material = new THREE.PointsMaterial({color:0xffffff, size:0.7, opacity:1});
const user_point_material = new THREE.PointsMaterial({color:0x96234d, size:4, opacity:1});

const globe_radius = 100;
const array_width = 4098;
const array_height = 1968;
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

// Function to read points from json
function read_world_points(){
  // Points are stored as 2d coordinates in globe_points.js, will use 
    let points = fetch('./globe_points.json').then(res => res.json()).then(json_data =>{
      return (json_data.points);
    });
    return points;
  }

// Helper function to convert a cartesian (x,y) point to geographic coordinates (long,lat)
function xy_to_geo(x, y){
  var latitude = ((x - (array_width/2)) / (array_width/2))*-180; // latitude, multiply by -180 to flip
  var longitude = ((y - (array_height/2)) / (array_height/2)) * -90; // longitude, multiply by -90 to flip
  // convert to rad
  latitude *= (Math.PI / 180);
  longitude*=(Math.PI / 180);
  return {latitude, longitude};
}

function geo_to_cart(latitude, longitude){
  //var { latitude, longitude } = xy_to_geo(x, y);
  var x = Math.cos(latitude) * Math.cos(longitude) * globe_radius;
  var y = Math.sin(longitude) * globe_radius;
  var z = Math.sin(latitude) * Math.cos(longitude) * globe_radius;
  return {x, y, z};
}

function init_points(points){
  for (var point of points){
    const {latitude, longitude} = xy_to_geo(point.x, point.y)
    const {x, y, z} = geo_to_cart(latitude, longitude); // Get the 3d coordinate after projection
    // If succesful add to geometry
    if (x && y && z){
      globe_geometry.vertices.push(new THREE.Vector3(x, y, z));
    }
  }
  globe_geometry.verticesNeedUpdate = true;
  globe_geometry.elementsNeedUpdate = true;
  globe_geometry.computeVertexNormals();
  var mesh = new THREE.Points( globe_geometry, point_material);
  scene.add(mesh);
}

var render = function(){
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function plot_user_position(){
  // if user allows geolocation, set the long/lat of the user
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(draw_user_on_globe);
  }
}

function draw_user_on_globe(position){
  console.log(position)
  var latitude = (Math.PI / 180) * (-180 * position.coords.latitude);
  var longitude = -(Math.PI / 180) * (-90 * position.coords.longitude);
  var coord = geo_to_cart(latitude, longitude);
  user_position_geometry.vertices.push(new THREE.Vector3(coord.x, coord.y, coord.z));
  user_position_geometry.verticesNeedUpdate = true;
  user_position_geometry.elementsNeedUpdate = true;
  user_position_geometry.computeVertexNormals();
  var mesh = new THREE.Points( user_position_geometry, user_point_material);
  scene.add(mesh);
}


$(document).ready(function(){
  init_scene();
  var points = read_world_points();
  points.then(function (result){init_points(result)});
  plot_user_position(); // will not do anything if user coords not found
  render();
});