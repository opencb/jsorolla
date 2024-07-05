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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/filters/cadd-filter.js";
import "../commons/filters/biotype-filter.js";
import "../commons/filters/variant-filter.js";
import "../commons/filters/region-filter.js";
import "../commons/filters/clinvar-accessions-filter.js";
import "../commons/filters/clinical-annotation-filter.js";
import "../commons/filters/cohort-stats-filter.js";
import "../commons/filters/consequence-type-filter.js";
import "../commons/filters/consequence-type-select-filter.js";
import "../commons/filters/role-in-cancer-filter.js";
import "../commons/filters/conservation-filter.js";
import "../commons/filters/disease-panel-filter.js";
import "../commons/filters/feature-filter.js";
import "../commons/filters/variant-file-format-filter.js";
import "../commons/filters/fulltext-search-accessions-filter.js";
import "../commons/filters/go-accessions-filter.js";
import "../commons/filters/hpo-accessions-filter.js";
import "../commons/filters/population-frequency-filter.js";
import "../commons/filters/protein-substitution-score-filter.js";
import "../commons/filters/sample-genotype-filter.js";
import "../commons/filters/individual-hpo-filter.js";
import "./family-genotype-modal.js";
import "../commons/filters/study-filter.js";
import "../commons/filters/variant-file-filter.js";
import "../commons/filters/variant-file-info-filter.js";
import "../commons/filters/variant-type-filter.js";
import "../commons/filters/variant-ext-svtype-filter.js";
import "../commons/filters/variant-caller-info-filter.js";

