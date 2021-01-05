import * as THREE from 'https://unpkg.com/three/build/three.module.js';
const globe_geometry = new THREE.Geometry(); // Hold points makin up the earth
const point_geom = new THREE.SphereGeometry(0.5, 1,  1);
const point_texture = new THREE.MeshBasicMaterial({color: "#fff"})
const globe_radius = 100;
const array_width = 4098;
const array_height = 1968;


function init_scene(){
    const globe_container = document.getElementById("Globe");
    const canvas = globe_container.getElementsByTagName("canvas")[0];
    // Grab width of container
    const width = globe_container.getBoundingClientRect().width;
    const height = globe_container.getBoundingClientRect().height;
    // Create scene, camera and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000 );
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(width, height);
};

// Helper function to convert a cartesian (x,y) point to geographic coordinates (long,lat)
function xy_to_geo(x, y){
  var latitude = (Math.PI / 180) * (-180 * ((x - array_width/2) / (array_width/2))); // latitude, multiply by -180 to flip, then convert to rad
  var longitude = (Math.PI / 180) (-90 * ((y - array_height/2) / array_height/2)); // longitude, multiply by -90 to flip, then convert to rad
  return {latitude, longitude};
}

function geo_to_cart(x, y){
  var { latitude, longitude } = xy_to_geo(x, y);
  var x = globe_radius * Math.cos(latitude) * Math.cos(longitude);
  var y = globe_radius * Math.cos(latitude) * Math.sin(longitude);
  var z = globe_radius * Math.sin(latitude);
  return {x, y, z};
}

// Function to read points from json
function read_world_points(){
  // Points are stored as 2d coordinates in globe_points.js, will use 
    let points = fetch('./globe_points.json').then(res => res.json()).then(json_data =>{
     return json_data.points;
    });
    return points;
  }


function init_points(){

}

$(document).ready(function(){
  init_scene();
  var points = read_world_points();
  console.log(points);
});