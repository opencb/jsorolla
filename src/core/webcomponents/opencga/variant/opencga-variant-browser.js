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
import "./opencga-variant-cohort-stats.js";
import "./opencga-variant-samples.js";
import "./opencga-variant-facet-query.js";
import "./variant-beacon-network.js";
import "./variant-genome-browser.js";
import "./../opencga-active-filters.js";
import "../opencga-genome-browser.js";
import "../../reactome/reactome-variant-network.js";
import "../../cellbase/variation/cellbase-variantannotation-view.js";
import "./opencga-variant-filter.js";
import "./opencga-variant-grid.js";
import "./opencga-variant-detail-template.js";

export default class OpencgaVariantBrowser extends LitElement {

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
            reactomeClient: {
                type: Object
            },
            query: {
                type: Object
            },
            samples: {
                type: Array
            },
            cellbaseClient: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            config: {
                type: Object
            },
            //FIXME temp solution
            preparedQuery: {
                type: Object
            }
            // executedQuery: {
            //     type: Object
            // },
            /* TODO recheck if can be removed
            detailActiveTabs: {
                type: Array
            },
            checkProjects: {
                type: Boolean
            }
             */
        }
    }

    // static get observers() {
    //     /*
    //      * We do not need to Observer 'query' property, when passed it will be shared (bound) with the other components.
    //      * 'search; is observed to ensure 'query' is in sync.
    //      */
    //     return [
    //         "propertyObserver(opencgaSession)"
    //     ];
    // }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    _init() {
        this._prefix = "ovb-" + Utils.randomString(6) + "_";

        this.checkProjects = false;
        this._collapsed = false;
        this.genotypeColor = {
            "0/0": "#6698FF",
            "0/1": "#FFA500",
            "1/1": "#FF0000",
            "./.": "#000000",
            "0|0": "#6698FF",
            "0|1": "#FFA500",
            "1|0": "#FFA500",
            "1|1": "#FF0000",
            ".|.": "#000000",
        };
        this.variant = "No variant selected";

        this._sessionInitialised = false;
        this._config = this.getDefaultConfig();
        this.detailActiveTabs = [];

        // this.query = {};
        //run the observer the first time
        //this.opencgaSessionObserver();
        //this.queryObserver();

        // this.requestUpdate();
    }

    opencgaSessionObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};

        // Check if Beacon hosts are configured
        for (let detail of this._config.detail) {
            if (detail.id === "beacon" && UtilsNew.isNotEmptyArray(detail.hosts)) {
                this.beaconConfig = {
                    hosts: detail.hosts
                };
            }
        }

        // Update cohorts from config, this updates the Cohort filter MAF
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            for (let section of this._config.filter.menu.sections) {
                for (let subsection of section.subsections) {
                    if (subsection.id === "cohort") {
                        this.cohorts = subsection.cohorts;
                    }
                }
            }

            if (this._sessionInitialised) {
                // We reset the query object when the session is changed
                this.query = {
                    study: this.opencgaSession.study.fqn
                };
            } else {
                this.query = {...this.query};
            }


            this.checkProjects = true;
        } else {
            this.checkProjects = false;
        }

        this._sessionInitialised = true;
    }

    // TODO NOTE changing an active Filter, queryObserver is used to update executedQuery and consequently the table in variant-grid.
    // Maybe the whole query process can be simplified, onActiveFilterChange and onActiveFilterClear can edit executedQuery directly
    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        let _query = {};
        if (UtilsNew.isEmpty(this.query) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
            _query = {
                study: this.opencgaSession.study.fqn
            };
        }
        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.preparedQuery = Object.assign({}, _query, this.query);
            this.executedQuery = Object.assign({}, _query, this.query);
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.dispatchEvent(new CustomEvent("queryChange", {detail: this.preparedQuery}));
        this.requestUpdate();
    }

    onCollapse() {
        if (this._collapsed) {
            $("#" + this._prefix + "FilterMenu").show(400);
            $("#" + this._prefix + "MainWindow").removeClass("browser-center").addClass("col-md-10");
        } else {
            $("#" + this._prefix + "FilterMenu").hide(400);
            $("#" + this._prefix + "MainWindow").removeClass("col-md-10").addClass("browser-center");
        }
        this._collapsed = !this._collapsed;
    }

    /*
     * Variant Filter component listeners
     */
    onQueryFilterChange(e) {
        console.log("onQueryFilterChange on variant browser", e.detail.query);
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onQueryFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }

    /*
     * Active Filters component listeners
     */
    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on variant browser", e.detail)
        //TODO FIXME!! study prop have to be wiped off! use studies instead
        this.preparedQuery = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        this.requestUpdate();
    }

    //it was called onClear
    onActiveFilterClear() {
        console.log("onActiveFilterClear")
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias};
        this.preparedQuery = {...this.query}; //TODO quick fix to update
    }

    onSampleChange(e) {
        this.samples = e.detail.samples;
        this.dispatchEvent(new CustomEvent("samplechange", {detail: {samples: this.samples}, bubbles: true, composed: true}));
    }

    _changeBottomTab(e) {
        let _activeTabs = {};
        for (let detail of this.config.detail) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.detailActiveTabs = _activeTabs;
        this.requestUpdate();
    }

    onGenomeBrowserPositionChange(e) {
        $(".variant-browser-content").hide(); // hides all content divs

        // Show genome browser div
        PolymerUtils.getElementById(this._prefix + "GenomeBrowser").style.display = "block";

        // Show the active button
        $(".variant-browser-view-buttons").removeClass("active");
        PolymerUtils.addClass(this._prefix + "GenomeBrowserButton", "active");

        this._genomeBrowserActive = true;
        this.region = e.detail.genomeBrowserPosition;
    }

    checkVariant(variant) {
        return variant.split(":").length > 2;
    }

    onSelectVariant(e) {
        this.variant = e.detail.id;

        let genes = [];
        for (let i = 0; i < e.detail.variant.annotation.consequenceTypes.length; i++) {
            let gene = e.detail.variant.annotation.consequenceTypes[i].geneName;
            if (UtilsNew.isNotEmpty(gene) && genes.indexOf(gene) === -1) {
                genes.push(gene);
            }
        }
        this.genes = genes;
    }

    selectedGene(e) {
        this.dispatchEvent(new CustomEvent("propagate", {gene: e.detail.gene}));
    }

    fetchFacets() {
        let queryParams = {
            sid: this.opencgaSession.opencgaClient._config.sessionId,
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
            facet: "type;genes;soAcc;studies",
            timeout: 60000,
            ...this.query
        };

        if (typeof queryParams.sid === "undefined" || queryParams.sid === "") {
            delete queryParams["sid"];
        }

        let _this = this;

        // Shows loading modal
        $("#" + this._prefix + "LoadingModal").modal("show");

        setTimeout(_ => {
            this.opencgaSession.opencgaClient.variants().facet(queryParams, {})
                .then(function (queryResponse) {
                    _this.facetResults = queryResponse.response[0].result[0].result.fields;
                    for (let result of _this.facetResults) {
                        let categories = [];
                        let data = [];

                        for (let countObj of result.counts) {
                            categories.push(countObj.value);
                            data.push(countObj.count);
                        }

                        $("#" + _this._prefix + result.name).highcharts({
                            credits: {enabled: false},
                            chart: {
                                type: "column"
                            },
                            title: {
                                text: result.name
                            },
                            xAxis: {
                                categories: categories
                            },
                            yAxis: {
                                min: 0,
                                title: {
                                    text: "Total number of Variants"
                                }
                            },
                            tooltip: {
                                headerFormat: "<span style=\"font-size:10px\">{point.key}</span><table>",
                                pointFormat: "<tr><td style=\"color:{series.color};padding:0\">{series.name}: </td>" +
                                    "<td style=\"padding:0\"><b>{point.y:.1f} </b></td></tr>",
                                footerFormat: "</table>",
                                shared: true,
                                useHTML: true
                            },
                            plotOptions: {
                                column: {
                                    pointPadding: 0.2,
                                    borderWidth: 0
                                }
                            },
                            series: [{
                                name: result.name,
                                data: data
                            }]
                        });
                    }

                    // Remove loading modal
                    $("#" + _this._prefix + "LoadingModal").modal("hide");
                })
                .catch(function (e) {
                    // Remove loading modal
                    $("#" + _this._prefix + "LoadingModal").modal("hide");
                });
        }, 250);
    }

    // This observer is needed when pie charts are rendered instead of table. This is where the data needed for high charts is prepared
    variantStudiesChanged() {
        this.$.variantStudies.render();
        if (this.variantStudies.length > 0) {
            for (let i = 0; i < this.variantStudies.length; i++) {
                let statsArray = this.variantStudies[i].stats;
                for (let j = 0; j < statsArray.length; j++) {
                    let genotypeCount = statsArray[j].value.genotypesCount;
                    let data = [];
                    //TODO functional refactor in map
                    if (Object.keys(genotypeCount).length > 0) {
                        for (let k in genotypeCount) {
                            data.push({
                                name: k,
                                y: genotypeCount[k],
                                color: this.genotypeColor[k]
                            });
                        }
                        let params = {title: statsArray[j].name, data: data};
                        this._updatePieChart("#" + statsArray[j].study + statsArray[j].name, params);
                    }
                }
            }
        }
    }

    getStudy(study) {
        if (study !== undefined) {
            let fields = study.split(":");
            return fields[fields.length - 1];
        }
        return "";
    }

    checkForGenotypes(stat) {
        let genotypesCount = stat.value.genotypesCount;
        return Object.keys(genotypesCount).length > 0;
    }

    checkForSampleData(samplesData) {
        return samplesData.length > 0;
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        $(".variant-browser-content").hide(); // hides all content divs
        if (typeof e.target !== "undefined" && typeof e.target.dataset.view !== "undefined") {
            // $("#" + this._prefix + e.target.dataset.view).show(); // get the href and use it find which div to show
            PolymerUtils.show(this._prefix + e.target.dataset.view);
        }

        // Show the active button
        $(".variant-browser-view-buttons").removeClass("active");
        $(e.target).addClass("active");


         if (e.target.dataset.view === "Summary") {
             //TODO temp fix
             this.SummaryActive = true;
             this.requestUpdate();
         } else {
             this.SummaryActive = false;
         }

        if (e.target.dataset.view === "GenomeBrowser") {
//                    window.location.hash = "genomebrowser";
            this._genomeBrowserActive = true;
        } else {
            this._genomeBrowserActive = false;
        }
    }

    // This is the old Pie Chart implementation, not used right now
    _updatePieChart(_id, params) {
        // params = { title, data}
        $(_id).highcharts({
            credits: {enabled: false},
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: "pie",
                width: 220
            },
            title: {
                text: params.title
            },
            tooltip: {
                pointFormat: "{series.name}: <b>{point.percentage:.2f}%</b>"
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    minSize: 75,
                    dataLabels: {
                        padding: 4,
                        connectorPadding: 4,
                        enabled: true,
                        format: "{point.name}: {point.percentage:.2f}%",
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || "black"
                        }
                    }
                }
            },
            series: [{
                name: "Genotype Count",
                data: params.data
            }]
        });
    }

    getDefaultConfig() {
        return {
            activeFilters: {
                alias: {
                    // Example:
                    // "region": "Region",
                    // "gene": "Gene",
                    // "genotype": "Sample Genotypes",
                },
                complexFields: ["genotype"],
                hiddenFields: ["study"]
            },
            showGenomeBrowser: false,
            genomeBrowser: {
                showTitle: false
            }
        }
    }

    render() {
        return html`
        <style include="jso-styles">
            .browser-center {
                margin: auto;
                text-align: justify;
                width: 95%;
            }

            .browser-variant-tab-title {
                font-size: 115%;
                font-weight: bold;
            }

            th {
                text-align: center
            }

            .icon-padding {
                padding-left: 4px;
                padding-right: 5px;
            }
        </style>
        
        ${this.checkProjects ? html`
<div class="panel" style="margin-bottom: 15px">
    <h3 style="margin: 10px 10px 10px 15px">
                            <span @click="${this.onCollapse}" style="cursor: pointer;margin: 0px 30px 0px 0px">
                                <i class="fa fa-bars" aria-hidden="true"></i>
                            </span>
        <i class="fa fa-search" aria-hidden="true"></i> ${this.config.title}
    </h3>
</div>

<div class="row">
    <div id="${this._prefix}FilterMenu" class="col-md-2">
        <opencga-variant-filter .opencgaSession="${this.opencgaSession}"
                                .query="${this.query}"
                                .cohorts="${this.cohorts}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .populationFrequencies="${this.populationFrequencies}"
                                .consequenceTypes="${this.consequenceTypes}"
                                .config="${this._config.filter}"
                                @queryChange="${this.onQueryFilterChange}"
                                @querySearch="${this.onQueryFilterSearch}"
                                @samplechange="${this.onSampleChange}">
        </opencga-variant-filter>
    </div>

    
    <div id="${this._prefix}MainWindow" class="col-md-10">
       
        <opencga-active-filters .opencgaClient="${this.opencgaSession.opencgaClient}"
                                .defaultStudy="${this.opencgaSession.study.alias}"
                                .query="${this.preparedQuery}"
                                .refresh="${this.executedQuery}"
                                .filters="${this._config.filter.examples}"
                                .alias="${this._config.activeFilterAlias}"
                                .config="${this._config.activeFilters}"
                                filterBioformat="VARIANT"
                                @activeFilterChange="${this.onActiveFilterChange}"
                                @activeFilterClear="${this.onActiveFilterClear}">
        </opencga-active-filters>
        
        <div class="col-md-12" style="padding: 5px 0px 5px 0px">
            <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                <div id="${this._prefix}LeftToolbar" style="padding-bottom: 0px">
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-success variant-browser-view-buttons active ripple"
                                data-view="TableResult" @click="${this._changeView}">
                            <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult"
                               @click="${this._changeView}"></i> Table Result
                        </button>
                        <button type="button" class="btn btn-success variant-browser-view-buttons ripple" data-view="Summary"
                                @click="${this._changeView}">
                            <i class="fas fa-chart-bar icon-padding" aria-hidden="true" data-view="Summary"
                               @click="${this._changeView}"></i> Summary Stats
                        </button>
                        <!--<template is="dom-if" if="{{config.showGenomeBrowser}}">-->
                        <!--<button id="{{prefix}}GenomeBrowserButton" type="button" class="btn btn-success variant-browser-view-buttons" data-view="GenomeBrowser" on-click="_changeView">-->
                        <!--<i class="fa fa-list-alt icon-padding" aria-hidden="true" data-view="GenomeBrowser" on-click="_changeView"></i> Genome Browser (Beta)-->
                        <!--</button>-->
                        <!--</template>-->
                    </div>
                </div>
            </div>
        </div>

        <div>
            <!-- First TAB -->
            <div id="${this._prefix}TableResult" class="variant-browser-content">
                <!-- Variant Browser Grid -->

                <opencga-variant-grid .opencgaSession="${this.opencgaSession}"
                                      .query="${this.executedQuery}"
                                      .cohorts="${this.cohorts}"
                                      .cellbaseClient="${this.cellbaseClient}"
                                      .populationFrequencies="${this.populationFrequencies}"
                                      .active="${this.active}" 
                                      .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                      .consequenceTypes="${this.consequenceTypes}"
                                      .config="${this.config}"
                                      @selected="${this.selectedGene}"
                                      @selectvariant="${this.onSelectVariant}"
                                      @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                </opencga-variant-grid>


                <!-- Bottom tabs with specific variant information -->
                ${!this.checkVariant(this.variant) ? html`
                            <div style="padding-top: 20px">
                                <h3>Variant: ${this.variant}</h3>
                                <div style="padding-top: 20px">
                                    <!-- Dynamically create the Detail Tabs from Browser config -->
                                    <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                                        ${this.config.detail.length && this.config.detail.map(item => html`
                                            ${item.active ? html`
                                                 <li role="presentation" class="active">
                                                    <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab"
                                                       data-id="${item.id}"
                                                       class="browser-variant-tab-title"
                                                       @click="${this._changeBottomTab}">${item.title}</a>
                                                </li>
                                            ` : html`
                                            <li role="presentation" class="">
                                                    <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab"
                                                       data-id="${item.id}"
                                                       class="browser-variant-tab-title"
                                                       @click="${this._changeBottomTab}">${item.title}</a>
                                                </li>
                                            `}
                                        `)}
                                    </ul>
            
                                    <div class="tab-content" style="height: 680px">
                                        <!-- Annotation Tab -->
                                        <div id="${this._prefix}annotation" role="tabpanel" class="tab-pane active">
                                            <div style="width: 90%;padding-top: 8px">
                                                <cellbase-variantannotation-view .data="${this.variant}"
                                                                                 .assembly=${this.opencgaSession.project.organism.assembly}
                                                                                 _prefix="${this._prefix}"
                                                                                 .cellbaseClient="${this.cellbaseClient}"
                                                                                 mode="vertical"
                                                                                 .hashFragmentCredentials="${this.hashFragmentCredentials}"
                                                                                 .consequenceTypes="${this.consequenceTypes}"
                                                                                 .proteinSubstitutionScores="${this.proteinSubstitutionScores}">
                                                </cellbase-variantannotation-view>
                                            </div>
                                        </div>
            
                                        <!-- Cohort Stats Tab -->
                                        <div id="${this._prefix}cohortStats" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-cohort-stats .opencgaSession="${this.opencgaSession}"
                                                                              variant="${this.variant}"
                                                                              .active="${this.detailActiveTabs.cohortStats}"
                                                                              .config="${this.config.filter.menu}">
                                                </opencga-variant-cohort-stats>
                                            </div>
                                        </div>
            
                                        <!-- Samples Tab -->
                                        <div id="${this._prefix}samples" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-samples .opencgaSession="${this.opencgaSession}"
                                                                         variant="${this.variant}"
                                                                         .active="${this.detailActiveTabs.samples}">
                                                </opencga-variant-samples>
                                            </div>
                                        </div>
            
                                        <!-- Beacon Network Tab-->
                                        <div id="${this._prefix}beacon" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <variant-beacon-network variant="${this.variant}" clear="${this.variant}"
                                                                        .config="${this.beaconConfig}"></variant-beacon-network>
                                            </div>
                                        </div>
            
                                        <!-- Reactome network tab -->
                                        <div id="${this._prefix}network" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <reactome-variant-network .opencgaSession="${this.opencgaSession}"
                                                                          .reactomeClient="${this.reactomeClient}" .genes="${this.genes}"
                                                                          ?active="${this.detailActiveTabs.network}"></reactome-variant-network>
                                            </div>
                                        </div>
            
                                        <!-- Example Template Tab-->
                                        <div id="${this._prefix}template" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-detail-template .opencgaSession="${this.opencgaSession}"
                                                                                 .variant="${this.variant}"
                                                                                 .active="${this.detailActiveTabs.template}"></opencga-variant-detail-template>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ` : null}

            </div>

            <!-- Second TAB -->
            <div id="${this._prefix}Summary" class="variant-browser-content" style="display: none; padding: 0px 15px">
                <opencga-variant-facet-query .opencgaSession="${this.opencgaSession}"
                                             .cellbaseClient="${this.cellbaseClient}"
                                             .populationFrequencies="${this.populationFrequencies}"
                                             .query="${this.executedQuery}"
                                             .active="${this.SummaryActive}">
                </opencga-variant-facet-query>
            </div>

            <!-- Third TAB -->
            <div id="${this._prefix}GenomeBrowser" class="variant-browser-content" style="display: none">
                <br>
                <br>
                <opencga-genome-browser .opencgaSession="${this.opencgaSession}"
                                        .opencgaClient="${this.opencgaSession.opencgaClient}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .query=${this.preparedQuery}
                                        .search=${this.executedQuery}
                                        .species=${this.config.species}
                                        .region="${this.region}"
                                        .active="${this._genomeBrowserActive}"
                                        .fullScreen="${this.fullScreen}"
                                        .config="${this._config.genomeBrowser}">
                </opencga-genome-browser>
            </div>
        </div>

        <div class="modal fade" id="${this._prefix}LoadingModal" data-backdrop="static" data-keyboard="false"
             tabindex="-1"
             role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Loading...</h3>
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
</div>
        ` : html`
                <h3 class="text-center">No public projects available to browse. Please login to continue</h3>
        `}
`;
    }


}

customElements.define("opencga-variant-browser", OpencgaVariantBrowser);
