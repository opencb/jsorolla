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

export default class OpencgaVariantSamples extends LitElement {

    constructor() {
        super();

        this._init();
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            variant: {
                type: String,
                //observer: "variantObserver"
            },
            active: {
                type: Boolean,
                //observer: "activeObserver"
            }
        };
    }

    _init() {
        this._prefix = "ovcs" + Utils.randomString(6);
        this.catalogUiUtils = new CatalogUIUtils();
        this.active = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("active")) {
            this.activeObserver();
        }
    }

    activeObserver(e) {
        this._querySamples(e);
    }

    variantObserver(e) {
        this._querySamples(e);
    }

    _querySamples(e) {
        if (UtilsNew.isNotUndefinedOrNull(this.variant) && this.variant.split(":").length > 2 && this.active) {
            let params = {
                id: this.variant,
                study: this.opencgaSession.study.fqn,
                // genotype: "0/1,0|1",
                sid: this.opencgaSession.opencgaClient._config.sessionId,
                limit: 100
            };

            // this.samplesHet = [];
            // this.samplesHomAlt = [];

            // shows loading modal
            $(PolymerUtils.getElementById(this._prefix + "LoadingModal")).modal("show");

            let _this = this;
            setTimeout(() => {
                PolymerUtils.hide(_this._prefix + "Warning");
                this.opencgaSession.opencgaClient.variants().sampleData(_this.variant, params)
                    .then(function(response) {
                        let result = response.response[0].result[0];

                        // Clear everything
                        _this.samplesHet = [];
                        _this.samplesHetSize = 0;
                        _this.showSamplesHetTable = false;
                        PolymerUtils.innerHTML(_this._prefix + "HetTBody", "");
                        _this.samplesHomAlt = [];
                        _this.samplesHomAltSize = 0;
                        _this.showSamplesHomAltTable = false;
                        PolymerUtils.innerHTML(_this._prefix + "HomAltTBody", "");
                        _this.samplesNA = [];
                        _this.samplesNASize = 0;
                        _this.showSamplesNATable = false;
                        PolymerUtils.innerHTML(_this._prefix + "NATBody", "");

                        // For each genotype in the response.samples
                        for (let gt in result.samples) {
                            let sampleInfo = [];
                            let sampleIds = [];
                            for (let sample of result.samples[gt]) {
                                sampleInfo.push(sample);
                                sampleIds.push(sample.id);
                            }

                            // Fetch INDIVIDUAL information from samples
                            if (UtilsNew.isNotEmptyArray(sampleIds)) {
                                _this.opencgaSession.opencgaClient.samples().info(sampleIds.join(","),
                                    {
                                        study: _this.opencgaSession.study.fqn,
                                        includeIndividual: true
                                    })
                                    .then(function(response) {
                                        let tr = "";
                                        for (let i = 0; i < response.response.length; i++) {
                                            let individual = response.response[i].result[0].attributes.OPENCGA_INDIVIDUAL;

                                            if (UtilsNew.isEmpty(individual)) {
                                                individual = {
                                                    id: "Not found",
                                                    disorders: undefined,
                                                    phenotypes: undefined
                                                };
                                            }

                                            if (UtilsNew.isNotEmpty(individual)) {
                                                sampleInfo[i].individualId = individual.id;

                                                let disordersHtml = "";
                                                sampleInfo[i].disorders = [];
                                                if (UtilsNew.isNotEmptyArray(individual.disorders)) {
                                                    for (let disorder of individual.disorders) {
                                                        let disorderHtmlContent = "-";
                                                        if (UtilsNew.isNotUndefinedOrNull(disorder)) {
                                                            sampleInfo[i].disorders.push(disorder.id);
                                                            disorderHtmlContent = disorder.name + " (" + disorder.id + ")";
                                                        }
                                                        disordersHtml += "<div>" + disorderHtmlContent + "</div>";
                                                    }
                                                }

                                                let phenotypeTooltipText = "";
                                                sampleInfo[i].phenotypes = [];
                                                if (UtilsNew.isNotEmptyArray(individual.phenotypes)) {
                                                    for (let phenotype of individual.phenotypes) {
                                                        sampleInfo[i].phenotypes.push(phenotype.id);
                                                        phenotypeTooltipText += `<div style="padding: 5px">`;
                                                        if (UtilsNew.isNotUndefinedOrNull(phenotype.source) && phenotype.source.toUpperCase() === "HPO") {
                                                            phenotypeTooltipText += `<span>
                                                                                                <a target="_blank" href="https://hpo.jax.org/app/browse/term/${phenotype.id}">${phenotype.id} </a>(${phenotype.status})
                                                                                            </span>
                                                                        `;
                                                        } else {
                                                            phenotypeTooltipText += `<span>${phenotype.id} (${phenotype.status})</span>`;
                                                        }
                                                        phenotypeTooltipText += "</div>";
                                                    }
                                                }

                                                let phenotypes = `<div class="phenotypesTooltip" data-tooltip-text='${phenotypeTooltipText}' align="center">
                                                                            <a style="cursor: pointer">
                                                                                ${individual.phenotypes !== undefined ? individual.phenotypes.length : 0} terms found
                                                                            </a>
                                                                        </div>
                                                            `;

                                                let variantDataFields = [];
                                                let attributes = result.files[sampleInfo[i].fileId].attributes;
                                                variantDataFields.push(`<div class="col-md-12" style="padding: 5px 5px">
                                                                            <form class="form-horizontal">
                                                                                <label>File Info Data</label>`);
                                                for (let formatField in attributes) {
                                                    let html = `<div class="form-group" style="margin: 0px 2px">
                                                                            <label class="col-md-5">${formatField}</label>
                                                                            <div class="col-md-7">${attributes[formatField]}</div>
                                                                        </div>`;
                                                    variantDataFields.push(html);
                                                }
                                                variantDataFields.push("</form></div>");

                                                variantDataFields.push(`<div class="col-md-12" style="padding: 5px 5px">
                                                                            <form class="form-horizontal">
                                                                                <label>Sample Format Data</label>`);
                                                for (let formatField in sampleInfo[i].sampleData) {
                                                    let html = `<div class="form-group" style="margin: 0px 2px">
                                                                        <label class="col-md-5">${formatField}</label>
                                                                        <div class="col-md-7">${sampleInfo[i].sampleData[formatField]}</div>
                                                                    </div>`;
                                                    variantDataFields.push(html);
                                                }
                                                variantDataFields.push("</form></div>");

                                                let variantDataHtml = `<div class="formatTooltip" data-tooltip-text='${variantDataFields.join("")}' align="center">
                                                                            <a style="cursor: pointer">
                                                                                View fields
                                                                            </a>
                                                                        </div>
                                                            `;
                                                tr += `<tr class="detail-view-row">
                                                                            <td>${sampleInfo[i].id}</td>
                                                                            <td>${sampleInfo[i].individualId}</td>
                                                                            <td>${disordersHtml !== "" ? disordersHtml : "-"}</td>
                                                                            <td>${phenotypes}</td>
                                                                            <td>${variantDataHtml}</td>
                                                                            <td>${sampleInfo[i].fileId}</td>
                                                                       </tr>`;
                                            }
                                        }

                                        switch (gt) {
                                        case "0/1":
                                            _this.showSamplesHetTable = true;
                                            _this.samplesHetSize = sampleInfo.length;
                                            _this.samplesHet = sampleInfo;
                                            PolymerUtils.innerHTML(_this._prefix + "HetTBody", tr);
                                            break;
                                        case "1/1":
                                            _this.showSamplesHomAltTable = true;
                                            _this.samplesHomAltSize = sampleInfo.length;
                                            _this.samplesHomAlt = sampleInfo;
                                            PolymerUtils.innerHTML(_this._prefix + "HomAltTBody", tr);
                                            break;
                                        case "NA":
                                            _this.showSamplesNATable = true;
                                            _this.samplesNASize = sampleInfo.length;
                                            _this.samplesNA = sampleInfo;
                                            PolymerUtils.innerHTML(_this._prefix + "NATBody", tr);
                                            break;
                                        }
                                        if (response.response.length === 100) {
                                            PolymerUtils.show(_this._prefix + "Warning");
                                        }
                                        _this.catalogUiUtils.addTooltip("div.phenotypesTooltip", "Phenotypes");
                                        _this.catalogUiUtils.addTooltip("div.formatTooltip", "Variant Data");
                                        _this.catalogUiUtils.addTooltip("div.infoTooltip", "File Info Fields");
                                    });
                            } else {
                                switch (gt) {
                                case "0/1":
                                    _this.showSamplesHetTable = false;
                                    _this.samplesHetSize = sampleInfo.length;
                                    _this.samplesHet = [];
                                    PolymerUtils.innerHTML(_this._prefix + "HetTBody", "");
                                    break;
                                case "1/1":
                                    _this.showSamplesHomAltTable = false;
                                    _this.samplesHomAltSize = sampleInfo.length;
                                    _this.samplesHomAlt = [];
                                    PolymerUtils.innerHTML(_this._prefix + "HomAltTBody", "");
                                    break;
                                case "NA":
                                    _this.showSamplesNATable = false;
                                    _this.samplesNASize = sampleInfo.length;
                                    _this.samplesNA = [];
                                    PolymerUtils.innerHTML(_this._prefix + "NATBody", "");
                                    break;
                                }
                            }
                        }
                        $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
                    })
                    .catch(function(reason) {
                        console.error(reason);
                        $(PolymerUtils.getElementById(_this._prefix + "LoadingModal")).modal("hide");
                    });
            }, 200);
        }
    }

    handleCollapseAction(e) {
        let id = e.target.dataset.id;
        let elem = $("#" + this._prefix + id)[0];
        elem.hidden = !elem.hidden;
        if (elem.hidden) {
            e.target.className = "fa fa-plus-circle";
        } else {
            e.target.className = "fa fa-minus-circle";
        }
    }

    _downloadSamples() {
        let dataString = [];
        dataString.push("#Sample ID\tIndividual ID\tGenotype\tDisorders\tPhenotypes");
        for (let sample of this.samplesHet) {
            dataString.push(`${sample.id}\t${sample.individualId}\t0/1\t${sample.disorders !== undefined ? sample.disorders.join(",") : ""}\t${sample.phenotypes !== undefined ? sample.phenotypes.join(",") : ""}`);
        }
        for (let sample of this.samplesHomAlt) {
            dataString.push(`${sample.id}\t${sample.individualId}\t1/1\t${sample.disorders !== undefined ? sample.disorders.join(",") : ""}\t${sample.phenotypes !== undefined ? sample.phenotypes.join(",") : ""}`);
        }
        for (let sample of this.samplesNA) {
            dataString.push(`${sample.id}\t${sample.individualId}\tNA\t${sample.disorders !== undefined ? sample.disorders.join(",") : ""}\t${sample.phenotypes !== undefined ? sample.phenotypes.join(",") : ""}`);
        }

        let data = new Blob([dataString.join("\n")], {type: "text/plain"});
        let file = window.URL.createObjectURL(data);
        let a = document.createElement("a");
        a.href = file;
        a.download = this.opencgaSession.study.alias + "_sample_genotypes.txt";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
        }, 0);

    }

    _createDefaultColumns() {
        let columns = [
            [
                {
                    title: "ID",
                    field: "id",
                    colspan: 1,
                    rowspan: 1,
                    // formatter: this.variantFormatter,
                    align: "center"
                },
                {
                    title: "phenotypes",
                    field: "phenotypes",
                    colspan: 1,
                    rowspan: 1,
                    // formatter: this.snpFormatter,
                    align: "center"
                },
                {
                    title: "File",
                    field: "source",
                    colspan: 1,
                    rowspan: 1,
                    // formatter: this.geneFormatter,
                    align: "center"
                },
                {
                    title: "Description",
                    field: "description",
                    colspan: 1,
                    rowspan: 1,
                    // formatter: this.geneFormatter,
                    align: "center"
                }
            ]
        ];

        return columns;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false
            // detailView: true,
            // detailFormatter: this.detailFormatter,
        };
    }

    render() {
        return html`
    <div>
        <style include="jso-styles"></style>
    
        <div class="col-md-10 col-md-offset-1" style="margin-bottom: 10px">
            <div class="alert alert-warning" role="alert" id="${this._prefix}Warning" style="display: none;padding: 10px">
                <span style="font-weight: bold;font-size: 1.20em">Warning:</span>&nbsp;&nbsp;At this moment the number of
                samples returned is limited to 100 for each genotype (0/1, 1/1 or no-call).
                This limit will be removed shortly.
            </div>
        </div>
    
        <div class="col-md-12 col-md-offset-10" style="padding: 20px 0px 10px 0px">
            <button type="button" class="btn btn-primary btn-sm" data-toggle="popover" data-placement="bottom"
                    @click="${this._downloadSamples}">
                <i class="fa fa-download" aria-hidden="true"></i> Download
            </button>
        </div>
    
        <div class="col-md-12">
            <h4 style="font-weight: bold;padding: 20px 0px 0px 0px">
                <i class="fa fa-minus-circle" @click="${this.handleCollapseAction}" data-id="Het" style="cursor: pointer"></i>
                &nbsp;Heterozygous (0/1) <span class="badge">${this.samplesHetSize}</span>
            </h4>
    
            <div id="${this._prefix}Het">
                <div style="padding: 5px 20px">
                    <table class="table table-bordered">
                        <thead>
                        <tr>
                            <th scope="col" rowspan="2">Sample ID</th>
                            <th scope="col" rowspan="2">Individual ID</th>
                            <th scope="col" rowspan="2">Disorders</th>
                            <th scope="col" rowspan="2">Phenotypes</th>
                            <th scope="col" rowspan="2">Variant Data</th>
                            <th scope="col" rowspan="2">File Info</th>
                        </tr>
                        </thead>
                        <tbody id="${this._prefix}HetTBody"></tbody>
                    </table>
                </div>
    
                ${!this.showSamplesHetTable ? html`
                    <div style="padding: 0px 20px 5px 25px">
                        No samples found
                    </div>
                ` : null }
            </div>
        </div>
    
        <div class="col-md-12">
            <h4 style="font-weight: bold;padding: 20px 0px 0px 0px">
                <i class="fa fa-minus-circle" @click="${this.handleCollapseAction}" data-id="HomAlt" style="cursor: pointer"></i>
                &nbsp;Alternate Homozygous (1/1) <span class="badge">${this.samplesHomAltSize}</span>
            </h4>
    
            <div id="${this._prefix}HomAlt">
                <div style="padding: 5px 20px">
                    <table class="table table-bordered">
                        <thead>
                        <tr>
                            <th scope="col" rowspan="2">Sample ID</th>
                            <th scope="col" rowspan="2">Individual ID</th>
                            <th scope="col" rowspan="2">Disorders</th>
                            <th scope="col" rowspan="2">Phenotypes</th>
                            <th scope="col" rowspan="2">Variant Data</th>
                            <th scope="col" rowspan="2">File Info</th>
                        </tr>
                        </thead>
                        <tbody id="${this._prefix}HomAltTBody"></tbody>
                    </table>
                </div>
    
                ${!this.showSamplesHomAltTable ? html`
                    <div style="padding: 0px 20px 5px 25px">
                        No samples found
                    </div>
                ` : null }
            </div>
        </div>
    
        <div class="col-md-12">
            <h4 style="font-weight: bold;padding: 20px 0px 0px 0px">
                <i class="fa fa-minus-circle" @click="${this.handleCollapseAction}" data-id="NA" style="cursor: pointer"></i>
                &nbsp;No Variant Call (NA) <span class="badge">${this.samplesNASize}</span>
            </h4>
    
            <div id="${this._prefix}NA">
                <div style="padding: 5px 20px">
                    <table class="table table-bordered">
                        <thead>
                        <tr>
                            <th scope="col" rowspan="2">Sample ID</th>
                            <th scope="col" rowspan="2">Individual ID</th>
                            <th scope="col" rowspan="2">Disorders</th>
                            <th scope="col" rowspan="2">Phenotypes</th>
                            <th scope="col" rowspan="2">Variant Data</th>
                            <th scope="col" rowspan="2">File Info</th>
                        </tr>
                        </thead>
                        <tbody id="${this._prefix}NATBody"></tbody>
                    </table>
                </div>
    
                ${!this.showSamplesNATable ? html`
                    <div style="padding: 0px 20px 5px 25px">
                        No samples found
                    </div>
                ` : null }
            </div>
        </div>
    
        <div class="modal fade" id="${this._prefix}LoadingModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
             role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Fetching samples...</h4>
                    </div>
                    <div class="modal-body">
                        <div class="progress progress-striped active">
                            <div class="progress-bar progress-bar-success" style="width: 100%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `;
    }
}

customElements.define("opencga-variant-samples", OpencgaVariantSamples);
