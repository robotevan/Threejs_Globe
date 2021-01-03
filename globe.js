import * as THREE from 'https://unpkg.com/three/build/three.module.js';

function init_scene(){
    const globe_container = document.getElementById("Globe");
    const canvas = globe_container.getElementsByTagName("canvas")[0];
    // Grab width of container
    const width = globe_container.getBoundingClientRect().width;
    const height = globe_container.getBoundingClientRect().height;
    // Create scene, camera and renderer
    const scene = new THREE.scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000 );
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.setSize(width, height);
};

// Function to read points from json
function read_world_points(){
// Points are stored as 2d coordinates in globe_points.js, will use 
  let points = fetch('./globe_points.json').then(res => res.json()).then(json_data =>{
   return json_data.points;
  });
  return points
}

// Function to convert a cartesian (x,y) point to world longitude latitude
// pretty much projecting 2d img onto surface of globe
function cart_to_longlat(x, y){
  
}

console.log(read_world_points());