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

/*
* TODO handle GENES
* TODO UX improvement: turn textarea in a tag input with autocomplete
* **/
export default class SampleFilterSimple extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "feaf-" + Utils.randomString(6);

        this.featureDatalist = [];
        // TODO check why there are 2 fields in query object..
        // this.featureIds = this.query && this.query.ids || [];
        this.featureIds = [];
        this.separator = ",";
        this.featureTextArea = "";
    }

    get samples() {
        return getSampleClient();
    }
    updated(_changedProperties) {
        this.opencgaSession.opencgaClient.getSampleClient().search({});
        this.opencgaSession.opencgaClient.samples.search({});

        // XRefs, Gene and Variant Ids
        if (_changedProperties.has("query")) {
            if (this.query["xref"]) {
                this.featureTextArea = this.query["xref"];
            } else if (this.query.ids) {
                this.featureTextArea = this.query.ids;
            } else if (this.query.gene) {
                this.featureTextArea = this.query.gene;
            } else {
                // this block covers the case of opencga-active-filters deletes all features filters
                this.featureTextArea = "";
            }
            this.featureIds = this.featureTextArea.split(this.separator).filter(_ => _);
            this.querySelector("#" + this._prefix + "FeatureTextarea").value = this.featureTextArea;
        }
    }

    autocomplete(e) {
        // Only gene symbols are going to be searched and not Ensembl IDs
        const featureId = e.target.value.trim();
        if (featureId && featureId.length >= 3 && !featureId.startsWith("ENS")) {
            this.opencgaSession.samples().search(featureId.toUpperCase(), "starts_with", {limit: 50}, {})
                .then(response => {
                    this.featureDatalist = response.response[0].result;
                    this.requestUpdate();
                });
        }
    }

    // TODO it needs a proper input validation..
    addFeatureId(e) {

        // split by comma and filters empty strings
        // let ids = this.featureTextArea.split(",").filter(id => id ? id : false);

        const featureIdText = this.querySelector("#" + this._prefix + "FeatureIdText");
        console.log("addFeatureId", featureIdText.value);
        if (featureIdText.value) {
            if (!~this.featureIds.indexOf(featureIdText.value)) {
                this.featureIds.push(featureIdText.value);
            }
            featureIdText.value = "";
            // let featureTextArea = this.querySelector("#" + this._prefix + "FeatureTextarea");
            this.featureTextArea = this.featureIds.join(this.separator);

            // FIXME the below line shouldn't be necessary!
            // TODO Isolate the issue
            // Step to reproduce: 1. add a value using the select 2. edit manually the textarea 3. add a value from the select.
            // The last one will be in this.featureTextArea and this.featureIds, but the textArea won't reflect the update.
            this.querySelector("#" + this._prefix + "FeatureTextarea").value = this.featureTextArea;

            this.requestUpdate();
            this.filterChange();
        }
    }

    onInput(e) {
        this.featureTextArea = e.target.value;
        this.featureIds = this.featureTextArea.split(this.separator).filter(_ => _);
        this.filterChange();

    }

    filterChange() {

        console.log("this.featureTextArea", this.featureTextArea, "this.featureIds", this.featureIds);
        let xref;
        // let featureTextArea = this.querySelector("#" + this._prefix + "FeatureTextarea");

        // console.log("featureTextArea selector", featureTextArea)

        if (this.featureTextArea) {
            let features = this.featureTextArea.trim();
            features = features.replace(/\r?\n/g, this.separator).replace(/\s/g, "");
            const featureArray = [];
            for (const feature of features.split(this.separator)) {
                if (feature.startsWith("rs") || feature.split(":").length > 2) {
                    featureArray.push(feature);
                } else {
                    // Genes must be uppercase
                    featureArray.push(feature.toUpperCase());
                }
            }
            xref = featureArray.filter(_ => _).join(this.separator);
        }

        const event = new CustomEvent("filterChange", {
            detail: {
                value: xref, // xref, ids, gene
                featureIds: this.featureIds
            }
        });

        this.requestUpdate();
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div class="form-group">
                <div class="input-group">
                    <input id="${this._prefix}FeatureIdText" type="text" class="form-control"
                                       list="${this._prefix}FeatureDatalist"
                                       placeholder="Search for Gene Symbols" value="" @input="${this.autocomplete}">
                    <datalist id="${this._prefix}FeatureDatalist">
                                    ${this.featureDatalist.map(feature => html`<option value="${feature.name}">${feature.name}</option>`)}
                    </datalist>
                <div class="input-group-addon btn" @click="${this.addFeatureId}"> <i class="fa fa-plus"></i> </div>
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

customElements.define("sample-filter-simple", SampleFilterSimple);
