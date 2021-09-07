let config = require('../../nightwatch.conf.js');

module.exports = {
    'Welcome-page' : function (browser) {
        browser
            .url(config.URL_TEST)
            .windowMaximize()
            .waitForElementVisible('body', 1000)
            .assert.title('IVA')
            .assert.visible('welcome-web')
            .pause(500)
            .assert.visible('div[class="welcome-center"]')
            .pause(500)
            .saveScreenshot(config.imgpath(browser) + "welcome.png")
            .end()
    }
}