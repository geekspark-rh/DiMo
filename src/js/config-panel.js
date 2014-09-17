/* global define */
/* jshint browser: true */

(function (global) {

var deps = [
    'dimo/config',
    'dimo/particles',
    'dimo/players',
    'dimo/gravity',
    'dimo/particle_colors',
    'dimo/presets',
    'datgui',
    'underscore',
];

function main(
    conf,
    particles,
    players,
    gravity,
    particle_colors,
    presets,
    dat,
    _
) {

    var gui = new dat.GUI({
        load: presets
    });

    // for some reason, revert is needed by datgui to fully instantiate all
    // values from the presets
    gui.revert(1);

    // hide it if configured to be hidden
    if (!conf.CONFIG_PANEL_VISIBLE) {
        setTimeout(function(){gui.close();}, 500);
    }

    // Gravity

    var grav_folder = gui.addFolder('Gravity');
    grav_folder.add(conf, 'MAX_ACCEL', 0.0, 2.0)
        .step(0.01)
        .listen()
        .onChange(_.partial(conf.set_value, 'MAX_ACCEL'));
    grav_folder.add(conf, 'RANDOM_GRAVITY_VARIANCE', 0, 1)
        .step(0.01)
        .onChange(particles.set_mass_variance);

    // players

    var players_folder = gui.addFolder('players');

    players_folder.add(players, 'smoothing', 0, 1)
        .step(0.1)
        .onChange(players.set_smoothing);
    players_folder.add(players, 'size', 0, 256)
        .onChange(players.set_size);

    // Particles

    var particles_folder = gui.addFolder('Particles');

    // particles_folder.add(particles, 'count', 0, particles.count)
    //     .step(1000)
    //     .onChange(function (value) {
    //         particles.set_count(value);
    //     });
    particles_folder.add(particles, 'MAX_VEL', 0, 16);
    particles_folder.add(particles, 'MIN_ACCEL_DIST', 0, 200);
    particles_folder.add(particles, 'size', 1, 64).onChange(particles.set_size);

    particles_folder.addColor(particle_colors, 'color0').onChange(particles.set_color0);
    particles_folder.addColor(particle_colors, 'color1').onChange(particles.set_color1);
    particles_folder.addColor(particle_colors, 'color2').onChange(particles.set_color2);

    grav_folder.open();
    players_folder.open();
    particles_folder.open();

    gui.remember(gravity);
    gui.remember(particles);
    gui.remember(particle_colors);

    return gui;

}

define(deps, main);

})(window);
