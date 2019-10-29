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

export default class ReactomeVariantNetwork extends LitElement {

    constructor() {
        super();
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
            reactomeClient: {
                type: Object
            },
            genes: {
                type: Array
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "ReactomeVariantNetwork-" + Utils.randomString(6) + "_";
        this.active = true;
    }
    static get observers() {
        return ['propertyObserver(opencgaSession, reactomeClient, genes, active, config)'];
    }

    updated(changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};

        if (this.active && UtilsNew.isNotEmptyArray(this.genes) && UtilsNew.isNotUndefinedOrNull(this.reactomeClient)
            && UtilsNew.isNotUndefinedOrNull(this.opencgaSession)) {

            // Get the position of the current selected element
            let position = $(`#${this._prefix}-geneSelect`)[0].selectedIndex;

            let gene = "";
            if (position + 1 > this.genes.length) {
                gene = this.genes[genes.length - 1];
            } else {
                gene = this.genes[position];
            }

            // So I can now have the new element
            this._fetchPathwaysForGene(gene);
        }

        /* prop specific observer
        if(changedProperties.has("opencgaSession")) {
        }
        if(changedProperties.has("reactomeClient")) {
        }
        if(changedProperties.has("genes")) {
        }
        if(changedProperties.has("active")) {
        }
        if(changedProperties.has("config")) {
        }*/
    }


    //TODO recheck if connectedCallback() works
    connectedCallback() {
        super.connectedCallback();

        // We add this first listener to get a call whenever the first element is loaded
        $(`#${this._prefix}-pathwaySelect`).on('loaded.bs.select', this.onPathwayChange.bind(this));
        $(`#${this._prefix}-geneSelect`).on('loaded.bs.select', this.onGeneChange.bind(this));
        // We add this listener to receive any future change over the selected pathways
        $(`#${this._prefix}-pathwaySelect`).on('changed.bs.select', this.onPathwayChange.bind(this));
        $(`#${this._prefix}-geneSelect`).on('changed.bs.select', this.onGeneChange.bind(this));
    }

    propertyObserver(opencgaSession, reactomeClient, genes, active, config) {
        this._config = Object.assign(this.getDefaultConfig(), config);


    }

    onGeneChange(e) {
        if (this.active) {
            this._fetchPathwaysForGene(e.currentTarget.value);
        }
    }

    onPathwayChange(e) {
        if (UtilsNew.isNotEmpty(e.currentTarget.value)) {
            this._fetchPathwayForDisplay(e.currentTarget.value);
        }
    }

    _fetchPathwayForDisplay(stableId) {
        if (typeof this._diagram === "undefined") {
            this._diagram = Reactome.Diagram.create({
                "placeHolder" : this._prefix + "-diagram",
                "width" : 1500,
                "height" : 500
            });
        }

        // Show selected diagram
        this._diagram.loadDiagram(stableId);

        let _this = this;
        this._diagram.onDiagramLoaded(function (loaded) {
            // We look for the stable ids where the gene is represented in the diagram
            let gene = $(`#${_this._prefix}-geneSelect`).selectpicker('val');
            _this._diagram.flagItems(gene);
        });

        // let _this = this;
        // this.reactomeClient.contentServiceClient().searchClient().diagram(stableId, gene)
        //     .then(function (response) {
        //         debugger
        //         for (let i = 0; i < response.entries.length; i++) {
        //             _this._diagram.highlightItem(response.entries[i].stId);
        //         }
        //     });
    }

    _fetchPathwaysForGene(gene) {
        let _this = this;

        // check species
        this.reactomeClient.contentServiceClient().mappingClient().pathways("ENSEMBL", gene,
            {species: 9606})
            .then(function (response) {
                let diagrammedPathways = [];
                for (let i = 0; i < response.length; i++) {
                    let pathway = response[i];
                    if (pathway.hasDiagram) {
                        diagrammedPathways.push(pathway);
                    }
                }
                _this.pathways = diagrammedPathways;

                // Show diagram div
                $(`#${_this._prefix}-diagram`).show();
                $(`#${_this._prefix}-not-available-diagram`).hide();

                _this._fetchPathwayForDisplay(diagrammedPathways[0].stId);
            })
            .catch(function (response) {
                console.log(response);
                _this.pathways = [];

                // Hide diagram div
                $(`#${_this._prefix}-diagram`).hide();
                $(`#${_this._prefix}-not-available-diagram`).show();
            });
    }

    renderDomRepeat(e) {
        $(`#${this._prefix}-geneSelect`).selectpicker('refresh');
        $(`#${this._prefix}-geneSelect`).selectpicker('deselectAll');
        $(`#${this._prefix}-pathwaySelect`).selectpicker('refresh');
        $(`#${this._prefix}-pathwaySelect`).selectpicker('deselectAll');
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        return html`
        <div class="row" style="margin: 15px">
            <div style="margin: 2px 2px">
                <label class="col-md-2">Gene:</label>
                <select class="selectpicker col-md-10" id="${this.prefix}-geneSelect" @change="${this.onGeneChange}" on-dom-change="renderDomRepeat">
                    ${this.genes && this.genes.length && this.genes.map( gene => html`
                        <option>${gene}</option>
                    `)}
                </select>
            </div>

            <div style="margin: 5px 2px">
                <label class="col-md-2">Pathway:</label>
                <select class="selectpicker col-md-10" id="${this.prefix}-pathwaySelect" @change="${this.onPathwayChange}" on-dom-change="renderDomRepeat">
                    ${this.pathways && this.pathways.length && this.pathways.map(pathway => html`
                        <option value=${pathway.stId}>${pathway.displayName}</option>
                    `)}
                </select>
            </div>

            <div id="${this.prefix}-diagram" class="col-md-10" style="width: 100%; height: 500px; margin-top: 10px;"></div>
            <div id="${this.prefix}-not-available-diagram" hidden=true>
                <h3 style="text-align: center; padding-top: 20px;">Pathway not available</h3>
            </div>
        </div>
        `;
    }
}
customElements.define("reactome-variant-network", ReactomeVariantNetwork);
