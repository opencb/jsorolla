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
import UtilsNew from "./../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "../commons/variant-modal-ontology.js";
import "../commons/filters/cadd-filter.js";
import "../commons/filters/biotype-filter.js";
import "../commons/filters/region-filter.js";
import "../commons/filters/clinvar-accessions-filter.js";
import "../commons/filters/cohort-stats-filter.js";
import "../commons/filters/consequence-type-filter.js";
import "../commons/filters/consequence-type-select-filter.js";
import "../commons/filters/conservation-filter.js";
import "../commons/filters/disease-filter.js";
import "../commons/filters/feature-filter.js";
import "../commons/filters/file-quality-filter.js";
import "../commons/filters/fulltext-search-accessions-filter.js";
import "../commons/filters/go-accessions-filter.js";
import "../commons/filters/hpo-accessions-filter.js";
import "../commons/filters/population-frequency-filter.js";
import "../commons/filters/protein-substitution-score-filter.js";
import "../commons/filters/sample-filter.js";
import "../commons/filters/study-filter.js";
import "../commons/filters/variant-type-filter.js";
import "../commons/filters/caveman-caller-filter.js";
import "../commons/filters/strelka-caller-filter.js";
import "../commons/filters/pindel-caller-filter.js";
import "../commons/filters/ascat-caller-filter.js";
import "../commons/filters/canvas-caller-filter.js";
import "../commons/filters/brass-caller-filter.js";
import "../commons/filters/manta-caller-filter.js";


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
            searchButton: {
                type: Boolean
            },
            consequenceTypes: {
                type: Object
            },
            config: {
                type: Object
            }
            // samples: {
            //     type: Array
            // }
        };
    }


    _init() {
        this._prefix = `ovf${UtilsNew.randomString(6)}_`;

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

    firstUpdated() {
        // Render filter menu and add event and tooltips
        // this now returns html
        // this._renderFilterMenu();

        //this._addAllTooltips();
        UtilsNew.initTooltip(this);

        this._initialised = true;

        //this.opencgaSessionObserver();
        // this.queryObserver();
        // this.setQueryFilters();
        // this.clinicalObserver();

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        // if (changedProperties.has("samples")) {
        // this.samplesObserver();
        // }
    }

    opencgaSessionObserver() {
        if (this.opencgaSession.study) {
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
        /*if (this._reset) {
            // console.trace(this.query)
            this.setQueryFilters();
        } else {
            this._reset = true;
        }*/

        this.requestUpdate();
    }

    clinicalObserver(clinicalAnalysis) {
        //debugger
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


    /** *
     * Handles filterChange events from all the filter components (this is the new updateQueryFilters)
     * @param key the name of the property in this.query
     * @param value the new value of the property
     */
    onFilterChange(key, value) {
        /* Some filters may return more than parameter, in this case key and value are objects with all the keys and filters
             - key: an object mapping filter name with the one returned
             - value: and object with the filter
            Example: REST accepts filter and qual while filter returns FILTER and QUALITY
             - key: {filter: "FILTER", qual: "QUALITY"}
             - value: {FILTER: "pass", QUALITY: "25"}
         */
        if (key instanceof Object && value instanceof Object) {
            // this.preparedQuery = {...this.preparedQuery, ...value};
            for (let k of Object.keys(key)) {
                let v = value[k];
                if (v && v !== "") {
                    this.preparedQuery = {...this.preparedQuery, ...{[k]: v}};
                } else {
                    delete this.preparedQuery[k];
                    this.preparedQuery = {...this.preparedQuery};
                }
            }
        } else {
            if (value && value !== "") {
                this.preparedQuery = {...this.preparedQuery, ...{[key]: value}};
            } else {
                // console.log("deleting", key, "from preparedQuery");
                delete this.preparedQuery[key];
                this.preparedQuery = {...this.preparedQuery};
            }
        }

        this.notifyQuery(this.preparedQuery);
        this.requestUpdate();
    }

    onSampleFilterChange(sampleFields) {
        if (!sampleFields.sample) {
            delete this.preparedQuery.sample;
        }
        if (!sampleFields.format) {
            delete this.preparedQuery.format;
        }
        if (!sampleFields.includeSample) {
            delete this.preparedQuery.includeSample;
        }
        this.preparedQuery = {...this.preparedQuery, ...sampleFields};
        this.notifyQuery(this.preparedQuery);
        this.requestUpdate(); // NOTE: this causes the bug in sample-filter / variant-filter-clinical (clicking the checkboxes on variant-filter-clinical)

    }


    /**
     * @deprecated
     */
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
    }
    /**
     * @deprecated
     */
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

        $("#" + this._prefix + "vcfFilterSelect").selectpicker("val", []);
    }

    isFilterVisible(filter) {
        // FIXME  Maybe we should keep this:   && this.config?.skipSubsections?.length && !!~this.config.skipSubsections.indexOf(field.id)
        let visible = true;
        if (typeof filter.visible !== "undefined" && filter.visible !== null) {
            if (typeof filter.visible === "boolean") {
                visible = filter.visible;
            } else {
                if (typeof filter.visible === "function") {
                    visible = filter.visible();
                } else {
                    console.error(`Field 'visible' not boolean or function: ${typeof filter.visible}`);
                }
            }
        }
        return visible;
    }

    _renderFilterMenu() {
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
                                ${section.fields && section.fields.length && section.fields.map(field => html`
                                    ${this.isFilterVisible(field)
                                        ? this._createSubSection(field)
                                        : null
                                    }
                                `)}
                            </div>
                       </div>
                   </div>
                `;
    }

    _createSubSection(subsection) {
        // ConsequenceType needs horizontal scroll
        const ctScroll = (subsection.id === "consequenceType") ? "browser-ct-scroll" : "";

        // We allow to pass the
        let content = "";
        if (subsection.render) {
            content = subsection.render(this.onFilterChange, this.preparedQuery, this.opencgaSession);
        } else {
            switch (subsection.id) {
                case "study":
                    if (this.opencgaSession.project.studies.length > 1) {
                        content = html`<study-filter .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("study", e.detail.value)}"></study-filter>`;
                    }
                    break;
                case "cohort":   //._cohorts="${this._cohorts}"
                    content = html`<cohort-stats-filter .opencgaSession="${this.opencgaSession}" 
                                    .cohorts="${subsection.cohorts}" .onlyCohortAll=${subsection.onlyCohortAll} .cohortStatsAlt="${this.preparedQuery.cohortStatsAlt}" 
                                    @filterChange="${e => this.onFilterChange("cohortStatsAlt", e.detail.value)}">
                               </cohort-stats-filter>`;
                    break;
                case "sample":
                    content = html`<sample-filter .opencgaSession="${this.opencgaSession}" .clinicalAnalysis="${this.clinicalAnalysis}" .query="${this.preparedQuery}" @sampleFilterChange="${e => this.onSampleFilterChange(e.detail.value)}"></sample-filter>`;
                    break;
                case "file-quality":
                    // content = html`<file-qual-filter .qual="${this.preparedQuery.qual}" @filterChange="${e => this.onFilterChange("qual", e.detail.value)}"></file-qual-filter>`;
                    let depth;
                    if (this.preparedQuery?.sampleData) {
                        let sampleDataFilters = this.preparedQuery.sampleData.split(";");
                        depth = sampleDataFilters.find(filter => filter.startsWith("DP")).split(">=")[1];
                    }
                    content = html`<file-quality-filter .filter="${this.preparedQuery.filter}" .depth="${depth}" .qual="${this.preparedQuery.qual}" 
                                    @filterChange="${e => this.onFilterChange({filter: "filter", sampleData: "sampleData", qual: "qual"}, e.detail.value)}" .config="${subsection}" >
                               </file-quality-filter>
                            `;
                    break;
                case "region":
                    content = html`<region-filter .cellbaseClient="${this.cellbaseClient}" .region="${this.preparedQuery.region}" 
                                           @filterChange="${e => this.onFilterChange("region", e.detail.value)}"></region-filter>`;
                    break;
                case "feature":
                    content = html`<feature-filter .cellbaseClient="${this.cellbaseClient}" .query=${this.preparedQuery}
                                            @filterChange="${e => this.onFilterChange("xref", e.detail.value)}"></feature-filter>`;
                    break;
                case "diseasePanels":
                    content = html`<disease-filter .opencgaSession="${this.opencgaSession}" .config="${this.config}" 
                                    .diseasePanels="${this.opencgaSession.study.panels}" .panel="${this.preparedQuery.panel}" 
                                @filterChange="${e => this.onFilterChange("panel", e.detail.value)}"></disease-filter>`;
                    break;
                case "biotype":
                    content = html`<biotype-filter .config="${this.config}" .biotype=${this.preparedQuery.biotype} @filterChange="${e => this.onFilterChange("biotype", e.detail.value)}"></biotype-filter>`;
                    break;
                case "type":
                    content = html`<variant-type-filter .config="${this.config}" .type="${this.preparedQuery.type}" .cellbaseClient="${this.cellbaseClient}" @filterChange="${e => this.onFilterChange("type", e.detail.value)}"></variant-type-filter>`;
                    break;
                case "populationFrequency":
                    content = html`<population-frequency-filter .populationFrequencies="${populationFrequencies}" ?showSetAll="${subsection.showSetAll}" .populationFrequencyAlt="${this.preparedQuery.populationFrequencyAlt}" @filterChange="${e => this.onFilterChange("populationFrequencyAlt", e.detail.value)}"></population-frequency-filter>`;
                    break;
                case "consequenceType":
                    content = html`<consequence-type-filter .consequenceTypes="${this.consequenceTypes}" .ct="${this.preparedQuery.ct}"  @filterChange="${e => this.onFilterChange("ct", e.detail.value)}"></consequence-type-filter>`;
                    break;
                case "consequenceTypeSelect":
                    content = html`<consequence-type-select-filter .ct="${this.preparedQuery.ct}" .config="${this.consequenceTypes}" @filterChange="${e => this.onFilterChange("ct", e.detail.value)}"></consequence-type-select-filter>`;
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
                    content = html`<go-accessions-filter .go="${this.preparedQuery.go}" @ontologyModalOpen="${this.onOntologyModalOpen}" @filterChange="${e => this.onFilterChange("go", e.detail.value)}"></go-accessions-filter>`;
                    break;
                case "hpo":
                    content = html`<hpo-accessions-filter .annot-hpo="${this.preparedQuery["annot-hpo"]}" @ontologyModalOpen="${this.onOntologyModalOpen}" @filterChange="${e => this.onFilterChange("annot-hpo", e.detail.value)}"></hpo-accessions-filter>`;
                    break;
                case "clinvar":
                    content = html`<clinvar-accessions-filter .clinvar="${this.preparedQuery.clinvar}" .clinicalSignificance="${this.preparedQuery.clinicalSignificance}" @filterChange="${e => this.onFilterChange({clinvar: "clinvar", clinicalSignificance: "clinicalSignificance"}, e.detail.value)}"></clinvar-accessions-filter>`;
                    break;
                case "fullTextSearch":
                    content = html`<fulltext-search-accessions-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("traits", e.detail.value)}"></fulltext-search-accessions-filter>`;
                    break;
                // case "caveman-caller":
                //     content = html`<caveman-caller-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("caveman", e.detail.value)}"></caveman-caller-filter>`;
                //     break;
                // case "strelka-caller":
                //     content = html`<strelka-caller-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("strelka", e.detail.value)}"></strelka-caller-filter>`;
                //     break;
                // case "pindel-caller":
                //     content = html`<pindel-caller-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("pindel", e.detail.value)}"></pindel-caller-filter>`;
                //     break;
                // case "ascat-caller":
                //     content = html`<ascat-caller-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("ascat", e.detail.value)}"></ascat-caller-filter>`;
                //     break;
                // case "canvas-caller":
                //     content = html`<canvas-caller-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("traits", e.detail.value)}"></canvas-caller-filter>`;
                //     break;
                // case "brass-caller":
                //     content = html`<brass-caller-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("traits", e.detail.value)}"></brass-caller-filter>`;
                //     break;
                // case "manta-caller":
                //     content = html`<manta-caller-filter .traits="${this.preparedQuery.traits}" @filterChange="${e => this.onFilterChange("traits", e.detail.value)}"></manta-caller-filter>`;
                //     break;
                default:
                    console.error("Filter component not found");
            }
        }

        // In some rare cases the filter might empty, for instance study-filter is empty if ONLY on study exist in that study.
        // We need to avoid rendering empty filters.
        if (content !== "") {
            return html`
                <div class="form-group">
                    <div class="browser-subsection" id="${subsection.id}">${subsection.title}
                        <div class="tooltip-div pull-right">
                            <a tooltip-title="${subsection.title}" tooltip-text="${subsection.tooltip}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                        </div>
                    </div>
                    <div id="${this._prefix}${subsection.id}" class="subsection-content ${ctScroll}">
                        ${content}
                     </div>
                </div>
             `;
        }
    }

    render() {
        return html`
            <div>
                ${this.searchButton ? html`
                <div class="search-button-wrapper">
                    <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                        <i class="fa fa-search" aria-hidden="true"></i> ${this.config.searchButtonText || "Search"}
                    </button>
                </div>
                ` : null}
    
                <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">
                    <div id="FilterMenu">
                    ${this._renderFilterMenu()}
                    </div>
                </div>
            </div>
            `;
    }

}

customElements.define("opencga-variant-filter", OpencgaVariantFilter);
