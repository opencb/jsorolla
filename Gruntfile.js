module.exports = function (grunt) {

    grunt.initConfig({
        hub: {
            lib: {
                src: ['Gruntfile-lib.js'],
                tasks: ['default']
            },

            'genome-viewer': {
                src: ['Gruntfile-genome-viewer.js'],
                tasks: ['default']
            },
            'genome-viewer-no-dep': {
                src: ['Gruntfile-genome-viewer.js'],
                tasks: ['no-dep']
            },
            'genome-browser': {
                src: ['Gruntfile-genome-browser.js'],
                tasks: ['default']
            },


            'circular-genome-viewer': {
                src: ['Gruntfile-circular-genome-viewer.js'],
                tasks: ['default']
            },
            'circular-genome-viewer-no-dep': {
                src: ['Gruntfile-circular-genome-viewer.js'],
                tasks: ['no-dep']
            },

            'network-viewer': {
                src: ['Gruntfile-network-viewer.js'],
                tasks: ['default']
            },
            'network-viewer-no-dep': {
                src: ['Gruntfile-network-viewer.js'],
                tasks: ['no-dep']
            },

            'threed-viewer': {
                src: ['Gruntfile-threed-viewer.js'],
                tasks: ['default']
            },
            'threed-viewer-no-dep': {
                src: ['Gruntfile-threed-viewer.js'],
                tasks: ['no-dep']
            }
        }
    })

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-hub');

    grunt.registerTask('default', [
        'hub:lib',
        'hub:genome-viewer-no-dep',
//        'hub:circular-genome-viewer-no-dep',
        'hub:network-viewer-no-dep',
        'hub:threed-viewer-no-dep',
    ]);

    grunt.registerTask('gv', ['hub:genome-viewer']);
    grunt.registerTask('gb', ['hub:genome-browser']);
    grunt.registerTask('cgv', ['hub:circular-genome-viewer']);
    grunt.registerTask('nv', ['hub:network-viewer']);
    grunt.registerTask('3dv', ['hub:threed-viewer']);
};
