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

import {LitElement, html} from '/web_modules/lit-element.js';

//TODO proper functionality check
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
            // },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "ff-" + Utils.randomString(6) + "_";
    }

    firstUpdated(_changedProperties) {
        if (this.query && this.query.panel) {
            $(`select#${this._prefix}DiseasePanels`).selectpicker("val", this.query.panel.split(","));
            this.showPanelGenes(this.query.panel.split(","));
        }
        $(`select#${this._prefix}DiseasePanels`).selectpicker("render");
        $(`select#${this._prefix}DiseasePanels`).selectpicker({
            iconBase: "fa",
            tickIcon: "fa-check"
        });

    }

    //TODO urgent refactor
    showPanelGenes(panels) {
        PolymerUtils.getElementById(this._prefix + "DiseasePanelsTextarea").value = "";
        if (UtilsNew.isNotEmptyArray(panels)) {
            let _this = this;
            this.opencgaSession.opencgaClient.panels()
                .info(panels.join(","), {
                    study: _this.opencgaSession.study.fqn,
                    include: "id,name,genes.id,genes.name,regions.id"
                }, {})
                .then(function (response) {
                    let text = "";
                    for (let panelResponse of response.response) {
                        let panel = panelResponse.result[0];
                        let geneNames = panel.genes.map(gene => gene.name);
                        let regions = panel.regions.map(region => region.id);
                        text += `${panel.name} (${geneNames.length} genes and ${regions.length} regions): ${geneNames.join(",")} \n`;
                        text += `${geneNames.join(",")} \n`;
                        text += `${regions.join(",")} \n\n`;
                    }
                    PolymerUtils.getElementById(_this._prefix + "DiseasePanelsTextarea").value = text;
                })
                .catch(function (response) {
                    console.error(response);
                });
        }
    }

    filterChange(e) {
        //console.log("disease-filter", e);
        let panelId = "";
        let panelObjects = [];
        let panelsDropdown = this.querySelector("#" + this._prefix + "DiseasePanels");
        if (UtilsNew.isNotUndefinedOrNull(panelsDropdown)) {
            let selectedPanels = panelsDropdown.querySelectorAll("option:checked");
            selectedPanels.forEach(option => panelObjects.push(option.value));
            if (panelObjects.length > 0) {
                panelId = panelObjects.join(",");
                this.showPanelGenes(panelObjects);
            }
        }
        let event = new CustomEvent("filterChange", {
            detail: {
                value: panelId,
                //value: panelObjects,
                //toString: panelId
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div>
                <select id="${this._prefix}DiseasePanels" class="selectpicker" data-size="10" data-live-search="true" data-selected-text-format="count" multiple @change="${e => this.filterChange(e)}">
                    ${this.opencgaSession.study.panels && this.opencgaSession.study.panels.length && this.opencgaSession.study.panels.map(panel => html`
                        <option value="${panel.id}">
                            ${panel.name} 
                            ${panel.source ? "v" + panel.source.version : ""} 
                            ( ${panel.stats ? panel.stats.numberOfGenes + "genes, " + panel.stats.numberOfRegions + "regions" : "0 genes, 0 regions"})
                        </option>
                    `)}
                </select>
                <textarea id="${this._prefix}DiseasePanelsTextarea" class="form-control" rows="4" style="margin-top: 5px;background: #f7f7f7" disabled> </textarea>
            </div>
        `;
    }
}

customElements.define('disease-filter', DiseaseFilter);
