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
// import {directive} from "/web_modules/lit-html.js";
import UtilsNew from "../../../utilsNew.js";


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
        let _object = object ? object : this.data;
        let value = field.split('.').reduce ( (res, prop) => res[prop], _object );
        if (value) {
            if (format && format[field]) {
                let f = format[field];
                if (f.style) {
                    value = html`<span style="${f.style}">${value}</span>`;
                }
                if (f.link) {
                    value = html`<a href="${f.link.replace(field.toUpperCase(), value)}" target="_blank">${value}</a>`;
                }
            }
        } else {
            value = defaultValue;
        }
        return value;
    }

    applyTemplate(template, object, matches, defaultValue, format) {
        if (!matches) {
            matches = template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
        }

        if (format) {
            // FIXME this does not work yet!
            let values = {};
            for (let match of matches) {
                // let v = this.getVal(match, object, defaultValue, format);
                values[match] = this.getValue(match, object, defaultValue);
            }
            template = html`
                ${matches.map(match => {
                    template = template.replace("${" + match + "}", this.getValue(match, object, defaultValue, format))
                })};
            `;
        } else {
            for (let match of matches) {
                let v = this.getValue(match, object, defaultValue);
                template = template.replace("${" + match + "}", v);
            }
        }

        return template;
    }

    getDefaultValue(element) {
        if (element.display && element.display.defaultValue) {
            return element.display.defaultValue;
        } else {
            if (this.config.display && this.config.display.defaultValue) {
                return this.config.display.defaultValue;
            } else {
                return "-";
            }
        }
    }


    _render() {
        return this.config.sections.map(section => this._createSection(section));
    }

    _createSection(section) {
        let content = html`
            <div>
                <h3 style="margin-top: 10px">${section.title}</h3>
                <div class="row">
                    ${section.elements.map(element => this._createElement(element))}
                </div>
            </div>
        
        `;
        return content;
    }

    _createElement(element) {
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
            switch(element.type) {
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
                case "custom":
                    content = this._createCustomElement(element);
                    break;
            }
        }

        let layout = (element.display && element.display.layout) ? element.display.layout : "horizontal";
        if (layout === "horizontal") {
            // Label 'width' and 'orientation' are configured by 'labelWidth' and 'labelOrientation', defaults are '2' and 'left' respectively
            return html`
                <div class="col-md-12" style="margin-bottom: 5px">
                    <div class="col-md-${this.config.display.labelWidth || 2}" style="text-align: ${this.config.display.labelOrientation || "left"}">
                        <label>${title}</label>
                    </div>
                    <div class="col-md-${12 - (this.config.display.labelWidth || 10)}">
                        ${content}
                    </div>
                </div>        
            `;
        } else {
            return html`
                <div class="col-md-12" style="margin-bottom: 5px">
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
        if (!element.field) {
            return html`<span style="color: red">Type 'list' requires an array field</span>`;
        }
        if (!Array.isArray(array)) {
            return html`<span style="color: red">Field '${element.field}' is not an array</span>`;
        }
        if (contentLayout !== "horizontal" && contentLayout !== "vertical" && contentLayout !== "bullets") {
            return html`<span style="color: red">Content layout must be 'horizontal', 'vertical' or 'bullets'</span>`;
        }

        // TODO check if template exist -> array of scalars
        // Apply the template to all Array elements and store them in 'values'
        let values = [];
        let matches = element.display.template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
        for (let object of array) {
            let value = this.applyTemplate(element.display.template, object, matches, this.getDefaultValue(element))
            values.push(value);
        }

        // Render element values
        let content = "-";
        switch (contentLayout) {
            case "horizontal":
                let separator = (element.display && element.display.separator) ? element.display.separator : ", ";
                content = html`${values.join(separator)}`;
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
        if (!element.field) {
            return html`<span style="color: red">Type 'table' requires an array field</span>`;
        }
        if (!Array.isArray(array)) {
            return html`<span style="color: red">Field '${element.field}' is not an array</span>`;
        }
        if (!element.display && !element.display.columns) {
            return html`<span style="color: red">Type 'table' requires a 'columns' array</span>`;
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
                                <td>${this.getValue(elem.field, row, elem.defaultVale, element.display.format)}</td>
                            `)}
                        </tr>
                    `)}
                 </tbody>
            </table>
        `;
    }

    _createPlotElement(element) {

    }

    _createCustomElement(element) {
        // If a field is defined then we pass it to the user function, otherwise all data is passed
        let data = this.data;
        if (element.field) {
            data = this.getValue(element.field);
        }
        // Call to render function if defined
        if (element.display.render) {
            return element.display.render(data);
        }
    }

    render() {
        // Check Project exists
        if (!this.data) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No valid data provided: ${this.data}</h3>
                </div>
            `;
        }

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

        return html`
            <div style="padding: 20px">
                <!-- Header -->
                ${this.config.title && this.config.display.showTitle 
                    ? html`
                        <div>
                            <h2>${this.config.title}</h2>
                        </div>    
                    ` 
                    : null}
                
                <div style="padding: 0px">
                    ${this._render()}
                </div>
            </div>
        `;
    }
}

customElements.define("data-view", DataView);
