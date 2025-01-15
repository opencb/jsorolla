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
import LitUtils from "../commons/utils/lit-utils.js";
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

export default class VariantBrowserHorizontalFilter extends LitElement {

    constructor() {
        super();

        this.#init();
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

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();

        this.query = {};
        this.queryList = [];
        this.preparedQuery = {};

        // quick and advanced filters
        this.quickFiltersList = [];
        this.advancedFilters = [];

        // map filter id to filter field
        this.mapFilterIdToField = {
            "variant": "id",
            "feature": "xref",
            "type": "type",
        };
    }

    // connectedCallback() {
    //     super.connectedCallback();

    //     // Add event to allow Ctrl+Enter to fire the Search
    //     let isCtrl = false;
    //     document.addEventListener("keyup", e => {
    //         if (e.key?.toUpperCase() === "CONTROL") {
    //             isCtrl = false;
    //         }
    //     });

    //     document.addEventListener("keydown", e => {
    //         if (e.key?.toUpperCase() === "CONTROL") {
    //             isCtrl = true;
    //         }

    //         if (e.key?.toUpperCase() === "ENTER" && isCtrl) {
    //             e.preventDefault();
    //             e.stopImmediatePropagation();

    //             this.onSearch();
    //         }
    //     });

    //     this.preparedQuery = {...this.query}; // propagates here the iva-app query object
    // }

    firstUpdated() {
        // register listeners to bootstrap collapse events
        Array.from(this.querySelectorAll(`[data-bs-role="collapse"]`)).forEach(el => {
            el.addEventListener("show.bs.collapse", e => {
                e.target.previousElementSibling.querySelector("i").classList.remove("fa-chevron-down");
                e.target.previousElementSibling.querySelector("i").classList.add("fa-chevron-up");
            });
            el.addEventListener("hide.bs.collapse", e => {
                e.target.previousElementSibling.querySelector("i").classList.remove("fa-chevron-up");
                e.target.previousElementSibling.querySelector("i").classList.add("fa-chevron-down");
            });
        });
    }

    update(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    // opencgaSessionObserver() {
    //     if (this.opencgaSession.study) {
    //         // Render filter menu and add event and tooltips
    //         // if (this._initialised) {
    //         //     this.renderFilterMenu();
    //         // }
    //         this.renderFilterMenu();
    //     }
    // }

    queryObserver() {
        // The following line FIX the "silent" persistence of active filters once 1 is deleted, due to an inconsistency
        // between query and preparedQuery. Step to reproduce:
        // 0. comment the line `this.preparedQuery = this.query;`
        // 1. add some filters from variant=filter
        // 2. delete 1 filter from active-filter
        // 3. add another filter from variant-filter
        // 4. you will see again the deleted filter in active-filters
        this.preparedQuery = {...this.query};
        this.updateQueryList();
        // this.requestUpdate();
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        // TODO: generate the list of quick filters ids from the configuration
        const quickFiltersIds = new Set(["variant", "feature"]);
        // prepare list of quick and advanced filters
        this.quickFiltersList = (this._config?.sections || [])
            .map(section => (section?.filters || [])
            .filter(filter => quickFiltersIds.has(filter.id)))
            .flat();
        // NOTE: advanced filters are grouped in sections instead of a plain list of filters
        this.advancedFilters = (this._config?.sections || [])
            .map(section => {
                return {
                    ...section,
                    filters: section.filters.filter(filter => !quickFiltersIds.has(filter.id)),
                };
            })
            .filter(section => section.filters.length > 0);
    }

    onSearch() {
        this.notifySearch(this.preparedQuery);
    }

    notifyQuery(query) {
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {query});
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", null, {query});
    }

