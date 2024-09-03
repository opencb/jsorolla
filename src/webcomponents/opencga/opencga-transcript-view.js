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
import PolymerUtils from "../PolymerUtils.js";
import "../variant/variant-browser-grid.js";
import "../variant/variant-protein-view.js";
import {RestResponse} from "../../core/clients/rest-response";
import NotificationUtils from "../commons/utils/notification-utils";

export default class OpencgaTranscriptView extends LitElement {

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
            /* project: {
                type: Object
            },
            study: {
                type: Object
            },*/
            transcript: {
                type: String
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
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "transcript" + UtilsNew.randomString(6);
        this.variantId = "";
        this.transcriptObj = {};
        this.query = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("transcript")) {
            this.transcriptChanged();
        }

        // if (changedProperties.has("settings")) {
        // }
        /* if(changedProperties.has("project") || changedProperties.has("study")) {
            this.projectStudyObtained();
        }*/
    }

    /* projectStudyObtained(project, study) {
        if (UtilsNew.isNotUndefined(this.opencgaSession.project) && UtilsNew.isNotEmpty(this.opencgaSession.project.alias) &&
            UtilsNew.isNotUndefined(this.opencgaSession.study) && UtilsNew.isNotEmpty(this.opencgaSession.study.alias)) {
            this.hashFragmentCredentials = {
                project: this.opencgaSession.project.alias,
                study: this.opencgaSession.study.alias
            };
        }
    }*/

    transcriptChanged() {
        // Remove the previously added SVG
        const svg = PolymerUtils.querySelector("svg");
        if (svg !== null) {
            const proteinSvgDiv = PolymerUtils.getElementById(this._prefix + "TranscriptSvg");
            if (UtilsNew.isNotUndefinedOrNull(proteinSvgDiv)) {
                // proteinSvgDiv.removeChild(svg);
            }
        }

        if (UtilsNew.isNotEmpty(this.transcript)) {
            this.query = {
                "annot-xref": this.transcript
            };
            this.requestUpdate();
            this.cellbaseClient.getTranscriptClient(this.transcript, "info", {exclude: "xrefs, exons.sequence"}, {})
                .then(restResponse => {
                    this.transcriptObj = restResponse.getResult(0);
                    this.requestUpdate();
                    // FIXME We need to improve how the transcript is rendered
                    // let svg = _this._createSvgTranscript(_this.transcriptObj);
                    // let querySelector = PolymerUtils.getElementById(_this._prefix + "TranscriptSvg");
                    // querySelector.appendChild(svg);
                }).catch(e => {
                    if (e instanceof RestResponse || e instanceof Error) {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
                    } else {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, {
                            value: "Generic Error: " + JSON.stringify(e)
                        });
                    }
                }).finally(async () => {
                    this.requestUpdate();
                });

        }
    }

    updateQuery(e) {
        PolymerUtils.removeClass(".transcript-ct-buttons", "active");
        PolymerUtils.addClass(e.target.id, "active");
        const query = this.query;
        switch (e.target.dataset.value) {
            case "missense":
                query.ct = "missense_variant";
                break;
            case "lof":
                query.ct = this.consequenceTypes.lof.join(",");
                break;
            default:
                delete query.ct;
                break;
        }
        this.query = {...query};
        this.requestUpdate();
    }

    checkVariant(variant) {
        return variant?.split(":").length > 2;
    }

    showBrowser() {
        this.notifySearch({xref: this.geneId});
        const hash = window.location.hash.split("/");
        const newHash = "#browser/" + hash[1] + "/" + hash[2];
        window.location.hash = newHash;
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query
            }
        }));
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.requestUpdate();
    }

    render() {
        return html`
        <div>
            <div style="float: right;padding: 10px 5px 10px 5px">
                <button type="button" class="btn btn-primary" @click="${this.showBrowser}">
                    <i class="fa fa-hand-o-left" aria-hidden="true"></i> Variant Browser
                </button>
            </div>

            <h2>${this.transcriptObj.name}</h2>

            <div class="row" style="padding: 5px 0px 25px 0px">
                <div class="col-md-5">
                    <h3>Summary</h3>
                    <table width="100%">
                        <tr>
                            <td class="transcript-summary-title" width="20%">Name</td>
                            <td width="80%">${this.transcriptObj.name} (${this.transcriptObj.id})</td>
                        </tr>
                        <tr>
                            <td class="transcript-summary-title" width="20%">Biotype</td>
                            <td width="80%">${this.transcriptObj.biotype}</td>
                        </tr>
                        <tr>
                            <td class="transcript-summary-title">Location</td>
                            <td>${this.transcriptObj.chromosome}:${this.transcriptObj.start}-${this.transcriptObj.end}
                                (${this.transcriptObj.strand})
                            </td>
                        </tr>
                        <tr>
                            <td class="transcript-summary-title">Gene</td>
                            <td><a href="#gene/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${this.gene}">${this.gene}</a></td>
                        </tr>
                        ${this.settings.externalLinks ? html`
                        <tr>
                            <td class="transcript-summary-title">Genome Browser</td>
                            <td>
                                <a target="_blank" href=${`http://genomemaps.org/?region=${this.transcriptObj.chromosome}:${this.transcriptObj.start}-${this.transcriptObj.end}`}>
                                    ${this.transcriptObj.chromosome}:${this.transcriptObj.start}-${this.transcriptObj.end}
                                </a>
                            </td>
                        </tr>` : null}
                    </table>
                </div>

            </div>
        </div>

        <div id="${this._prefix}TranscriptSvg"></div>

        <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
            <li role="presentation" class="nav-item">
                <a class="nav-link active" href="#${this._prefix}Variants" role="tab" data-bs-toggle="tab" data-bs-target="#${this._prefix}Variants">
                    Variants
                </a>
            </li>
            <li role="presentation" class="nav-item">
                <a class="nav-link" href="#${this._prefix}Protein" role="tab" data-bs-toggle="tab" data-bs-target="#${this._prefix}Protein">
                    Protein
                </a>
            </li>
        </ul>

        <div class="tab-content mt-3" style="height: 1024px">
            <div role="tabpanel" class="tab-pane active" id="${this._prefix}Variants">
                <div class="btn-group pad15" role="group">
                    <button id="${this._prefix}AllConsTypeButton" type="button" class="btn btn-primary gene-ct-buttons active" data-value="${"all"}" @click="${this.updateQuery}">
                        All
                    </button>
                    <button id="${this._prefix}MissenseConsTypeButton" type="button" class="btn btn-primary gene-ct-buttons" data-value="${"missense"}" @click="${this.updateQuery}">
                        Missense
                    </button>
                    <button id="${this._prefix}LoFConsTypeButton" type="button" class="btn btn-primary gene-ct-buttons" data-value="${"lof"}" @click="${this.updateQuery}">
                        LoF
                    </button>
                </div>
                <br>
                <br>

                <variant-browser-grid
                    .opencgaSession="${this.opencgaSession}"
                    .query="${this.query}"
                    .populationFrequencies="${this.populationFrequencies}"
                    .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                    .consequenceTypes="${this.consequenceTypes}"
                    .config="${this.config}"
                    @selectrow="${this.onSelectVariant}">
                </variant-browser-grid>

                ${this.checkVariant(this.variantId) ? html`
                    <!-- Bottom tabs with specific variant information -->
                        <opencga-variant-detail-view
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .variantId="${this.variantId}"
                            .config="${this._config?.filter?.detail}">
                        </opencga-variant-detail-view>
                        <!--
                        <h3 class="break-word">Advanced Annotation for Variant: \${this.variantId}</h3>
                        <cellbase-variantannotation-view
                            .data="\${this.variantId}"
                            .cellbaseClient="\${this.cellbaseClient}"
                            .assembly=\${this.opencgaSession.project.organism.assembly}
                            .hashFragmentCredentials="\${this.hashFragmentCredentials}"
                            .populationFrequencies="\${this.populationFrequencies}"
                            .proteinSubstitutionScores="\${this.proteinSubstitutionScores}"
                            .consequenceTypes="\${this.consequenceTypes}">
                        </cellbase-variantannotation-view> -->
                    </div>
                ` : null}
            </div>

            ${false ? html`
                <div role="tabpanel" class="tab-pane" id="${this._prefix}Protein">
                    <variant-protein-view
                        .opencgaClient="${this.opencgaClient}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .project="${this.project}"
                        .study="${this.study}"
                        .ids="${this.transcriptObj.id}"
                        .config="${this.config.protein}">
                    </variant-protein-view>
                </div>
            ` : null}
        </div>
        `;
    }

}

customElements.define("opencga-transcript-view", OpencgaTranscriptView);
