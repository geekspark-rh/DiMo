/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'three',
];

function main(THREE) {
    return [
        new THREE.Color().setRGB( 1, 0.1, 0.1 ),
        new THREE.Color().setRGB( 0.25, 1, 0.25 ),
        new THREE.Color().setRGB( 0.30, 0.30, 1 ),
    ];
}

define(deps, main);

})(window);
