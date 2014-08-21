/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'three',
    'dimo/viewport',
    'dimo/origin',
    'dimo/gravity',
    'dimo/colors',
    'dimo/users',
    'text!shaders/vertex.vert',
    'text!shaders/particle.frag',
    'glmatrix',
];

function main(
    THREE,
    vp,
    origin,
    grav,
    colors,
    users,
    vert,
    frag,
    m
) {

    var P = {};

    var i30    = 0;
    var i31    = 1;

    P.MAX_VEL      = 5;
    P.count        = 1e5;
    P.size = 1;

    var accd  = 1.75; // how much the acceleration is allowed to change each frame
    var accdh = accd / 2;

    P.geometry = new THREE.BufferGeometry();

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

    P.uniforms = {
        color:     { type: "c", value: new THREE.Color( 0xffffff ) },
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/box.png" ) }
    };

    P.material = new THREE.ShaderMaterial( {

        uniforms       : P.uniforms,
        attributes     : attributes,
        vertexShader   : vert,
        fragmentShader : frag,
        blending       : THREE.AdditiveBlending,
        depthTest      : false,
        transparent    : true

    } );

    P.positions  = new Float32Array( P.count * 3 );
    P.colors     = new Float32Array( P.count * 3 );
    P.sizes      = new Float32Array( P.count );
    P.velocities = new Float32Array( P.count * 3 );

    var color;

    for( var v = 0; v < P.count; v++ ) {

        P.sizes[ v ] = P.size;

        P.positions[ v * 3 + 0 ] = ( Math.random() * accd - accdh ) * vp.WIDTH;
        P.positions[ v * 3 + 1 ] = ( Math.random() * accd - accdh ) * vp.HEIGHT;
        P.positions[ v * 3 + 2 ] = 0; // z is fixed

        color = colors[ v % colors.length ];

        P.colors[ v * 3 + 0 ] = color.r;
        P.colors[ v * 3 + 1 ] = color.g;
        P.colors[ v * 3 + 2 ] = color.b;

        P.velocities[ v * 3 + 0 ] = 0;
        P.velocities[ v * 3 + 1 ] = 0;
        P.velocities[ v * 3 + 2 ] = 0; // z is fixed

    }

    P.geometry.addAttribute( 'position'     , new THREE.BufferAttribute( P.positions     , 3 ) );
    P.geometry.addAttribute( 'customColor'  , new THREE.BufferAttribute( P.colors  , 3 ) );
    P.geometry.addAttribute( 'size'         , new THREE.BufferAttribute( P.sizes   , 1 ) );
    P.geometry.addAttribute( 'velocity'     , new THREE.BufferAttribute( P.velocities    , 3 ) );

    var vel   = P.geometry.attributes.velocity.array;
    var pos   = P.geometry.attributes.position.array;

    P.system = new THREE.PointCloud( P.geometry, P.material );
    P.system.sortParticles = true;

    var new_accel = new Float32Array(2);
    var users_accel;
    var dist;

    P.MIN_ACCEL_DIST = 22; // if a particle is closer than MIN_ACCEL_DIST to a user, don't run acceleration (prevents bunching)
    P.MAX_ACCEL_DIST = Infinity;

    var NO_ACCEL = new Float32Array(2);

    var new_v = new Float32Array(2);

    P.update = function () {

        var i;
        var user_accel;
        var vec_l;

        for( i = P.count - 1; i >= 0; i-- ) {

            i30 = i * 3;
            i31 = i30+ 1;

            // size[ i ] = particle_size * ( 2 + Math.sin( 0.1 * i + time ) );

            new_accel[0] = 0;
            new_accel[1] = 0;

            // get accel towards player 1
            dist         = Math.sqrt(Math.pow(pos[i30]-users.positions[0],2) + Math.pow(pos[i31]-users.positions[1],2));
            users_accel  = dist > P.MIN_ACCEL_DIST && dist < P.MAX_ACCEL_DIST ? grav.accel( [ users.positions[0], users.positions[1]], [pos[i30], pos[i31]]) : NO_ACCEL;
            new_accel[0] += users_accel[0];
            new_accel[1] += users_accel[1];

            // get accel towards player 2
            dist         = Math.sqrt(Math.pow(pos[i30]-users.positions[3],2) + Math.pow(pos[i31]-users.positions[4],2));
            users_accel  = dist > P.MIN_ACCEL_DIST && dist < P.MAX_ACCEL_DIST ? grav.accel( [ users.positions[3], users.positions[4]], [pos[i30], pos[i31]]) : NO_ACCEL;
            new_accel[0] += users_accel[0];
            new_accel[1] += users_accel[1];

            // get accel towards player 3
            dist         = Math.sqrt(Math.pow(pos[i30]-users.positions[6],2) + Math.pow(pos[i31]-users.positions[7],2));
            users_accel  = dist > P.MIN_ACCEL_DIST && dist < P.MAX_ACCEL_DIST ? grav.accel( [ users.positions[6], users.positions[7]], [pos[i30], pos[i31]]) : NO_ACCEL;
            new_accel[0] += users_accel[0];
            new_accel[1] += users_accel[1];

            // Add acc to vel
            vel[i30] = vel[i30] + new_accel[0];
            vel[i31] = vel[i31] + new_accel[1];

            new_v[0] = vel[i30];
            new_v[1] = vel[i31];
            vec_l = m.vec2.length(new_v);
            // Clamp velocity if it gets too fast
            if( m.vec2.length( new_v ) > P.MAX_VEL ) {
                m.vec2.scale(new_v, new_v, P.MAX_VEL/vec_l);
                vel[i30] = new_v[0];
                vel[i31] = new_v[1];
            }

            // Add vel to pos
            pos[i30] += vel[i30];
            pos[i31] += vel[i31];

        }

        P.geometry.attributes.position.needsUpdate = true;
        P.geometry.attributes.velocity.needsUpdate = true;
    };

    P.set_size = function(s) {
        var i;
        for (i = P.sizes.length - 1; i >= 0; i -= 1){
            P.sizes[i] = s;
        }
        P.geometry.attributes.size.needsUpdate = true;
    };

    return P;
}

define(deps, main);

})(window);

