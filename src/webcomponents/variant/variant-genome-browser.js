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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";

import "../../genome-browser/webcomponent/genome-browser.js";

export default class VariantGenomeBrowser extends LitElement {

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
                observer: "render"
            },
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            search: {
                type: Object,
                observer: "render"
            },
            samples: {
                type: Array,
                observer: "changeSamples"
            },
            species: {
                type: Object
            },
            region: {
                type: Object
            },
            active: {
                type: Boolean,
                value: false
            },
            fullScreen: {
                type: Boolean,
                observer: "onFullScreen"
            }
        };
    }

    _init() {
        // this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        if (UtilsNew.isEmpty(this._prefix)) {
            this._prefix = `VarGenBrowser${UtilsNew.randomString(6)}`;
        }
    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    static get observers() {
        return ["_hasFilesSamples(samplesWithFiles.*)"];
    }

    ready() {
        super.ready();

        this.summary = true;
        this.tracks = {
            sequence: {type: "sequence"},
            gene: {type: "gene"},
            variant: {type: "variant", config: {}},
            alignment: {type: "alignment", config: {}}
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.existsSamplesWithfiles = false;
        this.render();
        this.table = PolymerUtils.getElementById(`${this._prefix}VariantGenomeBrowserTable`);
    }

    changeSamples(e) {
        this.getFilesToVisualiseAlignmentTracks();
    }

    _hasFilesSamples() {
        let result = false;
        if (UtilsNew.isNotEmptyArray(this.samplesWithFiles)) {
            const someWithfiles = this.samplesWithFiles.some(element => {
                return UtilsNew.isNotEmptyArray(element.files);
            });
            result = someWithfiles;
        }

        this.existsSamplesWithfiles = result;
    }

    getFilesToVisualiseAlignmentTracks(settings) {
        this.samplesWithFiles = [];
        if (UtilsNew.isUndefinedOrNull(this._filesSelectedAlignment)) {
            this._filesSelectedAlignment = new Set();
            this._filesSelectedAlignmentName = [];
        }
        if (UtilsNew.isNotEmptyArray(this.samples)) {
            if (UtilsNew.isUndefined(settings)) {
                settings = {};
            }
            const samples = [];
            this.samples.forEach(sample => {
                samples.push(sample.id);
            });
            const query = {
                samples,
                study: this.opencgaSession.study.id,
                format: "BAM",
                include: "id,name,path,samples"
            };
            const _this = this;
            const _samplesWithFiles = [];
            const currentFilesSelectedAlignment = new Set();
            const currentFilesSelectedNameAlignment = [];
            this.opencgaClient.files()
                .search(query)
                .then(response => {
                    if (UtilsNew.isNotEmptyArray(response.response[0].result)) {

                        _this.samples.forEach(sampleSelected => {
                            const filesSamples = [];
                            response.response[0].result.forEach(file => {
                                const containSample = file.samples.some(sampleFile => sampleFile.id === sampleSelected.id);
                                if (containSample) {
                                    file.checked = false;
                                    if (_this._filesSelectedAlignment.has(file.id)) {
                                        file.checked = true;
                                        // this file id is which is selected from previous selection.
                                        currentFilesSelectedAlignment.add(file.id);
                                        currentFilesSelectedNameAlignment[file.id] = file.name;

                                    }
                                    filesSamples.push(file);
                                }
                            });
                            // Push linked filename list with sampleSelected using polymer array mutation method to update dom-repeat
                            _samplesWithFiles.push({name: sampleSelected.name, files: filesSamples});
                        });
                    }

                    // Re-assign selected files after select samples and update files to remove alignment track that are not selected after remove its samples
                    _this._filesSelectedAlignment = currentFilesSelectedAlignment;
                    _this._filesSelectedAlignmentName = currentFilesSelectedNameAlignment;
                    _this.samplesWithFiles = _samplesWithFiles;

                    //                            _this._files = currentFilesSelectedAlignment;
                    _this.tracks.alignment.config.files = _this._filesSelectedAlignment;
                    _this.tracks.alignment.config.filesName = _this._filesSelectedAlignmentName;
                    _this.tracks.variant.config.samples = _this.samples;

                    _this.set("tracks", Object.assign({}, _this.tracks));
                    // Update sampleswithfiles to show in checkbox

                    // Update _samples to render variant track
                    //                            _this._samples = _this.samples;

                })
                .catch(response => {
                    console.log(response);
                });
        } else {
            //                    this._samples = [];
            //                    this._files = [];
            const _tracks = {
                sequence: {type: "sequence"},
                gene: {type: "gene"},
                variant: {type: "variant"},
                alignment: {type: "alignment", config: {}}
            };
            this.set("tracks", _tracks);
        }
    }

    render() {
        this.variant = ""; // Empty the variant every time the grid is loaded
        if (typeof this.opencgaClient !== "undefined" && this.opencgaClient instanceof OpenCGAClient && typeof this.opencgaSession !== "undefined" &&
            typeof this.opencgaSession.project !== "undefined" && typeof this.opencgaSession.study !== "undefined" && typeof this.opencgaSession.study.alias !== "undefined") {
            const urlQueryParams = this._getUrlQueryParams();
            const queryParams = urlQueryParams.queryParams;
            let _numTotal = -1;
            const _this = this;
            $(`#${_this._prefix}VariantGenomeBrowserTable`).bootstrapTable("destroy");
            $(`#${_this._prefix}VariantGenomeBrowserTable`).bootstrapTable({
                theadClasses: "table-light",
                buttonsClass: "light",
                url: urlQueryParams.host,
                columns: [
                    {
                        title: "Variant",
                        field: "variant",
                        formatter: this.variantFormatter
                    }
                ],
                method: "get",
                sidePagination: "server",
                queryParams(params) {
                    queryParams.limit = params.limit;
                    queryParams.skip = params.offset;
                    //                            queryParams.skipCount = true;
                    if (typeof _this.query !== "undefined" && typeof _this.query.gene !== "undefined" && _this.query.gene !== "") {
                        queryParams.skipCount = false;
                    }
                    return queryParams;
                },
                responseHandler(res) {
                    if (_numTotal === -1) {
                        if (_this.summary || (typeof _this.query !== "undefined" && typeof _this.query.gene !== "undefined" && _this.query.gene !== "")) {
                            _numTotal = res.response[0].numTotalResults;
                        } else {
                            _numTotal = 1150;
                        }
                    }
                    return {total: _numTotal, rows: res.response[0].result};
                },
                onClickRow(row, $element) {
                    $(".success").removeClass("success");
                    $($element).addClass("success");
                    //                            _this._onSelectVariant(row);
                    _this.region = new Region({chromosome: row.chromosome, start: row.start, end: row.end});
                    //                            _this.set("region", new Region({chromosome: row.chromosome, start: row.start, end: row.end}));
                },
                onLoadSuccess(data) {
                    // The first time we mark as selected the first row that is rows[2] since the first two rows are the header
                    const table = PolymerUtils.getElementById(`${_this._prefix}VariantGenomeBrowserTable`);
                    if (UtilsNew.isNotUndefinedOrNull(table)) {
                        table.rows[1].setAttribute("class", "success");
                        //                            _this._onSelectVariant(data.rows[0]);
                        if (typeof data !== "undefined" && data.rows.length > 0) {
                            _this.region = new Region({
                                chromosome: data.rows[0].chromosome,
                                start: data.rows[0].start,
                                end: data.rows[0].end
                            });
                            //                                    _this.set('region', new Region({chromosome: data.rows[0].chromosome, start: data.rows[0].start, end: data.rows[0].end}));
                        }
                    }
                }
            });
            $(`#${_this._prefix}VariantGenomeBrowserTable`).bootstrapTable("showLoading");
        }
    }

    _getUrlQueryParams() {
        if (typeof this.opencgaClient === "undefined") {
            return {host: "", queryParams: {}, url: ""};
        }

        let host = this.opencgaClient.getConfig().host;
        if (!host.startsWith("https://") && !host.startsWith("http://")) {
            host = `https://${host}`;
        }

        if (typeof this.opencgaSession.project !== "undefined" && typeof this.opencgaSession.study.alias !== "undefined") {
            if (typeof this.query === "undefined") {
                this.query = {};
            }
            if (typeof this.query.studies === "undefined" || this.query.studies === "" || this.query.studies.split(new RegExp("[,;]")).length === 1) {
                this.query.studies = `${this.opencgaSession.project.alias}:${this.opencgaSession.study.alias}`;
            }
            host += "/webservices/rest/v1/analysis/variant/query";
        } else {
            return {host, queryParams: {}, url: ""};
        }

        const queryParams = {
            sid: this.opencgaClient._config.sessionId,
            timeout: 60000,
            summary: this.summary
        };

        Object.assign(queryParams, this.query); // Important : Adding the query object contents to queryParams

        if (typeof this.samples !== "undefined" && this.samples.length > 0) {
            const sampleNames = [];
            for (const sampleIdx in this.samples) {
                sampleNames.push(this.samples[sampleIdx].name);
            }
            queryParams.returnedSamples = sampleNames.join();
        } else {
            // queryParams.exclude = "studies,annotation.xrefs,annotation.populationFrequencies,annotation.conservation,annotation.geneTraitAssociation,annotation.geneDrugInteraction";
            queryParams.include = "id,chromosome,start,end,type,annotation.consequenceTypes";
        }

        if (typeof this.config !== "undefined" && typeof this.config.missing !== "undefined" && this.config.missing) {
            const keys = Object.keys(queryParams);
            for (let i = 0; i < keys.length; i++) {
                let val = queryParams[keys[i]];
                if (typeof val === "string") {
                    val = val.replace(/</g, "<<");
                    val = val.replace(/>/g, ">>");
                    queryParams[keys[i]] = val;
                }
            }
        }

        const query = ["limit=1000"];
        for (const key in queryParams) {
            // Check sid has a proper value. For public projects sid is undefined. In that case, sid must be removed from the url
            if (key === "sid" && queryParams[key] === undefined) {
                delete queryParams.sid;
            } else {
                query.push(`${key}=${queryParams[key]}`);
            }
        }
        const url = `${host}?${query.join("&")}`;

        return {host, queryParams, url};
    }

    variantFormatter(value, row) {
        const ref = (row.reference !== "") ? row.reference : "-";
        const alt = (row.alternate !== "") ? row.alternate : "-";
        let html = `${row.chromosome}:${row.start} ${ref}/${alt}`;
        if (typeof row.id !== "undefined" && row.id !== "") {
            html += `&nbsp;(<a target='_blank' href='https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?type=rs&rs=${row.id}'>${row.id}</a>)`;
        }
        if (typeof row.annotation !== "undefined" && typeof row.annotation.consequenceTypes !== "undefined" && row.annotation.consequenceTypes.length > 0) {
            html += "<br>";
            const cts = new Set();
            const arr = [];
            for (const ct of row.annotation.consequenceTypes) {
                if (!cts.has(ct.geneName)) {
                    arr.push(ct.geneName);
                    cts.add(ct.geneName);
                }
            }
            html += `<span>${arr.join()}</span>`;
        }
        return `<span style='white-space: nowrap;font-weight: bold'>${html}</span>`;
    }

    onFullScreen() {
        if (this.fullScreen) {
            this.genomeBrowserWidth = -1;
        } else {
            this.genomeBrowserWidth = -2;
        }
    }

    onRefreshAlignmentRender(e) {
        this.tracks.alignment.config.files = this._filesSelectedAlignment;
        this.tracks.alignment.config.filesName = this._filesSelectedAlignmentName;
        this.set("tracks", Object.assign({}, this.tracks));
    }

    toggleSelection(e) {
        if (UtilsNew.isNotUndefinedOrNull(e.target)) {
            let idFile = e.target.getAttribute("data-file-id");
            const filename = e.target.getAttribute("data-file-name");
            if (UtilsNew.isNotUndefinedOrNull(idFile)) {
                idFile = parseInt(idFile);
                if (this._filesSelectedAlignment.has(idFile)) {
                    this._filesSelectedAlignment.delete(idFile);
                    const filesSelectedAlignmentName = [];
                    this._filesSelectedAlignmentName.forEach((element, index) => {
                        if (idFile !== index) {
                            filesSelectedAlignmentName[index] = element;
                        }
                    });
                    this._filesSelectedAlignmentName = filesSelectedAlignmentName;

                } else {
                    this._filesSelectedAlignment.add(idFile);
                    this._filesSelectedAlignmentName[idFile] = filename;

                }
            }
        }
    }

    render_NEW() {
        return html`
        <!--<div class="alert alert-warning" role="alert" id="\${this._prefix}Warning" style="padding: 10px">-->
        <!--<span style="font-weight: bold;font-size: 1.20em">Warning!</span>&nbsp;&nbsp;Genome Browser is not fully integrated yet, this is just a prototype.-->
        <!--</div>-->

        <div class="panel panel-default">
            <div class="panel-body" role="tab" id="${this._prefix}GenomeBrowserSettings">
                <h3 class="panel-title">
                    <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                       href="#${this._prefix}Position" aria-expanded="true" aria-controls="${this._prefix}Position">
                        Settings
                        <!--<div style="float: right" class="tooltip-div">-->
                        <!--<a data-toggle="tooltip" title="Introduce a region interval and/or gene/variant ids.-->
                        <!--The filter will allow variants which fall within provided genomic intervals OR match the ids provided">-->
                        <!--<i class="fa fa-info-circle" aria-hidden="true"></i>-->
                        <!--</a>-->
                        <!--</div>-->
                    </a>
                </h3>
            </div>

            <div id="${this._prefix}Position" class="panel-collapse collapse in" role="tabpanel"
                 aria-labelledby="${this._prefix}GenomeBrowserSettings">
                <div class="panel-body">
                    <h4>Variant</h4>
                    <input type="checkbox"> View extended
                    <h4 style="padding-top: 5px">Alignments</h4>
                    <div style="padding-left: 20px">
                        ${this.existsSamplesWithfiles ? html`
                            ${this.samplesWithFiles && this.samplesWithFiles.length ? this.samplesWithFiles.map(sample => html`
                                ${this.sample.files.map(file => html`
                                    <input type="checkbox" style="padding-left: 25px" class="${this._prefix}FileCheckbox"
                                           data-file-id="${file.id}" @change="${this.toggleSelection}"
                                           .checked="${file.checked}" data-file-name="${file.name}" >
                                    <label>${sample.name}</label> ${file.name}
                                    <br>
                                `)}
                            `) : null }
                        ` : html`
                          <label>No samples selected</label>
                        `}
                    </div>
                    <div style="width: 120px;float: right;">
                        <button type="button" class="btn btn-primary" style="width: 100%"
                                @click="${this.onRefreshAlignmentRender}">Refresh
                        </button>
                    </div>
                </div>
            </div>

        </div>

        <div>
            <div class="" style="font-size: 11px;width: 20%;float: left;padding: 0px 0px">
                <table id="${this._prefix}VariantGenomeBrowserTable" data-pagination="true" data-page-list="[]"
                       style="padding: 0px 0px"></table>
            </div>
            <div class="" style="width: 80%;float: right;padding: 0px 5px">
                <genome-browser
                    .cellbaseClient="${this.cellbaseClient}"
                    .opencgaClient="${this.opencgaClient}"
                    .species="${this.species}"
                    .region="${this.region}"
                    .tracks="${this.tracks}"
                    .study="${this.opencgaSession.study}"
                    .project="${this.opencgaSession.project}"
                    .active="${this.active}"
                    .width="${this.genomeBrowserWidth}">
                </genome-browser>
            </div>
        </div>`;
    }

}

customElements.define("variant-genome-browser", VariantGenomeBrowser);

