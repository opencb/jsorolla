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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";
import "../simple-chart.js";
import "../json-viewer.js";
import "../json-editor.js";
import "../../tree-viewer.js";
import "../../download-button.js";
import "../forms/text-field-filter.js";
import "./toggle-switch.js";
import "./toggle-buttons.js";
import "../data-table.js";
import PdfBuilder from "./pdf-builder.js";

export default class DataForm extends LitElement {

    static ARRAY_FIELD_REGULAR_EXPRESSION = /(?<arrayFieldName>[a-zA-Z.]+)\[\].(?<index>[0-9]+).(?<field>[a-zA-Z.]+)/;

    static NOTIFICATION_TYPES = {
        error: "alert alert-danger",
        info: "alert alert-info",
        success: "alert alert-success",
        warning: "alert alert-warning"
    };

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
            originalData: {
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
        this.formSubmitted = false;
        this.showGlobalValidationError = false;
        this.emptyRequiredFields = new Set();
        this.invalidFields = new Set();
        this.activeSection = 0; // Initial active section (only for tabs and pills type)

        this.objectListItems = {};
        this.batchItems = {};

        // We need to initialise 'data' in case undefined value is passed
        this.data = {};
        // Maintains a data model of the data that has been filled out using the search autocomplete
        this.dataAutocomplete = {};
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
        this.data = this.data ?? {};
    }

    getValue(field, object = this.data, defaultValue, display) {
        let value;
        if (field) {
            // If field contains [] means the element type is object-list,
            // we need to get the value from the array, information is encoded as:
            //   phenotypes[].1.id: field id from second item of phenotypes
            if (field.includes("[]")) {
                const [parentItemArray, right] = field.split("[].");
                if (right?.includes(".")) {
                    const [itemIndex, ...itemFieldIds] = right.split(".");
                    // Support nested object
                    if (itemFieldIds.length === 1) {
                        value = UtilsNew.getObjectValue(object, parentItemArray, "")[itemIndex][itemFieldIds[0]];
                    } else {
                        value = UtilsNew.getObjectValue(object, parentItemArray, "")[itemIndex][itemFieldIds[0]]?.[itemFieldIds[1]];
                    }
                } else {
                    // FIXME this should never be reached
                    console.error("This should never be reached");
                }
            } else {
                // Optional chaining is needed when "res" is undefined
                value = field.split(".").reduce((res, prop) => res?.[prop], object);
            }

            // If 'value' exists we must apply the functions, DO NOT change the order
            if (value || typeof value === "boolean") {
                if (display?.format) {
                    // Check if response is actually an HTML
                    // value = UtilsNew.renderHTML(display.format(value));
                    value = display.format(value, object);
                }
                if (display?.link) {
                    const href = display.link.replace(field.toUpperCase(), value);
                    value = html`<a href="${href}" target="_blank">${value}</a>`;
                }
                if (display?.className || display?.classes || display?.style) {
                    const style = this._parseStyleField(display.style, value, object);
                    value = html`<span class="${display.className || display.classes}" style="${style}">${value}</span>`;
                }
                // TODO this should be deprecated, we can use 'format' now
                if (display?.decimals && !isNaN(value)) {
                    value = value.toFixed(display.decimals);
                }
            } else {
                value = defaultValue;
            }
        } else {
            value = defaultValue;
        }

        return value;
    }

    applyTemplate(template, data, defaultValue, element) {
        // Parse template string and find matches groups
        const matches = template
            .match(/\$\{[a-zA-Z_.\[\]]+}/g)
            .map(elem => elem.substring(2, elem.length - 1));

        for (const match of matches) {
            // Check if 'style' has been defined for this match variable, example:
            //     {
            //         title: "Format",
            //         type: "complex",
            //         display: {
            //             template: "${format} (${bioformat})",
            //             format: {
            //                 "format": value => value.toUpperCase()
            //             },
            //             style: {
            //                  format: {
            //                      "font-weight": "bold",
            //                      "color": (value, data) => {...}
            //                  },
            //                  bioformat: {
            //                      "color": "green"
            //                  }
            //              },
            //              link: {
            //                  format: (value, data) => https://...
            //              }
            //          },
            //     },
            let value = this.getValue(match, data, defaultValue);
            if (element?.display?.format?.[match]) {
                value = element?.display?.format?.[match](value, data);
            }
            if (element?.display?.link?.[match]) {
                const href = element?.display?.link?.[match](value, data);
                value = href ? `<a href="${href}" target="_blank">${value}</a>` : value;
            }
            if (element?.display?.className?.[match] || element?.display?.style?.[match]) {
                const style = this._parseStyleField(element.display?.style?.[match], value, data);
                const className = this._parseClassField(element.display?.className?.[match], value, data);
                value = `<span class="${className||""}" style="${style}">${value}</span>`;
            }

            // eslint-disable-next-line no-param-reassign
            template = template.replace("${" + match + "}", value);
        }

        return template;
    }

    // Convert a 'string' or 'object' field to the HTML style string, ie. "font-weight: bold;color:red"
    _parseStyleField(elementStyle, value, data = this.data) {
        let style = elementStyle || "";
        if (elementStyle && typeof elementStyle === "object") {
            const styles = [];
            for (const [k, v] of Object.entries(elementStyle)) {
                if (typeof v === "string") {
                    styles.push(`${k}: ${v}`);
                } else {
                    if (typeof v === "function" && value) {
                        const value2 = v(value, data);
                        styles.push(`${k}: ${value2}`);
                    }
                }
            }
            style = styles.join(";");
        }
        return style;
    }

    _parseClassField(elementClass, value, data = this.data) {
        let resultClass = elementClass || "";
        if (elementClass && typeof elementClass == "function") {
            resultClass = elementClass(value, data);
        }
        return resultClass;
    }

    _getType() {
        // In case that we are using the deprecated form type, get type from display.mode.type
        return (this.config.type === "form") ? this.config.display?.mode?.type ?? "" : this.config.type ?? "";
    }

    // Get buttons layout
    // FIXME To be removed when deprecating old config.buttons.top property
    _getButtonsLayout() {
        const layout = this.config.display?.buttonsLayout || "";
        if (!layout || (layout !== "bottom" && layout !== "top" && layout !== "upper")) {
            return this.config?.buttons?.top ? "top" : "bottom";
        }

        // Default: return layout from buttonsLayout or bottom
        return layout || "bottom";
    }

    _getDefaultValue(element, section) {
        // Preference order: element, section and then global config
        return element?.display?.defaultValue ?? section?.display?.defaultValue ?? this.config?.display?.defaultValue ?? "";
    }

    _getDefaultErrorMessage(element, section) {
        // const text = element?.display?.errorMessage ?? section?.display?.errorMessage ?? this.config?.display?.errorMessage ?? "Error: No valid data found";
        // return html`<div><em>${text}</em></div>`;
        return element?.display?.errorMessage ?? section?.display?.errorMessage ?? this.config?.display?.errorMessage ?? "Error: No valid data found";
    }

    /**
     * Check if visible field is defined and not null, be careful since 'visible' can be a 'boolean' or a 'function'.
     * @param value
     * @param defaultValue
     * @param element
     * @returns {boolean} Default value is 'true' so it is visible.
     * @private
     */
    _getBooleanValue(value, defaultValue, element) {
        let _value = typeof defaultValue !== "undefined" ? defaultValue : true;
        if (typeof value !== "undefined" && value !== null) {
            if (typeof value === "boolean") {
                _value = value;
            } else {
                if (typeof value === "function") {
                    // example: phenotypes[].1.description
                    if (element?.field?.includes("[].")) {
                        const match = element.field.match(DataForm.ARRAY_FIELD_REGULAR_EXPRESSION);
                        if (match) {
                            const itemArray = UtilsNew.getObjectValue(this.data, match?.groups?.arrayFieldName, "")[match?.groups?.index];
                            _value = value(this.data, itemArray);
                        } else {
                            _value = value(this.data);
                        }
                    } else {
                        _value = value(this.data);
                    }
                } else {
                    console.error(`Expected boolean or function value, but got '${typeof value}'`);
                }
            }
        }
        return _value;
    }

    _getSectionWidth(section) {
        return section?.display?.width ?? this.config?.display?.width ?? 12;
    }

    _getDefaultLayout(element, section) {
        return element?.display?.defaultLayout ?? section?.display?.defaultLayout ?? this.config?.display?.defaultLayout ?? "horizontal";
    }

