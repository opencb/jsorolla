module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        def: {
            name: 'genome-viewer',
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

                    'src/genome-viewer/navigation-bar.js',
                    'src/genome-viewer/chromosome-panel.js',
                    'src/genome-viewer/karyotype-panel.js',
                    'src/genome-viewer/status-bar.js',

                    'src/genome-viewer/tracks/tracklist-panel.js',
                    'src/genome-viewer/tracks/track.js',
                    'src/genome-viewer/tracks/*-track.js',

                    'src/genome-viewer/renderers/renderer.js',
                    'src/genome-viewer/renderers/*-renderer.js',


                    'src/genome-viewer/genome-viewer.js'

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
                    {   expand: true, cwd: './src/<%= def.name %>/', src: ['gv-config.js'], dest: '<%= def.build %>/' }
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
                            '<%= def.build %>/vendor/jquery.qtip*.css',
                            '<%= def.build %>/vendor/ChemDoodleWeb*.css',
                            '<%= def.build %>/vendor/bootstrap-*-dist/css/bootstrap.min.css',
                            '<%= def.build %>/vendor/typeahead.js-bootstrap.css'
                        ],
                        'css': ['<%= def.build %>/styles/css/style.css']
                    },
                    scripts: {
                        'vendor': [
                            '<%= def.build %>/vendor/underscore*.js',
                            '<%= def.build %>/vendor/backbone*.js',
                            '<%= def.build %>/vendor/rawdeflate*.js',
                            '<%= def.build %>/vendor/jquery.min.js',

                            '<%= def.build %>/vendor/bootstrap-scoped-dist/js/bootstrap.min.js',
                            '<%= def.build %>/vendor/typeahead.min.js',
                            '<%= def.build %>/vendor/jquery.qtip*.js',
                            '<%= def.build %>/vendor/jquery.cookie*.js',
                            '<%= def.build %>/vendor/jquery.sha1*.js',
                            '<%= def.build %>/vendor/purl*.js',
                            '<%= def.build %>/vendor/jquery.mousewheel*.js',
                            '<%= def.build %>/vendor/gl-matrix-min*.js',
                            '<%= def.build %>/vendor/ChemDoodleWeb*.js'
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

    grunt.registerTask('default', ['hub:lib','clean', 'concat', 'uglify', 'copy', 'htmlbuild', 'rename']);
    grunt.registerTask('no-dep', ['clean', 'concat', 'uglify', 'copy', 'htmlbuild', 'rename']);
};
