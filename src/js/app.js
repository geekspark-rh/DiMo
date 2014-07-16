/*global THREE, requestAnimationFrame, Stats, SPE*/
/*jslint browser: true*/

var container;
var stats;

var camera;
var scene;
var renderer;

var particle_geometry;
var particle_system;
var particle_colors;

var player_geometry;
var player_system;
var player_colors;

var origin;

// fmod increments every frame, wraps back to zero every second, to allow
// performing certain operations every 2nd frame, every 5th frame, etc
var fmod = 0;

var max_velocity = 1;

var fps = 60;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;

var g = 5.81;

init();
setTimeout(animate(), 0);

function set_fps(new_fps) {
    fps = new_fps;
    interval = 1000 / fps;
    return fps;
}
window.set_fps = set_fps;

// Create particle group and emitter
function add_trail_emitter(source, color) {
    var ptrail_group = new SPE.Group({
        texture: THREE.ImageUtils.loadTexture('img/bullet.png'),
        maxAge: 2
    });

    var ptrail_emitter = new SPE.Emitter({
        type: 'sphere',

        // position: new THREE.Vector3(0, 0, 0),
        position: source,

        radius: 0,
        speed: 0,

        colorStart: color,
        colorStartSpread: new THREE.Vector3(100, 100, 100),
        // colorEnd: new THREE.Color('white'),

        sizeStart: 150,
        sizeMiddle: 250,
        sizeEnd: 0,

        blending: THREE.AdditiveBlending,
        opacityStart: 0.35,
        // opacityMiddle: 0.5,
        opacityEnd: 0,

        particleCount: 100,
        angleAlignVelocity: 1
    });

    ptrail_group.addEmitter( ptrail_emitter );
    scene.add( ptrail_group.mesh );
    return {
        group: ptrail_group,
        emitter: ptrail_emitter
    };
}



function init() {

    container = document.getElementById( 'container' );

    origin = new THREE.Vector3( 0, 0, 0 );
    origin.mass = 30;

    //

    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 9001 );
    camera.position.z = 2750;

    scene = new THREE.Scene();

    //

    var particle_count = 200;
    var particle_size = 90;
    var particle_mass = 2;

    var player_count = 4;
    var player_size = 500;
    var player_mass = 5;

    particle_geometry = new THREE.Geometry();
    player_geometry = new THREE.Geometry();
    particle_colors   = [];
    player_colors   = [];

    // THREE.NoBlending
    // THREE.NormalBlending
    // THREE.AdditiveBlending
    // THREE.SubtractiveBlending
    // THREE.MultiplyBlending

    var particle_material = new THREE.ParticleSystemMaterial({
        size            : particle_size,
        vertexColors    : THREE.VertexColors,
        blending        : THREE.AdditiveBlending,
        sizeAttenuation : true,
        transparent     : true,
        fog             : false,
        map             : THREE.ImageUtils.loadTexture('img/particle.png')
    });

    var player_material = new THREE.ParticleSystemMaterial({
        size            : player_size,
        vertexColors    : THREE.VertexColors,
        blending        : THREE.AdditiveBlending,
        sizeAttenuation : true,
        transparent     : true,
        fog             : false,
        map             : THREE.ImageUtils.loadTexture('img/particle.png')
    });

    var n = 1000, n2 = n / 2; // particles spread in the cube
    var i;

    var colors = [];

    debugger;
    colors[0] = (new THREE.Color(185, 114, 191)).multiplyScalar(1/255);
    colors[1] = (new THREE.Color(114, 191, 128)).multiplyScalar(1/255);
    colors[2] = (new THREE.Color(124, 114, 191)).multiplyScalar(1/255);
    colors[3] = (new THREE.Color(191, 129, 114)).multiplyScalar(1/255);

    for ( i = 0; i < particle_count; ++i ) {
        var particle = new THREE.Vector3(
            Math.random() * n - n2,
            Math.random() * n - n2,
            0
        );
        particle.velocity = new THREE.Vector3(
            Math.random() * n / n2,
            Math.random() * n / n2,
            0
        );
        particle.mass = particle_mass;
        particle.trail = add_trail_emitter(particle, colors[i % 4]);
        // add it to the geometry
        particle_geometry.vertices.push(particle);

        particle_colors.push(colors[i % 4]);
    }

    for ( i = 0; i < player_count; ++i ) {
        // create a particle with random
        // position values, -250 -> 250
        var player = new THREE.Vector3(
            (Math.random() * n - n2)/10,
            (Math.random() * n - n2)/10,
            0
        );
        player.velocity = new THREE.Vector3(0, 0, 0);
        player.mass = player_mass;
        player.player = i;
        player_geometry.vertices.push(player);

        player_colors.push(colors[i % 4]);
    }

    particle_geometry.computeBoundingSphere();
    particle_geometry.colors = particle_colors;

    player_geometry.computeBoundingSphere();
    player_geometry.colors = player_colors;

    //

    particle_system = new THREE.ParticleSystem( particle_geometry, particle_material );
    player_system = new THREE.ParticleSystem( player_geometry, player_material );
    particle_system.sortParticles = true;
    player_system.sortParticles = true;
    scene.add( particle_system );
    scene.add( player_system );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x000000, 1 );
    renderer.setSize( window.innerWidth, window.innerHeight );

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
    var n = g * p1.mass * p2.mass / 2;
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

    var i;
    var j;
    var particle;
    var particle2;
    var player_piece;

    // Increment and wrap fmod
    fmod++;
    fmod %= fps;

    for ( i = particle_geometry.vertices.length - 1; i >= 0; --i ) {
        particle = particle_geometry.vertices[i];

        // Update the particle's position
        particle.add( particle.velocity );

        // Update the particle's trail's position
        // particle.trail.emitter.position = particle.clone();

        // Update the particle's trail display
        particle.trail.group.tick( 1 / fps );

        for ( j = player_geometry.vertices.length - 1; j >= 0; --j ) {
            particle2 = player_geometry.vertices[j];
            if ( particle !== particle2 && !particle.player ) {
                particle.velocity.add( getAcceleration(particle, particle2) );
            }
        }
    }

    for ( j = player_geometry.vertices.length - 1; j >= 0; --j ) {
        player_piece = player_geometry.vertices[j];
        player_piece.add( player_piece.velocity );
        player_piece.velocity.add( getAcceleration(player_piece, origin).divideScalar(20) ); // divide by 20 to reduce accel speed
    }

    renderer.render( scene, camera );
}

