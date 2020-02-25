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
import Utils from "./../../utils.js";
import UtilsNew from "../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "../variant/opencga-variant-grid.js";
import "../variant/variant-protein-view.js";


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
            cellbaseClient: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            project: {
                type: Object
            },
            study: {
                type: Object
            },
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
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "transcript" + Utils.randomString(6);
        this.variant = "";
        this.transcriptObj = {};
    }

    updated(changedProperties) {
        if(changedProperties.has("transcript")) {
            this.transcriptChanged();
        }
        if(changedProperties.has("project") || changedProperties.has("study")) {
            this.projectStudyObtained();
        }
    }

    projectStudyObtained(project, study) {
        if (UtilsNew.isNotUndefined(this.project) && UtilsNew.isNotEmpty(this.project.alias)
            && UtilsNew.isNotUndefined(this.study) && UtilsNew.isNotEmpty(this.study.alias)) {
            this.hashFragmentCredentials = {
                project: this.project.alias,
                study: this.study.alias
            }
        }
    }

    transcriptChanged() {
        // Remove the previously added SVG
        let svg = PolymerUtils.querySelector("svg");
        if (svg !== null) {
            let proteinSvgDiv = PolymerUtils.getElementById(this._prefix + "TranscriptSvg");
            if (UtilsNew.isNotUndefinedOrNull(proteinSvgDiv)) {
                // proteinSvgDiv.removeChild(svg);
            }
        }

        let query = {};
        let _this = this;
        if (UtilsNew.isNotEmpty(this.transcript)) {
            query["annot-xref"] = this.transcript;
            this.cellbaseClient.getTranscriptClient(this.transcript, 'info', {exclude: "xrefs, exons.sequence"}, {})
                .then(function (response) {
                    _this.transcriptObj = response.response[0].result[0];
                    // FIXME We need to improve how the transcript is rendered
                    // let svg = _this._createSvgTranscript(_this.transcriptObj);
                    // let querySelector = PolymerUtils.getElementById(_this._prefix + "TranscriptSvg");
                    // querySelector.appendChild(svg);
                });
            _this.query = query;
        }
    }

    updateQuery(e) {
        PolymerUtils.removeClass(".transcript-ct-buttons", "active");
        PolymerUtils.addClass(e.target.id, "active");
        let query = this.query;
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
        return variant.split(':').length > 2;
    }

    showBrowser() {
        let hash = window.location.hash.split('/');
        let newHash = '#browser/' + hash[1] + '/' + hash[2];
        window.location.hash = newHash;
    }

    onSelectVariant(e) {
        this.variant = e.detail.id;
    }

    _createSvgTranscript(transcriptObject) {
        let length = transcriptObject.end - transcriptObject.start;
        let svg = SVG.create('svg', {
            width: length + 40,
            height: 140,
            viewBox: "0 0 " + (length + 40) + " " + 140,
            style: "fill: white"
        });
        SVG.addChild(svg, 'rect', {width: length + 40, height: 140, style: "fill: white;stroke: black"});

        let center = (140) / 2;
        SVG.addChild(svg, 'line', {
            x1: 20,
            y1: center,
            x2: length,
            y2: center,
            style: "stroke: red"
        });

        let exons = transcriptObject.exons;
        let gExons = SVG.create('g', {});
        for (let i = 0; i < exons.length; i++) {
            let exon = SVG.addChild(gExons, 'rect', {
                x: 20 + (exons[i].start - transcriptObject.start),
                y: center - 7,
                rx: 2,
                ry: 2,
                width: exons[i].end - exons[i].start,
                height: 15,
                style: "fill: lightblue"
            });
            $(exon).qtip({
                content: {
                    title: exons[i].id,
                    text: "<b>ID</b>: " + exons[i].id + "<br>"
                        + "<b>Chromosome</b>: " + exons[i].chromosome + "<br>"
                        + "<b>Start</b>: " + exons[i].start + "<br>"
                        + "<b>End</b>: " + exons[i].end + "<br>"
                        + "<b>Strand</b>: " + exons[i].strand
                },
                position: {viewport: $(window), target: "mouse", adjust: {x: 25, y: 15}},
                style: {width: true, classes: ' ui-tooltip ui-tooltip-shadow'},
                show: {delay: 250},
                hide: {delay: 200}
            })
        }
        svg.appendChild(gExons);

        let lollipop = new Lollipop();
        let ruleSVG = lollipop._createSvgRuleBar(length, {ratio: 1});
        svg.appendChild(ruleSVG);

        return svg;
    }

    render() {
        return html`
        <style include="jso-styles">
            .transcript-variant-tab-title {
                font-size: 150%;
                font-weight: bold;
            }

            .transcript-summary-title {
                font-weight: bold;
            }
        </style>

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
                            <td><a href="#gene/${this.project.alias}/${this.study.alias}/${this.gene}">${this.gene}</a></td>
                        </tr>
                        <tr>
                            <td class="transcript-summary-title">Genome Browser</td>
                            <td>
                                <a target="_blank"
                                   href="http://genomemaps.org/?region=${this.transcriptObj.chromosome}:${this.transcriptObj.start}-${this.transcriptObj.end}">
                                    ${this.transcriptObj.chromosome}:${this.transcriptObj.start}-${this.transcriptObj.end}
                                </a>
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
        </div>

        <div id="${this._prefix}TranscriptSvg"></div>

        <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active">
                <a href="#${this._prefix}Variants" role="tab" data-toggle="tab" class="transcript-variant-tab-title">
                    Variants
                </a>
            </li>
            <li role="presentation">
                <a href="#${this._prefix}Protein" role="tab" data-toggle="tab" class="transcript-variant-tab-title">
                    Protein
                </a>
            </li>
        </ul>

        <div class="tab-content" style="height: 1024px">
            <div role="tabpanel" class="tab-pane active" id="${this._prefix}Variants">
                <div class="btn-group btn-group" role="group" aria-label="..." style="padding: 15px;float: right">
                    <button id="${this._prefix}AllConsTypeButton" type="button" class="btn btn-default btn-warning transcript-ct-buttons active" @click="${this.updateQuery}">
                        All
                    </button>
                    <button id="${this._prefix}MissenseConsTypeButton" type="button" class="btn btn-default btn-warning transcript-ct-buttons" @click="${this.updateQuery}">
                        Missense
                    </button>
                    <button id="${this._prefix}LoFConsTypeButton" type="button" class="btn btn-default btn-warning transcript-ct-buttons" @click="${this.updateQuery}">
                        LoF
                    </button>
                </div>

                <br>
                <br>
                <variant-browser-grid _prefix="${this._prefix}" 
                                      .project="${this.project}"
                                      .study="${this.study}"
                                      .opencga-client="${this.opencgaClient}"
                                      .population-frequencies="${this.populationFrequencies}"
                                      .protein-substitution-scores="${this.proteinSubstitutionScores}"
                                      .consequence-types="${this.consequenceTypes}"
                                      .search="${this.query}"
                                      .query="${this.query}"
                                      .variant="${this.variant}"
                                      style="font-size: 12px"
                                      @selectvariant="${this.onSelectVariant}">
                </variant-browser-grid>

                ${this.checkVariant(this.variant) ? html`
                    <!-- Bottom tabs with specific variant information -->
                    <div style="padding-top: 20px; height: 400px">
                        <h3>Advanced Annotation for Variant: ${this.variant}</h3>
                        <cellbase-variantannotation-view _prefix="${this._prefix}" 
                                                        .data="${this.variant}"
                                                        .cellbaseClient="${this.cellbaseClient}"
                                                        .assembly=${this.project.organism.assembly}
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
                    <h3>Please select a variant to view variant's detailed annotation</h3>
                </div>
                `}
            </div>

            <div role="tabpanel" class="tab-pane" id="${this._prefix}Protein">
                <variant-protein-view .opencgaClient="${this.opencgaClient}"
                                      .cellbaseClient="${this.cellbaseClient}"
                                      .project="${this.project}"
                                      .study="${this.study}"
                                      .ids="${this.transcriptObj.id}"
                                      .config="${this.config.protein}">
                </variant-protein-view>
            </div>
        </div>
        `;
    }
}

customElements.define("opencga-transcript-view", OpencgaTranscriptView);
