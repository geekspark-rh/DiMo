/*global THREE, requestAnimationFrame, Stats*/
/*jslint browser: true*/

var container;
var stats;

var camera;
var scene;
var renderer;

var particle_geometry;
var particle_system;
var particle_colors;

var particle_count = 1e5;
var particle_size = 5;
var particle_mass = 2;

var origin;

var fps = 60;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;

var max_velocity = 20;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var g = 5.81;

init();
setTimeout(animate(), 0);

function set_fps(new_fps) {
    fps = new_fps;
    interval = 1000 / fps;
    return fps;
}
window.set_fps = set_fps;

function init() {

    container = document.getElementById( 'container' );

    origin = new THREE.Vector3( 0, 0, 0 );
    origin.mass = 30;

    //

    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 9001 );
    camera.position.z = 2750;

    scene = new THREE.Scene();

    //

    particle_geometry = new THREE.BufferGeometry();

    particle_colors   = [];

    // THREE.NoBlending
    // THREE.NormalBlending
    // THREE.AdditiveBlending
    // THREE.SubtractiveBlending
    // THREE.MultiplyBlending

    var attributes = {
        size         : { type : 'f',  value : null },
        customColor  : { type : 'c',  value : null },
        acceleration : { type : 'v3', value : null },
        velocity     : { type : 'v3', value : null }
    };

    var uniforms = {
        color:     { type: "c", value: new THREE.Color( 0xffffff ) },
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/circle-shadow.png" ) }
    };

    var particle_material = new THREE.ShaderMaterial( {

        uniforms       : uniforms,
        attributes     : attributes,
        vertexShader   : document.getElementById( 'vertexShader' ).textContent,
        fragmentShader : document.getElementById( 'fragmentShader' ).textContent,
        blending       : THREE.AdditiveBlending,
        depthTest      : false,
        transparent    : true

    } );

    // var particle_material = new THREE.PointCloudMaterial({
    //     size            : particle_size,
    //     vertexColors    : THREE.VertexColors,
    //     blending        : THREE.AdditiveBlending,
    //     sizeAttenuation : true,
    //     transparent     : true,
    //     fog             : false,
    //     map             : THREE.ImageUtils.loadTexture('img/particle.png')
    // });

    var n = 1000, n2 = n / 2; // particles spread in the cube
    var i;

    //

    var positions     = new Float32Array( particle_count * 3 );
    var values_color  = new Float32Array( particle_count * 3 );
    var values_size   = new Float32Array( particle_count );
    var accelerations = new Float32Array( particle_count * 3 );
    var velocities    = new Float32Array( particle_count * 3 );

    var color = new THREE.Color();

    for( var v = 0; v < particle_count; v++ ) {

        values_size[ v ] = particle_size;

        positions[ v * 3 + 0 ] = ( Math.random() * 2 - 1 ) * WIDTH;
        positions[ v * 3 + 1 ] = ( Math.random() * 2 - 1 ) * HEIGHT;;
        positions[ v * 3 + 2 ] = 0; // z is fixed

        color.setHSL( v / particle_count, 1.0, 0.5 );

        values_color[ v * 3 + 0 ] = color.r;
        values_color[ v * 3 + 1 ] = color.g;
        values_color[ v * 3 + 2 ] = color.b;

        accelerations[ v * 3 + 0 ] = ( Math.random() * 1 - 0.5 );
        accelerations[ v * 3 + 1 ] = ( Math.random() * 1 - 0.5 );
        accelerations[ v * 3 + 2 ] = 0; // z is fixed

        velocities[ v * 3 + 0 ] = ( Math.random() * 1 - 0.5 );
        velocities[ v * 3 + 1 ] = ( Math.random() * 1 - 0.5 );
        velocities[ v * 3 + 2 ] = 0; // z is fixed

    }

    particle_geometry.addAttribute( 'position'     , new THREE.BufferAttribute( positions     , 3 ) );
    particle_geometry.addAttribute( 'customColor'  , new THREE.BufferAttribute( values_color  , 3 ) );
    particle_geometry.addAttribute( 'size'         , new THREE.BufferAttribute( values_size   , 1 ) );
    particle_geometry.addAttribute( 'acceleration' , new THREE.BufferAttribute( accelerations , 3 ) );
    particle_geometry.addAttribute( 'velocity'     , new THREE.BufferAttribute( velocities    , 3 ) );

    particle_system = new THREE.PointCloud( particle_geometry, particle_material );

    particle_system.sortParticles = true;

    scene.add( particle_system );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x000000, 1 );
    renderer.setSize( WIDTH, HEIGHT );

    container.appendChild( renderer.domElement );

    //

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
        then = now - (delta % interval);
        render();
        stats.update();
    }

}


function getAcceleration(p1, p2) {
    var n = g;
    var r_sqrd = 2 * p2.distanceTo(p1);
    var u = p2.clone()
    .sub(p1)
    .normalize()
    .multiply( new THREE.Vector3( n, n, 0 ) )
    .divideScalar(r_sqrd)
    .clampScalar(-max_velocity, max_velocity);
    return u;
}

function render() {

    var time  = Date.now() * 0.005;
    var size  = particle_geometry.attributes.size.array;
    var vel   = particle_geometry.attributes.velocity.array;
    var acc   = particle_geometry.attributes.acceleration.array;
    var pos   = particle_geometry.attributes.position.array;
    var i3    = 0;

    for( var i = 0; i < particle_count; i++ ) {

        i3 = i * 3;

        size[ i ] = particle_size * ( 2 + Math.sin( 0.1 * i + time ) );

        // Add acc to vel
        vel[i3 + 0] += acc[i3 + 0];
        vel[i3 + 1] += acc[i3 + 1];
        vel[i3 + 2] += acc[i3 + 2];

        // Add vel to pos
        pos[i3 + 0] += vel[i3 + 0];
        pos[i3 + 1] += vel[i3 + 1];
        pos[i3 + 2] += vel[i3 + 2];

    }

    particle_geometry.attributes.size.needsUpdate = true;
    particle_geometry.attributes.position.needsUpdate = true;
    particle_geometry.attributes.velocity.needsUpdate = true;
    particle_geometry.attributes.acceleration.needsUpdate = true;

    renderer.render( scene, camera );
}

