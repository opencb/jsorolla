/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "../../../core/utilsNew.js";
import "../../commons/forms/data-form.js";

class VariantInterpreterQcSummary extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            const somaticSample = this.clinicalAnalysis.proband?.samples.find(s => s.somatic);
            const germlineSample = this.clinicalAnalysis.proband?.samples.find(s => !s.somatic);
            if (somaticSample) {
                const bamFile = [...somaticSample.fileIds.filter(f => f.endsWith(".bam"))];
                if (bamFile.length) {
                    if (germlineSample) {
                        const germlineBamFile = germlineSample.fileIds.filter(f => f.endsWith(".bam"));
                        bamFile.push(...germlineBamFile);
                    }

                    this.opencgaSession.opencgaClient.files().info(bamFile.join(","), {study: this.opencgaSession.study.fqn})
                        .then(response => {
                            const annotationSet = response.responses[0].results[0].annotationSets.find(annotSet => annotSet.variableSetId === "bamQcStats");
                            annotationSet.annotations.file = bamFile[0];
                            if (germlineSample) {
                                const germlineAnnotationSet = response.responses[0].results[1].annotationSets.find(annotSet => annotSet.variableSetId === "bamQcStats");
                                germlineAnnotationSet.annotations.file = bamFile[1];
                                this.clinicalAnalysis.annotations = [annotationSet.annotations, germlineAnnotationSet.annotations];
                            } else {
                                this.clinicalAnalysis.annotations = [annotationSet.annotations];
                            }
                            // this.clinicalAnalysis.annotations = annotationSet?.annotations;
                            this._config = {...this.getDefaultConfig(), ...this.config};
                            this.requestUpdate();
                        })
                        .catch(response => {
                            console.error("An error occurred fetching clinicalAnalysis: ", response);
                        });

                    // const vcfFiles = [somaticSample.fileIds.find(f => f.endsWith(".vcf.gz"))];
                    // this.opencgaSession.opencgaClient.files().info(vcfFiles.join(","), {study: this.opencgaSession.study.fqn})
                    //     .then(response => {
                    //         this.clinicalAnalysis.ascat = [response.responses[0].results[0].attributes];
                    //         this.clinicalAnalysis.ascat[0].file = vcfFiles[0];
                    //         this._config = {...this.getDefaultConfig(), ...this.config};
                    //         this.requestUpdate();
                    //     })
                    //     .catch(response => {
                    //         console.error("An error occurred fetching clinicalAnalysis: ", response);
                    //     });
                }
            }
        }
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "",
                    collapsed: false,
                    elements: [
                        {
                            name: "Case ID",
                            field: "id"
                        },
                        {
                            name: "Proband",
                            field: "proband.id",
                            type: "custom",
                            display: {
                                render: probandId => html`<strong>${probandId}</strong>`
                            }
                        },
                        {
                            name: "Disorder",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => {
                                    if (disorder) {
                                        let id;
                                        if (disorder.id?.startsWith("OMIM:")) {
                                            id = html`<a href="https://omim.org/entry/${disorder.id.split(":")[1]}" target="_blank">${disorder.id}</a>`;
                                        }
                                        return html`${disorder.name || "-"} (${id})`;
                                    } else {
                                        return "-";
                                    }

                                }
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type"
                        }
                    ]
                },
                {
                    title: "BAM QC Stats",
                    collapsed: false,
                    display: {
                        visible: this.clinicalAnalysis?.annotations ?? false
                    },
                    elements: [
                        {
                            name: "BAM Stats",
                            field: "annotations",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "BAM File",
                                        type: "custom",
                                        display: {
                                            render: data => html`
                                                <div><span style="font-weight: bold">${data.file}</span></div>`
                                        }
                                    },
                                    {
                                        name: "SD insert size",
                                        type: "custom",
                                        display: {
                                            render: data => html`
                                                <div>${data.sdInsertSize}</div>`
                                        }
                                    },
                                    {
                                        name: "Average insert size",
                                        type: "custom",
                                        display: {
                                            render: data => html`
                                                <div>${data.avgInsertSize}</div>`
                                        }
                                    },
                                    {
                                        name: "Duplicate read rate",
                                        type: "custom",
                                        display: {
                                            render: data => html`
                                                <div>${data.duplicateReadRate}</div>`
                                        }
                                    },
                                    {
                                        name: "Average sequence depth",
                                        type: "custom",
                                        display: {
                                            render: data => html`
                                                <div>${data.avgSequenceDepth}</div>`
                                        }
                                    }
                                ]
                            }
                        },
                        // {
                        //     name: "ASCAT Stats",
                        //     field: "ascat",
                        //     type: "table",
                        //     display: {
                        //         columns: [
                        //             {
                        //                 name: "ASCAT File",
                        //                 type: "custom",
                        //                 display: {
                        //                     render: data => html`
                        //                         <div><span style="font-weight: bold">${data.file}</span></div>`
                        //                 }
                        //             },
                        //             {
                        //                 name: "ASCAT Aberrant Fraction",
                        //                 type: "custom",
                        //                 display: {
                        //                     render: data => html`
                        //                         <div>${data.ascatAberrantCellFraction}</div>`
                        //                 }
                        //             },
                        //             {
                        //                 name: "ASCAT Ploidy",
                        //                 type: "custom",
                        //                 display: {
                        //                     render: data => html`
                        //                         <div>${data.ascatPloidy}</div>`
                        //                 }
                        //             }
                        //         ]
                        //     }
                        // }
                    ]
                }
            ]
        };
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                </div>`;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No Case found</h3>
                </div>`;
        }

        // Alignment stats are the same for FAMILY and CANCER analysis
        return html`
            <div class="container" style="margin: 20px 10px">
                <data-form .data=${this.clinicalAnalysis} .config="${this._config}"></data-form>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-summary", VariantInterpreterQcSummary);