    updateQueryList() {
        this.queryList = [];
        Object.keys(this.preparedQuery).forEach(key => {
            // if (UtilsNew.isNotEmpty(this.preparedQuery[key]) && (!this._config.hiddenFields || (this._config.hiddenFields && !this._config.hiddenFields.includes(key)))) {
            if (UtilsNew.isNotEmpty(this.preparedQuery[key])) {
                // We use the alias to rename the key
                let title = key;
                // if (UtilsNew.isNotUndefinedOrNull(this._config.alias) && UtilsNew.isNotUndefinedOrNull(this._config.alias[key])) {
                //     title = this._config.alias[key];
                // }

                // We convert the Query entry object into an array of small objects (queryList)
                let value = this.preparedQuery[key];
                if (typeof value === "boolean") {
                    value = value.toString();
                }

                let filterFields = [];

                // in case of annotation
                if (key === "annotation") {
                    filterFields = value.split(";");
                } else if (key === "study") {
                    // We fist have need to remove defaultStudy from 'filterFields' and 'value'
                    filterFields = value.split(/[,;]/).filter(fqn => fqn !== this.defaultStudy);
                    // defaultStudy was the only one present so no need to render anything
                    if (!filterFields.length) {
                        return;
                    }
                    value = filterFields.join(/[,;]/);
                } else {
                    // Check if the field has been defined as complex
                    const complexField = (this._config?.complexFields || []).find(item => item.id === key);
                    if (complexField) {
                        filterFields = complexField?.separator ? value.split(complexField.separator) : UtilsNew.splitByRegex(value, complexField.separatorRegex);
                    } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                        // If we find a field with both ; and , we will separate by ;
                        filterFields = value.split(";");
                    } else {
                        filterFields = value.split(new RegExp("[,;]"));
                    }
                }

                // [TODO]
                const locked = false; // UtilsNew.isNotUndefinedOrNull(this.lockedFieldsMap[key]);
                const lockedTooltip = locked ? this.lockedFieldsMap[key].message : "";

                // Just in case one is a flag
                if (filterFields.length === 0) {
                    this.queryList.push({name: key, text: title, locked: locked, message: lockedTooltip});
                } else {
                    if (filterFields.length === 1) {
                        if (value.indexOf(">") !== -1 || value.indexOf("<") !== -1 || value.indexOf("=") !== -1) {
                            this.queryList.push({name: key, text: title + ": " + value, items: filterFields, locked: locked, message: lockedTooltip});
                        } else {
                            this.queryList.push({name: key, text: title + " = " + value, items: filterFields, locked: locked, message: lockedTooltip});
                        }
                    } else {
                        this.queryList.push({name: key, text: title, items: filterFields, locked: locked, message: lockedTooltip});
                    }
                }
            }
        });
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
        if (typeof key === "object" && typeof value === "object") {
            Object.values(key).forEach(k => {
                if (value[k] && value[k] !== "") {
                    this.preparedQuery[k] = value[k];
                } else {
                    delete this.preparedQuery[k];
                }
            });
        } else {
            if (value && value !== "") {
                this.preparedQuery[key] = value;
            } else {
                // deleting `key` from this.preparedQuery
                delete this.preparedQuery[key];
            }
        }
        this.preparedQuery = {...this.preparedQuery};
        // this.updateQueryList();
        this.notifyQuery(this.preparedQuery);
        // this.requestUpdate();
        // check if this is a quick filter --> if so, we have to dispatch the search event
        // if (this.quickFiltersList.length > 0) {
        //     const filterId = Object.keys(this.mapFilterIdToField)
        //         .find(id => this.mapFilterIdToField[id] === key);
        //     // verify of the filter id is in the quickFiltersList
        //     if (filterId && this.quickFiltersList.find(filter => filter.id === filterId)) {
        //         this.notifySearch(this.preparedQuery);
        //     }
        // }
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

