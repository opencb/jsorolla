/*
 * Copyright 2015-2024 OpenCB
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
        this.#init();
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

    #init() {
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
        this.ascatMetrics = {
            ...this.file.qualityControl.variant.ascatMetrics,
            file: this.file?.name || "-",
        };
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            const searchParams = {
                format: "VCF",
                sampleIds: this.sampleId,
                softwareName: "ascat",
                study: this.opencgaSession.study.fqn,
            };
            this.opencgaSession.opencgaClient.files()
                .search(searchParams)
                .then(response => {
                    this.file = response.responses[0].results[0];
                })
                .catch(error => console.error(error));
        }
    }

    render() {
        if (!this.ascatMetrics) {
            return html`
                <div>No Ascat metrics provided.</div>
            `;
        }
        return html`
            <div class="container" style="margin: 20px 10px">
                <h3>ASCAT Metrics</h3>
                <data-form
                    .config="${this.config}"
                    .data="${{ascat: [this.ascatMetrics]}}">
                </data-form>
                ${this.ascatMetrics?.files?.length > 0 ? html`
                    <h3>ASCAT QC Plots</h3>
                    <div class="row">
                        <div class="col-md-8">
                            <file-preview
                                .fileIds=${this.ascatMetrics.files}
                                .active="${true}"
                                .opencgaSession="${this.opencgaSession}"
                                .config="${{showFileSize: false}}">
                            </file-preview>
                        </div>
                    </div>
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
                                        field: "file",
                                    },
                                    {
                                        title: "ASCAT Aberrant Fraction",
                                        field: "aberrantCellFraction",
                                    },
                                    {
                                        title: "ASCAT Ploidy",
                                        field: "ploidy",
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
