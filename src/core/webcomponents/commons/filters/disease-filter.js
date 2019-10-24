/**
 * Copyright 2015-2019 OpenCB
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

import {LitElement, html} from '/web_modules/lit-element.js';

export default class DiseaseFilter extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "ff-" + Utils.randomString(6) + "_";
    }

    filterChange() {
        console.log("filterChange event value:");
        let event = new CustomEvent('filterChange', {
            detail: {
                value: ""
            }
        });
        this.dispatchEvent(event);
    }

    onChange(e) {
        console.log("disease-filter", e)
    }

    render() {
        return html`
            <div>
                <select id="${this._prefix}DiseasePanels" class="selectpicker" data-size="10" data-live-search="true" data-selected-text-format="count" multiple @change="${this.onChange}">
                    ${this.opencgaSession.study.panels && this.opencgaSession.study.panels.length && this.opencgaSession.study.panels.map(panel => html`
                        <option value="${panel.id}">
                            ${panel.name} 
                            ${panel.source ? "v" + panel.source.version : ""} 
                            ( ${panel.stats ? panel.stats.numberOfGenes + "genes, " + panel.stats.numberOfRegions + "regions" : "0 genes, 0 regions"})
                        </option>
                    `)}
                </select>
            <textarea id="${this._prefix}DiseasePanelsTextarea" class="form-control" rows="4" style="margin-top: 5px;background: #f7f7f7" disabled> </textarea>
            </div>
        `;
    }
}

customElements.define('disease-filter', DiseaseFilter);