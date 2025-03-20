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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/view/detail-tabs.js";
import "../variant/variant-browser-grid.js";
import "../variant/variant-protein-view.js";
import "../visualization/protein-lollipop.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import ProteinLollipopViz from "../../core/visualisation/protein-lollipop.js";

export default class OpencgaGeneView extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            geneId: {
                type: String
            },
            populationFrequencies: {
                type: Array
            },
            proteinSubstitutionScores: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            variant: {
                type: String
            },
            settings: {
                type: Object
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._gene = null;
        this._selectedConsequenceType = "all";
        this._query = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("geneId")) {
            this.geneIdObserver();
        }

        if (changedProperties.has("settings")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.settings,
            };
        }

        super.update(changedProperties);
    }

    updated() {
        UtilsNew.initTooltip(this);
    }

    geneIdObserver() {
        if (this.opencgaSession && this.geneId) {
            this._selectedConsequenceType = "all";
            this._query = {
                gene: this.geneId,
                study: this.opencgaSession.study.fqn,
            };
            this.cellbaseClient.getGeneClient(this.geneId, "info", {
                exclude: "annotation",
                assembly: this.opencgaSession.project.organism.assembly,
            })
                .then(response => {
                    this._gene = response?.responses?.[0]?.results?.[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    updateQuery(value) {
        switch (value) {
            case "missense":
                this._query.ct = "missense_variant";
                break;
            case "lof":
                this._query.ct = this.consequenceTypes.alias
                    .find(alias => alias.name === "Loss-of-Function (LoF)")
                    .terms.join(",");
                break;
            default:
                delete this._query.ct;
                break;
        }

        this._gene = {...this._gene}; // Terrible hack to force detail-tabs to update tabs content
        this._selectedConsequenceType = value; // to update the active button
        this.requestUpdate();
    }

    transcriptTooltip(transcript) {
        const transcriptUrl = `#transcript/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${transcript.id}`;
        const ensemblUrl = BioinfoUtils.getEnsemblLink(this._gene.name, "TRANSCRIPT", this.opencgaSession.project.organism.assembly);

        return `
            <div style='padding: 5px'>
                <a href='${transcriptUrl}'>Transcript View</a>
            </div>
            <div style='padding: 5px'>
                <a target='_blank' href='${ensemblUrl}'>Ensembl</a>
            </div>
        `;
    }

    renderRightContent() {
        return html`
            <a href="#research/variant-browser" class="btn btn-light">
                <i class="fas fa-dna me-1"></i> Variant Browser
            </a>
        `;
    }

    render() {
        if (!this.geneId || !this.opencgaSession) {
            return html`
                <div class="container-fluid" style="margin-top:32px;">
                    <div class="row">
                        <div class="col-md-10 offset-md-1">
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-triangle me-2"></i> No gene provided.
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (!this._gene) {
            return nothing;
        }

        return html`
            <tool-header
                .title="${`Gene ${this._gene.name}`}"
                .rightContent="${this.renderRightContent()}">
            </tool-header>

            <div class="container-fluid">
                <div class="row mb-5">
                    <div class="col-md-4">
                        <h3 class="section-title">Summary</h3>
                        <table class="table">
                            <tr>
                                <th class="gene-summary-title col-sm-4">Name</th>
                                <td>${this._gene.name} (${this._gene.id})</td>
                            </tr>
                            <tr>
                                <th class="gene-summary-title col-sm-4">Biotype</th>
                                <td>${this._gene.biotype || "-"}</td>
                            </tr>
                            <tr>
                                <th class="gene-summary-title col-sm-4">Description</th>
                                <td>${this._gene.description || "-"}</td>
                            </tr>
                            <tr>
                                <th class="gene-summary-title col-sm-4">Location</th>
                                <td>${this._gene.chromosome}:${this._gene.start}-${this._gene.end} (${this._gene.strand})</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-8">
                        <h3 class="section-title">Transcripts</h3>
                        <table class="table table-bordered table-striped" width="100%">
                            <thead>
                                <tr>
                                    <th>Ensembl ID</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Biotype</th>
                                    <th>Flags</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(this._gene?.transcripts || []).map(transcript => html`
                                    <tr>
                                        <td>
                                            <a class="text-primary" tooltip-title="Transcript" tooltip-text="${this.transcriptTooltip(transcript)}">
                                                ${transcript.id}
                                            </a>
                                        </td>
                                        <td>${transcript.name}</td>
                                        <td>
                                            <span>${transcript.chromosome}:${transcript.start}-${transcript.end}</span>
                                        </td>
                                        <td>${transcript.biotype}</td>
                                        <td>${transcript.annotationFlags?.join(", ") || "-"}</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <detail-tabs
                    .opencgaSession="${this.opencgaSession}"
                    .data="${this._gene}"
                    .config="${this._config?.tabs || []}">
                </detail-tabs>
            </div>
        `;
    }

    getDefaultConfig() {
        const availableConsequenceTypesButtons = [
            {name: "All", value: "all"},
            {name: "Missense", value: "missense"},
            {name: "LoF", value: "lof"},
        ];

        const proteinLollipopTracks = [
            {
                title: "Clinvar",
                type: ProteinLollipopViz.TRACK_TYPES.CELLBASE_VARIANTS,
                tooltip: ProteinLollipopViz.clinvarTooltipFormatter,
                tooltipWidth: "360px",
                query: {
                    source: "clinvar",
                },
            },
            {
                title: "Cosmic",
                type: ProteinLollipopViz.TRACK_TYPES.CELLBASE_VARIANTS,
                tooltip: ProteinLollipopViz.cosmicTooltipFormatter,
                tooltipWidth: "280px",
                query: {
                    source: "cosmic",
                },
            },
        ];

        return {
            externalLinks: false,
            tabs: {
                title: "",
                items: [
                    {
                        id: "variants",
                        name: "Variants",
                        active: true,
                        render: (gene, active, opencgaSession) => html`
                            <div class="btn-group mb-3">
                                ${availableConsequenceTypesButtons.map(item => {
                                    const active = this._selectedConsequenceType === item.value;
                                    return html`
                                        <button type="button" class="btn btn-primary ${active ? "active" : ""}" @click="${() => this.updateQuery(item.value)}">
                                            <span>${item.name}</span>
                                        </button>
                                    `;
                                })}
                            </div>
                            <variant-browser-grid
                                .opencgaSession="${opencgaSession}"
                                .active="${active}"
                                .query="${this._query || {}}"
                                .populationFrequencies="${this.populationFrequencies}"
                                .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                .consequenceTypes="${this.consequenceTypes}"
                                .config="${{
                                    showToolbar: false,
                                }}">
                            </variant-browser-grid>
                        `,
                    },
                    {
                        id: "proteinLollipop",
                        name: "Protein (Beta)",
                        render: (gene, active, opencgaSession) => html`
                            <div style="margin-bottom:48px;">
                                <protein-lollipop
                                    .opencgaSession="${opencgaSession}"
                                    .geneId="${gene?.id}"
                                    .tracks="${proteinLollipopTracks}"
                                    .active="${active}">
                                </protein-lollipop>
                            </div>
                        `,
                    },
                ],
            },
        };
    }

}

customElements.define("opencga-gene-view", OpencgaGeneView);

