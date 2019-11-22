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

export default class CellbaseGeneFilter extends LitElement {

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
            erase: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "CellbaseGeneFilter" + Utils.randomString(6) + "_";

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("erase")) {
            this.eraseObserver();
        }
    }

    firstUpdated(_changedProperties) {
        // Add events for Feature IDs
        PolymerUtils.getElementById(this._prefix + "FeatureIdText")
            .addEventListener("keyup", this.callAutocomplete.bind(this));
    }


    eraseObserver(newValue, oldValue) {
        if (newValue !== oldValue) {
            this.clear();
        }
    }

    callAutocomplete(e) {
        // Only gene symbols are going to be searched and not Ensembl IDs
        const featureId = PolymerUtils.getElementById(this._prefix + "FeatureIdText").value;
        if (UtilsNew.isNotUndefinedOrNull(featureId) && featureId.length >= 3 && !featureId.startsWith("ENS")) {
            const _this = this;
            _this.cellbaseClient.get("feature", "id", featureId.toUpperCase(), "starts_with", {limit: 15}, {})
                .then(function(response) {
                    let options = "";
                    for (const id of response.response[0].result) {
                        options += `<option value="${id.name}">`;
                    }
                    PolymerUtils.innerHTML(_this._prefix + "FeatureDatalist", options);
                });
        }
    }

    clear() {
        PolymerUtils.setValue(this._prefix + "FeatureIdText", "");
        this.gene = "";
    }

    onGeneChange(e) {
        this.gene = e.target.value;
        this.dispatchEvent(new CustomEvent("genechange", {
            detail: {
                gene: e.target.value
            },
            bubbles: false,
            composed: true
        }));
    }

    onEraserClicked() {
        this.clear();
    }

    getDefaultConfig() {
        return {

        };
    }

    render() {
        return html`
        <!--<input id="${this._prefix}FeatureIdText" type="text" class="form-control" list$="${this._prefix}FeatureDatalist"-->
               <!--placeholder="Search for Gene Symbols" value="" on-change="onGeneChange">-->
        <!--<datalist id="${this._prefix}FeatureDatalist"></datalist>-->

        <div class="input-group">
            <input id="${this._prefix}FeatureIdText" type="text" class="form-control" list="${this._prefix}FeatureDatalist"
                   placeholder="Search for Gene Symbols" value="" @change="${this.onGeneChange}">
            <datalist id="${this._prefix}FeatureDatalist"></datalist>

            <span class="input-group-btn">
                <button class="btn btn-default" type="button" @click="${this.onEraserClicked}">
                    <i class="fa fa-eraser" aria-hidden="true"></i>
                </button>
            </span>
        </div>
        `;
    }

}

customElements.define("cellbase-gene-filter", CellbaseGeneFilter);
