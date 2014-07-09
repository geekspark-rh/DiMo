/*global THREE, requestAnimationFrame, console, Stats*/
/*jslint browser: true*/

(function () {

    var container, stats;

    var camera, scene, renderer, particle_geometry, particle_system, origin, particle_colors;

    var explosion_scale = new THREE.Vector3( 50, 50, 50 );
    var abs = Math.abs;
    var rand = Math.random;

    init();
    animate();

    /**
     * Add a new particle to the given geometry.
     *
     * @param {Geometry} geo The ThreeJS geometry to add the particle to.
     * @param {Vector3} pos The initial position.
     * @param {Vector3} vel The initial velocity.
     */
    function add_particle(geo, pos, vel) {
        // create a particle with random
        // position values, -250 -> 250
        var particle = pos.clone();
        particle.velocity = vel;

        // add it to the geometry
        geo.vertices.push(particle);
    }

    function init() {

        container = document.getElementById( 'container' );

        origin = new THREE.Vector3( 0, 0, 0 );

        //

        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 9001 );
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
            // color           : 0xaaaaaa,
            vertexColors    : THREE.VertexColors,
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

        var pos, vel;
        var colors = [];
        colors[0] = new THREE.Color(1, 0, 0);
        colors[1] = new THREE.Color(0, 1, 0);
        colors[2] = new THREE.Color(0, 0, 1);
        colors[3] = new THREE.Color(0, 1, 1);

        for ( var i = 0; i < particle_count; ++i ) {
            // create a particle with random
            // position values, -250 -> 250
            
            pos = new THREE.Vector3( rand() * n - n2, rand() * n - n2, 0 );
            vel = origin.clone().sub(pos).divide(explosion_scale); // initial velocity towards the origin

            add_particle( particle_geometry, pos, vel);

            particle_colors.push(colors[i % 4]);
        }

        particle_geometry.computeBoundingSphere();
        particle_geometry.colors = particle_colors;

        //

        particle_system = new THREE.ParticleSystem( particle_geometry, particle_material );
        particle_system.sortParticles = true;
        scene.add( particle_system );

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
            particle.velocity.x += Math.random() * 1 - 0.5;
            particle.velocity.y += Math.random() * 1 - 0.5;
        }
        particle_system.geometry.__dirtyVertices = true;
        particle_system.geometry.verticesNeedUpdate = true;

        renderer.render( scene, camera );
    }

    window.particle_system = particle_system;

}());
