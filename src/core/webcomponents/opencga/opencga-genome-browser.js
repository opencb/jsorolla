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
import "../../../genome-browser/webcomponent/genome-browser.js";
import "./catalog/samples/opencga-sample-browser.js";

export default class OpencgaGenomeBrowser extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            samples: {
                type: Array
            },
            region: {
                type: String
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "OpencgaGenomeBrowser" + Utils.randomString(6) + "_";

        this._availableFiles = [];
        if (!UtilsNew.isNotUndefinedOrNull(this.region)) {
            this.region = new Region({chromosome: "11", start: 68177378, end: 68177510});
        }

        this.tracks = {
            sequence: {type: "sequence"},
            gene: {type: "gene"},
            variant: {type: "variant", config: {}},
            alignment: {type: "alignment", config: {}}
        };

        this._config = this.getDefaultConfig();

        this._filtersCollapsed = false;

        this.displayGenomeBrowserMessage = "inline";

        this.active = false;
    }


    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.onStudyUpdate();
        }
        if (changedProperties.has("samples")) {
            this.samplesObserver();
        }
        if (changedProperties.has("region")) {
            this.regionObserver();
        }
        if (changedProperties.has("active")) {
            //this._setActive();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }


    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    toggleCollapsedFilter() {
        this._filtersCollapsed = !this._filtersCollapsed;
        this.requestUpdate();
    }

    regionObserver() {
        this.genomeBrowserRegion = new Region(this.region);
    }

    onStudyUpdate() {
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
            this._availableFiles = [];
            // this.showSelectionInGenomeBrowser();
        }
    }

    showSampleBrowser(e) {
        e.preventDefault();

        this.sampleBrowserModal = UtilsNew.isUndefined(this.sampleBrowserModal) ? true : !this.sampleBrowserModal;
        $("#" + this._prefix + "SampleBrowser").modal("show");
    }

    samplesObserver() {
        for (const sample of this.samples) {
            this._addSample(sample.name);
        }
    }

    addSample(e) {
        const sample = PolymerUtils.getElementById(this._prefix + "AutocompleteSearchInput").value;
        this._addSample(sample);
    }

    _addSample(sample) {
        for (const i in this._availableFiles) {
            const existingSample = this._availableFiles[i].name;
            if (existingSample === sample) {
                // The sample is already in the shown list
                return;
            }
        }

        const queryParams = {
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
            sample: sample,
            format: "VCF,BAM",
            include: "path,name,format,bioformat"
        };

        const _this = this;
        this.opencgaClient.files().search(queryParams)
            .then(values => {
                if (values.response[0].result !== undefined && values.response[0].result.length > 0) {
                    _this.push("_availableFiles", {
                        name: sample,
                        files: values.response[0].result
                    });
                }
            })
            .catch(function(response) {
                //_this.showErrorAlert(response.error);
                console.log("Error: ",response.error)
            });
    }

    deleteSample(e) {
        const sample = e.currentTarget.dataSample;

        // We make a copy of the list of available files excluding the selected sample
        const availableFiles = [];
        for (const i in this._availableFiles) {
            const item = this._availableFiles[i];
            if (item.name !== sample) {
                availableFiles.push(item);
            }
        }

        this._availableFiles = availableFiles;
    }

    _autocompleteSampleSearch(e) {
        // Only gene symbols are going to be searched and not Ensembl IDs
        const sampleNamePrefix = PolymerUtils.getElementById(this._prefix + "AutocompleteSearchInput").value;
        if (UtilsNew.isNotUndefinedOrNull(sampleNamePrefix) && sampleNamePrefix.length >= 4) {
            const _this = this;
            this.opencgaClient.samples()
                .search({
                    study: _this.opencgaSession.project.alias + ":" + _this.opencgaSession.study.alias,
                    name: "~^" + sampleNamePrefix,
                    include: "id,name",
                    includeIndividual: false,
                    limit: 20
                }, {})
                .then(function(response) {
                    //                            _this.autocompleteSampleData = response.response[0].result;
                    let options = "";
                    for (const sample of response.response[0].result) {
                        const sampleStr = JSON.stringify(sample);
                        options += `<option id="${_this._prefix}Sample${sample.name}" value="${sample.name}" data-sample='` + sampleStr + "'>";
                    }
                    PolymerUtils.innerHTML(_this._prefix + "AutocompleteSearchDataList", options);
                });
        }
    }

    showSelectionInGenomeBrowser() {
        const genomeBrowser = PolymerUtils.getElementById(this._prefix + "gb");

        if (genomeBrowser !== undefined && genomeBrowser !== null) {
            const inputArray = document.querySelectorAll("input[name=" + this._prefix + "file-checkbox]:checked");

            const myVariantFiles = [];
            const myAlignmentFiles = [];
            inputArray.forEach(function(input) {
                const file = input.data;
                if (file.format === "VCF") {
                    myVariantFiles.push(file);
                } else if (file.format === "BAM") {
                    myAlignmentFiles.push(file);
                }
            });

            // In order to notify of the changes to the genome browser, we make a copy of the tracks object
            const _tracks = this.tracks;
            _tracks.variant.config.files = myVariantFiles;
            _tracks.alignment.config.files = myAlignmentFiles;
            this.tracks = Object.assign({}, _tracks);

            // Activate genome browser
            // if (myVariantFiles.length > 0 || myAlignmentFiles.length > 0) {
            // Hide Genome Browser initial message
            this.displayGenomeBrowserMessage = "none";
            genomeBrowser.active = true;
            // }
        }
    }

    getDefaultConfig() {
        return {
            title: "Genome Browser",
            showTitle: true
        };
    }


    render() {
        return html`
        <style include="jso-styles"></style>

        ${this._config.showTitle ? html`
            <div class="panel" style="margin-bottom: 15px">
                <h3 style="margin: 10px 10px 10px 15px">
                    <i class="fa fa-list" aria-hidden="true"></i> &nbsp;${this._config.title}
                </h3>
            </div>
        ` : null}

        <div style="margin: 20px">
            <div class="col-md-12">
                <div style="display: block; cursor:pointer;" @click="${this.toggleCollapsedFilter}"
                     data-toggle="collapse" href="#${this._prefix}collapsibleFilter">
                    <h4>
                        ${this._filtersCollapsed ? html`
                            <i class="fa fa-caret-right" aria-hidden="true"></i>
                        ` : html`
                            <i class="fa fa-caret-down" aria-hidden="true"></i>
                        `}
                        Select Samples and Files
                    </h4>
                    <hr style="width: 80%; margin: 2px 0px;border-top: 2px solid #eee">
                </div>

                <div class="collapse in" id="${this._prefix}collapsibleFilter">
                    <div class="col-md-12" style="padding: 10px">
                        <div class="col-md-2">
                            Search samples by ID:
                        </div>
                        <div class="col-md-2">
                            <input id="${this._prefix}AutocompleteSearchInput" type="text" class="form-control form-control-sm" placeholder="HG01879..."
                                   list="${this._prefix}AutocompleteSearchDataList" @keyup="${this._autocompleteSampleSearch}">
                            <datalist id="${this._prefix}AutocompleteSearchDataList"></datalist>
                        </div>
                        <div class="col-md-2">
                            <button type="button" id="${this._prefix}addSampleButton" class="btn btn-sm btn-primary" @click="${this.addSample}">
                                +
                            </button>
                        </div>
                    </div>

                    <div class="col-md-12" style="padding: 0px 10px">
                        <div class="col-md-2">
                            or browse samples:
                        </div>
                        <div class="col-md-2">
                            <button type="button" class="btn btn-primary btn-sm"
                                    @click="${this.showSampleBrowser}" data-toggle="modal">
                                Sample Browser...
                            </button>
                        </div>
                    </div>

                    <div class="col-md-12" style="padding: 25px 10px 10px 10px">
                        <div class="col-md-12">
                            <span>Samples selected:</span>
                        </div>
                        <!--List of available files to browse -->
                        <div class="col-md-12">
                            <div style="padding: 5px;max-height: 300px; overflow-y: auto">
                                ${this._availableFiles && this._availableFiles.length ? this._availableFiles.map(sample => html`
                                    <div>
                                        <div style="font-weight: bold; text-decoration: underline; display: inline-block;padding: 5px 10px">
                                            <span>${sample.name}</span>
                                        </div>
                                        <button type="button" id="${this._prefix}deleteSampleButton" class="btn btn-xs btn-danger"
                                                @click="${this.deleteSample}" data-sample="${sample.name}">
                                            <i class="fa fa-times" aria-hidden="true"> Delete</i>
                                        </button>
                                    </div>
                                    ${sample.file && sample.file.length && sample.file.map(file => html`
                                        <input type="checkbox" style="margin-left: 15px;" name="${this._prefix}file-checkbox" value="${file.name}" data="${file}">
                                        <span style="word-wrap:break-word;">${file.name}</span><br>
                                    `)} 
                                    <br>
                                `) : null }
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <div class="col-md-6" style="margin-top: 15px;">
                <button id="${this._prefix}RunGenomeBrowser" type="button" class="btn btn-primary"
                        @click="${this.showSelectionInGenomeBrowser}" style="float: right">
                    Show Genome Browser
                </button>
            </div>

            <!-- Genome browser -->
            <div class="col-md-12">
                <h4>Genome Browser</h4>
                <hr style="width: 80%; margin: 2px 0px;border-top: 2px solid #eee">

                <div style="padding: 20px 0px;display: ${this.displayGenomeBrowserMessage};">
                    <div style="padding: 20px">
                        <span style="font-weight: bolder">Please select some data above</span>
                    </div>
                </div>

                <div style="padding: 20px 5px">
                    <genome-browser id="${this._prefix}gb" .opencgaSession=${this.opencgaSession} .cellbaseClient="${this.cellbaseClient}"
                                    .opencgaClient="${this.opencgaClient}" .region="${this.genomeBrowserRegion}" .tracks="${this.tracks}">
                    </genome-browser>
                </div>
            </div>
        </div>

        <div class="modal fade" id="${this._prefix}SampleBrowser" tabindex="-1" role="dialog" aria-labelledby="sampleBrowserLabel">
            <div class="modal-dialog modal-lg" role="document" style="width: 80%;">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="${this._prefix}SampleBrowserLabel">Sample Browser</h4>
                    </div>
                    <div class="modal-body" style="height: 780px">
                        <opencga-sample-browser .opencgaClient="${this.opencgaClient}" .opencgaSession="${this.opencgaSession}" .config="${this.sampleBrowserConfig}"></opencga-sample-browser>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.onAnalysisSelected}">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-genome-browser", OpencgaGenomeBrowser);
