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
import UtilsNew from "../../core/utils-new.js";
import "../commons/view/detail-tabs.js";
import "../variant/variant-browser-grid.js";
import "../variant/variant-protein-view.js";
import "../variant/variant-browser-detail.js";
import "../visualization/protein-lollipop.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils";
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
            summary: {
                type: Boolean
            },
            settings: {
                type: Object
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.variantId = "";
        this.gene = null;
        this.query = {};
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("geneId")) {
            this.geneIdObserver();
        }

        if (changedProperties.has("settings")) {
            this.config = {
                ...this.getDefaultConfig(),
                ...this.settings,
            };
        }

        super.update(changedProperties);
    }

    geneIdObserver() {
        if (this.opencgaSession && this.geneId) {
            this.query = {
                gene: this.geneId,
                study: this.opencgaSession.study.fqn,
            };
            this.cellbaseClient.getGeneClient(this.geneId, "info", {
                exclude: "annotation",
                assembly: this.opencgaSession.project.organism.assembly,
            })
                .then(response => {
                    this.gene = response.getResult(0);
                })
                .catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                })
                .finally(async () => {
                    this.requestUpdate();
                    await this.updateComplete;
                    UtilsNew.initTooltip(this);
                });
        }
    }

    updateQuery(e) {
        // Set the actuve tab to the clicked tab
        Array.from(e.target.parentNode.querySelectorAll("button")).forEach(element => {
            element.classList.remove("active");
            if (element.dataset.value === e.target.dataset.value) {
                element.classList.add("active");
            }
        });
        const query = this.query || {};
        switch (e.target.dataset.value) {
            case "missense":
                query.ct = "missense_variant";
                break;
            case "lof":
                query.ct = this.consequenceTypes.alias
                    .find(alias => alias.name === "Loss-of-Function (LoF)")
                    .terms.join(",");
                break;
            default:
                delete query.ct;
                break;
        }
        this.query = {
            ...query,
        };
        // Terrible hack to force detail-tabs to update tabs content
        this.gene = {
            ...this.gene,
        };
        this.requestUpdate();
    }

    checkVariant(variant) {
        return variant?.split(":").length > 2;
    }

    showBrowser() {
        this.notifySearch({
            xref: this.geneId,
        });
        const hash = window.location.hash.split("/");
        const newHash = "#browser/" + hash[1] + "/" + hash[2];
        window.location.hash = newHash;
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", null, {
            query: query,
        });
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.requestUpdate();
    }

    transcriptTooltip(transcript) {
        const transcriptUrl = `#transcript/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${transcript.id}`;
        const ensemblUrl = BioinfoUtils.getEnsemblLink(this.gene.name, "TRANSCRIPT", this.opencgaSession.project.organism.assembly);

        return `
            <div style='padding: 5px'>
                <a href="${transcriptUrl}">Transcript View</a>
            </div>
            <div style='padding: 5px'>
                <a target='_blank' href='${ensemblUrl}'>Ensembl</a>
            </div>
        `;
    }

    getGenomeMapsUrl(feature) {
        return `http://genomemaps.org/?region=${feature.chromosome}:${feature.start}-${feature.end}`;
    }

    render() {
        if (!this.geneId || !this.opencgaSession) {
            return html`
                <div class="container-fluid" style="margin-top:32px;">
                    <div class="row">
                        <div class="col-md-10 offset-md-1">
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-triangle icon-padding"></i> No gene provided.
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (!this.gene) {
            return "";
        }

        return html`
            <tool-header
                .title="${`Gene <span class="inverse">${this.gene.name}</span>`}"
                .icon="${this.config?.icon}"
                .rhs="${html`
                    <button type="button" class="btn btn-light" @click="${() => this.showBrowser()}">
                        <i class="fas fa-dna icon-padding"></i> Variant Browser
                    </button>
                `}">
            </tool-header>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-10 offset-md-1">
                        <div class="row" style="padding: 5px 0px 25px 0px">
                            <div class="col-md-4">
                                <h3 class="section-title">Summary</h3>
                                <table class="table row">
                                    <tr>
                                        <th class="gene-summary-title col-sm-4">Name</th>
                                        <td>${this.gene.name} (${this.gene.id})</td>
                                    </tr>
                                    <tr>
                                        <th class="gene-summary-title col-sm-4">Biotype</th>
                                        <td>${this.gene.biotype}</td>
                                    </tr>
                                    <tr>
                                        <th class="gene-summary-title col-sm-4">Description</th>
                                        <td>${this.gene.description}</td>
                                    </tr>
                                    <tr>
                                        <th class="gene-summary-title col-sm-4">Location</th>
                                        <td>${this.gene.chromosome}:${this.gene.start}-${this.gene.end} (${this.gene.strand})</td>
                                    </tr>
                                    ${this.config.externalLinks ? html`
                                        <tr>
                                            <th class="gene-summary-title col-sm-4">Genome Browser</th>
                                            <td>
                                                <a target="_blank" href="${this.getGenomeMapsUrl(this.gene)}">
                                                    ${this.gene.chromosome}:${this.gene.start}-${this.gene.end}
                                                </a>
                                            </td>
                                        </tr>
                                    ` : ""}
                                </table>
                            </div>

                            <div class="col-md-8">
                                <h3 class="section-title">Transcripts</h3>
                                <table class="table table-bordered" width="100%">
                                    <thead style="background-color: #eeeeee">
                                    <tr>
                                        <th>Ensembl ID</th>
                                        <th>Name</th>
                                        <th>Location</th>
                                        <th>Biotype</th>
                                        <!--<th>Coding</th>-->
                                        <!--<th>cDNA</th>-->
                                        <!--<th>CDS Length</th>-->
                                        <th>Flags</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    ${(this.gene.transcripts && this.gene.transcripts.length) ? this.gene.transcripts.map(transcript => html`
                                        <tr>
                                            <td>
                                                <a tooltip-title="Transcript" tooltip-text='${this.transcriptTooltip(transcript)}'>
                                                    ${transcript.id}
                                                </a>
                                            </td>
                                            <td>${transcript.name}</td>
                                            <td>
                                                ${this.config.externalLinks ? html`
                                                    <a target="_blank" href="${this.getGenomeMapsUrl(transcript)}">
                                                        ${transcript.chromosome}:${transcript.start}-${transcript.end}
                                                    </a>
                                                ` : html`
                                                    <span>${transcript.chromosome}:${transcript.start}-${transcript.end}</span>
                                                `}
                                            </td>
                                            <td>${transcript.biotype}</td>

                                            <!--\${transcript.cdnaCodingStart}-\${transcript.cdnaCodingEnd}-->
                                            <!--</td>-->
                                            <!--<td>\${transcript.cdsLength}</td>-->
                                            <td>${transcript.annotationFlags?.join(", ")}</td>
                                        </tr>
                                    `) : null }
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <detail-tabs
                            .opencgaSession="${this.opencgaSession}"
                            .data="${this.gene}"
                            .config="${this.config.tabs}">
                        </detail-tabs>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
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
                            <div class="btn-group" role="group" style="padding-top:16px;">
                                <button type="button" class="btn btn-primary active" data-value="all" @click="${e => this.updateQuery(e)}">
                                    All
                                </button>
                                <button type="button" class="btn btn-primary" data-value="missense" @click="${e => this.updateQuery(e)}">
                                    Missense
                                </button>
                                <button type="button" class="btn btn-primary" data-value="lof" @click="${e => this.updateQuery(e)}">
                                    LoF
                                </button>
                            </div>
                            <br>
                            <variant-browser-grid
                                .opencgaSession="${opencgaSession}"
                                .query="${this.query}"
                                .populationFrequencies="${this.populationFrequencies}"
                                .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                .consequenceTypes="${this.consequenceTypes}"
                                .summary="${this.summary}"
                                .config="${this.config}"
                                @selectrow="${this.onSelectVariant}">
                            </variant-browser-grid>
                            ${this.checkVariant(this.variantId) ? html`
                                <!-- Bottom tabs with specific variant information -->
                                    <opencga-variant-detail-view
                                        .opencgaSession="${opencgaSession}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .variantId="${this.variantId}"
                                        .config="${this.config?.filter?.detail}">
                                    </opencga-variant-detail-view>
                                    <!--
                                    <h3 class="break-word">Advanced Annotation for Variant: \${this.variantId}</h3>
                                    <cellbase-variantannotation-view
                                        .data="\${this.variantId}"
                                        .cellbaseClient="$\{this.cellbaseClient}"
                                        .assembly=\${this.opencgaSession.project.organism.assembly}
                                        .hashFragmentCredentials="\${this.hashFragmentCredentials}"
                                        .populationFrequencies="\${this.populationFrequencies}"
                                        .proteinSubstitutionScores="\${this.proteinSubstitutionScores}"
                                        .consequenceTypes="\${this.consequenceTypes}">
                                    </cellbase-variantannotation-view> -->
                            ` : ""}
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

