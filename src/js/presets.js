/* global define */
/* jshint browser: true */

(function (global) {

var deps = [];

function main() {
    return {
        "preset": "RGB",
        "closed": true,
        "remembered": {
            "Default": {
                "0": {},
                "1": {}
            },
            "Fire": {
                "0": {},
                "1": {
                    "MAX_VEL": 4,
                    "MIN_ACCEL_DIST": 44,
                    "size": 16
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
            },
            "RGB": {
                "0": {},
                "1": {
                    "MAX_VEL": 4,
                    "MIN_ACCEL_DIST": 44,
                    "size": 16
                },
                "2": {
                    "color0": {
                        "r": 1,
                        "g": 0,
                        "b": 0
                    },
                    "color1": {
                        "r": 0,
                        "g": 1,
                        "b": 0
                    },
                    "color2": {
                        "r": 0,
                        "g": 0.5,
                        "b": 1
                    }
                }
            },
            "Stars": {
                "0": {},
                "1": {
                    "MAX_VEL": 2.9998276753403412,
                    "MIN_ACCEL_DIST": 28.67482336722385,
                    "size": 16
                },
                "2": {
                    "color0": {
                        "r": 0.9509803921568627,
                        "g": 0.9509803921568627,
                        "b": 0.8204536716647444
                    },
                    "color1": {
                        "r": 0.9117647058823529,
                        "g": 0.9001967569034534,
                        "b": 0.7151095732410611
                    },
                    "color2": {
                        "r": 0.9117647058823529,
                        "g": 0.8686478051428185,
                        "b": 0.5452710495963091
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
