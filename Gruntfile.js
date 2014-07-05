/* global module */

module.exports = function(grunt) {

    var DEBUG_ON = !!grunt.option('dev');

    grunt.log.writeln('JS/CSS minification is ' + (DEBUG_ON ? 'off' : 'on') + '.  If you wish to disable minification, run grunt with --dev');

    var default_tasks = [
        'copy',
        'sass'
    ];

    if (DEBUG_ON) {
        default_tasks.push('uglify');
        default_tasks.push('cssmin');
    }

    /*******************
     *  WATCH OPTIONS  *
     *******************/

    var watch_options = {
        tasks: default_tasks,
        files:  'src/**/*',
        grunt: {
            // auto-reload Gruntfile if it changes
            files: ['Gruntfile.js', 'package.json']
        }
    };

    /******************
     *  COPY OPTIONS  *
     ******************/

    var copy_options = {
        main: {
            files: [{
                expand: true,
                src: ['src/**/*'],
                dest: 'build/',
                filter: function non_compiled_files (path) {
                    return !/(.css$|.js$)/.test(path);
                }
            }]
        }
    };

    /******************
     *  SASS OPTIONS  *
     ******************/

    var sass_options = {
        dist: {
            options: {
                lineNumbers: true,
                precision: 20
            },
            files: {
                'build/css/app.css': 'src/css/app.scss'
            }
        }
    };

    /********************
     *  UGLIFY OPTIONS  *
     ********************/

    var uglify_options = {
        my_target: {
            files: {
                'build/js/app.min.js': [
                    'src/js/app.js',
                    'src/js/services.js',
                    'src/js/controllers.js',
                    'src/js/filters.js',
                    'src/js/directives.js',
                    'src/js/animations.js'
                ]
            }
        },
        options: {
            mangle: !DEBUG_ON,
            compress: !DEBUG_ON,
            report: DEBUG_ON,
            preserveComments: DEBUG_ON
        }
    };

    /********************
     *  CSSMIN OPTIONS  *
     ********************/

    var cssmin_options = {
        minify: {
            expand : true,
            cwd    : 'src/css/',
            src    : 'app.css',
            dest   : 'build/css/',
            ext    : '.min.css'
        },
        options: {
            report: 'gzip'
        }
    };

    grunt.initConfig({
        watch  : watch_options,
        copy   : copy_options,
        sass   : sass_options,
        uglify : uglify_options,
        cssmin : cssmin_options
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', default_tasks);
};
