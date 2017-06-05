module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        def: {
            name: 'lib',
            build: 'build/<%= pkg.version %>/<%= def.name %>'
        },
        concat: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("mmmm dd, yyyy HH:MM:ss") %> */\n'
            },
            dist: {
                src: [
                    //
                    'src/lib/utils.js',
                    'src/lib/svg.js',
                    'src/lib/region.js',
                    'src/lib/grid.js',
                    'src/lib/feature-binary-search-tree.js',
                    'src/lib/cellbase-manager.js',
                    'src/lib/opencga-manager.js',
                    'src/lib/ensembl-manager.js',

                    '!src/lib/worker-fileupload.js',

                    //widgets
                    '!src/lib/widgets/widget.js',
                    'src/lib/widgets/feature/file/file-widget.js',
                    'src/lib/widgets/feature/file/*.js',
                    'src/lib/widgets/feature/info/info-widget.js',
                    'src/lib/widgets/feature/info/*.js',
                    'src/lib/widgets/feature/**/*.js',

                    'src/lib/widgets/network/network-file-widget.js',
                    'src/lib/widgets/network/**/*.js',

                    //opencga
                    'src/lib/widgets/opencga/**/*.js',

                    //network
                    'src/lib/network/**/*.js',

                    //data-source
                    'src/lib/data-source/data-source.js',
                    'src/lib/data-source/**/*.js',

                    //data-adapter
                    'src/lib/data-adapter/feature/feature-data-adapter.js',
                    // Commented because the adapters now are in JS6
                    // 'src/lib/data-adapter/feature/*.js',
                    'src/lib/data-adapter/network/**/*.js',

                    //cache
                    'src/lib/cache/*-store.js',
                    'src/lib/cache/feature-chunk-cache.js',
                    'src/lib/cache/file-feature-cache.js',
                    'src/lib/cache/bam-cache.js'
                ],
                dest: '<%= def.build %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("mmmm dd, yyyy HH:MM:ss") %> */\n'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= def.build %>.min.js'
            }
        },
        clean: {
            dist: [
                '<%= concat.dist.dest %>',
                '<%= uglify.dist.dest %>'
            ]
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['clean', 'concat', 'uglify']);

};

