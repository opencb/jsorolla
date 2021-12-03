export default class Types {

    /**
    * Buttons type definitions
    * @typedef {Object} Button
    * @property {string} okText - text for the ok buttons
    * @property {string} cancelText - text for the cancel buttons
    **/

    /**
    * Help type definitions
    * @typedef {Object} Help
    * @property {string} icon - indicate the mode of the help
    * @property {string} message
    **/


    /**
     * Layout type definitions
     * @typedef {Object} Layout
     * @property {string} id
     * @property {string} className
     * @property {string} style
     */

    /**
    * Validation type definitions
    * @typedef {Object} Validation
    * @property {Function} validate -
    * @property {string} message -
    **/

    /**
    * Display type definitions
    * @typedef {Object} Display
    * @property {string} className -
    * @property {string} style - add a style for the display
    * @property {string} buttonClassName -
    * @property {string} buttonStyle -
    * @property {string} mode -
    * @property {string} [defaultValue] - add a default value for display
    * @property {string} [defaultWidth] - add a default value for display
    * @property {string} [defaultLayout] - add a default value for display
    * @property {Layout} layout -
    * @property {Help} help - show a help for the display
    * @property {number} labelWidth - add a with for the display
    * @property {string} labelAlign - add a label align for the display
    * @property {string} width -
    * @property {string} errorIcon -
    * @property {string} title -
    * @property {boolean} showtitle -
    * @property {string} errorMessage -
    **/


    /**
    * Column type definitions
    * @typedef {Object} Column
    * @property {string} className - name of the element
    * @property {string} style - type of element form
    * @property {boolean} defaultValue - is it the element required? True or False
    * @property {Array} field -
    * @property {display} type - custom display forEl the element
    * @property {Function} render -
    * @property {string} format -
    **/

    /**
    * Element type definitions
    * @typedef {Object} Data
    * @property {string} key
    * @property {string} value
    **/

    /**
    * Element type definitions
    * @typedef {Object} Element
    * @property {string} name - name of the element
    * @property {string} field - type of element form
    * @property {boolean} required - is it the element required? True or False
    * @property {boolean} showLabel
    * @property {Array} allowedValues -
    * @property {Display} display - custom display forEl the element
    * @property {Data[]} data
    * @property {Column[]} columns
    * @property {Validation} validation -
    **/

    /**
    * Section type definitions
    * @typedef {Object} Section
    * @property {string} id -
    * @property {string} title - add a title
    * @property {string} text -
    * @property {Display} display -
    * @property {Array<Element>} elements - add elements
    **/

    /**
     * Represents a data form config
     * @typedef {Object} Config - define the config for data-form
     * @property {string} title -
     * @property {string} description -
     * @property {string} icon -
     * @property {string} type - type to the config form
     * @property {Button} button - custom buttons for the data-form config
     * @property {Section[]} section - add section config
     * @property {Validation} validation -
     */


    /**
     * Represent a config
     * @param {Config} config - config object
     * @returns {Config} - return configs
     */
    static dataFormConfig(config) {
        return config;
    }
    // static dataFormConfig = config => ({...config})

}

