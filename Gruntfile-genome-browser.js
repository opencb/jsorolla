module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        def: {
            name: 'genome-browser',
            build: 'build/<%= pkg.version %>/<%= def.name %>',
            vendorbuild: '<%= def.build %>/vendor'
        },
        concat: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("mmmm dd, yyyy HH:MM:ss") %> */\n'
            },
            dist: {
                src: [
                    //lib must exists
                    'build/<%= pkg.version %>/lib.js',

                    'src/genome-browser/navigation-bar.js',
                    'src/genome-browser/chromosome-panel.js',
                    'src/genome-browser/karyotype-panel.js',
                    'src/genome-browser/status-bar.js',

                    'src/genome-browser/tracks/tracklist-panel.js',
                    'src/genome-browser/tracks/track.js',
                    'src/genome-browser/tracks/*-track.js',

                    'src/genome-browser/renderers/renderer.js',
                    'src/genome-browser/renderers/*-renderer.js',


                    'src/genome-browser/genome-viewer.js'

                ],
                dest: '<%= def.build %>/<%= def.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("mmmm dd, yyyy HH:MM:ss") %> */\n'
            },
            dist: {
                files: {
                    '<%= def.build %>/<%= def.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        copy: {
            dist: {
                files: [

                    {   expand: true, cwd: './bower_components', src: ['underscore/underscore-min.js'], dest: '<%= def.vendorbuild %>' },
                    {   expand: true, cwd: './bower_components', src: ['backbone/backbone.js'], dest: '<%= def.vendorbuild %>' },
                    {   expand: true, cwd: './bower_components', src: ['fontawesome/**'], dest: '<%= def.vendorbuild %>' },
                    {   expand: true, cwd: './bower_components', src: ['jquery/dist/jquery.min.js'], dest: '<%= def.vendorbuild %>' },
                    {   expand: true, cwd: './bower_components', src: ['qtip2/jquery.qtip.min.css'], dest: '<%= def.vendorbuild %>' },
                    {   expand: true, cwd: './bower_components', src: ['qtip2/jquery.qtip.min.js'], dest: '<%= def.vendorbuild %>' },
                    {   expand: true, cwd: './bower_components', src: ['uri.js/src/URI.min.js'], dest: '<%= def.vendorbuild %>' },
                    {   expand: true, cwd: './', src: ['styles/**'], dest: '<%= def.build %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd: './src/<%= def.name %>/', src: ['gv-config.js'], dest: '<%= def.build %>/' }
                ]
            }
        },

        clean: {
            dist: ['<%= def.build %>/']
        },
        processhtml: {
            options: {
                strip: true
            },
            dist: {
                files: {
                    '<%= def.build %>/index.html': ['src/<%= def.name %>/<%= def.name %>.html']
                }
            }
        },
        hub: {
            lib: {
                src: ['Gruntfile-lib.js'],
                tasks: ['default']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-hub');

    grunt.registerTask('default', ['hub:lib', 'clean', 'concat', 'uglify', 'copy', 'processhtml']);
    grunt.registerTask('no-dep', ['clean', 'concat', 'uglify', 'copy', 'processhtml']);
};
