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
import UtilsNew from "../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";


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
            panelId: {
                type: String    // Comma-separated list of panel IDs
            },
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.panelId = [];
        this.genes = [];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("panel") ) {
        }

        if (changedProperties.has("diseasePanels") ) {
            this.genes = this.diseasePanels?.[0]?.genes ?? [];
            this.requestUpdate();
        }
    }

    panelChange(e) {
        e.stopPropagation();
        if (e.detail?.value) {
            this.genes = this.diseasePanels.find(diseasePanel => diseasePanel.id === e.detail.value)?.genes ?? [];
            this.requestUpdate();
        }
    }

    filterChange(e) {
        this.panelId = e.detail.value;
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.detail.value
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            showSummary: true
        };
    }

    render() {
        // Sort disease panels alphabetically
        this.diseasePanels.sort( (a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        // Prepare disease panels for the select-filed-filter web component
        const selectOptions = this.diseasePanels.map(panel => ({
            id: panel.id,
            name: ` ${panel.name}
                    ${panel.source ? ` - ${panel.source.author} ${panel.source.project} ${panel.source.version ? "v" + panel.source.version : ""}` : ""}
                    ${panel.stats ? ` (${panel.stats.numberOfGenes} genes, ${panel.stats.numberOfRegions} regions)` : ""}`
        }));

        if (this.mode === "gene") {
            return html`
                <div class="row">
                    <div class="col-md-4">
                        <select-field-filter    .liveSearch=${true} 
                                                .data="${selectOptions}" 
                                                .value=${this.panelId} 
                                                @filterChange="${this.panelChange}">
                        </select-field-filter>
                    </div>
                    <div class="col-md-4">
                        <select-field-filter    .liveSearch=${true} 
                                                .data="${this.genes.map(gene => ({id: gene.name, name: `${gene.name} (${gene.id})`}))}" 
                                                @filterChange="${this.filterChange}">
                        </select-field-filter>
                    </div>
                </div>
            `;
        } else {
            return html`
                <div>
                    <select-field-filter    multiple 
                                            .liveSearch=${true} 
                                            .data="${selectOptions}" 
                                            .value=${this.panelId} 
                                            @filterChange="${this.filterChange}">
                    </select-field-filter>
                    
                    ${this._config.showSummary && this.panelId
                        ? html`
                            <div class="selection-list">
                                <ul>
                                    ${this.panelId.split(",").map(panel => {
                                        const p = this.diseasePanels.find(p => p.id === panel);
                                        return html`
                                            <li>
                                                <span class="badge break-spaces">
                                                    <a href="https://panelapp.genomicsengland.co.uk/panels/${p.source.id}" target="_blank">${p.name} <i class="fas fa-external-link-alt"></i></a>
                                                </span>
                                            </li>`;
                                    })}
                                </ul>
                            </div>
                            `
                        : null
                    }
                </div>
            `;
        }
    }

}

customElements.define("disease-panel-filter", DiseasePanelFilter);
