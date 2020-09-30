/*
 * Copyright 2015-2016 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../simple-chart.js";
import "../../json-viewer.js";
import "../../tree-viewer.js";
import "../../download-button.js";
import "../../commons/filters/text-field-filter.js";

export default class DataForm extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            data: {
                type: Object
            },
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "dc-" + UtilsNew.randomString(6);
    }

    firstUpdated(_changedProperties) {

        $("#" + this._prefix + "DuePickerDate").datetimepicker({
            format: "DD/MM/YYYY"
        });
        $("#" + this._prefix + "DuePickerDate").on("dp.change", (e) => {
             this.onFilterChange(e.currentTarget.dataset.field, e.date.format("YYYYMMDDHHmmss"));
        });
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            this.requestUpdate();
        }
    }

    getValue(field, object, defaultValue, format) {
        let value = object;
        if (field) {
            let _object = object ? object : this.data;
            // optional chaining is needed when "res" is undefined
            value = field.split(".").reduce((res, prop) => res?.[prop], _object);

            // needed for handling falsy values
            if (value !== undefined && value !== "") {
                if (format) {
                    if (format.classes || format.style) {
                        value = html`<span class="${format.classes}" style="${format.style}">${value}</span>`;
                    }
                    if (format.link) {
                        value = html`<a href="${format.link.replace(field.toUpperCase(), value)}" target="_blank">${value}</a>`;
                    }
                    if (format.decimals) {
                        value = value.toFixed(format.decimals);
                    }
                }
            } else {
                value = defaultValue;
            }
        }
        return value;
    }

    applyTemplate(template, object, matches, defaultValue) {
        if (!matches) {
            matches = template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
        }
        for (let match of matches) {
            let v = this.getValue(match, object, defaultValue);
            template = template.replace("${" + match + "}", v);
        }

        return template;
    }

    _getDefaultValue(element) {
        if (typeof element.defaultValue !== "undefined" && element.defaultValue !== null) {
            return element.defaultValue;
        } else {
            if (this.config.display && typeof this.config.display.defaultValue !== "undefined" && this.config.display.defaultValue !== null) {
                return this.config.display.defaultValue;
            } else {
                return "-";
            }
        }
    }

    _getErrorMessage(element) {
        let errorMessage;
        if (element.display && element.display.errorMessage) {
            errorMessage = element.display.errorMessage;
        } else {
            if (this.config?.display?.errorMessage) {
                errorMessage = this.config.display.errorMessage;
            } else {
                errorMessage = "Error: No valid data found";
            }
        }
        return html`<div><em>${errorMessage}</em></div>`;
    }

    /**
     * Check if visible field is defined and not null, be careful since 'visible' can be a 'boolean' or a 'function'.
     * @param visible Filed from config
     * @param defaultValue
     * @returns {boolean} Default value is 'true' so it is visible.
     * @private
     */
    _getBooleanValue(visible, defaultValue) {
        let _visible = typeof defaultValue !== "undefined" ? defaultValue : true;
        if (typeof visible !== "undefined" && visible !== null) {
            if (typeof visible === "boolean") {
                _visible = visible;
            } else {
                if (typeof visible === "function") {
                    _visible = visible(this.data);
                } else {
                    console.error(`Field 'visible' not boolean or function: ${typeof visible}`);
                }
            }
        }
        return _visible;
    }

    _getWidth(element) {
        if (element.display && element.display.width) {
            return element.display.width;
        } else {
            if (this.config.display && this.config.display.defaultWidth) {
                return this.config.display.defaultWidth;
            } else {
                return null;
            }
        }
    }

    _getLabelWidth(element, section) {
        return element?.display?.labelWidth ?? section?.display?.labelWidth ?? this.config?.display?.labelWidth ?? 2;
    }

    _getTitleHeader(header, title, classes, style) {
        switch (header) {
            case "h1":
                return html`<h1 class="${classes}" style="${style}">${title}</h1>`;
            case "h2":
                return html`<h2 class="${classes}" style="${style}">${title}</h2>`;
            case "h3":
                return html`<h3 class="${classes}" style="${style}">${title}</h3>`;
            case "h4":
                return html`<h4 class="${classes}" style="${style}">${title}</h4>`;
            case "h5":
                return html`<h5 class="${classes}" style="${style}">${title}</h5>`;
            case "h6":
                return html`<h6 class="${classes}" style="${style}">${title}</h6>`;
        }
    }


    renderData() {
        let classes = this.config?.display?.classes ?? "";
        let style = this.config?.display?.style ?? "";

        // Render custom display.layout array when provided
        if (this.config?.display && this.config?.display.layout && Array.isArray(this.config?.display.layout)) {
            return html`
                <div class="${classes}" style="${style}">
                    ${this.config?.display.layout.map(section => section.id 
                        ? html`
                            <section class="${section.classes}" style="${section.style}">
                                ${this._createSection(this.config.sections.find(s => s.id === section.id))}
                            </section>` 
                        : html`
                            <section class="${section.classes}" style="${section.style}">
                                ${section.sections.map(subsection => subsection.id
                                    ? html`
                                        <div class="${subsection.classes}">
                                            ${this._createSection(this.config.sections.find(s => s.id === subsection.id))}
                                        </div>` 
                                    : null
                                )}
                            </section>`
                    )}
                </div>
            `;
        }

        if (this.config.type === "form") {
            return html`
                <section>
                    <form class="${this.config?.display?.defaultLayout === "horizontal" ? "form-horizontal" : ""} ${classes}" style="${style}">
                        ${this.config.sections.map(section => this._createSection(section))}
                    </form>
                </section>
            `;
        } else {
            return html`
                <section>
                    <div class="${classes}" style="${style}">
                        ${this.config.sections.map(section => this._createSection(section))}
                    </div>
                </section>
            `;
        }
    }

    _createSection(section) {
        // Check if the section is visible
        if (section.display && !this._getBooleanValue(section.display.visible)) {
            return;
        }

        // Get some default values
        const titleHeader = section?.display?.titleHeader ?? "h3";
        const sectionTitleClass = section?.display?.title?.class ?? "";
        const sectionTitleStyle = section?.display?.title?.style ?? "";

        // Section 'elements' array has just one dimension
        if (!Array.isArray(section.elements[0])) {
            // const sectionWidth = section?.display?.width ? `col-md-${section?.display?.width}` : "col-md-12";
            const sectionWidth = section?.display?.width ? `col-md-${section?.display?.width}` : "";
            return html`
                <div class="row" style="margin: 15px 0px">
                    ${section.title ? this._getTitleHeader(titleHeader, section.title, sectionTitleClass, sectionTitleStyle) : null}
                    <div class="${sectionWidth}">    
                        <div class="">
                            ${section.elements.map(element => this._createElement(element, section))}
                        </div>
                    </div>
                </div>
            `;
        } else {    // Field 'elements' array has two dimensions
            let leftColumnWidth = section?.display?.leftColumnWith ? section.display.leftColumnWith : 6;
            let rightColumnWidth = section?.display?.rightColumnWith ? section.display.rightColumnWith : 6;
            let columnSeparatorStyle = (section.display && section.display.columnSeparatorStyle) ? section.display.columnSeparatorStyle : "";
            return html`
                <div>
                    <div class="row" style="margin: 15px 0px">
                        ${section.title ? html`<h3 class="${sectionTitleClass}" style="${sectionTitleStyle}">${section.title}</h3>` : null}
                        <div class="col-md-${leftColumnWidth}" style="${columnSeparatorStyle}">
                            ${section.elements[0].map(element => this._createElement(element, section))}
                        </div>
                        <div class="col-md-${rightColumnWidth}" style="padding-left: 25px">
                            ${section.elements[1].map(element => this._createElement(element, section))}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    _createElement(element, section) {
        // Check if the element is visible
        if (element.display && !this._getBooleanValue(element.display.visible)) {
            return;
        }

        // Check if type is 'separator', this is a special case, no need to parse 'name' and 'content'
        if (element.type === "separator") {
            return html`
                <div>
                    <hr style="${element.display.style}">
                </div>
            `;
        }

        // Templates are allowed in the titles
        let title = element.name;
        if (title && title.includes("${")) {
            title = this.applyTemplate(element.name);
        }

        let content = "";
        // if not 'type' is defined we assumed is 'basic' and therefore field exist
        if (!element.type || element.type === "basic") {
            content = html`
                ${this.getValue(element.field, this.data, this._getDefaultValue(element), element.display 
                    ? element.display
                    // 'format' is the old way, to be removed
                    : element.display?.format
                )}`
        } else {
            // Other 'type' are rendered by specific functions
            switch (element.type) {
                case "input-text":
                    content = this._createInputTextElement(element);
                    break;
                case "input-number":
                    content = this._createInputNumberElement(element);
                    break;
                case "input-date":
                    content = this._createInputDateElement(element);
                    break;
                case "checkbox":
                    content = this._createCheckboxElement(element);
                    break;
                case "toggle":
                    content = this._createToggleElement(element);
                    break;
                case "select":
                    content = this._createInputSelectElement(element);
                    break;
                case "complex":
                    content = this._createComplexElement(element);
                    break;
                case "list":
                    content = this._createListElement(element);
                    break;
                case "table":
                    content = this._createTableElement(element);
                    break;
                case "chart":
                case "plot":
                    content = this._createPlotElement(element);
                    break;
                case "json":
                    content = this._createJsonElement(element);
                    break;
                case "tree":
                    content = this._createTreeElement(element);
                    break;
                case "custom":
                    content = this._createCustomElement(element);
                    break;
                case "download":
                    content = this._createDownloadElement(element);
                    break;
                default:
                    throw new Error("Element type not supported:" + element.type);
            }
        }

        let layout = element?.display?.defaultLayout ?? this.config?.display?.defaultLayout ?? "horizontal";
        let showLabel = element?.showLabel ?? true;
        let labelWidth = showLabel ? this._getLabelWidth(element, section) : 0;
        let width = this._getWidth(element);
        width = width ? width : 12;

        // When forms we return a form-group
        if (this.config.type && this.config.type === "form") {
            if (this.config?.display?.defaultLayout === "horizontal") {
                return html`
                    <div class="form-group">
                        <label class="control-label col-md-${labelWidth}" style="text-align: ${this.config.display?.labelAlign || "left"}">${title}</label>
                        <div class="col-md-${width - labelWidth}">
                            ${content}
                        </div>
                    </div>
                `;
            } else {
                // const sectionWidth = element?.display?.width ? `col-md-${element.display.width}` : "col-md-12";
                const sectionWidth = element?.display?.width ? `col-md-${element.display.width}` : "";
                return html`
                    <div class="form-group col-md-12">
                        <div class="${sectionWidth}">
                            <label class="control-label">${title}</label>
                            <div>
                                ${content}
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Views can be horizontal or horizontal
            if (layout === "horizontal") {
                // Label 'width' and 'align' are configured by 'labelWidth' and 'labelAlign', defaults are '2' and 'left' respectively
                return html`
                    <div class="row detail-row">
                        ${showLabel ? html`
                            <div class="col-md-${labelWidth} text-${this.config.display?.labelAlign || "left"}">
                                <label>${title}</label>
                            </div>`
                        : null}
                        <div class="col-md-${width - labelWidth}">
                            ${content}
                        </div>
                    </div>        
                `;
            } else {
                const sectionWidth = element?.display?.width ? element.display.width : "12";
                return html`
                    <div class="row detail-row">
                        ${showLabel ? html`
                            <div class="col-md-12">
                                <label>${title}</label>
                            </div>`
                        : null}
                        <div class="col-md-${sectionWidth}">
                            ${content}
                        </div>
                    </div>        
                `;
            }
        }
    }

    _createInputTextElement(element) {
        let value = this.getValue(element.field) || this._getDefaultValue(element);
        let disabled = this._getBooleanValue(element.display?.disabled, false);
        // let width = this._getWidth(element);
        let rows = element.display && element.display.rows ? element.display.rows : 1;

        return html`
            <div class="">
                <text-field-filter placeholder="${element.display?.placeholder}" .rows=${rows} ?disabled=${disabled} ?required=${element.required} 
                                    .value="${value}" @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                </text-field-filter>
            </div>
        `;
    }

    _createInputNumberElement(element) {
        let value = this.getValue(element.field) ?? this._getDefaultValue(element);
        let disabled = this._getBooleanValue(element?.display?.disabled, false);
        let width = this._getWidth(element);
        const [min = "", max = ""] = element.allowedValues || [];

        return html`
            <div class="">
                <input type="number" min=${min} max=${max} step="0.01" placeholder="${element.display?.placeholder || ""}" ?disabled=${disabled} ?required=${element.required} class="form-control input-sm"
                        value="${value !== undefined ? value : ""}" @input="${e => this.onFilterChange(element.field, e.target.value)}">
            </div>
        `;
    }

    _createInputDateElement(element) {
        let value = this.getValue(element.field) || this._getDefaultValue(element);
        if (typeof value !== "undefined" && value !== null) {
            let inputDate = this.querySelector("#" + this._prefix + "DueDate");
            if (inputDate) {
                if(typeof element?.display?.render === "function") {
                    inputDate.value = element.display.render(value);
                } else {
                    inputDate.value = value;
                }
            }
        }
        let disabled = this._getBooleanValue(element.display.disabled, false);
        let width = this._getWidth(element);

        return html`
            <div class='input-group date' id="${this._prefix}DuePickerDate" data-field="${element.field}">
                <input type='text' id="${this._prefix}DueDate" class="${this._prefix}Input form-control" data-field="${element.field}" ?disabled="${disabled}" >
                <span class="input-group-addon">
                        <span class="fa fa-calendar"></span>
                </span>
            </div>
        `;
        // return html`
        //     <div class="date col-md-${width}">
        //         <div class='form-group input-group date' id="${this._prefix}DuePickerDate" data-field="${element.field}">
        //             <input type='text' id="${this._prefix}DueDate" class="${this._prefix}Input form-control" data-field="${element.field}" ?disabled="${disabled}">
        //             <span class="input-group-addon">
        //                 <span class="fa fa-calendar"></span>
        //             </span>
        //         </div>
        //     </div>
        // `;
    }

    _createCheckboxElement(element) {
        // let checked = element.display?.checked ? "checked" : "";
        let value = this.getValue(element.field) || this._getDefaultValue(element);
        return html`
            <div class="">
                <input type="checkbox" class="${this._prefix}FilterCheckbox" 
                        @click="${e => this.onFilterChange(element.field, e.currentTarget.checked)}" ?checked="${value === "PASS"}" style="margin-right: 5px">
                <span>Include only <span style="font-weight: bold;">PASS</span> variants</span>
            </div>
        `;
    }

    _onToggleClick(buttonId, activeClass, inactiveClass, field, classId, e) {
        // Check if there is anything to do
        let active = this.getValue(field);
        if ((active && buttonId === "ON") || (!active && buttonId === "OFF")) {
            return;
        }

        // Support several classes
        let activeClasses = activeClass.split(" ");
        let inactiveClasses = inactiveClass.split(" ");

        // Fetch and reset buttons status
        let buttons = this.getElementsByClassName(classId);
        buttons.forEach(button => button.classList.remove(...activeClasses, ...inactiveClasses, "active"));
        let onIndex = 0;
        let offIndex = 1;
        if (buttons[0].dataset.id === "OFF") {
            onIndex = 1;
            offIndex = 0;
        }

        // Set proper classes
        let on = buttonId === "ON";
        if (on) {
            buttons[onIndex].classList.add(...activeClasses, "active");
            buttons[offIndex].classList.add(...inactiveClasses);
        } else {
            buttons[onIndex].classList.add(...inactiveClasses);
            buttons[offIndex].classList.add(...activeClasses ,"active");
        }

        // Set the field status
        this.onFilterChange(field, on);
    }

    /**
     * Creates a simple toggle button. It allows to configure the activeClass
     * @param element
     * @returns {TemplateResult}
     * @private
     */
    _createToggleElement(element) {
        let active = this.getValue(element.field) || this._getDefaultValue(element);
        let activeClass = element.display.activeClass || "btn-primary";
        let inactiveClass = element.display.inactiveClass || "btn-default";
        let onClass, offClass;
        if (active) {
            onClass = activeClass + " active";
            offClass = inactiveClass;
        } else {
            onClass = inactiveClass;
            offClass = activeClass + " active";
        }
        let classId = "btn-toggle-" + UtilsNew.randomString(8);
        return html`
            <div class="">
                <div class="btn-group btn-toggle"> 
                    <button class="btn ${onClass} ${classId}" data-id="ON" 
                        @click="${e => this._onToggleClick("ON", activeClass, inactiveClass, element.field, classId, e)}">ON</button>
                    <button class="btn ${offClass} ${classId}" data-id="OFF" 
                        @click="${e => this._onToggleClick("OFF", activeClass, inactiveClass, element.field, classId, e)}">OFF</button>
                </div>
            </div>
        `;
    }

    /**
     * Creates a select element given some values. You can provide:
     * i) 'allowedValues' is an array, optionally 'defaultValue' and 'display.apply'.
     * ii) 'allowedValues' is a string pointing to a data field
     * ii) 'allowedValues' function returning {allowedValues: [...], defaultValue: "..."}
     * @param element
     * @returns {*|TemplateResult}
     * @private
     */
    _createInputSelectElement(element) {
        let allowedValues = [];
        let defaultValue = null;

        // First. Check if 'allowedValues' field is provided
        if (element.allowedValues) {
            if (Array.isArray(element.allowedValues)) {
                allowedValues = element.allowedValues;
            } else {
                if (typeof element.allowedValues === "string") {
                    let values = this.getValue(element.allowedValues);
                    if (values && element.display.apply) {
                        for (let value of values) {
                            allowedValues.push(element.display.apply(value));
                        }
                    } else {
                        allowedValues = values;
                    }
                } else {
                    if (typeof element.allowedValues === "function") {
                        let values = element.allowedValues(this.data);
                        if (values) {
                            allowedValues = values;
                            if (values.defaultValue) {
                                defaultValue = values.defaultValue;
                            } else {
                                // Select defaultValue when only one value exist
                                if (allowedValues && allowedValues.length === 1) {
                                    defaultValue = allowedValues[0];
                                }
                            }
                        }
                    } else {
                        console.error("element.allowedValues must be an array, string or function");
                    }
                }
            }

            // Check if data field contains a value
            defaultValue = this.getValue(element.field);
            if (defaultValue) {
                // If apply is define we need to apply the same transformation to be selected
                if (element.display.apply) {
                    for (let allowedValue of allowedValues) {
                        if (allowedValue.includes(defaultValue)) {
                            defaultValue = allowedValue;
                            break;
                        }
                    }
                }
            } else {
                // Check if a defaultValue is set in element config
                if (element.defaultValue) {
                    defaultValue = element.defaultValue;
                } else {
                    // Select defaultValue when only one value exist
                    if (allowedValues && allowedValues.length === 1) {
                        defaultValue = allowedValues[0];
                    }
                }
            }
        }

        // Default values
        let disabled = this._getBooleanValue(element?.display?.disabled, false);
        let width = this._getWidth(element);
        if (allowedValues && allowedValues.length > 0) {
            return html`
                <div class="">
                    <select-field-filter .data="${allowedValues}" ?multiple="${element.multiple}" ?disabled=${disabled} ?required=${element.required} 
                                            .value="${defaultValue}" @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                    </select-field-filter>
                </div>
            `;
        } else {
            return this._getErrorMessage(element);
        }
    }

    _createComplexElement(element, data = this.data) {
        if (!element.display || !element.display.template) {
            return html`<span class="text-danger">No template provided</span>`;
        }
        return html`<span>${UtilsNew.renderHTML(this.applyTemplate(element.display.template, data, null, this._getDefaultValue(element)))}</span>`;
    }

    _createListElement(element) {
        // Get values
        let array = this.getValue(element.field);
        let contentLayout = (element.display && element.display.contentLayout) ? element.display.contentLayout : "horizontal";

        // Check values
        if (!array || !array.length) {
            return html`<span class="text-danger">${this._getDefaultValue(element)}</span>`;
        }
        if (!Array.isArray(array)) {
            return html`<span class="text-danger">Field '${element.field}' is not an array</span>`;
        }
        // if (!array.length) {
        //     // return this.getDefaultValue(element);
        //     return html`<span>${this.getDefaultValue(element)}'</span>`;
        // }
        if (contentLayout !== "horizontal" && contentLayout !== "vertical" && contentLayout !== "bullets") {
            return html`<span class="text-danger">Content layout must be 'horizontal', 'vertical' or 'bullets'</span>`;
        }

        // Apply the template to all Array elements and store them in 'values'
        let values = [];
        if (element.display.render) {
            for (let object of array) {
                let value = element.display.render(object);
                values.push(value);
            }
        } else {
            if (element.display.template) {
                let matches = element.display.template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
                for (let object of array) {
                    let value = this.applyTemplate(element.display.template, object, matches, this._getDefaultValue(element));
                    values.push(value);
                }
            } else {
                // if 'display.template' does not exist means it is an array of scalars
                values = array;
            }
        }

        // Render element values
        let content = "-";
        switch (contentLayout) {
            case "horizontal":
                content = html`${element?.display?.separator ? values.join(element.display.separator) : values}`;
                break;
            case "vertical":
                content = html`
                    ${values.map(elem => html`
                        <div>${elem}</div>
                    `)}
                `;
                break;
            case "bullets":
                content = html`
                    <ul style="padding-left: 20px">
                        ${values.map(elem => html`
                            <li>${elem}</li>
                        `)}
                    </ul>
                `;
                break;
        }
        return content;
    }

    _createTableElement(element) {
        // Get values
        let array = this.getValue(element.field);

        // Check values
        if (!array) {
            return html`<span class="text-danger">Type 'table' requires a valid array field: '${element.field}' not found</span>`;
        }
        if (!Array.isArray(array)) {
            return html`<span class="text-danger">Field '${element.field}' is not an array</span>`;
        }
        if (!array.length) {
            // return this.getDefaultValue(element);
            return html`<span>${this._getDefaultValue(element)}</span>`;
        }
        if (!element.display && !element.display.columns) {
            return html`<span class="text-danger">Type 'table' requires a 'columns' array</span>`;
        }

        return html`
            <table class="table" style="display: inline">
                <thead>
                    <tr>
                        ${element.display.columns.map(elem => html`
                            <th scope="col">${elem.name}</th>
                        `)}
                    </tr>
                </thead>
                <tbody>
                    ${array.map(row => html`
                        <tr scope="row">
                            ${element.display.columns.map(elem => html`
                                <td>
                                   ${elem.type === "complex" ? this._createComplexElement(elem)
                                    : elem.type === "custom" ? elem.display.render(this.getValue(elem.field, row))
                                    : this.getValue(elem.field, row, elem.defaultValue, elem.format)}
                                </td>
                            `)}
                        </tr>
                    `)}
                 </tbody>
            </table>
        `;
    }

    _createPlotElement(element) {
        // By default we use data field in the element
        let data = element.data;

        // If a valid field object or arrays is defined we use it
        let value = this.getValue(element.field);
        if (value) {
            if (Array.isArray(value)) {
                let _data = {};
                for (let val of value) {
                    let k = val[element.display.data.key];
                    let v = val[element.display.data.value];
                    _data[k] = v;
                }
                data = _data;
            } else {
                if (typeof value === "object") {
                    // Sort Object by numeric values
                    if (element?.display?.sort === true) {
                        value = Object.entries(value)
                            .sort((a, b) => b[1] - a[1])
                            .reduce((sortedObj, [k, v]) => ({
                                ...sortedObj,
                                [k]: v
                            }), {});
                    }
                    data = value;
                }
            }
        }
        if (data) {
            return html`
                <simple-chart   .active="${true}" 
                                .type="${element.display.highcharts?.chart?.type || "column"}"
                                .title="${element.display.highcharts?.title?.text || element.name}" 
                                .data="${data}" 
                                .config="${element.display.highcharts}">
                </simple-chart>`;
        } else {
            return this._getErrorMessage(element);
        }
    }

    _createJsonElement(element) {
        const json = this.getValue(element.field, this.data, this._getDefaultValue(element));
        if (json.length || UtilsNew.isObject(json)) {
            return html`<json-viewer .data="${json}" />`;
        } else {
            return this._getDefaultValue(element);
        }
    }

    _createTreeElement(element) {
        const json = this.getValue(element.field, this.data, this._getDefaultValue(element));
        if (typeof element.display.apply !== "function") {
            return `<span class="text-danger">apply() function that provides a "text" property is mandatory in Tree-Viewer elements</span>`;
        } else {
            if (Array.isArray(json)) {
                if (json.length > 0) {
                    return html`<tree-viewer .data="${json.map(element.display.apply)}" />`;
                } else {
                    return this._getDefaultValue(element);
                }
            } else if (UtilsNew.isObject(json)) {
                return html`<tree-viewer .data="${element.display.apply.call(null, json)}" />`;
            } else {
                return html`<span class="text-danger">Unexpected JSON format</span>`;
            }
        }
    }


    _createCustomElement(element) {
        if (!element.display || !element.display.render) {
            return "All 'custom' elements must implement a 'display.render' function.";
        }

        // If 'field' is defined then we pass it to the 'render' function, otherwise 'data' object is passed
        let data = this.data;
        if (element.field) {
            data = this.getValue(element.field);
        }

        // Call to render function if defined
        // It covers the case the result of this.getValue is actually undefined
        let result = element.display.render(data);
        if (result) {
            let width = this._getWidth(element);
            let style = element.display.style ? element.display.style : "";
            // return html`<div class="col-md-${width}" style="${style}">${result}</div>`;
            return html`<div class="" style="${style}">${result}</div>`;
        } else {
            return this._getErrorMessage(element);
        }
    }

    _createDownloadElement(element) {
        return html`<download-button .json="${this.data}" name="${element.name}"></download-button>`;
    }

    postRender() {
        // init any jquery plugin we might have used
        //$('.json-renderer').jsonViewer(data);
    }


    onFilterChange(field, value) {
        this.dispatchEvent(new CustomEvent("fieldChange", {
            detail: {
                param: field,
                value: value
            },
            bubbles: true,
            composed: true
        }));
    }

    onClear(e) {
        this.dispatchEvent(new CustomEvent("clear", {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    onSubmit(e) {
        this.dispatchEvent(new CustomEvent("submit", {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    render() {
        // Check configuration
        if (!this.config) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-exclamation fa-5x"></i>
                    <h3>No valid configuration provided. Please check configuration:</h3>
                    <div style="padding: 10px">
                        <pre>${JSON.stringify(this.config, null, 2)}</pre>              
                    </div>
                </div>
            `;
        }

        if (!this.data) {
            // in this case equality (==) is better than identity (===) because undefined == null
            if(this.config.nullData == null) {
                return html`${this.config.nullData}`
            } else {
                return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No valid data provided: ${this.data}</h3>
                </div>
                `;
            }

        }

        const sectionTitleIcon = this.config.display?.title?.class ?? "";

        if (this.config.display && this.config.display?.mode?.type === "card") {
            return html`
                <div class="row">
                    <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#${this._prefix}Help">
                        <i class="${this.config.icon ? this.config.icon : "fas fa-info-circle"} icon-padding" aria-hidden="true"></i> ${this.config.title}
                    </button>
                    <div class="">
                        <div id="${this._prefix}Help" class="collapse">
                            <div class="well">
                                ${this.renderData()}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (this.config.display && this.config.display?.mode?.type === "modal") {
            let title = this.config.display.mode.title ? this.config.display.mode.title : this.config.title;
            let buttonClass = this.config.display.mode.buttonClass ? this.config.display.mode.buttonClass : "btn-primary";
            return html`
                <button type="button" class="btn ${buttonClass}" data-toggle="modal" data-target="#${this._prefix}DataModal">
                    <i class="${this.config.icon ? this.config.icon : "fas fa-info-circle"} icon-padding" aria-hidden="true"></i> ${this.config.title}
                </button>
                <div class="modal fade" id="${this._prefix}DataModal" tabindex="-1" role="dialog" aria-labelledby="${this._prefix}exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document" style="width: ${this.config.display.mode.width ? this.config.display.mode.width : 640}px">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3 class="modal-title" id="${this._prefix}exampleModalLabel">${title}</h3>
                            </div>
                            <div class="modal-body">
                                ${this.renderData()}
                            </div>
                            ${this.config.buttons && this.config.buttons.show
                                ? html`
                                        <div class="modal-footer">
                                            <button type="button" class="${this.config.buttons.classes ? this.config.buttons.classes : "btn btn-primary ripple"}" data-dismiss="modal" @click="${this.onClear}">
                                                ${this.config.buttons.cancelText ? this.config.buttons.cancelText : "Cancel"}
                                            </button>
                                            <button type="button" class="${this.config.buttons.classes ? this.config.buttons.classes : "btn btn-primary ripple"}" data-dismiss="modal" @click="${this.onSubmit}">
                                                ${this.config.buttons.okText ? this.config.buttons.okText : "OK"}
                                            </button>
                                        </div>`
                                : null
                            }
                        </div>
                    </div>
                </div>
            `;
        }

        return html`
            <!-- Header -->
            ${this.config.title && this.config.display && this.config.display.showTitle
                ? html`
                    <div>
                        <h2 class="${sectionTitleIcon}" >${this.config.title}</h2>
                    </div>`
                : null
            }
            
            <!-- Render data form -->
            ${this.renderData()}
            
            <!-- Render buttons -->
            ${this.config.buttons && this.config.buttons.show
                ? html`
                    <div class="row">
                        <div class="${this.config.display.classes ? this.config.display.classes : "col-md-12"}" style="padding: 10px 40px">
                            <button type="button" class="btn btn-primary ripple" @click="${this.onClear}">
                                ${this.config.buttons.cancelText ? this.config.buttons.cancelText : "Cancel"}
                            </button>
                            <button type="button" class="btn btn-primary ripple" @click="${this.onSubmit}">
                                ${this.config.buttons.okText ? this.config.buttons.okText : "OK"}
                            </button>
                        </div>
                    </div>`
                : null
            }
        `;
    }
}

customElements.define("data-form", DataForm);
