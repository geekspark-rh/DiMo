/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'dimo/config'
];

function main(conf) {
    var obj = {};
    var id;

    obj.start_timer = function start_timer() {
        id = setInterval(function () {
            conf.MAX_ACCEL += new Date().getTime()/1e14;
            conf.MAX_ACCEL %= 2;
        }, 400);
    };

    obj.stop_timer = function stop_timer() {
        clearInterval(id);
    };

    return obj;
}

define(deps, main);

})(window);
