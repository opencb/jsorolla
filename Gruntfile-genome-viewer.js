module.exports = function (grunt) {

    grunt.initConfig({
        def: {
            name: 'genome-viewer'
        },
        concat: {
            dist: {
                src: [
//                    '<%= concat.utils.dest %>',
//                    '<%= concat.cellbase.dest %>',
                    'src/genome-viewer/navigation-bar.js',
                    'src/genome-viewer/chromosome-panel.js',
                    'src/genome-viewer/karyotype-panel.js',
                    'src/genome-viewer/status-bar.js',
                /** data-adapter **/
                    'src/lib/data-source/data-source.js', 'src/lib/data-source/*-data-source.js',
                    'src/genome-viewer/data-adapter/cellbase-adapter.js',
                    'src/genome-viewer/data-adapter/sequence-adapter.js',
                    'src/genome-viewer/data-adapter/bam-adapter.js',
                    'src/genome-viewer/data-adapter/opencga-adapter.js',
                    'src/genome-viewer/data-adapter/feature-data-adapter.js', 'src/genome-viewer/data-adapter/*-data-adapter.js',
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
                dest: 'build/<%= def.name %>/<%= def.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'build/<%= def.name %>/<%= def.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {   expand: true, cwd: './', src: ['vendor/**'], dest: 'build/genome-viewer/<%= meta.version.gv %>/' },
                    {   expand: true, cwd: './', src: ['styles/**'], dest: 'build/genome-viewer/<%= meta.version.gv %>/' }, // includes files in path and its subdirs
                    {   expand: true, cwd: './src/genome-viewer/', src: ['gv-config.js'], dest: 'build/genome-viewer/<%= meta.version.gv %>/' }
                ]
            }
        },

        clean: {
            dist: ['build/genome-viewer/<%= meta.version.gv %>/']
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-contrib-rename');

    grunt.registerTask('vendor', ['curl-dir']);

    grunt.registerTask('default', ['clean','concat', 'uglify', 'copy', 'htmlbuild']);
};
