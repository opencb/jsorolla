module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        def: {
            name: 'threed-viewer',
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

                    'src/threed-viewer/js/chr.js',
                    'src/threed-viewer/js/3D.js',
                    'src/threed-viewer/js/torus.js',
                    'src/threed-viewer/js/main.js',

                    'src/threed-viewer/threed-viewer.js'
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
                    {   expand: true, cwd: './', src: ['vendor/**'], dest: '<%= def.build %>/' },
                    {   expand: true, cwd: './', src: ['styles/**'], dest: '<%= def.build %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd: './src/<%= def.name %>/', src: ['threedv-config.js'], dest: '<%= def.build %>/' },
                    {   expand: true, cwd: './src/<%= def.name %>/', src: ['glsl/**'], dest: '<%= def.build %>/' }
                ]
            }
        },

        clean: {
            dist: ['<%= def.build %>/']
        },

        htmlbuild: {
            dist: {
                src: 'src/<%= def.name %>/<%= def.name %>.html',
                dest: '<%= def.build %>/',
                options: {
                    beautify: true,
                    styles: {
                        'vendor': [

                        ],
                        'css': ['<%= def.build %>/styles/css/style.css']
                    },
                    scripts: {
                        'vendor': [
                            '<%= def.build %>/vendor/underscore*.js',
                            '<%= def.build %>/vendor/backbone*.js',
                            '<%= def.build %>/vendor/jquery.min.js',

//                            '<%= def.build %>/vendor/core/embed.js',

                            '<%= def.build %>/vendor/three.js',
                            '<%= def.build %>/vendor/Stats.js',
                            '<%= def.build %>/vendor/RequestAnimationFrame.js',
                        ],
                        'js': '<%= def.build %>/<%= def.name %>.min.js'
                    }
                }
            }
        },
        rename: {
            dist: {
                files: [
                    {
                        src: ['<%= def.build %>/<%= def.name %>.html'],
                        dest: '<%= def.build %>/index.html'
                    }
                ]
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
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-hub');

    grunt.registerTask('vendor', ['curl-dir']);

    grunt.registerTask('default', ['hub:lib', 'clean', 'concat', 'uglify', 'copy', 'htmlbuild', 'rename']);
    grunt.registerTask('no-dep', ['clean', 'concat', 'uglify', 'copy', 'htmlbuild', 'rename']);
};
