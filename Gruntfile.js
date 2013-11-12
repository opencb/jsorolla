/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        meta: {
            version : {
                gv:'1.0.2',
                nv:'1.0.0',
                threedv:'0.0.1',
                cellbase:'1.0.0',
                opencga:'1.0.0',
                utils:'1.0.0'
            }
        },
        banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* http://PROJECT_WEBSITE/\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            'OpenCB; Licensed GPLv2 */\n',
        bannergv: '/*! Genome Viewer - v<%= meta.version.gv %> - ' +
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
            utils:{
                src: [
                    'src/lib/utils/utils.js',
                    'src/lib/utils/svg.js',
                    'src/lib/region.js',
                    'src/lib/feature-binary-search-tree.js'
                ],
                dest: 'build/utils-<%= meta.version.utils %>.js'
            },
            cellbase: {
                src: [
                    'src/lib/cellbase/cellbase-manager.js',
                    'src/lib/cellbase/ui-widgets/info-widget.js',
                    'src/lib/cellbase/ui-widgets/gene-info-widget.js',
                    'src/lib/cellbase/ui-widgets/*.js'
                ],
                dest: 'build/cellbase-<%= meta.version.cellbase %>.js'
            },
            opencga:{
                src: [
                    'src/lib/opencga/**/user-list-widget.js',
                    'src/lib/opencga/**/*.js',
                    '!src/lib/opencga/worker-fileupload.js'
                ],
                dest: 'build/opencga-<%= meta.version.opencga %>.js'
            },
            gv: {
                src: [
                    '<%= concat.utils.dest %>',
                    '<%= concat.cellbase.dest %>',
                    'src/genome-viewer/navigation-bar.js',
                    'src/genome-viewer/chromosome-panel.js',
                    'src/genome-viewer/karyotype-panel.js',
                    'src/genome-viewer/status-bar.js',
                        /** data-adapter **/
                    'src/genome-viewer/data-source/data-source.js','src/genome-viewer/data-source/*-data-source.js',
                    'src/genome-viewer/data-adapter/cellbase-adapter.js',
                    'src/genome-viewer/data-adapter/sequence-adapter.js',
                    'src/genome-viewer/data-adapter/bam-adapter.js',
                    'src/genome-viewer/data-adapter/opencga-adapter.js',
                    'src/genome-viewer/data-adapter/feature-data-adapter.js','src/genome-viewer/data-adapter/*-data-adapter.js',
                        /** cache **/
                    'src/cache/memory-store.js',
                    'src/cache/feature-chunk-cache.js',

                    'src/genome-viewer/cache/feature-cache.js',
                    'src/genome-viewer/cache/*-cache.js',
                        /** tracks **/
                    'src/genome-viewer/tracks/tracklist-panel.js',
                    'src/genome-viewer/tracks/track.js',
                    'src/genome-viewer/tracks/*-track.js',
                        /** renderers **/
                    'src/genome-viewer/renderers/renderer.js',
                    'src/genome-viewer/renderers/*-renderer.js',
                        /** widgets **/
                    'src/genome-viewer/widget/legend-panel.js',
                    'src/genome-viewer/widget/legend-widget.js',
                    'src/genome-viewer/widget/url-widget.js',
                    'src/genome-viewer/widget/file-widget.js',
                    'src/genome-viewer/widget/*-file-widget.js',

                    'src/genome-viewer/genome-viewer.js'

                ],
                dest: 'build/genome-viewer/<%= meta.version.gv %>/genome-viewer-<%= meta.version.gv %>.js'
            },
            nv:{
                src: [
                    '<%= concat.utils.dest %>',
                    'src/lib/cellbase/cellbase-manager.js',
                    'src/network-viewer/network-viewer.js'
                    /** network viewer **/

                   /** src/network-viewer ..... **/
                ],
                dest:'build/network-viewer/<%= meta.version.nv %>/network-viewer-<%= meta.version.nv %>.js'
            },
            threedv:{
                src: [
                    '<%= concat.utils.dest %>',
                    '<%= concat.cellbase.dest %>',
                    'src/3d-viewer/js/3D.js',
                    'src/3d-viewer/js/torus.js',
                    'src/3d-viewer/js/chr.js',
                    'src/3d-viewer/js/main.js',
                    'src/3d-viewer/threed-viewer.js'
                ],
                dest:'build/3d-viewer/<%= meta.version.threedv %>/threed-viewer-<%= meta.version.threedv %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= bannergv %>'
            },
            cellbase: {
                src: '<%= concat.cellbase.dest %>',
                dest: 'build/cellbase-<%= meta.version.cellbase %>.min.js'
            },
            opencga:{
                src: '<%= concat.opencga.dest %>',
                dest: 'build/opencga-<%= meta.version.opencga %>.min.js'
            },
            utils:{
                src: '<%= concat.utils.dest %>',
                dest: 'build/utils-<%= meta.version.utils %>.min.js'
            },
            gv: {
                src: '<%= concat.gv.dest %>',
                dest: 'build/genome-viewer/<%= meta.version.gv %>/genome-viewer-<%= meta.version.gv %>.min.js'
            },
            nv: {
                src: '<%= concat.nv.dest %>',
                dest: 'build/network-viewer/<%= meta.version.nv %>/network-viewer-<%= meta.version.nv %>.min.js'
            },
            threedv:{
                src: '<%= concat.threedv.dest %>',
                dest:'build/3d-viewer/<%= meta.version.threedv %>/threed-viewer-<%= meta.version.threedv %>.min.js'
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
            utils: {
                files: [
                    {   expand: true, cwd:'./build', src: ['utils*.js'], dest: 'build/utils/<%= meta.version.utils %>/' }
                ]
            },
            cellbase: {
                files: [
                    {   expand: true, cwd:'./build', src: ['cellbase*.js'], dest: 'build/cellbase/<%= meta.version.cellbase %>/' },
                    {   expand: true, cwd:'./build', src: ['utils*.js'], dest: 'build/cellbase/<%= meta.version.cellbase %>/' }
                ]
            },
            opencga: {
                files: [
                    {   expand: true, cwd:'./build', src: ['opencga*.js'], dest: 'build/opencga/<%= meta.version.opencga %>/' },
                    {   expand: true, cwd:'./build', src: ['utils*.js'], dest: 'build/opencga/<%= meta.version.opencga %>/' },
                    {   expand: true, cwd:'./src/opencga', src: ['worker-fileupload.js'], dest: 'build/opencga/<%= meta.version.opencga %>/' }
                ]
            },
            gv: {
                files: [
                    {   expand: true, cwd:'./', src: ['vendor/**'], dest: 'build/genome-viewer/<%= meta.version.gv %>/' },
                    {   expand: true, cwd:'./', src: ['styles/**'], dest: 'build/genome-viewer/<%= meta.version.gv %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd:'./src/genome-viewer/', src: ['gv-config.js'], dest: 'build/genome-viewer/<%= meta.version.gv %>/' }
                ]
            },
            threedv: {
                files: [
                    {   expand: true, cwd:'./', src: ['vendor/**'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' },
                    {   expand: true, cwd:'./', src: ['styles/**'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd:'./src/3d-viewer/', src: ['threedv-config.js'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' },
                    {   expand: true, cwd:'./src/3d-viewer/', src: ['glsl/**'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' }
                ]
            }
        },

        clean: {
            utils:['<%= concat.utils.dest %>','<%= uglify.utils.dest %>'],
            cellbase:['<%= concat.cellbase.dest %>','<%= uglify.cellbase.dest %>'],
            opencga:['<%= concat.opencga.dest %>','<%= uglify.opencga.dest %>'],
            gv: ['build/genome-viewer/<%= meta.version.gv %>/'],
            threedv: ['build/3d-viewer/<%= meta.version.threedv %>/']
        },

        vendorPath: 'build/genome-viewer/<%= meta.version.gv %>/vendor',
        stylesPath: 'build/genome-viewer/<%= meta.version.gv %>/styles',
        htmlbuild: {
            gv: {
                src: 'src/genome-viewer/genome-viewer.html',
                dest: 'build/genome-viewer/<%= meta.version.gv %>/',
                options: {
                    beautify: true,
                    scripts: {
                        'gv-js': '<%= uglify.gv.dest %>',
                        'vendor': [
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/underscore*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/backbone*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/rawdeflate*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/bootstrap-*-dist/js/bootstrap.min.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/typeahead.min.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.min.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.qtip*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.cookie*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.sha1*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/purl*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.mousewheel*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/gl-matrix-min*.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/ChemDoodleWeb*.js'
                            ]
                    },
                    styles: {
                        'gv-css': ['<%= stylesPath %>/css/style.css'],
                        'vendor': [
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.qtip*.css',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/ChemDoodleWeb*.css',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/bootstrap-*-dist/css/bootstrap.min.css',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/typeahead.js-bootstrap.css'
                            ]
                    }
                }
            },
            threedv:{
                src: 'src/3d-viewer/threed-viewer.html',
                dest: 'build/3d-viewer/<%= meta.version.threedv %>/',
                options: {
                    beautify: true,
                    scripts: {
                        'js': '<%= uglify.threedv.dest %>',
                        'vendor': [
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/underscore*.js',
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/backbone*.js',
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/jquery.min.js',
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/three.js',
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/Stats.js',
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/RequestAnimationFrame.js',
                       //     'build/3d-viewer/<%= meta.version.threedv %>/vendor/core/embed.js',
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/jquery-ui-1.10.3*/js/jquery-ui*min.js'
                        ]
                    },
                    styles: {
                        'css': ['<%= stylesPath %>/css/style.css'],
                        'vendor': [
                            'build/3d-viewer/<%= meta.version.threedv %>/vendor/jquery-ui-1.10.3*/css/**/jquery-ui*min.css'
                        ]
                    }
                }
            }
        },
        'curl-dir': {
            long: {
                src: [
                    'http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js',
                    'http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.map',
                    'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.map',
                    'http://hub.chemdoodle.com/cwc/5.1.0/ChemDoodleWeb.css',
                    'http://hub.chemdoodle.com/cwc/5.1.0/ChemDoodleWeb.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.0.6/jquery.mousewheel.min.js',
                    'https://raw.github.com/toji/gl-matrix/master/dist/gl-matrix-min.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.3.1/jquery.cookie.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/jquery-url-parser/2.2.1/purl.min.js',
                    'http://jsapi.bioinfo.cipf.es/ext-libs/jquery-plugins/jquery.sha1.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/qtip2/2.1.1/jquery.qtip.min.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/qtip2/2.1.1/jquery.qtip.min.css',
//                    'http://jsapi.bioinfo.cipf.es/ext-libs/qtip2/jquery.qtip.min.js',
//                    'http://jsapi.bioinfo.cipf.es/ext-libs/qtip2/jquery.qtip.min.css',
                    'http://jsapi.bioinfo.cipf.es/ext-libs/rawdeflate.js'
                ],
                dest: 'vendor'
            }
        },
        watch: {
            scripts: {
                files: ['src/genome-viewer/**', 'src/utils/**', 'src/cellbase/**', 'src/opencga/**', 'styles/**'],
                tasks: ['gv','opencga'],
                options: {spawn: false}
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
//    grunt.loadNpmTasks('grunt-contrib-qunit');
//    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-curl');


    grunt.registerTask('vendor', ['curl-dir']);

    // Default task.
//    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

    grunt.registerTask('utils', ['concat:utils','uglify:utils','copy:utils','clean:utils']);

    grunt.registerTask('cellbase', ['concat:cellbase','uglify:cellbase','copy:cellbase','clean:cellbase']);

    grunt.registerTask('opencga', ['concat:opencga','uglify:opencga','copy:opencga','clean:opencga']);


    grunt.registerTask('gv', ['clean:gv','concat:utils','concat:cellbase','concat:gv','uglify:gv', 'copy:gv', 'htmlbuild:gv','clean:utils','clean:cellbase']);
    grunt.registerTask('nv', ['concat:utils','concat:cellbase','concat:nv','uglify:nv', 'clean:utils','clean:cellbase']);
    grunt.registerTask('threedv', ['clean:threedv','concat:utils','concat:cellbase','concat:threedv','uglify:threedv','copy:threedv','htmlbuild:threedv','clean:utils','clean:cellbase']);

};
