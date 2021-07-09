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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.query = {};
        this.genes = [];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
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
            name: ` ${panel.name}
                    ${panel.source ? ` - ${panel.source.author} ${panel.source.project} ${panel.source.version ? "v" + panel.source.version : ""}` : ""}
                    ${panel.stats ? ` (${panel.stats.numberOfGenes} genes, ${panel.stats.numberOfRegions} regions)` : ""}`
        }));
    }

    // Updates the gene list for the gene select
    panelObserver(panel) {
        const _panel = panel ?? this.panel;
        if (this._config.showGeneFilter && _panel) {
            this.genes = [];
            const panels = _panel.split(",");
            for (const panel of panels) {
                const dp = this.diseasePanels.find(diseasePanel => diseasePanel.id === panel);
                if (dp) {
                    this.genes = this.genes.concat(dp.genes);
                }
            }
            this.requestUpdate();
        }
    }

    filterChange(e, field) {
        e.stopPropagation();

        // If panel changes wwe must called to panelObserver
        if (field === "panel") {
            this.panelObserver(e.detail.value);
        }

        this.query[field] = e.detail.value;
        const event = new CustomEvent("filterChange", {
            detail: this.query
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            showSummary: true,
            showGeneFilter: true,
            showPanelFilter: true
        };
    }

    render() {
        return html`
            <div>
                <div style="margin: 10px 0px">
                    <span>Select Disease Panels</span>
                    <div style="padding: 2px 0px">
                        <select-field-filter    multiple
                                                .liveSearch=${true}
                                                .data="${this.diseasePanelsSelectOptions}"
                                                .value=${this.panel}
                                                @filterChange="${e => this.filterChange(e, "panel")}">
                        </select-field-filter>
                    </div>
                </div>

                ${this._config.showGeneFilter ? html`
                    <div style="margin: 15px 0px">
                        <span>Select Genes</span>
                        <div style="padding: 2px 0px">
                            <select-field-filter    .liveSearch=${true}
                                                    .data="${this.genes.map(gene => ({id: gene.name, name: `${gene.name} (${gene.id})`}))}"
                                                    @filterChange="${e => this.filterChange(e, "panelGene")}">
                            </select-field-filter>
                        </div>
                    </div>` : null
                }

                ${this._config.showPanelFilter ? html`
                    <div style="margin: 15px 0px">
                        <span>Filter Genes by Mode of Inheritance</span>
                        <div style="padding: 2px 0px">
                            <select-field-filter    multiple
                                                    .data="${MODE_OF_INHERITANCE}"
                                                    .value=${this.panelModeOfInheritance}
                                                    @filterChange="${e => this.filterChange(e, "panelModeOfInheritance")}">
                            </select-field-filter>
                        </div>
                    </div>

                    <div style="margin: 15px 0px">
                        <span>Filter Genes by Confidence</span>
                        <div style="padding: 2px 0px">
                            <select-field-filter    multiple
                                                    .data="${DISEASE_PANEL_CONFIDENCE}"
                                                    .value=${this.panelConfidence}
                                                    @filterChange="${e => this.filterChange(e, "panelConfidence")}">
                            </select-field-filter>
                        </div>
                    </div>

                    <div style="margin: 15px 0px">
                        <span>Filter Genes by Role in Cancer</span>
                        <div style="padding: 2px 0px">
                            <select-field-filter    multiple
                                                    .data="${ROLE_IN_CANCER}"
                                                    .value=${this.panelRoleInCancer}
                                                    @filterChange="${e => this.filterChange(e, "panelRoleInCancer")}">
                            </select-field-filter>
                        </div>
                    </div>` : null
                }

                ${this._config.showSummary && this.panel ? html`
                    <div class="selection-list">
                        <ul>
                            ${this.panel.split(",").map(panel => {
                                const p = this.diseasePanels.find(p => p.id === panel);
                                return html`
                                    <li>
                                        <span class="badge break-spaces"><a href="https://panelapp.genomicsengland.co.uk/panels/${p.source.id}" target="_blank">${p.name} <i class="fas fa-external-link-alt"></i></a></span>
                                    </li>`;
                            })}
                        </ul>
                    </div>` : null
                }
            </div>
        `;
    }

}

customElements.define("disease-panel-filter", DiseasePanelFilter);
