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
import Utils from "./../../utils.js";
import UtilsNew from "./../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "../commons/variant-modal-ontology.js";
import "../commons/filters/cadd-filter.js";
import "../commons/filters/biotype-filter.js";
import "../commons/filters/region-filter.js";
import "../commons/filters/clinvar-accessions-filter.js";
import "../commons/filters/cohort-filter.js";
import "../commons/filters/consequence-type-filter.js";
import "../commons/filters/conservation-filter.js";
import "../commons/filters/disease-filter.js";
import "../commons/filters/feature-filter.js";
import "../commons/filters/file-filter.js";
import "../commons/filters/file-pass-filter.js";
import "../commons/filters/file-qual-filter.js";
import "../commons/filters/fulltext-search-accessions-filter.js";
import "../commons/filters/go-accessions-filter.js";
import "../commons/filters/hpo-accessions-filter.js";
import "../commons/filters/population-frequency-filter.js";
import "../commons/filters/protein-substitution-score-filter.js";
import "../commons/filters/sample-filter.js";
import "../commons/filters/study-filter.js";
import "../commons/filters/variant-type-filter.js";


// TODO complete lit-html refactor
export default class OpencgaVariantFilter extends LitElement {

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
            query: {
                type: Object
            },
            // TODO variant-browser doesn't send this prop..
            clinicalAnalysis: {
                type: Object
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
            config: {
                type: Object
            },
            searchButton: {
                type: Boolean
            }
            // samples: {
            //     type: Array
            // }
        };
    }


    _init() {
        this._prefix = `ovf${Utils.randomString(6)}_`;

        this._initialised = false;
        // this._reset = true;

        this.query = {}; // NOTE when no query param (or undefined) is passed to this component, this initialization is replaced with undefined value
        this.preparedQuery = {};

        this.modalHpoActive = false;
        this.modalGoActive = false;

        // this.samples = [];
        this.updateClinicalFilterQuery = true;
        this.searchButton = true;
    }

    connectedCallback() {
        super.connectedCallback();

        // Ctrl+Enter to fire the Search
        // TODO FIXME since it relies on keyup/keydown events it will work on input fields only.
        let isCtrl = false;
        $(this).keyup(function(e) {
            if (e.which === 17) {
                isCtrl = false;
            }
        });
        $(this).keydown(function(e) {
            if (e.which === 17) {
                isCtrl = true;
            }
            if (e.which === 13 && isCtrl) {
                this.onSearch();
            }
        });

        this.preparedQuery = {...this.query}; // propagates here the iva-app query object
    }

    // it was connectedCallback() in polymer 2
    firstUpdated() {
        // Render filter menu and add event and tooltips
        // this now returns html
        // this._renderFilterMenu();

        this._addAllTooltips();

        this._initialised = true;

        this.opencgaSessionObserver();
        // this.queryObserver();
        // this.setQueryFilters();
        // this.clinicalObserver();

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalObserver();
        }
        // if (changedProperties.has("samples")) {
        // this.samplesObserver();
        // }
    }

    opencgaSessionObserver() {

        // TODO do not move in connectedCallback (it handle the switch between default studies)
        if (this.opencgaSession.study) {
            // Update the study list of studies and the selected one

            // TODO should it be moved in cohort-filter?
            // Update cohorts from config, this updates the Cohort filter ALT
            if (typeof this.config !== "undefined" && typeof this.config.sections !== "undefined") {
                this._cohorts = [];
                for (const section of this.config.sections) {
                    for (const subsection of section.fields) {
                        if (subsection.id === "cohort") {
                            const projectId = this.opencgaSession.project.id;
                            if (UtilsNew.isNotUndefinedOrNull(subsection.cohorts[projectId])) {
                                for (const study of Object.keys(subsection.cohorts[projectId])) {
                                    // Array.prototype.push.apply(this._cohorts, subsection.cohorts[projectId][study]);
                                    this._cohorts = subsection.cohorts[projectId];
                                }
                            }
                        }
                    }
                }
            }

            // this.query = {
            //     study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias
            // };
            // this.notifySearch(this.query);

            // Render filter menu and add event and tooltips
            if (this._initialised) {
                this._renderFilterMenu();
            }
        }
    }

    queryObserver() {
        // the following line FIX the "silent" persistence of active filters once 1 is deleted, due to an inconsistence between query and preparedQuery. Step to reproduce:
        // 0. comment the line `this.preparedQuery = this.query;`
        // 1. add some filters from variant=filter
        // 2. delete 1 filter from active-filter
        // 3. add another filter from variant-filter
        // 4. you will see again the deleted filter in active-filters
        this.preparedQuery = this.query || {}; // TODO quick fix in case the component gets an undefined value as prop

        if (this.updateClinicalFilterQuery) {
            this.clinicalFilterQuery = this.query;
        } else {
            this.skipClinicalFilterQueryUpdate = true;
        }
        if (this._reset) {
            // console.trace(this.query)
            this.setQueryFilters();
        } else {
            this._reset = true;
        }
        this.requestUpdate();
    }

    clinicalObserver(clinicalAnalysis) {
        if (UtilsNew.isNotUndefinedOrNull(clinicalAnalysis)) {
            // this.clinicalAnalysis = Object.assign({}, clinicalAnalysis);
        }
    }

    onSearch() {
        this.notifySearch(this.preparedQuery);
    }

    // TODO rename to filterChange
    notifyQuery(query) {
        this.dispatchEvent(new CustomEvent("queryChange", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
    }

    // binding::from this.query to the view
    // most of those blocks have been refactored and moved in firstUpdated() in each filter component
    setQueryFilters() {
        if (!this._initialised) {
            return;
        }

        // Clear filter menu before rendering
        this._clearHtmlDom();
        // Check 'query' is not null or empty there is nothing else to do
        if (UtilsNew.isUndefinedOrNull(this.preparedQuery) || Object.keys(this.preparedQuery).length === 0) {
            console.warn("this.preparedQuery is NULL:", this.preparedQuery);
            return;
        }

        // Render Clinical filters: sample and file
        // this.renderClinicalQuerySummary();


        /* MOVED in feature-filter
        // Panel - annot-panel
        // TODO Genes must be displayed in Xref textarea
        if (typeof this.query["gene"] !== "undefined") {
            // PolymerUtils.setValue(this._prefix + "PanelAppsTextarea", this.query.gene);
            let geneTextarea = PolymerUtils.getElementById(this._prefix + "FeatureTextarea");
            if (UtilsNew.isNotUndefinedOrNull(geneTextarea)) {
                geneTextarea.value = this.query.gene;
            }
        }
         */
    }

    /** *
     * Handles filterChange events from all the filter components (this is the new updateQueryFilters)
     * @param key {string} the name of the property in this.query
     * @param value {string} the new value of the property
     */
    onFilterChange(key, value) {
        console.log("filterChange", {[key]: value});
        if (value && value !== "") {
            this.preparedQuery = {...this.preparedQuery, ...{[key]: value}};
        } else {
            console.log("deleting", key, "from preparedQuery");
            delete this.preparedQuery[key];
            this.preparedQuery = {...this.preparedQuery};
        }
        this.notifyQuery(this.preparedQuery);
        // this.requestUpdate(); //TODO recheck if this is necessary. it seems it cause a bug in the select in study-filter (on the first click on the option the option is not selected)
    }

    onSampleFilterChange(sampleFields) {
        console.log("onSampleFilterChange in variant-filter", sampleFields);
        // TODO refactor with proper optional spreading

        if (!sampleFields.genotype) {
            delete this.preparedQuery.genotype;
        }
        if (!sampleFields.sample) {
            delete this.preparedQuery.sample;
        }
        if (!sampleFields.format) {
            delete this.preparedQuery.format;
        }
        this.preparedQuery = {...this.preparedQuery, ...sampleFields};
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate();

    }

    // binding::from the view to this.query
    // most of those blocks have been refactored & moved in filterChange() in each filter component
    updateQueryFilters() {

        if (!this._initialised) {
            return;
        }

        console.log("this.query", this.query);

        const _filters = {};

        if (UtilsNew.isNotUndefinedOrNull(this.query.genotype)) {
            _filters.genotype = this.query.genotype;
        }
        if (UtilsNew.isNotUndefinedOrNull(this.query.format)) {
            _filters.format = this.query.format;
        }
        // if (UtilsNew.isNotUndefinedOrNull(this.query.file)) {
        //     _filters.file = this.query.file;
        // }
        // if (UtilsNew.isNotUndefinedOrNull(this.query.qual)) {
        //     _filters.qual = this.query.qual;
        // }
        if (UtilsNew.isNotUndefinedOrNull(this.query.info)) {
            _filters.info = this.query.info;
        }

    }


    // TODO recheck if there is no other way...
    _clearHtmlDom() {
        // Empty everything before rendering
        $("." + this._prefix + "FilterSelect").prop("selectedIndex", 0);
        $("." + this._prefix + "FilterSelect").prop("disabled", false);

        // handled in population-frequency-filter
        // TODO many other components use this!
        $("." + this._prefix + "FilterTextInput").val("");
        $("." + this._prefix + "FilterTextInput").prop("disabled", false);

        $("." + this._prefix + "FilterCheckBox").prop("checked", false);
        $("." + this._prefix + "FilterRadio").prop("checked", false);
        $("." + this._prefix + "FilterRadio").filter("[value=\"or\"]").prop("checked", true);
        $("." + this._prefix + "FilterRadio").prop("disabled", true);

        $("#" + this._prefix + "DiseasePanelsTextarea").val("");
        if (PolymerUtils.getElementById(this._prefix + "FileQualInput") !== null) {
            PolymerUtils.getElementById(this._prefix + "FileQualInput").disabled = true;
        }

        // Deselect bootstrap-select dropdowns

        // handled in updated() in disease-filter
        // $("#" + this._prefix + "DiseasePanels").selectpicker("val", []);
        // handled in updated() in biotype-filter
        // $("#" + this._prefix + "GeneBiotypes").selectpicker("val", []);

        $("#" + this._prefix + "vcfFilterSelect").selectpicker("val", []);
    }


    // This method is only executed one time from connectedCallback function
    // TODO recheck if it really needs to be executed in opencgaSessionObserver()
    _renderFilterMenu() {
        // Add events and tooltips to the filter menu
        // TODO move tooltips init somewhere after template has been rendered
        // this._addEventListeners();
        return this.config.sections && this.config.sections.length && this.config.sections.map(section => this._createSection(section));
    }

    _createSection(section) {
        const id = section.title.replace(/ /g, "");
        const collapsed = section.collapsed ? "" : "in";

        return html`
                    <div class="panel panel-default filter-section shadow-sm">
                        <div class="panel-heading" role="tab" id="${this._prefix}${id}Heading">
                            <h4 class="panel-title">
                                <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                                    href="#${this._prefix}${id}" aria-expanded="true" aria-controls="${this._prefix}${id}">
                                    ${section.title}
                                </a>
                            </h4>
                        </div>
                        <div id="${this._prefix}${id}" class="panel-collapse collapse ${collapsed}" role="tabpanel" aria-labelledby="${this._prefix}${id}Heading">
                            <div class="panel-body">
                                <!--TODO verify if cadd condition works-->
                                
                                ${section.fields && section.fields.length && section.fields.map(subsection => html`
                                    ${this.config.skipSubsections && this.config.skipSubsections.length && !!~this.config.skipSubsections.indexOf(subsection.id) ? null : this._createSubSection(subsection)}
                                `)}
                            
                             </div>
                        </div>
                    </div>
                `;

    }

    _createSubSection(subsection) {
        // ConsequenceType needs horizontal scroll
        const ctScroll = (subsection.id === "consequenceType") ? "browser-ct-scroll" : "";


        let content = "";
        switch (subsection.id) {
            case "study":
                /*if (this.opencgaSession.project.studies.length < 2) {
                    return "";
                }*/
                content = html`<study-filter .opencgaSession="${this.opencgaSession}" .study="${this.preparedQuery.study}" @filterChange="${e => this.onFilterChange("study", e.detail.value)}">BLABLA</study-filter>`;
                break;
            case "cohort":
                content = html`<cohort-filter .opencgaSession="${this.opencgaSession}" .cohorts="${subsection.cohorts}" ._cohorts="${this._cohorts}" .cohortStatsAlt="${this.preparedQuery.cohortStatsAlt}" @filterChange="${e => this.onFilterChange("cohortStatsAlt", e.detail.value)}"> </cohort-filter>`;
                break;
            case "sample":
                content = html`<sample-filter ?enabled="${subsection.showSelectSamples}" .opencgaSession="${this.opencgaSession}" .clinicalAnalysis="${this.clinicalAnalysis}" .query="${this.query}" @sampleFilterChange="${e => this.onSampleFilterChange(e.detail.value)}"></sample-filter>`;
                break;
            case "file":
            /** @deprecated */
                content = html`<file-filter .query="${this.query}" @filterChange="${e => this.onFilterChange("filter", e.detail.value)}"></file-filter>`;
                break;
            case "file-pass":
                content = html`<file-pass-filter .filter="${this.preparedQuery.filter}" @filterChange="${e => this.onFilterChange("filter", e.detail.value)}"></file-pass-filter>`;
                break;
            case "file-qual":
                content = html`<file-qual-filter .qual="${this.preparedQuery.qual}" @filterChange="${e => this.onFilterChange("qual", e.detail.value)}"></file-qual-filter>`;
                break;
            case "location":
                content = html`<region-filter .cellbaseClient="${this.cellbaseClient}" .region="${this.preparedQuery.region}" 
                                           @filterChange="${e => this.onFilterChange("region", e.detail.value)}"></region-filter>`;
                break;
            case "feature":
                content = html`<feature-filter .cellbaseClient="${this.cellbaseClient}" .query=${this.query}
                                            @filterChange="${e => this.onFilterChange("xref", e.detail.value)}"></feature-filter>`;
                break;
            case "diseasePanels":
                content = html`<disease-filter .opencgaSession="${this.opencgaSession}" .config="${this.config}" .panel="${this.preparedQuery.panel}" 
                                @filterChange="${e => this.onFilterChange("panel", e.detail.value)}"></disease-filter>`;
                break;
            case "biotype":
                content = html`<biotype-filter .config="${this.config}" .biotype=${this.preparedQuery.biotype} @filterChange="${e => this.onFilterChange("biotype", e.detail.value)}"></biotype-filter>`;
                break;
            case "type":
                content = html`<variant-type-filter .config="${this.config}" .type="${this.preparedQuery.type}" .cellbaseClient="${this.cellbaseClient}" @filterChange="${e => this.onFilterChange("type", e.detail.value)}"></variant-type-filter>`;
                break;
            case "populationFrequency":
                content = html`<population-frequency-filter .populationFrequencies="${this.populationFrequencies}" ?showSetAll="${subsection.showSetAll}" .populationFrequencyAlt="${this.preparedQuery.populationFrequencyAlt}" @filterChange="${e => this.onFilterChange("populationFrequencyAlt", e.detail.value)}"></population-frequency-filter>`;
                break;
            case "consequenceType":
                content = html`<consequence-type-filter .consequenceTypes="${this.consequenceTypes}" .ct="${this.preparedQuery.ct}"  @filterChange="${e => this.onFilterChange("ct", e.detail.value)}"></consequence-type-filter>`;
                break;
            case "proteinSubstitutionScore":
                content = html`<protein-substitution-score-filter .protein_substitution="${this.preparedQuery.protein_substitution}" @filterChange="${e => this.onFilterChange("protein_substitution", e.detail.value)}"></protein-substitution-score-filter>`;
                break;
            case "cadd":
                if (this.opencgaSession.project.organism.assembly.toLowerCase() === "grch38") {
                    return "";
                }
                content = html`<cadd-filter .annot-functional-score="${this.preparedQuery["annot-functional-score"]}" @filterChange="${e => this.onFilterChange("annot-functional-score", e.detail.value)}"></cadd-filter>`;
                break;
            case "conservation":
                content = html`<conservation-filter .conservation="${this.preparedQuery.conservation}" @filterChange="${e => this.onFilterChange("conservation", e.detail.value)}"></conservation-filter>`;
                break;
            case "go":
                content = html`<go-accessions-filter .go="${this.go}" @ontologyModalOpen="${this.onOntologyModalOpen}" @filterChange="${e => this.onFilterChange("go", e.detail.value)}"></go-accessions-filter>`;
                break;
            case "hpo":
                content = html`<hpo-accessions-filter .annot-hpo="${this.preparedQuery["annot-hpo"]}" @ontologyModalOpen="${this.onOntologyModalOpen}" @filterChange="${e => this.onFilterChange("annot-hpo", e.detail.value)}"></hpo-accessions-filter>`;
                break;
            case "clinvar":
                content = html`<clinvar-accessions-filter .clinvar="${this.preparedQuery.clinvar}" @filterChange="${e => this.onFilterChange("clinvar", e.detail.value)}"></clinvar-accessions-filter>`;
                break;
            case "fullTextSearch":
                content = html`<fulltext-search-accessions-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("traits", e.detail.value)}"></fulltext-search-accessions-filter>`;
                break;
            default:
                console.error("Filter component not found");
        }

        return html`
                    <div class="form-group">
                        <div class="browser-subsection" id="${subsection.id}">${subsection.title}
                            <div class="tooltip-div pull-right">
                                <a><i class="fa fa-info-circle" aria-hidden="true" id="${this._prefix}${subsection.id}Tooltip"></i></a>
                            </div>
                        </div>
                        <div id="${this._prefix}${subsection.id}" class="subsection-content ${ctScroll}">
                            ${content}
                         </div>
                    </div>
                `;
    }

    _addAllTooltips() {
        for (const section of this.config.sections) {
            for (const subsection of section.fields) {
                if (UtilsNew.isNotEmpty(subsection.tooltip)) {
                    const tooltipIcon = $("#" + this._prefix + subsection.id + "Tooltip");
                    if (UtilsNew.isNotUndefinedOrNull(tooltipIcon)) {
                        this._addTooltip(tooltipIcon, subsection.title, subsection.tooltip);
                    }
                }
            }
        }
    }

    _addTooltip(div, title, content) {
        div.qtip({
            content: {
                title: title,
                text: content
            },
            position: {
                target: "mouse",
                adjust: {
                    x: 2, y: 2,
                    mouse: false
                }
            },
            style: {
                width: true
                // classes: this.config.tooltip.classes
            },
            show: {
                delay: 200
            },
            hide: {
                fixed: true,
                delay: 300
            }
        });
    }

    render() {
        return html`
            <style include="jso-styles">
            .browser-ct-scroll {
                /*max-height: 450px;*/
                /*overflow-y: scroll;*/
                overflow-x: scroll;
            }

            .browser-ct-tree-view,
            .browser-ct-tree-view * {
                padding: 0;
                margin: 0;
                list-style: none;
            }

            .browser-ct-tree-view li ul {
                margin: 0 0 0 22px;
            }

            .browser-ct-tree-view * {
                vertical-align: middle;
            }

            .browser-ct-tree-view {
                /*font-size: 14px;*/
            }

            .browser-ct-tree-view input[type="checkbox"] {
                cursor: pointer;
            }

            .browser-ct-item {
                white-space: nowrap;
                display: inline
            }

            div.block {
                overflow: hidden;
            }

            div.block label {
                width: 80px;
                display: block;
                float: left;
                text-align: left;
                font-weight: normal;
            }
        </style>
        <div>
            ${this.searchButton ? html`
            <div class="search-button-wrapper">
                <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                    <i class="fa fa-search" aria-hidden="true"></i> ${this.config.searchButtonText}
                </button>
            </div>
            ` : null}

            <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true" style="padding-top: 20px">
                <div id="FilterMenu">
                ${this._renderFilterMenu()}
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-variant-filter", OpencgaVariantFilter);
