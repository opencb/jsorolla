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
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/view/signature-view.js";
import "../../commons/forms/data-form.js";
import "../../commons/simple-chart.js";

class MutationalSignatureView extends LitElement {

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
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            signature: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }

        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }

        if (changedProperties.has("sample")) {
            this.getSignaturesFromSample();
        }

        if (changedProperties.has("signature")) {
            this.signatureObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.sample = response.getResult(0);
                    this.getSignaturesFromSample();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    signatureObserver() {
        this._signature = this.signature;
        this.signatureSelector = false;
        this.requestUpdate();
    }

    getSignaturesFromSample() {
        // TODO temp fix to support both Opencga 2.0.3 and Opencga 2.1.0-rc
        if (this.sample?.qualityControl?.variantMetrics) {
            this._variantStatsPath = "variantMetrics";
        } else if (this.sample?.qualityControl?.variant) {
            this._variantStatsPath = "variant";
        } else {
            console.error("unexpected QC data model");
        }

        this.signatureSelect = this.sample?.qualityControl?.[this._variantStatsPath]?.signatures.map(signature => signature.id) ?? [];
        if (this.sample.qualityControl?.[this._variantStatsPath]?.signatures?.length) {
            // By default we render the stat 'ALL' from the first metric, if there is not stat 'ALL' then we take the first one
            const selectedSignature = this.sample.qualityControl?.[this._variantStatsPath].signatures.find(signature => signature.id === "ALL") ?? this.sample.qualityControl?.[this._variantStatsPath].signatures[0];
            this.signatureSelected = selectedSignature.id;
            this._signature = selectedSignature;
        } else {
            // Check if sample variant stats has been indexed in annotationSets
            const annotationSet = this.sample?.annotationSets?.find(annotSet => annotSet.id.toLowerCase() === "opencga_sample_variant_stats");
            this._signature = annotationSet?.annotations;
        }

        this.signatureSelector = true;
        this.requestUpdate();
    }

    signatureChange(e) {
        this._signature = this.sample.qualityControl?.[this._variantStatsPath].signatures.find(stat => stat.id === e.detail.value);
        this.requestUpdate();
    }

    render() {
        if (!this._signature?.id) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i> No Signature found.
                </div>
            `;
        }

        return html`
            ${this.signatureSelector ? html`
                <div style="margin: 20px 10px">
                    <div class="form-horizontal">
                        <div class="form-group">
                            <label class="col-md-2">Select Signature</label>
                            <div class="col-md-2">
                                <select-field-filter
                                    forceSelection
                                    .data="${this.signatureSelect}"
                                    .value=${this.signatureSelected}
                                    @filterChange="${this.signatureChange}">
                                </select-field-filter>
                            </div>
                        </div>
                    </div>
                </div>
            ` : null}
            <div>
                <data-form
                    .data=${this._signature}
                    .config="${this._config}">
                </data-form>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                // showTitle: false,
                labelWidth: 3,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "Summary",
                    elements: [
                        {
                            name: "ID",
                            field: "id",
                            display: {
                                style: "font-weight: bold",
                            }
                        },
                        {
                            name: "Variant Type",
                            field: "type"
                        },
                        {
                            name: "Signature Query Filters",
                            field: "query",
                            type: "custom",
                            display: {
                                render: query => {
                                    if (query && !UtilsNew.isEmpty(query)) {
                                        return Object.entries(query).map((k, v) => html`
                                            <span class="badge">${k}: ${v}</span>
                                        `);
                                    } else {
                                        return "none";
                                    }
                                },
                            },
                        },
                    ]
                }, {
                    title: "Genomic Context",
                    display: {
                        visible: signature => signature?.counts?.length > 0
                    },
                    elements: [
                        {
                            name: "",
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: () => html`
                                    <signature-view
                                        .signature="${this._signature}">
                                    </signature-view>
                                `,
                            },
                        },
                    ]
                }, {
                    title: "Genomic Context",
                    display: {
                        visible: signature => signature?.counts?.length === 0
                    },
                    elements: [
                        {
                            name: "Warning",
                            type: "custom",
                            display: {
                                render: () => html`<span>No variants found</span>`
                            }
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("mutational-signature-view", MutationalSignatureView);
