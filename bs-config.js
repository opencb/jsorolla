const path = require("path");

/*
 |--------------------------------------------------------------------------
 | IVA Browser-sync config file
 |--------------------------------------------------------------------------
 */
module.exports = {
    files: [
        "src",
        "styles"
        // "lib/jsorolla/src",
        // "lib/jsorolla/styles"
    ],
    server: {
        //baseDir: path.resolve(__dirname),
        //directory: true
    },
    startPath: "src/apps/iva",
    open: true,
    timestamps: true,
    excludedFileTypes: [],
    notify: {
        styles: {
            top: 'auto',
            bottom: '0'
        }
    }

};
