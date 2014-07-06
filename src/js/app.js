/*global THREE, requestAnimationFrame, console, Stats*/
/*jslint browser: true*/

(function () {

    var container, stats;

    var camera, scene, renderer, particle_geometry, particle_system, origin, particle_colors;

    var explosion_scale = new THREE.Vector3( 25, 25, 25 );

    init();
    animate();

    function init() {

        container = document.getElementById( 'container' );

        origin = new THREE.Vector3( 0, 0, 0 );

        //

        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
        camera.position.z = 2750;

        scene = new THREE.Scene();

        //

        var particle_count = 1000;

        particle_geometry = new THREE.Geometry();
        particle_colors   = [];

            // size         : 3,
            // vertexColors : THREE.VertexColors,
            // transparent  : false
        var particle_material = new THREE.ParticleSystemMaterial({
            size            : 25,
            color           : 0xaaaaaa,
            // vertexColors    : THREE.VertexColors,
            blending        : THREE.AdditiveBlending,
            sizeAttenuation : false,
            transparent     : true,
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

            // add it to the geometry
            particle_geometry.vertices.push(particle);

            color = new THREE.Color( 128, 128, 0 );
            color.setRGB( 128, 128, 0 );
            particle_colors[i] = color;
        }

        particle_geometry.computeBoundingSphere();
        particle_geometry.colors = particle_colors;

        //

        particle_system = new THREE.ParticleSystem( particle_geometry, particle_material );
        particle_system.sortParticles = true;
        scene.add( particle_system );

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

        render();
        stats.update();

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
        for ( var i = particle_system.geometry.vertices.length - 1; i >= 0; --i ) {
            particle = particle_system.geometry.vertices[i];
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.x += Math.random() * 4 - 2;
            particle.velocity.y += Math.random() * 4 - 2;
        }
        particle_system.geometry.__dirtyVertices = true;
        particle_system.geometry.verticesNeedUpdate = true;

        renderer.render( scene, camera );
    }

    window.particle_system = particle_system;

}());
