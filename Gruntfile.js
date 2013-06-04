/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        meta: {
            version: '0.1.0'
        },
        banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* http://PROJECT_WEBSITE/\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            'YOUR_NAME; Licensed GPLv2 */\n',
        // Task configuration.
        bannergv: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* http://PROJECT_WEBSITE/\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            'YOUR_NAME; Licensed GPLv2 */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/**/*.js'],
                dest: 'dist/FILE_NAME.js'
            },
            gv: {
                src: [
                    /** Utils **/
                    'lib/utils/event.js','lib/utils/svg.js','lib/utils/utils.js',
                    /** config **/
                    'lib/genome-viewer/gv-config.js',
                    'lib/ui-widgets/ux-window.js',
                    /** cellbase **/
                    'lib/cellbase/ui-widgets/info-widget.js','lib/cellbase/ui-widgets/*-info-widget.js','lib/cellbase/cellbase-manager.js',
                    /**  data-adapter **/
                    'lib/genome-viewer/data-adapter/cellbase-adapter.js','lib/genome-viewer/data-adapter/sequence-adapter.js',
                    /** genome viewer **/
                    'lib/genome-viewer/region.js',
                    'lib/genome-viewer/feature-binary-search-tree.js',
                    'lib/genome-viewer/feature-cache.js',
                    'lib/genome-viewer/navigation-bar.js',
                    'lib/genome-viewer/chromosome-panel.js',
                    'lib/genome-viewer/karyotype-widget.js',
                    'lib/genome-viewer/tracklist-panel.js',
                        /** tracks **/
                    'lib/genome-viewer/tracks/track.js',
                    'lib/genome-viewer/tracks/feature-track.js',
                    'lib/genome-viewer/tracks/sequence-track.js',
                        /** renderers **/
                    'lib/genome-viewer/renderers/renderer.js',
                    'lib/genome-viewer/renderers/feature-renderer.js',
                    'lib/genome-viewer/renderers/sequence-renderer.js',
                    'lib/genome-viewer/renderers/histogram-renderer.js',
                    'lib/genome-viewer/genome-viewer.js'
                ],
                dest: 'dist/gv.js'
            }
        },
        uglify: {
            options: {
                banner: ''
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/FILE_NAME.min.js'
            },
            gv: {
                src: '<%= concat.gv.dest %>',
                dest: 'dist/gv.min.js'
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
                src: ['lib/**/*.js', 'test/**/*.js']
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
            resources: {
                files: [
                    {expand: true, cwd:'lib/', src: ['resources/**'], dest: 'dist/'} // includes files in path and its subdirs
                ]
            }
        },

        resourcesPath: 'dist/resources',
        htmlbuild: {
            gv: {
                src: 'lib/genome-viewer/genome-viewer.html',
                dest: 'dist/',
                options: {
                    beautify: true,
                    scripts: {
                        'min': 'dist/gv.min.js'
                    },
                    styles: {
                        bundle: ['<%= resourcesPath %>/css/style.css']
                    }
                }
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
//    grunt.loadNpmTasks('grunt-contrib-qunit');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-html-build');

    // Default task.
    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
    grunt.registerTask('gv', ['concat:gv','uglify:gv', 'copy:resources' , 'htmlbuild:gv']);

};
