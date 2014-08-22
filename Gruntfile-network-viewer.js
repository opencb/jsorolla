module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        def: {
            name: 'network-viewer',
            build: 'build/<%= pkg.version %>/<%= def.name %>'
        },
        concat: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("mmmm dd, yyyy HH:MM:ss") %> */\n'
            },
            dist: {
                src: [
                    //lib must exists
                    'build/<%= pkg.version %>/lib.js',

                    'src/network-viewer/tool-bar.js',
                    'src/network-viewer/edition-bar.js',
                    'src/network-viewer/network-svg-layout.js',

                    'src/network-viewer/network-viewer.js'

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
                    {   expand: true, cwd: './', src: ['vendor/underscore-min.js'], dest: '<%= def.build %>' },
                    {   expand: true, cwd: './', src: ['vendor/backbone-min.js'], dest: '<%= def.build %>' },
                    {   expand: true, cwd: './', src: ['vendor/font-awesome-4.1.0/**'], dest: '<%= def.build %>' },
                    {   expand: true, cwd: './', src: ['vendor/jquery.min.js'], dest: '<%= def.build %>' },
                    {   expand: true, cwd: './', src: ['vendor/d3.min.js'], dest: '<%= def.build %>' },
                    {   expand: true, cwd: './', src: ['vendor/platform.js'], dest: '<%= def.build %>' },
                    {   expand: true, cwd: './', src: ['styles/**'], dest: '<%= def.build %>' }, // includes files in path and its subdirs
                    {   expand: true, cwd: './', src: ['src/lib/components/jso-color-picker.html'], dest: '<%= def.build %>/components', flatten: true},
                    {   expand: true, cwd: './src/<%= def.name %>/', src: ['nv-config.js'], dest: '<%= def.build %>' }
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

    grunt.registerTask('vendor', ['curl-dir']);

    grunt.registerTask('default', ['hub:lib', 'clean', 'concat', 'uglify', 'copy', 'processhtml']);
    grunt.registerTask('no-dep', ['clean', 'concat', 'uglify', 'copy', 'processhtml']);
};