    renderFilter(subsection) {
        let content = nothing;
        const disabled = this._isFilterDisabled(subsection);

        // We allow to pass a render function
        if (subsection.render) {
            content = subsection.render(this.onFilterChange, this.preparedQuery, this.opencgaSession);
        } else {
            switch (subsection.id) {
                case "study":
                    const sampleSelected = !!this.preparedQuery?.sample;
                    content = html`
                        ${sampleSelected ? html`
                            <div class="alert alert-warning" role="alert">
                                You can not select multiple studies if at least one sample has been selected in <b>Sample Filter</b>.
                            </div>
                        ` : nothing}
                        <study-filter
                            .value="${this.preparedQuery.study}"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${{disabled: sampleSelected}}"
                            @filterChange="${e => this.onFilterChange("study", e.detail.value)}">
                        </study-filter>
                    `;
                    break;
                case "sample":
                    const multiStudySelected = this.preparedQuery?.study?.split(/[,;]/)?.length > 1;
                    content = html`
                        ${multiStudySelected ? html`
                            <div class="alert alert-warning" role="alert">
                                You cannot select samples if more than one study has been selected in <b>Study Filter</b>.
                            </div>
                        ` : nothing}
                        <catalog-search-autocomplete
                            title="${multiStudySelected ? "You cannot select samples with more than one study" : ""}"
                            .value="${this.preparedQuery.sample}"
                            .opencgaSession="${this.opencgaSession}"
                            .resource="${"SAMPLE"}"
                            .config="${{multiple: true, maxItems: 3, disabled: multiStudySelected}}"
                            @filterChange="${e => this.onFilterChange("sample", e.detail.value)}">
                        </catalog-search-autocomplete>
                    `;
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
                    // Josemi Note 20240730 - We had to change the value of the falsy expression to 'null' to prevent unnecesary
                    // renders, as if we keep an empty object '{}' as falsy expression Lit will treat it as a new configuration object
                    // and will force the select-field-filter to load the genotypes as a new data, even the genotypes list is the same.
                    const sampleConfig = subsection.params?.genotypes ? {genotypes: subsection.params.genotypes} : null;
                    content = html`
                        <sample-genotype-filter
                            .sample="${this.preparedQuery.sample}"
                            .config="${sampleConfig || {}}"
                            @filterChange="${e => this.onFilterChange("sample", e.detail.value)}">
                        </sample-genotype-filter>    
                    `;
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
                            .roleInCancer="${this.preparedQuery.geneRoleInCancer}"
                            .disabled="${disabled}"
                            @filterChange="${e => this.onFilterChange("geneRoleInCancer", e.detail.value)}">
                        </role-in-cancer-filter>
                    `;
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

        return content;

        // In some rare cases the filter might be empty, for instance study-filter is empty if ONLY on study exist in that study.
        // We need to avoid rendering empty filters.
        if (content !== "") {
            return html`
                <div class="">
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

    renderQuickFilters() {
        return this.quickFiltersList.map((filter, index) => {
            const fieldId = this.mapFilterIdToField[filter.id] || "";
            const field = this.queryList.find(query => query.name === fieldId);

            return html`
                <div class="d-flex align-items-stretch">
                    <button class="btn btn-light d-flex align-items-center gap-2 dropdown-toggle ${field ? "rounded-end-0" : ""}" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                        ${field ? html`
                            <span class="fw-bold">(${field.items.length})</span>
                        ` : nothing}
                        <span>${filter.title}</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-start shadow p-2" style="width: 240px;">
                        ${this.renderFilter(filter)}
                    </div>
                    ${field ? html`
                        <button class="btn btn-light d-flex align-items-center cursor-pointer rounded-start-0 border-start-0" @click="${() => this.onFilterChange(field.name, null)}">
                            <i class="fa fa-times"></i>
                        </button>
                    ` : nothing}
                </div>
            `;
        });
    }

    renderAdvancedFilters() {
        return this.advancedFilters.map((section, index) => {
            const appliedFilters = section.filters.filter(filter => {
                const fieldId = this.mapFilterIdToField[filter.id] || "";
                const field = this.queryList.find(query => query.name === fieldId);
                return !!field;
            });

            return html`
                <div class="d-flex flex-column gap-3">
                    <div class="d-flex align-items-center gap-2 cursor-pointer text-gray-700" data-bs-toggle="collapse" data-bs-target="#${this._prefix}AdvancedFilters${index}">
                        <i class="fa fa-chevron-down fs-5"></i>
                        <span class="fw-bold fs-4">${section.title}</span>
                        ${appliedFilters.length > 0 ? html`
                            <span class="fw-bold fs-4">(${appliedFilters.length})</span>    
                        ` : nothing}
                    </div>
                    <div class="collapse" id="${this._prefix}AdvancedFilters${index}" data-bs-role="collapse">
                        <div class="d-flex flex-column gap-3">
                            ${section.filters.map(subsection => this.renderAdvancedFilterSubsection(subsection))}
                        </div>
                    </div>
                </div>
            `;
        });
    }

    renderAdvancedFilterSubsection(subsection) {
        return html`
            <div class="">
                ${subsection.title ? html`
                    <div class="mb-2 fs-5 fw-bold d-flex justify-content-between align-items-center" id="${this._prefix}${subsection.id}" data-cy="${subsection.id}">
                        ${this._getFilterField(subsection.title)}
                        ${subsection.tooltip ? html`
                            <a tooltip-title="Info" tooltip-text="${subsection.tooltip}">
                                <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
                            </a>
                        ` : nothing}
                    </div>
                `: nothing}
                <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                    ${this._createMessage(subsection)}
                    ${subsection.description ? html`
                        <div>${this._getFilterField(subsection.description)}</div>
                    ` : nothing}
                    ${this.renderFilter(subsection)}
                </div>
            </div>
        `;
    }

    render() {
        const advancedFiltersCount = this.advancedFilters.reduce((count, section) => {
            const appliedFilters = section.filters.filter(filter => {
                const fieldId = this.mapFilterIdToField[filter.id] || "";
                return !!this.queryList.find(query => query.name === fieldId);
            });
            return count + appliedFilters.length;
        }, 0);

        return html`
            <div class="d-flex align-items-stretch gap-2 mb-3">
                ${this.renderQuickFilters()}
                <button class="btn btn-light d-flex align-items-center gap-2" data-bs-toggle="offcanvas" data-bs-target="#${this._prefix}AdvancedFilters">
                    ${advancedFiltersCount > 0 ? html`
                        <span class="fw-bold">(${advancedFiltersCount})</span>
                    ` : nothing}
                    <div class="d-flex align-items-center gap-1">
                        <i class="fa fa-filter"></i>
                        <span>Advanced Filters</span>
                    </div>
                </button>
                <div class="w-px bg-gray-200"></div>
                <button class="btn btn-primary d-flex align-items-center gap-2" @click="${this.onSearch}">
                    <i class="fa fa-search"></i>
                    <span class="fw-bold">Search</span>
                </button>
            </div>
            <div class="offcanvas offcanvas-end bg-white" id="${this._prefix}AdvancedFilters" style="width:500px;">
                <div class="offcanvas-header px-5 py-3">
                    <h4 class="offcanvas-title fw-bold">Advanced Filters</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body px-5 py-3 d-flex flex-column gap-4">
                    ${this.renderAdvancedFilters()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            sections: [],
        };
    }

}

customElements.define("variant-browser-horizontal-filter", VariantBrowserHorizontalFilter);
