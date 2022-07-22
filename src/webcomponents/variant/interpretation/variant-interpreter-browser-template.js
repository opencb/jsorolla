/*
 * Copyright 2015-2016 OpenCB
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

import {html, LitElement} from "lit";
import VariantUtils from "../variant-utils.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../../core/utilsNew.js";
import "./variant-interpreter-browser-toolbar.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../variant-browser-filter.js";
import "../../commons/tool-header.js";
import "../../commons/opencga-active-filters.js";

class VariantInterpreterBrowserTemplate extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            toolId: {
                type: String
            },
            settings: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.searchActive = true;
        this.variant = null;
        this.query = {};
        this.savedVariants = [];
        this.notSavedVariantIds = 0;
        this.removedVariantIds = 0;

        this.currentQueryBeforeSaveEvent = null;

        this._config = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("opencgaSession")) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        }

        if (changedProperties.has("settings") || changedProperties.has("config")) {
            this.settingsObserver();
        }

        super.update(changedProperties);
    }

    settingsObserver() {
        if (!this.clinicalAnalysis) {
            return;
        }
        // merge filters
        this._config = {...this.config};

        // filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        if (this.settings?.table) {
            this._config.filter.result.grid = {...this._config.filter.result.grid, ...this.settings.table};
        }

        if (this.settings?.table?.toolbar) {
            this._config.filter.result.grid.toolbar = {...this._config.filter.result.grid.toolbar, ...this.settings.table.toolbar};
        }

        // Check for user configuration
        if (this.toolId && this.opencgaSession.user?.configs?.IVA?.[this.toolId]?.grid) {
            this._config.filter.result.grid = {
                ...this._config.filter.result.grid,
                ...this.opencgaSession.user.configs.IVA[this.toolId].grid,
            };
        }

        // Add copy.execute functions
        if (this._config.filter.result.grid?.copies?.length > 0) {
            for (const copy of this._config.filter.result.grid?.copies) {
                const originalCopy = this.settings.table.copies.find(c => c.id === copy.id);
                if (originalCopy.execute) {
                    copy.execute = originalCopy.execute;
                }
            }
        }
    }

    clinicalAnalysisObserver() {
        // Init saved variants with the primary findings of the main interpretation
        if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length) {
            this.savedVariants = this.clinicalAnalysis?.interpretation?.primaryFindings?.map(v => v.id);
        }
        this.settingsObserver();

        // When refreshing AFTER saving variants we set the same query as before refreshing, check 'onSaveVariants'
        if (this.currentQueryBeforeSaveEvent) {
            this.query = {...this.currentQueryBeforeSaveEvent};
            this.currentQueryBeforeEvent = null;
        }
    }

    queryObserver() {
        if (this.opencgaSession && this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.searchActive = false;
        }
        this.requestUpdate();
    }

    onQueryComplete() {
        this.searchActive = true;
        this.requestUpdate();
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.row;
        this.requestUpdate();
    }

    onCheckVariant(e) {
        const rows = Array.isArray(e.detail.row) ? e.detail.row : [e.detail.row];
        rows.forEach(row => {
            if (e.detail.checked) {
                this.clinicalAnalysisManager.addVariant(row);
            } else {
                this.clinicalAnalysisManager.removeVariant(row);
            }
        });
    }

    onUpdateVariant(e) {
        const rows = Array.isArray(e.detail.row) ? e.detail.row : [e.detail.row];
        rows.forEach(row => {
            this.clinicalAnalysisManager.updateSingleVariant(row);
        });
        this.requestUpdate();
    }

    onFilterVariants(e) {
        const lockedFields = [...this._config?.filter?.activeFilters?.lockedFields.map(key => key.id), "study"];
        const variantIds = e.detail.variants.map(v => v.id);
        this.executedQuery = {...UtilsNew.filterKeys(this.executedQuery, lockedFields), id: variantIds.join(",")};
        this.preparedQuery = {...this.executedQuery};
        this.requestUpdate();
    }

    onResetVariants(e) {
        this.clinicalAnalysisManager.reset();

        this.preparedQuery = {...this.preparedQuery};
        this.executedQuery = {...this.executedQuery};
        delete this.preparedQuery.id;
        delete this.executedQuery.id;

        this.clinicalAnalysis = {...this.clinicalAnalysis};
    }

    onSaveVariants(e) {
        // We save current query so we can execute the same query after refreshing, check 'clinicaAnalysisObserver'
        this.currentQueryBeforeSaveEvent = this.query;

        // Save current query in the added variants
        this.clinicalAnalysisManager.state.addedVariants?.forEach(variant => variant.filters = this.query);

        const comment = e.detail.comment;
        this.clinicalAnalysisManager.updateInterpretationVariants(comment, () => {
            LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                clinicalAnalysis: this.clinicalAnalysis,
            }, null, {bubbles: true, composed: true});
        });
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.query = {...e.detail.query}; // We need to update the internal query to propagate to filters
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        VariantUtils.validateQuery(e.detail);
        this.query = {...e.detail};
        this.requestUpdate();
    }

    onSearch() {
        this.onVariantFilterSearch({
            detail: {
                query: this.preparedQuery,
            },
        });
    }

    onActiveFilterClear() {
        const lockedFields = [...this._config?.filter?.activeFilters?.lockedFields.map(key => key.id)];
        let _query = {
            study: this.opencgaSession.study.fqn
        };

        // Reset filters default
        lockedFields.forEach(field => {
            _query = {
                ..._query,
                [field]: this.query[field]
            };
        });

        // Check if panelLock is enabled
        if (this.clinicalAnalysis.panelLock) {
            _query.panel = this.query.panel;
            _query.panelIntersection = true;
        }
        this.query = UtilsNew.objectClone(_query);

        this.requestUpdate();

    }

    async onGridConfigSave(e) {
        const newGridConfig = {...e.detail.value};

        // Remove highlights and copies configuration from new config
        delete newGridConfig.highlights;
        // delete newConfig.copies;

        // Update user configuration
        try {
            await OpencgaCatalogUtils.updateGridConfig(this.opencgaSession, this.toolId, newGridConfig);
            this.settingsObserver();
            this.requestUpdate();

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: "Configuration saved",
            });
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession?.study) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <style>
                .prioritization-center {
                    margin: auto;
                    text-align: justify;
                    width: 95%;
                }

                .browser-variant-tab-title {
                    font-size: 115%;
                    font-weight: bold;
                }

                .prioritization-variant-tab-title {
                    font-size: 115%;
                    font-weight: bold;
                }

                .form-section-title {
                    padding: 5px 0px;
                    width: 95%;
                    border-bottom-width: 1px;
                    border-bottom-style: solid;
                    border-bottom-color: #ddd
                }

                #clinicalAnalysisIdText {
                    padding: 10px;
                }

                .clinical-analysis-id-wrapper {
                    padding: 20px;
                }

                .clinical-analysis-id-wrapper .text-filter-wrapper {
                    margin: 20px 0;
                }
            </style>

            ${this._config.showTitle ? html`
                <tool-header
                    title="${this.clinicalAnalysis ? `${this._config.title} (${this.clinicalAnalysis.id})` : this._config.title}"
                    icon="${this._config.icon}">
                </tool-header>
            ` : null}

            <div class="row">
                <div class="col-md-2">
                    <div class="search-button-wrapper">
                        <button type="button" class="btn btn-primary btn-block" ?disabled="${!this.searchActive}" @click="${this.onSearch}">
                            <i class="fa fa-search" aria-hidden="true"></i>
                            <strong>${this._config.filter?.searchButtonText || "Search"}</strong>
                        </button>
                    </div>
                    <variant-browser-filter
                        .opencgaSession="${this.opencgaSession}"
                        .query="${this.query}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .populationFrequencies="${POPULATION_FREQUENCIES}"
                        .consequenceTypes="${SAMPLE_STATS_CONSEQUENCE_TYPES}"
                        .config="${this._config.filter}"
                        @queryChange="${this.onVariantFilterChange}"
                        @querySearch="${this.onVariantFilterSearch}">
                    </variant-browser-filter>
                </div> <!-- Close col-md-2 -->

                <div class="col-md-10">
                    <div>
                        ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS") ?
                            html`
                                <variant-interpreter-browser-toolbar
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .state="${this.clinicalAnalysisManager.state}"
                                    @filterVariants="${this.onFilterVariants}"
                                    @resetVariants="${this.onResetVariants}"
                                    @saveInterpretation="${this.onSaveVariants}">
                                </variant-interpreter-browser-toolbar>
                            ` : null
                        }
                    </div>

                    <div id="${this._prefix}MainContent">
                        <div id="${this._prefix}ActiveFilters">
                            <opencga-active-filters
                                resource="VARIANT"
                                .opencgaSession="${this.opencgaSession}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .defaultStudy="${this.opencgaSession.study.fqn}"
                                .query="${this.preparedQuery}"
                                .executedQuery="${this.executedQuery}"
                                .filters="${this._config.filter.activeFilters.filters}"
                                .alias="${this._config.activeFilterAlias}"
                                .genotypeSamples="${this.genotypeSamples}"
                                .modeInheritance="${this.modeInheritance}"
                                .config="${this._config.filter.activeFilters}"
                                @activeFilterChange="${this.onActiveFilterChange}"
                                @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>
                        </div>

                        <!-- SEARCH TABLE RESULT -->
                        <div class="main-view">
                            <div id="${this._prefix}Interactive" class="variant-interpretation-content">
                                ${!this._config.filter.result.grid.isRearrangement ? html`
                                    <variant-interpreter-grid
                                        .opencgaSession="${this.opencgaSession}"
                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                        .query="${this.executedQuery}"
                                        .review="${true}"
                                        .config="${this._config.filter.result.grid}"
                                        @queryComplete="${this.onQueryComplete}"
                                        @selectrow="${this.onSelectVariant}"
                                        @updaterow="${this.onUpdateVariant}"
                                        @checkrow="${this.onCheckVariant}"
                                        @gridconfigsave="${this.onGridConfigSave}">
                                    </variant-interpreter-grid>` : html`
                                    <variant-interpreter-rearrangement-grid
                                        .opencgaSession="${this.opencgaSession}"
                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                        .query="${this.executedQuery}"
                                        .review="${true}"
                                        .config="${this._config.filter.result.grid}"
                                        @queryComplete="${this.onQueryComplete}"
                                        @selectrow="${this.onSelectVariant}"
                                        @updaterow="${this.onUpdateVariant}"
                                        @checkrow="${this.onCheckVariant}">
                                    </variant-interpreter-rearrangement-grid>`
                                }


                                <!-- Bottom tabs with detailed variant information -->
                                <variant-interpreter-detail
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .variant="${this.variant}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .config=${this._config.filter.detail}>
                                </variant-interpreter-detail>
                            </div>
                        </div>
                    </div> <!-- Close MainContent -->
                </div> <!-- Close col-md-10 -->
            </div> <!-- Close row -->
        `;
    }

}

customElements.define("variant-interpreter-browser-template", VariantInterpreterBrowserTemplate);
