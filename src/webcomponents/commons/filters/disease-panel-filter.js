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
import "../forms/select-field-filter.js";
import "../forms/toggle-switch.js";

/**
 * This class ....
 * Implementation notes:
 *  1. diseasePanels is DEPRECATED
 *  2. ...
 *
 * Usage:
 * <disease-panel-filter    .opencgaSession="${this.opencgaSession}"
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
            opencgaSession: {
                type: Object
            },
            diseasePanels: {
                type: Array
            },
            // Comma-separated list of selected panels
            panel: {
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
            panelIntersect: {
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
        };
    }

    _init() {
        this.query = {};
        this.genes = [];

        this.multiple = true;
        this.disabled = false;
        this.showExtendedFilters = true;
    }

    update(changedProperties) {
        if (changedProperties.has("diseasePanels")) {
            this.diseasePanelsObserver();
        }
        if (changedProperties.has("panel")) {
            this.query.panel = this.panel;
            this.panelObserver();
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
        if (changedProperties.has("panelIntersect")) {
            this.query.panelIntersect = this.panelIntersect;
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

        // If panel changes we must called to panelObserver
        if (field === "panel") {
            this.panelObserver(e.detail.value);
        }

        // Set values in the query object
        if (e.detail.value) {
            this.query[field] = e.detail.value;
        } else {
            // If the value is empty we delete the filter, empty filters are not allowed
            delete this.query[field];
        }

        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.query?.panel,
                query: this.query
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div>
                <div>
                    <!-- Only show the title when all filters are displayed -->
                    ${this.showExtendedFilters ? html`
                        <span>Select Disease Panels</span>
                    ` : null}

                    <div style="padding: 2px 0px">
                        <select-field-filter
                            .data="${this.diseasePanelsSelectOptions}"
                            .value=${this.panel}
                            .liveSearch=${this.diseasePanelsSelectOptions?.length > 5}
                            .multiple="${this.multiple}"
                            .classes="${this.classes}"
                            .disabled="${this.disabled}"
                            @filterChange="${e => this.filterChange(e, "panel")}">
                        </select-field-filter>
                    </div>
                </div>

                ${this.showExtendedFilters ? html`
                    <div style="margin: 15px 0px">
                        <span>Panel Intersect</span>
                        <div style="padding: 2px 0px">
                            <toggle-switch
                                .value="${this.panelIntersect || false}"
                                .disabled="${this.disabled}"
                                @filterChange="${e => this.filterChange(e, "panelIntersect")}">
                            </toggle-switch>
                        </div>
                    </div>

                    <div style="margin: 15px 0px">
                        <span>Filter Genes by Mode of Inheritance</span>
                        <div style="padding: 2px 0px">
                            <select-field-filter
                                .data="${MODE_OF_INHERITANCE}"
                                .value=${this.panelModeOfInheritance}
                                .multiple="${true}"
                                .disabled="${this.genes?.length === 0 || this.disabled}"
                                @filterChange="${e => this.filterChange(e, "panelModeOfInheritance")}">
                            </select-field-filter>
                        </div>
                    </div>

                    <div style="margin: 15px 0px">
                        <span>Filter Genes by Confidence</span>
                        <div style="padding: 2px 0px">
                            <select-field-filter
                                .data="${DISEASE_PANEL_CONFIDENCE}"
                                .value=${this.panelConfidence}
                                .multiple="${true}"
                                .disabled="${this.genes?.length === 0 || this.disabled}"
                                @filterChange="${e => this.filterChange(e, "panelConfidence")}">
                            </select-field-filter>
                        </div>
                    </div>

                    <div style="margin: 15px 0px">
                        <span>Filter Genes by Role in Cancer</span>
                        <div style="padding: 2px 0px">
                            <select-field-filter
                                .data="${ROLE_IN_CANCER}"
                                .value=${this.panelRoleInCancer}
                                .multiple="${true}"
                                .disabled="${this.genes?.length === 0 || this.disabled}"
                                @filterChange="${e => this.filterChange(e, "panelRoleInCancer")}">
                            </select-field-filter>
                        </div>
                    </div>
                ` : null}
            </div>
        `;
    }

}

customElements.define("disease-panel-filter", DiseasePanelFilter);
