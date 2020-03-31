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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "./../../utils.js";
import UtilsNew from "../../utilsNew.js";


export default class OpencgaVariantFileMetrics extends LitElement {

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
            },
            variant: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            // active: {
            //     type: Boolean,
            //     value: false,
            // },
            config: {
                type: Object
            }
        };
    }

    // This is executed before the actual Polymer properties exist
    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this._prefix = "ovfm" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }
        if (changedProperties.has("variant")) {
            this.propertyObserver();
        }
        if (changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        this.renderTable();
    }

    renderTable() {
        if (UtilsNew.isUndefinedOrNull(this.variant) || UtilsNew.isEmptyArray(this.variant.studies)) {
            return [];
        }

        // We take the first study by default. Two possible improvements are:
        // 1. we could pass a new studyId parameter to choose the study
        // 2. render all of the studies in different tables or the same table with two-level columns
        const files = this.variant.studies[0].files;
        const attributesSet = new Set();
        // We find all the existing attributes
        for (const file of files) {
            for (const attr of Object.keys(file.data)) {
                if (attr !== "QUAL" && attr !== "FILTER") {
                    attributesSet.add(attr);
                }
            }
        }
        const attributesArray = Array.from(attributesSet.values()).sort();
        attributesArray.unshift("QUAL", "FILTER");

        // We store the values as: result = [{name: "AC", values: [1, 2, 3, 4]}]
        const result = [];
        for (const attr of attributesArray) {
            const tmp = {name: attr, values: []};
            for (const file of files) {
                tmp.values.push(file.data[attr]);
            }
            result.push(tmp);
        }
        this._attributes = result;
        // return result;
    }

    getDefaultConfig() {
        return {
            property: "example property"
        };
    }

    render() {
        return html`
        <style include="jso-styles"></style>

        <div id="${this._prefix}FileMetrics">
            <div class="col-md-10 col-md-offset-1" style="padding-top: 20px;overflow: auto;">
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th>VCF Attributes</th>
                        ${this.variant.studies[0].files && this.variant.studies[0].files.length ? this.variant.studies[0].files.map( member => html`
                            <th>${member.fileId}</th>
                        `) : null}
                    </tr>
                    </thead>
                    <tbody id="${this._prefix}TableTBody">
                    ${this._attributes && this._attributes.length ? this._attributes.map(attribute => html`
                        <tr id="${attribute.name}" class="file-metrics-table-${attribute.name}">
                            <td><span style="font-weight: bold">${attribute.name}</span></td>
                            ${attribute.values && attribute.values.length ? attribute.values.map(attr => html`
                                <td>${attr}</td>
                            `) : null}                            
                        </tr>
                    `) : null}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-variant-file-metrics", OpencgaVariantFileMetrics);
