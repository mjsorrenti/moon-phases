//Create variables representing properties for each of the heavenly bodies

var sun = {
    x: 0,   //Initializing this value is meaningless
    y: 0,   //Initializing this value is meaningless
    theta: 0,
    radius: 100,
    color: 'yellow',
    orbitSize: 0,
    orbitSpeed: 0,
    orbiting: false,
    shadow: false
};

var earth = {
    x: 0,   //Initializing this value is meaningless
    y: 0,   //Initializing this value is meaningless
    theta: 0,
    radius: 50,
    color: 'blue',
    orbitSize: 400,
    orbitSpeed: -1/200,
    orbiting: false,
    shadow: false
};

var moon = {
    x: 0,   //Initializing this value is meaningless
    y: 0,   //Initializing this value is meaningless
    theta: 2,
    radius: 16,
    color: 'gray',
    orbitSize: 100,
    orbitSpeed: -1/50,
    orbiting: false,
    shadow: false
};

var referencePoint = {
    x: 0,   //Initializing this value is meaningless
    y: 0,   //Initializing this value is meaningless
    theta: 2,
    radius: 3,
    color: 'red',
    orbitSize: earth.radius,
    orbitSpeed: -1/10,
    orbiting: false,
    shadow: false
};


//Listen for changes to the speed input controls
var inputFields = document.querySelectorAll('input');
for (i = 0; i < inputFields.length; i++) {
    inputFields[i].addEventListener('input', updateSpeed);
};

//Update the speed properties for the appropriate body with the latest input value
function updateSpeed() {
    if (this.value === '' || Number(this.value) === 0) {return}; //Change nothing if the input field is empty
    if (this.id === 'earthorbit') {earth.orbitSpeed = -1 / (Number(this.value))};
    if (this.id === 'moonorbit') {moon.orbitSpeed = -1 / (Number(this.value))};
    if (this.id === 'earthrotate') {referencePoint.orbitSpeed = -1 / (Number(this.value))};
};


//Set up properties for the 2D canvas

var canvas = document.getElementById('2dcanvas');
var ctx = canvas.getContext('2d');
ctx.translate(500, 500);    //Coordinate system is centered at the center of the canvas
ctx.globalCompositeOperation = 'destination-over';  //Draw new objects under existing objects



//Look for clicks on the canvas
canvas.addEventListener('click', checkClick);


//Draw each of the heavenly bodies in an animation loop

function animate () {
    ctx.clearRect(-500, -500, 1000, 1000)
    
    drawBody(sun, sun);
    drawSunRays();
    
    drawBody(moon, earth);
    
    drawBody(referencePoint, earth);
    
    drawBody(earth, sun);
    
    //Call the function to animate the 3D canvas as well
    animate3D();
        
    window.requestAnimationFrame(animate);
};

//Draw a circle on the canvas based on the properties of the heavenly body objects passed in
function drawBody(body, center) {
    //If the orbiting is turned on for the body, increment its theta
    if (body.orbiting) {body.theta += body.orbitSpeed};
    
    //Calculate the position of the body on the canvas
    var centerOffsetX = center.orbitSize * Math.cos(center.theta);
    var centerOffsetY = center.orbitSize * Math.sin(center.theta);
    var bodyOffsetX = body.orbitSize * Math.cos(body.theta);
    var bodyOffsetY = body.orbitSize * Math.sin(body.theta);
    body.x = centerOffsetX + bodyOffsetX;
    body.y = centerOffsetY + bodyOffsetY;
    var distanceFromSun = Math.sqrt(Math.pow(body.x, 2) + Math.pow(body.y, 2));
    
    //Draw the body
    ctx.save();
    ctx.translate(centerOffsetX, centerOffsetY); //Translating the canvas simplifies coordinates for subsequent drawing functions
    ctx.beginPath();
    ctx.arc(bodyOffsetX, bodyOffsetY, body.radius, 0, Math.PI *2);
    ctx.fillStyle = body.color;
    ctx.fill();
    
    //If the body is casting a shadow, draw it
    if (body.shadow) {
        ctx.translate(bodyOffsetX, bodyOffsetY);    //Translating & rotating the canvas simplifies coordinates for subsequent drawing functions
        ctx.rotate(Math.atan((body.y) / (body.x)));
        if (Math.sign(body.x) === -1) {ctx.rotate(Math.PI)};
        ctx.beginPath();
        ctx.moveTo(0, body.radius);
        ctx.lineTo(500, 500 * (body.radius / distanceFromSun));
        ctx.lineTo(500, -500 * (body.radius / distanceFromSun));
        ctx.lineTo(0, -body.radius);
        ctx.fillStyle = 'rgba(150, 150, 150, 0.4)';
        ctx.fill();
    }
    
    //Back out all of the canvas repositioning
    ctx.restore();
};


