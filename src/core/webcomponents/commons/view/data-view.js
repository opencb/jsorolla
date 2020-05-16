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

import {LitElement, html} from "/web_modules/lit-element.js";
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

    _render() {
        return this.config.sections.map(section => this._createSection(section));
    }

    _createSection(section) {
        let content = html`
            <div>
                <h3>${section.title}</h3>
                <div>
                    ${section.fields.map(field => this._createField(field))}
                </div>
            </div>
        
        `;
        return content;
    }

    _createField(field) {
        let value = "";
        if (field.field) {
            value = this.getVal(field.field);
        }
        if (field.template) {
            if (field.template.includes("[]")) {
                // let matches = field.template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
                // for (let match of matches) {
                //     let f = field.template.split("[]");
                //
                //
                //     let v = this.getVal(match);
                //     value = value.replace("${" + match + "}", v);
                // }
                // let f = field.template.split("[]");
                // debugger
                // let array = this.getVal(f[0]);
                // for (let item of array) {
                //     let a = this.getVal(f[1], item);
                //     value += a;
                // }
            } else {
                let matches = field.template.match(/\$\{[a-zA-Z_.\[\]]+\}/g).map(elem => elem.substring(2, elem.length - 1));
                value = field.template;
                for (let match of matches) {
                    let v = this.getVal(match);
                    value = value.replace("${" + match + "}", v);
                }
            }
        }

        let content = html`
            <div>
                <label>${field.name}</label>
                <span>${value}</span>
            </div>
        
        `;
        return content;
    }

    getVal(myPath, object) {
        let _object = object ? object : this.data;
        return myPath.split('.').reduce ( (res, prop) => res[prop], _object );
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
            <div class="container">
                <!-- Header -->
                <div style="padding: 20px">
                    <h2>${this.config.title}</h2>
                </div>
                
                ${this._render()}
                
            </div>
        `;
    }

}

customElements.define("data-view", DataView);
