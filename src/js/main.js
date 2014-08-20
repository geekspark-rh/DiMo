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
    'dimo/users',
    'dimo/viewport',
];

function main(
    THREE,
    Stats,
    _,
    camera,
    scene,
    particles,
    users,
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
        // scene.add( users.system );

        //

        renderer = new THREE.WebGLRenderer({
            precision: "lowp",
        });
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

    function render() {

        particles.update();
        users.update();

        renderer.render( scene, camera );
    }

}

define(deps, main);

}(window));

