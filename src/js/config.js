/* global define */
/* jshint browser: true */

(function (global) {

var deps = [];

function main() {
    var config = {
        MAX_ACCEL               : 1,
        RANDOM_GRAVITY_VARIANCE : 0.2,
        G                       : -9.81*1e3,
        DISPLAY_STATS           : false,
    };

    config.set_value = function (name, value) {
        config[name] = value;
    };

    return config;
}

define(deps, main);

})(window);
