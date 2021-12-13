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
    * @property {string} buttonClassName -
    * @property {string} buttonStyle -
    * @property {string} showButtons -
    * @property {string} showTopButtons -
    * @property {mode} mode -
    * @property {string} [defaultValue] - add a default value for display
    * @property {string} [defaultWidth] - add a default value for display
    * @property {string} [defaultLayout] - add a default value for display
    * @property {Layout} layout -
    * @property {number} labelWidth - add a with for the display
    * @property {number} width -
    * @property {string} errorIcon -
    * @property {string} errorMessage -
    * @property {string} helpIcon -
    * @property {string} titleClassName -
    * @property {string} titleStyle -
    * @property {boolean} showtitle -
    * @property {boolean} modalWidth  -
    **/

    /**
    * Display type definitions
    * @typedef {Object} DisplaySection
    * @property {number} labelWidth - add a with for the display
    * @property {string} errorIcon -
    * @property {string} helpIcon - show a help for the display
    * @property {string} titleHeader -
    * @property {string} titleWidth -
    * @property {string} titleClassName -
    * @property {string} titleStyle - add a style for the display
    * @property {string} textClassName -
    * @property {string} textStyle -
    * @property {string} className -
    * @property {string} style -
    * @property {string} leftColumnWidth -
    * @property {string} rightColumnWidth -
    * @property {string} columnSeparatorStyle -
    * @property {string} defaultLayout -
    **/

    /**
    * Display type definitions
    * @typedef {Object} DisplayElement
    * @property {string} visible -
    * @property {string} disabled -
    * @property {string} rows -
    * @property {string} errorIcon -
    * @property {string} helpIcon -
    * @property {string} helpMessage -
    * @property {string} helpMode -
    * @property {string} [defaultValue] - add a default value for display
    * @property {string} [defaultLayout] - add a default value for display
    * @property {string} errorMessage -
    * @property {string} width -
    * @property {string} [defaultWidth] - add a default value for display
    * @property {string} labelAlign - add a label align for the display
    * @property {number} labelWidth - add a with for the display
    * @property {string} labelClassName -
    * @property {string} labelStyle - add a style for the display
    * @property {string} titleAlign -
    * @property {string} titleWidth -
    * @property {string} titleClassName -
    * @property {string} titleStyle -
    * @property {string} showTitle -
    * @property {string} textClassName -
    * @property {string} textStyle -
    * @property {string} style -
    * @property {string} placeholder -
    * @property {Function} render -
    * @property {string} onText -
    * @property {string} offText -
    * @property {string} activeClassName -
    * @property {string} inactiveClassName -
    * @property {string} template -
    * @property {string} contentLayout -
    * @property {string} separator -
    * @property {string} errorClasses -
    * @property {Function} transform -
    * @property {Column} columns -
    * @property {Data[]} data -
    * @property {boolean} sort -
    * @property {Object} highcharts -
    * @property {Function} apply -
    **/

    /**
    * Element type definitions
    * @typedef {Object} Element Define the element that makes up a section
    * @property {string} name - name of the element
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
    * @property {string} text - The content of this section
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
     * @property {Button} buttons - Custom Config for the button to data-form
     * @property {DisplayForm} display - Custom Config for the display to data-form
     * @property {Section[]} section - Define sections to teh config
     * @property {Validation} validation - Define validation to the data-form
     */

    /**
     * Represent a config to Data-Form
     * @param {FormConfig} config - Define the config you want to use for the data-form
     * @returns {FormConfig} return config
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
     * @property {boolean} showTitle -
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

