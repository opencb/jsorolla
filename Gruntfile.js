/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        meta: {
            version : {
                gv:'1.0.3',
                nv:'1.0.0',
                threedv:'0.0.1',
                cgv:'0.0.1',
                cellbase:'1.0.0',
                opencga:'1.0.0',
                utils:'1.0.0'
            }
        },

        bannergv: '/*! Genome Viewer - v<%= meta.version.gv %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
            '* http://https://github.com/opencb/jsorolla/\n' +
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
                    'src/lib/grid.js',
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
                    'src/lib/data-source/data-source.js','src/lib/data-source/*-data-source.js',
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
                    '<%= concat.cellbase.dest %>',
                    'src/network-viewer/tool-bar.js',
                    'src/network-viewer/edition-bar.js',
                    'src/network-viewer/network-svg-layout.js',
                    'src/network-viewer/network-edit-widget.js',
                    'src/network-viewer/attributes/*.js',
                    'src/network/attributes/*.js',
                    'src/network/*.js',


                    'src/lib/data-adapter/json-data-adapter.js',
                    'src/lib/data-adapter/attributes-data-adapter.js',
                    'src/lib/data-adapter/network-data-adapter.js',
                    'src/lib/data-adapter/dot-data-adapter.js',
                    'src/lib/data-adapter/sif-data-adapter.js',

                    'src/lib/data-source/data-source.js',
                    'src/lib/data-source/file-data-source.js',
                    'src/lib/data-source/string-data-source.js',

                    'src/lib/ui-widgets/network-file-widget.js',
                    'src/lib/ui-widgets/*-network-file-widget.js',
                    'src/lib/ui-widgets/ux-window.js',

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
            },
            cgv:{
                src: [
                    '<%= concat.utils.dest %>',
                    '<%= concat.cellbase.dest %>',
                    'src/circular-genome-viewer/*.js'
                ],
                dest:'build/circular-genome-viewer/<%= meta.version.cgv %>/circular-genome-viewer-<%= meta.version.cgv %>.js'
            }
        },
        uglify: {
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
            },
            cgv:{
                src: '<%= concat.cgv.dest %>',
                dest:'build/circular-genome-viewer/<%= meta.version.cgv %>/circular-genome-viewer-<%= meta.version.cgv %>.min.js'
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
            nv: {
                files: [
                    {   expand: true, cwd:'./', src: ['vendor/**'], dest: 'build/network-viewer/<%= meta.version.nv %>/' },
                    {   expand: true, cwd:'./', src: ['styles/**'], dest: 'build/network-viewer/<%= meta.version.nv %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd:'./src/network-viewer/', src: ['nv-config.js'], dest: 'build/network-viewer/<%= meta.version.nv %>/' }
                ]
            },
            threedv: {
                files: [
                    {   expand: true, cwd:'./', src: ['vendor/**'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' },
                    {   expand: true, cwd:'./', src: ['styles/**'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd:'./src/3d-viewer/', src: ['threedv-config.js'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' },
                    {   expand: true, cwd:'./src/3d-viewer/', src: ['glsl/**'], dest: 'build/3d-viewer/<%= meta.version.threedv %>/' }
                ]
            },
            cgv: {
                files: [
                    {   expand: true, cwd:'./', src: ['vendor/**'], dest: 'build/circular-genome-viewer/<%= meta.version.cgv %>/' },
                    {   expand: true, cwd:'./', src: ['styles/**'], dest: 'build/circular-genome-viewer/<%= meta.version.cgv %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd:'./build/genome-viewer/<%= meta.version.gv %>/', src: ['genome-viewer-*.min.js'], dest: 'build/circular-genome-viewer/<%= meta.version.cgv %>/' },
                    {   expand: true, cwd:'./build/genome-viewer/<%= meta.version.gv %>/', src: ['gv-config.js'], dest: 'build/circular-genome-viewer/<%= meta.version.cgv %>/' }
                ]
            }
        },

        clean: {
            utils:['<%= concat.utils.dest %>','<%= uglify.utils.dest %>'],
            cellbase:['<%= concat.cellbase.dest %>','<%= uglify.cellbase.dest %>'],
            opencga:['<%= concat.opencga.dest %>','<%= uglify.opencga.dest %>'],
            gv: ['build/genome-viewer/<%= meta.version.gv %>/'],
            nv: ['build/network-viewer/<%= meta.version.nv %>/'],
            cgv: ['build/circular-genome-viewer/<%= meta.version.cgv %>/'],
            threedv: ['build/3d-viewer/<%= meta.version.threedv %>/']
        },

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
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.min.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/bootstrap-scoped-dist/js/bootstrap.min.js',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/typeahead.min.js',
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
                        'gv-css': ['build/genome-viewer/<%= meta.version.gv %>/styles/css/style.css'],
                        'vendor': [
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/jquery.qtip*.css',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/ChemDoodleWeb*.css',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/bootstrap-*-dist/css/bootstrap.min.css',
                                    'build/genome-viewer/<%= meta.version.gv %>/vendor/typeahead.js-bootstrap.css'
                            ]
                    }
                }
            },
            nv: {
                src: 'src/network-viewer/network-viewer.html',
                dest: 'build/network-viewer/<%= meta.version.nv %>/',
                options: {
                    beautify: true,
                    scripts: {
                        'js': '<%= uglify.nv.dest %>',
                        'vendor': [
                            'build/network-viewer/<%= meta.version.nv %>/vendor/underscore*.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/backbone*.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/jquery.min.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/jquery.qtip*.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/jquery.cookie.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/jquery.sha1.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/purl.min.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/bootstrap-scoped-dist/js/bootstrap.min.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/pick-a-color/tinycolor-0.9.15.min.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/jquery.simplecolorpicker.js',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/d3.min.js'
                        ]
                    },
                    styles: {
                        'css': ['build/network-viewer/<%= meta.version.nv %>/styles/css/style.css'],
                        'vendor': [
                            'build/network-viewer/<%= meta.version.nv %>/vendor/jquery.qtip.min.css',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/ChemDoodleWeb.css',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/bootstrap-scoped-dist/css/bootstrap.min.css',
                            'build/network-viewer/<%= meta.version.nv %>/vendor/jquery.simplecolorpicker.css'
                        ]
                    }
                }
            },
            cgv: {
                src: 'src/circular-genome-viewer/circular-genome-viewer.html',
                dest: 'build/circular-genome-viewer/<%= meta.version.cgv %>/',
                options: {
                    beautify: true,
                    scripts: {
                        'gv-js': '<%= uglify.cgv.dest %>',
                        'vendor': [
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/underscore*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/backbone*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/rawdeflate*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/jquery.min.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/bootstrap-scoped-dist/js/bootstrap.min.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/typeahead.min.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/jquery.qtip*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/jquery.cookie*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/jquery.sha1*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/purl*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/jquery.mousewheel*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/gl-matrix-min*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/ChemDoodleWeb*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/genome-viewer*.js',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/gv-config*.js'
                        ]
                    },
                    styles: {
                        'gv-css': ['build/circular-genome-viewer/<%= meta.version.cgv %>/styles/css/style.css'],
                        'vendor': [
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/jquery.qtip*.css',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/ChemDoodleWeb*.css',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/bootstrap-scoped-dist/css/bootstrap.min.css',
                            'build/circular-genome-viewer/<%= meta.version.cgv %>/vendor/typeahead.js-bootstrap.css'
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
        },
        rename: {
            cgv: {
                files: [
                    {src: ['build/circular-genome-viewer/<%= meta.version.cgv %>/circular-genome-viewer.html'], dest: 'build/circular-genome-viewer/<%= meta.version.cgv %>/index.html'}
                ]
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
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-curl');


    grunt.registerTask('vendor', ['curl-dir']);

    // Default task.
//    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

    grunt.registerTask('utils', ['concat:utils','uglify:utils','copy:utils','clean:utils']);

    grunt.registerTask('cellbase', ['concat:cellbase','uglify:cellbase','copy:cellbase','clean:cellbase']);

    grunt.registerTask('opencga', ['concat:opencga','uglify:opencga','copy:opencga','clean:opencga']);


    grunt.registerTask('gv', ['clean:gv','concat:utils','concat:cellbase','concat:gv','uglify:gv', 'copy:gv', 'htmlbuild:gv','clean:utils','clean:cellbase']);
    grunt.registerTask('cgv', ['clean:cgv','concat:utils','concat:cellbase','concat:cgv','uglify:cgv','copy:cgv','htmlbuild:cgv','clean:utils','clean:cellbase','rename:cgv']);
    grunt.registerTask('nv', ['clean:nv','concat:utils','concat:cellbase','concat:nv','uglify:nv','copy:nv', 'htmlbuild:nv','clean:utils','clean:cellbase']);
    grunt.registerTask('threedv', ['clean:threedv','concat:utils','concat:cellbase','concat:threedv','uglify:threedv','copy:threedv','htmlbuild:threedv','clean:utils','clean:cellbase']);

};
