export default class Types {

    /**
    * Buttons type definitions
    * @typedef {Object} button
    * @property {string} button.okText - text for the ok buttons
    * @property {string} button.cancelText - text for the cancel buttons
    **/

    /**
    * Help type definitions
    * @typedef {Object} help
    * @property {string} help.mode - indicate the mode of the help
    **/

    /**
    * Display type definitions
    * @typedef {Object} display
    * @property {string} display.style - add a style for the display
    * @property {number} display.labelWidth - add a with for the display
    * @property {string} display.labelAlign - add a label align for the display
    * @property {string} display.defaultLayout - vertical or horizontal
    * @property {string} [display.defaultValue] - add a default value for display
    * @property {help} display.help - show a help for the display
    **/

    /**
    * Element type definitions
    * @typedef {Object} element
    * @property {string} element.name - name of the element
    * @property {string} element.type - type of element form
    * @property {boolean} element.required - is it the element required? True or False
    * @property {display} element.display - custom display for the element
    **/

    /**
    * Section type definitions
    * @typedef {Object} section
    * @property {string} section.title - add a title
    * @property {Array<element>} section.elements - add elements
    **/

    /**
     * Represents a data form config
     * @param {object} config - define the config for data-form
     * @param {string} config.type - type to the config form
     * @param {string} config.name - name of the config
     * @param {button} config.button - custom buttons for the data-form config
     * @param {section[]} config.section - add section config
     * @returns {object} - return config
     */
    static dataFormConfig(config) {
        return config;
    }


}

