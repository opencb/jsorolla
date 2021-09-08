const PKG = require('./package.json'); // so we can get the version of the project
const moment = require('moment'); // so we can get the version of the project

const SCREENSHOT_PATH = "./test/screenshots/" + PKG.version + "/";
const BIN_PATH = "./test/bin/";
const URL_TEST = "http://localhost/iva-babelomics/src/";
const USER = "test";
const PASSWORD = "test";

const config = {
    "src_folders": ["test"],
    "output_folder": "test/reports",

    "selenium": {
        "start_process": true,
        "server_path": BIN_PATH + "selenium-server-standalone-3.141.59.jar",
        "log_path": "",
        "port": 4444,
        "cli_args": {
            "webdriver.chrome.driver": BIN_PATH + "chromedriver"
        }
    },

    "test_settings": {
        "default": {
            "launch_url": "http://localhost",
            "selenium_port": 4444,
            "selenium_host": "localhost",
            "screenshots": {
                "enabled": true, // save screenshots to this directory (excluded by .gitignore)
                "path": SCREENSHOT_PATH
            },
            "desiredCapabilities": {
                "browserName": "chrome",
                "javascriptEnabled": true,
                "acceptSslCerts": true
            }
        }
    }
};

module.exports = config;

function imgpath (browser) {
    var a = browser.options.desiredCapabilities;
    var meta = [a.platform];
    meta.push(a.browserName ? a.browserName : 'any');
    meta.push(a.version ? a.version : 'any');
    meta.push(a.name); // this is the test filename so always exists.
    var metadata = meta.join('~').toLowerCase().replace(/ /g, '');
    return SCREENSHOT_PATH + metadata + '_' + moment().format("DD-MM-YYYY_HH:mm:ss") + '_';
}

module.exports.URL_TEST = URL_TEST;
module.exports.USER = USER;
module.exports.PASSWORD = PASSWORD;
module.exports.imgpath = imgpath;
