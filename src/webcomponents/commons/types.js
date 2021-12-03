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
     * @property {string} id The id
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
    * @typedef {Object} Element Define the element that makes up a section
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
    * @property {string} id - The id of this section, used to identify section.
    * @property {string} title - The title of this section
    * @property {string} text - The content of this section
    * @property {Display} display - Custom Config for display to the section
    * @property {Array<Element>} elements - A list of elements
    **/

    /**
     * Represents a data form config
     * @typedef {Object} Config - define the config for data-form
     * @property {string} title - the name of the data-form
     * @property {string} description - A description for the data-form
     * @property {string} icon - A icon for the data-form
     * @property {string} type - Define the type to the data-form
     * @property {Button} button - Custom Config for the button to data-form
     * @property {Section[]} section - Define sections to teh config
     * @property {Validation} validation - Define validation to the data-form
     */


    /**
     * Represent a config to Data-Form
     * @param {Config} config - Define the config you want to use for the data-form
     * @returns {Config} return config
     */
    static dataFormConfig(config) {
        return config;
    }
    // static dataFormConfig = config => ({...config})

}

