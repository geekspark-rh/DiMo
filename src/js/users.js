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
    'text!shaders/user.frag',
    'glmatrix',
];

function main(
    THREE,
    viewport,
    origin,
    accel,
    colors,
    vert,
    frag,
    m
) {

    var WIDTH  = viewport.WIDTH;
    var HEIGHT = viewport.HEIGHT;

    var i30    = 0;
    var i31    = 1;

    var MAX_VEL = 4;

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

    var particle_geometry;
    var particle_system;
    var particle_colors;

    var particle_count = 3;
    var particle_size = 50;
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

    var positions     = new Float32Array( particle_count * 3 );
    var prevpositions = new Float32Array( particle_count * 3 );
    var values_color  = new Float32Array( particle_count * 3 );
    var values_size   = new Float32Array( particle_count );
    var velocities    = new Float32Array( particle_count * 3 );
    var color;

    for( var v = 0; v < particle_count; v++ ) {

        values_size[ v ] = particle_size;

        positions[ v * 3 + 0 ] = ( Math.random() * accd - accdh ) * WIDTH;
        positions[ v * 3 + 1 ] = ( Math.random() * accd - accdh ) * HEIGHT;
        positions[ v * 3 + 2 ] = 10; // z is fixed

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

    var INPUT_RES = [640,480];
    var INPUT_RES_H = [ INPUT_RES[0] / 2, INPUT_RES[1] / 2];
    function handle_ws_message(message) {
        input = JSON.parse(message.data);
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
    function update() {

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
        particle_geometry.attributes.position.needsUpdate = true;
        particle_geometry.attributes.velocity.needsUpdate = true;
    }

    return {
        system    : particle_system,
        update    : update,
        positions : particle_system.geometry.attributes.position.array,
        count     : particle_count,
    };
}

define(deps, main);

})(window);
