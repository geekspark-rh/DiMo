/*global THREE, requestAnimationFrame, Stats*/
/*jslint browser: true*/

(function () {

    var container;
    var stats;

    var camera;
    var scene;
    var renderer;
    var particle_geometry;
    var particle_system;
    var origin;
    var particle_colors;
    var player_geometry;
    var player_system;
    var player_colors;

    var max_velocity = 1;

    var fps = 60;
    var now;
    var then = Date.now();
    var interval = 1000 / fps;
    var delta;

    var g = 5.81;

    init();
    animate();

    function set_fps(new_fps) {
        fps = new_fps;
        interval = 1000 / fps;
    }

    function init() {

        container = document.getElementById( 'container' );

        origin = new THREE.Vector3( 0, 0, 0 );
        origin.mass = 10;

        //

        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 9001 );
        camera.position.z = 2750;

        scene = new THREE.Scene();

        //

        var particle_count = 10;
        var player_count = 4;
        var particle_size = 250;
        var particle_mass = 20;

        var player_size = 500;
        var player_mass = 50;

        particle_geometry = new THREE.Geometry();
        player_geometry = new THREE.Geometry();
        particle_colors   = [];
        player_colors   = [];

        var particle_material = new THREE.ParticleSystemMaterial({
            size            : particle_size,
            vertexColors    : THREE.VertexColors,
            blending        : THREE.AdditiveBlending,
            sizeAttenuation : true,
            transparent     : true,
            map             : THREE.ImageUtils.loadTexture('img/particle.png')
        });

        var player_material = new THREE.ParticleSystemMaterial({
            size            : player_size,
            vertexColors    : THREE.VertexColors,
            blending        : THREE.AdditiveBlending,
            sizeAttenuation : true,
            transparent     : true,
            map             : THREE.ImageUtils.loadTexture('img/particle.png')
        });

        // particle_geometry.addAttribute( 'vertices', new Float32Array( particles * 3 ), 3 );
        // particle_geometry.addAttribute( 'color', new Float32Array( particles * 3 ), 3 );

        // var positions = particle_geometry.getAttribute( 'position' ).array;
        // var colors = particle_geometry.getAttribute( 'color' ).array;

        var color = new THREE.Color();

        var n = 1000, n2 = n / 2; // particles spread in the cube
        var i;

        var colors = [];
        colors[0] = new THREE.Color(0.5, 0.0, 0.0);
        colors[1] = new THREE.Color(0.0, 0.5, 0.0);
        colors[2] = new THREE.Color(0.0, 0.0, 0.5);
        colors[3] = new THREE.Color(0.0, 0.5, 0.5);

        for ( i = 0; i < particle_count; ++i ) {
            var particle = new THREE.Vector3(
                Math.random() * n - n2,
                Math.random() * n - n2,
                0
            );
            particle.velocity = new THREE.Vector3(0, 0, 0);
            particle.mass = particle_mass;
            // add it to the geometry
            particle_geometry.vertices.push(particle);

            particle_colors.push(colors[i % 4]);
        }

        for ( i = 0; i < player_count; ++i ) {
            // create a particle with random
            // position values, -250 -> 250
            var player = new THREE.Vector3(
                Math.random() * n - n2,
                Math.random() * n - n2,
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

        renderer = new THREE.WebGLRenderer( { antialias: true, precision: 'highp', alpha: true } );
        renderer.setClearColor( 0x1c1c1c, 1 );
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
        var n = g * p1.mass;
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

        var j;
        var i;
        var particle;
        var particle2;
        var player_piece;

        for ( i = particle_system.geometry.vertices.length - 1; i >= 0; --i ) {
            particle = particle_system.geometry.vertices[i];
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            for ( j = player_system.geometry.vertices.length - 1; j >= 0; --j ) {
                particle2 = player_system.geometry.vertices[j];
                if (particle == particle2) {
                    continue;
                }
                if (particle.player > 0) {
                    continue;
                }
                particle.velocity.add( getAcceleration(particle, particle2) );
            }
        }

        for ( j = player_system.geometry.vertices.length - 1; j >= 0; --j ) {
            player_piece = player_system.geometry.vertices[j];
            player_piece.x += player_piece.velocity.x;
            player_piece.y += player_piece.velocity.y;
            player_piece.velocity.add( getAcceleration(player_piece, origin).divideScalar(20) );
        }

        renderer.render( scene, camera );
    }

}());
