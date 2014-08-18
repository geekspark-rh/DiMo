/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'three'
];

function main(THREE) {

    var camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 9001 );

    camera.position.z = 2750;

    return camera;

}

define(deps, main);

})(window);
