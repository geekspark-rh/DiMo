/* global requestAnimationFrame, define */
/* jslint browser: true */

(function (global) {

var deps = [
    'three',
    'stats',
    'underscore',
    'dimo/camera',
    'dimo/scene',
    'dimo/particles',
    'dimo/viewport',
];

function main(
    THREE,
    Stats,
    _,
    camera,
    scene,
    particles,
    viewport
) {

    var WIDTH  = viewport.WIDTH;
    var HEIGHT = viewport.HEIGHT;

    var container;
    var stats;

    var renderer;


    var origin;

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

    function init() {

        container = document.getElementById( 'container' );

        origin = new THREE.Vector3( 0, 0, 0 );
        origin.mass = 30;

        scene.add( particles.system );

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

        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();

        renderer.setSize( WIDTH, HEIGHT );

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
        .clampScalar(-MAX_VEL, MAX_VEL);
        return u;
    }

    function render() {

        particles.update();

        renderer.render( scene, camera );
    }

}

define(deps, main);

}(window));

