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
import UtilsNew from "./../../core/utilsNew.js";
import "../commons/variant-modal-ontology.js";
import "../commons/filters/cadd-filter.js";
import "../commons/filters/biotype-filter.js";
import "../commons/filters/region-filter.js";
import "../commons/filters/clinvar-accessions-filter.js";
import "../commons/filters/clinical-annotation-filter.js";
import "../commons/filters/cohort-stats-filter.js";
import "../commons/filters/consequence-type-filter.js";
import "../commons/filters/consequence-type-select-filter.js";
import "../commons/filters/conservation-filter.js";
import "../commons/filters/disease-panel-filter.js";
import "../commons/filters/feature-filter.js";
import "../commons/filters/file-quality-filter.js";
import "../commons/filters/fulltext-search-accessions-filter.js";
import "../commons/filters/go-accessions-filter.js";
import "../commons/filters/hpo-accessions-filter.js";
import "../commons/filters/population-frequency-filter.js";
import "../commons/filters/protein-substitution-score-filter.js";
import "../commons/filters/sample-filter.js";
import "./family-genotype-modal.js";
import "../commons/filters/study-filter.js";
import "../commons/filters/variant-file-filter.js";
import "../commons/filters/variant-caller-info-filter.js";
import "../commons/filters/variant-type-filter.js";
import "../commons/filters/variant-ext-svtype-filter.js";

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
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._initialised = false;

        this.query = {}; // NOTE when no query param (or undefined) is passed to this component, this initialization is replaced with undefined value
        this.preparedQuery = {};

        this.updateClinicalFilterQuery = true;
    }

    connectedCallback() {
        super.connectedCallback();

        // Ctrl+Enter to fire the Search
        // TODO FIXME since it relies on keyup/keydown events it will work on input fields only.
        let isCtrl = false;
        $(this).keyup(function (e) {
            if (e.which === 17) {
                isCtrl = false;
            }
        });
        $(this).keydown(function (e) {
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
        UtilsNew.initTooltip(this);

        this._initialised = true;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    opencgaSessionObserver() {
        if (this.opencgaSession.study) {
            // Render filter menu and add event and tooltips
            if (this._initialised) {
                this.renderFilterMenu();
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

        this.requestUpdate();
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

    /*
     * Handles filterChange events from all the filter components (this is the new updateQueryFilters)
     * @param {String} key the name of the property in this.query
     * @param {String|Object} value the new value of the property
     */
    onFilterChange(key, value) {
        /* Some filters may return more than one parameter, in this case key and value are objects with all the keys and filters
             - key: an object mapping filter name with the one returned
             - value: and object with the filter
            Example: REST accepts filter and qual while filter returns FILTER and QUALITY
             - key: {filter: "FILTER", qual: "QUALITY"}
             - value: {FILTER: "pass", QUALITY: "25"}
         */
        if (key instanceof Object && value instanceof Object) {
            // this.preparedQuery = {...this.preparedQuery, ...value};
            for (const k of Object.keys(key)) {
                const v = value[k];
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
                // deleting `key` from this.preparedQuery
                delete this.preparedQuery[key];
                this.preparedQuery = {...this.preparedQuery};
            }
        }

        this.notifyQuery(this.preparedQuery);
        // TODO Confirm this can be deleted, each filter component must handle the refresh
        // this.requestUpdate();
    }

    // onSampleFilterChange(sampleFields) {
    //     if (!sampleFields.sample) {
    //         delete this.preparedQuery.sample;
    //     }
    //     if (!sampleFields.format) {
    //         delete this.preparedQuery.format;
    //     }
    //     if (!sampleFields.includeSample) {
    //         delete this.preparedQuery.includeSample;
    //     }
    //     this.preparedQuery = {...this.preparedQuery, ...sampleFields};
    //
    //     this.notifyQuery(this.preparedQuery);
    //     this.requestUpdate(); // NOTE: this causes the bug in sample-filter / variant-filter-clinical (clicking the checkboxes on variant-filter-clinical)
    // }

    onVariantCallerInfoFilter(fileId, fileDataFilter, callback) {
        let fileDataArray = [];
        if (this.preparedQuery.fileData) {
            fileDataArray = this.preparedQuery.fileData.split(",");
            const fileDataIndex = fileDataArray.findIndex(e => e.startsWith(fileId));
            if (fileDataIndex >= 0) {
                fileDataArray[fileDataIndex] = fileDataFilter;
            } else {
                fileDataArray.push(fileDataFilter);
            }
        } else {
            fileDataArray.push(fileDataFilter);
        }

        this.preparedQuery = {
            ...this.preparedQuery,
            fileData: fileDataArray.join(",")
        };

        this.notifyQuery(this.preparedQuery);

        if (callback) {
            callback(fileDataFilter);
        }

        this.requestUpdate();
    }

    _isFilterVisible(filter) {
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

    _getFilterField(filterField) {
        if (filterField) {
            if (typeof filterField === "string") {
                return filterField;
            } else {
                if (typeof filterField === "function") {
                    return filterField();
                } else {
                    console.error(`Field '${filterField}' not string or function: ${typeof filterField}`);
                }
            }
        }
        return "";
    }

    renderFilterMenu() {
        if (this.config.sections && this.config.sections.length > 0) {
            return this.config.sections.map(section => this._createSection(section));
        }
    }

    _createSection(section) {
        const id = section.title.replace(/ /g, "");
        const collapsed = section.collapsed ? "" : "in";

        // whole section is hidden if there are no filters to show
        if (section?.fields?.length) {
            return html`
            <div class="panel panel-default filter-section shadow-sm">
                <div class="panel-heading" role="tab" id="${this._prefix}${id}Heading">
                    <h4 class="panel-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion" data-accordion-id="${id}"
                            href="#${this._prefix}${id}" aria-expanded="true" aria-controls="${this._prefix}${id}">
                            ${section.title}
                        </a>
                    </h4>
                </div>
                <div id="${this._prefix}${id}" class="panel-collapse collapse ${collapsed}" role="tabpanel" aria-labelledby="${this._prefix}${id}Heading">
                    <div class="panel-body" style="padding-top: 5px">
                        ${section.fields.map(field => html`${this._isFilterVisible(field) ? this._createSubSection(field) : ""}`)}
                    </div>
                </div>
            </div>
        `;
        }
    }

    _createSubSection(subsection) {
        let content = "";

        // We allow to pass a render function
        if (subsection.render) {
            content = subsection.render(this.onFilterChange, this.preparedQuery, this.opencgaSession);
        } else {
            switch (subsection.id) {
                case "study":
                    if (this.opencgaSession.project.studies.length > 1) {
                        content = html`
                            <study-filter .opencgaSession="${this.opencgaSession}"
                                          @filterChange="${e => this.onFilterChange("study", e.detail.value)}">
                            </study-filter>`;
                    }
                    break;
                case "cohort":
                    // FIXME subsection.cohorts must be renamed to subsection.studies
                    if (subsection.onlyCohortAll === true || subsection.cohorts?.[0].cohorts?.length > 0) {
                        content = html`
                            <cohort-stats-filter .opencgaSession="${this.opencgaSession}"
                                                 .cohorts="${subsection.cohorts}"
                                                 .onlyCohortAll=${subsection.onlyCohortAll}
                                                 .cohortStatsAlt="${this.preparedQuery.cohortStatsAlt}"
                                                 @filterChange="${e => this.onFilterChange("cohortStatsAlt", e.detail.value)}">
                            </cohort-stats-filter>`;
                    } else {
                        content = "No cohort stats available.";
                    }
                    break;
                case "sample":
                    content = html`
                        <family-genotype-modal .opencgaSession="${this.opencgaSession}"
                                       .clinicalAnalysis="${subsection.clinicalAnalysis}"
                                       .genotype="${this.preparedQuery.sample}"
                                       @filterChange="${e => this.onFilterChange({sample: "sample"}, e.detail.value)}">
                        </family-genotype-modal>
                    `;
                    break;
                case "sample-genotype":
                    const sampleConfig = subsection.params?.genotypes ? {genotypes: subsection.params.genotypes} : {};
                    content = html`
                        <sample-genotype-filter
                                .sample="${this.preparedQuery.sample}"
                                .config="${sampleConfig}"
                                @filterChange="${e => this.onFilterChange("sample", e.detail.value)}">
                        </sample-genotype-filter>`;
                    break;
                case "variant-file":
                    let files = [];
                    if (subsection.params?.files) {
                        files = Object.entries(subsection.params.files).map(([key, value]) => value.name);
                    }
                    content = html`
                        <variant-file-filter
                                .files="${files}"
                                .value="${this.preparedQuery.file}"
                                @filterChange="${e => this.onFilterChange("file", e.detail.value)}">
                        </variant-file-filter>`;
                    break;
                case "file-quality":
                    let depth;
                    if (this.preparedQuery?.sampleData) {
                        const sampleDataFilters = this.preparedQuery.sampleData.split(";");
                        depth = sampleDataFilters.find(filter => filter.startsWith("DP")).split(">=")[1];
                    }
                    content = html`<file-quality-filter .filter="${this.preparedQuery.filter}" .depth="${depth}" .qual="${this.preparedQuery.qual}"
                                                        @filterChange="${e => this.onFilterChange({
                                                                filter: "filter",
                                                                sampleData: "sampleData",
                                                                qual: "qual"
                                                            }, e.detail.value)}" .config="${subsection}">
                                    </file-quality-filter>
                            `;
                    break;
                case "region":
                    content = html`<region-filter  .cellbaseClient="${this.cellbaseClient}" .region="${this.preparedQuery.region}"
                                                    @filterChange="${e => this.onFilterChange("region", e.detail.value)}">
                                    </region-filter>`;
                    break;
                case "feature":
                    content = html`
                        <feature-filter  .cellbaseClient="${this.cellbaseClient}"
                                         .query=${this.preparedQuery}
                                         @filterChange="${e => this.onFilterChange("xref", e.detail.value)}">
                        </feature-filter>`;
                    break;
                case "biotype":
                    content = html`
                        <biotype-filter .config="${subsection}"
                                        .biotype=${this.preparedQuery.biotype}
                                        @filterChange="${e => this.onFilterChange("biotype", e.detail.value)}">
                        </biotype-filter>`;
                    break;
                case "type":
                    let config = {};
                    if (subsection.types) {
                        config = {
                            types: subsection.types
                        };
                    }
                    content = html`
                        <variant-type-filter .type="${this.preparedQuery.type}"
                                             .config="${config}"
                                             @filterChange="${e => this.onFilterChange("type", e.detail.value)}">
                        </variant-type-filter>`;
                    break;
                case "populationFrequency":
                    content = html`
                        <population-frequency-filter .populationFrequencies="${subsection.populationFrequencies}"
                                                     .allowedFrequencies="${subsection.allowedFrequencies}"
                                                     ?showSetAll="${subsection.showSetAll}"
                                                     .populationFrequencyAlt="${this.preparedQuery.populationFrequencyAlt}"
                                                     @filterChange="${e => this.onFilterChange("populationFrequencyAlt", e.detail.value)}">
                        </population-frequency-filter>`;
                    break;
                case "consequenceType":
                    content = html`<consequence-type-filter
                            .consequenceTypes="${this.consequenceTypes}"
                            .ct="${this.preparedQuery.ct}"
                            @filterChange="${e => this.onFilterChange("ct", e.detail.value)}">
                    </consequence-type-filter>`;
                    break;
                case "consequenceTypeSelect":
                    content = html`<consequence-type-select-filter
                            .ct="${this.preparedQuery.ct}"
                            .config="${this.consequenceTypes}"
                            @filterChange="${e => this.onFilterChange("ct", e.detail.value)}">
                    </consequence-type-select-filter>`;
                    break;
                case "proteinSubstitutionScore":
                    content = html`<protein-substitution-score-filter
                            .protein_substitution="${this.preparedQuery.protein_substitution}"
                            @filterChange="${e => this.onFilterChange("protein_substitution", e.detail.value)}">
                    </protein-substitution-score-filter>`;
                    break;
                case "cadd":
                    if (this.opencgaSession.project.organism.assembly.toLowerCase() === "grch37") {
                        content = html`<cadd-filter
                                .annot-functional-score="${this.preparedQuery["annot-functional-score"]}"
                                @filterChange="${e => this.onFilterChange("annot-functional-score", e.detail.value)}">
                        </cadd-filter>`;
                    }
                    break;
                case "conservation":
                    content = html`
                        <conservation-filter .conservation="${this.preparedQuery.conservation}"
                                             @filterChange="${e => this.onFilterChange("conservation", e.detail.value)}">
                        </conservation-filter>`;
                    break;
                case "go":
                    content = html`
                        <go-accessions-filter .go="${this.preparedQuery.go}"
                                              @ontologyModalOpen="${this.onOntologyModalOpen}"
                                              @filterChange="${e => this.onFilterChange("go", e.detail.value)}">
                        </go-accessions-filter>`;
                    break;
                case "hpo":
                    content = html`
                        <hpo-accessions-filter .annot-hpo="${this.preparedQuery["annot-hpo"]}"
                                               @ontologyModalOpen="${this.onOntologyModalOpen}"
                                               @filterChange="${e => this.onFilterChange("annot-hpo", e.detail.value)}">
                        </hpo-accessions-filter>`;
                    break;
                case "diseasePanels":
                    content = html`
                        <disease-panel-filter    .opencgaSession="${this.opencgaSession}"
                                                 .diseasePanels="${this.opencgaSession.study.panels}"
                                                 .panel="${this.preparedQuery.panel}"
                                                 .panelModeOfInheritance="${this.preparedQuery.panelModeOfInheritance}"
                                                 .panelConfidence="${this.preparedQuery.panelConfidence}"
                                                 .panelRoleInCancer="${this.preparedQuery.panelRoleInCancer}"
                                                 @filterChange="${e => this.onFilterChange({
                                                     panel: "panel",
                                                     panelModeOfInheritance: "panelModeOfInheritance",
                                                     panelConfidence: "panelConfidence",
                                                     panelRoleInCancer: "panelRoleInCancer"
                                                 }, e.detail)}">
                        </disease-panel-filter>`;
                    break;
                case "clinical-annotation":
                    content = html`
                        <clinical-annotation-filter  .clinical="${this.preparedQuery.clinical}"
                                                     .clinicalSignificance="${this.preparedQuery.clinicalSignificance}"
                                                     .clinicalConfirmedStatus="${this.preparedQuery.clinicalConfirmedStatus}"
                                                     @filterChange="${e => this.onFilterChange({
                                                         clinical: "clinical",
                                                         clinicalSignificance: "clinicalSignificance",
                                                         clinicalConfirmedStatus: "clinicalConfirmedStatus"
                                                     }, e.detail)}">
                        </clinical-annotation-filter>`;
                    break;
                case "clinvar": // Deprecated: use clinical instead
                    content = html`
                        <clinvar-accessions-filter  .clinvar="${this.preparedQuery.clinvar}"
                                                    .clinicalSignificance="${this.preparedQuery.clinicalSignificance}"
                                                    @filterChange="${e => this.onFilterChange({
                                                                    clinvar: "xref",
                                                                    clinicalSignificance: "clinicalSignificance"
                                                                }, e.detail.value)}">
                        </clinvar-accessions-filter>`;
                    break;
                case "fullTextSearch":
                    content = html`
                        <fulltext-search-accessions-filter .traits="${this.preparedQuery.traits}"
                                                           @filterChange="${e => this.onFilterChange("traits", e.detail.value)}">
                        </fulltext-search-accessions-filter>`;
                    break;
                case "ext-svtype":
                    content = html`
                        <variant-ext-svtype-filter @filterChange="${e => this.onVariantCallerInfoFilter(subsection.params.fileId, e.detail.value)}">
                        </variant-ext-svtype-filter>`;
                    break;
                case "caveman":
                case "strelka":
                case "pindel":
                case "ascat":
                case "canvas":
                case "brass":
                case "manta":
                case "tnhaplotyper2":
                case "pisces":
                case "craft":
                    content = html`
                        <variant-caller-info-filter .caller="${subsection.id}"
                                                    .fileId="${subsection.params.fileId}"
                                                    .fileData="${this.preparedQuery.fileData}"
                                                    @filterChange="${
                                                            e => this.onVariantCallerInfoFilter(subsection.params.fileId, e.detail.value, subsection.callback)
                                                    }">
                        </variant-caller-info-filter>`;
                    break;
                default:
                    console.error("Filter component not found");
            }
        }

        // In some rare cases the filter might empty, for instance study-filter is empty if ONLY on study exist in that study.
        // We need to avoid rendering empty filters.
        if (content !== "") {
            return html`
                <div class="form-group">
                    <div id="${this._prefix}${subsection.id}" class="browser-subsection" data-cy="${subsection.id}">
                        ${subsection.title ?
                            html`<span>${this._getFilterField(subsection.title)}</span>` :
                            null
                        }
                        <div class="tooltip-div pull-right">
                            <a tooltip-title="Info" tooltip-text="${subsection.tooltip}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                        </div>
                    </div>
                    <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                        ${subsection.description ?
                            html`<div>${this._getFilterField(subsection.description)}</div>` :
                            null
                        }
                        ${content}
                     </div>
                </div>
             `;
        }
    }

    render() {
        return html`
            <div>
                ${this.config.searchButton ?
                    html`
                        <div class="search-button-wrapper">
                            <button type="button" class="btn btn-primary ripple" @click="${this.onSearch}">
                                <i class="fa fa-search" aria-hidden="true"></i> ${this.config.searchButtonText || "Search"}
                            </button>
                        </div>` :
                    null
                }
                <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">
                    <div id="FilterMenu">
                        ${this.renderFilterMenu()}
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-variant-filter", OpencgaVariantFilter);
