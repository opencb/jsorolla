/*
 * Copyright 2015-present OpenCB
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

import "../file-preview.js";
import "../../commons/forms/data-form.js";

export default class FileQcAscatMetrics extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            ascatMetrics: {
                type: Object,
            },
            file: {
                type: Object,
            },
            sampleId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            }
        };
    }

    _init() {
        this.ascatMetrics = null;
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("file")) {
            this.fileObserver();
        }
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        super.update(changedProperties);
    }

    fileObserver() {
        this.ascatMetrics = this.file.qualityControl.variant.ascatMetrics;
        this.ascatMetrics.file = this.file.name;
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            this.opencgaSession.opencgaClient.files().search({
                format: "VCF",
                sampleIds: this.sampleId,
                softwareName: "ascat",
                study: this.opencgaSession.study.fqn,
            }).then(response => {
                this.file = response.responses[0].results[0];
            }).catch(error => {
                console.error(error);
            });
        }
    }

    render() {
        if (!this.ascatMetrics) {
            return html`<div>No Ascat metrics provided.</div>`;
        }

        // Display ASCAT Stats and Plots
        return html`
            <div class="container" style="margin: 20px 10px">
                <h3>ASCAT Metrics</h3>
                <data-form
                    .config="${this.config}"
                    .data="${{ascat: [this.ascatMetrics]}}">
                </data-form>

                ${this.ascatMetrics?.files?.length > 0 ? html`
                    <h3>ASCAT QC Plots</h3>
                    <file-preview
                        .fileIds=${this.ascatMetrics.files}
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${{showFileSize: false}}">
                    </file-preview>
                ` : null
                }
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "-",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    // title: "ASCAT Stats",
                    collapsed: false,
                    elements: [
                        {
                            title: "ASCAT Stats",
                            field: "ascat",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        title: "ASCAT File",
                                        type: "custom",
                                        display: {
                                            render: data => html`<span style="font-weight:bold">${data.file || ""}</span>`,
                                        },
                                    },
                                    {
                                        title: "ASCAT Aberrant Fraction",
                                        type: "custom",
                                        display: {
                                            render: data => html`${data.aberrantCellFraction}`,
                                        },
                                    },
                                    {
                                        title: "ASCAT Ploidy",
                                        type: "custom",
                                        display: {
                                            render: data => html`${data.ploidy}`,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("file-qc-ascat-metrics", FileQcAscatMetrics);
