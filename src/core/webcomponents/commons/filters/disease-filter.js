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

// TODO proper functionality check
export default class DiseaseFilter extends LitElement {

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
            // panels: {
            //     type: Array
            diseasePanels: {
                type: Array
            },
            // },
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ff-" + UtilsNew.randomString(6) + "_";
        this._panel = [];
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        $(`select#${this._prefix}DiseasePanels`).selectpicker("render");
        $(`select#${this._prefix}DiseasePanels`).selectpicker({
            iconBase: "fa",
            tickIcon: "fa-check"
        });

        if (this.mode === "gene") {
            $(`select#${this._prefix}Genes`).selectpicker("render");
            $(`select#${this._prefix}Genes`).selectpicker({
                iconBase: "fa",
                tickIcon: "fa-check"
            });
        }
    }

    updated(changedProperties) {
        if (changedProperties.has("diseasePanels")) {
            // if (this.diseasePanels) {
            //     this._panel = this.panel.split(",");
            // } else {
            //     this._panel = [];
            // }
            // $(`select#${this._prefix}DiseasePanels`).selectpicker("val", this._panel);
            // this.showPanelGenes(this._panel);
            if (this.diseasePanels) {
                this.genes = this.diseasePanels && this.diseasePanels.genes ? this.diseasePanels.genes : ["AA"];
                this.requestUpdate();
            }
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    showPanelGenes(panels) {
        PolymerUtils.getElementById(this._prefix + "DiseasePanelsTextarea").value = "";
        const _this = this;

        if (panels && panels.length) {
            this.opencgaSession.opencgaClient.panels()
                .info(panels.join(","), {
                    study: _this.opencgaSession.study.fqn,
                    include: "id,name,stats,genes.id,genes.name,regions.id"
                })
                .then(function(response) {
                    let text = "";
                    for (const panelResponse of response.response) {
                        const panel = panelResponse.result[0];
                        const geneNames = panel.genes.map(gene => gene.name);
                        const regions = panel.regions.map(region => region.id);
                        text += `${panel.name} (${geneNames.length} genes and ${regions.length} regions): ${geneNames.join(",")} \n`;
                        text += `${geneNames.join(",")} \n`;
                        text += `${regions.join(",")} \n\n`;
                    }
                    PolymerUtils.getElementById(_this._prefix + "DiseasePanelsTextarea").value = text;
                })
                .catch(function(response) {
                    console.error(response);
                });
        } else {
            PolymerUtils.getElementById(_this._prefix + "DiseasePanelsTextarea").value = "";
        }
    }

    filterChange(e) {
        const select_vals = $("#" + this._prefix + "DiseasePanels").val() || [];
        if (this.mode === "gene") {
            for (const diseasePanel of this.diseasePanels) {
                if (diseasePanel.id === select_vals) {
                    this.genes = diseasePanel.genes ? diseasePanel.genes : ["BB"];
                    break;
                }
            }
            // let genes = this.genes.map(gene => gene.name);
            // $(`select#${this._prefix}Genes`).selectpicker('val', genes);
            this.requestUpdate();
            $(`select#${this._prefix}Genes`).selectpicker("refresh");
        } else {
            // const select_vals = $("#" + this._prefix + "DiseasePanels").val() || [];
            const value = select_vals && select_vals.length ? select_vals.join(",") : null;
            // this.showPanelGenes(select_vals);
            const event = new CustomEvent("filterChange", {
                detail: {
                    value: value
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
    }

    getDefaultConfig() {
        return {
            showSummary: false,
        };
    }

    render() {
        // this.opencgaSession.study.panels;
        // debugger
        if (this.mode !== "gene") {
            return html`
                <div>
                    <select id="${this._prefix}DiseasePanels" class="selectpicker" data-size="10" data-live-search="true" data-selected-text-format="count" multiple @change="${e => this.filterChange(e)}">
                        ${this.diseasePanels && this.diseasePanels.length && this.diseasePanels.map(panel => html`
                            <option value="${panel.id}">
                                ${panel.name}
                                ${panel.source ? "v" + panel.source.version : ""}
                                ${panel.stats ? ` (${panel.stats.numberOfGenes} genes, ${panel.stats.numberOfRegions} regions)` : ""}
                            </option>
                        `)}
                    </select>
                    
                    ${this._config.showSummary
                        ? html`
                            <textarea id="${this._prefix}DiseasePanelsTextarea" class="form-control" rows="4" style="margin-top: 5px;background: #f7f7f7" disabled> </textarea>`
                        : null
                    }
                </div>
        `;
        } else {
            return html`
                <div>
                    <select id="${this._prefix}DiseasePanels" class="selectpicker" data-size="10" data-live-search="true" @change="${e => this.filterChange(e)}">
                        ${this.diseasePanels && this.diseasePanels.length && this.diseasePanels.map(panel => html`
                            <option value="${panel.id}">
                                ${panel.name}
                                ${panel.source ? "v" + panel.source.version : ""}
                                ${panel.stats ? ` (${panel.stats.numberOfGenes} genes, ${panel.stats.numberOfRegions} regions)` : ""}
                            </option>
                        `)}
                    </select>
                 
                    <select id="${this._prefix}Genes" class="selectpicker" data-size="10" data-live-search="true" @change="${e => this.filterChange(e)}">
                        ${this.genes && this.genes.length && this.genes.map(gene => html`
                            <option value="${gene.name}">
                                ${gene.name} (${gene.id})
                            </option>
                        `)}
                    </select>
                </div>
            `;
        }

        // return html`
        //     <div>
        //         <select id="${this._prefix}DiseasePanels" class="selectpicker" data-size="10" data-live-search="true" data-selected-text-format="count" multiple @change="${e => this.filterChange(e)}">
        //             ${this.diseasePanels && this.diseasePanels.length && this.diseasePanels.map(panel => html`
        //                 <option value="${panel.id}">
        //                     ${panel.name}
        //                     ${panel.source ? "v" + panel.source.version : ""}
        //                     ${panel.stats ? `${panel.stats.numberOfGenes} genes, ${panel.stats.numberOfRegions} regions` : ""}
        //                 </option>
        //             `)}
        //         </select>
        //
        //         ${this.mode === "gene"
        //             ? html`
        //                 <select id="${this._prefix}Genes" class="selectpicker" data-size="10" data-live-search="true" @change="${e => this.filterChange(e)}">
        //                     ${this.genes && this.genes.length && this.genes.map(gene => html`
        //                         <option value="${gene.name}">
        //                             ${gene.name} (${gene.id})
        //                         </option>
        //                     `)}
        //                 </select>
        //             `
        //             : null
        //         }
        //
        //         ${this._config.showSummary
        //             ? html`
        //                 <textarea id="${this._prefix}DiseasePanelsTextarea" class="form-control" rows="4" style="margin-top: 5px;background: #f7f7f7" disabled> </textarea>`
        //             : null
        //         }
        //     </div>
        // `;
    }

}

customElements.define("disease-filter", DiseaseFilter);
