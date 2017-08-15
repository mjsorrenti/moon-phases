var canvas = document.getElementById('2dcanvas');
var ctx = canvas.getContext('2d');
ctx.translate(500, 500);
ctx.globalCompositeOperation = 'destination-over';


//Create the sun

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
    orbitSpeed: -1/125,
    orbiting: false,
    shadow: false
};

var moon = {
    x: 0,   //Initializing this value is meaningless
    y: 0,   //Initializing this value is meaningless
    theta: 2,
    radius: 20,
    color: 'gray',
    orbitSize: 100,
    orbitSpeed: -1/45,
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
    orbitSpeed: -1/20,
    orbiting: false,
    shadow: false
};

canvas.addEventListener('click', checkClick);

function animate () {
    ctx.clearRect(-500, -500, 1000, 1000)
    
    drawBody(sun, sun);
    
    drawBody(moon, earth);
    
    drawBody(referencePoint, earth);
    
    drawBody(earth, sun);
    
    animate3D();
        
    window.requestAnimationFrame(animate);
};

function drawBody(body, center) {
    if (body.orbiting) {body.theta += body.orbitSpeed};
    
    var centerOffsetX = center.orbitSize * Math.cos(center.theta);
    var centerOffsetY = center.orbitSize * Math.sin(center.theta);
    var bodyOffsetX = body.orbitSize * Math.cos(body.theta);
    var bodyOffsetY = body.orbitSize * Math.sin(body.theta);
    body.x = centerOffsetX + bodyOffsetX;
    body.y = centerOffsetY + bodyOffsetY;
    var distanceFromSun = Math.sqrt(Math.pow(body.x, 2) + Math.pow(body.y, 2));
    
    ctx.save();
    ctx.translate(centerOffsetX, centerOffsetY);
    ctx.beginPath();
    ctx.arc(bodyOffsetX, bodyOffsetY, body.radius, 0, Math.PI *2);
    ctx.fillStyle = body.color;
    ctx.fill();
    
    
    if (body.shadow) {
        ctx.translate(bodyOffsetX, bodyOffsetY);
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
    
    ctx.restore();
};

function checkClick(event) {
    var x = event.x - 510;
    var y = event.y - 510;
    
    if (x>(sun.x-sun.radius) && x<(sun.x+sun.radius) && y>(sun.y-sun.radius) && y<(sun.y+sun.radius)) {
        earth.orbiting = !earth.orbiting;
    }
    
    else if (x>(earth.x-earth.radius) && x<(earth.x+earth.radius) && y>(earth.y-earth.radius) && y<(earth.y+earth.radius)) {
        referencePoint.orbiting = !referencePoint.orbiting;
    }
    
    else if (x>(moon.x-moon.radius) && x<(moon.x+moon.radius) && y>(moon.y-moon.radius) && y<(moon.y+moon.radius)) {
        moon.orbiting = !moon.orbiting;
    }
    
    else {
        earth.shadow = !earth.shadow;
        moon.shadow = !moon.shadow;
    }
}

window.requestAnimationFrame(animate);


///////////////////////////////////////////////////////////////////////////////////////////////////
/////     3D Canvas code below here
///////////////////////////////////////////////////////////////////////////////////////////////////

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 500);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

var glcanvas = document.getElementById('glcanvas');
glcanvas.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);

var sunlight = new THREE.PointLight(0xffffff, 1, 0);
sunlight.position.set(0,0,0);
sunlight.castShadow = true;
scene.add(sunlight);

sunlight.shadow.mapSize.width = 512;
sunlight.shadow.mapSize.height = 512;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 1000;

var moonGeometry = new THREE.SphereBufferGeometry(moon.radius, 32, 32);
var moonMaterial = new THREE.MeshLambertMaterial( {color: 0xdddddd});
var moon3D = new THREE.Mesh(moonGeometry, moonMaterial);
moon3D.castShadow =false;
moon3D.receiveShadow = true;
scene.add(moon3D);

var earthGeometry = new THREE.SphereBufferGeometry(earth.radius, 32, 32);
var earthMaterial = new THREE.MeshLambertMaterial( {color: 0x0000ff});
var earth3D = new THREE.Mesh(earthGeometry, earthMaterial);
earth3D.castShadow = true;
earth3D.receiveShadow = false;
scene.add(earth3D);

var sunGeometry = new THREE.SphereBufferGeometry(sun.radius, 32, 32);
var sunMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00});
var sun3D = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun3D);


function animate3D() {
    renderer.render(scene, camera);
    
    camera.position.z = -referencePoint.x;
    camera.position.x = referencePoint.y;
    camera.rotation.y = -referencePoint.theta;
    
    earth3D.position.z = -earth.x;
    earth3D.position.x = earth.y;
    
    moon3D.position.z = -moon.x;
    moon3D.position.x = moon.y;

}

