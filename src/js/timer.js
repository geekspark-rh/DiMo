/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'dimo/config'
];

function main(conf) {
    var obj = {};
    var id;
    var startTime = new Date().getTime();

    obj.start_timer = function start_timer() {
        id = setInterval(function () {
            var inc = Math.pow((new Date().getTime() - startTime)/100000, 2);
            console.log("incrementing by " + inc);
            conf.MAX_ACCEL += inc;
            if (conf.MAX_ACCEL > 2) {
                startTime = new Date().getTime();
            }
            conf.MAX_ACCEL %= 2;
        }, 100);
    };

    obj.stop_timer = function stop_timer() {
        clearInterval(id);
    };

    return obj;
}

define(deps, main);

})(window);
