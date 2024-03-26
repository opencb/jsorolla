/*
 * Copyright 2015-2024 OpenCB
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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import PolymerUtils from "../../PolymerUtils.js";
import Region from "../../../core/bioinfo/region.js";
import "../../../genome-browser/webcomponent/genome-browser.js";
import "../../sample/sample-browser.js";


export default class OpencgaVariantInterpreterGenomeBrowser extends LitElement {

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
                type: Object,
            },
            cellbaseClient: {
                type: Object
//                        observer: "init"
            },
            clinicalAnalysisId: {
                type: String,
            },
            clinicalAnalysis: {
                type: Object
            },
            // samples: {
            //     type: Array,
            //     observer: "samplesObserver"
            // },
            region: {
                type: String,
            },
            geneIds: {
                type: Array
            },
            panelIds: {
                type: Array
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        this._prefix = "OpencgaVariantInterpreterGenomeBrowser" + UtilsNew.randomString(6) + "_";
        this._availableFiles = [];
        if (!UtilsNew.isNotEmpty(this.region)) {
            this.genomeBrowserRegion = new Region({chromosome: "11", start: 68177378, end: 68177510});
        }
        this._filtersCollapsed = false;

        // The component will show an error message instead of the whole app if no alignment files are found
        this._disabled = true;
        this.displayGenomeBrowserMessage = "inline";
        this._config = this.getDefaultConfig();
        this.tracks = this._config.tracks;
        this.active = false;
    }

    updated(changedProperties) {
        if(changedProperties.has("opencgaSession")) {
            this.onStudyUpdate();
        }
        if(changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if(changedProperties.has("region")) {
            this.regionObserver();
        }
        if(changedProperties.has("active")) {
            //this._setActive();
        }
        if(changedProperties.has("opencgaSession") ||
            changedProperties.has("clinicalAnalysis") ||
            changedProperties.has("panelIds") ||
            changedProperties.has("geneIds") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);

        this.genomeBrowserFilters = {
            title: "Genome Browser Filters",
            active: true,
            filters: [{
                title: "Search by Region",
                example: "e.g. 3:55555-666666",
                id: "region"
            }, {
                title: "Search by Gene",
                example: "Search for Gene Symbols",
                id: "gene"
            }, {
                title: "Panel",
                id: "panel",
                values: this.panelIds
            }, {
                title: "Show alignments (BAM)",
                id: "alignment"
            }, {
                title: "Show variants (VCF)",
                id: "variant"
            }]
        };

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession)) {
            let _this = this;
            if (UtilsNew.isNotEmptyArray(this.panelIds)) {
                this.opencgaSession.opencgaClient.panels().info(this.panelIds.join(","),
                    {
                        study: _this.opencgaSession.study.fqn,
                        include: "id,name,genes"
                    })
                    .then(function (response) {
                        // _this._panelGenesAvailable = true;
                        let _panels = [];
                        for (let panel of response.response) {
                            _panels.push(panel.result[0]);
                        }
                        _this._genePanels = _panels;
                    })
                    .catch((response) => {
                        console.error("An error occurred fetching clinicalAnalysis: ", response)
                    });
            } else {
                this._genePanels = [];
            }

            if (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis)) {
                this.addTracks(this.clinicalAnalysis);
            }
        }
    }

    /**
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
     */
    clinicalAnalysisIdObserver() {
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotEmpty(this.clinicalAnalysisId)) {
            let _this = this;
            this.opencgaSession.opencgaClient.clinical().info(clinicalAnalysis, {study: this.opencgaSession.study.fqn})
                .then(function(response) {
                    // This will trigger the call clinicalAnalysis observer
                    _this.clinicalAnalysis = response.response[0].result[0];
                    _this.addTracks(_this.clinicalAnalysis);
                })
                .catch((response) => {
                    this._disabled = true;
                    console.error("An error occurred fetching clinicalAnalysis: ", response)
                });
        }
    }

    renderDomRepeat(e) {
        $(`#${this._prefix}-geneSelect`).selectpicker('refresh');
        $(`#${this._prefix}-geneSelect`).selectpicker('deselectAll');
    }

    toggleCollapsedFilter() {
        this.set("_filtersCollapsed", !this._filtersCollapsed); //TODO adapt litelement
    }

    regionObserver() {
        if (!UtilsNew.isNotEmpty(this.region)) {
            this.genomeBrowserRegion = new Region(this.region);
        }
    }

    onStudyUpdate() {
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
            this._availableFiles = [];
            // this.showSelectionInGenomeBrowser();
        }
    }

    showSelectionInGenomeBrowser() {
        let region = PolymerUtils.getValue(this._prefix + "RegionInputText");
        if (UtilsNew.isNotEmpty(region)) {
            this.genomeBrowserRegion = new Region(region);
        }

        let genomeBrowser = PolymerUtils.getElementById(this._prefix  + "gb");

        if (UtilsNew.isNotUndefinedOrNull(genomeBrowser)) {
            let inputArray = document.querySelectorAll('input[name=' + this._prefix + 'file-checkbox]:checked');

            let myVariantFiles = [];
            let myAlignmentFiles = [];
            inputArray.forEach(function(input) {
                let file = input.data;
                if (file.format === "VCF") {
                    myVariantFiles.push(file);
                } else if (file.format === "BAM") {
                    myAlignmentFiles.push(file);
                }
            });

            // Activate genome browser
            // if (myVariantFiles.length > 0 || myAlignmentFiles.length > 0) {
            // Hide Genome Browser initial message
            this.displayGenomeBrowserMessage = "none";
            genomeBrowser.active = true;
            // }
        }
    }

    addTracks(clinicalAnalysis) {
        if (UtilsNew.isUndefinedOrNull(clinicalAnalysis.files) || UtilsNew.isUndefinedOrNull(this.opencgaSession.study)) {
            this._disabled = true;
            return;
        }
        let roleToProband = {};
        if (clinicalAnalysis.family?.roles) {
            roleToProband = clinicalAnalysis.family.roles[clinicalAnalysis.proband.id];
        }

        let samplesToIndividual = {};
        if (clinicalAnalysis.family && clinicalAnalysis.family.members) {
            for (let i = 0; i < clinicalAnalysis.family.members.length; i++) {
                let member = clinicalAnalysis.family.members[i];
                if (UtilsNew.isNotEmptyArray(member.samples)) {
                    for (let j = 0; j < member.samples.length; j++) {
                        samplesToIndividual[member.samples[j].id] = member.id;
                    }
                }
            }
        }

        let samples = Object.keys(clinicalAnalysis.files);
        let variants = {};
        let alignments = {};
        let coverage = {};
        for (let i = 0; i < samples.length; i++) {
            let files = clinicalAnalysis.files[samples[i]];
            let role = roleToProband[samplesToIndividual[samples[i]]];
            let display = role === samples[i] ? role : `${samples[i]} (${role})`;
            for (let j = 0; j < files.length; j++) {
                files[j].display = display;
                if (files[j].bioformat === "VARIANT") {
                    variants[samples[i]] = files[j];
                } else if (files[j].bioformat === "ALIGNMENT") {
                    alignments[samples[i]] = files[j];
                } else if (files[j].bioformat === "COVERAGE") {
                    coverage[samples[i]] = files[j];
                }
            }
        }

        // Merge alignment and coverage files
        for (let sampleId in alignments) {
            if (UtilsNew.isNotUndefinedOrNull(coverage[sampleId])) {
                alignments[sampleId]['bigwig'] = coverage[sampleId];
            }
        }

        let tracks = this._config.tracks.slice();
        // Add the rest of the tracks
        let _this = this;
        Object.entries(alignments).forEach(
            ([key, value]) => tracks.push(_this._generateAlignmentTrack(value))
        );
        if (clinicalAnalysis.type !== "FAMILY") {
            Object.entries(variants).forEach(
                ([key, value]) => tracks.push(_this._generateVariantTrack(value))
            );
        } else {
            // We only generate one multi sample variant track
            tracks.push(this._generateMultiSampleVariantTrack(variants));
        }

        this.tracks = tracks;

        this._disabled = tracks.length === this._config.tracks.length;
    }

    _generateTrack(file) {
        return {
            type: file.bioformat === "VARIANT" ? "variant" : "alignment",
            config: {
                source: 'opencga',
                data: {
                    study: this.opencgaSession.study.fqn,
                    fileId: file.id
                }
            }
        };
    }

    _generateAlignmentTrack(file, role) {
        let track = {
            type: "alignment",
            // id: `alignment-${file.id}`,
            config: {
                source: 'opencga',
                data: {
                    study: this.opencgaSession.study.fqn,
                    fileId: file.id,
                    name: file.display
                }
            }
        };

        if (UtilsNew.isNotUndefinedOrNull(file['bigwig'])) {
            track['config']['data']['bigwig'] = file['bigwig']['id'];
        }

        return track;
    }

    _generateVariantTrack(file) {
        return {
            type: "variant",
            // id: `variant-${file.sample}`,
            config: {
                source: 'opencga',
                data: {
                    study: this.opencgaSession.study.fqn,
                    // files: [file.id],
                    samples: [file.sample],
                    name: file.display
                }
            }
        };
    }

    _generateMultiSampleVariantTrack(variantFiles) {
        return {
            type: "variant",
            config: {
                source: 'opencga',
                data: {
                    study: this.opencgaSession.study.fqn,
                    samples: Object.keys(variantFiles),
                    name: Object.keys(variantFiles).join(", ")
                }
            }
        };
    }

    getDefaultConfig() {
        return {
            title: "Genome Browser",
            showTitle: true,
            tracks: [{
                type: "sequence"
            }, {
                type: "gene"
            }]
        };
    }

    render() {
        return html`
            <genome-browser .id="${this._prefix}gb"
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .region="${this.genomeBrowserRegion}"
                            .tracks="${this.tracks}"
                            .settings="${this.settings}"
                            .filter="${this.genomeBrowserFilters}"
                            .active="${this.active}">
            </genome-browser>
        `;
    }
}

customElements.define("opencga-variant-interpreter-genome-browser", OpencgaVariantInterpreterGenomeBrowser);

