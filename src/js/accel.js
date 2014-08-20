/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'glmatrix',
];

function main(m) {

    var p1x;
    var p1y;
    var p2x;
    var p2y;
    var r;
    var nv; // normalization divisor
    var xd, yd; // diffs
    var ux, uy; // unit vector x
    var ax, ay; // accel values
    var g = -9.81;

    var p1v  = m.vec2.create();
    var p2v  = m.vec2.create();
    var ov   = m.vec2.create(); // out vector
    var mass = 4;
    function glaccel(p1, p2) {
        m.vec2.set(p1v, p1[0], p1[1]);
        m.vec2.set(p2v, p2[0], p2[1]);
        r = Math.pow(m.vec2.distance(p1v, p2v), 2);
        m.vec2.subtract(ov, p2v, p1v);
        m.vec2.normalize(ov, ov);
        m.vec2.scale(ov, ov, mass*g/r);
        return ov;
    }
    // function getAcceleration(p1, p2) {
    //     // this version is slow because it creates 8 vector objects... for EACH
    //     // particle+player pair, for each frame,
    //     // so, 8 * particle count * player count bector objects each frame.
    //     // that's a looooooot
    //     var n = g;
    //     var r_sqrd = 2 * p2.distanceTo(p1);
    //     var u = p2.clone()
    //     .sub(p1)
    //     .normalize()
    //     .multiply( new THREE.Vector3( n, n, 0 ) )
    //     .divideScalar(r_sqrd)
    //     .clampScalar(-MAX_VEL, MAX_VEL);
    //     return u;
    // }

    var MAX_ACCEL = 10;

    var xd2, yd2;
    function accel(p1, p2) {
        // these calculations are done by hand because it's faster in my tests
        // than using any library functions :(

        p1x = p1[0];
        p1y = p1[1];
        p2x = p2[0];
        p2y = p2[1];

        xd = p2x - p1x;
        yd = p2y - p1y;

        xd2 = Math.pow( xd, 2 );
        yd2 = Math.pow( yd, 2 );
        r = xd2 + yd2;

        nv = Math.sqrt(r);

        ux = xd / nv;
        uy = yd / nv;

        ax = mass * g * ux / r;
        ay = mass * g * uy / r;

        return [ax, ay];

    }

    return accel;
}

define(deps, main);

})(window);


