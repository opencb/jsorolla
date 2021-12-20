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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utilsNew.js";
import LitUtils from "../utils/lit-utils.js";
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
            updateParams: {
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
        this._prefixDates = [];
        this.formSubmitted = false;
        this.showGlobalValidationError = false;
        this.emptyRequiredFields = new Set();
        this.invalidFields = new Set();

        // We need to initialise 'data' in case undefined value is passed
        this.data = {};
    }

    firstUpdated(_changedProperties) {
        if (UtilsNew.isNotEmptyArray(this._prefixDates)) {
            console.log("Date Prefixes", this._prefixDates);
            this._prefixDates.forEach(prefix =>{
                $("#" + prefix + "DuePickerDate").datetimepicker({
                    format: "DD/MM/YYYY"
                });
                $("#" + prefix + "DuePickerDate").on("dp.change", e => {
                    this.onFilterChange(e.currentTarget.dataset.field, e.date.format("YYYYMMDDHHmmss"));
                });
            });
        }
    }

    update(changedProperties) {
        if (changedProperties.has("data")) {
            // Undefined or null values are accepted only when rendering form.
            // Check if 'data' passed is undefined or null and initialised to empty object
            this.dataObserver();
        }

        // Reset required and invalid fields sets
        this.emptyRequiredFields = new Set();
        this.invalidFields = new Set();

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
        } else if (defaultValue) {
            value = defaultValue;
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

    _getType() {
        // In case that we are using the deprecated form type, get type from display.mode.type
        return (this.config.type === "form") ? this.config.display?.mode?.type ?? "" : this.config.type ?? "";
    }

    // Get buttons layout
    // To be removed when deprecating old config.buttons.top property
    _getButtonsLayout() {
        const layout = this.config.display?.buttonsLayout || "";
        if (!layout || (layout !== "bottom" && layout !== "top")) {
            return this.config?.buttons?.top ? "top" : "bottom";
        }

        // Default: return layout from buttonsLayout or bottom
        return layout || "bottom";
    }

    _getDefaultValue(element) {
        // WARNING: element.defaultValue is deprecated, use element.display.defaultValue
        return element?.display?.defaultValue ?? element?.defaultValue ?? this.config?.display?.defaultValue ?? "";
    }

    _getErrorMessage(element, section) {
        const text = element?.display?.errorMessage ?? section?.display?.errorMessage ?? this.config?.display?.errorMessage ?? "Error: No valid data found";
        return html`<div><em>${text}</em></div>`;
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
        return element?.display?.width ?? this.config?.display?.defaultWidth ?? null;
    }

    _getSectionWidth(section) {
        return section?.display?.width ?? this.config?.display?.width ?? 12;
    }

    _getElementTitleWidth(element, section) {
        return element?.display?.titleWidth ?? section?.display?.titleWidth ?? this.config?.display?.titleWidth ?? null;
    }

    // DEPRECATED: use _getElementTitleWidth instead
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

    _getHelpMessage(element) {
        return element.display?.helpMessage ?? element.display?.help?.text ?? null;
    }

    _getHelpMode(element) {
        return element.display?.helpMode ?? element.display?.help?.mode ?? "";
    }

    _getHelpIcon(element, section) {
        return element?.display?.helpIcon ?? section?.display?.helpIcon ?? this.config?.display?.helpIcon ?? "fas fa-info-circle";
    }

    _getErrorIcon(element, section) {
        return element?.display?.errorIcon ?? section?.display?.errorIcon ?? this.config?.display?.errorIcon ?? "fas fa-times-circle";
    }

    _getDefaultLayout(element, section) {
        return element?.display?.defaultLayout ?? section?.display?.defaultLayout ?? this.config?.display?.defaultLayout ?? "horizontal";
    }

    _isUpdated(element) {
        if (!UtilsNew.isEmpty(this.updateParams)) {
            const [field, prop] = element.field.split(".");
            if (prop) {
                return typeof this.updateParams[field]?.[prop] !== "undefined";
            } else {
                return typeof this.updateParams[field] !== "undefined";
            }
        } else {
            // TODO Keep this for backward compatability, remove as soon as all update components pass 'updateParams'.
            return element.display?.updated;
        }
    }

    _isRequiredEmpty(element, value) {
        if (!value) {
            value = this.getValue(element.field) || this._getDefaultValue(element);
        }

        if (element.required) {
            if (value) {
                this.emptyRequiredFields.delete(element.field);
                return false;
            } else {
                this.emptyRequiredFields.add(element.field);
                return true;
            }
        }

        // Field not required --> skip validation
        return false;
    }

    _isValid(element, value) {
        if (!value) {
            value = this.getValue(element.field) || this._getDefaultValue(element);
        }

        if (typeof element?.validation?.validate === "function") {
            if (element.validation.validate(value)) {
                this.invalidFields.delete(element.field);
                return true;
            } else {
                this.invalidFields.add(element.field);
                return false;
            }
        }

        // No validation function provided --> we assume value is valid
        return true;
    }

    renderData() {
        // WARNING: display.classes is deprecated, use display.className instead
        const className = this.config?.display?.className ?? this.config?.display?.classes ?? "";
        const style = this.config?.display?.style ?? "";
        const layout = this.config?.display?.defaultLayout || "";
        const layoutClassName = (layout === "horizontal") ? "form-horizontal" : "";

        // Render custom display.layout array when provided
        if (this.config?.display?.layout && Array.isArray(this.config.display.layout)) {
            return html`
                <div class="${className}" style="${style}">
                    ${this.config?.display.layout.map(section => {
                        const sectionClassName = section.className ?? section.classes ?? "";
                        const sectionStyle = section.style ?? "";

                        return section.id ? html`
                            <div class="${layoutClassName} ${sectionClassName}" style="${sectionStyle}">
                                ${this._createSection(this.config.sections.find(s => s.id === section.id))}
                            </div>
                        ` : html`
                            <div class="${sectionClassName}" style="${sectionStyle}">
                                ${(section.sections || []).map(subsection => {
                                    const subsectionClassName = subsection.className ?? subsection.classes ?? "";
                                    const subsectionStyle = subsection.style ?? "";

                                    return subsection.id && html`
                                        <div class="${layoutClassName} ${subsectionClassName}" style="${subsectionStyle}">
                                            ${this._createSection(this.config.sections.find(s => s.id === subsection.id))}
                                        </div>
                                    `;
                                })}
                            </div>
                        `;
                    })}
                </div>
            `;
        } else {
            // Render without layout
            return html`
                <div class="${layoutClassName} ${className}" style="${style}">
                    ${this.config.sections.map(section => this._createSection(section))}
                </div>
            `;
        }
    }

    _createSection(section) {
        // Check if the section is visible
        if (section.display && !this._getBooleanValue(section.display.visible)) {
            return;
        }

        // Section values
        const sectionClassName = section?.display?.className ?? section?.display?.classes ?? "";
        const sectionStyle = section?.display?.style ?? "";
        const sectionWidth = "col-md-" + this._getSectionWidth(section);

        // Section title values
        const titleHeader = section?.display?.titleHeader ?? "h3";
        const titleClassName = section?.display?.titleClassName ?? section?.display?.titleClasses ?? "";
        const titleStyle = section?.display?.titleStyle ?? "";

        // Section description values
        const description = section.description ?? section.text ?? null;
        const descriptionClassName = section.display?.descriptionClassName ?? section.display?.textClass ?? "";
        const descriptionStyle = section.display?.descriptionStyle ?? section.display?.textStyle ?? "";

        return html`
            <div class="row" style="margin-bottom:16px;">
                <div class="${sectionWidth}">
                    ${section.title ? html`
                        <div style="margin-bottom:8px;">
                            ${this._getTitleHeader(titleHeader, section.title, titleClassName, titleStyle)}
                        </div>
                    ` : null}
                    ${description ? html`
                        <div style="margin-bottom:8px">
                            <div class="${descriptionClassName}" style="${descriptionStyle}">
                                <span>${description}</span>
                            </div>
                        </div>
                    ` : null}
                    <div class="${sectionClassName}" style="${sectionStyle}">
                        ${section.elements.map(element => this._createElement(element, section))}
                    </div>
                </div>
            </div>
        `;
    }

    _createElement(element, section) {
        // Check if the element is visible
        if (element.display && !this._getBooleanValue(element.display.visible)) {
            return;
        }

        // Check if type is 'separator', this is a special case, no need to parse 'name' and 'content'
        if (element.type === "separator") {
            return html`<hr style="${element.display?.style || ""}" />`;
        }

        // To store element content
        let content = "";

        // if not 'type' is defined we assumed is 'basic' and therefore field exist
        if (!element.type || element.type === "basic") {
            const format = element.display?.format ?? element.display; // 'format' is the old way, to be removed
            content = html`${this.getValue(element.field, this.data, this._getDefaultValue(element), format)}`;
        } else {
            // Other 'type' are rendered by specific functions
            switch (element.type) {
                case "text":
                case "title":
                    content = this._createTextElement(element);
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

        // Initialize element values
        const layout = this._getDefaultLayout(element, section);
        const width = this._getWidth(element) || 12;

        // Initialize container values
        const elementContainerClassName = element.display?.containerClassName ?? "";
        const elementContainerStyle = element.display?.containerStyle ?? "";

        // Initialize title values
        let title = element.title ?? element.name; // element.name is deprecated --> use element.title
        const titleClassName = element.display?.titleClassName ?? element.display?.labelClasses ?? "";
        const titleStyle = element.display?.titleStyle ?? element.display?.labelStyle ?? "";
        const titleVisible = element.display?.titleVisible ?? element.showLabel ?? true;
        const titleWidth = title && titleVisible ? this._getElementTitleWidth(element, section) ?? this._getLabelWidth(element, section) : 0;
        const titleAlign = element.display?.titleAlign ?? element.display?.labelAlign ?? "left";
        const titleRequiredMark = element.required ? html`<b class="text-danger" style="margin-left:8px;">*</b>` : "";

        // Help message
        const helpMessage = this._getHelpMessage(element);
        const helpMode = this._getHelpMode(element);

        // Templates are allowed in the names
        if (title?.includes("${")) {
            title = this.applyTemplate(title);
        }

        // Check for horizontal layout
        if (layout === "horizontal") {
            return html`
                <div class="row form-group ${elementContainerClassName}" style="${elementContainerStyle}">
                    ${title && titleVisible ? html`
                        <div class="col-md-${titleWidth}">
                            <label class="control-label ${titleClassName}" style="text-align:${titleAlign};${titleStyle}">
                                ${title} ${titleRequiredMark}
                            </label>
                        </div>
                    ` : null}
                    <div class="col-md-${(width - titleWidth)}">
                        <div>${content}</div>
                        ${helpMessage && helpMode === "block" ? html`
                            <div class="col-md-1" style="padding:0%; margin-top:8px" title="${helpMessage}">
                                <span><i class="${this._getHelpIcon(element, section)}"></i></span>
                            </div>
                        ` : null}
                    </div>
                </div>
            `;
        } else {
            return html`
                <div class="row form-group ${elementContainerClassName}" style="${elementContainerStyle}">
                    <div class="col-md-${width}">
                        ${title && titleVisible ? html`
                            <label class="control-label ${titleClassName}" style="${titleStyle}">
                                ${title} ${titleRequiredMark}
                            </label>
                        ` : null}
                        <div>${content}</div>
                    </div>
                </div>
            `;
        }
    }

    _createElementTemplate(element, value, content) {
        const isValid = this._isValid(element, value);
        const isRequiredEmpty = this._isRequiredEmpty(element, value);
        const hasErrorMessages = this.formSubmitted && (!isValid || isRequiredEmpty);

        // Help message
        const helpMessage = this._getHelpMessage(element);
        const helpMode = this._getHelpMode(element);

        return html`
            <div class="${hasErrorMessages ? "has-error" : ""}">
                ${content}
                ${helpMessage && helpMode !== "block" ? html`
                    <div class="help-block" style="margin:8px">${helpMessage}</div>
                ` : null}
                ${hasErrorMessages ? html`
                    <div class="help-block" style="display:flex;margin-top:8px;">
                        <div style="margin-right:8px">
                            <i class="${this._getErrorIcon(element)}"></i>
                        </div>
                        <div style="font-weight:bold;">
                            ${isRequiredEmpty ? "This field is required." : element.validation?.message || ""}
                        </div>
                    </div>
                ` : null}
            </div>
        `;
    }

    // WARNING: this method should be renamed as _createTextElement
    _createTextElement(element) {
        const textClass = element.display?.textClassName ?? element.display?.textClass ?? "";
        const textStyle = element.display?.textStyle ?? "";

        return html`
            <div class="${textClass}" style="${textStyle}">
                <span>${element.text || ""}</span>
            </div>
        `;
    }

    _createInputTextElement(element) {
        const value = this.getValue(element.field) || this._getDefaultValue(element);
        const disabled = this._getBooleanValue(element.display?.disabled, false);
        const rows = element.display && element.display.rows ? element.display.rows : 1;

        const content = html`
            <text-field-filter
                placeholder="${element.display?.placeholder}"
                .rows="${rows}"
                ?disabled="${disabled}"
                ?required="${element.required}"
                .value="${value}"
                .classes="${this._isUpdated(element) ? "updated" : ""}"
                @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
            </text-field-filter>
        `;

        return this._createElementTemplate(element, value, content);
    }

    _createInputNumberElement(element) {
        const value = this.getValue(element.field) ?? this._getDefaultValue(element);
        const disabled = this._getBooleanValue(element?.display?.disabled, false);
        const [min = "", max = ""] = element.allowedValues || [];
        const step = element.step || "1";

        const content = html`
            <number-field-filter
                label="Value"
                .value="${value ? value : ""}"
                .comparators="${element.comparators || null}"
                .allowedValues="${element.allowedValues || null}"
                .min="${min}"
                .max="${max}"
                .step="${step}"
                .placeholder="${element.display?.placeholder || ""}"
                .classes="${this._isUpdated(element) ? "updated" : ""}"
                @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
            </number-field-filter>
        `;

        return this._createElementTemplate(element, value, content);
    }

    _createInputDateElement(element) {
        const prefix = UtilsNew.randomString(8);
        const disabled = this._getBooleanValue(element.display?.disabled, false);
        this._prefixDates = [...this._prefixDates, prefix];
        const value = this.getValue(element.field) || this._getDefaultValue(element);
        if (typeof value !== "undefined" && value !== null) {
            const inputDate = this.querySelector("#" + prefix + "DueDate");
            if (inputDate) {
                if (typeof element?.display?.render === "function") {
                    inputDate.value = element.display.render(value);
                } else {
                    inputDate.value = value;
                }
            }
        }

        const content = html`
            <div class="input-group date" id="${prefix}DuePickerDate" data-field="${element.field}">
                <input
                    type="text"
                    id="${prefix}DueDate"
                    class="${prefix}Input form-control"
                    data-field="${element.field}"
                    ?disabled="${disabled}">
                <span class="input-group-addon">
                    <span class="fa fa-calendar"></span>
                </span>
            </div>
        `;

        return this._createElementTemplate(element, value, content);
    }

    _createCheckboxElement(element) {
        let value = this.getValue(element.field); // || this._getDefaultValue(element);
        const disabled = this._getBooleanValue(element.display?.disabled, false);

        // if (element.field.endsWith("FILTER")) {
        // }

        // TODO to be fixed.
        if (element.field === "FILTER") {
            value = value === "PASS";
            element.text = "Include only PASS variants";
        }

        return html`
            <label style="font-weight: normal;margin: 0">
                <input
                    type="checkbox"
                    class="${this._prefix}FilterCheckbox"
                    .checked="${value}"
                    ?disabled="${disabled}"
                    @click="${e => this.onFilterChange(element.field, e.currentTarget.checked)}">
                <span style="margin: 0 5px">${element.text}</span>
            </label>
        `;
    }

    /**
     * This element accepts 4 main parameters: onText, offText, activeClass and inactiveClass.
     * Default values are: ON, OFF, btn-primary and btn-default, respectively.
     * @param {Object} element
     * @returns {TemplateResult}
     * @private
     */
    _createToggleSwitchElement(element) {
        const value = this.getValue(element.field); // || this._getDefaultValue(element);
        const disabled = this._getBooleanValue(element.display?.disabled, false);
        const activeClassName = element.display?.activeClassName ?? element.display?.activeClass ?? "";
        const inactiveClassName = element.display?.inactiveClassName ?? element.display?.inactiveClass ?? "";

        return html`
            <div class="">
                <toggle-switch
                    .disabled="${disabled}"
                    .value="${value}"
                    .onText="${element.display?.onText}"
                    .offText="${element.display?.offText}"
                    .activeClass="${activeClassName}"
                    .inactiveClass="${inactiveClassName}"
                    .classes="${this._isUpdated(element) ? "updated" : ""}"
                    @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                </toggle-switch>
            </div>
        `;
    }

    _createToggleButtonsElement(element) {
        const value = this.getValue(element.field) || this._getDefaultValue(element);
        const names = element.allowedValues;
        const activeClassName = element.display?.activeClassName ?? element.display?.activeClass ?? "";
        const inactiveClassName = element.display?.inactiveClassName ?? element.display?.inactiveClass ?? "";

        return html`
            <div class="">
                <toggle-buttons
                    .names="${names}"
                    .value="${value}"
                    .activeClass="${activeClassName}"
                    .inactiveClass="${inactiveClassName}"
                    .classes="${this._isUpdated(element) ? "updated" : ""}"
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
                    if (values && element.display?.apply) {
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
                if (element.display?.apply) {
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
        // const width = this._getWidth(element);

        if (allowedValues && allowedValues.length > 0) {
            const content = html`
                <div class="">
                    <select-field-filter
                        .data="${allowedValues}"
                        ?multiple="${element.multiple}"
                        ?disabled="${disabled}"
                        ?required="${element.required}"
                        .value="${defaultValue}"
                        .classes="${this._isUpdated(element) ? "updated" : ""}"
                        @filterChange="${e => this.onFilterChange(element.field, e.detail.value)}">
                    </select-field-filter>
                </div>
            `;

            return this._createElementTemplate(element, null, content);
        } else {
            return this._getErrorMessage(element);
        }
    }

    _createComplexElement(element, data = this.data) {
        if (!element.display?.template) {
            return html`<span class="text-danger">No template provided</span>`;
        }
        return html`
            <span>
                ${UtilsNew.renderHTML(this.applyTemplate(element.display.template, data, null, this._getDefaultValue(element)))}
            </span>
        `;
    }

    _createListElement(element) {
        // Get values
        const array = this.getValue(element.field);
        const contentLayout = element.display?.contentLayout || "horizontal";

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
        if (element.display?.render) {
            for (const object of array) {
                const value = element.display.render(object);
                values.push(value);
            }
        } else {
            if (element.display?.template) {
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
        let array = this.getValue(element.field);
        const errorMessage = this._getErrorMessage(element);
        const errorClassName = element.display?.errorClassName ?? element.display?.errorClasses ?? "text-danger";
        const headerVisible = this._getBooleanValue(element.display?.headerVisible, true);

        // Check values
        if (!array) {
            return html`
                <span class="${errorClassName}">
                    ${errorMessage ?? `Type 'table' requires a valid array field: ${element.field} not found`}
                </span>
            `;
        }
        if (!Array.isArray(array)) {
            return html`
                <span class="${errorClassName}">
                    Field '${element.field}' is not an array
                </span>
            `;
        }
        if (typeof element.display?.transform === "function") {
            array = element.display.transform(array);
        }
        if (!array.length) {
            // return this.getDefaultValue(element);
            return html`<span>${this._getDefaultValue(element)}</span>`;
        }
        if (!element.display && !element.display.columns) {
            return html`
                <span class="${errorClassName}">
                    Type 'table' requires a 'columns' array
                </span>
            `;
        }

        return html`
            <table class="table" style="display: inline">
                ${headerVisible ? html`
                    <thead>
                    <tr>
                        ${element.display.columns.map(elem => html`
                            <th scope="col">${elem.title || elem.name}</th>
                        `)}
                    </tr>
                    </thead>
                ` : null}
                <tbody>
                ${array.map(row => html`
                    <tr scope="row">
                        ${element.display.columns.map(elem => {
                            const elemClassName = elem.display?.className ?? elem.display?.classes ?? "";
                            const elemStyle = elem.display?.style ?? "";
                            let content = null;

                            // Check the element type
                            switch (elem.type) {
                                case "complex":
                                    content = this._createComplexElement(elem, row);
                                    break;
                                case "custom":
                                    content = elem.display?.render && elem.display.render(this.getValue(elem.field, row));
                                    break;
                                default:
                                    content = this.getValue(elem.field, row, elem.defaultValue, elem.format);
                            }

                            return html`
                                <td class="${elemClassName}" style="${elemStyle}">
                                    ${content}
                                </td>
                            `;
                        })}
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
                <simple-chart
                    .active="${true}"
                    .type="${element.display?.highcharts?.chart?.type || "column"}"
                    .title="${element.display?.highcharts?.title?.text || element.name}"
                    .data="${data}"
                    .config="${element.display?.highcharts}">
                </simple-chart>
            `;
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
            return html`
                <span class="text-danger">apply() function that provides a 'text' property is mandatory in Tree-Viewer elements</span>
            `;
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
        if (typeof element.display?.render !== "function") {
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
            // const width = this._getWidth(element);
            // const style = element.display.style ? element.display.style : "";
            // return html`<div class="col-md-${width}" style="${style}">${result}</div>`;
            return this._createElementTemplate(element, data, result);
        } else {
            return this._getErrorMessage(element);
        }
    }

    _createDownloadElement(element) {
        return html`
            <download-button
                .json="${this.data}"
                name="${element.title ?? element.name}">
            </download-button>
        `;
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
        this.formSubmitted = false;
        this.showGlobalValidationError = false;
        LitUtils.dispatchCustomEvent(this, "clear", null, {}, null);
    }

    onSubmit(e) {
        // Check if has invalid fields (not valid or required not filled)
        const hasInvalidFields = this.emptyRequiredFields.size > 0 || this.invalidFields.size > 0;
        if (hasInvalidFields) {
            this.formSubmitted = true; // Form has been submited, display errors
            return this.requestUpdate();
        }

        // Check for final validation
        if (typeof this.config?.validation?.validate === "function") {
            if (!this.config.validation.validate(this.data)) {
                this.showGlobalValidationError = true;
                return this.requestUpdate();
            }
        }

        // Form valid --> dispatch submit event
        this.formSubmitted = false;
        this.showGlobalValidationError = false;
        LitUtils.dispatchCustomEvent(this, "submit", null, {}, null);
    }

    onCustomEvent(e, eventName, data) {
        LitUtils.dispatchCustomEvent(this, eventName, data);
    }

    renderGlobalValidationError() {
        if (this.showGlobalValidationError) {
            return html`
                <div class="help-block" style="display:flex;margin-bottom:16px;">
                    <div class="text-danger" style="margin-right:16px">
                        <i class="${this._getErrorIcon(null, null)}"></i>
                    </div>
                    <div class="text-danger" style="font-weight:bold;">
                        ${this.config?.validation?.message || "There are some invalid fields..."}
                    </div>
                </div>
            `;
        }

        // No validation error to display
        return null;
    }

    renderButtons(dismiss) {
        const btnClassName = this.config.display?.buttonsClassName ?? this.config.buttons?.classes ?? "";
        const btnStyle = this.config.display?.buttonsStyle ?? this.config.buttons?.style ?? "";
        const btnWidth = this.config.display?.buttonsWidth ?? 12;
        const btnAlign = this.config.display?.buttonsAlign ?? "left";

        return html`
            ${this.renderGlobalValidationError()}
            <div class="row">
                <div align="${btnAlign}" class="col-md-${btnWidth}" style="padding-top:16px;">
                    <button type="button" class="btn btn-default ${btnClassName}" data-dismiss="${dismiss}" style="${btnStyle}" @click="${this.onClear}">
                        ${this.config?.buttons?.cancelText || "Cancel"}
                    </button>
                    <button type="button" class="btn btn-primary ${btnClassName}" data-dismiss="${dismiss}" style="${btnStyle}" @click="${this.onSubmit}">
                        ${this.config?.buttons?.okText || "OK"}
                    </button>
                </div>
            </div>
        `;
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

        // Global values
        const type = this._getType(); // Get form type
        const icon = this.config?.icon ?? "fas fa-info-circle";

        // Title values
        const titleClassName = this.config.display?.titleClassName ?? this.config.display?.title?.class ?? "";
        const titleStyle = this.config.display?.titleStyle ?? this.config.display?.title?.style ?? "";
        const titleVisible = this._getBooleanValue(this.config.display?.titleVisible ?? this.config.display?.showTitle, true);

        // Buttons values
        const buttonsVisible = this._getBooleanValue(this.config.display?.buttonsVisible ?? this.config.buttons?.show, true);
        const buttonsLayout = this._getButtonsLayout();

        // Check for card type
        if (type === "card") {
            return html`
                <div class="row">
                    <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#${this._prefix}Help">
                        <i class="${icon} icon-padding" aria-hidden="true"></i>
                        ${this.config.title}
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

        // Check for modal type
        if (type === "modal") {
            const modalBtnClassName = this.config.display?.modalButtonClassName ?? this.config.display?.mode?.buttonClass ?? "";
            const modalBtnStyle = this.config.display?.modalButtonStyle ?? this.config.display?.mode?.buttonStyle ?? "";
            const modalWidth = this.config.display?.modalWidth ?? this.config.display?.mode?.width ?? "768px";
            const isDisabled = this._getBooleanValue(this.config.display?.modalDisabled ?? this.config.display?.mode?.disabled, false);

            return html`
                <button type="button"
                        title="${this.config.description}"
                        class="btn ${modalBtnClassName} ${isDisabled ? "disabled" : ""}"
                        style="${modalBtnStyle}"
                        data-toggle="modal"
                        ?disabled="${isDisabled}"
                        data-target="#${this._prefix}DataModal">
                    <i class="${icon} icon-padding" aria-hidden="true"></i>
                    ${this.config.title}
                </button>

                <div class="modal fade" id="${this._prefix}DataModal" tabindex="-1" role="dialog" aria-labelledby="${this._prefix}DataModalLabel"
                     aria-hidden="true">
                    <div class="modal-dialog" style="width: ${modalWidth}">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title ${titleClassName}" style="${titleStyle}">${this.config.title}</h4>
                            </div>
                            <div class="modal-body">
                                <div class="container-fluid">
                                    ${this.renderData()}
                                </div>
                            </div>
                            ${buttonsVisible ? html`
                                <div class="modal-footer">
                                    ${this.renderButtons("modal")}
                                </div>
                            ` : null}
                        </div>
                    </div>
                </div>
            `;
        }

        // Default form style
        return html`
            <!-- Header -->
            ${this.config.title && titleVisible ? html`
                <div style="display:flex;margin-bottom:16px;">
                    <div>
                        <h2 class="${titleClassName}" style="${titleStyle}">${this.config.title}</h2>
                    </div>
                    ${this.config.logo ? html`
                        <div style="margin-left:auto;">
                            <img src="${this.config.logo}" />
                        </div>
                    `: null}
                </div>
            ` : null}

            <!-- Render buttons -->
            ${buttonsVisible && buttonsLayout === "top" ? this.renderButtons(null) : null}

            <!-- Render data form -->
            ${this.data ? this.renderData() : null}

            <!-- Render buttons -->
            ${buttonsVisible && buttonsLayout === "bottom" ? this.renderButtons(null) : null}
        `;
    }

}

customElements.define("data-form", DataForm);
