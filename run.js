import * as THREE from 'three';

//map parameters
const mapBotLeft = new THREE.Vector2(-30, -30)
const mapTopRight =  new THREE.Vector2(30, 30)


function rand(){
    return Math.random();
}

function makeVec3FromVec2(vec2, depth){
  return new THREE.Vector3(vec2.x, vec2.y, depth)
}

/**
 * @param {THREE.Scene} scene
 */
function addLines(scene){

  const geometry = new THREE.BoxGeometry( mapTopRight.x - mapBotLeft.x, mapTopRight.y - mapBotLeft.y, -0.1 );
  const material = new THREE.MeshBasicMaterial( { color: ~scene.background.getHex()} );
  const line = new THREE.Mesh( geometry, material );
  ///scene.add( line );
  return line
}


const scene = new THREE.Scene();
scene.background = new THREE.Color().setHex(0x000000)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//load some beautiful textures
const texture = new THREE.TextureLoader().load( "textures/TheYous.jpg" );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0xffffff , map: texture} );
const cube = new THREE.Mesh( geometry, material );

const cubeBoundingBox = new THREE.Box3().setFromObject(cube);


scene.add( cube );

//add an arrow
const arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), 
new THREE.Vector3(0,0,0),
4,
new THREE.Color(0x00ff00))

scene.add(arrow)

//spawn a random point
const pointGeo = new THREE.CircleGeometry(0.25)
const pointMat = new THREE.MeshBasicMaterial({color: 0x00ffff});
const ballPoint = new THREE.Mesh(pointGeo, pointMat)

const pointBoundingBox = new THREE.Box3().setFromObject(ballPoint);

scene.add(ballPoint)

let camOffset = 7

camera.position.z = camOffset;




let speedX = Math.random();
let speedY = Math.random();

let speedYVal = Math.abs(speedY);
let speedXVal = Math.abs(speedX);

/**
 * @type {THREE.Mesh[]}
 */
let trailList = [];
const maxTrailSize = 50;

let isSpacePressed = false;
let scale = 1/100;

window.addEventListener('keydown', e => {if(e.key == ' '){isSpacePressed = true}});
window.addEventListener('keyup', e => {if(e.key == ' '){isSpacePressed = false}});
window.addEventListener('wheel', e => {camOffset+=e.deltaY*scale; camera.position.z = camOffset;console.log(e.deltaY)})



//add lines at borders
let line = addLines(scene)
scene.add(line)



function animate() {

  //if space is pressed do nothing
  if(isSpacePressed){
    return;
  }


  //cube.rotation.x += 0.01;
  //cube.rotation.y += 0.01;
  let cubeXPos = cube.position.x;
  let cubeYPos = cube.position.y;

  //save prev speeds
  let prevSpeedX = speedX;
  let prevSpeedY = speedY;

  if(cubeYPos + 0.5 > mapTopRight.y){

    speedY = -speedYVal;
  }
  //bottom collision
  if(cubeYPos - 0.5 < mapBotLeft.y){

    speedY = speedYVal;
  }

  if(cubeXPos + 0.5 > mapTopRight.x){

    speedX = -speedXVal;
  }

  if(cubeXPos - 0.5 < mapBotLeft.x){

    speedX = speedXVal;
  }

  //collision happened change color

  //what other effect can we add
  if(prevSpeedX != speedX || prevSpeedY != speedY){
    let randColorHex = rand() * 0xffffff
    cube.material.color.setHex(randColorHex)

    //console.log(speedY, speedX)
    //console.log(Math.atan2(speedY , speedX))
    //arrow.rotateZ(Math.atan2(speedY , speedX));
    arrow.rotation.z = Math.atan2(speedY , speedX) - Math.PI / 2

    arrow.setColor(randColorHex)
    
  }


  //add trail color
  const trailGeometry = new THREE.BoxGeometry( 1, 1, 1 );
  const trailMaterial = new THREE.MeshBasicMaterial( { color: cube.material.color.getHex()} );
  const trail = new THREE.Mesh( trailGeometry, trailMaterial );

  trail.position.copy(cube.position)

  trail.position.z = cube.position.z - 0.55
  scene.add(trail)

  trailList.push(trail);

  if(trailList.length > maxTrailSize){

    //remove from scene
    let removedTrail = trailList.shift()
    scene.remove(removedTrail)

    //free memory
    removedTrail.geometry.dispose()
    removedTrail.material.dispose()
  }




  cube.position.x += speedX;
  cube.position.y += speedY;

  //make cam follow cube
  camera.translateX(speedX)
  camera.translateY(speedY)

  //move bounding box to cube
  cubeBoundingBox.setFromObject(cube)

  //set arrow to follow
  arrow.position.x = cube.position.x
  arrow.position.y = cube.position.y

    //check for ball collision
  if (cubeBoundingBox.intersectsBox(pointBoundingBox)){

    let randPointX = rand() * (mapTopRight.x - mapBotLeft.x) + mapBotLeft.x
    let randPointY = rand() * (mapTopRight.y - mapBotLeft.y) + mapBotLeft.y
    ballPoint.position.copy(new THREE.Vector3(randPointX, randPointY, 0))
    pointBoundingBox.setFromObject(ballPoint)
    console.log("int")

    console.log((scene.background.getHex() + 0xff) % 0xffffff)

    let randColor = rand() * 0xffffff;
    //change background color
    scene.background.setHex( randColor )
    line.material.color.setHex(~randColor)
  }
  

  renderer.render( scene, camera );
  
}


renderer.setAnimationLoop( animate );