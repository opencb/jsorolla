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
        this._prefix = "ovdv-" + Utils.randomString(6) + "_";
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
            console.log("opencgaesession null");
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
        console.log(this.opencgaSession.project.studies)
        this.querySelector("#" + this._prefix + "datasetInput").value = this.opencgaSession.project.studies[0].alias;
        this.querySelector("#" + this._prefix + "refNameInput").value = "21";
        this.querySelector("#" + this._prefix + "startInput").value = "46047686";
        this.querySelector("#" + this._prefix + "alleleInput").value = "T";
        this.updateVariant();
    }

    execute(e) {
        this.clear = Utils.randomString(4); // Clear beacon network response
        const queryParams = {
            chrom: this.querySelector("#" + this._prefix + "refNameInput").value,
            pos: Number(this.querySelector("#" + this._prefix + "startInput").value) - 1,
            allele: this.querySelector("#" + this._prefix + "alleleInput").value,
            beacon: this.opencgaSession.project.alias + ":" + this.querySelector("#" + this._prefix + "datasetInput").value
        };

        if (this.opencgaSession.opencgaClient !== undefined) {
            const _this = this;
            this.opencgaSession.opencgaClient.ga4gh().beacon(queryParams, {})
                .then(function(response) {
                    console.log(response)
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
            <style include="jso-styles"></style>
    
            ${this.checkProjects ? html`
                <div class="panel" style="margin-bottom: 15px">
                    <h3 style="margin: 10px 10px 10px 30px">
                        <i class="fa fa-share-alt" aria-hidden="true"></i>&nbsp;GA4GH Beacon
                    </h3>
                </div>
    
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
                            <h3>Input Variant</h3>
                            <div>
                            <span>
                                <button class="btn btn-default ripple" @click="${this.loadExample}">Load example</button>
                            </span>
                                <br>
                                <br>
                                <div class="form-group row">
                                    <label for="datasetInput" class="col-xs-2 col-form-label">Dataset</label>
                                    <div class="col-xs-6">
                                        <select class="form-control" name="dataset" id="${this._prefix}datasetInput">
                                            ${this.opencgaSession && this.opencgaSession.project.studies ? this.opencgaSession.project.studies.map(item => html`
                                                <option value="${item.alias}">${item.name}</option>
                                            `) : null}
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label for="refNameInput" class="col-xs-2 col-form-label">Reference Name</label>
                                    <div class="col-xs-3">
                                        <input class="form-control" type="text" value="" id="${this._prefix}refNameInput" @input="${this.updateVariant}">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label for="startInput" class="col-xs-2 col-form-label">Start</label>
                                    <div class="col-xs-3">
                                        <input class="form-control" type="text" value="" id="${this._prefix}startInput" @input="${this.updateVariant}">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label for="alleleInput" class="col-xs-2 col-form-label">Allele</label>
                                    <div class="col-xs-3">
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
                                <div class="form-group row" style="padding-left: 14px">
                                    <button type="reset" class="btn btn-primary ripple" @click="${this.clearFields}" .disabled="${!this.resetEnabled}">Reset</button>
                                    <button type="submit" class="btn btn-primary ripple" @click="${this.execute}" .disabled="${!this.variant}">Submit</button>
                                </div>
            
                                <!-- Result -->
                                ${this.checkResult(this.result) ? html`
                                    <div class="col-xs-3" style="padding-left: 0px">
                                        <div class="panel panel-primary">
                                            <div class="panel-heading">
                                                <h3 class="panel-title">Response</h3>
                                            </div>
                                            <div class="panel-body">
                                                <span id="BeaconResponse">Exists: ${this.result}</span>
                                            </div>
                                        </div>
                                    </div>
                                ` : null}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                                <h3>Beacon Network</h3>
                                <div>
                                    <variant-beacon-network .variant="${this.variant}" .clear="${this.clear}" .config="${this._config}"></variant-beacon-network>
                                </div>
                        </div>
                    </div>
                </div>
            ` : html`
                <span style="text-align: center"><h3>No public projects available to browse. Please login to continue</h3></span>
            `}
        `;
    }

}

customElements.define("variant-beacon", VariantBeacon);


