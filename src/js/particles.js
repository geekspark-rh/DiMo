/* global define */
/* jshint browser: true */

(function () {

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

    function get_random_mass(s) {
        // get random mass based on s, a scale factor
        return Math.random() * (s) + (1 - s);
    }

    var P = {};

    var i30    = 0;
    var i31    = 1;

    P.MAX_VEL = 4;
    P.count   = 1e4;
    P.size    = 16;

    // adjust size to match screen size
    P.size = P.size/1500 * vp.WIDTH;

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
        velocity     : { type : 'v3', value : null },
        accel_mag    : { type : 'v',  value : null },
        vel_mag      : { type : 'v',  value : null },
    };

    P.uniforms = {
        color     : { type : 'c', value : new THREE.Color( 0xffffff ) },
        texture   : { type : 't', value : THREE.ImageUtils.loadTexture( 'img/particle-wide-glow.png' ) },
        max_vel   : { type : 'f', value : P.MAX_VEL },
        max_accel : { type : 'f', value : grav.MAX_ACCEL },
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
    P.velocities = new Float32Array( P.count * 3 );
    P.sizes      = new Float32Array( P.count );
    P.mass       = new Float32Array( P.count );
    P.accel_mag  = new Float32Array( P.count );
    P.vel_mag    = new Float32Array( P.count );

    var color;

    for (var v = P.count - 1; v >= 0; v--) {

        P.sizes[ v ] = P.size;

        P.positions[ v * 3 + 0 ] = ( Math.random() * accd - accdh ) * vp.WIDTH;
        P.positions[ v * 3 + 1 ] = ( Math.random() * accd - accdh ) * vp.HEIGHT;
        P.positions[ v * 3 + 2 ] = 0; // z is fixed

        color = colors[ v % colors.length ];

        P.colors[ v * 3 + 0 ] = color.r;
        P.colors[ v * 3 + 1 ] = color.g;
        P.colors[ v * 3 + 2 ] = color.b;

        P.mass[ v ] = get_random_mass(grav.RANDOM_VARIANCE);

        P.velocities[ v * 3 + 0 ] = P.positions[ v * 3 + 0] / vp.WIDTH;//( Math.random() * accd - accdh ) * vp.WIDTH;
        P.velocities[ v * 3 + 1 ] = P.positions[ v * 3 + 1] / vp.HEIGHT;//( Math.random() * accd - accdh ) * vp.WIDTH;
        // These two are semi-circular initial orbit
        // P.velocities[ v * 3 + 0 ] = P.positions[v*3] * P.positions[v*3]/Math.abs(P.positions[v*3]) *P.positions[v*3+1]/Math.abs(P.positions[v*3+1]);//P.positions[ v * 3 + 0] / vp.WIDTH;
        // P.velocities[ v * 3 + 1 ] = -1*P.positions[v*3+1] * P.positions[v*3]/Math.abs(P.positions[v*3]) *P.positions[v*3+1]/Math.abs(P.positions[v*3+1]);//P.positions[ v * 3 + 0] / vp.WIDTH;
        P.velocities[ v * 3 + 2 ] = 0; // z is fixed

    }

    P.geometry.addAttribute( 'position'    , new THREE.BufferAttribute( P.positions  , 3 ) );
    P.geometry.addAttribute( 'customColor' , new THREE.BufferAttribute( P.colors     , 3 ) );
    P.geometry.addAttribute( 'velocity'    , new THREE.BufferAttribute( P.velocities , 3 ) );
    P.geometry.addAttribute( 'size'        , new THREE.BufferAttribute( P.sizes      , 1 ) );
    P.geometry.addAttribute( 'vel_mag'     , new THREE.BufferAttribute( P.vel_mag    , 1 ) );
    P.geometry.addAttribute( 'accel_mag'   , new THREE.BufferAttribute( P.accel_mag  , 1 ) );

    var vel   = P.geometry.attributes.velocity.array;
    var pos   = P.geometry.attributes.position.array;

    P.system = new THREE.PointCloud( P.geometry, P.material );
    P.system.sortParticles = true;

    var new_accel = new Float32Array(2);
    var users_accel;
    var dist = m.vec2.create();

    P.MIN_ACCEL_DIST = 44; // if a particle is closer than MIN_ACCEL_DIST to a user, don't run acceleration (prevents bunching)

    var new_v = m.vec2.create();

    var i;
    var vec_l;
    P.update = function () {


        for( i = P.count - 1; i >= 0; i-- ) {

            i30 = i * 3;
            i31 = i30+ 1;

            // size[ i ] = particle_size * ( 2 + Math.sin( 0.1 * i + time ) );

            m.vec2.set(new_accel, 0, 0);

            // get accel towards player 1
            m.vec2.set(dist, pos[i30]-users.positions[0], pos[i31]-users.positions[1]);
            // users_accel = m.vec2.length(dist) > P.MIN_ACCEL_DIST ? grav.accel( users.positions[0], users.positions[1], pos[i30], pos[i31], P.mass[i]) : NO_ACCEL;
            users_accel = grav.accel( users.positions[0], users.positions[1], pos[i30], pos[i31], P.mass[i]);
            if (m.vec2.length(dist) < P.MIN_ACCEL_DIST) {
                m.vec2.scale(users_accel, users_accel, -1);
            }
            m.vec2.add(new_accel, new_accel, users_accel);

            // get accel towards player 2
            m.vec2.set(dist, pos[i30]-users.positions[3], pos[i31]-users.positions[4]);
            // users_accel = m.vec2.length(dist) > P.MIN_ACCEL_DIST ? grav.accel( users.positions[3], users.positions[4], pos[i30], pos[i31], P.mass[i]) : NO_ACCEL;
            users_accel = grav.accel( users.positions[3], users.positions[4], pos[i30], pos[i31], P.mass[i]);
            if (m.vec2.length(dist) < P.MIN_ACCEL_DIST) {
                m.vec2.scale(users_accel, users_accel, -1);
            }
            m.vec2.add(new_accel, new_accel, users_accel);

            // get accel towards player 3
            m.vec2.set(dist, pos[i30]-users.positions[6], pos[i31]-users.positions[7]);
            // users_accel = m.vec2.length(dist) > P.MIN_ACCEL_DIST ? grav.accel( users.positions[6], users.positions[7], pos[i30], pos[i31], P.mass[i]) : NO_ACCEL;
            users_accel = grav.accel( users.positions[6], users.positions[7], pos[i30], pos[i31], P.mass[i]);
            if (m.vec2.length(dist) < P.MIN_ACCEL_DIST) {
                m.vec2.scale(users_accel, users_accel, -1);
            }
            m.vec2.add(new_accel, new_accel, users_accel);

            // Add acc to vel
            vel[i30] += new_accel[0];
            vel[i31] += new_accel[1];

            m.vec2.set(new_v, vel[i30], vel[i31]);
            vec_l = m.vec2.length(new_v);
            // Clamp velocity if it gets too fast
            if( vec_l > P.MAX_VEL ) {
                m.vec2.scale(new_v, new_v, P.MAX_VEL/vec_l);
                vel[i30] = new_v[0];
                vel[i31] = new_v[1];
            }

            P.vel_mag[i] = m.vec2.length(new_v);
            P.accel_mag[i] = m.vec2.length(new_accel);

            // Add vel to pos
            pos[i30] += vel[i30];
            pos[i31] += vel[i31];

        }

        P.geometry.attributes.vel_mag.needsUpdate = true;
        P.geometry.attributes.accel_mag.needsUpdate = true;
        P.geometry.attributes.position.needsUpdate = true;
        P.geometry.attributes.velocity.needsUpdate = true;
    };

    // Count currently can't exceed the initial count
    P.set_count = function(s) {
        var i;
        for (i = P.colors.length - 1; i >= s; i -= 1){
            P.colors[i] = 0;
        }
        P.count = s;
        P.geometry.attributes.customColor.needsUpdate = true;
    };

    P.set_size = function(s) {
        var i;
        for (i = P.sizes.length - 1; i >= 0; i -= 1){
            P.sizes[i] = s;
        }
        P.geometry.attributes.size.needsUpdate = true;
    };

    P.set_mass_variance = function(s) {
        var i;
        for (i = P.mass.length - 1; i >= 0; i -= 1){
            P.mass[ i ] = get_random_mass(s);
        }
    };

    return P;
}

define(deps, main);

})();

