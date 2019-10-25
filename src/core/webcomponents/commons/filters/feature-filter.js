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
TODO handle GENES and define the return value
*
* **/
export default class FeatureFilter extends LitElement {

    constructor() {
        super();
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
            }
        }
    }

    _init(){

        console.log("this.query", this.query)

        this._prefix = "feaf-" + Utils.randomString(6) + "_";
        this.featureDatalist = [];

        //TODO recheck why there are 2 fields in query object..
        this.featureTextArea = this.query && this.query["xref"] || "";
        this.featureIds = this.query && this.query.ids || [];

    }

    filterChange(e) {
        let event = new CustomEvent('filterChange', {
            detail: {
                value: "" // xref, ids, gene
            }
        });
        this.dispatchEvent(event);
    }

    //TODO add a limit in results?
    autocomplete(e) {
        // Only gene symbols are going to be searched and not Ensembl IDs
        let featureId = e.target.value.trim();
        if (featureId && featureId.length >= 3 && !featureId.startsWith("ENS")) {
            this.cellbaseClient.get("feature", "id", featureId.toUpperCase(), "starts_with", {}, {})
                .then(response => {
                    console.log("response from cellBaseClient", response.response[0].result);
                    this.featureDatalist = response.response[0].result;
                    this.requestUpdate();
                });
        }
        this.requestUpdate();
    }

    //TODO it needs a proper input validation..
    addFeatureId(e) {
        //split by comma and filters empty strings
        //let ids = this.featureTextArea.split(",").filter(id => id ? id : false);

        let featureIdText = this.querySelector("#" + this._prefix + "FeatureIdText");
        if(featureIdText) {
            if (this.featureIds.indexOf(featureIdText.value) === -1) {
                this.featureIds.push(featureIdText.value);
            }
            featureIdText.value = "";
            let featureTextArea = this.querySelector("#" + this._prefix + "FeatureTextarea");
            featureTextArea.value = this.featureIds.join(",");
            this.filterChange();
        }
    }

    updateFeatureTextArea(e){
        this.featureTextArea = e.target.value;
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-9">
                    <input id="${this._prefix}FeatureIdText" type="text" class="form-control"
                           list="${this._prefix}FeatureDatalist"
                           placeholder="Search for Gene Symbols" value="" @keyup="${this.autocomplete}">
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
                    style="margin-top: 5px" @keyup="${this.updateFeatureTextArea}"> ${this.featureTextArea}</textarea>
            </div>
        `;
    }
}

customElements.define('feature-filter', FeatureFilter);