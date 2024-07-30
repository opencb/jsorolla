/*
 * Copyright 2015-2024 OpenCB
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

import {LitElement, html, nothing} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/select-field-filter.js";
import "../forms/toggle-switch.js";
import "../forms/toggle-radio.js";

/**
 * This class ....
 * Implementation notes:
 *  1. diseasePanels is DEPRECATED
 *  2. ...
 *
 * Usage:
 * <disease-panel-filter
.diseasePanels="${this.opencgaSession.study.panels}"
.panel="${this.preparedQuery.panel}"
.panelModeOfInheritance="${this.preparedQuery.panelModeOfInheritance}"
.panelConfidence="${this.preparedQuery.panelConfidence}"
.panelRoleInCancer="${this.preparedQuery.panelRoleInCancer}"
@filterChange="${e => this.onFilterChange({
                                panel: "panel",
                                panelFeatureType: "panelFeatureType",
                                panelModeOfInheritance: "panelModeOfInheritance",
                                panelConfidence: "panelConfidence",
                                panelRoleInCancer: "panelRoleInCancer"
                            }, e.detail)}">
</disease-panel-filter>
 */
export default class DiseasePanelFilter extends LitElement {

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
            diseasePanels: {
                type: Array
            },
            // Comma-separated list of selected panels
            panel: {
                type: String
            },
            panelFeatureType: {
                type: String
            },
            panelModeOfInheritance: {
                type: String
            },
            panelConfidence: {
                type: String
            },
            panelRoleInCancer: {
                type: String
            },
            panelIntersection: {
                type: Boolean,
            },
            multiple: {
                type: Boolean
            },
            classes: {
                type: String
            },
            disabled: {
                type: Boolean
            },
            showExtendedFilters: {
                type: Boolean
            },
            showSelectedPanels: {
                type: Boolean
            },
        };
    }

    _init() {
        this.query = {};
        this.genes = [];
        // this.panelFeatureType = "";
        // this.panelModeOfInheritance = "";
        // this.panelConfidence = "";
        // this.panelRoleInCancer = "";

        this.multiple = true;
        this.disabled = false;
        this.showExtendedFilters = true;
        this.showSelectedPanels = true;

        this.panelFeatureTypes = [
            {id: "region", name: "Region"},
            {id: "gene", name: "Gene"},
        ];
    }

    update(changedProperties) {
        if (changedProperties.has("diseasePanels")) {
            this.diseasePanelsObserver();
        }
        if (changedProperties.has("panel")) {
            this.query.panel = this.panel;
            this.panelObserver();
        }
        if (changedProperties.has("panelIntersection")) {
            this.query.panelIntersection = this.panelIntersection;
        }
        if (changedProperties.has("panelFeatureType")) {
            this.query.panelFeatureType = this.panelFeatureType;
        }
        if (changedProperties.has("panelModeOfInheritance")) {
            this.query.panelModeOfInheritance = this.panelModeOfInheritance;
        }
        if (changedProperties.has("panelConfidence")) {
            this.query.panelConfidence = this.panelConfidence;
        }
        if (changedProperties.has("panelRoleInCancer")) {
            this.query.panelRoleInCancer = this.panelRoleInCancer;
        }
        super.update(changedProperties);
    }

    diseasePanelsObserver() {
        // Sort disease panels alphabetically
        this.diseasePanels.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        this.diseasePanelsSelectOptions = this.diseasePanels.map(panel => ({
            id: panel.id,
            name: `${panel.name}
                ${panel.source ? ` - ${panel.source.author || ""} ${panel.source.project} ${panel.source.version ? "v" + panel.source.version : ""}` : ""}
                ${panel.stats ? ` (${panel.stats.numberOfGenes} genes, ${panel.stats.numberOfRegions} regions)` : ""}`
        }));
    }

    // Updates the gene list for the gene select
    panelObserver(panel) {
        this.genes = [];
        const _panel = panel ?? this.panel;
        if (_panel) {
            const panelIds = _panel.split(",");
            for (const panelId of panelIds) {
                const dp = this.diseasePanels.find(diseasePanel => diseasePanel.id === panelId);
                if (dp) {
                    this.genes = this.genes.concat(dp.genes);
                }
            }
        }

        this.requestUpdate();
    }

    filterChange(e, field) {
        e.stopPropagation();

        // If panel changes we must be called to panelObserver
        if (field === "panel") {
            this.panel = e.detail.value;
            this.panelObserver();
        }

        // Set values in the query object
        if (e.detail.value) {
            this.query[field] = e.detail.value;
        } else {
            // If the value is empty we delete the filter, empty filters are not allowed
            delete this.query[field];
        }

        LitUtils.dispatchCustomEvent(this, "filterChange", this.query?.panel, {query: this.query});
    }

    render() {
        return html`
            <!-- Only show the title when all filters are displayed -->
            <div class="mb-3">
                <div class="mb-2">
                    ${this.showExtendedFilters ? html`
                        <label class="form-label">
                            Select Disease Panels
                        </label>
                    ` : nothing
                    }
                    <select-field-filter
                        .data="${this.diseasePanelsSelectOptions}"
                        .value=${this.panel}
                        .classes="${this.classes}"
                        .config="${{
                            multiple: this.multiple,
                            separator: "\n"
                        }}"
                        @filterChange="${e => this.filterChange(e, "panel")}">
                    </select-field-filter>
                </div>

            ${this.showSelectedPanels && this.panel?.length > 0 ? html`
                <div class="text-secondary small" style="padding: 0 0 0 5px">
                    Selected panels:
                    ${this.panel.split(",").map(p => html`
                        <div style="padding: 0 0 0 10px; font-style: italic">${p}</div>
                    `)}
                </div>
            ` : nothing
            }

            ${this.showExtendedFilters ? html`
                <div class="mb-2">
                    <label class="form-label">
                        Panel Intersection
                    </label>
                    <div class="row">
                        <toggle-radio
                            .value="${this.panelIntersection || false}"
                            .disabled="${this.disabled || false}"
                            @filterChange="${e => this.filterChange(e, "panelIntersection")}">
                        </toggle-radio>
                    </div>
                    <div class="form-text">
                        Executes an intersection between the panels and the region and gene filters.
                    </div>
                </div>

                <div class="mb-2">
                    <label class="form-label">
                        Filter by Feature Type
                    </label>
                    <select-field-filter
                        .data="${this.panelFeatureTypes}"
                        .value=${this.panelFeatureType}
                        .config=${{
                            multiple: true,
                            disabled: this.genes?.length === 0 || this.disabled
                            }}
                        @filterChange="${e => this.filterChange(e, "panelFeatureType")}">
                    </select-field-filter>
                </div>

                <div class="mb-2">
                    <label class="form-label">
                        Filter Genes by Mode of Inheritance
                    </label>
                    <select-field-filter
                        .data="${MODE_OF_INHERITANCE}"
                        .value=${this.panelModeOfInheritance}
                        .config=${{
                            multiple: true,
                            disabled: this.genes?.length === 0 || this.disabled
                        }}
                        @filterChange="${e => this.filterChange(e, "panelModeOfInheritance")}">
                    </select-field-filter>
                </div>

                <div class="mb-2">
                    <label class="form-label">
                        Filter Genes by Confidence
                    </label>
                    <select-field-filter
                        .data="${DISEASE_PANEL_CONFIDENCE}"
                        .value=${this.panelConfidence}
                        .config=${{
                            multiple: true,
                            disabled: this.genes?.length === 0 || this.disabled
                        }}
                        @filterChange="${e => this.filterChange(e, "panelConfidence")}">
                    </select-field-filter>
                </div>

                <div class="mb-2">
                    <label class="form-label">
                        Filter Genes by Role in Cancer
                    </label>
                    <select-field-filter
                        .data="${ROLE_IN_CANCER}"
                        .value=${this.panelRoleInCancer}
                        .config=${{
                            multiple: true,
                            disabled: this.genes?.length === 0 || this.disabled
                        }}
                        @filterChange="${e => this.filterChange(e, "panelRoleInCancer")}">
                    </select-field-filter>
                </div>
            ` : nothing}
        </div>
        `;
    }

}

customElements.define("disease-panel-filter", DiseasePanelFilter);
