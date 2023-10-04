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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import {guardPage} from "../html-utils.js";
import "../simple-chart.js";
import "../json-viewer.js";
import "../../download-button.js";

export default class DataView extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "dv-" + UtilsNew.randomString(6);
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            this.requestUpdate();
        }
    }

    getValue(field, object, defaultValue, format) {
        let value = null;
        if (field) {
            let _object = object ? object : this.data;
            // optional chaining is needed when "res" is undefined
            value = field.split(".").reduce((res, prop) => res?.[prop], _object);

            // needed for handling falsy values
            if (value !== undefined) {
                if (format) {
                    if (format.style) {
                        value = html`<span style="${format.style}">${value}</span>`;
                    }
                    if (format.link) {
                        value = html`<a href="${format.link.replace(field.toUpperCase(), value)}" target="_blank">${value}</a>`;
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

    getDefaultValue(element) {
        if (element?.display?.defaultValue) {
            return element.display.defaultValue;
        } else {
            if (this.config?.display?.defaultValue) {
                return this.config.display.defaultValue;
            } else {
                return "-";
            }
        }
    }

    _createSection(section) {
        let content;
        let sectionTitleStyle = section?.display?.style ?? "";
        // Section 'elements' array has just one dimension
        if (!Array.isArray(section.elements[0])) {
            content = html`
                <section>
                    <h4 style="${sectionTitleStyle}">${section.title}</h4>
                    <div class="container-fluid">
                        ${section.elements.map(element => this._createElement(element))}
                    </div>
                </section>
            `;
        } else {
            // Section 'elements' array has two dimensions
            let leftColumnWidth = section?.display?.leftColumnWith ?? 6;
            let rightColumnWidth = 12 - leftColumnWidth;
            let columnSeparatorStyle = (section.display && section.display.columnSeparatorStyle) ? section.display.columnSeparatorStyle : "";
            content = html`
                <section style="margin-top: 20px">
                    <h4 style="${sectionTitleStyle}">${section.title}</h4>
                    <div class="container-fluid">
                        <div class="row detail-row">
                            <div class="col-md-${leftColumnWidth}" style="${columnSeparatorStyle}">
                                ${section.elements[0].map(element => this._createElement(element))}
                            </div>
                            <div class="col-md-${rightColumnWidth}">
                                ${section.elements[1].map(element => this._createElement(element))}
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        return content;
    }

    _createElement(element) {
        // Check if type is 'separator', this is a special case, no need to parse 'name' and 'content'
        if (element.type === "separator") {
            return html`
                <div>
                    <hr style="${element.display.style}">
                </div>
            `;
        }

        let title = element.name;
        if (title && title.includes("${")) {
            title = this.applyTemplate(element.name);
        }

        let content = "";
        // if not 'type' is defined we assumed is 'basic' and therefore field exist
        if (!element.type || element.type === "basic") {
            content = html`${this.getValue(element.field, this.data, this.getDefaultValue(element), element.display ? element.display.format : null)}`;
        } else {
            // Other 'type' are rendered by specific functions
            switch (element.type) {
                case "complex":
                    content = this._createComplexElement(element);
                    break;
                case "list":
                    content = this._createListElement(element);
                    break;
                case "table":
                    content = this._createTableElement(element);
                    break;
                case "plot":
                    content = this._createPlotElement(element);
                    break;
                case "json":
                    content = this._createJsonElement(element);
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

        let layout = (element.display && element.display.layout) ? element.display.layout : "horizontal";
        if (layout === "horizontal") {
            // Label 'width' and 'align' are configured by 'labelWidth' and 'labelAlign', defaults are '2' and 'left' respectively
            return html`
                <div class="row detail-row">
                    <div class="col-md-${this.config.display.labelWidth || 2} text-${this.config.display.labelAlign || "left"}">
                        <label>${title}</label>
                    </div>
                    <div class="col-md-${12 - (this.config.display.labelWidth || 10)}">
                        ${content}
                    </div>
                </div>
            `;
        } else {
            return html`
                <div class="row detail-row">
                    <div class="col-md-12">
                        <label>${title}</label>
                    </div>
                    <div class="col-md-12">
                        ${content}
                    </div>
                </div>
            `;
        }
    }

    _createComplexElement(element) {
        if (!element.display || !element.display.template) {
            return html`<span style="color: red">No template provided</span>`;
        }
        return html`<span>${this.applyTemplate(element.display.template, this.data, null, this.getDefaultValue(element))}</span>`;
    }

    _createListElement(element) {
        // Get values
        let array = this.getValue(element.field);
        let contentLayout = (element.display && element.display.contentLayout) ? element.display.contentLayout : "horizontal";

        // Check values
        if (!array || !array.length) {
            return html`<span style="color: red">${this.getDefaultValue(element)}</span>`;
        }
        if (!Array.isArray(array)) {
            return html`<span style="color: red">Field '${element.field}' is not an array</span>`;
        }
        // if (!array.length) {
        //     // return this.getDefaultValue(element);
        //     return html`<span>${this.getDefaultValue(element)}'</span>`;
        // }
        if (contentLayout !== "horizontal" && contentLayout !== "vertical" && contentLayout !== "bullets") {
            return html`<span style="color: red">Content layout must be 'horizontal', 'vertical' or 'bullets'</span>`;
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
                    let value = this.applyTemplate(element.display.template, object, matches, this.getDefaultValue(element));
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
            return html`<span>${this.getDefaultValue(element)}</span>`;
        }
        if (!element.display && !element.display.columns) {
            return html`<span class="text-danger">Type 'table' requires a 'columns' array</span>`;
        }

        return html`
            <table class="table" style="display: inline">
                <thead class="table-light">
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
                                    ${elem.display && elem.display.render
                                        ? elem.display.render(this.getValue(elem.field, row))
                                        : this.getValue(elem.field, row, elem.defaultValue, elem.format)
                                    }
                                </td>
                            `)}
                        </tr>
                    `)}
                 </tbody>
            </table>
        `;
    }

    _createPlotElement(element) {
        // By default we use data object in the element
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
                    data = value;
                }
            }
        }
        return html`<simple-chart .active="${true}" type="${element.display.chart}" title="${element.name}" .data="${data}"></simple-chart>`;
    }

    _createJsonElement(element) {
        const json = this.getValue(element.field, this.data, this.getDefaultValue(element));
        console.log("element", json)
        if (json.length || UtilsNew.isObject(json)) {
            return html`<json-viewer .data="${json}" />`;
        } else {
            return this.getDefaultValue(element);
        }
    }

    _createCustomElement(element) {
        // If a field is defined then we pass it to the user function, otherwise all data is passed
        let data = this.data;
        if (element.field) {
            data = this.getValue(element.field);
        }
        // Call to render function if defined
        if (element.display.render) {
            // it covers the case the result of this.getValue is actually undefined
            return data ? element.display.render(data) : this.getDefaultValue(element);
        }
    }

    _createDownloadElement(element) {
        return html`
            <download-button
                .json="${this.data}"
                name="${element.name}">
            </download-button>`;
    }

    postRender() {
        // init any jquery plugin we might have used
        //$('.json-renderer').jsonViewer(data);
    }

    render() {
        // Check Project exists
        if (!this.data) {
            return guardPage(`No valid data provided: ${this.data}`);
        }

        // Check configuration
        if (!this.config) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-exclamation fa-5x"></i>
                    <h3>No valid configuration provided. Please check configuration:</h3>
                    <div class="p-2">
                        <pre>${JSON.stringify(this.config, null, 2)}</pre>
                    </div>
                </div>
            `;
        }

        return html`
                <!-- Header -->
                ${
                    this.config.title && this.config.display.showTitle ? html`
                    <div>
                        <h2>${this.config.title}</h2>
                    </div>` :
                        nothing
                }
                <div>
                    ${this.config.sections.map(section => this._createSection(section))}
                </div>
            </div>
        `;
    }

}

customElements.define("data-view", DataView);
