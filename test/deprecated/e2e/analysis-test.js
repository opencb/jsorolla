let config = require('../../nightwatch.conf.js');

module.exports = {

    'Analysis-table-variant-sample-grid' : function (browser) {
        browser
            .url(config.URL_TEST)
            .windowMaximize()
            .waitForElementVisible('body', 1000)
            .assert.title('IVA')
            .assert.visible('a[id="loginButton"]')
            .pause(500)
            .click('a[id="loginButton"]')
            .pause(500)
            .assert.visible('input[id="opencgaUser"]')
            .setValue('input[id="opencgaUser"]', config.USER)
            .assert.visible('input[id="opencgaPassword"]')
            .setValue('input[id="opencgaPassword"]', config.PASSWORD)
            .assert.visible('button[type="submit"]')
            .click('button[type="submit"]')
            .waitForElementVisible('span[data-notify="message"]', 1000)
            .assert.containsText('span[data-notify="message"]', 'Welcome '+ config.USER +'. Your session is valid until')
            .pause(500)
            .assert.visible('nav')
            .pause(500)
            .assert.visible('div[id="bs-example-navbar-collapse-1"]')
            .pause(500)
            .assert.visible('#bs-example-navbar-collapse-1 > ul > li > a[href="#clinical"]')
            .click('#bs-example-navbar-collapse-1 > ul > li > a[href="#clinical"]')
            .waitForElementVisible('variant-clinical-upload-new', 1000)
            .assert.visible('button[data-id="SamplesButton"]')
            .click('button[data-id="SamplesButton"]')
            .assert.elementPresent('variant-clinical-sample')
            .waitForElementVisible('variant-sample-grid',1000)
            .assert.visible('table[data-test-id="variant-sample-grid-sample-selector"]')
            .saveScreenshot(config.imgpath(browser) + "analysis.png")
            .end()
    }
}
