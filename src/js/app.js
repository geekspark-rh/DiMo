/*global THREE, requestAnimationFrame, console, Stats*/
/*jslint browser: true*/

(function () {

    var container, stats;

    var camera, scene, renderer, particle_geometry, particle_system, origin, particle_colors, player_geometry, player_system, player_colors;

    var explosion_scale = new THREE.Vector3( 25, 25, 25 );

    var fps = 5;
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
        var particle_size = 25;
        var particle_mass = particle_size * particle_size * Math.PI;

        var player_size = 50;
        var player_mass = player_size * player_size * Math.PI;

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
            sizeAttenuation : false,
            transparent     : true,
            map             : THREE.ImageUtils.loadTexture('img/particle.png')
        });

        var player_material = new THREE.ParticleSystemMaterial({
            size            : player_size,
            color           : 0xff7920,
            // vertexColors    : THREE.VertexColors,
            blending        : THREE.AdditiveBlending,
            sizeAttenuation : false,
            transparent     : false,
            map             : THREE.ImageUtils.loadTexture('img/particle.png')
        });

        // particle_geometry.addAttribute( 'vertices', new Float32Array( particles * 3 ), 3 );
        // particle_geometry.addAttribute( 'color', new Float32Array( particles * 3 ), 3 );

        // var positions = particle_geometry.getAttribute( 'position' ).array;
        // var colors = particle_geometry.getAttribute( 'color' ).array;

        var color = new THREE.Color();

        var n = 1000, n2 = n / 2; // particles spread in the cube

        for ( var i = 0; i < particle_count; ++i ) {
            // create a particle with random
            // position values, -250 -> 250
            var x = Math.random() * n - n2;
            var y = Math.random() * n - n2;
            var z = 0;
            var particle = new THREE.Vector3(x, y, z);
            particle.velocity = origin.clone().sub(particle).divide(explosion_scale); // initial velocity towards the origin
            particle.mass = particle_mass;
            // add it to the geometry
            particle_geometry.vertices.push(particle);

            color = new THREE.Color( 128, 128, 0 );
            color.setRGB( 128, 128, 0 );
            particle_colors[i] = color;
        }

        for ( var i = 0; i < player_count; ++i ) {
            // create a particle with random
            // position values, -250 -> 250
            var x = Math.random() * n - n2;
            var y = Math.random() * n - n2;
            var z = 0;
            var player = new THREE.Vector3(x, y, z);
            player.velocity = origin.clone().sub(particle).divide(explosion_scale); // initial velocity towards the origin
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


    function getAcceleration(particle, particle2) {
        var r1 = new Array( particle.x, particle.y);
        var r2 = new Array( particle2.x, particle2.y);
        var r12 = new Array(r2[0]-r1[0], r2[1]-r1[1]);
        var u = new Array( r12[0]/Math.abs(r12[0] + r12[1])/2, r12[1]/Math.abs(r12[0] + r12[1])/2 );
    
        var m1 = particle.mass;
        var m2 = particle2.mass;

        var r_sqrd = Math.pow(r12[0], 2) + Math.pow(r12[1], 2);
        var a12 = new Array( -(g*m2/r_sqrd)*u[0], -(g*m2/r_sqrd)*u[1]);
        return a12;
    }


    function render() {

        // tween particle position from current to origin

        // new TWEEN.Tween( particle.position )
        // .delay( delay )
        // .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
        // .start();
        // TWEEN.update();

        // for(var i = 0; i < particle_system.geometry.getAttribute('position').array.length; i++ ) {
        //     particle_system.geometry.getAttribute('position').array[i] += 1;
        // }
        var particle;
        var r;
        var accel;
        for ( var i = particle_system.geometry.vertices.length - 1; i >= 0; --i ) {
            particle = particle_system.geometry.vertices[i];
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            for ( var j = player_system.geometry.vertices.length - 1; j >= 0; --j ) {
                particle2 = player_system.geometry.vertices[j];
                if (particle == particle2) {
                    continue;
                }
                if (particle.player > 0) {
                    continue;
                }
                var a12 = getAcceleration(particle, particle2);
            
                particle.velocity.x -= a12[0];
                particle.velocity.y -= a12[1];
            }

            /*particle.velocity.x = Math.random() * 4 - 2;
            particle.velocity.y = Math.random() * 4 - 2;*/

        }
        for ( var j = player_system.geometry.vertices.length - 1; j >= 0; --j ) {
            player_piece = player_system.geometry.vertices[j];
            player_piece.x += player_piece.velocity.x;
            player_piece.y += player_piece.velocity.y;
            player_piece.velocity.x = (Math.random() - 0.5) * 40 - 2;
            player_piece.velocity.y = (Math.random() - 0.5) * 40 - 2;
        }

        particle_system.geometry.__dirtyVertices = true;
        particle_system.geometry.verticesNeedUpdate = true;

        player_system.geometry.__dirtyVertices = true;
        player_system.geometry.verticesNeedUpdate = true;

        renderer.render( scene, camera );
    }

    window.particle_system = particle_system;
    window.player_system = player_system;

}());