//Draw orange rays around the sun
//Assumes the sun is at the center of the canvas (i.e., sun.orbitSize = 0)
function drawSunRays () {
    ctx.beginPath();
    ctx.moveTo(1.2 * sun.radius, 0);
    for(a = 0; a < 2.05 * Math.PI; a += Math.PI / 8) {
        ctx.quadraticCurveTo(sun.radius * Math.cos(a - (Math.PI / 16)),     //x control point midway between tips
                             sun.radius * Math.sin(a - (Math.PI / 16)),    //y control point midway between tips
                             1.2 * sun.radius * Math.cos(a),    //x coordinate of next ray tip
                             1.2 * sun.radius * Math.sin(a));    //y coordinate of next ray tip
        }
    ctx.fillStyle = 'orange';
    ctx.fill();
}


//When the canvas is clicked, check what was hit an update the properties on the appropriate objects
function checkClick(event) {
    var x = event.offsetX - 500;
    var y = event.offsetY - 500;
    
    if (x>(sun.x-sun.radius) && x<(sun.x+sun.radius) && y>(sun.y-sun.radius) && y<(sun.y+sun.radius)) {
        earth.orbiting = !earth.orbiting; //If the sun is clicked, toggle the earth orbit
    }
    
    else if (x>(earth.x-earth.radius) && x<(earth.x+earth.radius) && y>(earth.y-earth.radius) && y<(earth.y+earth.radius)) {
        referencePoint.orbiting = !referencePoint.orbiting; //If the earth is clicked, toggle its rotation
    }
    
    else if (x>(moon.x-moon.radius) && x<(moon.x+moon.radius) && y>(moon.y-moon.radius) && y<(moon.y+moon.radius)) {
        moon.orbiting = !moon.orbiting; //If the moon is clicked, toggle its orbit
    }
    
    else {  //If no body is clicked, toggle shadows for the earth and moon
        earth.shadow = !earth.shadow;
        moon.shadow = !moon.shadow;
    }
}

//Start the animation
window.requestAnimationFrame(animate);


///////////////////////////////////////////////////////////////////////////////////////////////////
/////     3D Canvas code below here
/////     Utilizes the THREE.js library
///////////////////////////////////////////////////////////////////////////////////////////////////

//Set up the 3D canvas with a scene and renderer
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 500);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

//Add the 3D canvas to the DOM
var glcanvas = document.getElementById('glcanvas');
glcanvas.appendChild(renderer.domElement);

//Create a camera for the scene
var camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);

//Create a light source representing sunlight
var sunlight = new THREE.PointLight(0xffffff, 1, 0);
sunlight.position.set(0,0,0);
sunlight.castShadow = true;
scene.add(sunlight);

sunlight.shadow.mapSize.width = 512;
sunlight.shadow.mapSize.height = 512;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 1000;

//Create a sphere representing the moon
var moonGeometry = new THREE.SphereBufferGeometry(moon.radius, 32, 32);
var moonMaterial = new THREE.MeshLambertMaterial( {color: 0xdddddd});
var moon3D = new THREE.Mesh(moonGeometry, moonMaterial);
moon3D.castShadow =false;
moon3D.receiveShadow = true;
scene.add(moon3D);

//Create a sphere representing the Earth
//You won't actually see this sphere in the app, but it will cast a shadow on the moon
var earthGeometry = new THREE.SphereBufferGeometry(earth.radius, 32, 32);
var earthMaterial = new THREE.MeshLambertMaterial( {color: 0x0000ff});
var earth3D = new THREE.Mesh(earthGeometry, earthMaterial);
earth3D.castShadow = true;
earth3D.receiveShadow = false;
scene.add(earth3D);

//Create simple geometry representing the sun for reference
var sunGeometry = new THREE.SphereBufferGeometry(sun.radius, 32, 32);
var sunMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00});
var sun3D = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun3D);


//Function to animate the 3D canvas
//Note that the X-Y coordinate plane in the 2D canvas corresponds to the Z-X plane in the 3D canvas
function animate3D() {
    renderer.render(scene, camera);
    
    //Place the camera on the reference point body
    camera.position.z = -referencePoint.x;
    camera.position.x = referencePoint.y;
    camera.rotation.y = -referencePoint.theta;
    
    //Update the position of the earth
    earth3D.position.z = -earth.x;
    earth3D.position.x = earth.y;
    
    //Update the position of the moon
    moon3D.position.z = -moon.x;
    moon3D.position.x = moon.y;

}

