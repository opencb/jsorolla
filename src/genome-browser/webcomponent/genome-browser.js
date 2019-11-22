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

export default class GenomeBrowserComponent extends LitElement {

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
                //              observer: "init"
            },
            // opencgaClient: {
            //     type: Object
            // },
            region: {
                type: Object
            },
            species: {
                type: Object
            },
            tracks: {
                type: Array
            },
            width: {
                type: Number
                //              value: 1400,
            },
            active: {
                type: Boolean
            },
            filter: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "gb_" + Utils.randomString(6) + "_";
        this.tracks = [
            {type: "sequence"},
            {type: "gene"}
        ];
        this.species = {
            id: "hsapiens",
            scientificName: "Homo sapiens",
            assembly: {name: "GRCh37"}
        };
        this.active = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("region")) {
            this._setRegion();
        }
        if (changedProperties.has("tracks")) {
            this.init();
        }
        if (changedProperties.has("width")) {
            this._updateWidth();
        }
        if (changedProperties.has("active")) {
            this._setActive();
        }
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("cellbaseClient") ||
            changedProperties.has("tracks") ||
            changedProperties.has("filter") ||
            changedProperties.has("active")) {
            this.propertyObserver(this.opencgaSession, this.cellbaseClient, this.tracks, this.filters, this.active);
        }
    }


    firstUpdated(_changedProperties) {

        this.init();
        //                this.region = {chromosome: "21", start: 22859462, end: 22859610};

        // We need to listen to Window resize
        window.addEventListener("resize", e => this._updateWidth());
    }


    init() {
        this.lastFilter = undefined;
    }

    propertyObserver(opencgaSession, cellbaseClient, tracks, filter, active) {
        if (typeof this.cellbaseClient === "undefined" || typeof this.opencgaSession === "undefined") {
            return;
        }

        if (!active) {
            return;
        }

        if (this._tracksCopy === tracks) {
            // We don't need to render anything again
            return;
        }

        this.clear();
        this._tracksCopy = tracks;

        const [myTracks, featureTracks] = this._getConfiguredTracks(tracks);
        this._addFilters(filter, featureTracks);
        this.featureTracks = featureTracks;

        if (typeof this.region === "undefined") {
            this.region = new Region("13:32889611-32973805"); // BRCA2
        }

        if (typeof this.genomeBrowser !== "undefined") {
            this.genomeBrowser.destroy();
        }

        this.width = $("#" + this._prefix + "GenomeBrowser").width();

        const defaultSettings = {
            client: this.cellbaseClient,
            target: this._prefix + "GenomeBrowser",
            region: this.region,
            availableSpecies: {vertebrates: [this.species]},
            species: this.species,
            width: this.width,
            //                    zoom: 80,
            sidePanel: false,
            autoRender: true,
            resizable: true,
            karyotypePanelConfig: {
                collapsed: true,
                collapsible: true
            },
            chromosomePanelConfig: {
                collapsed: true,
                collapsible: true
            },
            navigationBarConfig: {
                componentsConfig: {}
            },
            handlers: {
                "region:change": function(e) {
                    console.log(e);
                }
            }
        };

        const settings = Object.assign(defaultSettings, this.settings);
        this.genomeBrowser = new GenomeBrowser(settings);

        // Region Overview
        const gene = new FeatureTrack({
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            height: 120,
            renderer: new FeatureRenderer(FEATURE_TYPES.gene),
            dataAdapter: new CellBaseAdapter(this.cellbaseClient, "genomic", "region", "gene",
                {
                    exclude: "transcripts.tfbs,transcripts.xrefs,transcripts.exons.sequence"
                }, {
                    chunkSize: 100000
                })
        });
        this.genomeBrowser.addOverviewTrack(gene);
        this.genomeBrowser.addTrack(myTracks);
        this.genomeBrowser.draw();
    }

    _addFilters(filter, featureTracks) {
        const myFilter = Object.assign(this.getDefaultFilters(), filter);

        if (myFilter.active === false) {
            return;
        }

        const filterDiv = PolymerUtils.getElementById(this._prefix + "FilterMenu");
        if (UtilsNew.isUndefinedOrNull(filterDiv)) {
            return;
        }

        // Clean anything the div might have
        for (let i = 0; i < filterDiv.length; i++) {
            filterDiv[i].remove();
        }

        // Build collapsable panel
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        rowDiv.style.padding = "0px 10px";
        rowDiv.style.maring = "10px 0px";

        const colDiv = document.createElement("div");
        colDiv.classList.add("col-md-12");
        rowDiv.appendChild(colDiv);

        colDiv.appendChild($(`<div style="display: block; cursor:pointer;" on-click="toggleCollapsedFilter"
                                         data-toggle="collapse" href$="#${this._prefix}collapsibleFilter">
                                        <h3 class="form-section-title">${myFilter.title}</h3>
                                    </div>`)[0]);

        const elements = document.createElement("div");
        elements.id = `${this._prefix}collapsibleFilter`;
        elements.classList.add("form-horizontal", "collapse", "in");
        colDiv.appendChild(elements);

        for (let i = 0; i < myFilter.filters.length; i++) {
            switch (myFilter.filters[i].id) {
            case "gene":
                elements.appendChild(this._getGeneHtml(myFilter.filters[i]));
                // html += this._getGeneHtml(myFilter.filters[i]);
                break;
            case "region":
                elements.appendChild(this._getRegionHtml(myFilter.filters[i]));
                // html += this._getRegionHtml(myFilter.filters[i]);
                break;
            case "panel":
                const panelHtml = this._getPanelHtml(myFilter.filters[i], elements);
                if (UtilsNew.isNotUndefinedOrNull(panelHtml)) {
                    elements.appendChild(this._getPanelHtml(myFilter.filters[i], elements));
                }
                break;
            case "alignment":
                elements.appendChild(this._getTrackHtml(myFilter.filters[i], featureTracks, AlignmentTrack));
                break;
            case "variant":
                elements.appendChild(this._getTrackHtml(myFilter.filters[i], featureTracks, VariantTrack));
                break;
            default:
                break;
            }
        }

        // Add buttons
        const formGroupDiv = document.createElement("div");
        formGroupDiv.classList.add("form-group");

        const colButtonDiv = document.createElement("div");
        colButtonDiv.classList.add("col-md-offset-3", "col-md-9");
        formGroupDiv.appendChild(colButtonDiv);

        const clearButton = document.createElement("button");
        clearButton.classList.add("btn", "btn-primary");
        clearButton.type = "submit";
        clearButton.addEventListener("click", this.clearFilters.bind(this));
        clearButton.innerHTML = "Clear";
        colButtonDiv.appendChild(clearButton);

        const submitButton = document.createElement("button");
        submitButton.classList.add("btn", "btn-primary");
        submitButton.type = "submit";
        submitButton.addEventListener("click", this.showSelectionInGenomeBrowser.bind(this));
        submitButton.innerHTML = "Render";
        colButtonDiv.appendChild(submitButton);

        elements.appendChild(formGroupDiv);
        // elements.appendChild($(`<div class="form-group">
        //             <div class="col-md-offset-3 col-md-9">
        //                 <button type="submit" class="btn btn-primary" on-click="onClear">Clear</button>
        //                 <button type="submit" class="btn btn-primary" on-click="showSelectionInGenomeBrowser">Render</button>
        //             </div>
        //         </div>`)[0]);

        filterDiv.appendChild(rowDiv);
    }

    // filterObserver(filter, tracks) {
    //     let myFilter = Object.assign(this.getDefaultFilters(), filter);
    //
    //     if (myFilter.active === false) {
    //         return;
    //     }
    //
    //     let filterDiv = PolymerUtils.getElementById(this._prefix + "FilterMenu");
    //     if (UtilsNew.isUndefinedOrNull(filterDiv)) {
    //         return;
    //     }
    //
    //     // Clean anything the div might have
    //     for (let i = 0; i < filterDiv.length; i++) {
    //         filterDiv[i].remove();
    //     }
    //
    //     // return {
    //     //     title: "Genome Browser Filters",
    //     //     active: true,
    //     //     filters: [{
    //     //         title: "Search by Region",
    //     //         example: "e.g. 3:55555-666666",
    //     //         id: "region"
    //     //     }, {
    //     //         title: "Search by Gene",
    //     //         example: "Search for Gene Symbols",
    //     //         id: "gene"
    //     //     }]
    //     // }
    //
    //     // Build collapsable panel
    //     let rowDiv = document.createElement("div");
    //     rowDiv.classList.add("row");
    //     rowDiv.style.padding = "0px 10px";
    //     rowDiv.style.maring = "10px 0px";
    //
    //     let colDiv = document.createElement("div");
    //     colDiv.classList.add("col-md-12");
    //     rowDiv.appendChild(colDiv);
    //
    //     colDiv.appendChild($(`<div style="display: block; cursor:pointer;" on-click="toggleCollapsedFilter"
    //                              data-toggle="collapse" href$="#${this._prefix}collapsibleFilter">
    //                             <h3 class="form-section-title">${myFilter.title}</h3>
    //                         </div>`)[0]);
    //
    //     let elements = document.createElement("div");
    //     elements.id = `${this._prefix}collapsibleFilter`;
    //     elements.classList.add("form-horizontal", "collapse", "in");
    //     colDiv.appendChild(elements);
    //
    //     for (let i = 0; i < myFilter.filters.length; i++) {
    //         switch (myFilter.filters[i].id) {
    //             case "gene":
    //                 elements.appendChild(this._getGeneHtml(myFilter.filters[i]));
    //                 // html += this._getGeneHtml(myFilter.filters[i]);
    //                 break;
    //             case "region":
    //                 elements.appendChild(this._getRegionHtml(myFilter.filters[i]));
    //                 // html += this._getRegionHtml(myFilter.filters[i]);
    //                 break;
    //             case "panel":
    //                 let panelHtml = this._getPanelHtml(myFilter.filters[i], elements);
    //                 if (UtilsNew.isNotUndefinedOrNull(panelHtml)) {
    //                     elements.appendChild(this._getPanelHtml(myFilter.filters[i], elements));
    //                 }
    //                 break;
    //             case "alignment":
    //                 elements.appendChild(this._getTrackHtml(myFilter.filters[i], "alignment"));
    //                 break;
    //             case "variant":
    //                 elements.appendChild(this._getTrackHtml(myFilter.filters[i], "variant"));
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    //
    //     // Add buttons
    //     let formGroupDiv = document.createElement("div");
    //     formGroupDiv.classList.add("form-group");
    //
    //     let colButtonDiv = document.createElement("div");
    //     colButtonDiv.classList.add("col-md-offset-3", "col-md-9");
    //     formGroupDiv.appendChild(colButtonDiv);
    //
    //     let clearButton = document.createElement("button");
    //     clearButton.classList.add("btn", "btn-primary");
    //     clearButton.type = "submit";
    //     clearButton.addEventListener("click", this.clear.bind(this));
    //     clearButton.innerHTML = "Clear";
    //     colButtonDiv.appendChild(clearButton);
    //
    //     let submitButton = document.createElement("button");
    //     submitButton.classList.add("btn", "btn-primary");
    //     submitButton.type = "submit";
    //     submitButton.addEventListener("click", this.showSelectionInGenomeBrowser.bind(this));
    //     submitButton.innerHTML = "Render";
    //     colButtonDiv.appendChild(submitButton);
    //
    //     elements.appendChild(formGroupDiv);
    //     // elements.appendChild($(`<div class="form-group">
    //     //             <div class="col-md-offset-3 col-md-9">
    //     //                 <button type="submit" class="btn btn-primary" on-click="onClear">Clear</button>
    //     //                 <button type="submit" class="btn btn-primary" on-click="showSelectionInGenomeBrowser">Render</button>
    //     //             </div>
    //     //         </div>`)[0]);
    //
    //     filterDiv.appendChild(rowDiv);
    // }

    _getTrackHtml(filter, featureTracks, trackInstanceClass) {
        if (UtilsNew.isEmptyArray(featureTracks)) {
            console.log("WARNING: List of tracks is empty. Cannot display track selector.");
            return;
        }
        const tracks = [];
        for (let i = 0; i < featureTracks.length; i++) {
            if (featureTracks[i] instanceof trackInstanceClass) {
                tracks.push({
                    id: featureTracks[i]["id"],
                    title: featureTracks[i]["title"]
                });
            }
        }

        const div = document.createElement("div");
        div.classList.add("form-group");
        div.appendChild($(`<label class="control-label col-md-1 jso-label-title">${filter.title}</label>`)[0]);

        const innerDiv = document.createElement("div");
        innerDiv.classList.add("col-md-3", "form-check");
        div.appendChild(innerDiv);

        for (let i = 0; i < tracks.length; i++) {
            if (innerDiv.childElementCount > 0) {
                innerDiv.appendChild(document.createElement("br"));
            }

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("form-check-input", `${this._prefix}-checkbox`);
            checkbox.id = `${tracks[i]["id"]}`;
            checkbox.setAttribute("data-track", tracks[i]["id"]);

            const label = document.createElement("label");
            label.classList.add("form-check-label");
            label.setAttribute("for", `${tracks[i]["id"]}`);
            label.innerText = tracks[i]["title"];

            innerDiv.appendChild(checkbox);
            innerDiv.appendChild(label);
        }

        return div;
    }

    // TODO why $?
    _getRegionHtml(filter) {
        return $(`<div class="form-group">
                            <label class="control-label col-md-1 jso-label-title">${filter.title}</label>
                            <div class="input-group col-md-3" style="padding-left: 15px;padding-right: 15px">
                                <input id="${this._prefix}RegionInputText" type="text" class="form-control" placeholder="${filter.example}">
                                <span class="input-group-btn">
                                <button class="btn btn-default" type="button" @click="${this.onEraserClicked}">
                                    <i class="fa fa-eraser" aria-hidden="true"></i>
                                </button>
                            </span>
                            </div>
                        </div>`)[0];
    }

    // TODO REFACTOR!
    _getGeneHtml(filter) {
        const cellbase = document.createElement("cellbase-gene-filter");
        cellbase.cellbaseClient = this.cellbaseClient;
        cellbase.id = `${this._prefix}-geneFilter`;
        cellbase.erase = this.eraseSearchGene;
        // cellbase.addEventListener("genechange", this.onInputGeneChange.bind(this));

        const div = document.createElement("div");
        div.classList.add("form-group");
        div.appendChild($(`<label class="control-label col-md-1 jso-label-title">${filter.title}</label>`)[0]);

        const innerDiv = document.createElement("div");
        innerDiv.classList.add("col-md-3");

        innerDiv.appendChild(cellbase);
        div.appendChild(innerDiv);

        return div;
    }

    _getPanelHtml(filter, parentDiv) {
        if (UtilsNew.isNotEmptyArray(this._genePanels)) {
            // Return html
            let html = `<div class="form-group">
                            <label class="control-label col-md-1 jso-label-title">${filter.title}</label>
                            <div class="col-md-3">
                                <select class="selectpicker" id="${this._prefix}-geneSelect" data-live-search="true" data-max-options="1"
                                        on-dom-change="renderDomRepeat" multiple>`;
            for (let i = 0; i < this._genePanels.length; i++) {
                html += `<optgroup label="${this._genePanels[i].name}">`;
                for (let j = 0; j < this._genePanels[i].genes.length; j++) {
                    html += `<option>${this._genePanels[i].genes[j].name}</option>`;
                }
                html += "</optgroup>";
            }
            html += "</select></div></div>";
            return $(html)[0];
        } else {
            const lastChild = parentDiv.lastChild;

            // We first need to fetch the panel information
            if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession)) {
                const _this = this;
                if (UtilsNew.isNotEmptyArray(filter.values)) {
                    this.opencgaSession.opencgaClient.panels().info(filter.values.join(","),
                        {
                            study: _this.opencgaSession.study.fqn,
                            include: "id,name,genes"
                        })
                        .then(function(response) {
                            const _panels = [];
                            for (const panel of response.response) {
                                _panels.push(panel.result[0]);
                            }
                            _this._genePanels = _panels;

                            if (UtilsNew.isUndefinedOrNull(lastChild.nextSibling)) {
                                parentDiv.appendChild(_this._getPanelHtml(filter));
                            } else {
                                parentDiv.insertBefore(_this._getPanelHtml(filter), lastChild.nextSibling);
                            }

                            // Force the selectpicker to be rendered
                            $(`#${_this._prefix}-geneSelect`, parentDiv).selectpicker("refresh");
                        })
                        .catch(response => {
                            console.error("An error occurred fetching panels: ", response);
                        });
                } else {
                    this._genePanels = [];
                }
            }

            return undefined;
        }
    }

    clear() {
        // Clean any old filter that might exist
        const children = $(`#${this._prefix}FilterMenu`).children();
        for (let i = 0; i < children.length; i++) {
            children[i].remove();
        }

        // Destroy genome browser if it existed
        if (UtilsNew.isNotUndefinedOrNull(this.genomeBrowser)) {
            this.genomeBrowser.destroy();
        }
    }

    clearFilters() {
        const geneFilter = document.getElementById(`${this._prefix}-geneFilter`);
        if (UtilsNew.isNotUndefinedOrNull(geneFilter)) {
            geneFilter.clear();
        }
        PolymerUtils.setValue(`${this._prefix}RegionInputText`, "");
        $(`#${this._prefix}-geneSelect`).selectpicker("deselectAll");
    }

    showSelectionInGenomeBrowser() {
        let searchBy = undefined;
        let search = undefined;

        const geneFilter = document.getElementById(`${this._prefix}-geneFilter`);
        if (UtilsNew.isNotUndefinedOrNull(geneFilter)) {
            const gene = geneFilter.gene;
            if (UtilsNew.isNotEmpty(gene)) {
                searchBy = "gene";
                search = gene;
            }
        }

        const regionFilter = document.getElementById(`${this._prefix}RegionInputText`);
        if (UtilsNew.isNotUndefinedOrNull(regionFilter)) {
            const region = regionFilter.value;
            if (UtilsNew.isNotEmpty(region)) {
                if (UtilsNew.isNotEmpty(searchBy)) {
                    NotificationUtils.showNotify("Cannot apply 'region' and 'gene' filters. Please, choose one or the other.", "WARNING");
                    return;
                }
                search = region;
                searchBy = "region";
            }
        }

        const panelGene = $(`#${this._prefix}-geneSelect`).selectpicker("val");
        if (UtilsNew.isNotEmptyArray(panelGene)) {
            if (UtilsNew.isNotEmpty(searchBy)) {
                NotificationUtils.showNotify("Cannot apply '" + searchBy + "' and 'gene panel' filters. " +
                    "Please, choose one or the other.", "WARNING");
                return;
            }
            searchBy = "gene";
            search = panelGene[0];
        }

        if (UtilsNew.isNotEmpty(searchBy)) {
            if (searchBy === "gene") {
                const _this = this;
                this.cellbaseClient.getGeneClient(search, "info", {exclude: "annotation"}, {})
                    .then(function(response) {
                        const gene = response.response[0].result[0];
                        _this.genomeBrowser.setRegion(`${gene.chromosome}:${gene.start}-${gene.end}`);
                    });
            } else {
                this.genomeBrowser.setRegion(search);
            }
        }

        this._addSelectedTracks();
    }

    // _addSelectedTracks(trackType) {
    //     let checkedTracks = $(`.${this._prefix}-${trackType}-checkbox:checked`);
    //     let checkedTrackIds = [];
    //     for (let i = 0; i < checkedTracks.length; i++) {
    //         checkedTrackIds.push(checkedTracks[i].dataset.track);
    //     }
    //
    //     for (let i = 0; i < this.tracks.length; i++) {
    //         if (this.tracks[i]['type'] === trackType && checkedTrackIds.indexOf(this.tracks[i]['config']['data']['name']) > -1) {
    //             if (!this.genomeBrowser.containsTrackById(this.tracks[i]['config']['data']['name'])) {
    //                 let track = undefined;
    //                 if (trackType === "variant") {
    //                     track = this._addVariantTrack(this.tracks[i]);
    //                 } else if (trackType === "alignment") {
    //                     track = this._addAlignmentTrack(this.tracks[i]);
    //                 } else {
    //                     console.log("ERROR: Track must be of type 'alignment' or 'variant'");
    //                 }
    //
    //                 this.genomeBrowser.addTrack(track);
    //             }
    //         }
    //     }
    //
    //     // Remove unchecked tracks
    //     let uncheckedTracks = $(`.${this._prefix}-${trackType}-checkbox:not(:checked)`);
    //     for (let i = 0; i < uncheckedTracks.length; i++) {
    //         let trackId = uncheckedTracks[i].dataset.track;
    //         let track = this.genomeBrowser.getTrackById(trackId);
    //         if (UtilsNew.isNotUndefinedOrNull(track)) {
    //             this.genomeBrowser.removeTrack(track);
    //         }
    //     }
    // }

    _addSelectedTracks() {
        const checkedTracks = $(`.${this._prefix}-checkbox:checked`);
        const checkedTrackIds = [];
        for (let i = 0; i < checkedTracks.length; i++) {
            checkedTrackIds.push(checkedTracks[i].dataset.track);
        }

        for (let i = 0; i < this.featureTracks.length; i++) {
            if (checkedTrackIds.indexOf(this.featureTracks[i]["id"]) > -1) {
                if (!this.genomeBrowser.containsTrackById(this.featureTracks[i]["id"])) {
                    this.genomeBrowser.addTrack(this.featureTracks[i]);
                }
            }
        }

        // Remove unchecked tracks
        const uncheckedTracks = $(`.${this._prefix}-checkbox:not(:checked)`);
        for (let i = 0; i < uncheckedTracks.length; i++) {
            const trackId = uncheckedTracks[i].dataset.track;
            if (this.genomeBrowser.containsTrackById(trackId)) {
                const track = this.genomeBrowser.getTrackById(trackId);
                this.genomeBrowser.removeTrack(track);
            }
        }
    }

    _addSequenceTrack(settings) {
        let mySettings = {
            title: "Sequence",
            height: 20,
            visibleRegionSize: 200,

            renderer: new SequenceRenderer(),
            dataAdapter: new CellBaseAdapter(this.cellbaseClient, "genomic", "region", "sequence", {}, {chunkSize: 100})
        };
        mySettings = Object.assign(mySettings, settings);
        return new FeatureTrack(mySettings);
    }

    _addGeneTrack(settings) {
        let mySettings = {
            title: "Gene",
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            minTranscriptRegionSize: 200000,
            height: 100,

            renderer: new GeneRenderer({
                handlers: {
                    "feature:click": function(e) {
                        console.log(e);
                    }
                }
            }),
            dataAdapter: new CellBaseAdapter(this.cellbaseClient, "genomic", "region", "gene",
                {
                    exclude: "transcripts.tfbs,transcripts.xrefs,transcripts.exons.sequence"
                }, {
                    chunkSize: 100000
                })
        };
        mySettings = Object.assign(mySettings, settings);
        return new GeneTrack(mySettings);
    }

    _addVariantTrack(settings) {
        let title = "Variant";
        if (UtilsNew.isNotUndefinedOrNull(settings.data.name)) {
            title = settings.data.name;
        }
        //                console.log("Study credentials: " + this.project.alias + ":" + this.study.alias);
        const mySettings = {
            title: title,
            closable: true,
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            minTranscriptRegionSize: 200000,
            visibleRegionSize: 100000000,
            height: 100,
            opencga: {
                client: this.opencgaSession.opencgaClient,
                studies: `${this.opencgaSession.project.alias}:${this.opencgaSession.study.alias}`,
                config: {}
                //                        studies: "reference_grch37:1kG_phase3"
                //                        "HG00096", "HG00097", "HG00099"
            }
            //                    renderer: new FeatureRenderer(FEATURE_TYPES.variant),
        };

        if (settings.data.samples !== undefined && settings.data.samples.length > 0) {
            mySettings.opencga.samples = settings.data.samples;
        } else {
            mySettings.opencga.samples = [];
        }

        if (settings.data.files !== undefined && settings.data.files.length > 0) {
            mySettings.opencga.files = settings.data.files;
        } else {
            mySettings.opencga.files = [];
        }

        // mySettings = Object.assign(mySettings, settings);
        return new VariantTrack(mySettings);
    }


    _addAlignmentTrack(settings) {
        let title = "Aligment";
        if (UtilsNew.isNotUndefinedOrNull(settings.data.name)) {
            title = settings.data.name;
        }
        let mySettings = {
            title: title,
            closable: true,
            minHistogramRegionSize: 5000,
            maxLabelRegionSize: 3000,
            visibleRegionSize: 100000000,
            height: 300,
            opencga: {
                client: this.opencgaSession.opencgaClient,
                studies: `${this.opencgaSession.project.alias}:${this.opencgaSession.study.alias}`,
                //                        config: {height:1},
                // By default no custom config
                config: {}

                //                        studies: "reference_grch37:1kG_phase3"
                //                        "HG00096", "HG00097", "HG00099"
            }
        };

        // You have to pass opencga.config to renderer if you use your own renderer. If you customize config yo have to change opencga.config.
        const renderer = {
            renderer: new AlignmentRenderer({config: mySettings.opencga.config}),
            dataAdapter: new OpencgaAdapter(this.opencgaSession.opencgaClient, "analysis/alignment", undefined, "query",
                settings.data)
        };
        mySettings = Object.assign(mySettings, settings.config, renderer);
        return new AlignmentTrack(mySettings);
    }

    /*
     settings is supposed to have:
     - type: alignment...
     - config: Configuration of the track (title, closable, height...)
     - source: opencga, cellbase...
     - data: data that will be used
     */
    addAlignmentTrack(settings = {}) {
        const resTracks = [];

        if (UtilsNew.isNotUndefinedOrNull(settings.files) && settings.files.length > 0) {
            const _this = this;
            settings.files.forEach(function(file) {
                const mySettings = {
                    data: {
                        fileId: file.path,
                        name: file.name,
                        study: _this.opencgaSession.study.id
                    }
                };

                // if (UtilsNew.isNotEmptyArray(settings.filesName) && settings.filesName.length > 0) {
                //     mySettings.data.name = settings.filesName[file];
                //
                // }

                Object.assign(settings, mySettings);
                const track = _this._addAlignmentTrack(settings);
                resTracks.push(track);

            });
        }
        return resTracks;
    }

    addGenericTrack(settings) {
        switch (settings.type) {
        case "alignment":
        default:
            return this._addAlignmentTrack(settings);
        }
    }

    /* Building
      example:
        uriTemplate: "http://ws.babelomics.org/cellbase/webservices/rest/v4/hsapiens/genomic/region/13:32990000-32999999/snp?exclude={exclude}"
        templateVariables: {exclude:'annotation.populationFrequencies,annotation.additionalAttributes,transcriptVariations,xrefs,samples'}
     */
    _addTemplateTrack(settings = {}) {

        const uriTemplate = settings.uriTemplate;
        const templateVariables = settings.templateVariables;
        const title = settings.title;
        const t = new FeatureTrack({
            title: title,
            closable: true,
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            minTranscriptRegionSize: 200000,
            histogramColor: "#92de47",
            height: 100,
            renderer: new FeatureRenderer(FEATURE_TYPES.snp),
            dataAdapter: new FeatureTemplateAdapter({
                multiRegions: false,
                histogramMultiRegions: false,
                uriTemplate: uriTemplate,
                templateVariables: templateVariables,
                species: genomeBrowser.species,
                cacheConfig: {
                    chunkSize: 100000
                },
                parse: function(response) {
                    const chunks = [];
                    for (let i = 0; i< response.response.length; i++) {
                        const res = response.response[i].result;
                        chunks.push(res);
                    }
                    return chunks;
                }
            })
        });
        return (t);
    }

    _setRegion(region) {
        if (typeof this.genomeBrowser === "undefined") {
            this.init();
        }

        if (typeof this.genomeBrowser !== "undefined" && this.active) {
            this.genomeBrowser.setRegion(region);
        }
    }

    //            _setSamples(samples) {
    //                if (typeof this.genomeBrowser === "undefined") {
    //                    this.init();
    //                }
    //            }

    _updateWidth(width) {
        if (typeof this.genomeBrowser !== "undefined") {
            // Check if width has been passed, otherwise we calculate the max for the current DIV size
            if (width === undefined || width === null || width < 0) {
                width = $("#" + this._prefix + "GenomeBrowser").width();
            }

            // Set the with to the genome browser
            this.genomeBrowser.setWidth(width);
        }
    }

    _setActive(active) {
        if (active && typeof this.genomeBrowser === "undefined") {
            this.init();
        }
    }

    _getConfiguredTracks(tracks) {
        const _tracks = [];
        const featureTracks = [];

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            switch (track.type) {
            case "sequence":
                _tracks.push(this._addSequenceTrack(track.config));
                break;
            case "gene":
                _tracks.push(this._addGeneTrack(track.config));
                break;
            case "variant":
                // featureTracks[track.id] = this._addVariantTrack(track.config);
                featureTracks.push(this._addVariantTrack(track.config));
                break;
            case "alignment":
                // featureTracks[track.id] = this._addAlignmentTrack(track.config);
                featureTracks.push(this._addAlignmentTrack(track.config));
                break;
            case "template":
                _tracks.push(this._addTemplateTrack(track.config));
                break;
//                            default:
//                                tracks.push(this.addGenericTrack(this.trackConfigs[this.tracks[i]]));
//                                break;
            }
        }

        // if (UtilsNew.isNotUndefinedOrNull(files)) {
        //     for (let sample in files) {
        //         let featureFiles = files[sample];
        //         for (let j = 0; j < featureFiles.length; j++) {
        //             featureFiles[j].display = display;
        //             if (featureFiles[j].bioformat === "VARIANT") {
        //                 variants[role] = featureFiles[j];
        //                 variants[role]['sample'] = samples[i];
        //             } else if (featureFiles[j].bioformat === "ALIGNMENT") {
        //                 alignments[role] = featureFiles[j];
        //             } else if (featureFiles[j].bioformat === "COVERAGE") {
        //                 coverage[role] = featureFiles[j];
        //             }
        //         }
        //     }
        // }

        return [_tracks, featureTracks];
    }

    getDefaultFilters() {
        return {
            title: "Genome Browser Filters",
            active: false,
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
                values: ["Xeroderma_pigmentosum-Trichothiodystrophy_or_Cockayne_syndrome-PanelAppId-77", "White_matter_disorders_and_cerebral_calcification-narrow_panel-PanelAppId-476"]
            }, {
                title: "Show alignments (BAM)",
                id: "alignment"
            }, {
                title: "Show variants (VCF)",
                id: "variant"
            }]
        };
        /* Other allowed filters */
        // filters: [{
        //     title: "Select a Gene from a Panel",
        //     id: "panel",
        //     values: ["A", "B", "C"]
        // }, {
        //     title: "Show alignments (BAM)",
        //     id: "alignment"
        // }, {
        //     title: "Show variants (VCF)",
        //     id: "variant"
        // }]
    }

    render() {
        return html`
        <div id="${this._prefix}FilterMenu"></div>
        <h3 class="form-section-title">Genome Browser</h3>
        <div id="${this._prefix}GenomeBrowser"></div>
        `;
    }

}

customElements.define("genome-browser", GenomeBrowserComponent);
