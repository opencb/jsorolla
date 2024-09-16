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

import {html, LitElement, nothing} from "lit";
import VariantUtils from "../variant-utils.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import Region from "../../../core/bioinfo/region.js";
import "./variant-interpreter-browser-toolbar.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../variant-browser-filter.js";
import "../../commons/tool-header.js";
import "../../commons/opencga-active-filters.js";
import "../../visualization/genome-browser.js";
import "../../visualization/split-genome-browser.js";

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
            },
            active: {
                type: Boolean,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.searchActive = true;
        this.variant = null;
        this.query = {};

        // Saves the current active view
        this.activeView = "table";

        // Variant inclusion list
        this.variantInclusionState = [];

        this.currentQueryBeforeSaveEvent = null;
        this.clinicalAnalysisManager = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("opencgaSession")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("settings") || changedProperties.has("config")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        // Reset clinical analysis manager
        if (this.opencgaSession && this.clinicalAnalysis) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        }

        // When refreshing AFTER saving variants we set the same query as before refreshing, check 'onSaveVariants'
        if (this.currentQueryBeforeSaveEvent) {
            this.query = {...this.currentQueryBeforeSaveEvent};
            this.currentQueryBeforeEvent = null;
            this.variant = null;
        }
    }

    queryObserver() {
        if (this.opencgaSession && this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.searchActive = false;
            this.variant = null;
        }
    }

    opencgaSessionObserver() {
        this.getInclusionVariantIds();
    }

    settingsObserver() {
        // merge filters
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        // filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        if (this.settings?.table) {
            const {toolbar, ...otherTableProps} = this.settings.table;
            UtilsNew.setObjectValue(this._config, "filter.result.grid", {
                ...this._config.filter.result.grid,
                ...otherTableProps,
                ...toolbar,
            });
        }

        // Apply User grid configuration. Only 'pageSize', 'columns', 'geneSet', 'consequenceType' and 'populationFrequenciesConfig' are set
        UtilsNew.setObjectValue(this._config, "filter.result.grid", {
            ...this._config.filter?.result?.grid,
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.toolId]?.grid
        });

        // FIXME For old users
        if (typeof this._config.filter.result.grid?.highlights === "string") {
            this._config.filter.result.grid.highlights = this.settings.table.highlights;
        }

        // Add copy.execute functions
        if (this._config.filter.result.grid?.copies?.length > 0) {
            for (const copy of this._config.filter.result.grid?.copies) {
                const originalCopy = this.settings.table?.copies?.find(c => c.id === copy.id);
                if (originalCopy?.execute) {
                    copy.execute = originalCopy.execute;
                }
            }
        }
    }

    getInclusionVariantIds() {
        if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.inclusion?.length > 0) {
            const localVariantInclusionState = [];
            const inclusionList = this.opencgaSession.study.internal.configuration.clinical.interpretation.inclusion;
            const promises = inclusionList.map(inclusion => {
                localVariantInclusionState.push({
                    ...inclusion,
                    variants: [],
                });
                const inclusionQuery = {
                    ...inclusion.query,
                    // Additional filters
                    sample: this.clinicalAnalysis?.proband?.samples?.[0]?.id,
                    include: "id,studies.files,studies.samples",
                    count: false,
                    study: this.opencgaSession.study.fqn,
                };
                return this.opencgaSession.opencgaClient.clinical().queryVariant(inclusionQuery);
            });

            // Process all results and update object state
            Promise.all(promises).then(values => {
                for (let i = 0; i < values.length; i++) {
                    localVariantInclusionState[i].variants = values[i].responses[0].results;
                }
                this.variantInclusionState = localVariantInclusionState;
                this.requestUpdate();
            });
        }
    }

    notifyQueryChange() {
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {
            query: this.query,
        });
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
        const variantIds = new Set(e.detail.variants.map(v => v.id));
        this.query = {
            ...UtilsNew.filterKeys(this.executedQuery, lockedFields),
            id: Array.from(variantIds).join(","),
        };
        this.notifyQueryChange();
        this.requestUpdate();
    }

    onResetVariants() {
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
        this.variant = null;
        this.notifyQueryChange();
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        VariantUtils.validateQuery(e.detail);
        this.query = {...e.detail};
        this.variant = null;
        this.notifyQueryChange();
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
        if (this.clinicalAnalysis.panelLocked) {
            _query.panel = this.query.panel;
            _query.panelIntersection = true;
        }
        this.query = UtilsNew.objectClone(_query);
        this.notifyQueryChange();
        this.requestUpdate();
    }

    onSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onChangeView(newView) {
        this.activeView = newView;
        this.requestUpdate();
    }

    renderStyles() {
        return html `
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
            </style>`;
    }

    renderViewButton(id, title, icon) {
        return html`
            <button class="${`btn btn-success ${this.activeView === id ? "active" : ""}`}" @click="${() => this.onChangeView(id)}">
                <i class="${`fa fa-${icon} icon-padding`}" aria-hidden="true"></i>
                <strong>${title}</strong>
            </button>`;
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession?.study) {
            return nothing;
        }

        return html`
            ${this._config.showTitle ? html`
                <tool-header
                    title="${this.clinicalAnalysis ? `${this._config.title} (${this.clinicalAnalysis.id})` : this._config.title}"
                    icon="${this._config.icon}">
                </tool-header>
            ` : nothing}

            ${this.clinicalAnalysis.interpretation.locked ? html`
                <div class="alert alert-warning">
                    <label>Interpretation locked:</label> you cannot modify this interpretation. You can unlock the interpretation in
                    <span class="fst-italic">Case Info >> Interpretation Manager</span>.
                </div>
            ` : nothing}

            <!-- Rodiel 27-09-23 NOTE: Using 'row' and 'col' has problems for standard resolution, so I opted for 'flex -->
            <div class="d-flex gap-4">
                <div class="col-2">
                    <div class="d-grid gap-2 mb-3 cy-search-button-wrapper">
                        <button type="button" class="btn btn-primary btn-block" ?disabled="${!this.searchActive}" @click="${this.onSearch}">
                            <i class="fa fa-search mx-1" aria-hidden="true"></i>
                            <span class="fw-bold fs-5">${this._config.filter?.searchButtonText || "Search"}</span>
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

                <div class="flex-grow-1">
                    <!-- View toolbar -->
                    <div class="content-pills mb-3" role="toolbar" aria-label="toolbar">
                        ${this.renderViewButton("table", "Table Result", "table")}
                        ${!this.settings?.hideGenomeBrowser ? this.renderViewButton("genome-browser", "Genome Browser", "dna") : nothing}
                    </div>
                    <!-- Active filters -->
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
                    <div class="main-view">
                        <div id="table-view" class="${`content-tab ${this.activeView === "table" ? "active" : ""}`}">
                            <!-- Interpreter browser toolbar -->
                            <variant-interpreter-browser-toolbar
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .state="${this.clinicalAnalysisManager.state}"
                                .variantInclusionState="${this.variantInclusionState}"
                                .write="${OpencgaCatalogUtils.getStudyEffectivePermission(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS", this.opencgaSession.organization?.configuration?.optimizations?.simplifyPermissions)}"
                                @filterVariants="${this.onFilterVariants}"
                                @resetVariants="${this.onResetVariants}"
                                @saveInterpretation="${this.onSaveVariants}">
                            </variant-interpreter-browser-toolbar>

                            ${!this._config.filter.result.grid.isRearrangement ? html`
                                <variant-interpreter-grid
                                    .toolId="${this.toolId}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .query="${this.executedQuery}"
                                    .review="${true}"
                                    .config="${this._config.filter.result.grid}"
                                    .active="${this.active}"
                                    @queryComplete="${this.onQueryComplete}"
                                    @selectrow="${this.onSelectVariant}"
                                    @updaterow="${this.onUpdateVariant}"
                                    @checkrow="${this.onCheckVariant}"
                                    @settingsUpdate="${this.onSettingsUpdate}">
                                </variant-interpreter-grid>` : html`
                                <variant-interpreter-rearrangement-grid
                                    .toolId="${this.toolId}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .query="${this.executedQuery}"
                                    .review="${true}"
                                    .config="${this._config.filter.result.grid}"
                                    .active="${this.active}"
                                    @queryComplete="${this.onQueryComplete}"
                                    @selectrow="${this.onSelectVariant}"
                                    @updaterow="${this.onUpdateVariant}"
                                    @checkrow="${this.onCheckVariant}"
                                    @settingsUpdate="${this.onSettingsUpdate}">
                                </variant-interpreter-rearrangement-grid>`
                            }
                            <!-- Bottom tabs with detailed variant information -->
                            ${this.variant ? html`
                                <variant-interpreter-detail
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .toolId="${this.toolId}"
                                    .variant="${this.variant}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .config="${this._config.filter.detail}">
                                </variant-interpreter-detail>
                            ` : nothing}
                        </div>
                        <!-- Genome browser view -->
                        ${!this.settings?.hideGenomeBrowser ? html`
                            <div id="genome-browser-view" class="${`content-tab ${this.activeView === "genome-browser" ? "active" : ""}`}">
                                ${!this._config.filter.result.grid.isRearrangement ? html`
                                    <genome-browser
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this._config.genomeBrowser.config}"
                                        .region="${this.variant}"
                                        .tracks="${this._config.genomeBrowser.tracks}"
                                        .active="${this.active && this.activeView === "genome-browser"}">
                                    </genome-browser>
                                ` : html`
                                    <split-genome-browser
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${this._config.genomeBrowser.config}"
                                        .regions="${this.variant}"
                                        .tracks="${this._config.genomeBrowser.tracks}"
                                        .active="${this.active && this.activeView === "genome-browser"}">
                                    </split-genome-browser>
                                `}
                            </div>
                        ` : nothing}
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        let genomeBrowserTracks = [];
        const genomeBrowserConfig = {
            cellBaseClient: this.opencgaSession?.cellbaseClient,
            featuresOfInterest: [],
        };

        // Check for opencgaSession and clinicalAnalysis defined
        if (this.opencgaSession && this.clinicalAnalysis) {
            genomeBrowserTracks = [
                {
                    type: "gene-overview",
                    overview: true,
                    config: {},
                },
                {
                    type: "sequence",
                    config: {},
                },
                {
                    type: "gene",
                    config: {},
                },
                {
                    type: "opencga-variant",
                    config: {
                        title: "Variants",
                        query: {
                            sample: this.clinicalAnalysis.proband.samples.map(s => s.id).join(","),
                        },
                    },
                },
                ...(this.clinicalAnalysis.proband?.samples || []).map(sample => ({
                    type: "opencga-alignment",
                    config: {
                        title: `Alignments - ${sample.id}`,
                        sample: sample.id,
                    },
                })),
            ];

            // Add interpretation panels to features of interest
            if (this.clinicalAnalysis?.interpretation?.panels?.length > 0) {
                genomeBrowserConfig.featuresOfInterest.push({
                    name: "Panels of the interpretation",
                    category: true,
                });

                const colors = ["green", "blue", "darkorange", "blueviolet", "sienna", "indigo", "salmon"];
                const assembly = this.opencgaSession.project.organism?.assembly;
                this.clinicalAnalysis.interpretation.panels.forEach((panel, index) => {
                    genomeBrowserConfig.featuresOfInterest.push({
                        name: panel.name,
                        features: panel.genes
                            .filter(gene => gene?.coordinates?.some(c => c.assembly === assembly))
                            .map(gene => {
                                const coordinates = gene?.coordinates?.find(c => c.assembly === assembly);
                                const region = new Region(coordinates.location);
                                return {
                                    chromosome: region.chromosome,
                                    start: region.start,
                                    end: region.end,
                                    name: `
                                        <div>${gene.name}</div>
                                        <div class="small text-secondary">${region.toString()}</div>
                                    `,
                                };
                            })
                            .sort((a, b) => a.name < b.name ? -1 : +1),
                        display: {
                            visible: true,
                            color: colors[index % colors.length],
                        },
                    });
                });
            }

            if (this.clinicalAnalysis.interpretation?.primaryFindings?.length > 0) {
                if (genomeBrowserConfig.featuresOfInterest.length > 0) {
                    genomeBrowserConfig.featuresOfInterest.push({separator: true});
                }
                genomeBrowserConfig.featuresOfInterest.push({
                    name: "Variants",
                    category: true,
                });
                genomeBrowserConfig.featuresOfInterest.push({
                    name: "Primary Findings",
                    features: this.clinicalAnalysis.interpretation.primaryFindings.map(feature => {
                        const genes = Array.from(new Set(feature.annotation.consequenceTypes.filter(ct => !!ct.geneName).map(ct => ct.geneName)));
                        return {
                            id: feature.id,
                            chromosome: feature.chromosome,
                            start: feature.start,
                            end: feature.end ?? (feature.start + 1),
                            name: `
                                <div class="py-1">
                                    <div>${feature.id} (${feature.type})</div>
                                    ${feature.annotation.displayConsequenceType ? `
                                        <div class="small text-primary">
                                            <strong>${feature.annotation.displayConsequenceType}</strong>
                                        </div>
                                    ` : ""}
                                    ${genes.length > 0 ? `
                                        <div class="small text-secondary">${genes.join(", ")}</div>
                                    ` : ""}
                                </div>
                            `,
                        };
                    }),
                    display: {
                        visible: true,
                        color: "red",
                    },
                });
            }
        }

        return {
            genomeBrowser: {
                config: genomeBrowserConfig,
                tracks: genomeBrowserTracks,
            },
        };
    }

}

customElements.define("variant-interpreter-browser-template", VariantInterpreterBrowserTemplate);
