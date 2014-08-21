/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'three',
    'dimo/viewport',
    'dimo/origin',
    'dimo/gravity',
    'dimo/colors',
    'text!shaders/vertex.vert',
    'text!shaders/user.frag',
    'glmatrix',
];

function main(
    THREE,
    viewport,
    origin,
    grav,
    colors,
    vert,
    frag,
    m
) {

    var U = {};

    var WIDTH  = viewport.WIDTH;
    var HEIGHT = viewport.HEIGHT;

    var i30    = 0;
    var i31    = 1;

    var size;
    var vel;
    var pos;

    // this is the placeholder for velocity input that will come from websocket
    // connection to the dimo server
    var input = {
        red: {x:0,y:0},
        green: {x:0,y:0},
        blue: {x:0,y:0},
    };

    U.geometry;
    U.system;
    U.colors;

    var particle_count = 3;
    U.size = 50;

    var accd  = 0.50; // how much the acceleration is allowed to change each frame
    var accdh = accd / 2;

    U.geometry = new THREE.BufferGeometry();

    U.colors   = [];

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
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/particle.png" ) }
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

    U.positions     = new Float32Array( particle_count * 3 );
    var prevpositions = new Float32Array( particle_count * 3 );
    var values_color  = new Float32Array( particle_count * 3 );
    var values_size   = new Float32Array( particle_count );
    var velocities    = new Float32Array( particle_count * 3 );
    var color;

    for( var v = 0; v < particle_count; v++ ) {

        values_size[ v ] = U.size;

        U.positions[ v * 3 + 0 ] = ( Math.random() * accd - accdh ) * WIDTH;
        U.positions[ v * 3 + 1 ] = ( Math.random() * accd - accdh ) * HEIGHT;
        U.positions[ v * 3 + 2 ] = 10; // z is fixed

        color = colors[ v % colors.length ];

        values_color[ v * 3 + 0 ] = color.r;
        values_color[ v * 3 + 1 ] = color.g;
        values_color[ v * 3 + 2 ] = color.b;

        velocities[ v * 3 + 0 ] = 0;
        velocities[ v * 3 + 1 ] = 0;
        velocities[ v * 3 + 2 ] = 0; // z is fixed

    }

    U.geometry.addAttribute( 'position'     , new THREE.BufferAttribute( U.positions     , 3 ) );
    U.geometry.addAttribute( 'customColor'  , new THREE.BufferAttribute( values_color  , 3 ) );
    U.geometry.addAttribute( 'size'         , new THREE.BufferAttribute( values_size   , 1 ) );
    U.geometry.addAttribute( 'velocity'     , new THREE.BufferAttribute( velocities    , 3 ) );

    size  = U.geometry.attributes.size.array;
    vel   = U.geometry.attributes.velocity.array;
    pos   = U.geometry.attributes.position.array;

    U.system = new THREE.PointCloud( U.geometry, particle_material );

    U.system.sortParticles = true;

    var INPUT_RES;
    var INPUT_RES_H;

    function handle_ws_message(message) {
        input = JSON.parse(message.data);
        if (!INPUT_RES) {
            INPUT_RES = [input.w, input.h];
            INPUT_RES_H = [ INPUT_RES[0] / 2, INPUT_RES[1] / 2];
            console.log("Set INPUT_RES: " + INPUT_RES);
        }
        input.red.x   = (input.red.x   - INPUT_RES_H[0]) * 1.75 * WIDTH  / INPUT_RES[0];
        input.red.y   = (input.red.y   - INPUT_RES_H[1]) * 1.75 * HEIGHT / INPUT_RES[1];
        input.green.x = (input.green.x - INPUT_RES_H[0]) * 1.75 * WIDTH  / INPUT_RES[0];
        input.green.y = (input.green.y - INPUT_RES_H[1]) * 1.75 * HEIGHT / INPUT_RES[1];
        input.blue.x  = (input.blue.x  - INPUT_RES_H[0]) * 1.75 * WIDTH  / INPUT_RES[0];
        input.blue.y  = (input.blue.y  - INPUT_RES_H[1]) * 1.75 * HEIGHT / INPUT_RES[1];
    }

    try {
        // var ip = '10.192.212.90';
        var ip = '127.0.0.1';
        var connection = new WebSocket('ws://' + ip + ':1337');
        connection.onopen = function () {
            console.log("connection established");
            // when connection opens, establish message handler
            connection.onmessage = handle_ws_message;
        };
    } catch (e) {
        console.error("Failed to create websocket connection to dimo server.");
        console.error(e);
    }

    var X_BOUND = WIDTH/1.5;
    var Y_BOUND = HEIGHT/1.5;

    var new_v;
    var i;
    var colornames = ['red', 'green', 'blue'];

    var prevx = 0, prevy = 0;
    var alpha = 0.25;
    U.update = function () {

        for( i = 0; i < particle_count; i++ ) {

            i30 = i * 3;
            i31 = i30+ 1;

            // size[ i ] = Math.sqrt(Math.pow(vel[i30],2) + Math.pow(vel[i31],2));

            // Add acc to vel
            pos[i30] = (alpha * -input[colornames[i]].x) + (1 - alpha) * prevpositions[i30];
            pos[i31] = (alpha * -input[colornames[i]].y) + (1 - alpha) * prevpositions[i31];

            prevpositions[i30] = pos[i30];
            prevpositions[i31] = pos[i31];

        }

        // particle_geometry.attributes.size.needsUpdate = true;
        U.geometry.attributes.position.needsUpdate = true;
        U.geometry.attributes.velocity.needsUpdate = true;
    }

    U.set_size = function(s) {
        var i;
        for (i = P.sizes.length - 1; i >= 0; i -= 1){
            P.sizes[i] = s;
        }
        P.geometry.attributes.size.needsUpdate = true;
    };

    return U;
}

define(deps, main);

})(window);
