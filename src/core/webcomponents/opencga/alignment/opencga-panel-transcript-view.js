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
import Utils from "./../../../utils.js";
import UtilsNew from "./../../../utilsNew.js";
import "../../cellbase/core/cellbase-gene-filter.js";


export default class OpencgaPanelTranscriptView extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            geneIds: {
                type: Array
            },
            panelIds: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "PanelTranscriptView" + Utils.randomString(6) + "_";

        this.eraseSearchGene = false;
        this._filtersCollapsed = false;

        // The component will show an error message instead of the whole app if no alignment files are found
        this._disabled = true;

        this._lowCoverageValues = [];
        this.showCoverageTable = false;

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("clinicalAnalysis") ||
            changedProperties.has("panelIds") ||
            changedProperties.has("geneIds") ||
            changedProperties.has("config")) {
            this.propertyObserver(this.opencgaSession, this.clinicalAnalysis, this.panelIds, this.geneIds, this.config);
        }
    }

    firstUpdated(_changedProperties) {
        // We add this listener to receive any future change over the selected genes
        $(`#${this._prefix}-geneSelect`).on("changed.bs.select", this.onGeneChange.bind(this));

        $("select.selectpicker", this).selectpicker("render");
        $("select.selectpicker", this).selectpicker({
            iconBase: "fa",
            tickIcon: "fa-check"
        });
    }

    propertyObserver(opencgaSession, clinicalAnalysis, panelIds, geneIds, config) {
        this._config = Object.assign(this.getDefaultConfig(), config);

        this.clear();

        // if (UtilsNew.isNotUndefinedOrNull(config)) {
        // }

        this._files = [];
        this._numberOfFiles = 0;

        this._autoRenderWhenFilesAreRetrieved = false;
        this._initialiseCoverageTracks = true;

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession)) {

            const _this = this;
            if (UtilsNew.isNotEmptyArray(this.panelIds)) {
                this.opencgaSession.opencgaClient.panels().info(panelIds.join(","),
                    {
                        study: _this.opencgaSession.study.fqn,
                        include: "id,name,genes"
                    })
                    .then(function(response) {
                        // _this._panelGenesAvailable = true;
                        const _panels = [];
                        for (const panel of response.response) {
                            _panels.push(panel.result[0]);
                        }
                        _this._genePanels = _panels;
                    })
                    .catch(response => {
                        console.error("An error occurred fetching clinicalAnalysis: ", response);
                    });
            } else {
                this._genePanels = [];
            }

            if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis)) {
                // let result = response.response[0].result[0];

                const disorder = clinicalAnalysis.disorder.id;

                const files = [];

                const members = {}; // member_id : member
                const samples = {}; // sample_id : member
                for (let i = 0; i < clinicalAnalysis.family.members.length; i++) {
                    const member = clinicalAnalysis.family.members[i];
                    members[member.id] = member;
                    if (UtilsNew.isNotEmptyArray(member.samples)) {
                        for (let j = 0; j < member.samples.length; j++) {
                            samples[member.samples[j].id] = member;
                        }
                    }
                }

                const availableBigWigs = {}; // sample id - file id
                for (const key in clinicalAnalysis.files) {
                    for (let i = 0; i < clinicalAnalysis.files[key].length; i++) {
                        if (clinicalAnalysis.files[key][i].format === "BIGWIG") {
                            availableBigWigs[key] = clinicalAnalysis.files[key][i].id;
                        }
                    }
                }

                // Get proband sample
                for (let i = 0; i < clinicalAnalysis.proband.samples.length; i++) {
                    if (availableBigWigs.hasOwnProperty(clinicalAnalysis.proband.samples[i].id)) {
                        // In theory, there should only be one BAM file available for each member
                        files.push({
                            id: availableBigWigs[clinicalAnalysis.proband.samples[i].id],
                            // name: "Proband '" + clinicalAnalysis.proband.id + "'",
                            name: "Proband '" + clinicalAnalysis.proband.samples[i].id + "'",
                            sex: clinicalAnalysis.proband.sex,
                            isProband: true,
                            affectationStatus: this._getAffectationStatus(clinicalAnalysis.proband, disorder)
                        });

                        // Take the bam out of the map
                        delete availableBigWigs[clinicalAnalysis.proband.samples[i].id];
                    }
                }

                // Get mother
                if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.proband.mother) &&
                    UtilsNew.isNotEmpty(clinicalAnalysis.proband.mother.id)) {
                    const motherId = clinicalAnalysis.proband.mother.id;
                    if (members.hasOwnProperty(motherId) && UtilsNew.isNotEmptyArray(members[motherId].samples) &&
                        availableBigWigs.hasOwnProperty(members[motherId].samples[0].id)) {
                        files.push({
                            id: availableBigWigs[members[motherId].samples[0].id],
                            name: "Mother '" + members[motherId].samples[0].id + "'",
                            // name: "Mother '" + motherId + "'",
                            sex: members[motherId].sex,
                            isProband: false,
                            affectationStatus: this._getAffectationStatus(members[motherId], disorder)
                        });

                        // Take the bam out of the map
                        delete availableBigWigs[members[motherId].samples[0].id];
                    }
                }

                // Get father
                if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis.proband.father) &&
                    UtilsNew.isNotEmpty(clinicalAnalysis.proband.father.id)) {
                    const fatherId = clinicalAnalysis.proband.father.id;
                    if (members.hasOwnProperty(fatherId) && UtilsNew.isNotEmptyArray(members[fatherId].samples) &&
                        availableBigWigs.hasOwnProperty(members[fatherId].samples[0].id)) {
                        files.push({
                            id: availableBigWigs[members[fatherId].samples[0].id],
                            name: "Father '" + members[fatherId].samples[0].id + "'",
                            // name: "Father '" + fatherId + "'",
                            sex: members[fatherId].sex,
                            isProband: false,
                            affectationStatus: this._getAffectationStatus(members[fatherId], disorder)
                        });

                        // Take the bam out of the map
                        delete availableBigWigs[members[fatherId].samples[0].id];
                    }
                }

                // If there are any remaining BAM files, we will add them in a random position
                for (const key in availableBigWigs) {
                    if (samples.hasOwnProperty(key)) {
                        files.push({
                            id: availableBigWigs[key],
                            name: "Member '" + samples[key].id + "'",
                            sex: samples[key].sex,
                            isProband: false,
                            affectationStatus: this._getAffectationStatus(samples[key], disorder)
                        });
                    } else {
                        files.push({
                            id: availableBigWigs[key],
                            name: "Sample '" + key + "'",
                            isProband: false
                        });
                    }
                }

                this._disabled = UtilsNew.isEmptyArray(files);

                this._files = files;
                this._numberOfFiles = files.length;

                if (this._autoRenderWhenFilesAreRetrieved) {
                    this._displaySVG($(`#${_this._prefix}-geneSelect`).selectpicker("val"),
                        $(`#${this._prefix}-lowCoverageThreshold`).selectpicker("val"));

                    this._autoRenderWhenFilesAreRetrieved = false;
                }
            } else {
                this._disabled = true;
            }
        }
    }

    /**
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
     */
    clinicalAnalysisIdObserver() {
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotEmpty(this.clinicalAnalysisId)) {
            const _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(function(response) {
                    // This will trigger the call clinicalAnalysis observer
                    _this.clinicalAnalysis = response.response[0].result[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    _getAffectationStatus(member, disorderId) {
        let status = "UNAFFECTED";
        if (UtilsNew.isNotEmptyArray(member.disorders)) {
            for (const disorder of member.disorders) {
                if (UtilsNew.isNotUndefinedOrNull(disorder) && disorder.id === disorderId) {
                    status = "AFFECTED";
                    break;
                }
            }
        }
        return status;
    }

    renderDomRepeat(e) {
        $(`#${this._prefix}-geneSelect`).selectpicker("refresh");
        $(`#${this._prefix}-geneSelect`).selectpicker("deselectAll");
    }

    toggleCollapsedFilter() {
        // this.set("_filtersCollapsed", !this._filtersCollapsed);

        this._filtersCollapsed = !this._filtersCollapsed;
    }

    onInputGeneChange(e) {
        this._inputGene = e.detail.gene;

        $("#" + this._prefix + "-geneSelect").selectpicker("val", []);
    }

    onGeneChange(e) {
        this.selectedGene = $(`#${this._prefix}-geneSelect`).selectpicker("val");

        // This erase the text input of cellbase-gene web component
        this.eraseSearchGene = !this.eraseSearchGene;
        // this._displaySVG(e.currentTarget.value, $(`#${this._prefix}-lowCoverageThreshold`).selectpicker('val'));
    }

    onRender(e) {
        if (UtilsNew.isNotEmpty(this._inputGene)) {
            this.selectedGene = this._inputGene;
            this._displaySVG(this.selectedGene, $(`#${this._prefix}-lowCoverageThreshold`).selectpicker("val"));
        } else if (UtilsNew.isNotEmpty(this.selectedGene)) {
            this._displaySVG(this.selectedGene, $(`#${this._prefix}-lowCoverageThreshold`).selectpicker("val"));
        }
    }

    onClear(e) {
        this.clear();
    }

    clear() {
        // Clean the SVG in case there is anything drawn
        const children = $(`#${this._prefix}-svg`).children();
        for (let i = 0; i < children.length; i++) {
            children[i].remove();
        }

        this._lowCoverageValues = [];
        this.showCoverageTable = false;
        this._initialiseCoverageTracks = true;
    }

    _displaySVG(geneId, threshold) {
        if (UtilsNew.isEmptyArray(this._files)) {
            // Probably the files are being fetched at this same moment. Force them to be rendered automatically after that
            this._autoRenderWhenFilesAreRetrieved = true;
            return;
        }

        if (UtilsNew.isEmpty(geneId)) {
            return;
        }

        this.lastGeneId = geneId;

        if (this._initialiseCoverageTracks) {
            const tracks = [];

            this._otherFiles = [];
            this._probandFile = {};

            for (let i = 0; i < this._files.length; i++) {

                let style = "";
                if (UtilsNew.isNotEmpty(this._files[i].affectationStatus)) {
                    if (this._files[i].affectationStatus === "AFFECTED") {
                        style = "color: darkred";
                    } else if (this._files[i].affectationStatus === "UNKNOWN") {
                        style = "color: gray";
                    }
                }
                if (this._files[i].isProband) {
                    style += ";font-weight: bold";
                }

                const sampleIcon = this._config.sexIConMap[this._files[i].sex];

                const htmlTitle = `<span style="${style}">
                                ${this._files[i].name}
                                <i class='fa ${sampleIcon} fa-lg' style='padding-left: 5px'></i>
                            </span>`;

                if (this._files[i].isProband) {
                    this._probandFile = {
                        style: style,
                        name: this._files[i].name,
                        icon: sampleIcon,
                        id: this._files[i].id
                    };
                } else {
                    this._otherFiles.push({
                        style: style,
                        name: this._files[i].name,
                        icon: sampleIcon,
                        id: this._files[i].id
                    });
                }

                tracks.push(new LinearCoverageTrack({
                    htmlTitle: htmlTitle,
                    opencga: {
                        client: this.opencgaSession.opencgaClient
                    },
                    targetId: `${this._prefix}-svg`
                }, {
                    width: $(`#${this._prefix}-svg`).width()
                })
                );

                this.coverageTracks = tracks;
            }
            this._initialiseCoverageTracks = false;
        }

        if (UtilsNew.isUndefinedOrNull(this.geneTrack)) {
            this.geneTrack = new LinearGeneTrack({
                name: geneId,
                targetId: `${this._prefix}-svg`
            }, {
                width: $(`#${this._prefix}-svg`).width()
            });
        }

        const _this = this;
        this.cellbaseClient.get("feature", "gene", geneId, "info",
            {assembly: this.opencgaSession.project.organism.assembly}, {})
            .then(function(response) {
                const gene = response.response[0].result[0];

                const region = new Region(`${gene.chromosome}:${gene.start}-${gene.end}`);

                const promises = [];

                for (let i = 0; i < _this.coverageTracks.length; i++) {
                    promises.push(_this.opencgaSession.opencgaClient.alignments().queryCoverage(
                        _this._files[i].id, {
                            region: region,
                            study: _this.opencgaSession.study.fqn,
                            windowSize: 1,
                            threshold: threshold,
                            sid: _this.opencgaSession.opencgaClient._config.sessionId
                        }
                    ));

                    _this.coverageTracks[i].draw({
                        query: {
                            region: region,
                            study: _this.opencgaSession.study.fqn,
                            fileId: _this._files[i].id
                        }, config: {
                            regionOffset: _this._config.offset,
                            lowCoverageThreshold: threshold
                        }
                    });
                }

                Promise.all(promises).then(function(responses) {
                    let probandIdx = -1;
                    for (let i = 0; i < _this._files.length; i++) {
                        if (_this._files[i].isProband) {
                            probandIdx = i;
                            break;
                        }
                    }

                    const coverageGroups = responses[probandIdx].response[0].result;

                    // Format the main response
                    for (let w = 0; w < coverageGroups.length; w++) {
                        if (UtilsNew.isUndefinedOrNull(coverageGroups[w]["region"])) {
                            coverageGroups[w]["region"] = `${coverageGroups[w]["chromosome"]}:${coverageGroups[w]["start"]}-${coverageGroups[w]["end"]}`;
                            coverageGroups[w]["length"] = coverageGroups[w]["end"] - coverageGroups[w]["start"] + 1;
                            coverageGroups[w]["stats"]["average"] = coverageGroups[w]["stats"]["average"].toFixed(2);
                            coverageGroups[w]["stats"]["max"] = coverageGroups[w]["stats"]["max"].toFixed(2);
                            coverageGroups[w]["stats"]["min"] = coverageGroups[w]["stats"]["min"].toFixed(2);
                        }
                    }

                    for (let i = 0; i < responses.length; i++) {
                        if (probandIdx === i) {
                            continue;
                        }

                        const fileId = _this._files[i].id;

                        let responseIdx = 0;
                        for (let w = 0; w < coverageGroups.length; w++) {

                            coverageGroups[w][fileId] = {
                                average: -1,
                                max: -1,
                                min: -1,
                                covered: 0,
                                regions: [],
                                values: []
                            };

                            for (let j = responseIdx; j < responses[i].response[0].result.length; j++) {
                                response = responses[i].response[0].result[j];

                                if (response.start > coverageGroups[w].end) {
                                    break;
                                }

                                if (response.end < coverageGroups[w].start) {
                                    responseIdx = j;
                                    continue;
                                }

                                if (response.start >= coverageGroups[w].start && response.end <= coverageGroups[w].end) {
                                    // Completely contained within the coverage group
                                    const covered = (response.end - response.start + 1) / (coverageGroups[w].end - coverageGroups[w].start + 1);
                                    coverageGroups[w][fileId]["covered"] += covered;
                                    coverageGroups[w][fileId]["max"] = Math.max(coverageGroups[w][fileId]["max"], response.stats.max);
                                    coverageGroups[w][fileId]["min"] = coverageGroups[w][fileId]["min"] === -1 ?
                                        response.stats.min : Math.min(coverageGroups[w][fileId]["min"], response.stats.min);
                                    const region = `${response.chromosome}:${response.start}:${response.end}`;

                                    coverageGroups[w][fileId]["regions"].push(region);
                                    coverageGroups[w][fileId]["values"] = coverageGroups[w][fileId]["values"].concat(response.values);

                                } else if (response.start < coverageGroups[w].start && response.end > coverageGroups[w].end) {
                                    // Response contains completely the coverage group
                                    coverageGroups[w][fileId]["covered"] = 1;

                                    const startIdx = coverageGroups[w].start - response.start - 1;
                                    const endIdx = startIdx + coverageGroups[w].end - coverageGroups[w].start + 1;

                                    const values = response.values.slice(startIdx, endIdx);

                                    coverageGroups[w][fileId]["max"] = _this._getMaximumValue(0, values);
                                    coverageGroups[w][fileId]["min"] = _this._getMinimumValue(-1, values);

                                    const region = `${response.chromosome}:${coverageGroups[w].start}:${coverageGroups[w].end}`;

                                    coverageGroups[w][fileId]["regions"].push(region);
                                    coverageGroups[w][fileId]["values"] = coverageGroups[w][fileId]["values"].concat(values);

                                } else if (response.start < coverageGroups[w].start) {
                                    // Response overlaps the start of the coverageGroup
                                    const covered = (response.end - coverageGroups[w].start + 1) / (coverageGroups[w].end - coverageGroups[w].start + 1);
                                    coverageGroups[w][fileId]["covered"] += covered;

                                    const startIdx = coverageGroups[w].start - response.start - 1;
                                    const endIdx = startIdx + response.end - coverageGroups[w].start;

                                    const values = response.values.slice(startIdx, endIdx);

                                    coverageGroups[w][fileId]["max"] = _this._getMaximumValue(coverageGroups[w][fileId]["max"], values);
                                    coverageGroups[w][fileId]["min"] = _this._getMinimumValue(coverageGroups[w][fileId]["min"], values);
                                    const region = `${response.chromosome}:${coverageGroups[w].start}:${response.end}`;

                                    coverageGroups[w][fileId]["regions"].push(region);
                                    coverageGroups[w][fileId]["values"] = coverageGroups[w][fileId]["values"].concat(values);

                                } else {
                                    // Response overlaps the end of the coverageGroup
                                    const covered = (coverageGroups[w].end - response.start + 1) / (coverageGroups[w].end - coverageGroups[w].start + 1);
                                    coverageGroups[w][fileId]["covered"] += covered;

                                    const startIdx = 0;
                                    const endIdx = coverageGroups[w].end - response.start + 1;

                                    const values = response.values.slice(startIdx, endIdx);

                                    coverageGroups[w][fileId]["max"] = _this._getMaximumValue(coverageGroups[w][fileId]["max"], values);
                                    coverageGroups[w][fileId]["min"] = _this._getMinimumValue(coverageGroups[w][fileId]["min"], values);
                                    const region = `${response.chromosome}:${response.start}:${coverageGroups[w].end}`;

                                    coverageGroups[w][fileId]["regions"].push(region);
                                    coverageGroups[w][fileId]["values"] = coverageGroups[w][fileId]["values"].concat(values);
                                }
                            }

                            if (UtilsNew.isNotEmptyArray(coverageGroups[w][fileId]["values"])) {
                                let values = 0;
                                for (let i = 0; i < coverageGroups[w][fileId]["values"].length; i++) {
                                    values += coverageGroups[w][fileId]["values"][i];
                                }
                                coverageGroups[w][fileId]["average"] = values / coverageGroups[w][fileId]["values"].length;

                                coverageGroups[w][fileId]["covered"] = coverageGroups[w][fileId]["covered"] * 100;
                            }
                        }
                    }

                    _this._lowCoverageValues = coverageGroups;
                    if (_this._lowCoverageValues.length > 0) {
                        _this.showCoverageTable = true;
                    }

                    // // Sort the positions
                    // positions = positions.sort();
                    //
                    // // Now we need to group all the low coverage values by files
                    // let coverageGroups = [];
                    //
                    // let lastGroup = "";
                    // let groupedResult = {
                    // };
                    // let lastPosition = positions[0] - 1;
                    //
                    // for (let i = 0; i < positions.length; i++) {
                    //     let group = "";
                    //     let numberOfFiles = 0;
                    //     for (let j = 0; j < _this._files.length; j++) {
                    //         if (UtilsNew.isNotUndefinedOrNull(result[positions[i]][_this._files[j].id])) {
                    //             group += _this._files[j].id;
                    //             numberOfFiles += 1;
                    //         }
                    //     }
                    //
                    //     // Filter out low coverages over only one of the samples if the array of files contains more than one sample
                    //     if (_this._files.length > 1 && numberOfFiles === 1) {
                    //         continue;
                    //     }
                    //
                    //     if ((lastGroup !== group || lastPosition + 1 < positions[i])) {
                    //         if (Object.entries(groupedResult).length > 0) {
                    //             coverageGroups.push(Object.assign({}, groupedResult));
                    //         }
                    //
                    //         groupedResult = {
                    //             start: positions[i]
                    //         };
                    //
                    //         lastGroup = group;
                    //     }
                    //
                    //
                    //     for (let j = 0; j < _this._files.length; j++) {
                    //         if (UtilsNew.isNotUndefinedOrNull(result[positions[i]][_this._files[j].id])) {
                    //             if (UtilsNew.isUndefinedOrNull(groupedResult[_this._files[j].id])) {
                    //                 groupedResult[_this._files[j].id] = [];
                    //             }
                    //             groupedResult[_this._files[j].id].push(result[positions[i]][_this._files[j].id]);
                    //         }
                    //     }
                    //
                    //     lastPosition = positions[i];
                    // }
                    //
                    // // Add the last group
                    // coverageGroups.push(Object.assign({}, groupedResult));
                    //
                    // // Calculate mean coverage for the groups
                    // for (let i = 0; i < coverageGroups.length; i++) {
                    //     for (let j = 0; j < _this._files.length; j++) {
                    //         if (UtilsNew.isNotUndefinedOrNull(coverageGroups[i][_this._files[j].id])) {
                    //             let sum = 0;
                    //             for (let w = 0; w < coverageGroups[i][_this._files[j].id].length; w++) {
                    //                 sum += coverageGroups[i][_this._files[j].id][w];
                    //             }
                    //
                    //             coverageGroups[i].length = coverageGroups[i][_this._files[j].id].length;
                    //             coverageGroups[i].end = coverageGroups[i].start + coverageGroups[i].length -1;
                    //             coverageGroups[i].region = `${gene.chromosome}:${coverageGroups[i].start}-${coverageGroups[i].end}`;
                    //             coverageGroups[i][_this._files[j].id] = sum / coverageGroups[i].length ;
                    //         }
                    //     }
                    // }
                    //
                    // _this._lowCoverageValues = coverageGroups;

                    // let result = {};
                    // let positions = [];
                    //
                    // for (let i = 0; i < responses.length; i++) {
                    //     for (let j = 0; j < responses[i].response[0].result.length; j++) {
                    //         response = responses[i].response[0].result[j];
                    //
                    //         for (let w = 0; w < response.values.length; w++) {
                    //             let position = response.start + w;
                    //             if (UtilsNew.isUndefinedOrNull(result[position])) {
                    //                 positions.push(position);
                    //                 result[position] = {};
                    //             }
                    //
                    //             result[position][_this._files[i].id] = response.values[w];
                    //         }
                    //     }
                    // }
                    //
                    // // Sort the positions
                    // positions = positions.sort();
                    //
                    // // Now we need to group all the low coverage values by files
                    // let coverageGroups = [];
                    //
                    // let lastGroup = "";
                    // let groupedResult = {
                    // };
                    // let lastPosition = positions[0] - 1;
                    //
                    // for (let i = 0; i < positions.length; i++) {
                    //     let group = "";
                    //     let numberOfFiles = 0;
                    //     for (let j = 0; j < _this._files.length; j++) {
                    //         if (UtilsNew.isNotUndefinedOrNull(result[positions[i]][_this._files[j].id])) {
                    //             group += _this._files[j].id;
                    //             numberOfFiles += 1;
                    //         }
                    //     }
                    //
                    //     // Filter out low coverages over only one of the samples if the array of files contains more than one sample
                    //     if (_this._files.length > 1 && numberOfFiles === 1) {
                    //         continue;
                    //     }
                    //
                    //     if ((lastGroup !== group || lastPosition + 1 < positions[i])) {
                    //         if (Object.entries(groupedResult).length > 0) {
                    //             coverageGroups.push(Object.assign({}, groupedResult));
                    //         }
                    //
                    //         groupedResult = {
                    //             start: positions[i]
                    //         };
                    //
                    //         lastGroup = group;
                    //     }
                    //
                    //
                    //     for (let j = 0; j < _this._files.length; j++) {
                    //         if (UtilsNew.isNotUndefinedOrNull(result[positions[i]][_this._files[j].id])) {
                    //             if (UtilsNew.isUndefinedOrNull(groupedResult[_this._files[j].id])) {
                    //                 groupedResult[_this._files[j].id] = [];
                    //             }
                    //             groupedResult[_this._files[j].id].push(result[positions[i]][_this._files[j].id]);
                    //         }
                    //     }
                    //
                    //     lastPosition = positions[i];
                    // }
                    //
                    // // Add the last group
                    // coverageGroups.push(Object.assign({}, groupedResult));
                    //
                    // // Calculate mean coverage for the groups
                    // for (let i = 0; i < coverageGroups.length; i++) {
                    //     for (let j = 0; j < _this._files.length; j++) {
                    //         if (UtilsNew.isNotUndefinedOrNull(coverageGroups[i][_this._files[j].id])) {
                    //             let sum = 0;
                    //             for (let w = 0; w < coverageGroups[i][_this._files[j].id].length; w++) {
                    //                 sum += coverageGroups[i][_this._files[j].id][w];
                    //             }
                    //
                    //             coverageGroups[i].length = coverageGroups[i][_this._files[j].id].length;
                    //             coverageGroups[i].end = coverageGroups[i].start + coverageGroups[i].length -1;
                    //             coverageGroups[i].region = `${gene.chromosome}:${coverageGroups[i].start}-${coverageGroups[i].end}`;
                    //             coverageGroups[i][_this._files[j].id] = sum / coverageGroups[i].length ;
                    //         }
                    //     }
                    // }
                    //
                    // _this._lowCoverageValues = coverageGroups;
                });

                _this.geneTrack.draw({
                    data: gene
                });
            });
    }

    _getMaximumValue(value, values) {
        for (let i = 0; i < values.length; i++) {
            if (values[i] > value) {
                value = values[i];
            }
        }
        return value;
    }

    _getMinimumValue(value, values) {
        let myValue = value;
        if (myValue === -1) {
            myValue = values[0];
        }
        for (let i = 0; i < values.length; i++) {
            if (values[i] < myValue) {
                myValue = values[i];
            }
        }
        return myValue;
    }


    _getCoverage(coverage, file) {
        return UtilsNew.isUndefinedOrNull(coverage[file.id]) ? "-" : coverage[file.id].covered.toFixed(2);
    }

    _getAverage(coverage, file) {
        return UtilsNew.isUndefinedOrNull(coverage[file.id]) ? "-" : (coverage[file.id].average > -1 ? coverage[file.id].average.toFixed(2) : "-");
    }

    _getMax(coverage, file) {
        return UtilsNew.isUndefinedOrNull(coverage[file.id]) ? "-" : (coverage[file.id].max > -1 ? coverage[file.id].max.toFixed(2) : "-");
    }

    _getMin(coverage, file) {
        return UtilsNew.isUndefinedOrNull(coverage[file.id]) ? "-" : (coverage[file.id].min > -1 ? coverage[file.id].min.toFixed(2) : "-");
    }

    getDefaultConfig() {
        return {
            offset: 2500,
            sexIConMap: {
                MALE: "fa-mars",
                FEMALE: "fa-venus",
                UNKNOWN: "fa-genderless"
            }
        };
    }

    render() {
        return html`
<style include="jso-styles">
            .form-section-title {
                padding: 5px 0px;
                width: 80%;
                border-bottom-width: 1px;
                border-bottom-style: solid;
                border-bottom-color: #ddd
            }

            .jso-label-title {
                width: 15em !important;
            }
        </style>

        <div class="row" style="padding: 0px 10px; margin: 10px 0px;">

            ${this._disabled ? html`
                <h4 style="color: #940303; margin: 20px 0px; text-align: center">
                    No files available.
                </h4>
            ` : html`
                <div class="col-md-12">
                    <!--<h3 class="form-section-title">Low Coverage Filters</h3>-->

                    <div style="display: block; cursor:pointer;" @click="${this.toggleCollapsedFilter}"
                         data-toggle="collapse" href="#${this._prefix}collapsibleFilter">
                        <h3 class="form-section-title">
                            ${this._filtersCollapsed ? html`
                                <i class="fa fa-caret-right" aria-hidden="true" style="padding-right: 5px"></i>
                            ` : html`
                                <i class="fa fa-caret-down" aria-hidden="true" style="padding-right: 5px"></i>
                            `}
                            Low Coverage Filters
                        </h3>
                    </div>


                    <div id="${this._prefix}collapsibleFilter" class="form-horizontal collapse in" style="padding: 5px 10px">

                        <div class="form-group">
                            <label class="control-label col-md-1 jso-label-title">Search by Gene</label>
                            <div class="col-md-3">
                                <cellbase-gene-filter .cellbaseClient="${this.cellbaseClient}"
                                                      .erase="${this.eraseSearchGene}"
                                                      @genechange="${this.onInputGeneChange}">
                                </cellbase-gene-filter>
                                <!--<button type="button" class="btn btn-primary" on-click="onSearchGeneClicked">Search</button>-->
                                <!--<span class="input-group-btn">-->
                                <!--<button class="btn btn-default" type="button" on-click="onSearchGeneClicked">-->
                                <!--<i class="fa fa-eraser" aria-hidden="true"></i>-->
                                <!--</button>-->
                                <!--</span>-->
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="control-label col-md-1 jso-label-title">Select a Gene from Panel</label>
                            <div class="col-md-3">
                                <select class="selectpicker" id="${this._prefix}-geneSelect" data-live-search="true" data-max-options="1"
                                        on-dom-change="renderDomRepeat" multiple>
                                    <optgroup label="Selected Genes">
                                        ${this.geneIds && this.geneIds.length ? this.geneIds.map(geneId => html`
                                            <option>${geneId}</option>
                                        `) : null }
                                        </optgroup>

                                    ${this._genePanels && this._genePanels.length ? this._genePanels.map( panel => html`
                                        <optgroup label="${panel.name}">
                                            ${panel.genes && panel.genes.length ? panel.genes.map( gene => html`
                                                <option>${gene.name}</option>
                                            `): null}
                                        </optgroup>
                                    `) : null}
                                </select>
                            </div>
                        </div>

                        <!--on-change="onLowCoverageThresholdChange"-->
                        <div class="form-group">
                            <label class="control-label col-md-1 jso-label-title">Select Low Coverage</label>
                            <div class="col-md-3">
                                <select class="selectpicker" id="${this._prefix}-lowCoverageThreshold" data-width="fit">
                                    <option>5</option>
                                    <option>10</option>
                                    <option>15</option>
                                    <option selected>20</option>
                                    <option>25</option>
                                    <option>30</option>
                                    <option>35</option>
                                    <option>40</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-offset-3 col-md-9">
                                <button type="submit" class="btn btn-primary" @click="${this.onClear}">Clear</button>
                                <button type="submit" class="btn btn-primary" @click="${this.onRender}">Render</button>
                            </div>
                        </div>
                    </div>

                </div>


                <div class="col-md-12">
                    ${this.showCoverageTable ? html`
                        <h3 class="form-section-title">{{selectedGene}} Gene Low Coverage</h3>
                    ` : null}
                    <div id="${this._prefix}-svg" style="padding: 20px"></div>
                </div>

                ${this.showCoverageTable ? html`
                <!--Low covered regions table-->
                    <div class="col-md-12">
                        <div style='padding: 10px 0px 10px 25px'>
                            <h4>Low covered regions</h4>
                        </div>

                        <div style='padding: 5px 50px'>
                            <table id="${this._prefix}LowCoveredRegions" class="table table-hover table-no-bordered">
                                <thead>
                                <tr>
                                    <th rowspan="2">Position</th>
                                    <th rowspan="2">Length</th>
                                    <th rowspan="1" colspan="3" style="${this._probandFile.style}">
                                        {{_probandFile.name}}
                                        <i class="fa ${this._probandFile.icon} fa-lg" style='padding-left: 5px'></i>
                                    </th>
                                    ${this._otherFiles && this._otherFiles.length ? this._otherFiles.map( file => html`
                                        <th rowspan="1" colspan="4" style="${file.style}">
                                            ${file.name}
                                            <i class$="fa ${file.icon} fa-lg" style='padding-left: 5px'></i>
                                        </th>
                                    `) : null}
                                    <!--                                <th rowspan="1" colspan$="{{_numberOfFiles}}" style="text-align: center">Medium coverage</th>-->

                                </tr>
                                <tr>
                                    <th rowspan="1">Average</th>
                                    <th rowspan="1">Max</th>
                                    <th rowspan="1">Min</th>

                                    <!--TODO recheck this-->
                                    ${this._otherFiles && this._otherFiles.length ? this._otherFiles.map( file => html`
                                        <th rowspan="1">% covered</th>
                                        <th rowspan="1">Average</th>
                                        <th rowspan="1">Max</th>
                                        <th rowspan="1">Min</th>
                                    `) : null }
                                </tr>
                                </thead>
                                <tbody>
                                ${this._lowCoverageValues && this._lowCoverageValues.length ? this._lowCoverageValues.map( coverage => html`
                                    <tr class="detail-view-row">
                                        <td>${coverage.region}</td>
                                        <td>${coverage.length}</td>
                                        <td>${coverage.stats.average}</td>
                                        <td>${coverage.stats.max}</td>
                                        <td>${coverage.stats.min}</td>
                                        ${this._otherFiles && this._otherFiles.length ? this._otherFiles.map(file => html`
                                            <td>${this._getCoverage(coverage, file)}</td>
                                            <td>${this._getAverage(coverage, file)}</td>
                                            <td>${this._getMax(coverage, file)}</td>
                                            <td>${this._getMin(coverage, file)}</td>
                                        `) : null }
                                    </tr>
                                `) : null }
                                
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : null }
            `}
        </div>
        `;
    }

}

customElements.define("opencga-panel-transcript-view", OpencgaPanelTranscriptView);
