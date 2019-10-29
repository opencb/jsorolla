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

/*
* TODO handle GENES
* TODO UX improvement: turn textarea in a tag input with autocomplete
* **/
export default class FeatureFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            limit: {
                type: Number
            },
            featureTextArea: {
                type: String
            }
        }
    }

    _init(){
        this._prefix = "feaf-" + Utils.randomString(6) + "_";
        this.featureDatalist = [];
        //TODO check why there are 2 fields in query object..
        this.featureTextArea = this.query && this.query["xref"] || "";
        this.featureIds = this.query && this.query.ids || [];
    }

    updated(_changedProperties) {
        if (_changedProperties.has("featureTextArea")) {
            this.filterChange();
        }
    }

    autocomplete(e) {
        // Only gene symbols are going to be searched and not Ensembl IDs
        let featureId = e.target.value.trim();
        if (featureId && featureId.length >= 3 && !featureId.startsWith("ENS")) {
            this.cellbaseClient.get("feature", "id", featureId.toUpperCase(), "starts_with", {}, {})
                .then(response => {
                    this.featureDatalist = response.response[0].result.slice(0,this.limit);
                    this.requestUpdate();
                });
        }
    }

    //TODO it needs a proper input validation..
    addFeatureId(e) {
        //split by comma and filters empty strings
        //let ids = this.featureTextArea.split(",").filter(id => id ? id : false);

        let featureIdText = this.querySelector("#" + this._prefix + "FeatureIdText");
        if(featureIdText.value) {
            if (!~this.featureIds.indexOf(featureIdText.value)) {
                this.featureIds.push(featureIdText.value);
            }
            featureIdText.value = "";
            //let featureTextArea = this.querySelector("#" + this._prefix + "FeatureTextarea");
            this.featureTextArea = this.featureIds.join(",");
            //this.filterChange();
        }
    }

    onInput(e) {
        this.featureTextArea = e.target.value;
        this.featureIds = this.featureTextArea.split(",").filter(_ => _);
    }

    filterChange() {
        let xref;
        let featureTextArea = this.querySelector("#" + this._prefix + "FeatureTextarea");
        //console.log("featureTextArea selector", featureTextArea)

        if (featureTextArea && featureTextArea.value) {
            let features = featureTextArea.value.trim();
            features = features.replace(/\r?\n/g, ",").replace(/\s/g, "");
            let featureArray = [];
            for (let feature of features.split(",")) {
                if (feature.startsWith("rs") || feature.split(":").length > 2) {
                    featureArray.push(feature);
                } else {
                    // Genes must be uppercase
                    featureArray.push(feature.toUpperCase());
                }
            }
            xref = featureArray.join(",");
        }

        let event = new CustomEvent('filterChange', {
            detail: {
                value: xref, // xref, ids, gene
                featureIds: this.featureIds
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-9">
                    <input id="${this._prefix}FeatureIdText" type="text" class="form-control"
                           list="${this._prefix}FeatureDatalist"
                           placeholder="Search for Gene Symbols" value="" @input="${this.autocomplete}">
                    <datalist id="${this._prefix}FeatureDatalist">
                        ${this.featureDatalist.map( feature => html`<option value="${feature.name}">${feature.name}</option>`)}
                    </datalist>
                </div>
                <div class="col-md-3">
                    <button id="${this._prefix}FeatureAddButton" type="button" class="btn btn-default btn-sm form-control" @click="${this.addFeatureId}">
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <textarea id="${this._prefix}FeatureTextarea" name="geneSnp"
                    class="form-control clearable ${this._prefix}FilterTextInput"
                    rows="3" placeholder="BRCA2,ENSG00000139618,ENST00000544455,rs28897700"
                    style="margin-top: 5px" @input="${this.onInput}">${this.featureTextArea}</textarea>
            </div>
        `;
    }
}

customElements.define('feature-filter', FeatureFilter);
