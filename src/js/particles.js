/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'three',
    'dimo/viewport',
    'text!shaders/vertex.vert',
    'text!shaders/pulsing-dot.frag',
];

function main(
    THREE,
    viewport,
    vertex_shader,
    fragment_shader
) {

    var WIDTH  = viewport.WIDTH;
    var HEIGHT = viewport.HEIGHT;

    var i30    = 0;
    var i31    = 1;

    var MAX_VEL = 10;

    var size;
    var vel;
    var acc;
    var pos;

    var particle_geometry;
    var particle_system;
    var particle_colors;

    var particle_count = 1e5;
    var particle_size = 3;
    var particle_mass = 2;

    var accd  = 0.50; // how much the acceleration is allowed to change each frame
    var accdh = accd / 2;

    particle_geometry = new THREE.BufferGeometry();

    particle_colors   = [];

    // THREE.NoBlending
    // THREE.NormalBlending
    // THREE.AdditiveBlending
    // THREE.SubtractiveBlending
    // THREE.MultiplyBlending

    var attributes = {
        size         : { type : 'f',  value : null },
        customColor  : { type : 'c',  value : null },
        acceleration : { type : 'v3', value : null },
        velocity     : { type : 'v3', value : null }
    };

    var uniforms = {
        color:     { type: "c", value: new THREE.Color( 0xffffff ) },
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/particle-glow.png" ) }
    };

    var particle_material = new THREE.ShaderMaterial( {

        uniforms       : uniforms,
        attributes     : attributes,
        vertexShader   : vertex_shader,
        fragmentShader : fragment_shader,
        blending       : THREE.AdditiveBlending,
        depthTest      : false,
        transparent    : true

    } );

    // var particle_material = new THREE.PointCloudMaterial({
    //     size            : particle_size,
    //     vertexColors    : THREE.VertexColors,
    //     blending        : THREE.AdditiveBlending,
    //     sizeAttenuation : true,
    //     transparent     : true,
    //     fog             : false,
    //     map             : THREE.ImageUtils.loadTexture('img/particle.png')
    // });

    var n = 1000, n2 = n / 2; // particles spread in the cube
    var i;

    //

    var positions     = new Float32Array( particle_count * 3 );
    var values_color  = new Float32Array( particle_count * 3 );
    var values_size   = new Float32Array( particle_count );
    var accelerations = new Float32Array( particle_count * 3 );
    var velocities    = new Float32Array( particle_count * 3 );

    var color = new THREE.Color();

    for( var v = 0; v < particle_count; v++ ) {

        values_size[ v ] = particle_size;

        positions[ v * 3 + 0 ] = ( Math.random() * accd - accdh ) * WIDTH;
        positions[ v * 3 + 1 ] = ( Math.random() * accd - accdh ) * HEIGHT;
        positions[ v * 3 + 2 ] = 0; // z is fixed

        color.setHSL( v / particle_count, 1.0, 0.5 );

        values_color[ v * 3 + 0 ] = color.r;
        values_color[ v * 3 + 1 ] = color.g;
        values_color[ v * 3 + 2 ] = color.b;

        accelerations[ v * 3 + 0 ] = ( Math.random() * 1 - 0.5 );
        accelerations[ v * 3 + 1 ] = ( Math.random() * 1 - 0.5 );
        accelerations[ v * 3 + 2 ] = 0; // z is fixed

        velocities[ v * 3 + 0 ] = ( Math.random() * 1 - 0.5 );
        velocities[ v * 3 + 1 ] = ( Math.random() * 1 - 0.5 );
        velocities[ v * 3 + 2 ] = 0; // z is fixed

    }

    particle_geometry.addAttribute( 'position'     , new THREE.BufferAttribute( positions     , 3 ) );
    particle_geometry.addAttribute( 'customColor'  , new THREE.BufferAttribute( values_color  , 3 ) );
    particle_geometry.addAttribute( 'size'         , new THREE.BufferAttribute( values_size   , 1 ) );
    particle_geometry.addAttribute( 'acceleration' , new THREE.BufferAttribute( accelerations , 3 ) );
    particle_geometry.addAttribute( 'velocity'     , new THREE.BufferAttribute( velocities    , 3 ) );

    size  = particle_geometry.attributes.size.array;
    vel   = particle_geometry.attributes.velocity.array;
    acc   = particle_geometry.attributes.acceleration.array;
    pos   = particle_geometry.attributes.position.array;

    particle_system = new THREE.PointCloud( particle_geometry, particle_material );

    particle_system.sortParticles = true;

    function update() {

        var time  = Date.now() * 0.005;

        for( var i = 0; i < particle_count; i++ ) {

            i30 = i * 3;
            i31 = i30+ 1;

            size[ i ] = particle_size * ( 2 + Math.sin( 0.1 * i + time ) );

            // Add acc to vel
            acc[i30] = ( Math.random() * accd - accdh );
            acc[i31] = ( Math.random() * accd - accdh );

            // Add acc to vel
            vel[i30] = Math.min(vel[i30] + acc[i30], MAX_VEL);
            vel[i31] = Math.min(vel[i31] + acc[i31], MAX_VEL);

            // Add vel to pos
            pos[i30] += vel[i30];
            pos[i31] += vel[i31];

        }

        particle_geometry.attributes.size.needsUpdate = true;
        particle_geometry.attributes.position.needsUpdate = true;
        particle_geometry.attributes.velocity.needsUpdate = true;
        particle_geometry.attributes.acceleration.needsUpdate = true;
    }

    return {
        system: particle_system,
        update: update,
    };
}

define(deps, main);

})(window);
