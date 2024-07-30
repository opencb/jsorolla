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
                type: Object,
            },
            signatures: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.data = {};
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("signatures")) {
            this.data = {};
            this.config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onFieldChange(e) {
        this.data = {
            id: e.detail.value,
            signature: this.signatures.find(signature => signature.id === e.detail.value) || null,
        };
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    renderQuery(query) {
        return Object.keys(query || {}).map(key => html`
            <span class="badge text-bg-primary">
                ${key}: ${query[key]}
            </span>
        `);
    }

    render() {
        if (!this.signatures || this.signatures.length === 0) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i> No Signatures available.
                </div>
            `;
        }

        return html`
            <data-form
                .data=${this.data}
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            // title: "Mutational Signature",
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Select Signature",
                            field: "id",
                            type: "select",
                            allowedValues: UtilsNew.sort((this.signatures || []).map(s => s.id)),
                        },
                    ],
                },
                {
                    title: "Catalogue",
                    display: {
                        visible: data => !!data.signature,
                    },
                    elements: [
                        {
                            name: "Catalogue Query",
                            field: "signature.query",
                            type: "custom",
                            display: {
                                render: query => this.renderQuery(query),
                            },
                        },
                        {
                            title: "Catalogue Plot",
                            field: "signature",
                            type: "custom",
                            display: {
                                render: signature => html`
                                    <signature-view
                                        .signature="${signature}"
                                        .plots="${["counts"]}"
                                        .mode="${(signature.type || "").toUpperCase() === "SV" ? "SV" : "SBS"}"
                                        ?active="${true}">
                                    </signature-view>
                                `,
                            },
                        },
                    ]
                },
                {
                    title: "Fittings",
                    display: {
                        visible: data => !!data.signature,
                    },
                    elements: [
                        {
                            type: "notification",
                            text: "No fittings data to display.",
                            field: "signature.fittings",
                            display: {
                                visible: fittings => (fittings || []).length === 0,
                            },
                        },
                    ],
                },
                ...(this.data.signature?.fittings || []).map(fitting => ({
                    display: {
                        style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                    },
                    elements: [
                        {
                            name: "ID",
                            type: "custom",
                            display: {
                                render: () => html`<b>${fitting.id}</b>`,
                            },
                        },
                        {
                            name: "Signature Source",
                            type: "text",
                            text: fitting.signatureSource,
                        },
                        {
                            name: "Signature Version",
                            type: "text",
                            text: fitting.signatureVersion,
                        },
                        {
                            name: "Method",
                            type: "text",
                            text: fitting.method,
                        },
                        {
                            name: "Params",
                            type: "custom",
                            display: {
                                render: () => this.renderQuery(fitting.params),
                            },
                        },
                        {
                            name: "Plot",
                            type: "custom",
                            field: "signature",
                            display: {
                                render: signature => html`
                                    <signature-view
                                        .signature="${signature}"
                                        .plots="${["fitting"]}"
                                        .fittingId="${fitting.id}"
                                        ?active="${true}">
                                    </signature-view>
                                `,
                            },
                        },
                    ],
                })),
            ]
        };
    }

}

customElements.define("mutational-signature-view", MutationalSignatureView);
