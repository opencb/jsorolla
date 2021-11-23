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
import "../../sample/sample-files-view.js";
import UtilsNew from "../../../core/utilsNew.js";

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
            opencgaSession: {
                type: Object,
            },
            sampleId: {
                type: String,
            },
            config: {
                type: Object,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._ascatMetrics = null;
        this._ascatImages = [];
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        super.update(changedProperties);
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            this.opencgaSession.opencgaClient.files().search({
                format: "VCF",
                sampleIds: this.sampleId,
                softwareName: "ascat",
                study: this.opencgaSession.study.fqn,
            }).then(response => {
                const file = response.responses[0].results[0];
                this._ascatMetrics = file.qualityControl.variant.ascatMetrics;
                this._ascatMetrics.file = file.name;
                const images = file.qualityControl.variant.ascatMetrics.images.join(",");
                return this.opencgaSession.opencgaClient.files().info(images, {
                    study: this.opencgaSession.study.fqn,
                });
            }).then(response => {
                this._ascatImages = response.responses[0].results;
                this.requestUpdate();
            }).catch(error => {
                console.error(error);
            });
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
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    // title: "ASCAT Stats",
                    collapsed: false,
                    elements: [
                        {
                            name: "ASCAT Stats",
                            field: "ascat",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "ASCAT File",
                                        type: "custom",
                                        display: {
                                            render: data => html` <div>
                                                <span
                                                    style="font-weight: bold"
                                                    >${data.file}</span>
                                            </div>`,
                                        },
                                    },
                                    {
                                        name: "ASCAT Aberrant Fraction",
                                        type: "custom",
                                        display: {
                                            render: data => html` <div>
                                                ${data.aberrantCellFraction}
                                            </div>`,
                                        },
                                    },
                                    {
                                        name: "ASCAT Ploidy",
                                        type: "custom",
                                        display: {
                                            render: data => html` <div>
                                                ${data.ploidy}
                                            </div>`,
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

    render() {
        // Check if project exists
        if (!this.opencgaSession?.project) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        // Check if sampleId and ascat metrics exist
        if (!this._ascatMetrics) {
            return html``;
        }

        // Display ASCAT stats
        return html`
            <div class="container" style="margin: 20px 10px">
                <h3>ASCAT Metrics</h3>
                <data-form
                    .config="${this._config}"
                    .data="${{ascat: [this._ascatMetrics]}}">
                </data-form>
                ${this._ascatImages?.length > 0 ? html`
                    <h3>ASCAT QC Plots</h3>
                    ${this._ascatImages.map(image => html`
                        <h5 style="font-weight:bold;">
                            ${image.name}
                        </h5>
                        <file-preview
                            .active="${true}"
                            .file=${image}
                            .opencgaSession=${this.opencgaSession}>
                        </file-preview>
                    `)}
                ` : null}
            </div>
        `;
    }

}

customElements.define("file-qc-ascat-metrics", FileQcAscatMetrics);
