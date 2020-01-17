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
import "./variant/opencga-variant-grid.js";
import "./variant/variant-protein-view.js";

export default class OpencgaGeneView extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            gene: {
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
            config: {
                type: Object
            },
            summary: {
                type: Boolean
            },
            project: {
                type: Object
            },
            study: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "geneView" + Utils.randomString(6) + "_";
        this.variant = "";
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("gene")) {
            this.geneChanged();
        }
        if (changedProperties.has("project") || changedProperties.has("study")) {
            this.projectStudyObtained();
        }
    }

    projectStudyObtained(project, study) {
        if (UtilsNew.isNotUndefined(this.opencgaSession.project) && UtilsNew.isNotEmpty(this.opencgaSession.project.alias) &&
            UtilsNew.isNotUndefined(this.opencgaSession.study) && UtilsNew.isNotEmpty(this.opencgaSession.study.alias)) {
            this.hashFragmentCredentials = {
                project: this.opencgaSession.project.alias,
                study: this.opencgaSession.study.alias
            };
        }
    }

    geneChanged(neo, old) {
        if (UtilsNew.isNotEmpty(this.gene)) {
            this.query = {
                gene: this.gene,
                study: this.opencgaSession.study.fqn
            };
            const _this = this;
            this.cellbaseClient.getGeneClient(this.gene, "info", {exclude: "annotation"}, {})
                .then(function(response) {
                    _this.geneObj = response.response[0].result[0];
                    _this.requestUpdate();
                });
        }
    }

    updateQuery(e) {
        PolymerUtils.removeClass(".gene-ct-buttons", "active");
        PolymerUtils.addClass(e.target.id, "active");
        const query = this.query;
        switch (e.target.innerText) {
        case "Missense":
            query["ct"] = "missense_variant";
            break;
        case "LoF":
            query["ct"] = this.consequenceTypes.lof.join(",");
            break;
        default:
            if (UtilsNew.isNotUndefined(query["ct"])) {
                delete query["ct"];
            }
            break;
        }
        this.query = Object.assign({}, query);
    }

    checkVariant(variant) {
        return variant.split(":").length > 2;
    }

    showBrowser() {
        const hash = window.location.hash.split("/");
        const newHash = "#browser/" + hash[1] + "/" + hash[2];
        window.location.hash = newHash;
    }

    onSelectVariant(e) {
        this.variant = e.detail.id;
    }

    render() {
        return this.geneObj ? html`
        <style include="jso-styles">
            .gene-variant-tab-title {
                font-size: 150%;
                font-weight: bold;
            }

            .gene-summary-title {
                font-weight: bold;
            }
        </style>

        <div>
            <div style="float: right;padding: 10px 5px 10px 5px">
                <button type="button" class="btn btn-primary" @click="${this.showBrowser}">
                    <i class="fa fa-hand-o-left" aria-hidden="true"></i> Variant Browser
                </button>
            </div>

            <h2>${this.geneObj.name}</h2>

            <div class="row" style="padding: 5px 0px 25px 0px">
                <div class="col-md-4">
                    <h3>Summary</h3>
                    <table width="100%">
                        <tr>
                            <td class="gene-summary-title" width="20%">Name</td>
                            <td width="80%">${this.geneObj.name} (${this.geneObj.id})</td>
                        </tr>
                        <tr>
                            <td class="gene-summary-title" width="20%">Biotype</td>
                            <td width="80%">${this.geneObj.biotype}</td>
                        </tr>
                        <tr>
                            <td class="gene-summary-title" width="20%">Description</td>
                            <td width="80%">${this.geneObj.description}</td>
                        </tr>
                        <tr>
                            <td class="gene-summary-title">Location</td>
                            <td>${this.geneObj.chromosome}:${this.geneObj.start}-${this.geneObj.end} (${this.geneObj.strand})</td>
                        </tr>
                        <tr>
                            <td class="gene-summary-title">Genome Browser</td>
                            <td>
                                <a target="_blank"
                                   href="http://genomemaps.org/?region=${this.geneObj.chromosome}:${this.geneObj.start}-${this.geneObj.end}">
                                    ${this.geneObj.chromosome}:${this.geneObj.start}-${this.geneObj.end}
                                </a>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="col-md-8">
                    <h3>Transcripts</h3>
                    <table class="table table-bordered" width="100%">
                        <thead style="background-color: #eeeeee">
                        <tr>
                            <th>Name</th>
                            <th>Ensembl ID</th>
                            <th>Biotype</th>
                            <th>Location</th>
                            <th>Coding</th>
                            <!--<th>cDNA</th>-->
                            <!--<th>CDS Length</th>-->
                            <th>Flags</th>
                        </tr>
                        </thead>
                        <tbody>
                        ${this.geneObj.transcripts && this.geneObj.transcripts.length ? this.geneObj.transcripts.map( transcript => html`
                            <tr>
                                <td>${transcript.name}</td>
                                <td>
                                    <a href="#transcript/${this.project.alias}/${this.study.alias}/${transcript.id}">${transcript.id}</a>
                                </td>
                                <td>${transcript.biotype}</td>
                                <td>
                                    <a target="_blank"
                                       href="http://genomemaps.org/?region=${transcript.chromosome}:${transcript.start}-${transcript.end}">
                                        ${transcript.chromosome}:${transcript.start}-${transcript.end}
                                    </a>
                                </td>
                                <td>
                                    <a target="_blank"
                                       href="http://genomemaps.org/?region=${transcript.chromosome}:${transcript.genomicCodingStart}-${transcript.genomicCodingEnd}">
                                        ${transcript.genomicCodingStart}-${transcript.genomicCodingEnd}
                                    </a>
                                </td>
                                <!--<td>-->
                                <!--${transcript.cdnaCodingStart}-${transcript.cdnaCodingEnd}-->
                                <!--</td>-->
                                <!--<td>${transcript.cdsLength}</td>-->
                                <td>${transcript.annotationFlags}</td>
                            </tr>
                        `) : null }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active">
                <a href="#${this._prefix}Variants" role="tab" data-toggle="tab" class="gene-variant-tab-title">Variants</a>
            </li>
            <li role="presentation">
                <a href="#${this._prefix}Protein" role="tab" data-toggle="tab" class="gene-variant-tab-title">Protein (Beta)</a>
            </li>
        </ul>

        <div class="tab-content" style="height: 1024px">
            <div role="tabpanel" class="tab-pane active" id="${this._prefix}Variants">
                <div class="btn-group btn-group" role="group" aria-label="..." style="padding: 15px;float: right">
                    <button id="${this._prefix}AllConsTypeButton" type="button" class="btn btn-default btn-warning gene-ct-buttons active" @click="${this.updateQuery}">
                        All
                    </button>
                    <button id="${this._prefix}MissenseConsTypeButton" type="button" class="btn btn-default btn-warning gene-ct-buttons" @click="${this.updateQuery}">
                        Missense
                    </button>
                    <button id="${this._prefix}LoFConsTypeButton" type="button" class="btn btn-default btn-warning gene-ct-buttons" @click="${this.updateQuery}">
                        LoF
                    </button>
                </div>

                <!--<br>-->
                <br>
                <opencga-variant-grid .opencgaSession="${this.opencgaSession}"
                                      .query="${this.query}"
                                      .populationFrequencies="${this.populationFrequencies}"
                                      .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                      .consequenceTypes="${this.consequenceTypes}"
                                      .summary="${this.summary}"
                                      .config="${this.config}"
                                      style="font-size: 12px"
                                      @selectvariant="${this.onSelectVariant}">
                </opencga-variant-grid>

                ${this.checkVariant(this.variant) ? html`
                    <!-- Bottom tabs with specific variant information -->
                    <div style="padding-top: 20px; height: 400px">
                        <h3>Advanced Annotation for Variant: ${this.variant}</h3>
                        <cellbase-variantannotation-view _prefix="${this._prefix}"
                                                         .data="${this.variant}"
                                                         .cellbaseClient="${this.cellbaseClient}"
                                                         .assembly=${this.opencgaSession.project.organism.assembly}
                                                         .hashFragmentCredentials="${this.hashFragmentCredentials}"
                                                         .populationFrequencies="${this.populationFrequencies}"
                                                         .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                         .consequenceTypes="${this.consequenceTypes}"
                                                         style="font-size: 12px">
                        </cellbase-variantannotation-view>
                    </div>
                ` : html`
                    <div>
                        <br>
                        <h3>Please select a variant to view the detailed annotation</h3>
                    </div>
                `}
                

                
            </div>

            <div role="tabpanel" class="tab-pane" id="${this._prefix}Protein">
                <variant-protein-view .opencgaSession="${this.opencgaSession}"
                                      .opencgaClient="${this.opencgaClient}"
                                      .cellbaseClient="${this.cellbaseClient}"
                                      .gene="${this.gene}"
                                      .config="${this.config.protein}"
                                      .summary="${this.summary}">
                </variant-protein-view>
            </div>
        </div>
        ` : null;
    }

}

customElements.define("opencga-gene-view", OpencgaGeneView);

