export default class Types {

    // Structure following: https://github.com/opencb/jsorolla/issues/268
    /**
    * Buttons type definitions
    * @typedef {Object} Button
    * @property {string} okText - text for the ok buttons
    * @property {string} cancelText - text for the cancel buttons
    **/

    /**
    * ! DEPRECATED
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
    * @typedef {(
    * "title"|"input-text"|"input-number"|"input-date"|"checkbox"|
    * "toggle-switch"|"toggle-buttons"|"select"|"complex"|"list"|"table"|
    * "chart"|"plot"|"json"|"tree"|"custom"|"download"
    * )} elementType
    **/

    /**
    * @typedef {("card"|"modal"|"normal")} mode
    **/


    /**
    * Column type definitions
    * @typedef {Object} Column
    * @property {string} name - name of the element
    * @property {string} title - name of the element
    * @property {string} className - name of the element
    * @property {string} style - type of element form
    * @property {boolean} defaultValue - is it the element required? True or False
    * @property {Array} field -
    * @property {display} type - custom display forEl the element
    * @property {Function} render -
    * @property {string} format -
    **/

    /**
    * Data type definitions
    * @typedef {Object} Data
    * @property {string} key - name of the element
    * @property {string} value - type of element form
    **/

    /**
    * Display type definitions
    * @typedef {Object} DisplayForm
    * @property {string} className -
    * @property {string} style - add a style for the display
    * @property {string} buttonsClassName -
    * @property {string} buttonsStyle -
    * @property {boolean} buttonsVisible -
    * @property {string} buttonsLayout -
    * @property {string} buttonsWidth -
    * @property {string} buttonsAlign -
    * @property {string} buttonOkText - text for the ok buttons
    * @property {string} buttonClearText - text for the clear
    * @property {string} type -
    * @property {string} [defaultValue] - add a default value for display
    * @property {string} [defaultWidth] - add a default value for display
    * @property {string} [defaultLayout] - add a default value for display
    * @property {Layout} layout -
    * @property {number} width -
    * @property {string} errorIcon -
    * @property {string} errorMessage -
    * @property {string} helpIcon -
    * @property {string} titleClassName -
    * @property {string} titleStyle -
    * @property {boolean} titleVisible -
    * @property {number} titleWidth - add a with for the display
    * @property {string} modalWidth -
    * @property {string} modalSize -
    * @property {boolean} modalDisabled  -
    * @property {string} modalButtonClassName  -
    * @property {string} modalButtonStyle
    **/

    /**
    * Display type definitions
    * @typedef {Object} DisplaySection
    * @property {number} titleWidth - add a with for the display
    * @property {string} errorIcon -
    * @property {string} errorMessage -
    * @property {string} helpIcon - show a help for the display
    * @property {string} titleHeader -
    * @property {string} titleWidth -
    * @property {string} titleClassName -
    * @property {string} titleStyle - add a style for the display
    // * @property {string} textClassName -
    // * @property {string} textStyle -
    * @property {string} descriptionClassName -
    * @property {string} descriptionStyle -
    * @property {string} className -
    * @property {string} style -
    * @property {string} leftColumnWidth -
    * @property {string} rightColumnWidth -
    * @property {string} columnSeparatorStyle -
    * @property {string} defaultLayout -
    * @property {boolean} visible -
    **/

    /**
    * Display type definitions
    * @typedef {Object} DisplayElement
    * @property {string} className -
    * @property {string} style -
    * @property {string} visible -
    * @property {string} disabled -
    * @property {string} rows -
    * @property {string} errorIcon -
    * @property {string} errorMessage -
    * @property {string} helpIcon -
    * @property {string} helpMessage -
    * @property {string} helpMode -
    * @property {string} [defaultValue] - add a default value for display
    * @property {string} [defaultLayout] - add a default value for display
    * @property {string} width -
    * @property {string} [defaultWidth] - add a default value for display
    * @property {string} titleAlign - add a label align for the display
    * @property {number} titleWidth - add a with for the display
    * @property {string} titleClassName -
    * @property {string} titleStyle - add a style for the display
    * @property {string} titleWidth -
    * @property {string} titleClassName -
    * @property {string} titleStyle -
    * @property {string} titleVisible -
    * @property {string} textClassName -
    * @property {string} textStyle -
    * @property {string} placeholder -
    * @property {Function} render -
    * @property {string} onText -
    * @property {string} offText -
    * @property {string} activeClassName -
    * @property {string} inactiveClassName -
    * @property {string} template -
    * @property {string} contentLayout -
    * @property {string} separator -
    * @property {string} errorClassName -
    * @property {Function} transform -
    * @property {boolean} headerVisible -
    * @property {Column} columns -
    * @property {Data[]} data -
    * @property {boolean} sort -
    * @property {Object} highcharts -
    * @property {Function} apply -
    **/

    /**
    * Element type definitions
    * @typedef {Object} Element Define the element that makes up a section
    * @property {string} title - name of the element
    * @property {string} field - data name of element form
    * @property {elementType} type - type of element form
    * @property {boolean} required - is it the element required? True or False
    * @property {Array} allowedValues -
    * @property {boolean} showLabel
    * @property {DisplayElement} display - custom display forEl the element
    * @property {Validation} validation -
    **/

    /**
    * Section type definitions
    * @typedef {Object} Section
    * @property {string} id - The id of this section, used to identify section.
    * @property {string} title - The title of this section
    * @property {string} description - The content of this section
    * @property {DisplaySection} display - Custom Config for display to the section
    * @property {Array<Element>} elements - A list of elements
    **/

    /**
     * Represents a data form config
     * @typedef {Object} FormConfig - define the config for data-form
     * @property {string} title - the name of the data-form
     * @property {string} description - A description for the data-form
     * @property {string} icon - A icon for the data-form
     * @property {string} type - Define the type to the data-form
    //  * @property {Button} buttons - Custom Config for the button to data-form
     * @property {DisplayForm} display - Custom Config for the display to data-form
     * @property {Section[]} sections - Define sections to teh config
     * @property {Validation} validation - Define validation to the data-form
     */

    /** **********************
     * Represent a config to Data-Form
     * @param {FormConfig} config - Define the config you want to use for the data-form
     * @returns {FormConfig} return config
     *  **********************
    */
    static dataFormConfig(config) {
        return {...config};
    }

    /**
    * item type definitions
    * @typedef {Object} Item
    * @property {string} id - The id of this item, used to identify item.
    * @property {string} name - The title of this item
    * @property {string} icon - icon
    * @property {string} active -
    * @property {Function} render -
    **/

    /**
     * Represents a detail tabs config
     * @typedef {Object} TabsConfig - define the config for detail-tab
     * @property {string} title - the title of the detail-tab
     * @property {boolean} titleVisible -
     * @property {Item[]} items - tabs
     */

    /**
     * Represent a config to Detail-tabs
     * @param {TabsConfig} config - Define the config you want to use for the detail-tab
     * @returns {TabsConfig} return config
     */
    static detailTabConfig(config) {
        return {...config};
    }

}

