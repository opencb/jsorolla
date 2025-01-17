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
import ModalUtils from "../commons/modal/modal-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
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
            resource: {
                type: String,
            },
            toolId: {
                type: String,
            },
            filters: {
                type: Array,
            },
            defaultFilter: {
                type: Object,
            },
            searchActive: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();

        this.query = {};
        this.searchActive = true;

        this.queryList = [];
        this.preparedQuery = {};

        this.quickFilters = [];
        this.applicationFilters = [];
        this.userFilters = [];
        this.historyFilters = [];
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("resource")) {
            this.updateUserFilters();
        }

        if (changedProperties.has("filters") || changedProperties.has("defaultFilter")) {
            this.updateApplicationFilters();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    updated() {
        UtilsNew.initTooltip(this);
    }

    queryObserver() {
        this.preparedQuery = UtilsNew.objectClone(this.query);
        this.updateQueryList();

        // update the history only if it is empty
        if (this.historyFilters.length === 0) {
            this.updateHistory();
        }
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        // TODO: generate the list of quick filters ids from the configuration
        const quickFiltersIds = new Set(["variant", "feature", "consequence-type", "diseasePanels"]);

        // prepare list of quick and advanced filters
        this.quickFilters = (this._config?.sections || [])
            .map(section => (section?.filters || [])
            .filter(filter => quickFiltersIds.has(filter.id)))
            .flat();
    }

    notifyQuery(query) {
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {query});
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", null, {query});
    }

    updateApplicationFilters() {
        this.applicationFilters = [];

        // 1. Add default filter
        if (!!this.defaultFilter) {
            const isDisabled = UtilsNew.isEmpty(this.defaultFilter);
            this.applicationFilters.push({
                id: "Default Filter",
                query: UtilsNew.objectClone(this.defaultFilter),
                disabled: isDisabled,
                description: isDisabled ? "Filter not configured." : "",
                active: false,
            });
        }

        // 2. Add example filters
        if (this.filters?.length > 0) {
            this.applicationFilters.push(...this.filters);
        }
    }

    updateUserFilters() {
        this.userFilters = [];
        if (this.opencgaSession && this.resource) {
            this.opencgaSession.opencgaClient.users()
                .filters(this.opencgaSession.user.id)
                .then(response => {
                    this.userFilters = (response.responses?.[0]?.results || []).filter(filter => {
                        return filter.resource === this.resource;
                    });
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    updateHistory() {
        // 1. remove all identical filters
        const history = this.historyFilters.filter(historyItem => {
            return JSON.stringify(historyItem.query) !== JSON.stringify(this.preparedQuery);
        });

        // 2. remove previous latest
        if (history?.length > 0) {
            history[0].latest = false;
        }

        // 3. prepare new latest filter and add at the beginning
        history.unshift({
            id: UtilsNew.dateFormatter(UtilsNew.getDatetime(), "HH:mm:ss"),
            // date: UtilsNew.getDatetime(),
            query: UtilsNew.objectClone(this.preparedQuery),
            latest: true,
        });

        // 4. limit up to 10 history items
        this.historyFilters = history.slice(0, 10);
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

    saveFilter() {
        const filterName = this.querySelector(`#${this._prefix}SaveFilterName`).value;
        const filterDescription = this.querySelector(`#${this._prefix}SaveFilterDescription`).value;
        const query = UtilsNew.objectClone(this.query); // generate a clone of the current query

        // 1. filter out the current active study
        if (query.study) {
            const studies = query.study.split(",").filter(fqn => fqn !== this.opencgaSession.study.fqn);
            if (studies.length > 0) {
                query.study = studies.join(",");
            } else {
                delete query.study;
            }
        }

        // 2. remove ignored params
        // When saving a filter we do no twant to save the exact sample or file ID, otherwise the filter cannot be reused
        if (this._config?.save?.ignoreParams?.length > 0) {
            this._config.save.ignoreParams.forEach(param => {
                delete query[param];
            });
        }

        // 3. fetch saved filters of the user
        this.opencgaSession.opencgaClient.users()
            .filters(this.opencgaSession.user.id)
            .then(response => {
                const savedFilters = response.responses?.[0]?.results || [];

                // 3.1. check if the filter name already exists
                if (savedFilters.find(savedFilter => savedFilter.id === filterName)) {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                        display: {
                            okButtonText: "Yes, overwrite filter",
                            cancelButtonText: "Cancel",
                        },
                        title: "Overwrite Filter",
                        message: `A Filter with the name <b>${filterName}</b> is already present. Do you want to overwrite it?`,
                        ok: () => {
                            this.opencgaSession.opencgaClient.users()
                                .updateFilter(this.opencgaSession.user.id, filterName, {
                                    description: filterDescription,
                                    resource: this.resource,
                                    query: query,
                                    options: {},
                                })
                                .then(() => {
                                    // if (response?.getEvents?.("ERROR")?.length) {
                                    //     return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                                    // }
                                    // Display success message
                                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                        message: "Filter has been saved",
                                    });

                                    // clear the name and description fields
                                    this.querySelector(`#${this._prefix}SaveFilterName`).value = "";
                                    this.querySelector(`#${this._prefix}SaveFilterDescription`).value = "";

                                    // update user filters
                                    this.updateUserFilters();
                                })
                                .catch(response => {
                                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                                });
                        },
                    });

                } else {
                    // saving a new filter
                    const data = {
                        id: filterName,
                        description: filterDescription,
                        resource: this.resource,
                        query: query,
                        options: {}
                    };
                    this.opencgaSession.opencgaClient.users()
                        .updateFilters(this.opencgaSession.user.id, data, {action: "ADD"})
                        .then(() => {
                            // if (response.getEvents?.("ERROR")?.length) {
                            //     return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                            // }

                            // Display success message
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                message: "Filter has been saved",
                            });

                            // clear the name and description fields
                            this.querySelector(`#${this._prefix}SaveFilterName`).value = "";
                            this.querySelector(`#${this._prefix}SaveFilterDescription`).value = "";

                            // update user filters
                            this.updateUserFilters();
                        })
                        .catch(response => {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        });
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onFilterChange(key, value) {
        // Some filters may return more than one parameter, in this case key and value are objects with all the keys and filters
        //  - key: an object mapping filter name with the one returned
        //  - value: and object with the filter
        // Example: REST accepts filter and qual while filter returns FILTER and QUALITY
        //  - key: {filter: "FILTER", qual: "QUALITY"}
        //  - value: {FILTER: "pass", QUALITY: "25"}
        if (typeof key === "object" && typeof value === "object") {
            Object.values(key).forEach(k => {
                if (value[k] && value[k] !== "") {
                    this.preparedQuery[k] = value[k];
                } else {
                    delete this.preparedQuery[k];
                }
            });
        } else {
            if (!!value) {
                this.preparedQuery[key] = value;
            } else {
                delete this.preparedQuery[key];
            }
        }

        this.notifyQuery(this.preparedQuery);
    }

    onFilterDelete(key, value) {
        // in case that we want to remove the whole filter, or the filter has a single value
        if (!value || this.preparedQuery[key] === value) {
            delete this.preparedQuery[key];
        } else {
            let filterFields = [];
            const complexField = (this._config?.complexFields || []).find(item => item.id === key);

            if (complexField) {
                filterFields = complexField?.separator ? this.preparedQuery[key].split(complexField.separator) : UtilsNew.splitByRegex(this.preparedQuery[key], complexField.separatorRegex);
            } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                filterFields = this.preparedQuery[key].split(";"); // If we find a field with both ; and , we will separate by ;
            } else {
                filterFields = this.preparedQuery[key].split(new RegExp("[,;]"));
            }

            // remove value from filterFields
            filterFields = filterFields.filter(field => field !== value); 

            // restore the query field
            if (complexField) {
                this.preparedQuery[key] = complexField?.separator ? filterFields.join(complexField.separator) : filterFields.join(",");
            } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                this.preparedQuery[key] = filterFields.join(";");
            } else if (this.preparedQuery[key].indexOf(",") !== -1) {
                this.preparedQuery[key] = filterFields.join(",");
            } else {
                this.preparedQuery[key] = filterFields.join(";");
            }
        }

        this.notifySearch(this.preparedQuery);
        this.updateHistory();
    }

    onApplyQuery(query) {
        this.preparedQuery = UtilsNew.objectClone(query || {});
        this.notifySearch(this.preparedQuery);
        this.updateHistory();
    }

    onSearch() {
        this.notifySearch(this.preparedQuery);
        this.updateHistory();
    }

    onClear() {
        this.preparedQuery = {};
        this.notifySearch(this.preparedQuery);
        this.updateHistory();
    }

    onSave() {
        ModalUtils.show(`${this._prefix}SaveFilter`);
    }

    onCopyLink() {
        // 1. Generate the url to the tool with the current query
        const link = WebUtils.getIVALink(this.opencgaSession, this.toolId, this.query);

        // 2. Copy this link to the user clipboard
        UtilsNew.copyToClipboard(link);

        // 3. Notify user that the link has been copied to the clipboard
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Link to current query copied to clipboard.",
        });
    }

    isFilterVisible(subsection) {
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

    isFilterDisabled(subsection) {
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

    renderFilter(subsection) {
        let content = nothing;
        const disabled = this.isFilterDisabled(subsection);

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
    }

    renderQuickFilters() {
        return this.quickFilters.map((filter) => {
            return html`
                <div class="d-flex align-items-stretch">
                    <button class="btn btn-light d-flex align-items-center gap-2 dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                        <span>${filter.title}</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-start shadow p-2" style="width:280px;">
                        ${filter.description ? html`
                            <div class="mb-2">${filter.description}</div>    
                        ` : nothing}
                        ${this.renderFilter(filter)}
                    </div>
                </div>
            `;
        });
    }

    renderAdvancedFilters() {
        return this._config.sections.map((section, index) => {
            const filters = (section.filters || []).filter(filter => this.isFilterVisible(filter));

            if (filters.length === 0) {
                return nothing;
            } else {
                return html`
                    <div class="accordion-item bg-white">
                        <div class="accordion-header">
                            <button class="accordion-button collapsed fw-bold" data-bs-toggle="collapse" data-bs-target="#${this.prefix}AdvancedFilters${index}">
                                <span class="fs-5">${section.title}</span>
                            </button>
                        </div>
                        <div id="${this.prefix}AdvancedFilters${index}" class="accordion-collapse collapse" data-bs-parent="#${this._prefix}AdvancedFilters">
                            <div class="accordion-body d-flex flex-column gap-3">
                                ${section.filters.map(subsection => this.renderAdvancedFilterSubsection(subsection))}
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }

    renderAdvancedFilterSubsection(subsection) {
        return html`
            <div class="">
                ${subsection.title ? html`
                    <div class="mb-2 fs-5 fw-bold d-flex justify-content-between align-items-center" id="${this._prefix}${subsection.id}" data-cy="${subsection.id}">
                        <div>${subsection.title}</div>
                        ${subsection.tooltip ? html`
                            <a tooltip-title="Info" tooltip-text="${subsection.tooltip}">
                                <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
                            </a>
                        ` : nothing}
                    </div>
                `: nothing}
                <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                    ${subsection.description ? html`
                        <div class="mb-2">${subsection.description}</div>
                    ` : nothing}
                    ${this.renderFilter(subsection)}
                </div>
            </div>
        `;
    }

    renderFilterItems(items, highlightActiveFilter = true) {
        return items.map(item => {
            const isActive = highlightActiveFilter && UtilsNew.objectCompare(this.preparedQuery, item.query);
            const filterParams = Object.keys(item.query)
                .filter(key => key !== "study" && !!item.query[key]);
            const filterTooltip = filterParams
                .map(key => `<b>${key}</b> = ${item.query[key]}`)
                .join("<br>");

            return html`
                <a class="dropdown-item cursor-pointer ${isActive ? "active" : ""}" @click="${() => this.onApplyQuery(item.query)}">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="text-truncate">
                                ${item.id} ${item.latest ? html` <b>(latest)</b>` : nothing}
                            </div>
                            <div class="small opacity-50">
                            ${filterParams?.length > 0 ? html`
                                ${filterParams.slice(0, 2).map(key => html`
                                    <div class="" title="${item.query[key]}">
                                        <b>${key}</b>: ${UtilsNew.substring(item.query[key], 20)}
                                    </div>
                                `)}
                            ` : html`Empty query.`}
                            </div>
                        </div>
                        <div class="flex-shrink-0 mb-auto">
                            <span  class="action-buttons" tooltip-title="${item.id}" tooltip-text="${filterTooltip || "Empty query."}">
                                <i class="fas fa-eye opacity-75" data-action="view-filter"></i>
                            </span>
                        </div>
                    </div>
                </a>
            `;
        });
    }

    renderSaveModal() {
        return ModalUtils.create(this, this._prefix + "SaveFilter", {
            display: {
                modalTitle: "Save Current Filter",
                modalbtnsVisible: true,
                okButtonText: "Save Filter",
            },
            render: () => html`
                <div class="mb-3">
                    <label for="${this._prefix}SaveFilterName" class="col-sm-2 col-form-label fw-bold">Name</label>
                    <input class="form-control" type="text" id="${this._prefix}SaveFilterName" data-cy="modal-filter-name">
                </div>
                <div class="mb-3">
                    <label for="${this._prefix}SaveFilterDescription" class="col-sm-2 col-form-label fw-bold">Description</label>
                    <input class="form-control" type="text" id="${this._prefix}SaveFilterDescription" data-cy="modal-filter-description">
                </div>
            `,
            onOk: () => {
                this.saveFilter();
            },
        });
    }

    renderActiveFilters() {
        return this.queryList.map(item => {
            const itemClass = item.locked ? "disabled" : "hover:text-decoration-line-through cursor-pointer";
            if (item.items.length === 1) {
                return html`
                    <button class="btn btn-warning ${itemClass}" @click="${() => this.onFilterDelete(item.name)}">
                        <span>${item.text}</span>
                    </button>
                `;
            } else {
                return html`
                    <div class="btn-group">
                        <button class="btn btn-warning ${itemClass}" @click="${() => this.onFilterDelete(item.name)}">
                            <span>${item.text}</span>
                            <span class="fw-bold ps-1">(${item.items.length})</span>
                        </button>
                        <button class="btn btn-warning dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" data-bs-reference="parent">
                            <span class="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <div class="dropdown-menu shadow">
                            ${item.items.map(filterItem => html`
                                <a class="dropdown-item ${itemClass}" @click="${() => this.onFilterDelete(item.name, filterItem)}">
                                    <span>${filterItem}</span>
                                </a>
                            `)}
                        </div>
                    </div>
                `;
            }
        });
    }

    render() {
        // used to disable clear or save buttons
        const emptyPreparedQuery = Object.keys(this.preparedQuery).length === 0;

        return html`
            <div class="border p-1 rounded-3 mb-3">
                <div class="d-flex align-items-stretch gap-2 mb-2">
                    ${this.renderQuickFilters()}
                    <button class="btn btn-light d-flex align-items-center gap-2" data-bs-toggle="offcanvas" data-bs-target="#${this._prefix}AdvancedFilters">
                        <div class="d-flex align-items-center gap-1">
                            <i class="fas fa-filter"></i>
                            <span>Advanced Filters</span>
                        </div>
                    </button>
                    <div class="w-px bg-gray-200"></div>
                    <button class="btn btn-primary d-flex align-items-center gap-2 ${!this.searchActive ? "disabled" : ""}" @click="${this.onSearch}">
                        <i class="fas fa-search"></i>
                        <span class="fw-bold">Search</span>
                    </button>
                    <div class="ms-auto d-flex align-items-stretch gap-2">
                        <!-- Clear current query -->
                         <button class="btn btn-light d-flex align-items-center gap-2 ${emptyPreparedQuery ? "disabled" : ""}" @click="${this.onClear}">
                            <i class="fas fa-times"></i>
                            <span class="fw-bold">Clear</span>
                        </button>
                        <div class="w-px bg-gray-200"></div>
                        <!-- Saved filters -->
                        <div class="dropdown d-flex">
                            <button class="btn btn-light d-flex align-items-center gap-2" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                <i class="fas fa-bookmark"></i>
                                <span class="fw-bold">Filters</span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end shadow" style="width:240px;">
                                ${this.applicationFilters.length > 0 ? html`
                                    <div class="dropdown-header user-select-none">
                                        <span class="fw-bold">Application Filters</span>
                                    </div>
                                    ${this.renderFilterItems(this.applicationFilters, true)}
                                ` : nothing}
                                ${this.userFilters.length > 0 ? html`
                                    <div class="dropdown-header user-select-none">
                                        <span class="fw-bold">User Filters</span>
                                    </div>
                                    ${this.renderFilterItems(this.userFilters, true)}
                                ` : nothing}
                                ${this.applicationFilters.length > 0 || this.userFilters.length > 0 ? html`
                                    <hr class="dropdown-divider">
                                ` : nothing}
                                <a class="dropdown-item cursor-pointer d-flex align-items-center gap-2 ${emptyPreparedQuery ? "disabled": ""}" @click="${this.onSave}">
                                    <i class="fas fa-save"></i>
                                    <span class="fw-bold">Save Current Filter</span>
                                </a>
                            </div>
                        </div>
                        <!-- History filters -->
                         <div class="dropdown d-flex">
                            <button class="btn btn-light d-flex align-items-center gap-2" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                <i class="fas fa-history"></i>
                                <span class="fw-bold">History</span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end shadow" style="width:240px;">
                                ${this.renderFilterItems(this.historyFilters, false)}
                            </div>
                        </div>
                        <!-- Copy IVA Link -->
                        <button class="btn btn-light d-flex align-items-center gap-2" @click="${this.onCopyLink}">
                            <i class="fas fa-copy"></i>
                            <span class="fw-bold">Copy</span>
                        </button>
                    </div>
                </div>
                <div class="offcanvas offcanvas-end bg-white" id="${this._prefix}AdvancedFilters" style="width:500px;">
                    <div class="offcanvas-header px-4">
                        <h4 class="offcanvas-title fw-bold">Advanced Filters</h4>
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body px-4">
                        <div class="accordion" id="${this._prefix}AdvancedFilters">
                            ${this.renderAdvancedFilters()}
                        </div>
                    </div>
                </div>
                <!-- Active filters -->
                <div class="d-flex gap-2">
                    ${this.queryList.length > 0 ? this.renderActiveFilters() : html`<span class="fw-bold p-2">No filters selected</span>`}
                </div>
            </div>
            <!-- Modal to save current filters -->
            ${this.renderSaveModal()}
        `;
    }

    getDefaultConfig() {
        return {
            sections: [],
        };
    }

}

customElements.define("variant-browser-horizontal-filter", VariantBrowserHorizontalFilter);
