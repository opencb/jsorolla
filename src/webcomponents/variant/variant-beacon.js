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

import {LitElement, html, nothing} from "lit";
import Utils from "./../../core/utils.js";
import UtilsNew from "../../core/utils-new.js";
import {guardPage} from "../commons/html-utils.js";
import "./variant-beacon-network.js";

export default class VariantBeacon extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.checkProjects = false;
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this.propertyObserver();
            this.requestUpdate();
        }
    }

    propertyObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            this.checkProjects = true;
        } else {
            this.checkProjects = false;
        }
    }

    clearFields(e) {
        this.querySelector("#" + this._prefix + "datasetInput").value = "";
        this.querySelector("#" + this._prefix + "refNameInput").value = "";
        this.querySelector("#" + this._prefix + "startInput").value = "";
        this.querySelector("#" + this._prefix + "alleleInput").value = "";
        this.result = "";
        this.clear = Utils.randomString(4); // Clear beacon network response
        this.variant = ""; // reset variant to empty
        this.resetEnabled = false;
        this.requestUpdate();
    }

    loadExample() {
        this.querySelector("#" + this._prefix + "datasetInput").value = this.opencgaSession.project.studies[0].alias;
        this.querySelector("#" + this._prefix + "refNameInput").value = "21";
        this.querySelector("#" + this._prefix + "startInput").value = "46047686";
        this.querySelector("#" + this._prefix + "alleleInput").value = "T";
        this.updateVariant();
    }

    execute(e) {
        this.clear = Utils.randomString(4); // Clear beacon network response
        const chrom = this.querySelector("#" + this._prefix + "refNameInput").value;
        const pos = Number(this.querySelector("#" + this._prefix + "startInput").value) - 1;
        const allele = this.querySelector("#" + this._prefix + "alleleInput").value;
        const beacon = this.opencgaSession.project.alias + ":" + this.querySelector("#" + this._prefix + "datasetInput").value;

        if (this.opencgaSession.opencgaClient !== undefined) {
            const _this = this;
            this.opencgaSession.opencgaClient.ga4gh().responses(chrom, pos, allele, beacon).then(function(response) {
                console.log(response);
                const exists = response[0].response.toString();
                _this.result = exists.charAt(0).toUpperCase() + exists.slice(1);
                _this.requestUpdate();
            });
        }
    }

    updateVariant() {
        const ref = this.querySelector("#" + this._prefix + "refNameInput").value;
        const start = this.querySelector("#" + this._prefix + "startInput").value;
        const allele = this.querySelector("#" + this._prefix + "alleleInput").value;
        this.resetEnabled = ref || start || allele;
        this.variant = ref && start && allele ? ref + ":" + start + "::" + allele : "";
        this.requestUpdate();
    }

    checkResult(result) {
        return UtilsNew.isNotEmpty(result);
    }

    getDefaultConfig() {
        return {
            hosts: [
                "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience",
                "ucsc", "lovd", "hgmd", "icgc", "sahgp"
            ]
        };
    }

    render() {
        return html`
            ${this.checkProjects ? html`
                <tool-header
                    title="GA4GH Beacon"
                    icon="fa fa-share-alt">
                </tool-header>
                <div class="container">
                    <div class="mb-3">
                        <h3>Input Variant</h3>
                        <button class="btn btn-light mb-3" @click="${this.loadExample}">Load example</button>
                        <div class="mb-3">
                            <label class="fw-bold form-label" for="datasetInput">Dataset</label>
                            <div class="col-6">
                                <select class="form-control" name="dataset" id="${this._prefix}datasetInput">
                                    ${this.opencgaSession && this.opencgaSession.project.studies ? this.opencgaSession.project.studies.map(item => html`
                                        <option value="${item.alias}">${item.name}</option>
                                    `) : null}
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="fw-bold form-label" for="refNameInput">Reference Name</label>
                            <div class="col-6">
                                <input class="form-control" type="text" value="" id="${this._prefix}refNameInput" @input="${this.updateVariant}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="fw-bold form-label" for="startInput">Start</label>
                            <div class="col-6">
                                <input class="form-control" type="text" value="" id="${this._prefix}startInput" @input="${this.updateVariant}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="fw-bold form-label" for="alleleInput">Allele</label>
                            <div class="col-6">
                                <input class="form-control" type="text" value="" id="${this._prefix}alleleInput" @input="${this.updateVariant}">
                            </div>
                        </div>
                        <!--<div class="form-group row">-->
                        <!--<label class="col-xs-2 col-form-label">Format Type</label>-->
                        <!--<div class="col-xs-3">-->
                        <!--<input class="form-check-input" type="checkbox" name="formatType" id="textType" value="text" checked> Text-->
                        <!--<input class="form-check-input" type="checkbox" name="formatType" id="jsonType" value="json"> JSON-->
                        <!--</div>-->
                        <!--</div>-->
                        <button type="reset" class="btn btn-primary" @click="${this.clearFields}" .disabled="${!this.resetEnabled}">Reset</button>
                        <button type="submit" class="btn btn-primary" @click="${this.execute}" .disabled="${!this.variant}">Submit</button>
                        <!-- Result -->
                        ${this.checkResult(this.result) ? html`
                            <div class="col-xs-3 ps-0">
                                <div class="card card-primary">
                                    <div class="card-body">
                                        <h3 class="card-title">Response</h3>
                                    </div>
                                    <div class="card-body">
                                        <span id="BeaconResponse">Exists: ${this.result}</span>
                                    </div>
                                </div>
                            </div>
                            ` : nothing}
                        </div>
                        <div class="mb-3">
                            <h3>Beacon Network</h3>
                            <variant-beacon-network
                                .variant="${this.variant}"
                                .assembly="${this.opencgaSession.project.organism.assembly}"
                                .config="${this._config}">
                            </variant-beacon-network>
                        </div>
                    </div>
                </div>
            ` : html`${guardPage()}`
            }
        `;
    }

}

customElements.define("variant-beacon", VariantBeacon);
