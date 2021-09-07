/* eslint-disable no-useless-escape */
/* eslint-disable valid-jsdoc */
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
import {ifDefined} from "/web_modules/lit-html/directives/if-defined.js";
// import UtilsNew from "../../../core/utilsNew.js";
import UtilsNew from "../../../core/utilsNew.js";
import "../simple-chart.js";
import "../json-viewer.js";
import "../../tree-viewer.js";
import "../../download-button.js";
import "../forms/text-field-filter.js";
import "./toggle-switch.js";
import "./toggle-buttons.js";

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
        this._prefix = UtilsNew.randomString(8);

        // We need to initialise 'data' in case undefined value is passed
        this.data = {};
    }

    firstUpdated(_changedProperties) {
        $("#" + this._prefix + "DuePickerDate").datetimepicker({
            format: "DD/MM/YYYY"
        });
        $("#" + this._prefix + "DuePickerDate").on("dp.change", e => {
            this.onFilterChange(e.currentTarget.dataset.field, e.date.format("YYYYMMDDHHmmss"));
        });
    }

    update(changedProperties) {
        if (changedProperties.has("data")) {
            // Undefined or null values are accepted only when rendering form.
            // Check if 'data' passed is undefined or null and initialised to empty object
            this.dataObserver();
        }
        super.update(changedProperties);
    }

    dataObserver() {
        if (this.config?.type?.toUpperCase() === "FORM") {
            this.data = this.data ?? {};
        }
    }

    getValue(field, object, defaultValue, format) {
        let value = object;
        if (field) {
            const _object = object ? object : this.data;
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
                    if (format.decimals && !isNaN(value)) {
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
        for (const match of matches) {
            const v = this.getValue(match, object, defaultValue);
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

    _getSectionWidth(section) {
        return section?.display?.width ?? this.config?.display?.width ?? 12;
    }

    _getLabelWidth(element, section) {
        return element?.display?.labelWidth ?? section?.display?.labelWidth ?? this.config?.display?.labelWidth ?? 3;
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

    _getHelpIcon(element, section) {

        if (element.display?.help.icon) {
            return element.display.help.icon;
        } else {
            if (section.display?.help.icon) {
                return section.display.help.icon;
            } else {
                if (this.config.display?.help?.icon) {
                    return this.config.display.help.icon;
                } else {
                    return "fas fa-info-circle";
                }
            }
        }
    }


    renderData() {
        const classes = this.config?.display?.classes ?? "";
        const style = this.config?.display?.style ?? "";

        // Render custom display.layout array when provided
        if (this.config?.display && this.config?.display.layout && Array.isArray(this.config?.display.layout)) {
            return html`
                <div class="${classes}" style="${style}">
                    ${this.config?.display.layout.map(section => section.id ?
                        html`
                            <div class="${section.classes}" style="${section.style}">
                                ${this.config.type === "form" ?
                                    html`
                                        <section>
                                            <form class="${this.config?.display?.defaultLayout === "horizontal" ? "form-horizontal" : ""} ${classes}" style="${style}">
                                                ${this._createSection(this.config.sections.find(s => s.id === section.id))}
                                            </form>
                                        </section>` :
                                    html`
                                        <section>
                                            <div class="${classes}" style="${style}">
                                                ${this._createSection(this.config.sections.find(s => s.id === section.id))}
                                            </div>
                                        </section>`
                                }
                            </div>` :
                        html`
                            <div class="${section?.classes ?? ""}" style="${section?.style ?? ""}">
                                ${section.sections.map(subsection => subsection.id ?
                                    html`
                                        <div class="${subsection.classes}">
                                            ${this.config.type === "form" ?
                                                html`
                                                    <section>
                                                        <form class="${this.config?.display?.defaultLayout === "horizontal" ? "form-horizontal" : ""} ${classes}" style="${style}">
                                                            ${this._createSection(this.config.sections.find(s => s.id === subsection.id))}
                                                        </form>
                                                    </section>` :
                                                html`
                                                    <section>
                                                        <div class="${classes}" style="${style}">
                                                            ${this._createSection(this.config.sections.find(s => s.id === subsection.id))}
                                                        </div>
                                                    </section>`
                                            }
                                        </div>` :
                                    null
                                )}
                            </div>`
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
        const sectionTitleClass = section?.display?.titleClass ?? "";
        const sectionTitleStyle = section?.display?.titleStyle ?? "";
        const sectionClasses = section?.display?.classes ?? "";
        const sectionStyle = section?.display?.style ?? "";

        // Section 'elements' array has just one dimension
        if (!Array.isArray(section.elements[0])) {
            // const sectionWidth = section?.display?.width ? `col-md-${section?.display?.width}` : "col-md-12";
            const sectionWidth = "col-md-" + this._getSectionWidth(section);
            return html`
                <div class="row" style="">
                    ${section.title ? this._getTitleHeader(titleHeader, section.title, sectionTitleClass, sectionTitleStyle) : null}
                    ${section.text ? html`
                        <div class="${section.display?.textClass ? section.display.textClass : ""}" style="${section.display?.textStyle ? section.display.textStyle : ""}">
                            <span>${section.text}</span>
                        </div>` : null
                    }
                    <div class="${sectionWidth} ${sectionClasses}" style="${sectionStyle}">
                        <div class="">
                            ${section.elements.map(element => this._createElement(element, section))}
                        </div>
                    </div>
                </div>
            `;
        } else { // Field 'elements' array has two dimensions
            const leftColumnWidth = section?.display?.leftColumnWith ? section.display.leftColumnWith : 6;
            const rightColumnWidth = section?.display?.rightColumnWith ? section.display.rightColumnWith : 6;
            const columnSeparatorStyle = (section.display && section.display.columnSeparatorStyle) ? section.display.columnSeparatorStyle : "";
            return html`
                <div>
                    <div class="row" style="">
                        ${section.title ? html`<h3 class="${sectionTitleClass}" style="${sectionTitleStyle}">${section.title}</h3>` : null}
                        <div class="col-md-${leftColumnWidth} ${sectionClasses}" style="${columnSeparatorStyle} ${sectionStyle}">
                            ${section.elements[0].map(element => this._createElement(element, section))}
                        </div>
                        <div class="col-md-${rightColumnWidth} ${sectionClasses}" style="padding-left: 25px; ${sectionStyle}">
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

        const elementLabelClasses = element?.display?.labelClasses ?? section?.display?.elementLabelClasses ?? "";
        const elementLabelStyle = element?.display?.labelStyle ?? section?.display?.elementLabelStyle ?? "";

        // Check if type is 'separator', this is a special case, no need to parse 'name' and 'content'
        if (element.type === "separator") {
            return html`
                <div>
                    <hr style="${element?.display?.style}">
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
                ${this.getValue(element.field, this.data, this._getDefaultValue(element), element.display ?
                    element.display :
                    // 'format' is the old way, to be removed
                    element.display?.format
                )}`;
        } else {
            // Other 'type' are rendered by specific functions
            switch (element.type) {
                case "title":
                    content = this._createTitleElement(element);
                    break;
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
                case "toggle-switch":
                    content = this._createToggleSwitchElement(element);
                    break;
                case "toggle-buttons":
                    content = this._createToggleButtonsElement(element);
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

        const layout = element?.display?.defaultLayout ?? this.config?.display?.defaultLayout ?? "horizontal";
        const showLabel = element?.showLabel ?? true;
        const labelWidth = showLabel ? this._getLabelWidth(element, section) : 0;
        let width = this._getWidth(element);
        width = width ? width : 12;

        // When form we return a form-group
        if (this.config.type && this.config.type === "form") {
            if (layout === "horizontal") {
                return html`
                    <div class="form-group">
                        <label class="control-label col-md-${labelWidth} ${elementLabelClasses}"
                                style="text-align: ${this.config.display?.labelAlign || "left"}; ${elementLabelStyle}">${title}</label>
                        <div class="col-md-${width - labelWidth}">
                            <div class="col-md-11">
                            ${content}
                            </div>
                            ${element.display?.help ? html `
                                <div class="col-md-1" style="padding:0%; margin-top:6px" title="${element.display.help.text}">
                                    <span><i class="${this._getHelpIcon(element, section)}"></i></span>
                                </div>` : null
                            }
                        </div>
                    </div>
                `;
            } else {
                const sectionWidth = element?.display?.width ? `col-md-${element.display.width}` : `col-md-${this.config?.display?.width ?? 12}`;
                return html`
                    <div class="form-group">
                        <div class="${sectionWidth}" style="margin: 5px 0px">
                            ${title ? html`<label class="control-label ${elementLabelClasses}" style="${elementLabelStyle}">${title}</label>` : null}
                            ${content ? html`
                                <div>
                                    ${content}
                                </div>` : null
                            }
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
                            </div>` :
                        null}
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
                            </div>` :
                        null}
                        <div class="col-md-${sectionWidth}">
                            ${content}
                        </div>
                    </div>
                `;
            }
        }
    }

    _createTitleElement(element) {
        return html`
            <div class="${element.display.textClass ? element.display.textClass : ""}" style="${element.display?.textStyle ? element.display.textStyle : ""}">
                <span>${element.text}</span>
            </div>
        `;
    }

    _createInputTextElement(element) {
        const value = this.getValue(element.field) || this._getDefaultValue(element);
        const disabled = this._getBooleanValue(element.display?.disabled, false);
        const rows = element.display && element.display.rows ? element.display.rows : 1;
        const isValid = this._getBooleanValue(element.display?.validation?.validate, true);

        return html`
            <div class=${isValid? "" : "has-error"}>
                <text-field-filter placeholder="${element.display?.placeholder}" .rows=${rows} ?disabled=${disabled}
                                   ?required=${element.required} .value="${value}"
                                   .classes="${element.display?.updated ? "updated" : ""}"
                                   @blurChange="${e => this.onBlurChange(element.field, e.detail.value)}"
                                   @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                </text-field-filter>
                ${element?.display?.help?.mode === "block" && element?.display?.help?.text ? html`<span class="help-block" style="margin: 5px">${element.display.help.text}</span>` : null}
                ${!isValid ? html`<span class="help-block" style="margin: 5px">${element.display.validation.message}</span>` : null}
            </div>
        `;
    }

    _createInputNumberElement(element) {
        const value = this.getValue(element.field) ?? this._getDefaultValue(element);
        const disabled = this._getBooleanValue(element?.display?.disabled, false);
        const [min = "", max = ""] = element.allowedValues || [];
        const step = element.step || "1";
        // debugger
        return html`
            <div class="">
                <number-field-filter label="Value" .value="${value ? value : ""}"
                                     .min=${min} .max=${max} .step="${step}" .placeholder="${element.display?.placeholder || ""}"
                                     .classes="${element.display?.updated ? "updated" : ""}"
                                     @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                </number-field-filter>
            </div>
        `;
    }

    _createInputDateElement(element) {
        const value = this.getValue(element.field) || this._getDefaultValue(element);
        if (typeof value !== "undefined" && value !== null) {
            const inputDate = this.querySelector("#" + this._prefix + "DueDate");
            if (inputDate) {
                if (typeof element?.display?.render === "function") {
                    inputDate.value = element.display.render(value);
                } else {
                    inputDate.value = value;
                }
            }
        }
        const disabled = this._getBooleanValue(element.display.disabled, false);
        const width = this._getWidth(element);

        return html`
            <div class='input-group date' id="${this._prefix}DuePickerDate" data-field="${element.field}">
                <input type='text' id="${this._prefix}DueDate" class="${this._prefix}Input form-control" data-field="${element.field}" ?disabled="${disabled}" >
                <span class="input-group-addon">
                        <span class="fa fa-calendar"></span>
                </span>
            </div>
        `;
    }

    _createCheckboxElement(element) {
        let value = this.getValue(element.field); // || this._getDefaultValue(element);
        const disabled = this._getBooleanValue(element.display?.disabled, false);

        // TODO to be fixed.
        if (element.field === "FILTER") {
            value = value === "PASS";
            element.text = "Include only PASS variants";
        }
        return html`
            <div class="">
                <input type="checkbox" class="${this._prefix}FilterCheckbox" .checked="${value}" ?disabled=${disabled}
                        @click="${e => this.onFilterChange(element.field, e.currentTarget.checked)}" style="margin-right: 5px; margin-top: 12px">
                <span>${element.text}</span>
            </div>
        `;
    }

    /**
     * This element accepts 4 main parameters: onText, offText, activeClass and inactiveClass.
     * Default values are: ON, OFF, btn-primary and btn-default, respectively.
     * @param element
     * @returns {TemplateResult}
     * @private
     */
    _createToggleSwitchElement(element) {
        const value = this.getValue(element.field); // || this._getDefaultValue(element);

        return html`
            <div class="">
                <toggle-switch .value="${value}" .onText="${element.display.onText}" .offText="${element.display.offText}"
                               .activeClass="${element.display.activeClass}" .inactiveClass="${element.display.inactiveClass}"
                               .classes="${element.display?.updated ? "updated" : ""}"
                               @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                </toggle-switch>
            </div>
        `;
    }

    _createToggleButtonsElement(element) {
        const value = this.getValue(element.field) || this._getDefaultValue(element);
        const names = element.allowedValues;

        return html`
            <div class="">
                <toggle-buttons .names="${names}" .value="${value}"
                                .activeClass="${element.display.activeClass}" .inactiveClass="${element.display.inactiveClass}"
                                .classes="${element.display?.updated ? "updated" : ""}"
                                @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                </toggle-buttons>
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
                if (element.display?.apply) {
                    for (const value of element.allowedValues) {
                        allowedValues.push(element.display.apply(value));
                    }
                } else {
                    allowedValues = element.allowedValues;
                }
            } else {
                if (typeof element.allowedValues === "string") {
                    const values = this.getValue(element.allowedValues);
                    if (values && element.display.apply) {
                        for (const value of values) {
                            allowedValues.push(element.display.apply(value));
                        }
                    } else {
                        allowedValues = values;
                    }
                } else {
                    if (typeof element.allowedValues === "function") {
                        const values = element.allowedValues(this.data);
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
                // If apply is defined we need to apply the same transformation to be selected
                if (element.display.apply) {
                    for (const allowedValue of allowedValues) {
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
        const disabled = this._getBooleanValue(element?.display?.disabled, false);
        const width = this._getWidth(element);
        if (allowedValues && allowedValues.length > 0) {
            return html`
                <div class="">
                    <select-field-filter .data="${allowedValues}" ?multiple="${element.multiple}" ?disabled=${disabled}
                                         ?required=${element.required} .value="${defaultValue}"
                                         .classes="${element.display?.updated ? "updated" : ""}"
                                         @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
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
        const array = this.getValue(element.field);
        const contentLayout = (element.display && element.display.contentLayout) ? element.display.contentLayout : "horizontal";

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
            for (const object of array) {
                const value = element.display.render(object);
                values.push(value);
            }
        } else {
            if (element.display.template) {
                const matches = element.display.template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
                for (const object of array) {
                    const value = this.applyTemplate(element.display.template, object, matches, this._getDefaultValue(element));
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
                    <ul class="pad-left-15">
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
        const array = this.getValue(element.field);
        const errorMessage = this._getErrorMessage(element);
        const errorClasses = element.display.errorClasses ?? "text-danger";

        // Check values
        if (!array) {
            return html`<span class="${errorClasses}">${errorMessage ?? `Type 'table' requires a valid array field: ${element.field} not found`}</span>`;
        }
        if (!Array.isArray(array)) {
            return html`<span class="${errorClasses}">Field '${element.field}' is not an array</span>`;
        }
        if (!array.length) {
            // return this.getDefaultValue(element);
            return html`<span>${this._getDefaultValue(element)}</span>`;
        }
        if (!element.display && !element.display.columns) {
            return html`<span class="${errorClasses}">Type 'table' requires a 'columns' array</span>`;
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
                                   ${elem.type === "complex" ? this._createComplexElement(elem, row) :
                                    elem.type === "custom" ? elem.display.render(this.getValue(elem.field, row)) :
                                    this.getValue(elem.field, row, elem.defaultValue, elem.format)}
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
                const _data = {};
                for (const val of value) {
                    const k = val[element.display.data.key];
                    const v = val[element.display.data.value];
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
            return html`<json-viewer .data="${json}"></json-viewer>`;
        } else {
            return this._getDefaultValue(element);
        }
    }

    _createTreeElement(element) {
        const json = this.getValue(element.field, this.data, this._getDefaultValue(element));
        if (typeof element.display.apply !== "function") {
            return "<span class=\"text-danger\">apply() function that provides a \"text\" property is mandatory in Tree-Viewer elements</span>";
        } else {
            if (Array.isArray(json)) {
                if (json.length > 0) {
                    return html`<tree-viewer .data="${json.map(element.display.apply)}"></tree-viewer>`;
                } else {
                    return this._getDefaultValue(element);
                }
            } else if (UtilsNew.isObject(json)) {
                return html`<tree-viewer .data="${element.display.apply.call(null, json)}"></tree-viewer>`;
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
        const result = element.display.render(data);
        if (result) {
            const width = this._getWidth(element);
            const style = element.display.style ? element.display.style : "";
            // return html`<div class="col-md-${width}" style="${style}">${result}</div>`;
            return html`<div class="" style="">${result}</div>`;
        } else {
            return this._getErrorMessage(element);
        }
    }

    _createDownloadElement(element) {
        return html`<download-button .json="${this.data}" name="${element.name}"></download-button>`;
    }

    postRender() {
        // init any jquery plugin we might have used
        // $('.json-renderer').jsonViewer(data);
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

    onBlurChange(field, value) {
        this.dispatchEvent(new CustomEvent("blurChange", {
            detail: {
                param: field,
                value: value
            },
            bubbles: false,
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

    renderButtons() {
        // By default OK is disabled if the input object is empty
        return html`
            <div class="row">
                <div class="${this.config.buttons.classes ? this.config.buttons.classes : "col-md-12"}" style="padding: 10px 20px">
                    <button type="button" class="btn btn-primary ripple" @click="${this.onClear}">
                        ${this.config.buttons.cancelText ? this.config.buttons.cancelText : "Cancel"}
                    </button>
                    <button type="button" class="btn btn-primary ripple" @click="${this.onSubmit}" ?disabled=${UtilsNew.isEmpty(this.data)}>
                        ${this.config.buttons.okText ? this.config.buttons.okText : "OK"}
                    </button>
                </div>
            </div>`;
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

        const title = this.config.display?.mode?.title ? this.config.display.mode.title : this.config.title;
        const titleClass = this.config.display?.title?.class ?? "";
        const buttonClasses = this.config.buttons?.classes ? this.config.buttons.classes : "btn btn-primary ripple";

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
            const buttonClass = this.config.display.mode.buttonClass ? this.config.display.mode.buttonClass : "btn-primary";
            return html`
                <button type="button" class="btn ${buttonClass} ${this.config.display.mode.disabled === true ? "disabled" : null}" data-toggle="modal" disabled="${ifDefined(this.config.display.mode.disabled === true ? "disabled" : undefined)}" data-target="#${this._prefix}DataModal">
                    <i class="${this.config.icon ? this.config.icon : "fas fa-info-circle"} icon-padding" aria-hidden="true"></i> ${this.config.title}
                </button>
                <div class="modal fade" id="${this._prefix}DataModal" tabindex="-1" role="dialog" aria-labelledby="${this._prefix}exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog" style="width: ${this.config.display.mode.width ? this.config.display.mode.width : 768}px">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3 class="${titleClass}" id="${this._prefix}exampleModalLabel">${title}</h3>
                            </div>
                            <div class="modal-body">
                                <div class="container-fluid">
                                    ${this.renderData()}
                                </div>
                            </div>
                            ${this.config.buttons && this.config.buttons.show ?
                                html`
                                    <div class="modal-footer">
                                        <button type="button" class="${buttonClasses}" data-dismiss="modal" @click="${this.onClear}">
                                            ${this.config.buttons.cancelText ? this.config.buttons.cancelText : "Cancel"}
                                        </button>
                                        <button type="button" class="${buttonClasses}" data-dismiss="modal" @click="${this.onSubmit}">
                                            ${this.config.buttons.okText ? this.config.buttons.okText : "OK"}
                                        </button>
                                    </div>` :
                                null
                            }
                        </div>
                    </div>
                </div>
            `;
        }

        return html`
            <!-- Header -->
            ${this.config.title && this.config.display && this.config.display.showTitle ?
                html`
                    <div>
                        <h2 class="${titleClass}" >${this.config.title}</h2>
                    </div>` :
                null
            }

            <!-- Render buttons -->
            ${this.config.buttons && this.config.buttons.show && this.config.buttons.top ?
                this.renderButtons():
                null
            }

            <!-- Render data form -->
            ${this.data ? this.renderData() : null}

            <!-- Render buttons -->
            ${this.config.buttons && this.config.buttons.show && !this.config.buttons.top?
                this.renderButtons():
                null
            }
        `;
    }

}

customElements.define("data-form", DataForm);
