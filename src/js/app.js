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

var user_geometry;
var user_system;
var user_colors;

var user_outer_geometry;
var user_outer_system;
var user_outer_colors;

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

        particleCount: 200,
        angleAlignVelocity: 0
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

    var particle_count = 20;
    var particle_size = 150;
    var particle_mass = 2;

    var user_count = 4;
    var user_size = 800;
    var user_mass = 5;

    particle_geometry = new THREE.Geometry();
    user_geometry = new THREE.Geometry();
    user_outer_geometry = new THREE.Geometry();

    particle_colors   = [];
    user_colors   = [];

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

    var user_material = new THREE.ParticleSystemMaterial({
        size            : user_size,
        vertexColors    : THREE.VertexColors,
        blending        : THREE.AdditiveBlending,
        sizeAttenuation : true,
        transparent     : true,
        fog             : false,
        map             : THREE.ImageUtils.loadTexture('img/solid-particle.png')
    });

    var user_outer_material = new THREE.ParticleSystemMaterial({
        size            : user_size,
        // vertexColors    : THREE.VertexColors,
        blending        : THREE.AdditiveBlending,
        sizeAttenuation : true,
        transparent     : true,
        fog             : false,
        map             : THREE.ImageUtils.loadTexture('img/token-gloss.png')
    });

    var n = 1000, n2 = n / 2; // particles spread in the cube
    var i;

    var colors = [];

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
        particle_geometry.vertices.push(particle);

        particle_colors.push(colors[i % 4]);
    }

    for ( i = 0; i < user_count; ++i ) {
        var user = new THREE.Vector3(
            (Math.random() * n - n2),
            (Math.random() * n - n2),
            0
        );
        user.velocity = new THREE.Vector3(0, 0, 0);
        user.mass = user_mass;
        user.id = i;
        user_geometry.vertices.push(user);

        user_colors.push(colors[i % 4]);

        var user_outer = user.clone();
        user_outer.mass = user_mass;
        user_outer.id = i;
        user_outer_geometry.vertices.push(user_outer);
    }

    particle_geometry.computeBoundingSphere();
    particle_geometry.colors = particle_colors;

    user_geometry.computeBoundingSphere();
    user_geometry.colors = user_colors;

    user_outer_geometry.computeBoundingSphere();

    //

    particle_system = new THREE.ParticleSystem( particle_geometry, particle_material );
    user_system = new THREE.ParticleSystem( user_geometry, user_material );
    user_outer_system = new THREE.ParticleSystem( user_outer_geometry, user_outer_material );

    particle_system.sortParticles = true;
    user_system.sortParticles = true;
    user_outer_system.sortParticles = true;

    scene.add( particle_system );
    scene.add( user_system );
    scene.add( user_outer_system );

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
    var user_piece;
    var user_outer_piece;

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

        for ( j = user_geometry.vertices.length - 1; j >= 0; --j ) {
            particle2 = user_geometry.vertices[j];
            if ( particle !== particle2 && !particle.id ) {
                particle.velocity.add( getAcceleration(particle, particle2) );
            }
        }
    }

    for ( j = user_geometry.vertices.length - 1; j >= 0; --j ) {
        user_piece = user_geometry.vertices[j];
        user_piece.add(user_piece.velocity);
        user_outer_geometry.vertices[j].copy(user_piece);
        user_piece.velocity.add( getAcceleration(user_piece, origin).divideScalar(20) ); // divide by 20 to reduce accel speed
    }

    renderer.render( scene, camera );
}

