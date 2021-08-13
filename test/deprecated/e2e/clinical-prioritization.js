let config = require('../../nightwatch.conf.js');

module.exports = {

    'Analysis_view' : function (browser) {
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
            .assert.containsText('span[data-notify="message"]', 'Welcome ' + config.USER + '. Your session is valid until')
            .pause(500)
            .assert.visible('nav')
            .pause(500)
            .assert.visible('div[id="bs-example-navbar-collapse-1"]')
            .pause(500)
            .assert.visible('#bs-example-navbar-collapse-1 > ul > li > a[href="#clinical"]')
            .click('#bs-example-navbar-collapse-1 > ul > li > a[href="#clinical"]')
            .waitForElementVisible('variant-clinical-upload-new', 1000)
            .assert.visible('button[data-id="PrioritizationButton"]')
            .click('button[data-id="PrioritizationButton"]')
            .pause(500)
            .assert.visible('input[name="analysisRecentRadioButtons"]')
            .assert.visible('input[name="analysisRecentRadioButtons"]');

            browser.expect.element('input[name="analysisRecentRadioButtons"]').to.be.selected;
            browser.expect.element('#clickOkPrioritization').to.be.an('button');
            browser.expect.element('#clickOkPrioritization').text.to.contain('OK');

            browser
                .click('#clickOkPrioritization')
                .waitForElementVisible('variant-browser-grid', 100)
                .waitForElementVisible('table[data-id-field="variant"]', 1000)
                .pause(500);

            // browser.expect.element('table').to.have.attribute('data-id-field').equals('variant');

            browser.elements('css selector', 'span[class="sampleGenotype"]', (res) => {
                res.value.forEach((elemObject) => {
                    browser.elementIdText(elemObject.ELEMENT,  function (elem) {
                        console.log(elem);
                        let assertValue = elem.value !== "-";
                        browser.assert.equal(assertValue, true);
                    });
                    // console.log(res);
                });
            });

            browser.saveScreenshot(config.imgpath(browser) + "analysis-prioritization.png")
            .end();
    }
}
