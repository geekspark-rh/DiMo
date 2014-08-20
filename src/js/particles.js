/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'three',
    'dimo/viewport',
    'dimo/origin',
    'dimo/accel',
    'dimo/colors',
    'text!shaders/vertex.vert',
    'text!shaders/particle.frag',
];

function main(
    THREE,
    viewport,
    origin,
    accel,
    colors,
    vert,
    frag
) {

    var WIDTH  = viewport.WIDTH;
    var HEIGHT = viewport.HEIGHT;

    var i30    = 0;
    var i31    = 1;

    var MAX_VEL = 6;

    var size;
    var vel;
    var pos;

    var particle_geometry;
    var particle_system;
    var particle_colors;

    var particle_count = 1e5;
    var particle_size = 2;
    var particle_mass = 2;

    var accd  = 1.75; // how much the acceleration is allowed to change each frame
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
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/box.png" ) }
    };

    var particle_material = new THREE.ShaderMaterial( {

        uniforms       : uniforms,
        attributes     : attributes,
        vertexShader   : vert,
        fragmentShader : frag,
        blending       : THREE.AdditiveBlending,
        depthTest      : false,
        transparent    : true

    } );

    var positions     = new Float32Array( particle_count * 3 );
    var values_color  = new Float32Array( particle_count * 3 );
    var values_size   = new Float32Array( particle_count );
    var velocities    = new Float32Array( particle_count * 3 );

    var color;

    for( var v = 0; v < particle_count; v++ ) {

        values_size[ v ] = particle_size;

        positions[ v * 3 + 0 ] = ( Math.random() * accd - accdh ) * WIDTH;
        positions[ v * 3 + 1 ] = ( Math.random() * accd - accdh ) * HEIGHT;
        positions[ v * 3 + 2 ] = 0; // z is fixed

        color = colors[ v % colors.length ];

        values_color[ v * 3 + 0 ] = color.r;
        values_color[ v * 3 + 1 ] = color.g;
        values_color[ v * 3 + 2 ] = color.b;

        velocities[ v * 3 + 0 ] = 0;
        velocities[ v * 3 + 1 ] = 0;
        velocities[ v * 3 + 2 ] = 0; // z is fixed

    }

    particle_geometry.addAttribute( 'position'     , new THREE.BufferAttribute( positions     , 3 ) );
    particle_geometry.addAttribute( 'customColor'  , new THREE.BufferAttribute( values_color  , 3 ) );
    particle_geometry.addAttribute( 'size'         , new THREE.BufferAttribute( values_size   , 1 ) );
    particle_geometry.addAttribute( 'velocity'     , new THREE.BufferAttribute( velocities    , 3 ) );

    size  = particle_geometry.attributes.size.array;
    vel   = particle_geometry.attributes.velocity.array;
    pos   = particle_geometry.attributes.position.array;

    particle_system = new THREE.PointCloud( particle_geometry, particle_material );

    particle_system.sortParticles = true;

    function update() {

        var i;
        var new_accel;

        for( i = particle_count - 1; i >= 0; i-- ) {

            i30 = i * 3;
            i31 = i30+ 1;

            // size[ i ] = particle_size * ( 2 + Math.sin( 0.1 * i + time ) );

            // TODO add accel toward users here!
            new_accel = accel( [10,10] , [pos[i30], pos[i31]]);

            // Add acc to vel
            vel[i30] = vel[i30] + new_accel[0];
            vel[i31] = vel[i31] + new_accel[1];

            // Add vel to pos
            pos[i30] += vel[i30];
            pos[i31] += vel[i31];

        }

        // particle_geometry.attributes.size.needsUpdate = true;
        particle_geometry.attributes.position.needsUpdate = true;
        particle_geometry.attributes.velocity.needsUpdate = true;
    }

    return {
        system: particle_system,
        update: update,
    };
}

define(deps, main);

})(window);
