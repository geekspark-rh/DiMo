/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'dimo/particles',
    'dimo/gravity',
    'datgui',
];

function main(
    particles,
    gravity,
    dat
) {

    var gui = new dat.GUI();

    // Gravity

    var grav_folder = gui.addFolder('Gravity');
    grav_folder.add(gravity, 'MAX_ACCEL', 0, 100).step(1);
    grav_folder.add(gravity, 'RANDOM_VARIANCE', 0, 1).step(0.01);

    // Particles

    var particles_folder = gui.addFolder('Particles');

    // particles_folder.add(particles, 'count', 0, 1e5).step(1000);
    particles_folder.add(particles, 'MIN_ACCEL_DIST', 0, 1000);
    particles_folder.add(particles, 'MAX_ACCEL_DIST', 0, 1e5).step(100);
    particles_folder.add(particles, 'size', 0, 20)
        .step(0.25)
        .onChange(function (value) {
            particles.set_size(value);
        });

    grav_folder.open();
    particles_folder.open();

    gui.remember(gravity);
    gui.remember(particles);

    return gui;

}

define(deps, main);

})(window);
