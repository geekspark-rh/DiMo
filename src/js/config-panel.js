/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'dimo/particles',
    'dimo/users',
    'dimo/gravity',
    'datgui',
];

function main(
    particles,
    users,
    gravity,
    dat
) {

    var gui = new dat.GUI();

    // Gravity

    var grav_folder = gui.addFolder('Gravity');
    grav_folder.add(gravity, 'MAX_ACCEL', 0, 100).step(1);
    grav_folder.add(gravity, 'RANDOM_VARIANCE', 0, 1)
        .step(0.01)
        .onChange(function (value) {
            particles.set_mass_variance(value);
        });

    // Users

    var users_folder = gui.addFolder('Users');

    users_folder.add(users, 'smoothing', 0, 1).step(0.1);
    users_folder.add(users, 'size', 0, 500)
        .onChange(function (value) {
            users.set_size(value);
        });

    // Particles

    var particles_folder = gui.addFolder('Particles');

    particles_folder.add(particles, 'count', 0, particles.count)
        .step(1000)
        .onChange(function (value) {
            particles.set_count(value);
        });
    particles_folder.add(particles, 'MAX_VEL', 0, 20);
    particles_folder.add(particles, 'MIN_ACCEL_DIST', 0, 1000);
    particles_folder.add(particles, 'size', 0, 40)
        .onChange(function (value) {
            particles.set_size(value);
        });

    grav_folder.open();
    users_folder.open();
    particles_folder.open();

    gui.remember(gravity);
    gui.remember(particles);

    return gui;

}

define(deps, main);

})(window);
