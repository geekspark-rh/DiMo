/* global define */
/* jshint browser: true */

(function (global) {

var deps = [];

function main() {
    var config = {
        MAX_ACCEL               : 10,
        RANDOM_GRAVITY_VARIANCE : 0.2,
        G                       : -9.81*1e3,
    };

    return config;
}

define(deps, main);

})(window);
