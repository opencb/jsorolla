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

    getVal(myPath, object) {
        let _object = object ? object : this.data;
        return myPath.split('.').reduce ( (res, prop) => res[prop], _object );
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
            let matches = title.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
            for (let match of matches) {
                let v = this.getVal(match);
                title = title.replace("${" + match + "}", v);
            }
        }

        let content = "";
        // if not 'type' is defined we assumed is 'basic' and therefore field exist
        if (!element.type || element.type === "basic") {
            content = html`${this.getVal(element.field)}`;
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
    }

    _createComplexElement(element) {
        let content = "-";
        if (element.display && element.display.template) {
            let matches = element.display.template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
            content = element.display.template;
            for (let match of matches) {
                let v = this.getVal(match);
                content = content.replace("${" + match + "}", v);
            }
        }
        return html`<span>${content}</span>`;
    }

    _createListElement(element) {
        // Get values
        let array = this.getVal(element.field);
        let layout = (element.display && element.display.layout) ? element.display.layout : "horizontal";

        // Check values
        if (!element.field) {
            return html`<span style="color: red">Type 'list' requires an array field</span>`;
        }
        if (!Array.isArray(array)) {
            return html`<span style="color: red">Field '${element.field}' is not an array</span>`;
        }
        if (layout !== "horizontal" && layout !== "vertical") {
            return html`<span style="color: red">Layout must be 'horizontal' or 'vertical'</span>`;
        }

        // Apply the template to all Array elements and store them in 'values'
        // TODO check if template exist -> array of scalars
        let values = [];
        let matches = element.display.template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
        for (let item of array) {
            let value = element.display.template;
            for (let match of matches) {
                let v = this.getVal(match, item);
                value = value.replace("${" + match + "}", v);
            }
            values.push(value);
        }

        // Render element values
        let content = "-";
        if (layout === "horizontal") {
            let separator = (element.display && element.display.separator) ? element.display.separator : ", ";
            content = html`${values.join(separator)}`;
        } else {
            // This is 'vertical', checked before
            let bullets = (element.display && element.display.bullets) ? element.display.bullets : false;
            if (bullets) {
                content = html`
                            <ul style="padding-left: 25px">
                                ${values.map(elem => html`
                                    <li>${elem}</li>
                                `)}
                            </ul>
                        `;
            } else {
                content = html`
                            ${values.map(elem => html`
                                <div>${elem}</div>
                            `)}
                        `;
            }
        }
        return content;
    }

    _createTableElement(element) {
        // Get values
        let array = this.getVal(element.field);

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
                                <td>${this.getVal(elem.field, row)}</td>
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
        // Get values
        let data = this.getVal(element.field);
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
