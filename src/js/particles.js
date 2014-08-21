/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'three',
    'dimo/viewport',
    'dimo/origin',
    'dimo/accel',
    'dimo/colors',
    'dimo/users',
    'text!shaders/vertex.vert',
    'text!shaders/particle.frag',
    'glmatrix',
];

function main(
    THREE,
    viewport,
    origin,
    accel,
    colors,
    users,
    vert,
    frag,
    m
) {

    var WIDTH  = viewport.WIDTH;
    var HEIGHT = viewport.HEIGHT;

    var i30    = 0;
    var i31    = 1;

    var MAX_VEL = 5;

    var size;
    var vel;
    var pos;

    var particle_geometry;
    var particle_system;
    var particle_colors;

    var particle_count = 2e4;
    var particle_size = 1;
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

    vel   = particle_geometry.attributes.velocity.array;
    pos   = particle_geometry.attributes.position.array;

    particle_system = new THREE.PointCloud( particle_geometry, particle_material );

    particle_system.sortParticles = true;

    var new_accel = new Float32Array(2);
    var users_accel;
    var new_v;
    var dist;

    var MIN_ACCEL_DIST = 22; // if a particle is closer than MIN_ACCEL_DIST to a user, don't run acceleration, to prevent bunching
    var MAX_ACCEL_DIST = Infinity;

    var NO_ACCEL = new Float32Array(2);

    function update() {

        var i;
        var user_accel;

        for( i = particle_count - 1; i >= 0; i-- ) {

            i30 = i * 3;
            i31 = i30+ 1;

            // size[ i ] = particle_size * ( 2 + Math.sin( 0.1 * i + time ) );

            // TODO add accel toward users here!
            new_accel[0] = 0;
            new_accel[1] = 0;

            // get player 1
            dist         = Math.sqrt(Math.pow(pos[i30]-users.positions[0],2) + Math.pow(pos[i31]-users.positions[1],2));
            users_accel  = dist > MIN_ACCEL_DIST && dist < MAX_ACCEL_DIST ? accel( [ users.positions[0], users.positions[1]], [pos[i30], pos[i31]]) : NO_ACCEL;
            new_accel[0] += users_accel[0];
            new_accel[1] += users_accel[1];

            // get player 2
            dist         = Math.sqrt(Math.pow(pos[i30]-users.positions[3],2) + Math.pow(pos[i31]-users.positions[4],2));
            users_accel  = dist > MIN_ACCEL_DIST && dist < MAX_ACCEL_DIST ? accel( [ users.positions[3], users.positions[4]], [pos[i30], pos[i31]]) : NO_ACCEL;
            new_accel[0] += users_accel[0];
            new_accel[1] += users_accel[1];

            // get player 3
            dist         = Math.sqrt(Math.pow(pos[i30]-users.positions[6],2) + Math.pow(pos[i31]-users.positions[7],2));
            users_accel  = dist > MIN_ACCEL_DIST && dist < MAX_ACCEL_DIST ? accel( [ users.positions[6], users.positions[7]], [pos[i30], pos[i31]]) : NO_ACCEL;
            new_accel[0] += users_accel[0];
            new_accel[1] += users_accel[1];

            // Add acc to vel
            vel[i30] = vel[i30] + new_accel[0];
            vel[i31] = vel[i31] + new_accel[1];

            new_v = m.vec2.fromValues(vel[i30], vel[i31]);
            // Clamp velocity if it gets too fast
            if( m.vec2.length( new_v ) > MAX_VEL ) {
                m.vec2.normalize(new_v, new_v);
                m.vec2.scale(new_v, new_v, MAX_VEL);
                vel[i30] = new_v[0];
                vel[i31] = new_v[1];
            }

            // Add vel to pos
            pos[i30] += vel[i30];
            pos[i31] += vel[i31];

        }

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
