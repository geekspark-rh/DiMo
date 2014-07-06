/*global THREE, requestAnimationFrame, console, stats*/
/*jslint browser: true*/

(function () {

    var container, stats;

    var camera, scene, renderer, particle_geometry;

    init();
    animate();

    function init() {

        container = document.getElementById( 'container' );

        //

        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
        camera.position.z = 2750;

        scene = new THREE.Scene();

        //

        var particles = 100;

        particle_geometry = new THREE.BufferGeometry();

        particle_geometry.addAttribute( 'position', new Float32Array( particles * 3 ), 3 );
        particle_geometry.addAttribute( 'color', new Float32Array( particles * 3 ), 3 );

        var positions = particle_geometry.getAttribute( 'position' ).array;
        var colors = particle_geometry.getAttribute( 'color' ).array;

        var color = new THREE.Color();

        var n = 1000, n2 = n / 2; // particles spread in the cube

        for ( var i = 0; i < positions.length; i += 3 ) {

            // positions

            var x = Math.random() * n - n2;
            var y = Math.random() * n - n2;
            var z = Math.random() * n - n2;

            positions[ i ]     = x;
            positions[ i + 1 ] = y;
            positions[ i + 2 ] = z;

            // colors

            var vx = ( x / n ) + 0.5;
            var vy = ( y / n ) + 0.5;
            var vz = ( z / n ) + 0.5;

            color.setRGB( vx, vy, vz );

            colors[ i ]     = color.r;
            colors[ i + 1 ] = color.g;
            colors[ i + 2 ] = color.b;

        }

        particle_geometry.computeBoundingSphere();

        //

        var material = new THREE.ParticleSystemMaterial({
            size            : 15,
            vertexColors    : THREE.VertexColors,
            blending        : THREE.AdditiveBlending,
            sizeAttenuation : false,
            transparent     : true
        });

        particleSystem = new THREE.ParticleSystem( particle_geometry, material );
        particleSystem.sortParticles = true;
        window.geo = particle_geometry;
        scene.add( particleSystem );

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

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

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

        var time = Date.now() * 0.001;

        // tween particle position from current to origin

        // new TWEEN.Tween( particle.position )
        // .delay( delay )
        // .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
        // .start();
        // TWEEN.update();

        renderer.render( scene, camera );
    }

    window.ps = particleSystem;

}());