    _getElementWidth(element, section) {
        return element?.display?.width ?? section?.display?.elementWidth ?? this.config?.display?.elementWidth ?? null;
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
        if (typeof element.display?.helpMessage === "function") {
            const fieldValue = element.field ? this.getValue(element.field) : null;
            return element.display.helpMessage(fieldValue, this.data);
        } else {
            return element.display?.helpMessage ?? element.display?.help?.text ?? null;
        }
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

    _getVisibleSections() {
        return this.config.sections
            .filter(section => section.elements[0].type !== "notification" || section.elements.length > 1)
            .filter(section => this._getBooleanValue(section?.display?.visible, true));
    }

    _isUpdated(element) {
        if (UtilsNew.isNotEmpty(this.updateParams)) {
            // 1. Check if element.field exists
            const fieldExists = this.updateParams[element.field];
            if (fieldExists) {
                return true;
            } else {
                // 2. Check if field is part of a new ADDED object-list, example:  'phenotypes[].1'  (no fields)
                if (element.field.includes("[]")) {
                    const match = element.field.match(DataForm.ARRAY_FIELD_REGULAR_EXPRESSION);
                    return !!this.updateParams[match?.groups?.arrayFieldName + "[]." + match?.groups?.index]?.after?.[match?.groups?.field];
                } else {
                    // 3. To display object-list root elements check if the prefix exists, example: 'phenotypes'
                    // 3.1 Check if any original item has been deleted
                    if (this.updateParams[element.field + "[].deleted"]?.length > 0) {
                        return true;
                    } else {
                        // 3.2 Check if any original item has been edited
                        return Object.keys(this.updateParams)
                            .filter(key => key !== element.field + "[].deleted")
                            .some(key => key.startsWith(element.field + "[]."));
                    }
                }
            }
        }
    }

    _isRequiredEmpty(element, value) {
        if (!value) {
            // eslint-disable-next-line no-param-reassign
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
            // eslint-disable-next-line no-param-reassign
            value = this.getValue(element.field) || this._getDefaultValue(element);
        }

        if (typeof element?.validation?.validate === "function") {
            // When an object-list, get the item being validated.
            let item;
            if (element.field.includes("[]")) {
                const match = element.field.match(DataForm.ARRAY_FIELD_REGULAR_EXPRESSION);
                if (match) {
                    item = UtilsNew.getObjectValue(this.data, match?.groups?.arrayFieldName, "")[match?.groups?.index];
                }
            }
            if (element.validation.validate(value, this.data, item)) {
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
        const style = this._parseStyleField(this.config?.display?.style);
        const layout = this.config?.display?.defaultLayout || "";
        const layoutClassName = (layout === "horizontal") ? "form-horizontal" : "";

        // if (this.config.type === "tabs" || this.config.type === "pills") {
        if (this.config?.type === "tabs" || this.config?.display?.type === "tabs" ||
            this.config?.type === "pills" || this.config?.display?.type === "pills") {
            // Render all sections but display only active section
            return html`
                <div class="${layoutClassName} ${className}" style="${style}">
                    ${this._getVisibleSections()
                        .map((section, index) => html`
                        <div class="d-${this.activeSection === index ? "block": "none"}">
                            ${this._createSection(section)}
                        </div>
                    `)}
                </div>
            `;
        } else {
            // Check if a custom layout has been provided. We render each section in the right layout region
            if (this.config?.display?.layout && Array.isArray(this.config.display.layout)) {
                // Render with a specific layout
                return html`
                    <div class="${className}" style="${style}">
                        ${this.config?.display.layout
                            .map(section => {
                                const sectionClassName = section.className ?? section.classes ?? "";
                                const sectionStyle = section.style ?? "";

                                if (section.id) {
                                    return html`
                                        <div class="${layoutClassName} ${sectionClassName}" style="${sectionStyle}">
                                            ${this._createSection(this.config.sections.find(s => s.id === section.id))}
                                        </div>
                                    `;
                                } else {
                                    // this section contains nested subsections: 'sections'
                                    return html`
                                        <div class="${sectionClassName}" style="${sectionStyle}">
                                            ${(section.sections || [])
                                                .map(subsection => {
                                                    const subsectionClassName = subsection.className ?? subsection.classes ?? "";
                                                    const subsectionStyle = this._parseStyleField(subsection.style);
                                                    if (subsection.id) {
                                                        return html`
                                                            <div class="${layoutClassName} ${subsectionClassName}" style="${subsectionStyle}">
                                                                ${this._createSection(this.config.sections.find(s => s.id === subsection.id))}
                                                            </div>
                                                        `;
                                                    } else {
                                                        return nothing;
                                                    }
                                                })
                                            }
                                        </div>
                                    `;
                                }
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
    }

    _createSection(section) {
        // Check if the section is visible
        if (section.display && !this._getBooleanValue(section.display.visible)) {
            return nothing;
        }

        // Section values
        const sectionClassName = section?.display?.className ?? section?.display?.classes ?? nothing;
        const sectionStyle = section?.display?.style ?? nothing;
        const sectionWidth = "col-md-" + this._getSectionWidth(section);

        // Section title values
        const titleHeader = section?.display?.titleHeader ?? "h3";
        const titleClassName = section?.display?.titleClassName ?? section?.display?.titleClasses ?? nothing;
        const titleStyle = section?.display?.titleStyle ?? nothing;

        // Section description values
        const description = section.description ?? section.text ?? null;
        const descriptionClassName = section.display?.descriptionClassName ?? "form-text";
        const descriptionStyle = section.display?.descriptionStyle ?? section.display?.textStyle ?? "";

        const buttonsVisible = this._getBooleanValue(section.display?.buttonsVisible ?? false);

        let content;
        // Check if a custom layout has been provided
        if (section.display?.layout && Array.isArray(section.display.layout)) {
            // Render with a specific layout
            content = html`
                <div class="${sectionClassName}" style="${sectionStyle}">
                    ${section.display.layout
                        .map(element => {
                            const elementClassName = element.className ?? element.classes ?? "";
                            const elementStyle = element.style ?? "";

                            if (element.id) {
                                return html`
                                    <div class="${elementClassName}" style="${elementStyle}">
                                        ${this._createElement(section.elements.find(s => s.id === element.id))}
                                    </div>
                                `;
                            } else {
                                // this section contains nested subsections: 'sections'
                                return html`
                                    <div class="${elementClassName}" style="${elementStyle}">
                                        ${(element.elements || [])
                                            .map(subelement => {
                                                const subsectionClassName = subelement.className ?? subelement.classes ?? "";
                                                const subsectionStyle = this._parseStyleField(subelement.style);
                                                if (subelement.id) {
                                                    return html`
                                                        <div class="${subsectionClassName}" style="${subsectionStyle}">
                                                            ${this._createElement(section.elements.find(s => s.id === subelement.id))}
                                                        </div>
                                                    `;
                                                } else {
                                                    return nothing;
                                                }
                                            })
                                        }
                                    </div>
                                `;
                            }
                        })}
                </div>
            `;
        } else {
            // Otherwise render vertically
            content = html`
                <div class="${sectionClassName}" style="${sectionStyle}">
                    ${section.elements.map(element => this._createElement(element, section))}
                </div>
            `;
        }

        return html`
            <div class="row mb-3">
                <div class="${sectionWidth}">
                    ${section.title ? html`
                        <div class="mb-3">
                            ${this._getTitleHeader(titleHeader, section.title, titleClassName, titleStyle)}
                        </div>
                    ` : nothing}
                    ${description ? html`
                        <div class="mb-3">
                            <div class="${descriptionClassName}" style="${descriptionStyle}">
                                <span>${description}</span>
                            </div>
                        </div>
                    ` : nothing}
                    ${content}
                </div>
            </div>
            ${buttonsVisible ? this.renderButtons(null, section?.id) : null}
        `;
    }

    _createElement(element, section) {
        // Check if the element is visible
        if (element.display && !this._getBooleanValue(element.display.visible, true, element)) {
            return nothing;
        }

        // Check if type is 'separator', this is a special case, no need to parse 'name' and 'content'
        if (element.type === "separator") {
            // https://getbootstrap.com/docs/5.3/content/reboot/#horizontal-rules
            return html`<hr style="${element.display?.style || ""}" />`;
        }

        // To store element content
        let content = "";

        // if not 'type' is defined we assumed is 'basic' and therefore field exist
        if (!element.type || element.type === "basic") {
            content = html`${this.getValue(element.field, this.data, this._getDefaultValue(element, section), element.display)}`;
        } else {
            // Other 'type' are rendered by specific functions
            switch (element.type) {
                // View elements
                case "text":
                case "title":
                case "notification":
                    content = this._createTextElement(element);
                    break;
                case "complex":
                    content = this._createComplexElement(element, this.data, section);
                    break;
                case "list":
                    content = this._createListElement(element, this.data, section);
                    break;
                case "table":
                    content = this._createTableElement(element, this.data, section);
                    break;
                case "image":
                    content = this._createImageElement(element);
                    break;
                case "chart":
                case "plot":
                    content = this._createPlotElement(element);
                    break;
                case "json":
                    content = this._createJsonElement(element, section);
                    break;
                case "tree":
                    content = this._createTreeElement(element);
                    break;
                case "download":
                    content = this._createDownloadElement(element);
                    break;
                case "custom":
                    content = html`${this._createCustomElement(element)}`;
                    break;

                // Form controls and editors
                case "input-text":
                    content = this._createInputElement(element, "text", section);
                    break;
                case "input-num":
                    content = this._createInputElement(element, "number", section);
                    break;
                case "input-password":
                    content = this._createInputElement(element, "password", section);
                    break;
                case "input-number":
                    content = this._createInputNumberElement(element, section);
                    break;
                case "input-date":
                    content = this._createInputDateElement(element, section);
                    break;
                case "checkbox":
                    content = this._createCheckboxElement(element);
                    break;
                case "select":
                    content = this._createInputSelectElement(element);
                    break;
                case "toggle-switch":
                    content = this._createToggleSwitchElement(element);
                    break;
                case "toggle-buttons":
                    content = this._createToggleButtonsElement(element);
                    break;
                case "json-editor":
                    content = this._createJsonEditorElement(element);
                    break;
                case "object":
                    content = this._createObjectElement(element);
                    break;
                case "object-list":
                    content = this._createObjectListElement(element);
                    break;
                default:
                    throw new Error("Element type not supported:" + element.type);
            }
        }

        // Only nested in 'object' and 'object-list', in these cases we do not want to create the rest of the HTML
        if (element?.display?.nested) {
            return content;
        }

        // Initialize element values
        const layout = this._getDefaultLayout(element, section);
        const width = this._getElementWidth(element, section) || 12;

        // Initialize container values
        const elementContainerClassName = element.display?.containerClassName ?? "";
        const elementContainerStyle = element.display?.containerStyle ?? nothing;

        // Initialize title values
        let title = element.title ?? element.name; // element.name is deprecated --> use element.title
        const titleClassName = element.display?.titleClassName ?? element.display?.labelClasses ?? "";
        const titleStyle = element.display?.titleStyle ?? element.display?.labelStyle ?? "";
        const titleVisible = element.display?.titleVisible ?? element.showLabel ?? true;
        const titleWidth = title && titleVisible ? this._getElementTitleWidth(element, section) ?? this._getLabelWidth(element, section) : 0;
        const titleAlign = element.display?.titleAlign ?? element.display?.labelAlign ?? "left";
        const titleRequiredMark = element.required ? html`<b class="text-danger ms-2">*</b>` : "";

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
                <div class="row mb-3 ${elementContainerClassName}" style="${elementContainerStyle}">
                    ${title && titleVisible ? html`
                        <div class="col-md-${titleWidth} fw-bold ${titleClassName}" style="text-align:${titleAlign};${titleStyle}">
                            ${title} ${titleRequiredMark}
                        </div>
                    ` : nothing}
                    <div class="col-md-${(width - titleWidth)}">
                        ${content}
                        ${helpMessage && helpMode === "block" ? html`
                            <div class="col-md-1 pt-0 mt-2" title="${helpMessage}">
                                <span><i class="${this._getHelpIcon(element, section)}"></i></span>
                            </div>
                        ` : nothing}
                    </div>
                </div>
            `;
        } else {
            return html`
                <div class="row mb-3 ${elementContainerClassName}" style="${elementContainerStyle}">
                    <div class="col-md-${width}">
                        ${title && titleVisible ? html`
                            <label class="fw-bold form-label pt-0 ${titleClassName}" style="${titleStyle}">
                                ${title} ${titleRequiredMark}
                            </label>
                        ` : nothing}
                        ${content}
                    </div>
                </div>
            `;
        }
    }

    _createElementTemplate(element, value, content, error) {
        const isValid = this._isValid(element, value);
        const isRequiredEmpty = this._isRequiredEmpty(element, value);
        const hasErrorMessages = this.formSubmitted && (!isValid || isRequiredEmpty);

        // Help message
        const helpMessage = this._getHelpMessage(element);
        const helpMode = this._getHelpMode(element);

        if (error) {
            return html `
                <span class="${error.className}">
                    ${error.message || "Error"}
                </span>
            `;
        }

        // Check if 'content' is passed as a string or an array, then we must convert it to HTML
        let contentHtml = content;
        if (typeof content === "string") {
            contentHtml = UtilsNew.renderHTML(content);
        } else {
            // Note 20240125 Vero:
            // Added a second condition that ensures that all elements of the array are strings.
            // Some of the content arrays are arrays of lit objects (e.g, content received from object-list elements)
            if (Array.isArray(content) && content.every(element => typeof element === "string")) {
                contentHtml = UtilsNew.renderHTML(content.join(""));
            }
        }

        return html`
            <div class="${hasErrorMessages ? "text-danger" : nothing}">
                <div data-testid="${this.config.test?.active ? `${this.config.test.prefix || "test"}-${element.field}` : nothing}">
                    ${contentHtml}
                </div>
                ${helpMessage && helpMode !== "block" ? html`
                    <div class="form-text">${helpMessage}</div>
                ` : nothing}
                ${hasErrorMessages ? html`
                    <div class="d-flex mt-2 text-body-secondary">
                        <div class="me-2">
                            <i class="${this._getErrorIcon(element)}"></i>
                        </div>
                        <div class="fw-bold">
                            ${isRequiredEmpty ? "This field is required." : element.validation?.message || nothing}
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    _createTextElement(element) {
        const value = typeof element.text === "function" ? element.text(this.data, element.field) : element.text;
        const textClass = element.display?.textClassName ?? "";
        const textStyle = element.display?.textStyle ?? nothing;
        const notificationClass = element.type === "notification" ? DataForm.NOTIFICATION_TYPES[element?.display?.notificationType] || "alert alert-info" : "";

        const content = html`
            <div class="${textClass} ${notificationClass}" style="${textStyle}">
                ${element.display?.icon ? html`
                    <i class="fas fa-${element.display.icon} me-2"></i>
                ` : nothing}
                <span>${value || ""}</span>
            </div>
        `;

        return this._createElementTemplate(element, value, content);
    }

    // Josemi 20220202 NOTE: this function was prev called _createInputTextElement
    _createInputElement(element, type, section) {
        const value = this.getValue(element.field) || this._getDefaultValue(element, section);
        const disabled = this._getBooleanValue(element.display?.disabled, false, element);
        const [min = undefined, max = undefined] = element.allowedValues || [];
        const step = element.step || "1";
        const rows = element.display && element.display.rows ? element.display.rows : 1;

        const content = html`
            <text-field-filter
                placeholder="${element.display?.placeholder}"
                .rows="${rows}"
                .type="${type}"
                ?disabled="${disabled}"
                ?required="${element.required}"
                .min="${min}"
                .max="${max}"
                .step="${step}"
                .value="${value}"
                .classes="${this._isUpdated(element) ? "updated" : ""}"
                @filterChange="${e => this.onFilterChange(element, e.detail.value)}">
            </text-field-filter>
        `;

        return this._createElementTemplate(element, value, content);
    }

    _createInputNumberElement(element, section) {
        const value = this.getValue(element.field) ?? this._getDefaultValue(element, section);
        const disabled = this._getBooleanValue(element?.display?.disabled, false, element);
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
                @filterChange="${e => this.onFilterChange(element, e.detail.value)}">
            </number-field-filter>
        `;

        return this._createElementTemplate(element, value, content);
    }

    _createInputDateElement(element, section) {
        const value = this.getValue(element.field) || this._getDefaultValue(element, section);
        const disabled = this._getBooleanValue(element.display?.disabled, false, element);
        const parseInputDate = e => {
            // Date returned by <input> is in YYYY-MM-DD format, but we need YYYYMMDDHHmmss format
            return e.target.value ? moment(e.target.value, "YYYY-MM-DD").format("YYYYMMDDHHmmss") : "";
        };

        const content = html`
            <input
                type="date"
                value="${value ? UtilsNew.dateFormatter(value, "YYYY-MM-DD") : ""}"
                class="form-control ${this._isUpdated(element) ? "updated" : ""}"
                @change="${e => this.onFilterChange(element, parseInputDate(e))}"
                ?disabled="${disabled}">
        `;

        return this._createElementTemplate(element, value, content);
    }

    _createCheckboxElement(element) {
        let value = this.getValue(element.field);
        const disabled = this._getBooleanValue(element.display?.disabled, false, element);

        // TODO to be fixed.
        if (element.field === "FILTER") {
            value = value === "PASS";
            // eslint-disable-next-line no-param-reassign
            element.text = "Include only PASS variants";
        }

        const content = html`
            <div class="form-check">
                <label class="form-check-label">
                    <input
                        id="${this._prefix}${element.field}"
                        type="checkbox"
                        class="form-check-input"
                        .checked="${value}"
                        ?disabled="${disabled}"
                        @click="${e => this.onFilterChange(element, e.currentTarget.checked)}">
                        ${element.text}
                </label>
            </div>
        `;

        return this._createElementTemplate(element, value, content);
    }

    /**
     * This element accepts 4 main parameters: onText, offText, activeClass and inactiveClass.
     * Default values are: ON, OFF, btn-primary and btn-light, respectively.
     * @param {Object} element
     * @returns {TemplateResult}
     * @private
     */
    _createToggleSwitchElement(element) {
        const value = this.getValue(element.field);
        const disabled = this._getBooleanValue(element.display?.disabled, false, element);
        const content = html`
            <div class="">
                <toggle-switch
                    .disabled="${disabled}"
                    .value="${value}"
                    .onText="${element.display?.onText}"
                    .offText="${element.display?.offText}"
                    .classes="${this._isUpdated(element) ? "updated" : ""}"
                    @filterChange="${e => this.onFilterChange(element, e.detail.value)}">
                </toggle-switch>
            </div>
        `;

        return this._createElementTemplate(element, value, content);
    }

    _createToggleButtonsElement(element) {
        const value = this.getValue(element.field);
        const allowedValues = element.allowedValues || [];
        const disabled = this._getBooleanValue(element.display?.disabled, false, element);
        const content = html`
            <toggle-buttons
                .data="${allowedValues}"
                .value="${value}"
                .classes="${this._isUpdated(element) ? "updated" : ""}"
                .disabled="${disabled}"
                @filterChange="${e => this.onFilterChange(element, e.detail.value)}">
            </toggle-buttons>
        `;

        return this._createElementTemplate(element, value, content);
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

        // 1. Check if 'allowedValues' field is provided
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
                        let item;
                        if (element.field?.includes("[]")) {
                            const match = element.field.match(DataForm.ARRAY_FIELD_REGULAR_EXPRESSION);
                            if (match) {
                                item = UtilsNew.getObjectValue(this.data, match?.groups?.arrayFieldName, "")[match?.groups?.index];
                            }
                        }
                        const values = element.allowedValues(this.data, item);
                        if (values) {
                            allowedValues = values;
                            if (values.defaultValue) {
                                defaultValue = values.defaultValue;
                            }
                        }
                    } else {
                        console.error("element.allowedValues must be an array, string or function");
                    }
                }
            }

            // Check if data field contains a value
            defaultValue = this.getValue(element.field);
            // Check if a defaultValue is set in element config
            if (!defaultValue && element.defaultValue) {
                defaultValue = element.defaultValue;
            }
            // Check if 'apply' must be executed
            // if (defaultValue && element.display?.apply) {
            //     defaultValue = element.display.apply(defaultValue);
            // }
        }

        // Default values
        const disabled = this._getBooleanValue(element?.display?.disabled, false, element);
        const content = html`
            <div class="">
                <select-field-filter
                    .data="${allowedValues}"
                    .config="${{
                        liveSearch: element?.search,
                        multiple: element?.multiple,
                        all: element?.all,
                        maxOptions: element?.maxOptions,
                        disabled: disabled,
                        required: element?.required,
                    }}"
                    .value="${defaultValue}"
                    .classes="${this._isUpdated(element) ? "updated" : ""}"
                    @filterChange="${e => this.onFilterChange(element, e.detail.value)}">
                </select-field-filter>
            </div>
        `;

        return this._createElementTemplate(element, null, content);
    }

    _createComplexElement(element, data = this.data, section) {
        if (!element.display?.template) {
            return this._createElementTemplate(element, null, null, {
                message: "No template provided",
                className: "text-danger"
            });
        }

        const content = html`
            <span class="${element.display?.className}" style="${element.display?.style}">
                ${UtilsNew.renderHTML(this.applyTemplate(element.display.template, data, this._getDefaultValue(element, section), element))}
            </span>
        `;

        return this._createElementTemplate(element, null, content);
    }

    _createListElement(element, data = this.data, section) {
        // Get values
        let values;
        if (element.field) {
            values = this.getValue(element.field, data);
        } else {
            values = element.display.getData(data);
        }
        const contentLayout = element.display?.contentLayout || "vertical";
        // 1. Check array and layout exist
        if (!Array.isArray(values)) {
            return this._createElementTemplate(element, null, null, {
                message: this._getDefaultValue(element, section) ?? `Field '${element.field}' is not an array`,
                className: "text-danger"
            });
        }
        if (contentLayout !== "horizontal" && contentLayout !== "vertical" && contentLayout !== "bullets" && contentLayout !== "numbers") {
            return this._createElementTemplate(element, null, null, {
                message: "Content layout must be 'horizontal', 'vertical' or 'bullets'",
                className: "text-danger"
            });
        }

        // 2. Apply 'filter' and 'transform' functions if defined
        if (typeof element.display?.filter === "function") {
            values = element.display.filter(values);
        }

        if (typeof element.display?.transform === "function") {
            values = element.display.transform(values);
        }

        // 3. Check length of the array. This MUST be done after filtering
        if (values.length === 0) {
            // If empty we just print the defaultValue, this is not an error
            return this._createElementTemplate(element, null, null, {
                message: this._getDefaultValue(element, section) ?? "Empty array",
            });
        }

        // 4. Format list elements. Initialise values with array, this is valid for scalars, or when 'template' and 'format' do not exist
        // Apply the template to all Array elements and store them in 'values'
        if (element.display?.format || element.display?.render) {
            // NOTE: 'element.display.render' is now deprecated, use 'format' instead
            if (element.display?.format) {
                values = values.map(item => element.display.format(item, data));
            } else {
                values = values.map(item => element.display.render(item, data));
            }
        } else {
            if (element.display?.template) {
                values = values
                    .map(item => this.applyTemplate(element.display.template, item, this._getDefaultValue(element, section), element));
            }
        }

        // 5. Precompute styles
        const styles = {};
        if (element.display?.style) {
            if (typeof element.display.style === "string") {
                // All elements will have the same style
                values.forEach(item => styles[item] = element.display.style);
            } else {
                // It is an object, we must find the right style for each element
                for (const item of values) {
                    // This call already checks if style is a function
                    styles[item] = this._parseStyleField(element.display?.style, item, data);
                }
            }
        }

        // 6. Precompute separators
        const separators = {};
        if (element.display?.separator) {
            // Last element cannot add a separator, so we iterate until length -1
            for (let i = 0; i < values.length - 1; i++) {
                let separator = null;
                if (typeof element.display.separator === "string") {
                    separator = element.display.separator;
                } else {
                    separator = element.display.separator(values[i], i, values, data);
                }
                // if (separator) {
                //     separators[values[i]] = separator.includes("---") ? "<hr>" : separator;
                // }
                separators[i] = separator.includes("---") ? "<hr>" : separator;
            }
        }

        // 7. Render element values
        let content = this._getDefaultValue(element, section);
        switch (contentLayout) {
            case "horizontal":
                content = `
                    ${values
                    .map((elem, index) => `
                        <span style="${styles[elem]}">${elem}</span>
                        <span>${index < values.length - 1 ? separators[index] ?? ", " : ""}</span>
                    `)
                    .join("")}
                `;
                break;
            case "vertical":
                content = `
                    ${values
                    .map((elem, index) => `
                        <div><span style="${styles[elem]}">${elem}</span></div>
                        ${separators[index] ? `<div>${separators[index]}</div>` : ""}
                    `)
                    .join("")
                }`;
                break;
            case "bullets":
                content = `
                    <ul class="ps-3">
                        ${values.map((elem, index) => `
                            <li><span style="${styles[elem]}">${elem}</span></li>
                             ${separators[index] ? `<div>${separators[index]}</div>` : ""}
                        `)
                        .join("")
                        }
                    </ul>
                `;
                break;
            case "numbers":
                content = `
                    <ol class="ps-3">
                        ${values
                    .map((elem, index) => `
                            <li><span style="${styles[elem]}">${elem}</span></li>
                             ${separators[index] ? `<div>${separators[index]}</div>` : ""}
                        `)
                    .join("")
                }
                    </ol>
                `;
                break;
        }

        return this._createElementTemplate(element, null, content);
    }

    _createTableElement(element, data = this.data, section) {
        // Get array values
        let array;
        if (element.field) {
            array = this.getValue(element.field, data);
        } else {
            array = element.display.getData(data);
        }

        const tableClassName = element.display?.className || "";
        const tableStyle = this._parseStyleField(element.display?.style) || "";
        const headerClassName = element.display?.headerClassName || "";
        const headerStyle = this._parseStyleField(element.display?.headerStyle) || "";
        const headerVisible = this._getBooleanValue(element.display?.headerVisible, true);
        const errorMessage = this._getDefaultErrorMessage(element, section);
        const errorClassName = element.display?.errorClassName ?? element.display?.errorClasses ?? "text-danger";

        // 1. Check field exists, and it is an array. Also, check 'columns' is defined
        if (!array) {
            const message = errorMessage ?? `Type 'table' requires a valid array field: ${element.field} not found`;
            return this._createElementTemplate(element, null, null, {
                message: message,
                className: errorClassName,
            });
        }
        if (!Array.isArray(array)) {
            const message = `Field '${element.field}' is not an array`;
            return this._createElementTemplate(element, null, null, {
                message: message,
                className: errorClassName,
            });
        }
        if (!element.display && !element.display.columns) {
            const message = "Type 'table' requires a 'columns' array";
            return this._createElementTemplate(element, null, null, {
                message: message,
                className: errorClassName,
            });
        }

        // 2. Apply 'filter' and 'transform' functions if defined
        if (typeof element.display?.filter === "function") {
            array = element.display.filter(array);
        }
        if (typeof element.display?.transform === "function") {
            array = element.display.transform(array);
        }

        // 3. Check length of the array. This MUST be done after filtering
        if (!array.length) {
            const message = this._getDefaultValue(element, section);
            return this._createElementTemplate(element, null, null, {
                message: message,
            });
        }

        // 4. Check for double columns
        const supraColumns = [];
        const subColumns = [];
        const columns = [];
        for (const column of element.display.columns) {
            // Add first level columns as supra columns
            supraColumns.push(column);
            if (column.display?.columns) {
                // Add nested columns as sub columns for the table header
                subColumns.push(...column.display.columns);
                // Add nested columns as real data columns
                columns.push(...column.display.columns);
            } else {
                // When no sub columns are found then just add the data column
                columns.push(column);
            }
        }

        // 5. Render the table
        const content = html`
            <table class="table ${tableClassName}" style="${tableStyle}">
                ${headerVisible ? html`
                    <thead class="${headerClassName}" style="${headerStyle}">
                    ${supraColumns.length > 0 ? html`
                        <tr>
                            ${supraColumns.map(elem => html`
                                <th scope="col" rowspan="${subColumns.length && !elem.display?.columns?.length ? "2" : "1"}" colspan="${elem.display?.columns?.length || "1"}">${elem.title || elem.name}</th>
                            `)}
                        </tr>
                    ` : nothing}
                    ${subColumns.length > 0 ? html`
                        <tr>
                            ${subColumns.map(elem => html`
                                <th scope="col" rowspan="1" colspan="1">${elem.title || elem.name}</th>`
                            )}
                        </tr>
                    ` : nothing}
                    </thead>` : nothing}
                <tbody>
                ${array
                    .map(row => html`
                        <tr scope="row">
                            ${columns.map(elem => {
                                const elemClassName = elem.display?.className ?? elem.display?.classes ?? "";
                                const elemStyle = this._parseStyleField(elem.display?.style);

                                // Check the element type
                                let content;
                                switch (elem.type) {
                                    case "complex":
                                        content = this._createComplexElement(elem, row);
                                        break;
                                    case "list":
                                        content = this._createListElement(elem, row, section);
                                        break;
                                    case "image":
                                        content = this._createImageElement(elem);
                                        break;
                                    case "custom":
                                        // content = elem.display?.render(this.getValue(elem.field, row));
                                        content = elem.display?.render(this.getValue(elem.field, row), value => this.onFilterChange(elem, value), this.updateParams, this.data, row);
                                        break;
                                    default:
                                        content = this.getValue(elem.field, row, this._getDefaultValue(element, section), elem.display);
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

        // const config = {
        //     pagination: element.display?.pagination ?? false,
        //     search: element.display?.search ?? false,
        //     searchAlign: element.display?.searchAlign ?? "right",
        //     showHeader: element.display?.showHeader ?? true,
        // };
        //
        // const content = html `
        //     <data-table
        //         .data="${array}"
        //         .columns="${element.display.columns}"
        //         .config="${config}">
        //     </data-table>
        // `;
        return this._createElementTemplate(element, null, content);
    }

    _createImageElement(element) {
        const value = (element.field) ? this.getValue(element.field) : element.display?.getData(this.data);
        const content = html`
            <image-viewer
                .data="${value}">
            </image-viewer>
        `;

        return this._createElementTemplate(element, null, content);
    }

    _createPlotElement(element) {
        // By default, we use data field in the element
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
            const content = html`
                <simple-chart
                    .active="${true}"
                    .type="${element.display?.highcharts?.chart?.type || "column"}"
                    .title="${element.display?.highcharts?.title?.text || element.name}"
                    .data="${data}"
                    .config="${element.display?.highcharts}">
                </simple-chart>
            `;
            return this._createElementTemplate(element, null, content);
        } else {
            const message = this._getDefaultErrorMessage(element);
            const errorClassName = element.display?.errorClassName ?? element.display?.errorClasses ?? "text-danger";
            return this._createElementTemplate(element, null, null, {
                message: message,
                className: errorClassName,
            });
        }
    }

    _createJsonElement(element, section) {
        const json = this.getValue(element.field, this.data, this._getDefaultValue(element, section));
        let content = "";
        (json.length || UtilsNew.isObject(json)) ?
            content = html`
                <json-viewer
                    .data="${json}">
                </json-viewer>
            ` : content = this._getDefaultValue(element);

        return this._createElementTemplate(element, null, content);
    }

    _createJsonEditorElement(element) {
        const json = this.getValue(element.field, this.data, this._getDefaultValue(element));
        const config = {
            readOnly: this._getBooleanValue(element.display?.readOnly, false)
        };
        const jsonParsed = (UtilsNew.isObject(json) || UtilsNew.isEmpty(json)) ? json : JSON.parse(json);
        const content = html`
            <json-editor
                .data="${jsonParsed}"
                .config="${config}">
            </json-editor>
        `;

        return this._createElementTemplate(element, null, content);
    }

    _createTreeElement(element) {
        const json = this.getValue(element.field, this.data, this._getDefaultValue(element));
        if (typeof element.display.apply !== "function") {
            const errorClassName = element.display?.errorClassName ?? element.display?.errorClasses ?? "text-danger";
            const message = "apply() function that provides a 'text' property is mandatory in Tree-Viewer elements";
            return this._createElementTemplate(element, null, null, {
                message: message,
                classError: errorClassName,
            });
        } else {
            if (Array.isArray(json)) {
                if (json.length > 0) {
                    // return html`<tree-viewer .data="${json.map(element.display.apply)}"></tree-viewer>`;
                    const content = html `
                        <tree-viewer
                            .data="${json.map(element.display.apply)}">
                        </tree-viewer>
                    `;
                    return this._createElementTemplate(element, null, content);
                } else {
                    const content = this._getDefaultValue(element);
                    return this._createElementTemplate(element, null, content);
                }
            } else if (UtilsNew.isObject(json)) {
                const content = html `
                    <tree-viewer
                        .data="${element.display.apply.call(null, json)}">
                    </tree-viewer>
                `;
                return this._createElementTemplate(element, null, content);
            } else {
                const message = "Unexpected JSON format";
                const errorClassName = element.display?.errorClassName ?? element.display?.errorClasses ?? "text-danger";
                return this._createElementTemplate(element, null, null, {
                    message: message,
                    classError: errorClassName,
                });
            }
        }
    }

    _createCustomElement(element) {
        if (typeof element.display?.render !== "function") {
            return "All 'custom' elements must implement a 'display.render' function.";
        }

        // If 'field' is defined then we pass it to the 'render' function, otherwise 'data' object is passed
        const data = element.field ? this.getValue(element.field) : this.data;

        // When an object-list, get the item being validated.
        let item;
        if (element.field?.includes("[]")) {
            const match = element.field.match(DataForm.ARRAY_FIELD_REGULAR_EXPRESSION);
            if (match) {
                item = UtilsNew.getObjectValue(this.data, match?.groups?.arrayFieldName, "")[match?.groups?.index];
            }
        }

        // Call to render function, it must be defined!
        // We also allow to call to 'onFilterChange' function.
        const content = element.display.render(data, value => this.onFilterChange(element, value), this.updateParams, this.data, item);
        // unsafeHTML or utilsNew.renderHTML
        // html`` won't render html string inside literal string, so i't necessary to use renderHTML.
        // const content = typeof contentHTML === "string" ? UtilsNew.renderHTML(contentHTML) : contentHTML;
        if (content) {
            return this._createElementTemplate(element, data, content);
        } else {
            const message = this._getDefaultErrorMessage(element);
            const errorClassName = element.display?.errorClassName ?? element.display?.errorClasses ?? "text-danger";
            return this._createElementTemplate(element, null, null, {
                message: message,
                classError: errorClassName,
            });
        }
    }

    _createDownloadElement(element) {
        const content = html`
            <download-button
                .json="${this.data}"
                name="${element.title ?? element.name}">
            </download-button>
        `;
        return this._createElementTemplate(element, null, content);
    }

    _createObjectElement(element) {
        const isDisabled = this._getBooleanValue(element.display?.disabled, false, element);
        const contents = [];

        if (element.display?.search && typeof element.display.search === "object") {
            // If 'field' is defined then we pass it to the 'render' function, otherwise 'data' object is passed
            const data = this.data[element.field][element.index];
            const searchContent = html `
                <div class="row form-group" style="margin-left: 0;margin-right: 0">
                    <!-- 1. Render the title -->
                    ${element.display.title ? html`
                        <div>
                            <label class="control-label" style="padding-top: 0;">
                                ${element.display.title}
                            </label>
                        </div>
                    ` : null}
                    <!-- 2. Todo: Render an icon -->
                    <!-- 3. Render -->
                    <div>
                    ${element.display.search.render(data, object => this.onObjectChange(element, object, {action: "AUTOCOMPLETE"}))}
                    </div>
                </div>
            `;
            contents.push(searchContent);
        }

        for (const childElement of element.elements) {
            // 1. Check if this filed is visible
            const isVisible = this._getBooleanValue(childElement.display?.visible, true, childElement);
            if (!isVisible) {
                continue;
            }

            // 2. Check if the element is disabled
            childElement.display = {
                ...childElement.display,
                nested: true
            };

            if (!UtilsNew.isEmpty(this.dataAutocomplete) && this._isFieldAutocomplete(childElement.field)) {
                childElement.display.disabled = true;
            }

            // 2.1 If parent is disabled then we must overwrite disabled field
            if (isDisabled) {
                childElement.display.disabled = isDisabled;
            }

            // 3. Call to createElement to get HTML content
            const elemContent = this._createElement(childElement);

            // 4. Read Help message and Render assuming vertical layout for nested forms
            const helpMessage = this._getHelpMessage(element);
            const helpMode = this._getHelpMode(element);
            contents.push(
                html`
                    <div class="row mb-3">
                        ${childElement.title ? html`
                            <div>
                                <label class="fw-bold form-label pt-0">
                                    ${childElement.title}
                                </label>
                            </div>
                        ` : nothing
                        }
                        <div>
                            <div>${elemContent}</div>
                            ${helpMessage && helpMode === "block" ? html`
                                <div class="col-md-1 p-0 mt-1" title="${helpMessage}">
                                    <span><i class="${this._getHelpIcon(element)}"></i></span>
                                </div>
                            ` : nothing
                            }
                        </div>
                    </div>
                `);
        }
        const content = html`${contents}`;
        return this._createElementTemplate(element, null, content);
    }

    _createObjectListElement(element) {
        const items = this.getValue(element.field);
        const isUpdated = this._isUpdated(element);
        const isDisabled = this._getBooleanValue(element.display?.disabled, false, element);
        const contents = [];

        // Get initial collapsed status, only executed the first time
        const collapsable = this._getBooleanValue(element.display?.collapsable, true);
        if (typeof element.display.collapsed === "undefined") {
            // eslint-disable-next-line no-param-reassign
            element.display.collapsed = collapsable;
        }

        let maxNumItems;
        if (element.display.collapsed) {
            maxNumItems = element.display.maxNumItems ?? 5;
            if (maxNumItems >= items?.length || this.editOpen >= 0) {
                // eslint-disable-next-line no-param-reassign
                element.display.collapsed = false;
                maxNumItems = items?.length;
            }
        } else {
            maxNumItems = items?.length;
        }

        // Render all existing items
        if (!items || items?.length === 0) {
            // border-warning is similar to darkorange
            const view = html`
                <div class="pb-1 ${isUpdated? "pb-1 ps-3 mb-4 border-start border-2 border-updated" :""}">
                    <span>No items found.</span>
                </div>
            `;
            contents.push(view);
        } else {
            if (maxNumItems > 0) {
                const view = html`
                    <div class="pb-1 ${isUpdated? "pb-1 ps-3 mb-4 border-start border-2 border-updated" :""}">
                        ${items?.slice(0, maxNumItems)
                            .map((item, index) => {
                                const _element = JSON.parse(JSON.stringify(element));
                                // We create 'virtual' element fields:  phenotypes[].1.id, by doing this all existing
                                // items have a virtual element associated, this will allow to get the proper value later.
                                if (_element.display?.search && typeof element.display?.search?.render === "function") {
                                    _element.index = index;
                                    _element.display.search.render = element.display.search.render;
                                }
                                for (let i = 0; i< _element.elements.length; i++) {
                                    // This support nested object
                                    const [left, right] = _element.elements[i].field.split("[].");
                                    _element.elements[i].field = left + "[]." + index + "." + right;
                                    if (_element.elements[i].type === "custom") {
                                        _element.elements[i].display.render = element.elements[i].display.render;
                                    }
                                    // Copy JSON stringify and parse ignores functions, we need to copy them
                                    if (_element.elements[i].type === "select" && typeof element.elements[i].allowedValues === "function") {
                                        _element.elements[i].allowedValues = element.elements[i].allowedValues;
                                    }
                                    if (typeof element.elements[i]?.validation?.validate === "function") {
                                        _element.elements[i].validation.validate = element.elements[i].validation.validate;
                                    }
                                    if (typeof element.elements[i]?.save === "function") {
                                        _element.elements[i].save = element.elements[i].save;
                                    }
                                    if (typeof element.elements[i]?.display?.disabled === "function") {
                                        _element.elements[i].display.disabled = element.elements[i].display.disabled;
                                    }
                                    if (typeof element.elements[i]?.display?.visible === "function") {
                                        _element.elements[i].display.visible = element.elements[i].display.visible;
                                    }
                                }
                                return html`
                                    <!--VIEW-->
                                    <div class="d-flex justify-content-between mb-1">
                                        <div>
                                            ${element.display.view(item)}
                                        </div>
                                        <div>
                                            ${this._getBooleanValue(element.display.showEditItemListButton, true) ? html`
                                                <button type="button" title="Edit item" class="btn btn-sm btn-primary"
                                                        ?disabled="${isDisabled}"
                                                        @click="${e => this.#toggleEditItemOfObjectList(e, item, index, element)}">
                                                    <i aria-hidden="true" class="fas fa-edit"></i>
                                                </button>` : nothing
                                            }
                                            ${this._getBooleanValue(element.display.showDeleteItemListButton, true) ? html`
                                                <button type="button" title="Remove item from list" class="btn btn-sm btn-danger"
                                                        ?disabled="${isDisabled}"
                                                        @click="${e => this.#removeFromObjectList(e, item, index, element)}">
                                                    <i aria-hidden="true" class="fas fa-trash-alt"></i>
                                                </button>` : nothing
                                            }
                                        </div>
                                    </div>
                                    <!--FORM-->
                                    <div id="${element?.field}_${index}"
                                        class="ms-2 ps-3 border-start border-2 border-new d-${index === this.editOpen ? "block" : "none"}">
                                        ${this._createObjectElement(_element)}
                                        <div class="d-flex flex-row-reverse mb-1">
                                            <button type="button" class="btn btn-sm btn-primary"
                                                    @click="${e => this.#toggleEditItemOfObjectList(e, item, index, element)}">
                                                Close
                                            </button>
                                        </div>
                                    </div>`;
                    })
                        }
                    </div>

                    ${element.display.collapsed && items?.length > 0 ? html`
                        <div class="pt-0 pe-0 pb-2 ps-0">
                            <button type="button" class="btn btn-link p-0"
                                    @click="${e => this.#toggleObjectListCollapse(element, false)}">
                                Show more ... (${items?.length} items)
                            </button>
                        </div>` : nothing
                    }

                    ${collapsable && !element.display.collapsed && (element.display.maxNumItems ?? 5) < items?.length ? html`
                        <div class="pt-0 pe-0 pb-2 ps-0">
                            <button type="button" class="btn btn-link p-0"
                                    @click="${e => this.#toggleObjectListCollapse(element, true)}">
                                Show less ...
                            </button>
                        </div>` : nothing
                    }
                `;
                contents.push(view);
            }
        }

        // Add the form to create the next item
        if (this._getBooleanValue(element.display.showAddItemListButton, true) || this._getBooleanValue(element.display.showAddBatchListButton, true)) {
            const createHtml = html`
                <div>
                    <div class="form-text float-start mb-2">
                        ${items?.length > 0 ? html`Items: ${items.length}` : nothing}
                    </div>
                    <div class="text-end float-end mb-2">
                        ${this._getBooleanValue(element.display.showAddItemListButton, true) ? html`
                            <button type="button" class="btn btn-sm btn-primary"
                                    ?disabled="${isDisabled}"
                                    @click="${e => this.#addToObjectList(e, element)}">
                                <i aria-hidden="true" class="fas fa-plus pe-1"></i>
                                Add Item
                            </button>`: nothing
                        }
                        ${this._getBooleanValue(element.display.showAddBatchListButton, true) ? html`
                            <button type="button" class="btn btn-sm btn-primary"
                                    ?disabled="${isDisabled}"
                                    @click="${e => this.#toggleAddBatchToObjectList(e, element)}">
                                <i aria-hidden="true" class="fas fa-file-import pe-1"></i>
                                Add Batch
                            </button>`: nothing
                        }
                        ${this._getBooleanValue(element.display.showResetListButton, false) ? html`
                            <button type="button" class="btn btn-sm btn-primary" title="Discard changes in this list"
                                    ?disabled="${isDisabled}"
                                    @click="${e => this.#resetObjectList(e, element)}">
                                <i aria-hidden="true" class="fas fa-undo pe-1"></i>
                                Reset
                            </button>`: nothing
                        }
                    </div>
                    ${this._getBooleanValue(element.display.showAddBatchListButton, true) ? html`
                        <div class="ms-2 ps-3 d-none" id="${this._prefix}-${element?.field}">
                            <text-field-filter
                                value="${this.batchItems[element?.field] || ""}"
                                placeholder="${element.elements.map(el => el.field.split(".").at(-1)).join(",")}"
                                .rows="${3}"
                                @filterChange="${e => this.#addBatchTextChange(element, e.detail.value)}"></text-field-filter>
                            <div class="d-flex flex-row-reverse m-1">
                                <button type="button" class="btn btn-sm btn-primary"
                                        ?disabled="${!this.batchItems[element.field]}"
                                        @click="${e => this.#addBatchToObjectList(e, element)}">
                                    OK
                                </button>
                            </div>
                        </div>`: nothing
                    }
                </div>`;
            contents.push(createHtml);
        }
        return this._createElementTemplate(element, null, contents);
    }

    #toggleEditItemOfObjectList(e, item, index, element) {
        // We must reset this variable after editing the new item.
        this.editOpen = -1;

        const htmlElement = document.getElementById(element?.field + "_" + index);
        htmlElement.classList.toggle("d-none");
    }

    #removeFromObjectList(e, item, index, element) {
        // Notify change to provoke the update
        const event = {
            action: "REMOVE",
            index: index,
        };
        this.onFilterChange(element, null, event);

        if (!UtilsNew.isEmpty(this.dataAutocomplete)) {
            this.onObjectChange(element, null, event);
        }
    }

    #toggleObjectListCollapse(element, collapsed) {
        // eslint-disable-next-line no-param-reassign
        element.display.collapsed = collapsed;
        this.requestUpdate();
    }

    #resetObjectList(e, element) {
        const event = {
            action: "RESET",
        };
        this.onFilterChange(element, null, event);
        if (!UtilsNew.isEmpty(this.dataAutocomplete)) {
            this.onObjectChange(element, null, event);
        }
    }