export default class VariantBrowserFilter extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        // this._initialised = false;

        // When no query param (or undefined) is passed to this component, this initialization is replaced with undefined value
        this.query = {};
        this.preparedQuery = {};
    }

    connectedCallback() {
        super.connectedCallback();

        // Add event to allow Ctrl+Enter to fire the Search
        let isCtrl = false;
        document.addEventListener("keyup", e => {
            if (e.key?.toUpperCase() === "CONTROL") {
                isCtrl = false;
            }
        });

        document.addEventListener("keydown", e => {
            if (e.key?.toUpperCase() === "CONTROL") {
                isCtrl = true;
            }

            if (e.key?.toUpperCase() === "ENTER" && isCtrl) {
                e.preventDefault();
                e.stopImmediatePropagation();

                this.onSearch();
            }
        });

        this.preparedQuery = {...this.query}; // propagates here the iva-app query object
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession.study) {
            // Render filter menu and add event and tooltips
            // if (this._initialised) {
            //     this.renderFilterMenu();
            // }
            this.renderFilterMenu();
        }
    }

    queryObserver() {
        // The following line FIX the "silent" persistence of active filters once 1 is deleted, due to an inconsistency
        // between query and preparedQuery. Step to reproduce:
        // 0. comment the line `this.preparedQuery = this.query;`
        // 1. add some filters from variant=filter
        // 2. delete 1 filter from active-filter
        // 3. add another filter from variant-filter
        // 4. you will see again the deleted filter in active-filters
        this.preparedQuery = this.query || {};
        this.requestUpdate();
    }

    onSearch() {
        this.notifySearch(this.preparedQuery);
    }

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
        this.requestUpdate();
    }

    // DEPRECATED
    // FIXME: is it deprecated?
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

    _isFilterVisible(subsection) {
        let visible = true;
        if (typeof subsection?.visible !== "undefined" && subsection?.visible !== null) {
            if (typeof subsection.visible === "boolean") {
                visible = subsection.visible;
            } else {
                if (typeof subsection.visible === "function") {
                    visible = subsection.visible(this); // injecting context
                } else {
                    console.error(`Field 'visible' not boolean or function: ${typeof subsection.visible}`);
                }
            }
        }
        return visible;
    }

    _isFilterDisabled(subsection) {
        let disabled = false;
        if (typeof subsection?.disabled !== "undefined" && subsection?.disabled !== null) {
            if (typeof subsection?.disabled === "boolean") {
                disabled = subsection.disabled;
            } else if (typeof subsection?.disabled === "function") {
                disabled = subsection.disabled();
            } else {
                console.error(`Field 'disabled' not a function or boolean: ${typeof subsection.disabled}`);
            }
        }
        return disabled;
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
        if (this.config?.sections?.length > 0) {
            return this.config.sections
                .filter(section => section.filters?.length > 0 && !section.filters.includes(undefined))
                .map(section => this._createSection(section));
        } else {
            return html`No filter has been configured.`;
        }
    }

    _createMessage(subsection) {
        let message = null;
        if (subsection?.message?.text) {
            if (this._isFilterVisible(subsection.message)) {
                const type = (subsection.message.type || "warning").toLowerCase();
                message = html`
                    <div class="alert alert-${type}" role="alert">
                        ${subsection.message.text}
                    </div>
                `;
            }
        }
        return message;
    }

    _createSection(section) {
        // TODO replicate in all filters components
        const filters = section.filters.filter(filter => this._isFilterVisible(filter)) ?? [];
        const htmlFields = filters.map(filter => this._createSubSection(filter));

        // TODO should we add a config variable to decide if the accordion is shown
        // We only display section accordions when more than a section exists,
        // otherwise we just render all filters without an accordion box.
        return this.config.sections.length > 0 ? html`
            <section-filter
                .filters="${htmlFields}"
                .config="${section}">
            </section-filter>` : htmlFields;
    }

    _createSubSection(subsection) {
        if (!subsection?.id) {
            console.error("Filter definition error", subsection);
            return;
        }

        let content = "";
        const disabled = this._isFilterDisabled(subsection);

        // We allow to pass a render function
        if (subsection.render) {
            content = subsection.render(this.onFilterChange, this.preparedQuery, this.opencgaSession);
        } else {
            switch (subsection.id) {
                case "study":
                    content = html`
                        <study-filter
                            .value="${this.preparedQuery.study}"
                            .opencgaSession="${this.opencgaSession}"
                            @filterChange="${e => this.onFilterChange("study", e.detail.value)}">
                        </study-filter>`;
                    break;
                case "sample":
                    const multiStudySelected = this.preparedQuery?.study?.split(",")?.length > 1;
                    content = html`
                        ${multiStudySelected ? html`
                            <div class="alert alert-warning" role="alert">You cannot select samples with more than one study</div>
                        ` : nothing}
                        <catalog-search-autocomplete title=${multiStudySelected ? "You cannot select samples with more than one study" : null}
                            .value="${this.preparedQuery.sample}"
                            .opencgaSession="${this.opencgaSession}"
                            .resource="${"SAMPLE"}"
                            .config="${{multiple: true, maxItems: 3, disabled: multiStudySelected}}"
                            @filterChange="${e => this.onFilterChange("sample", e.detail.value)}">
                        </catalog-search-autocomplete>`;
                    break;
                case "cohort":
                    // FIXME subsection.cohorts must be renamed to subsection.studies
                    if (subsection.onlyCohortAll === true || subsection.studies?.[0].cohorts?.length > 0) {
                        content = html`
                            <cohort-stats-filter
                                .opencgaSession="${this.opencgaSession}"
                                .cohorts="${subsection.studies}"
                                .onlyCohortAll=${subsection.onlyCohortAll}
                                .cohortStatsAlt="${this.preparedQuery.cohortStatsAlt}"
                                @filterChange="${e => this.onFilterChange("cohortStatsAlt", e.detail.value)}">
                            </cohort-stats-filter>`;
                    } else {
                        content = "No cohort stats available.";
                    }
                    break;
                case "family-genotype":
                    content = html`
                        <family-genotype-modal
                            .opencgaSession="${this.opencgaSession}"
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
                case "individual-hpo":
                    content = html`
                        <individual-hpo-filter
                            .individual="${subsection.params?.individual}"
                            .value="${this.preparedQuery?.["annot-hpo"]}"
                            .disabled="${disabled}"
                            @filterChange="${e => this.onFilterChange("annot-hpo", e.detail.value)}">
                        </individual-hpo-filter>`;
                    break;
                case "variant-file":
                    content = html`
                        <variant-file-filter
                            .files="${subsection.params?.files}"
                            .value="${this.preparedQuery.file}"
                            @filterChange="${e => this.onFilterChange("file", e.detail.value)}">
                        </variant-file-filter>`;
                    break;
                case "file-quality":
                case "variant-file-sample-filter":
                    content = html`
                        <variant-file-format-filter
                            .sampleData="${this.preparedQuery.sampleData}"
                            .opencgaSession="${this.opencgaSession}"
                            @filterChange="${e => this.onFilterChange("sampleData", e.detail.value)}">
                        </variant-file-format-filter>
                    `;
                    break;
                case "variant-file-info-filter":
                    content = html`
                        <variant-file-info-filter
                            .files="${subsection.params.files}"
                            .visibleCallers="${subsection.params.visibleCallers}"
                            .study="${subsection.params.study || this.opencgaSession.study}"
                            .fileData="${this.preparedQuery.fileData}"
                            .opencgaSession="${subsection.params.opencgaSession || this.opencgaSession}"
                            @filterChange="${e => this.onFilterChange("fileData", e.detail.value)}">
                        </variant-file-info-filter>`;
                    break;
                case "variant":
                    content = html`
                        <variant-filter
                            .id="${this.preparedQuery.id}"
                            @filterChange="${e => this.onFilterChange("id", e.detail.value)}">
                        </variant-filter>`;
                    break;
                case "region":
                    content = html`
                        <region-filter
                            .cellbaseClient="${this.cellbaseClient}"
                            .region="${this.preparedQuery.region}"
                            @filterChange="${e => this.onFilterChange("region", e.detail.value)}">
                        </region-filter>`;
                    break;
                case "feature":
                    content = html`
                        <feature-filter
                            .cellbaseClient="${this.cellbaseClient}"
                            .query=${this.preparedQuery}
                            @filterChange="${e => this.onFilterChange("xref", e.detail.value)}">
                        </feature-filter>`;
                    break;
                case "biotype":
                    content = html`
                        <biotype-filter
                            .config="${subsection}"
                            .biotype=${this.preparedQuery.biotype}
                            @filterChange="${e => this.onFilterChange("biotype", e.detail.value)}">
                        </biotype-filter>`;
                    break;
                case "type":
                    content = html`
                        <variant-type-filter
                            .type="${this.preparedQuery.type}"
                            .config="${subsection.params?.types ? {types: subsection.params.types} : {}}"
                            .disabled="${disabled}"
                            @filterChange="${e => this.onFilterChange("type", e.detail.value)}">
                        </variant-type-filter>`;
                    break;
                case "populationFrequency":
                    content = html`
                        <population-frequency-filter
                            .populationFrequencies="${subsection.params.populationFrequencies}"
                            .allowedFrequencies="${subsection.params.allowedFrequencies}"
                            .populationFrequencyIndexConfiguration="${subsection.params.populationFrequencyIndexConfiguration}"
                            ?showSetAll="${subsection.params.showSetAll}"
                            .populationFrequencyAlt="${this.preparedQuery.populationFrequencyAlt}"
                            @filterChange="${e => this.onFilterChange("populationFrequencyAlt", e.detail.value)}">
                        </population-frequency-filter>`;
                    break;
                case "consequence-type":
                case "consequenceTypeSelect":
                    content = html`
                        <consequence-type-select-filter
                            .ct="${this.preparedQuery.ct}"
                            .config="${subsection.params?.consequenceTypes || CONSEQUENCE_TYPES}"
                            @filterChange="${e => this.onFilterChange("ct", e.detail.value)}">
                        </consequence-type-select-filter>`;
                    break;
                case "role-in-cancer":
                    content = html`
                        <role-in-cancer-filter
                            .config="${subsection.params?.rolesInCancer || ROLE_IN_CANCER}"
                            .roleInCancer=${this.preparedQuery.generoleInCancer}
                            .disabled="${disabled}"
                            @filterChange="${e => this.onFilterChange("geneRoleInCancer", e.detail.value)}">
                        </role-in-cancer-filter>`;
                    break;
                case "proteinSubstitutionScore":
                    content = html`
                        <protein-substitution-score-filter
                            .proteinSubstitution="${this.preparedQuery.proteinSubstitution}"
                            @filterChange="${e => this.onFilterChange("proteinSubstitution", e.detail.value)}">
                        </protein-substitution-score-filter>`;
                    break;
                case "cadd":
                    content = html`
                        <cadd-filter
                            .annot-functional-score="${this.preparedQuery["annot-functional-score"]}"
                            @filterChange="${e => this.onFilterChange("annot-functional-score", e.detail.value)}">
                        </cadd-filter>`;
                    break;
                case "conservation":
                    content = html`
                        <conservation-filter
                            .conservation="${this.preparedQuery.conservation}"
                            @filterChange="${e => this.onFilterChange("conservation", e.detail.value)}">
                        </conservation-filter>`;
                    break;
                case "go":
                    content = html`
                        <go-accessions-filter
                            .go="${this.preparedQuery.go}"
                            .cellbaseClient="${this.cellbaseClient}"
                            @ontologyModalOpen="${this.onOntologyModalOpen}"
                            @filterChange="${e => this.onFilterChange("go", e.detail.value)}">
                        </go-accessions-filter>`;
                    break;
                case "hpo":
                    content = html`
                        <hpo-accessions-filter
                            .annot-hpo="${this.preparedQuery["annot-hpo"]}"
                            .cellbaseClient="${this.cellbaseClient}"
                            @ontologyModalOpen="${this.onOntologyModalOpen}"
                            @filterChange="${e => this.onFilterChange("annot-hpo", e.detail.value)}">
                        </hpo-accessions-filter>`;
                    break;
                case "diseasePanels":
                    content = html`
                        <disease-panel-filter
                            .opencgaSession="${this.opencgaSession}"
                            .diseasePanels="${this.opencgaSession.study.panels}"
                            .panel="${this.preparedQuery.panel}"
                            .panelFeatureType="${this.preparedQuery.panelFeatureType}"
                            .panelModeOfInheritance="${this.preparedQuery.panelModeOfInheritance}"
                            .panelConfidence="${this.preparedQuery.panelConfidence}"
                            .panelRoleInCancer="${this.preparedQuery.panelRoleInCancer}"
                            .panelIntersection="${this.preparedQuery.panelIntersection}"
                            .showPanelTitle="${true}"
                            .disabled="${disabled}"
                            .showExtendedFilters="${true}"
                            @filterChange="${
                                e => this.onFilterChange({
                                    panel: "panel",
                                    panelFeatureType: "panelFeatureType",
                                    panelModeOfInheritance: "panelModeOfInheritance",
                                    panelConfidence: "panelConfidence",
                                    panelRoleInCancer: "panelRoleInCancer",
                                    panelIntersection: "panelIntersection",
                                }, e.detail.query)}">
                        </disease-panel-filter>
                    `;
                    break;
                case "clinical-annotation":
                    content = html`
                        <clinical-annotation-filter
                            .clinical="${this.preparedQuery.clinical}"
                            .clinicalSignificance="${this.preparedQuery.clinicalSignificance}"
                            .clinicalConfirmedStatus="${this.preparedQuery.clinicalConfirmedStatus}"
                            @filterChange="${
                                e => this.onFilterChange({
                                    clinical: "clinical",
                                    clinicalSignificance: "clinicalSignificance",
                                    clinicalConfirmedStatus: "clinicalConfirmedStatus"
                                }, e.detail)}">
                        </clinical-annotation-filter>
                    `;
                    break;
                case "clinvar": // Deprecated: use clinical instead
                    content = html`
                        <clinvar-accessions-filter
                            .clinvar="${this.preparedQuery.clinvar}"
                            .clinicalSignificance="${this.preparedQuery.clinicalSignificance}"
                            @filterChange="${
                                e => this.onFilterChange({
                                    clinvar: "xref",
                                    clinicalSignificance: "clinicalSignificance"
                                }, e.detail.value)}">
                        </clinvar-accessions-filter>`;
                    break;
                case "fullTextSearch":
                    content = html`
                        <fulltext-search-accessions-filter
                            .traits="${this.preparedQuery.traits}"
                            @filterChange="${e => this.onFilterChange("traits", e.detail.value)}">
                        </fulltext-search-accessions-filter>`;
                    break;
                case "ext-svtype":
                    content = html`
                        <variant-ext-svtype-filter
                            @filterChange="${e => this.onVariantCallerInfoFilter(subsection.params.fileId, e.detail.value)}">
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
                        <variant-caller-info-filter
                            .caller="${subsection.id}"
                            .fileId="${subsection.params.fileId}"
                            .fileData="${this.preparedQuery.fileData}"
                            @filterChange="${e => this.onVariantCallerInfoFilter(subsection.params.fileId, e.detail.value, subsection.callback)}">
                        </variant-caller-info-filter>`;
                    break;
                default:
                    console.error("Filter component not found: " + subsection.id);
            }
        }

        // In some rare cases the filter might be empty, for instance study-filter is empty if ONLY on study exist in that study.
        // We need to avoid rendering empty filters.
        if (content !== "") {
            return html`
                <div class="mb-2">
                    ${subsection.title ? html`
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center" id="${this._prefix}${subsection.id}" data-cy="${subsection.id}">
                            ${this._getFilterField(subsection.title)}
                            ${subsection.tooltip ? html`
                                <a tooltip-title="Info" tooltip-text="${subsection.tooltip}">
                                    <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
                                </a>
                            ` : null}
                        </label>
                    `: null}
                    <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                        ${this._createMessage(subsection)}
                        ${subsection.description ? html`
                            <div>${this._getFilterField(subsection.description)}</div>` : null
                        }
                        ${content}
                    </div>
                </div>
            `;
        }
    }

    render() {
        return html`
            <div class="d-flex flex-column gap-3" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">
                ${this.renderFilterMenu()}
            </div>
        `;
    }

}

customElements.define("variant-browser-filter", VariantBrowserFilter);
