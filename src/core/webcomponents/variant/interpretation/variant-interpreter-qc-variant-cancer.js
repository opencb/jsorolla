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
import UtilsNew from "../../../utilsNew.js";
import Circos from "./test/circos.js";
import "./variant-interpreter-qc-cancer-plots.js";
import "../opencga-variant-filter.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/view/signature-view.js";
import "../../loading-spinner.js";

export default class VariantInterpreterQcVariantCancer extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            sampleId: {
                type: String
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "sf-" + UtilsNew.randomString(6);

        // this.base64 = "data:image/png;base64, " + Circos.base64;
        this.save = {};
        this.settings = {
            density: "MEDIUM",
            format: "SVG"
        };
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("query") || changedProperties.has("sampleId")) {
            this.queryObserver();
        }
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
        }
        this.requestUpdate();
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        // this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn};
        // this.requestUpdate();
    }

    onFilterIdChange(e) {
        this.filterId = e.currentTarget.value;
    }

    onFilterDescriptionChange(e) {
        this.filterDescription = e.currentTarget.value;
    }

    onSettingsFieldChange(e) {
        e.detail;
        debugger
        switch (e.detail.param) {
            case "density":
                this.settings.id = e.detail.value;
                break;
            case "format":
                this.settings.format = e.detail.value;
                break;
        }
    }

    onSaveFieldChange(e) {
        switch (e.detail.param) {
            case "id":
                this.save.id = e.detail.value;
                break;
            case "description":
                this.save.description = e.detail.value;
                break;
        }
    }

    onClear(e) {
    }

    onSettingsOk(e) {
    }

    onSave(e) {
        this.save.sampleId = this.clinicalAnalysis.proband.samples[0].id;
        this.save.query = this.executedQuery ? this.executedQuery : {};
        console.log(e.detail);
        debugger
        this.opencgaSession.opencgaClient.clinical().updateQualityControl(this.clinicalAnalysis.id, {
            study: this.opencgaSession.study.fqn,
            ...this.query
        }).then( restResult => {
            debugger
            this.signature = restResult.getResult(0).signature;
        }).catch( restResponse => {
            this.signature = {
                errorState: "Error from Server " + restResponse.getEvents("ERROR").map(error => error.message).join(" \n ")
            };
        }).finally( () => {
            this.requestUpdate();
        })
    }

    getSettingsConfig() {
        return {
            title: "Settings",
            icon: "fas fa-cog",
            type: "form",
            display: {
                classes: "col-md-10 col-md-offset-1",
                // style: "padding: 5px 25px",
                mode: {
                    type: "modal",
                    title: "Display Settings",
                    // buttonClass: "btn-default"
                },
                buttons: {
                    show: true,
                    cancelText: "Cancel",
                    okText: "OK",
                },
                // showTitle: true,
                labelWidth: 4,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    title: "Circos",
                    display: {
                    },
                    elements: [
                        {
                            name: "Rain Plot Density",
                            field: "density",
                            type: "select",
                            allowedValues: ["LOW", "MEDIUM", "HIGH"],
                            defaultValue: "LOW",
                            display: {
                            }
                        },
                        {
                            name: "Image format",
                            field: "format",
                            type: "select",
                            allowedValues: ["PNG", "SVG"],
                            defaultValue: ["PNG"],
                            display: {
                            }
                        },
                    ]
                }
            ]
        }
    }

    getSaveConfig() {
        return {
            title: "Save",
            icon: "fas fa-save",
            type: "form",
            display: {
                classes: "col-md-10 col-md-offset-1",
                mode: {
                    type: "modal",
                    title: "Save",
                    // buttonClass: "btn-default btn-lg"
                },
                buttons: {
                    show: true,
                    cancelText: "Cancel",
                    okText: "Save",
                },
                // showTitle: true,
                labelWidth: 3,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    display: {
                    },
                    elements: [
                        {
                            name: "Filter ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a filter ID",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Add a filter description",
                                rows: 2
                            }
                        },
                    ]
                }
            ]
        }
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "fas fa-search",
            filter: {
                title: "Filter",
                searchButtonText: "Run",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types"
                    },
                    complexFields: ["genotype"],
                    hiddenFields: []
                },
                sections: [     // sections and subsections, structure and order is respected
                    {
                        title: "Sample",
                        collapsed: false,
                        fields: [
                            {
                                id: "file-quality",
                                title: "Quality Filter"
                            },
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        fields: [
                            {
                                id: "region",
                                title: "Genomic Location",
                                tooltip: tooltips.region
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, SNPs, ...)",
                                tooltip: tooltips.feature
                            },
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: biotypes,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                biotypes: types,
                                tooltip: tooltips.type
                            },
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        fields: [
                            {
                                id: "consequenceTypeSelect",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: "Example Missense PASS",
                        active: false,
                        query: {
                            filter: "PASS",
                            ct: "lof,missense_variant"
                        }
                    },
                ],
                result: {
                    grid: {}
                },
                detail: {
                }
            }
        }
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-3 left-menu">
                    <opencga-variant-filter .opencgaSession=${this.opencgaSession}
                                            .query="${this.query}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .populationFrequencies="${this.populationFrequencies}"
                                            .consequenceTypes="${this.consequenceTypes}"
                                            .cohorts="${this.cohorts}"
                                            .searchButton="${true}"
                                            .config="${this._config.filter}"
                                            @queryChange="${this.onVariantFilterChange}"
                                            @querySearch="${this.onVariantFilterSearch}">
                    </opencga-variant-filter>
                </div>

                <div class="col-md-9">
                    <div class="row">
                        <div class="col-md-12">
                            <opencga-active-filters filterBioformat="VARIANT"
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .defaultStudy="${this.opencgaSession.study.fqn}"
                                                    .query="${this.preparedQuery}"
                                                    .refresh="${this.executedQuery}"
                                                    .alias="${this.activeFilterAlias}"
                                                    .filters="${this._config.filter.examples}"
                                                    .config="${this._config.filter.activeFilters}"
                                                    @activeFilterChange="${this.onActiveFilterChange}"
                                                    @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>
                        </div>
                       
                        <div class="col-md-12">
                            <div style="padding: 5px 25px;float: left">
                                <data-form  .data=${this.settings} .config="${this.getSettingsConfig()}" 
                                            @fieldChange="${e => this.onSettingsFieldChange(e)}" @submit="${this.onSettingsOk}">
                                </data-form>
                                <data-form  .data=${this.save} .config="${this.getSaveConfig()}" 
                                            @fieldChange="${e => this.onSaveFieldChange(e)}" @submit="${this.onSave}">
                                </data-form>
                            </div>
                        </div>
                       
                        <div class="col-md-12"> 
                            <variant-interpreter-qc-cancer-plots    .opencgaSession="${this.opencgaSession}"
                                                                    .query="${this.executedQuery}"
                                                                     .sampleId="${this.sampleId}"
                                                                    .active="${this.active}">
                            </variant-interpreter-qc-cancer-plots>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-cancer", VariantInterpreterQcVariantCancer);