    #addToObjectList(e, element) {
        const event = {
            action: "ADD",
        };
        this.onFilterChange(element, {}, event);

        const dataElementList = UtilsNew.getObjectValue(this.data, element.field, []);
        this.editOpen = dataElementList.length - 1;
    }

    #toggleAddBatchToObjectList(e, element) {
        const htmlElement = document.getElementById(`${this._prefix}-${element?.field}`);
        htmlElement.style.display = htmlElement.style.display === "none" ? "block" : "none";
    }

    #addBatchTextChange(element, text) {
        if (element?.field) {
            this.batchItems[element.field] = text;
            this.requestUpdate();
        }
    }

    #addBatchToObjectList(e, element) {
        if (this.batchItems[element.field]) {
            const lines = this.batchItems[element.field].split("\n");
            for (const line of lines) {
                const value = {};
                const fields = line.split(",");
                for (let i = 0; i < fields.length; i++) {
                    const fieldName = element.elements[i].field.split(".").at(-1);
                    value[fieldName] = fields[i];
                }
                const event = {
                    action: "ADD",
                };
                this.onFilterChange(element, value, event);
            }
            delete this.batchItems[element.field];
            this.#toggleAddBatchToObjectList(e, element);
        }
    }

    parseValue(element, value) {
        if (typeof element.save === "function") {
            let currentValue;
            if (element.field.includes("[]")) {
                const match = element.field.match(DataForm.ARRAY_FIELD_REGULAR_EXPRESSION);
                if (match) {
                    currentValue = UtilsNew.getObjectValue(this.data, match?.groups?.arrayFieldName, "")[match?.groups?.index];
                }
            } else {
                currentValue = UtilsNew.getObjectValue(this.data, element.field);
            }

            return element.save(value, this.data, currentValue);
        } else {
            return value;
        }
    }

    _isFieldAutocomplete(field) {
        // example: phenotypes[].1.description
        if (field?.includes("[].")) {
            const match = field.match(DataForm.ARRAY_FIELD_REGULAR_EXPRESSION);
            return !!(match && typeof this.dataAutocomplete?.[match?.groups?.arrayFieldName]?.[match?.groups?.index]?.[match?.groups?.field] !== "undefined");
        }
        return false;
    }

    onObjectChange(element, object, objectListEvent) {
        let eventDetail = {};
        // Check field exists
        if (!element.field) {
            return;
        }
        // Process the value to save it correctly.
        object = this.parseValue(element, object);
        let param = "";

        // 1. Check if AUTOCOMPLETE, REMOVE, RESET has been clicked, this happens in 'object-list'
        if (objectListEvent) {
            switch (objectListEvent.action) {
                case "AUTOCOMPLETE":
                    // 1. Update the data model
                    const props = `${element.field}.${element.index}`;
                    UtilsNew.setObjectValue(this.data, props, object);

                    // 2. Update data autocomplete model
                    // If the object has inputs already filled  and undefined in cellbase, do not overwrite them.
                    const newElement = {};
                    const data = this.data[element.field][element.index];
                    Object.entries(object).forEach(([key, value]) => {
                        if (typeof value !== "undefined" || typeof data[key] !== "undefined") {
                            newElement[key] = value ?? data[key];
                        }
                    });
                    if (!this.dataAutocomplete[element.field]) {
                        this.dataAutocomplete[element.field] = [];
                    }
                    this.dataAutocomplete[element.field][element.index] = newElement;

                    // 3. Set event detail
                    param = `${element.field}[].${element.index}`;
                    eventDetail = {
                        index: element.index,
                        param: param,
                        value: object,
                        action: objectListEvent.action,
                    };
                    break;
                case "CLOSE":
                    break;
                case "REMOVE":
                    // 1. Remove element from the autocomplete data model
                    this.dataAutocomplete[element.field].splice(objectListEvent.index, 1);
                    // 2. Set event detail
                    param = `${element.field}[].${objectListEvent.index}`;
                    eventDetail = {
                        param: param,
                        value: object,
                        index: objectListEvent.index,
                        action: objectListEvent.action
                    };
                    break;
                case "RESET":
                    // 2. Delete field from autocomplete data model
                    delete this.dataAutocomplete[element.field];
                    param = `${element.field}[]`;
                    eventDetail = {
                        param: param,
                        value: object,
                        action: objectListEvent.action
                    };
                    break;
            }
        }
        LitUtils.dispatchCustomEvent(this, "fieldChange", null, {
            ...eventDetail,
            data: this.data,
        }, null, {bubbles: true, composed: true});
    }

    onFilterChange(element, value, objectListEvent) {
        let eventDetail;

        // Check field exists
        if (!element.field) {
            return;
        }

        // Process the value to save it correctly.
        value = this.parseValue(element, value);

        // 1. Check if ADD, SAVE, REMOVE has been clicked, this happens in 'object-list'
        if (objectListEvent) {
            const dataElementList = UtilsNew.getObjectValue(this.data, element.field, []);
            switch (objectListEvent.action) {
                case "ADD":
                    UtilsNew.setObjectValue(this.data, element.field, [...dataElementList, value]);
                    eventDetail = {
                        param: element.field + "[]." + dataElementList.length,
                        value: value,
                        action: objectListEvent.action
                    };
                    break;
                case "CLOSE":
                    // nothing to do
                    break;
                case "REMOVE":
                    value = dataElementList[objectListEvent.index];
                    dataElementList.splice(objectListEvent.index, 1);
                    eventDetail = {
                        param: element.field + "[]." + objectListEvent.index,
                        value: value,
                        index: objectListEvent.index,
                        action: objectListEvent.action
                    };
                    break;
                case "RESET":
                    const originalDataElementList = UtilsNew.getObjectValue(this.originalData, element.field, []);
                    UtilsNew.setObjectValue(this.data, element.field, UtilsNew.objectClone(originalDataElementList));
                    eventDetail = {
                        param: element.field + "[]",
                        value: value,
                        action: objectListEvent.action
                    };
                    break;
            }
        } else {
            // 2. Check if the element field is part of an object-list
            if (element.field.includes("[]")) {
                const [parentArrayField, itemField] = element.field.split("[].");
                if (itemField.includes(".")) {
                    // 2.1 Updating a field in an existing item in the array
                    const [index, ...fields] = itemField.split(".");
                    const currentElementList = UtilsNew.getObjectValue(this.data, parentArrayField, []);
                    if (fields.length === 1) {
                        currentElementList[index][fields[0]] = value;
                    } else {
                        currentElementList[index][fields[0]] = {
                            [fields[1]]: value
                        };
                    }

                    UtilsNew.setObjectValue(this.data, parentArrayField, currentElementList);
                    eventDetail = {
                        param: element.field,
                        value: value,
                        action: "EDIT"
                    };
                } else {
                    // FIXME To be deleted: 2.2 Updating a field in a "Create New Item" form
                    console.error("This code should never be reached!");
                    if (value) {
                        this.objectListItems[parentArrayField] = {...this.objectListItems[parentArrayField], [itemField]: value};
                    } else {
                        delete this.objectListItems[parentArrayField][itemField];
                    }
                }
            } else {
                // 3. Normal field: primitive or object
                UtilsNew.setObjectValue(this.data, element.field, value);
                eventDetail = {
                    param: element.field,
                    value: value
                };
            }
        }

        // 4. Send the custom event if eventDetail has been created, this is not created when a new item is being updated
        if (eventDetail) {
            this.dispatchEvent(new CustomEvent("fieldChange", {
                detail: {
                    ...eventDetail,
                    data: this.data
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    onPreview(e) {
        const previewModal = new bootstrap.Modal("#" + this._prefix + "PreviewDataModal");
        previewModal.show();
    }

    onClear(e) {
        this.formSubmitted = false;
        this.showGlobalValidationError = false;
        this.dataAutocomplete = {};
        LitUtils.dispatchCustomEvent(this, "clear", null, {}, null);
    }

    onSubmit(e, section=null) {
        // Check if it has invalid fields (not valid or required not filled)
        const hasInvalidFields = this.emptyRequiredFields.size > 0 || this.invalidFields.size > 0;
        if (hasInvalidFields) {
            this.formSubmitted = true; // Form has been submitted, display errors
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
        LitUtils.dispatchCustomEvent(this, "submit", section, {}, null);
    }

    // onCustomEvent(e, eventName, data) {
    //     LitUtils.dispatchCustomEvent(this, eventName, data);
    // }

    onSectionChange(e) {
        e.preventDefault();
        this.activeSection = parseInt(e.target.dataset.sectionIndex) || 0;
        this.requestUpdate();
    }

    onCopyPreviewClick() {
        UtilsNew.copyToClipboard(JSON.stringify(this.data, null, 4));
    }

    renderGlobalValidationError() {
        if (this.showGlobalValidationError) {
            return html`
                <div class="d-flex mb-3 form-text">
                    <div class="text-danger me-3">
                        <i class="${this._getErrorIcon(null, null)}"></i>
                    </div>
                    <div class="fw-bold text-danger">
                        ${this.config?.validation?.message || "There are some invalid fields..."}
                    </div>
                </div>
            `;
        }

        // No validation error to display
        return null;
    }

    renderButtons(dismiss, sectionId=null) {
        const btnClassName = this.config.display?.buttonsClassName ?? this.config.buttons?.classes ?? "";
        const btnStyle = this.config.display?.buttonsStyle ?? this.config.buttons?.style ?? nothing;
        const btnWidth = this.config.display?.buttonsWidth ?? this.config.display?.width ?? 12;
        // justify-content-{align} start,end, between ...
        const btnAlign = this.config.display?.buttonsAlign ?? "end";

        // buttons.okText, buttons.clearText and buttons.cancelText are deprecated
        const buttonPreviewText = this.config.buttons?.previewText ?? "Preview";
        const buttonClearText = this.config.display?.buttonClearText ?? this.config.buttons?.clearText ?? this.config.buttons?.cancelText ?? "Clear";
        const buttonOkText = this.config.display?.buttonOkText ?? this.config.buttons?.okText ?? "OK";
        const buttonPreviewVisible = !!this.config.buttons?.previewText;
        const buttonClearVisible = this.config.display?.buttonClearText !== "";
        const buttonOkVisible = this.config.display?.buttonOkText !== "";
        const buttonPreviewDisabled = this._getBooleanValue(this.config.display?.buttonPreviewDisabled, false);
        const buttonClearDisabled = this._getBooleanValue(this.config.display?.buttonClearDisabled, false);
        const buttonOkDisabled = this._getBooleanValue(this.config.display?.buttonOkDisabled, false);

        return html`
            ${this.renderGlobalValidationError()}
            <div class="row mb-3">
                <div class="d-grid col-${btnWidth} gap-2 d-md-flex justify-content-${btnAlign}">
                    ${buttonPreviewVisible ? html`
                        <button type="button" class="btn btn-light ${btnClassName}" data-bs-dismiss="${dismiss}" style="${btnStyle}" ?disabled=${buttonPreviewDisabled}
                                @click="${this.onPreview}">
                            ${buttonPreviewText}
                        </button>
                    `: nothing
                    }
                    ${buttonClearVisible ? html`
                        <button type="button" class="btn btn-light ${btnClassName}" data-bs-dismiss="${dismiss}" style="${btnStyle}" ?disabled=${buttonClearDisabled}
                                @click="${this.onClear}">
                            ${buttonClearText}
                        </button>
                    `: nothing
                    }
                    ${buttonOkVisible ? html`
                        <button type="button" class="btn btn-primary ${btnClassName}" data-bs-dismiss="${dismiss}" style="${btnStyle}" ?disabled=${buttonOkDisabled}
                                @click="${e => this.onSubmit(e, sectionId)}">
                            ${buttonOkText}
                        </button>
                    `: nothing
                    }
                </div>
            </div>
        `;
    }

    getFormNotificationHtml() {
        if (this.config?.notification) {
            const visible = this._getBooleanValue(this.config.notification.display?.visible, false);
            return visible ? this._createTextElement(this.config.notification) : nothing;
        } else {
            return nothing;
        }
    }

    onDownloadPdf() {
        const pdfDocument = new PdfBuilder(this.data, this.config);
        pdfDocument.exportToPdf();
    }

    renderContentAsForm(dismiss) {
        // Buttons values
        const buttonsVisible = this._getBooleanValue(this.config.display?.buttonsVisible ?? this.config.buttons?.show, true);
        const buttonsLayout = this._getButtonsLayout();

        const titleClassName = this.config.display?.titleClassName ?? this.config.display?.title?.class ?? "";
        const titleStyle = this.config.display?.titleStyle ?? this.config.display?.title?.style ?? "";
        const titleVisible = this._getBooleanValue(this.config.display?.titleVisible ?? this.config.display?.showTitle, true);

        const notificationHtml = this.getFormNotificationHtml();

        return html`
            ${notificationHtml}

            <!-- Header -->
            ${this.config.title && titleVisible ? html`
                <div class="d-flex mb-2">
                    <div>
                        <h2 class="${titleClassName}" style="${titleStyle}">${this.config.title}</h2>
                    </div>
                    ${this.config.logo ? html`
                        <div class="ms-auto">
                            <img src="${this.config.logo}" />
                        </div>` : nothing
                    }
                </div>` : nothing
            }

            <button class="btn btn-primary" style="margin-bottom:14px; display: ${this.config.display?.pdf === true ? "block": "none"}"
                    @click="${this.onDownloadPdf}">
                <i class="fas fa-file-pdf"></i>
                Export PDF (Beta)
            </button>

            <!-- Render buttons -->
            ${buttonsVisible && buttonsLayout?.toUpperCase() === "TOP" ? this.renderButtons(dismiss) : null}

            <!-- Render data form -->
            ${this.data ? this.renderData() : null}

            <!-- Render buttons -->
            ${buttonsVisible && buttonsLayout?.toUpperCase() === "BOTTOM" ? this.renderButtons(dismiss) : null}

            <!-- PREVIEW modal -->
            <div class="modal fade" id="${this._prefix}PreviewDataModal" tabindex="-1" role="dialog" aria-labelledby="${this._prefix}PreviewDataModalLabel"
                aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">JSON Preview</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div style="display:flex; flex-direction:row-reverse">
                                <button type="button" class="btn btn-link" @click="${this.onCopyPreviewClick}">
                                    <i class="fas fa-copy pe-1" aria-hidden="true"></i>Copy JSON
                                </button>
                            </div>
                            <div>
                                <pre>${JSON.stringify(this.data, null, 4)}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderContentAsTabs(dismiss) {
        // Buttons values
        const buttonsVisible = this._getBooleanValue(this.config.display?.buttonsVisible ?? this.config.buttons?.show, true);
        const buttonsLayout = this._getButtonsLayout();

        const notificationHtml = this.getFormNotificationHtml();

        // NOTE: the buttons can be rendered at three different positions:
        // UPPER (above tabs) | TOP (below tabs) | BOTTOM (below data)
        return html`
            ${notificationHtml}

            <!-- Render buttons UPPER, above the tabs -->
            ${buttonsVisible && buttonsLayout?.toUpperCase() === "UPPER" ? this.renderButtons(dismiss, this.activeSection) : null}

            <!-- Render tabs -->
            <div>
                <ul class="nav nav-tabs">
                    ${this._getVisibleSections()
            .map((section, index) => {
                const active = index === this.activeSection;
                return html`
                                <li class="nav-item ${active ? "show" : ""}" role="presentation">
                                    <a class="nav-link fw-bold" style="cursor:pointer" data-section-index="${index}" @click="${e => this.onSectionChange(e)}">
                                        ${section.title || ""}
                                    </a>
                                </li>
                            `;
            })}
                </ul>
            </div>
            <!-- Render buttons at the TOP -->
            ${buttonsVisible && buttonsLayout?.toUpperCase() === "TOP" ? this.renderButtons(dismiss, this.activeSection) : null}

            <!-- Render data form -->
            <div style="margin-top:24px;">
                ${this.renderData()}
            </div>

            <!-- Render buttons at the BOTTOM -->
            ${buttonsVisible && buttonsLayout?.toUpperCase() === "BOTTOM" ? this.renderButtons(dismiss) : null}
        `;
    }

    renderContentAsPills(dismiss) {
        // Buttons values
        const buttonsVisible = this._getBooleanValue(this.config.display?.buttonsVisible ?? this.config.buttons?.show, true);
        const buttonsLayout = this._getButtonsLayout();

        const notificationHtml = this.getFormNotificationHtml();

        return html`
            ${notificationHtml}

            ${buttonsVisible && buttonsLayout?.toUpperCase() === "TOP" ? this.renderButtons(dismiss) : null}
            <div class="row">
                <div class="${this.config?.display?.pillsLeftColumnClass || "col-md-3"}">
                    <ul class="nav nav-pills flex-column">
                        ${
                            this._getVisibleSections().map((section, index) => {
                                const active = index === this.activeSection;
                                return html`
                                    <li class="nav-item" role="presentation">
                                        <a class="nav-link fw-bold ${active ? "active" : ""}" style="cursor:pointer" data-section-index="${index}" @click="${e => this.onSectionChange(e)}">
                                            ${section.title || ""}
                                        </a>
                                    </li>
                                `;
                            })
                        }
                    </ul>
                </div>
                <div class="col-md-9">
                    ${this.renderData()}
                </div>
            </div>
            ${buttonsVisible && buttonsLayout?.toUpperCase() === "BOTTOM" ? this.renderButtons(dismiss) : null}
        `;
    }

    renderContent(type, dismiss = "") {
        let result;
        switch (type?.toUpperCase()) {
            case "FORM":
            default:
                result = this.renderContentAsForm(dismiss);
                break;
            case "TABS":
                result = this.renderContentAsTabs(dismiss);
                break;
            case "PILLS":
                result = this.renderContentAsPills(dismiss);
                break;
        }
        return result;
    }

    render() {
        // Check configuration
        if (!this.config) {
            return html`
                <div class="d-flex flex-column justify-content-center align-items-center pt-5 text-secondary">
                    <i class="fas fa-exclamation fa-5x"></i>
                    <h3>No valid configuration provided. Please check configuration:</h3>
                    <div class="p-2">
                        <pre>${JSON.stringify(this.config, null, 2)}</pre>
                    </div>
                </div>
            `;
        }

        // General values 'mode' and 'type' determine how the page/form is displayed and rendered.
        // 'mode' allowed values: page (default), modal, card
        const mode = this.config?.mode || this.config?.display?.mode || "page";
        // 'type' allowed values: form (default), tabs, pills
        const type = this.config?.type || this.config?.display?.type || "form";

        // 1. 'mode === page', render a normal web page.
        if (mode === "page" || !mode) {
            return this.renderContent(type);
        }

        // 2. Check for modal type
        if (mode === "modal") {
            // Parse modal parameters, all of them must start with prefix 'modal'
            const showModalButton = this.config.display?.showModalButton || true;
            const modalId = this.config.display?.modalId || `${this._prefix}DataModal`;
            const modalWidth = this.config.display?.modalWidth || "768px";
            const modalSize = this.config.display?.modalSize || "";
            const modalTitle = this.config.display?.modalTitle || "";
            const modalTitleHeader = this.config.display?.modalTitleHeader || "h4";
            const modalTitleClassName = this.config.display?.modalTitleClassName || "";
            const modalTitleStyle = this.config.display?.modalTitleStyle || "";
            const modalBtnName = this.config.display?.modalButtonName || "Open ...";
            const modalBtnDescription = this.config.display?.modalButtonDescription || "";
            const modalBtnClassName = this.config.display?.modalButtonClassName || "btn-link btn-lg";
            const modalBtnStyle = this.config.display?.modalButtonStyle || "";
            const modalBtnIcon = this.config.display?.modalButtonIcon || "";
            const modalButtonsVisible = this._getBooleanValue(this.config.display?.modalButtonsVisible, true);
            const modalDisabled = this._getBooleanValue(this.config.display?.modalDisabled, false);

            return html `
                ${showModalButton ? html `
                    <button type="button"
                            title="${modalBtnDescription}"
                            class="btn ${modalBtnClassName}"
                            style="${modalBtnStyle}"
                            ?disabled="${modalDisabled}"
                            data-bs-toggle="modal"
                            data-bs-target="${`#${modalId}`}">
                        ${modalBtnIcon ? html`<i class="${modalBtnIcon} pe-1" aria-hidden="true"></i>` : nothing}
                        ${modalBtnName}
                    </button>
                ` : nothing
                }
                <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog"
                    aria-labelledby="${this._prefix}DataModalLabel" aria-hidden="true">
                    <div class="modal-dialog ${modalSize}" style="width: ${modalWidth}">
                        <div class="modal-content">
                            <div class="modal-header">
                                ${this._getTitleHeader(modalTitleHeader, modalTitle, "modal-title " + modalTitleClassName, modalTitleStyle)}
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="container-fluid">
                                    ${this.renderContent(type, "modal")}
                                </div>
                            </div>
                            ${modalButtonsVisible ? html`
                                <div class="modal-footer">
                                    ${this.renderButtons("modal")}
                                </div>
                            ` : nothing}
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. Check for card type
        if (mode === "card") {
            const icon = this.config?.icon || "fas fa-info-circle";
            return html`
                <div class="row">
                    <button type="button" class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#${this._prefix}Help">
                        <i class="${icon} icon-padding" aria-hidden="true"></i>
                        ${this.config.title}
                    </button>
                    <div class="">
                        <div id="${this._prefix}Help" class="collapse">
                            <div class="well">
                                ${this.renderContent(type)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

}

customElements.define("data-form", DataForm);
