/* global define */
/* jshint browser: true */

(function (global) {

var deps = [];

function main() {
    return {
        "preset": "Default",
        "closed": false,
        "remembered": {
            "Default": {
                "0": {},
                "1": {}
            },
            "Fire": {
                "0": {},
                "1": {
                    "count": 10000,
                    "MAX_VEL": 4,
                    "MIN_ACCEL_DIST": 44,
                    "size": 20
                },
                "2": {
                    "color0": {
                        "r": 1,
                        "g": 0.9999999999999998,
                        "b": 0
                    },
                    "color1": {
                        "r": 1,
                        "g": 0.5294117647058825,
                        "b": 0
                    },
                    "color2": {
                        "r": 1,
                        "g": 0,
                        "b": 0
                    }
                }
            }
        },
        "folders": {
            "Gravity": {
                "preset": "Default",
                "closed": false,
                "folders": {}
            },
            "players": {
                "preset": "Default",
                "closed": false,
                "folders": {}
            },
            "Particles": {
                "preset": "Default",
                "closed": false,
                "folders": {}
            }
        }
    }
}

define(deps, main);

})(window);
