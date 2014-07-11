/*global THREE, requestAnimationFrame, Stats*/
/*jslint browser: true*/

(function () {

    var container, stats;

    var camera, scene, renderer, particle_geometry, particle_system, origin, particle_colors, player_geometry, player_system, player_colors;

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
    window.set_fps = set_fps;

    function init() {

        container = document.getElementById( 'container' );

        origin = new THREE.Vector3( 0, 0, 0 );

        //

        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
        camera.position.z = 2750;

        scene = new THREE.Scene();

        //

        var particle_count = 10;
        var player_count = 4;
        var particle_size = 250;
        var particle_mass = 40;

        var player_size = 500;
        var player_mass = 100;

        particle_geometry = new THREE.Geometry();
        player_geometry = new THREE.Geometry();
        particle_colors   = [];
        player_colors   = [];

            // size         : 3,
            // vertexColors : THREE.VertexColors,
            // transparent  : false
        var particle_material = new THREE.ParticleSystemMaterial({
            size            : particle_size,
            color           : 0xaaaaaa,
            // vertexColors    : THREE.VertexColors,
            blending        : THREE.AdditiveBlending,
            sizeAttenuation : true,
            transparent     : true,
            map             : THREE.ImageUtils.loadTexture('img/particle.png')
        });

        var player_material = new THREE.ParticleSystemMaterial({
            size            : player_size,
            color           : 0xff7920,
            // vertexColors    : THREE.VertexColors,
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

        for ( i = 0; i < particle_count; ++i ) {
            // create a particle with random
            // position values, -250 -> 250
            var particle = new THREE.Vector3(
                Math.random() * n - n2,
                Math.random() * n - n2,
                0
            );
            particle.velocity = new THREE.Vector3(0, 0, 0);
            particle.mass = particle_mass;
            // add it to the geometry
            particle_geometry.vertices.push(particle);

            color = new THREE.Color( 128, 128, 0 );
            color.setRGB( 128, 128, 0 );
            particle_colors[i] = color;
        }

        for ( i = 0; i < player_count; ++i ) {
            // create a particle with random
            // position values, -250 -> 250
            var player = new THREE.Vector3(
                Math.random() * n - n2,
                Math.random() * n - n2,
                0
            );
            player.mass = player_mass;
            player.player = i;
            player_geometry.vertices.push(player);

            color = new THREE.Color( 128, 128, 0 );
            color.setRGB( 128, 128, 0 );
            player_colors[i] = color;
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


    function getAcceleration(P1, P2) {
        var r_sqrd = P2.distanceToSquared(P1);
        var u = P2.clone()
        .sub(P1)
        .normalize()
        .multiply( new THREE.Vector3( -g * P1.mass, -g * P1.mass, 0 ) )
        .divideScalar(r_sqrd)
        .clampScalar(-max_velocity, max_velocity);
        return u;
    }

    function render() {

        var particle, particle2, j, player_piece;
        for ( var i = particle_system.geometry.vertices.length - 1; i >= 0; --i ) {
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
                var a12 = getAcceleration(particle, particle2);

                particle.velocity.x -= a12.x;
                particle.velocity.y -= a12.y;
            }
        }

        // for ( j = player_system.geometry.vertices.length - 1; j >= 0; --j ) {
        //     player_piece = player_system.geometry.vertices[j];
        //     player_piece.x += player_piece.velocity.x;
        //     player_piece.y += player_piece.velocity.y;
        //     player_piece.velocity.x += (Math.random() - 0.5) * 0.2;
        //     player_piece.velocity.y += (Math.random() - 0.5) * 0.2;
        // }

        renderer.render( scene, camera );
    }

    window.particle_system = particle_system;
    window.player_system = player_system;

}());
