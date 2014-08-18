/* global module */

module.exports = function(grunt) {

    var DEBUG_ON = !!grunt.option('dev');

    if (DEBUG_ON) {
        grunt.log.writeln('JS/CSS minification is off.  If you wish to enable minification, run grunt without --dev');
    } else {
        grunt.log.writeln('JS/CSS minification is on.  If you wish to disable minification, run grunt with --dev');
    }

    var default_tasks = [];

    default_tasks.push('copy');
    default_tasks.push('sass');

    if (!DEBUG_ON) {
        default_tasks.push('uglify');
        default_tasks.push('cssmin');
    }

    /*******************
     *  WATCH OPTIONS  *
     *******************/

    var watch_options = {
        scripts: {
            files:  ['src/**/*', 'Gruntfile.js', 'package.json'],
            tasks: default_tasks,
            options: {
                atBegin: true
            }
        }
    };

    /******************
     *  COPY OPTIONS  *
     ******************/

    var copy_options = {
        main: {
            files: [{
                expand: true,
                cwd: 'src/',
                src: ['**/*'],
                dest: 'build/',
                filter: 'isFile'
                // filter: function non_compiled_files (path) {
                //     return !/(.scss|.js$)/.test(path);
                // }
            }, { // make sure app.js gets copied to app.min.js even when --dev
                 // is on
                src: 'src/js/main.js',
                dest: 'build/js/main.min.js'
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
                'build/css/app.min.css': 'src/css/app.scss'
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
                    'src/js/*'
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
