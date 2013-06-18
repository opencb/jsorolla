/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        meta: {
            version: '0.1.0',
            versiongv: '0.1.2',
            versionnv: '0.0.1'
        },
        banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* http://PROJECT_WEBSITE/\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            'YOUR_NAME; Licensed GPLv2 */\n',
        bannergv: '/*! Genome Viewer - v<%= meta.versiongv %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* http://https://github.com/opencb-bigdata-viz/js-common-libs/\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            ' ' +
            'Licensed GPLv2 */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= bannergv %>',
                stripBanners: true
            },
            gv: {
                src: [
                    /** Utils **/
                    'src/utils/event.js','src/utils/svg.js','src/utils/utils.js',
                    /** config **/
                    'src/genome-viewer/gv-config.js',
//                    'src/ui-widgets/ux-window.js',
                    /** cellbase **/
                    'src/cellbase/ui-widgets/info-widget.js','src/cellbase/ui-widgets/*-info-widget.js','src/cellbase/cellbase-manager.js',
                    /**  data-adapter **/
                    'src/genome-viewer/data-adapter/cellbase-adapter.js','src/genome-viewer/data-adapter/sequence-adapter.js',
                    /** genome viewer **/
                    'src/genome-viewer/region.js',
                    'src/genome-viewer/feature-binary-search-tree.js',
                    'src/genome-viewer/feature-cache.js',
                    'src/genome-viewer/navigation-bar.js',
                    'src/genome-viewer/chromosome-panel.js',
                    'src/genome-viewer/karyotype-panel.js',
                    'src/genome-viewer/tracklist-panel.js',
                    'src/genome-viewer/status-bar.js',
                        /** tracks **/
                    'src/genome-viewer/tracks/track.js',
                    'src/genome-viewer/tracks/*-track.js',
                        /** renderers **/
                    'src/genome-viewer/renderers/renderer.js',
                    'src/genome-viewer/renderers/*-renderer.js',
                    'src/genome-viewer/genome-viewer.js'
                ],
                dest: 'dist/genome-viewer/<%= meta.versiongv %>/genome-viewer.js'
            },
            nv:{
                src: [
                    /** Utils **/
                    'src/utils/svg.js','src/utils/utils.js',
                    /** network viewer **/
                    'src/network-viewer/tool-bar.js',
                    'src/network-viewer/network-viewer.js'
                ],
                dest:'dist/network-viewer/<%= meta.versionnv %>/network-viewer.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= bannergv %>'
            },
            gv: {
                src: '<%= concat.gv.dest %>',
                dest: 'dist/genome-viewer/<%= meta.versiongv %>/genome-viewer.min.js'
            },
            nv: {
                src: '<%= concat.nv.dest %>',
                dest: 'dist/network-viewer/<%= meta.versionnv %>/network-viewer.min.js'
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['src/**/*.js', 'test/**/*.js']
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'qunit']
            }
        },

        copy: {
            gv: {
                files: [
                    {   expand: true, cwd:'src/', src: ['vendor/**'], dest: 'dist/genome-viewer/<%= meta.versiongv %>/' },
                    {   expand: true, cwd:'src/', src: ['styles/**'], dest: 'dist/genome-viewer/<%= meta.versiongv %>/' } // includes files in path and its subdirs
                ]
            }
        },

        clean: {
            gv: ["dist/genome-viewer/<%= meta.versiongv %>/"]
        },

        vendorPath: 'dist/genome-viewer/<%= meta.versiongv %>/vendor',
        stylesPath: 'dist/genome-viewer/<%= meta.versiongv %>/styles',
        htmlbuild: {
            gv: {
                src: 'src/genome-viewer/genome-viewer.html',
                dest: 'dist/genome-viewer/<%= meta.versiongv %>/',
                options: {
                    beautify: true,
                    scripts: {
                        'gv-js': 'dist/genome-viewer/<%= meta.versiongv %>/genome-viewer.min.js',
                        'vendor': [ 'dist/genome-viewer/<%= meta.versiongv %>/vendor/underscore/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/backbone/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/rawdeflate/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/jquery/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/bootstrap*/**/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/qtip2/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/jquery-plugins/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/ChemDoodleWeb-5.1.0/*.js',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/jquery-ui-slider/*.js'
                            ]
                    },
                    styles: {
                        'gv-css': ['<%= stylesPath %>/css/style.css'],
                        'vendor': [ 'dist/genome-viewer/<%= meta.versiongv %>/vendor/bootstrap/**/*.css',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/bootstrap-*/**/*.css',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/qtip2/*.css',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/ChemDoodleWeb-5.1.0/*.css',
                                    'dist/genome-viewer/<%= meta.versiongv %>/vendor/jquery-ui-slider/*.css'
                            ]
                    }
                }
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
//    grunt.loadNpmTasks('grunt-contrib-qunit');
//    grunt.loadNpmTasks('grunt-contrib-jshint');
//    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html-build');

    // Default task.
//    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
    grunt.registerTask('gv', ['clean:gv','concat:gv','uglify:gv', 'copy:gv' , 'htmlbuild:gv']);
    grunt.registerTask('nv', ['concat:nv','uglify:nv',]);

};
